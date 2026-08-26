import { CheckCircle, Clock, AlertCircle, XCircle, Zap } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const STEPS = [
  { status: 'PENDING',     label: 'Reported',    icon: AlertCircle,  desc: 'Problem submitted by citizen' },
  { status: 'VERIFIED',    label: 'Verified',    icon: CheckCircle,  desc: 'Reviewed and verified by admin' },
  { status: 'IN_PROGRESS', label: 'In Progress', icon: Zap,          desc: 'Solution being implemented' },
  { status: 'RESOLVED',    label: 'Resolved',    icon: CheckCircle,  desc: 'Problem fully resolved' },
];

const STATUS_ORDER = { PENDING: 0, VERIFIED: 1, IN_PROGRESS: 2, RESOLVED: 3, REJECTED: -1 };

const ProblemTimeline = ({ status, statusHistory = [] }) => {
  if (status === 'REJECTED') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
        <XCircle className="text-red-400 flex-shrink-0" size={20} />
        <div>
          <p className="text-sm font-semibold text-red-400">Problem Rejected</p>
          <p className="text-xs text-red-400/70">This problem was reviewed and rejected by admin.</p>
        </div>
      </div>
    );
  }

  const currentOrder = STATUS_ORDER[status] ?? 0;

  return (
    <div className="space-y-0">
      {STEPS.map((step, idx) => {
        const stepOrder = STATUS_ORDER[step.status];
        const isCompleted = stepOrder < currentOrder;
        const isActive = stepOrder === currentOrder;
        const isPending = stepOrder > currentOrder;

        // Find the history entry for this status
        const historyEntry = statusHistory?.find(h => h.status === step.status);

        return (
          <div key={step.status} className="flex gap-4">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                isCompleted ? 'bg-emerald-500 text-white' :
                isActive ? 'bg-primary-500 text-white ring-4 ring-primary-500/20' :
                'bg-dark-700 text-dark-400'
              }`}>
                <step.icon size={15} />
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-0.5 flex-1 my-1 min-h-[24px] ${isCompleted ? 'bg-emerald-500/50' : 'bg-dark-700'}`} />
              )}
            </div>

            {/* Content */}
            <div className="pb-6 flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${isActive ? 'text-primary-400' : isCompleted ? 'text-emerald-400' : 'text-dark-500'}`}>
                  {step.label}
                </p>
                {isActive && (
                  <span className="text-xs px-2 py-0.5 bg-primary-500/15 text-primary-400 rounded-full font-medium">Current</span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${isPending ? 'text-dark-500' : 'text-dark-300'}`}>{step.desc}</p>
              {historyEntry && (
                <p className="text-xs text-dark-400 mt-1">{formatDate(historyEntry.createdAt)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProblemTimeline;
