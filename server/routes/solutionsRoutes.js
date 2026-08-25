const express = require('express');
const router = express.Router();
const { voteSolution, updateSolution } = require('../controllers/solutionsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.post('/:id/vote', authenticate, authorize('USER', 'ORGANIZATION', 'ADMIN'), voteSolution);
router.put('/:id', authenticate, updateSolution);

module.exports = router;
