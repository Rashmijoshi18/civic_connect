const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, getUserStats,
  getMyProblems, getMySolutions, getOrgDashboard,
} = require('../controllers/usersController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { body } = require('express-validator');

const profileValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
];

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', profileValidation, updateProfile);
router.get('/stats', getUserStats);
router.get('/my-problems', getMyProblems);
router.get('/my-solutions', getMySolutions);
router.get('/org/dashboard', authorize('ORGANIZATION', 'ADMIN'), getOrgDashboard);

module.exports = router;
