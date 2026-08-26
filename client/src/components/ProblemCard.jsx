import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { StatusBadge, SeverityBadge, PriorityBadge } from './Badges';
import { CATEGORY_LABELS, formatRelativeTime } from '../utils/helpers';

const ProblemCard = ({ problem }) => {
  const { id, title, category, location, city, status, severity, priorityScore, priorityLevel, reportCount, createdAt, _count } = problem;

  return (
    <Link to={`/problems/${id}`} className="card block group cursor-pointer hover:border-primary-500/30">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">
              {CATEGORY_LABELS[category] || category}
            </span>
            <h3 className="mt-2 font-semibold text-title text-sm leading-snug group-hover:text-primary-400 transition-colors line-clamp-2">
              {title}
            </h3>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-dark-300 mb-3">
          <MapPin size={13} className="text-dark-400 flex-shrink-0" />
          <span className="truncate">{location}, {city}</span>
        </div>

        {/* Badges row */}
        <div className="flex items-center flex-wrap gap-1.5 mb-3">
          <SeverityBadge severity={severity} />
          <PriorityBadge score={priorityScore} level={priorityLevel} />
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-3 border-t border-dark-700 text-xs text-dark-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users size={12} /> {reportCount} reports
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={12} /> {_count?.solutions || 0} proposals
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {formatRelativeTime(createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProblemCard;
