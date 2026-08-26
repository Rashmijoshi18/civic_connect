import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Lightbulb, ThumbsUp, TrendingUp, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { usersAPI } from '../services/api';
import { StatusBadge, SeverityBadge } from '../components/Badges';
import { StatCardSkeleton } from '../components/Skeletons';
import EmptyState from '../components/EmptyState';
import Sidebar from '../components/Sidebar';
import { formatRelativeTime, CATEGORY_LABELS, getErrorMessage } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card card-body">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-dark-300">{label}</p>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={17} />
      </div>
    </div>
    <p className="text-2xl font-bold text-title">{value ?? '—'}</p>
    {sub && <p className="text-xs text-dark-400 mt-0.5">{sub}</p>}
  </div>
);

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          usersAPI.getStats(),
          usersAPI.getMyProblems({ limit: 5 }),
        ]);
        setStats(sRes.data.data.stats);
        setProblems(pRes.data.data.problems);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 bg-dark-950 py-8 px-4 lg:px-8">
        {/* Header */}
        <div className="mb-7">
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here's what's happening with your contributions.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="Problems Reported" value={stats?.totalReported} icon={MapPin} color="bg-blue-500/15 text-blue-400" sub="Total submissions" />
              <StatCard label="Verified" value={stats?.verifiedProblems} icon={CheckCircle} color="bg-indigo-500/15 text-indigo-400" sub="Publicly visible" />
              <StatCard label="In Progress" value={stats?.inProgressProblems} icon={Clock} color="bg-purple-500/15 text-purple-400" sub="Being resolved" />
              <StatCard label="Resolved" value={stats?.resolvedProblems} icon={CheckCircle} color="bg-emerald-500/15 text-emerald-400" sub="Successfully fixed" />
            </>
          )}
        </div>

        {/* Contributions */}
        {!loading && (
          <div className="grid sm:grid-cols-3 gap-4 mb-7">
            <div className="card card-body flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/15 text-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lightbulb size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-title">{stats?.totalSolutions ?? 0}</p>
                <p className="text-sm text-dark-300">Solutions Submitted</p>
              </div>
            </div>
            <div className="card card-body flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-500/15 text-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <ThumbsUp size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-title">{stats?.totalVotesReceived ?? 0}</p>
                <p className="text-sm text-dark-300">Votes Received</p>
              </div>
            </div>
            <div className="card card-body flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-500/15 text-teal-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-title">{stats?.resolvedProblems ?? 0}</p>
                <p className="text-sm text-dark-300">Problems Helped Resolve</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Problems */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700">
            <h2 className="font-semibold text-title">My Recent Problems</h2>
            <Link to="/my-problems" className="text-sm text-primary-400 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="skeleton h-4 flex-1" />
                  <div className="skeleton h-4 w-20" />
                  <div className="skeleton h-4 w-16" />
                </div>
              ))}
            </div>
          ) : problems.length === 0 ? (
            <EmptyState icon="empty" title="No problems reported yet"
              description="Start by reporting a community issue."
              action={<Link to="/report-problem" className="btn-primary btn-sm">Report a Problem</Link>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700">
                    {['Problem', 'Category', 'Status', 'Severity', 'Reported'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-dark-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/50">
                  {problems.map(p => (
                    <tr key={p.id} className="hover:bg-dark-800/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link to={`/problems/${p.id}`} className="font-medium text-title hover:text-primary-400 line-clamp-1 max-w-xs">
                          {p.title}
                        </Link>
                        <p className="text-xs text-dark-400 mt-0.5">{p.city}</p>
                      </td>
                      <td className="px-5 py-3.5 text-dark-300">{CATEGORY_LABELS[p.category]}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3.5"><SeverityBadge severity={p.severity} /></td>
                      <td className="px-5 py-3.5 text-dark-400 whitespace-nowrap">{formatRelativeTime(p.createdAt)}</td>
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

export default UserDashboard;
