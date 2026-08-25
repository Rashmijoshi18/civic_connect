import { useState, useEffect } from 'react';
import { ThumbsUp, User, Calendar, DollarSign, Zap, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { solutionsAPI } from '../services/api';
import { SolutionStatusBadge } from './Badges';
import { formatDate, getErrorMessage, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const SolutionCard = ({ solution, onVoteUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const [voteCount, setVoteCount] = useState(solution._count?.votes || 0);
  const [hasVoted, setHasVoted] = useState(solution.hasVoted || false);
  const [voting, setVoting] = useState(false);

  const handleVote = async () => {
    if (!isAuthenticated) { toast.error('Please login to vote'); return; }
    if (voting) return;
    setVoting(true);
    try {
      const res = await solutionsAPI.vote(solution.id);
      const { voted, voteCount: newCount } = res.data.data;
      setHasVoted(voted);
      setVoteCount(newCount);
      if (onVoteUpdate) onVoteUpdate(solution.id, voted, newCount);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="card card-body animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {getInitials(solution.contributor?.name)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{solution.contributor?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{solution.contributor?.role?.toLowerCase()}</p>
          </div>
        </div>
        <SolutionStatusBadge status={solution.status} />
      </div>

      {/* Title */}
      <h4 className="font-semibold text-gray-900 mb-2">{solution.title}</h4>
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{solution.description}</p>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {solution.estimatedCost && (
          <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
            <DollarSign size={14} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Estimated Cost</p>
              <p className="text-xs font-medium text-gray-700">{solution.estimatedCost}</p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
          <Zap size={14} className="text-emerald-500 mt-0.5" />
          <div>
            <p className="text-xs text-gray-400">Expected Impact</p>
            <p className="text-xs font-medium text-gray-700 line-clamp-2">{solution.expectedImpact}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={12} />{formatDate(solution.createdAt)}
        </span>
        <button
          onClick={handleVote}
          disabled={voting}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            hasVoted
              ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          <ThumbsUp size={13} className={hasVoted ? 'fill-current' : ''} />
          {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
        </button>
      </div>
    </div>
  );
};

export default SolutionCard;
