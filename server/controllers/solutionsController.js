const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { calculatePriority } = require('../utils/priority');

const prisma = new PrismaClient();

const solutionValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required.').isLength({ min: 20, max: 2000 }),
  body('expectedImpact').trim().notEmpty().withMessage('Expected impact is required.'),
  body('estimatedCost').optional().trim(),
];

/**
 * POST /api/problems/:id/solutions
 * Submit a solution proposal for a verified problem
 */
const createSolution = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const problem = await prisma.problem.findUnique({ where: { id: req.params.id } });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });

    if (problem.status === 'PENDING' || problem.status === 'REJECTED') {
      return res.status(400).json({ success: false, message: 'Cannot submit solutions for unverified problems.' });
    }

    const { title, description, estimatedCost, expectedImpact } = req.body;
    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const solution = await prisma.solution.create({
      data: {
        title, description, estimatedCost, expectedImpact,
        attachmentUrl, problemId: problem.id,
        contributorId: req.user.id,
      },
      include: {
        contributor: { select: { id: true, name: true, role: true } },
        _count: { select: { votes: true } },
      },
    });

    // Recalculate priority since proposals count changed
    const proposalCount = await prisma.solution.count({ where: { problemId: problem.id } });
    const { score, level } = calculatePriority({
      severity: problem.severity,
      reportCount: problem.reportCount,
      proposalCount,
      affectedUsers: problem.affectedUsers,
    });
    await prisma.problem.update({
      where: { id: problem.id },
      data: { priorityScore: score, priorityLevel: level },
    });

    res.status(201).json({ success: true, message: 'Solution submitted successfully.', data: { solution } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/problems/:id/solutions
 * Get all solutions for a problem
 */
const getSolutions = async (req, res, next) => {
  try {
    const solutions = await prisma.solution.findMany({
      where: { problemId: req.params.id },
      include: {
        contributor: { select: { id: true, name: true, role: true } },
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If user is logged in, check which solutions they've voted on
    let userVotes = [];
    if (req.user) {
      userVotes = await prisma.solutionVote.findMany({
        where: { userId: req.user.id, solutionId: { in: solutions.map(s => s.id) } },
        select: { solutionId: true },
      });
    }

    const votedIds = new Set(userVotes.map(v => v.solutionId));
    const enriched = solutions.map(s => ({ ...s, hasVoted: votedIds.has(s.id) }));

    res.json({ success: true, data: { solutions: enriched } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/solutions/:id/vote
 * Toggle upvote on a solution (prevents duplicate votes)
 */
const voteSolution = async (req, res, next) => {
  try {
    const solution = await prisma.solution.findUnique({ where: { id: req.params.id } });
    if (!solution) return res.status(404).json({ success: false, message: 'Solution not found.' });

    // Check if already voted
    const existing = await prisma.solutionVote.findUnique({
      where: { solutionId_userId: { solutionId: solution.id, userId: req.user.id } },
    });

    if (existing) {
      // Remove vote (toggle off)
      await prisma.solutionVote.delete({ where: { id: existing.id } });
      const count = await prisma.solutionVote.count({ where: { solutionId: solution.id } });
      return res.json({ success: true, message: 'Vote removed.', data: { voted: false, voteCount: count } });
    }

    // Add vote
    await prisma.solutionVote.create({ data: { solutionId: solution.id, userId: req.user.id } });
    const count = await prisma.solutionVote.count({ where: { solutionId: solution.id } });
    res.json({ success: true, message: 'Vote added.', data: { voted: true, voteCount: count } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/solutions/:id
 * Update a solution (contributor only, while PENDING)
 */
const updateSolution = async (req, res, next) => {
  try {
    const solution = await prisma.solution.findUnique({ where: { id: req.params.id } });
    if (!solution) return res.status(404).json({ success: false, message: 'Solution not found.' });

    if (solution.contributorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { title, description, estimatedCost, expectedImpact } = req.body;
    const updated = await prisma.solution.update({
      where: { id: req.params.id },
      data: {
        title: title || solution.title,
        description: description || solution.description,
        estimatedCost: estimatedCost !== undefined ? estimatedCost : solution.estimatedCost,
        expectedImpact: expectedImpact || solution.expectedImpact,
      },
    });

    res.json({ success: true, message: 'Solution updated.', data: { solution: updated } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSolution, getSolutions, voteSolution, updateSolution, solutionValidation };
