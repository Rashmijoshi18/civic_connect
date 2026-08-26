import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { SolutionStatusBadge } from '../components/Badges';
import EmptyState from '../components/EmptyState';
import Sidebar from '../components/Sidebar';
import { formatRelativeTime, CATEGORY_LABELS } from '../utils/helpers';
import { ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const MySolutionsPage = () => {
  const [solutions, setSolutions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await usersAPI.getMySolutions({ page, limit: 10 });
        setSolutions(res.data.data.solutions);
        setPagination(res.data.data.pagination);
      } catch { toast.error('Failed to load solutions.'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [page]);

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 bg-dark-950 py-8 px-4 lg:px-8">
        <div className="mb-7">
          <h1 className="page-title">My Solutions</h1>
          <p className="page-subtitle">{pagination.total} solution{pagination.total !== 1 ? 's' : ''} submitted</p>
        </div>

        <div className="card">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="skeleton h-4 flex-1" /><div className="skeleton h-4 w-24" />
                </div>
              ))}
            </div>
          ) : solutions.length === 0 ? (
            <EmptyState icon="solutions" title="No solutions yet"
              description="Browse verified problems and propose a solution."
              action={<Link to="/problems" className="btn-primary btn-sm">Explore Problems</Link>}
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
                  {solutions.map(s => (
                    <tr key={s.id} className="hover:bg-dark-800/50 transition-colors">
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <p className="font-medium text-title line-clamp-1">{s.title}</p>
                        <p className="text-xs text-dark-400 mt-0.5 line-clamp-1">{s.description}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link to={`/problems/${s.problem?.id}`} className="text-primary-400 hover:underline line-clamp-1 max-w-[160px] block">
                          {s.problem?.title}
                        </Link>
                        <p className="text-xs text-dark-400">{CATEGORY_LABELS[s.problem?.category]}</p>
                      </td>
                      <td className="px-5 py-3.5"><SolutionStatusBadge status={s.status} /></td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1.5 text-dark-200">
                          <ThumbsUp size={13} className="text-dark-400" /> {s._count?.votes || 0}
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

export default MySolutionsPage;
