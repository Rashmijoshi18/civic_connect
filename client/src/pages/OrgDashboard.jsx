import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { SolutionStatusBadge } from '../components/Badges';
import EmptyState from '../components/EmptyState';
import Sidebar from '../components/Sidebar';
import { StatCardSkeleton } from '../components/Skeletons';
import { Lightbulb, CheckCircle, Clock, XCircle, ThumbsUp } from 'lucide-react';
import { formatRelativeTime, CATEGORY_LABELS } from '../utils/helpers';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="card card-body">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-dark-300">{label}</p>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={17} />
      </div>
    </div>
    <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
  </div>
);

const OrgDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getOrgDashboard()
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 bg-dark-950 py-8 px-4 lg:px-8">
        <div className="mb-7">
          <h1 className="page-title">Organization Dashboard</h1>
          <p className="page-subtitle">Track your solution proposals and community impact.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="Total Proposals" value={data?.stats?.totalSolutions} icon={Lightbulb} color="bg-blue-500/15 text-blue-400" />
              <StatCard label="Approved" value={data?.stats?.approvedSolutions} icon={CheckCircle} color="bg-emerald-500/15 text-emerald-400" />
              <StatCard label="Pending Review" value={data?.stats?.pendingSolutions} icon={Clock} color="bg-amber-500/15 text-amber-400" />
              <StatCard label="Rejected" value={data?.stats?.rejectedSolutions} icon={XCircle} color="bg-red-500/15 text-red-400" />
            </>
          )}
        </div>

        {/* Recent Proposals */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700">
            <h2 className="font-semibold text-white">My Proposals</h2>
            <Link to="/problems" className="text-sm text-primary-400 hover:underline">Browse Problems</Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="skeleton h-4 flex-1" /><div className="skeleton h-4 w-20" />
                </div>
              ))}
            </div>
          ) : !data?.recentSolutions?.length ? (
            <EmptyState icon="solutions" title="No proposals yet"
              description="Browse verified problems and submit your first proposal."
              action={<Link to="/problems" className="btn-primary btn-sm">Find Problems</Link>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700">
                    {['Solution', 'Problem', 'Status', 'Votes', 'Submitted'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-dark-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/50">
                  {data.recentSolutions.map(s => (
                    <tr key={s.id} className="hover:bg-dark-800/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-white line-clamp-1">{s.title}</p>
                        <p className="text-xs text-dark-400 line-clamp-1">{s.expectedImpact}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link to={`/problems/${s.problem?.id}`} className="text-primary-400 hover:underline line-clamp-1 max-w-[160px] block">
                          {s.problem?.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5"><SolutionStatusBadge status={s.status} /></td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1 text-dark-200">
                          <ThumbsUp size={12} className="text-dark-400" /> {s._count?.votes || 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-dark-400 whitespace-nowrap">{formatRelativeTime(s.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrgDashboard;
