const express = require('express');
const router = express.Router();
const {
  getDashboard, getUsers, updateUserStatus,
  verifyProblem, updateProblemStatus, updateSolutionStatus, getAllSolutions,
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/problems/:id/verify', verifyProblem);
router.put('/problems/:id/status', updateProblemStatus);
router.get('/solutions', getAllSolutions);
router.put('/solutions/:id/status', updateSolutionStatus);

module.exports = router;
