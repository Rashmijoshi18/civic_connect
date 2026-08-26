import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { problemsAPI } from '../services/api';
import ProblemCard from '../components/ProblemCard';
import { CardSkeleton } from '../components/Skeletons';
import EmptyState from '../components/EmptyState';
import { CATEGORY_LABELS } from '../utils/helpers';
import { getErrorMessage } from '../utils/helpers';

const CATEGORIES = Object.keys(CATEGORY_LABELS);
const STATUSES = ['VERIFIED', 'IN_PROGRESS', 'RESOLVED'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest First' },
  { value: 'priority', label: 'Most Urgent' },
  { value: 'solutions', label: 'Most Discussed' },
];

const ExplorePage = () => {
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({ search: '', category: '', status: '', severity: '', sortBy: 'createdAt' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 12, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await problemsAPI.getAll(params);
      setProblems(res.data.data.problems);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const setFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: f[key] === val ? '' : val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', status: '', severity: '', sortBy: 'createdAt' });
    setSearchInput('');
    setPage(1);
  };

  const activeFilterCount = [filters.category, filters.status, filters.severity].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="container-app">
        {/* Header */}
        <div className="mb-8">
          <h1 className="page-title">Explore Community Problems</h1>
          <p className="page-subtitle">Browse verified problems reported by citizens across India</p>
        </div>

        {/* Search + controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search problems by title, description, or city..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={e => { setFilters(f => ({ ...f, sortBy: e.target.value })); setPage(1); }}
              className="form-input w-auto cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary gap-2 ${activeFilterCount > 0 ? 'border-primary-500/50 text-primary-400' : ''}`}>
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="card card-body mb-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-title">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-400 hover:underline flex items-center gap-1">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>
            <div className="space-y-4">
              {/* Category */}
              <div>
                <p className="text-xs font-medium text-dark-300 mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setFilter('category', c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        filters.category === c ? 'bg-primary-600 text-white border-primary-600' : 'bg-dark-800 text-dark-200 border-dark-600 hover:border-dark-500'
                      }`}>
                      {CATEGORY_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>
              {/* Status */}
              <div>
                <p className="text-xs font-medium text-dark-300 mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => setFilter('status', s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        filters.status === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-dark-800 text-dark-200 border-dark-600 hover:border-dark-500'
                      }`}>
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              {/* Severity */}
              <div>
                <p className="text-xs font-medium text-dark-300 mb-2">Severity</p>
                <div className="flex flex-wrap gap-2">
                  {SEVERITIES.map(s => (
                    <button key={s} onClick={() => setFilter('severity', s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        filters.severity === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-dark-800 text-dark-200 border-dark-600 hover:border-dark-500'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-dark-300 mb-4">
            {pagination.total} problem{pagination.total !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Grid */}
        {error ? (
          <EmptyState icon="error" title="Failed to load problems" description={error} />
        ) : loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : problems.length === 0 ? (
          <EmptyState icon="search" title="No problems found"
            description="Try adjusting your search terms or filters."
            action={<button onClick={clearFilters} className="btn-primary btn-sm">Clear Filters</button>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map(p => <ProblemCard key={p.id} problem={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary btn-sm disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-dark-300">Page {page} of {pagination.pages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages} className="btn-secondary btn-sm disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
