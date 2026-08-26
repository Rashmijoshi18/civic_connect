import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, problemsAPI } from '../services/api';
import { StatusBadge, SeverityBadge, PriorityBadge } from '../components/Badges';
import EmptyState from '../components/EmptyState';
import Sidebar from '../components/Sidebar';
import { Search, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRelativeTime, CATEGORY_LABELS, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const STATUSES = ['PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

const AdminProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...(filterStatus && { status: filterStatus }), ...(search && { search }) };
      const res = await problemsAPI.getAll(params);
      setProblems(res.data.data.problems);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load problems.'); }
    finally { setLoading(false); }
  }, [page, filterStatus, search]);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  const setLoading_ = (id, val) => setActionLoading(prev => ({ ...prev, [id]: val }));

  const handleVerify = async (id, action) => {
    setLoading_(id, true);
    try {
      await adminAPI.verifyProblem(id, action);
      toast.success(`Problem ${action === 'verify' ? 'verified' : 'rejected'}.`);
      fetchProblems();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading_(id, false); }
  };

  const handleStatusChange = async (id, status) => {
    setLoading_(id + '_status', true);
    try {
      await adminAPI.updateProblemStatus(id, { status });
      toast.success('Status updated.');
      fetchProblems();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading_(id + '_status', false); }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 bg-dark-950 py-8 px-4 lg:px-8">
        <div className="mb-7">
          <h1 className="page-title">Manage Problems</h1>
          <p className="page-subtitle">{pagination.total} total problems</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text" placeholder="Search problems..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="form-input pl-10"
            />
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="form-input w-auto cursor-pointer">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="skeleton h-4 flex-1" />
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-4 w-20" />
                </div>
              ))}
            </div>
          ) : problems.length === 0 ? (
            <EmptyState icon="search" title="No problems found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700 bg-dark-850">
                    {['Problem', 'Reporter', 'Status', 'Severity', 'Priority', 'Actions', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/50">
                  {problems.map(p => (
                    <tr key={p.id} className="hover:bg-dark-800/50 transition-colors">
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <Link to={`/problems/${p.id}`} className="font-medium text-white hover:text-primary-400 line-clamp-2 text-xs">
                          {p.title}
                        </Link>
                        <p className="text-xs text-dark-400 mt-0.5">{CATEGORY_LABELS[p.category]} • {p.city}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-dark-300 whitespace-nowrap">{p.reporter?.name}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3.5"><SeverityBadge severity={p.severity} /></td>
                      <td className="px-4 py-3.5"><PriorityBadge score={p.priorityScore} level={p.priorityLevel} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {p.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleVerify(p.id, 'verify')}
                                disabled={actionLoading[p.id]}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-500/15 text-emerald-400 rounded-md hover:bg-emerald-500/25 transition-colors disabled:opacity-50">
                                <CheckCircle size={12} /> Verify
                              </button>
                              <button onClick={() => handleVerify(p.id, 'reject')}
                                disabled={actionLoading[p.id]}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/15 text-red-400 rounded-md hover:bg-red-500/25 transition-colors disabled:opacity-50">
                                <XCircle size={12} /> Reject
                              </button>
                            </>
                          )}
                          {['VERIFIED', 'IN_PROGRESS'].includes(p.status) && (
                            <select
                              onChange={e => { if (e.target.value) handleStatusChange(p.id, e.target.value); }}
                              disabled={actionLoading[p.id + '_status']}
                              className="text-xs border border-dark-600 bg-dark-800 rounded-md px-1.5 py-1 text-dark-200 cursor-pointer hover:border-dark-500 disabled:opacity-50"
                            >
                              <option value="">Change Status</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="RESOLVED">Resolved</option>
                              <option value="REJECTED">Reject</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-dark-400 whitespace-nowrap">{formatRelativeTime(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary btn-sm disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-dark-300">Page {page} of {pagination.pages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages} className="btn-secondary btn-sm disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProblemsPage;
