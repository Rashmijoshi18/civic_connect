const prisma = require('../utils/prisma');
const { body, validationResult } = require('express-validator');
const { calculatePriority } = require('../utils/priority');
const path = require('path');

// ─── Validation ───────────────────────────────────────────────────────────────

const problemValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required.').isLength({ min: 20, max: 2000 }),
  body('category').isIn(['ROADS','WASTE_MANAGEMENT','WATER','ELECTRICITY','EDUCATION','PUBLIC_SAFETY','ENVIRONMENT','OTHER']).withMessage('Invalid category.'),
  body('location').trim().notEmpty().withMessage('Location is required.'),
  body('city').trim().notEmpty().withMessage('City is required.'),
  body('severity').isIn(['LOW','MEDIUM','HIGH','CRITICAL']).withMessage('Invalid severity.'),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Standard problem select fields for list views
const problemSelect = {
  id: true, title: true, category: true, location: true, city: true,
  severity: true, priorityScore: true, priorityLevel: true, status: true,
  imageUrl: true, reportCount: true, affectedUsers: true,
  createdAt: true, updatedAt: true,
  reporter: { select: { id: true, name: true } },
  _count: { select: { solutions: true } },
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/problems
 * Create a new problem report
 */
const createProblem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, category, location, city, severity } = req.body;
    const imageUrl = req.file
      ? (req.file.path || req.file.secure_url || req.file.url || `/uploads/${req.file.filename}`)
      : null;

    // Calculate initial priority score
    const { score, level } = calculatePriority({ severity, reportCount: 1, proposalCount: 0, affectedUsers: 1 });

    const problem = await prisma.problem.create({
      data: {
        title, description, category, location, city, severity,
        imageUrl, priorityScore: score, priorityLevel: level,
        reporterId: req.user.id,
        status: 'PENDING',
      },
      include: {
        reporter: { select: { id: true, name: true } },
      },
    });

    // Record status history
    await prisma.problemStatusHistory.create({
      data: { problemId: problem.id, status: 'PENDING', changedById: req.user.id, note: 'Problem reported' },
    });

    res.status(201).json({
      success: true,
      message: 'Problem submitted successfully. It will appear publicly after verification.',
      data: { problem },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/problems
 * Get all verified (and above) problems with search/filter/pagination
 */
const getProblems = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12,
      search, category, status, severity, priority,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter conditions
    const where = {};

    // Only show verified+ problems to public; admin sees all
    if (!req.user || req.user.role !== 'ADMIN') {
      where.status = { notIn: ['PENDING', 'REJECTED'] };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (priority) where.priorityLevel = priority;

    // Sorting
    let orderBy = {};
    if (sortBy === 'priority') orderBy = { priorityScore: 'desc' };
    else if (sortBy === 'solutions') orderBy = { solutions: { _count: 'desc' } };
    else orderBy = { [sortBy]: sortOrder };

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where, skip, take: parseInt(limit),
        orderBy, select: problemSelect,
      }),
      prisma.problem.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        problems,
        pagination: {
          total, page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/problems/:id
 * Get single problem with full details
 */
const getProblem = async (req, res, next) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: req.params.id },
      include: {
        reporter: { select: { id: true, name: true, role: true } },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: { changedBy: { select: { id: true, name: true } } },
        },
        _count: { select: { solutions: true } },
      },
    });

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }

    res.json({ success: true, data: { problem } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/problems/:id
 * Update problem (owner can update their own PENDING problems)
 */
const updateProblem = async (req, res, next) => {
  try {
    const existing = await prisma.problem.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Problem not found.' });

    // Only owner can edit, and only if PENDING
    if (existing.reporterId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { title, description, location, city, severity } = req.body;
    const imageUrl = req.file
      ? (req.file.path || req.file.secure_url || req.file.url || `/uploads/${req.file.filename}`)
      : existing.imageUrl;

    // Recalculate priority if severity changed
    const newSeverity = severity || existing.severity;
    const solutionCount = await prisma.solution.count({ where: { problemId: existing.id } });
    const { score, level } = calculatePriority({
      severity: newSeverity,
      reportCount: existing.reportCount,
      proposalCount: solutionCount,
      affectedUsers: existing.affectedUsers,
    });

    const problem = await prisma.problem.update({
      where: { id: req.params.id },
      data: {
        title: title || existing.title,
        description: description || existing.description,
        location: location || existing.location,
        city: city || existing.city,
        severity: newSeverity,
        imageUrl,
        priorityScore: score,
        priorityLevel: level,
      },
    });

    res.json({ success: true, message: 'Problem updated.', data: { problem } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/problems/:id (Admin only)
 */
const deleteProblem = async (req, res, next) => {
  try {
    await prisma.problem.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Problem deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProblem, getProblems, getProblem, updateProblem, deleteProblem, problemValidation };
