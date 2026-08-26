import { STATUS_LABELS, STATUS_CLASSES, SEVERITY_LABELS, SEVERITY_CLASSES, SOLUTION_STATUS_CLASSES } from '../utils/helpers';

export const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_CLASSES[status] || 'badge-pending'}`}>
    {STATUS_LABELS[status] || status}
  </span>
);

export const SeverityBadge = ({ severity }) => (
  <span className={`badge ${SEVERITY_CLASSES[severity] || 'badge-low'}`}>
    {SEVERITY_LABELS[severity] || severity}
  </span>
);

export const SolutionStatusBadge = ({ status }) => (
  <span className={`badge ${SOLUTION_STATUS_CLASSES[status] || 'badge-pending'}`}>
    {status?.charAt(0) + status?.slice(1).toLowerCase()}
  </span>
);

export const PriorityBadge = ({ score, level }) => {
  const colorMap = {
    LOW: 'text-dark-300 bg-dark-600',
    MEDIUM: 'text-yellow-400 bg-yellow-500/15',
    HIGH: 'text-orange-400 bg-orange-500/15',
    CRITICAL: 'text-red-400 bg-red-500/15',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colorMap[level] || colorMap.LOW}`}>
      {score !== undefined && <span className="font-bold">{Math.round(score)}</span>}
      {level}
    </span>
  );
};
