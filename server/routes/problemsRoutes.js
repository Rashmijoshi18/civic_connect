const express = require('express');
const router = express.Router();
const {
  createProblem, getProblems, getProblem,
  updateProblem, deleteProblem, problemValidation,
} = require('../controllers/problemsController');
const { createSolution, getSolutions, solutionValidation } = require('../controllers/solutionsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { upload } = require('../middleware/upload');

// Public (or optional auth for vote-status)
router.get('/', (req, res, next) => {
  // Optionally attach user if token present, but don't require it
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authenticate(req, res, () => getProblems(req, res, next));
  }
  return getProblems(req, res, next);
});

router.get('/:id', getProblem);

// Protected
router.post('/', authenticate, authorize('USER', 'ORGANIZATION', 'ADMIN'), upload.single('image'), problemValidation, createProblem);
router.put('/:id', authenticate, upload.single('image'), updateProblem);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProblem);

// Solutions sub-routes
router.get('/:id/solutions', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) return authenticate(req, res, () => getSolutions(req, res, next));
  return getSolutions(req, res, next);
});

router.post('/:id/solutions', authenticate, authorize('USER', 'ORGANIZATION', 'ADMIN'), upload.single('attachment'), solutionValidation, createSolution);

module.exports = router;
