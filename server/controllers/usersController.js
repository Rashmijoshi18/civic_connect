const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

/**
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, createdAt: true,
        _count: { select: { reportedProblems: true, solutions: true } },
      },
    });
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json({ success: true, message: 'Profile updated.', data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/stats
 */
const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      totalReported,
      pendingProblems,
      verifiedProblems,
      inProgressProblems,
      resolvedProblems,
      totalSolutions,
      totalVotesReceived,
    ] = await Promise.all([
      prisma.problem.count({ where: { reporterId: userId } }),
      prisma.problem.count({ where: { reporterId: userId, status: 'PENDING' } }),
      prisma.problem.count({ where: { reporterId: userId, status: 'VERIFIED' } }),
      prisma.problem.count({ where: { reporterId: userId, status: 'IN_PROGRESS' } }),
      prisma.problem.count({ where: { reporterId: userId, status: 'RESOLVED' } }),
      prisma.solution.count({ where: { contributorId: userId } }),
      prisma.solutionVote.count({ where: { solution: { contributorId: userId } } }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalReported, pendingProblems, verifiedProblems,
          inProgressProblems, resolvedProblems,
          totalSolutions, totalVotesReceived,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/my-problems
 */
const getMyProblems = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where: { reporterId: req.user.id },
        skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { solutions: true } } },
      }),
      prisma.problem.count({ where: { reporterId: req.user.id } }),
    ]);

    res.json({
      success: true,
      data: { problems, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/my-solutions
 */
const getMySolutions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [solutions, total] = await Promise.all([
      prisma.solution.findMany({
        where: { contributorId: req.user.id },
        skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          problem: { select: { id: true, title: true, status: true, category: true } },
          _count: { select: { votes: true } },
        },
      }),
      prisma.solution.count({ where: { contributorId: req.user.id } }),
    ]);

    res.json({
      success: true,
      data: { solutions, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/org/dashboard
 * Organization-specific dashboard stats
 */
const getOrgDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [totalSolutions, approvedSolutions, pendingSolutions, rejectedSolutions] = await Promise.all([
      prisma.solution.count({ where: { contributorId: userId } }),
      prisma.solution.count({ where: { contributorId: userId, status: 'APPROVED' } }),
      prisma.solution.count({ where: { contributorId: userId, status: 'PENDING' } }),
      prisma.solution.count({ where: { contributorId: userId, status: 'REJECTED' } }),
    ]);

    const solutions = await prisma.solution.findMany({
      where: { contributorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        problem: { select: { id: true, title: true, status: true, category: true } },
        _count: { select: { votes: true } },
      },
    });

    res.json({
      success: true,
      data: {
        stats: { totalSolutions, approvedSolutions, pendingSolutions, rejectedSolutions },
        recentSolutions: solutions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile, updateProfile, getUserStats,
  getMyProblems, getMySolutions, getOrgDashboard,
};
