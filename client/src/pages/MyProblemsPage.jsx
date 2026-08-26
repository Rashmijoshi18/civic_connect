import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { StatusBadge, SeverityBadge } from '../components/Badges';
import EmptyState from '../components/EmptyState';
import Sidebar from '../components/Sidebar';
import { formatRelativeTime, CATEGORY_LABELS } from '../utils/helpers';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await usersAPI.getMyProblems({ page, limit: 10 });
        setProblems(res.data.data.problems);
        setPagination(res.data.data.pagination);
      } catch { toast.error('Failed to load problems.'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [page]);

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 bg-dark-950 py-8 px-4 lg:px-8">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="page-title">My Problems</h1>
            <p className="page-subtitle">{pagination.total} problem{pagination.total !== 1 ? 's' : ''} submitted</p>
          </div>
          <Link to="/report-problem" className="btn-primary btn-sm">
            <PlusCircle size={15} /> Report New
          </Link>
        </div>

        <div className="card">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="skeleton h-4 flex-1" />
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-4 w-20" />
                </div>
              ))}
            </div>
          ) : problems.length === 0 ? (
            <EmptyState icon="empty" title="No problems yet" description="You haven't reported any problems."
              action={<Link to="/report-problem" className="btn-primary btn-sm">Report a Problem</Link>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700">
                    {['Problem', 'Category', 'Location', 'Status', 'Severity', 'Proposals', 'Date'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-dark-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/50">
                  {problems.map(p => (
                    <tr key={p.id} className="hover:bg-dark-800/50 transition-colors">
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <Link to={`/problems/${p.id}`} className="font-medium text-white hover:text-primary-400 line-clamp-1">{p.title}</Link>
                      </td>
                      <td className="px-5 py-3.5 text-dark-300 whitespace-nowrap">{CATEGORY_LABELS[p.category]}</td>
                      <td className="px-5 py-3.5 text-dark-300 whitespace-nowrap">{p.city}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3.5"><SeverityBadge severity={p.severity} /></td>
                      <td className="px-5 py-3.5 text-center text-dark-200">{p._count?.solutions || 0}</td>
                      <td className="px-5 py-3.5 text-dark-400 whitespace-nowrap">{formatRelativeTime(p.createdAt)}</td>
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

export default MyProblemsPage;
