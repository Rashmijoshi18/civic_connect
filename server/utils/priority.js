/**
 * Priority Scoring Algorithm
 *
 * Calculates a normalized priority score (0–100) for a problem based on:
 *  - Severity     → base score (LOW=10, MEDIUM=30, HIGH=60, CRITICAL=100)
 *  - Report count → how many citizens reported the same issue (capped contribution)
 *  - Proposals    → community interest (more proposals = higher priority)
 *  - Affected     → number of affected users reported
 *
 * Max possible raw score ≈ 145 → normalized to 100
 */

const SEVERITY_SCORES = {
  LOW: 10,
  MEDIUM: 30,
  HIGH: 60,
  CRITICAL: 100,
};

// Maximum contributions from each bonus factor
const MAX_REPORTS_BONUS = 20;    // cap at 20 points from reports
const MAX_PROPOSALS_BONUS = 15;  // cap at 15 points from proposals
const MAX_AFFECTED_BONUS = 10;   // cap at 10 points from affected users

// Total max raw score for normalization
const MAX_RAW_SCORE = 100 + MAX_REPORTS_BONUS + MAX_PROPOSALS_BONUS + MAX_AFFECTED_BONUS; // 145

/**
 * Calculate priority score and level for a problem.
 * @param {object} params
 * @param {string} params.severity - Severity enum value
 * @param {number} params.reportCount - Number of times the problem was reported
 * @param {number} params.proposalCount - Number of solutions proposed
 * @param {number} params.affectedUsers - Estimated number of affected users
 * @returns {{ score: number, level: string }} Normalized score (0-100) and level label
 */
function calculatePriority({ severity, reportCount = 1, proposalCount = 0, affectedUsers = 1 }) {
  // Base score from severity
  const severityScore = SEVERITY_SCORES[severity] || SEVERITY_SCORES.MEDIUM;

  // Bonus from report count: each report adds 2 points, capped at MAX_REPORTS_BONUS
  const reportsBonus = Math.min(reportCount * 2, MAX_REPORTS_BONUS);

  // Bonus from proposals: each proposal adds 3 points, capped at MAX_PROPOSALS_BONUS
  const proposalsBonus = Math.min(proposalCount * 3, MAX_PROPOSALS_BONUS);

  // Bonus from affected users: each user adds 1 point, capped at MAX_AFFECTED_BONUS
  const affectedBonus = Math.min(affectedUsers * 1, MAX_AFFECTED_BONUS);

  // Sum all components
  const rawScore = severityScore + reportsBonus + proposalsBonus + affectedBonus;

  // Normalize to 0–100
  const normalizedScore = Math.round((rawScore / MAX_RAW_SCORE) * 100);

  // Determine priority level based on normalized score
  let level;
  if (normalizedScore >= 75) {
    level = 'CRITICAL';
  } else if (normalizedScore >= 50) {
    level = 'HIGH';
  } else if (normalizedScore >= 25) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  return { score: normalizedScore, level };
}

module.exports = { calculatePriority };
