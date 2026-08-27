const prisma = require('../utils/prisma');
const { calculatePriority } = require('../utils/priority');

/**
 * GET /api/admin/dashboard
 * Aggregate statistics for the admin dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers, totalOrgs, totalProblems,
      pendingProblems, verifiedProblems, inProgressProblems,
      resolvedProblems, rejectedProblems, totalSolutions,
      problemsByCategory, problemsByStatus, recentProblems,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'ORGANIZATION' } }),
      prisma.problem.count(),
      prisma.problem.count({ where: { status: 'PENDING' } }),
      prisma.problem.count({ where: { status: 'VERIFIED' } }),
      prisma.problem.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.problem.count({ where: { status: 'RESOLVED' } }),
      prisma.problem.count({ where: { status: 'REJECTED' } }),
      prisma.solution.count(),
      // Problems grouped by category
      prisma.problem.groupBy({ by: ['category'], _count: { id: true } }),
      // Problems grouped by status
      prisma.problem.groupBy({ by: ['status'], _count: { id: true } }),
      // Recent problems
      prisma.problem.findMany({
        take: 8, orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, category: true, status: true,
          severity: true, priorityScore: true, createdAt: true,
          reporter: { select: { name: true } },
        },
      }),
    ]);

    // Problems created per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const problemsOverTime = await prisma.problem.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month
    const monthlyData = {};
    problemsOverTime.forEach(p => {
      const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = (monthlyData[key] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers, totalOrgs, totalProblems,
          pendingProblems, verifiedProblems, inProgressProblems,
          resolvedProblems, rejectedProblems, totalSolutions,
          resolutionRate: totalProblems > 0 ? Math.round((resolvedProblems / totalProblems) * 100) : 0,
        },
        problemsByCategory: problemsByCategory.map(p => ({ category: p.category, count: p._count.id })),
        problemsByStatus: problemsByStatus.map(p => ({ status: p.status, count: p._count.id })),
        problemsOverTime: Object.entries(monthlyData).map(([month, count]) => ({ month, count })),
        recentProblems,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, role: true,
          isActive: true, createdAt: true,
          _count: { select: { reportedProblems: true, solutions: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: { users, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id/status
 * Activate or deactivate a user account
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const userId = req.params.id;

    // Prevent admin from deactivating themselves
    if (userId === req.user.id && isActive === false) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, name: true, isActive: true },
    });

    res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}.`, data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/problems/:id/verify
 * Verify or reject a pending problem
 */
const verifyProblem = async (req, res, next) => {
  try {
    const { action, note } = req.body; // action: 'verify' | 'reject'
    const newStatus = action === 'verify' ? 'VERIFIED' : 'REJECTED';

    const problem = await prisma.problem.update({
      where: { id: req.params.id },
      data: { status: newStatus },
    });

    await prisma.problemStatusHistory.create({
      data: { problemId: problem.id, status: newStatus, changedById: req.user.id, note: note || `Problem ${newStatus.toLowerCase()}` },
    });

    res.json({ success: true, message: `Problem ${newStatus.toLowerCase()}.`, data: { problem } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/problems/:id/status
 * Change problem status (IN_PROGRESS, RESOLVED, etc.)
 */
const updateProblemStatus = async (req, res, next) => {
  try {
    const { status, severity, note } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (severity) {
      updateData.severity = severity;
      // Recalculate priority
      const existing = await prisma.problem.findUnique({ where: { id: req.params.id } });
      const proposalCount = await prisma.solution.count({ where: { problemId: req.params.id } });
      const { score, level } = calculatePriority({
        severity,
        reportCount: existing.reportCount,
        proposalCount,
        affectedUsers: existing.affectedUsers,
      });
      updateData.priorityScore = score;
      updateData.priorityLevel = level;
    }

    const problem = await prisma.problem.update({ where: { id: req.params.id }, data: updateData });

    if (status) {
      await prisma.problemStatusHistory.create({
        data: { problemId: problem.id, status, changedById: req.user.id, note: note || `Status changed to ${status}` },
      });
    }

    res.json({ success: true, message: 'Problem updated.', data: { problem } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/solutions/:id/status
 * Approve or reject a solution
 */
const updateSolutionStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // APPROVED | REJECTED

    const solution = await prisma.solution.update({
      where: { id: req.params.id },
      data: { status },
    });

    // If approving a solution, move problem to IN_PROGRESS if not already
    if (status === 'APPROVED') {
      const problem = await prisma.problem.findUnique({ where: { id: solution.problemId } });
      if (problem && problem.status === 'VERIFIED') {
        await prisma.problem.update({ where: { id: problem.id }, data: { status: 'IN_PROGRESS' } });
        await prisma.problemStatusHistory.create({
          data: { problemId: problem.id, status: 'IN_PROGRESS', changedById: req.user.id, note: 'Solution approved — work in progress' },
        });
      }
    }

    res.json({ success: true, message: `Solution ${status.toLowerCase()}.`, data: { solution } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/solutions
 * Get all solutions with pagination
 */
const getAllSolutions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};

    const [solutions, total] = await Promise.all([
      prisma.solution.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          contributor: { select: { id: true, name: true, role: true } },
          problem: { select: { id: true, title: true, status: true } },
          _count: { select: { votes: true } },
        },
      }),
      prisma.solution.count({ where }),
    ]);

    res.json({
      success: true,
      data: { solutions, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getUsers, updateUserStatus, verifyProblem, updateProblemStatus, updateSolutionStatus, getAllSolutions };
