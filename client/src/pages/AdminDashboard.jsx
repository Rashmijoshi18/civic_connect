import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { adminAPI } from '../services/api';
import { StatusBadge, SeverityBadge } from '../components/Badges';
import { StatCardSkeleton } from '../components/Skeletons';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import {
  Users, Building2, MapPin, Clock, CheckCircle,
  Zap, ThumbsUp, TrendingUp, AlertCircle, Lightbulb
} from 'lucide-react';
import { formatRelativeTime, CATEGORY_LABELS } from '../utils/helpers';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card card-body">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-500">{label}</p>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={17} />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const { stats, problemsByCategory = [], problemsByStatus = [], problemsOverTime = [], recentProblems = [] } = data || {};

  // Format category chart data
  const categoryData = problemsByCategory.map(p => ({
    name: CATEGORY_LABELS[p.category] || p.category,
    value: p.count,
  }));

  const statusData = problemsByStatus.map(p => ({
    name: p.status.replace('_', ' '),
    value: p.count,
  }));

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 bg-gray-50 py-8 px-4 lg:px-8">
        <div className="mb-7">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform-wide analytics and management overview.</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loading ? Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />) : (
            <>
              <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} color="bg-blue-50 text-blue-600" />
              <StatCard label="Organizations" value={stats?.totalOrgs} icon={Building2} color="bg-purple-50 text-purple-600" />
              <StatCard label="Total Problems" value={stats?.totalProblems} icon={MapPin} color="bg-indigo-50 text-indigo-600" />
              <StatCard label="Total Solutions" value={stats?.totalSolutions} icon={Lightbulb} color="bg-amber-50 text-amber-600" />
            </>
          )}
        </div>

        {/* Problem status stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-7">
          {loading ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />) : (
            <>
              <StatCard label="Pending" value={stats?.pendingProblems} icon={Clock} color="bg-amber-50 text-amber-600" sub="Awaiting review" />
              <StatCard label="Verified" value={stats?.verifiedProblems} icon={CheckCircle} color="bg-blue-50 text-blue-600" sub="Live & visible" />
              <StatCard label="In Progress" value={stats?.inProgressProblems} icon={Zap} color="bg-purple-50 text-purple-600" sub="Being resolved" />
              <StatCard label="Resolved" value={stats?.resolvedProblems} icon={CheckCircle} color="bg-green-50 text-green-600" sub="Fixed" />
              <StatCard label="Resolution Rate" value={`${stats?.resolutionRate ?? 0}%`} icon={TrendingUp} color="bg-teal-50 text-teal-600" sub="Success rate" />
            </>
          )}
        </div>

        {/* Charts */}
        {!loading && data && (
          <div className="grid lg:grid-cols-2 gap-5 mb-7">
            {/* Category bar chart */}
            <div className="card card-body">
              <h3 className="text-sm font-semibold text-gray-900 mb-5">Problems by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Problems" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status pie chart */}
            <div className="card card-body">
              <h3 className="text-sm font-semibold text-gray-900 mb-5">Problems by Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false} fontSize={11}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Over time line chart */}
            {problemsOverTime.length > 0 && (
              <div className="card card-body lg:col-span-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-5">Problems Over Time (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={problemsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} name="Problems" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Recent Problems */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Recent Problems</h2>
            <Link to="/admin/problems" className="text-sm text-primary-600 hover:underline">Manage All</Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="skeleton h-4 flex-1" /><div className="skeleton h-4 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    {['Problem', 'Reporter', 'Status', 'Severity', 'Score', 'Reported'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentProblems.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link to={`/problems/${p.id}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1 max-w-xs">
                          {p.title}
                        </Link>
                        <p className="text-xs text-gray-400">{CATEGORY_LABELS[p.category]}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{p.reporter?.name}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3.5"><SeverityBadge severity={p.severity} /></td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-primary-600">{Math.round(p.priorityScore)}/100</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">{formatRelativeTime(p.createdAt)}</td>
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

export default AdminDashboard;
