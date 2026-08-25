import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { SolutionStatusBadge } from '../components/Badges';
import EmptyState from '../components/EmptyState';
import Sidebar from '../components/Sidebar';
import { CheckCircle, XCircle, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRelativeTime, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminSolutionsPage = () => {
  const [solutions, setSolutions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState({});

  const fetchSolutions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSolutions({ page, limit: 15, ...(statusFilter && { status: statusFilter }) });
      setSolutions(res.data.data.solutions);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load solutions.'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchSolutions(); }, [fetchSolutions]);

  const handleStatusChange = async (id, status) => {
    const action = status === 'APPROVED' ? 'approve' : 'reject';
    const confirmed = window.confirm(`Are you sure you want to ${action} this solution?`);
    if (!confirmed) return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await adminAPI.updateSolutionStatus(id, status);
      toast.success(`Solution ${action}d.`);
      fetchSolutions();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setActionLoading(prev => ({ ...prev, [id]: false })); }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 bg-gray-50 py-8 px-4 lg:px-8">
        <div className="mb-7">
          <h1 className="page-title">Manage Solutions</h1>
          <p className="page-subtitle">{pagination.total} solutions</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['PENDING', 'APPROVED', 'REJECTED', ''].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="skeleton h-4 flex-1" /><div className="skeleton h-4 w-24" />
                </div>
              ))}
            </div>
          ) : solutions.length === 0 ? (
            <EmptyState icon="solutions" title={`No ${statusFilter.toLowerCase() || ''} solutions`} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Solution', 'Problem', 'Contributor', 'Status', 'Votes', 'Actions', 'Submitted'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {solutions.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="font-medium text-gray-900 line-clamp-1 text-xs">{s.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{s.expectedImpact}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link to={`/problems/${s.problem?.id}`} className="text-primary-600 hover:underline text-xs line-clamp-1 max-w-[140px] block">
                          {s.problem?.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {s.contributor?.name}
                        <span className="text-gray-300 ml-1 capitalize">({s.contributor?.role?.toLowerCase()})</span>
                      </td>
                      <td className="px-4 py-3.5"><SolutionStatusBadge status={s.status} /></td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-gray-600 text-xs">
                          <ThumbsUp size={11} /> {s._count?.votes || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {s.status === 'PENDING' && (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleStatusChange(s.id, 'APPROVED')}
                              disabled={actionLoading[s.id]}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50">
                              <CheckCircle size={11} /> Approve
                            </button>
                            <button onClick={() => handleStatusChange(s.id, 'REJECTED')}
                              disabled={actionLoading[s.id]}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50">
                              <XCircle size={11} /> Reject
                            </button>
                          </div>
                        )}
                        {s.status !== 'PENDING' && (
                          <span className="text-xs text-gray-400">No actions</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{formatRelativeTime(s.createdAt)}</td>
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
            <span className="text-sm text-gray-600">Page {page} of {pagination.pages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages} className="btn-secondary btn-sm disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSolutionsPage;
