import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import EmptyState from '../components/EmptyState';
import Sidebar from '../components/Sidebar';
import { Search, UserCheck, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, getInitials, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  USER: 'bg-blue-100 text-blue-700',
  ORGANIZATION: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-red-100 text-red-700',
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...(search && { search }), ...(roleFilter && { role: roleFilter }) };
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.name}?`
    );
    if (!confirmed) return;
    setActionLoading(prev => ({ ...prev, [user.id]: true }));
    try {
      await adminAPI.updateUserStatus(user.id, !user.isActive);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}.`);
      fetchUsers();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setActionLoading(prev => ({ ...prev, [user.id]: false })); }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 bg-gray-50 py-8 px-4 lg:px-8">
        <div className="mb-7">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{pagination.total} registered users</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name or email..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="form-input pl-10" />
          </div>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="form-input w-auto cursor-pointer">
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ORGANIZATION">Organization</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3 items-center">
                  <div className="skeleton w-8 h-8 rounded-full" />
                  <div className="skeleton h-4 flex-1" />
                  <div className="skeleton h-4 w-24" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <EmptyState icon="search" title="No users found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['User', 'Email', 'Role', 'Problems', 'Solutions', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {getInitials(u.name)}
                          </div>
                          <span className="font-medium text-gray-900 whitespace-nowrap">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <span className={`badge text-xs ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-gray-600">{u._count?.reportedProblems || 0}</td>
                      <td className="px-4 py-3.5 text-center text-gray-600">{u._count?.solutions || 0}</td>
                      <td className="px-4 py-3.5">
                        <span className={`badge ${u.isActive ? 'badge-resolved' : 'badge-rejected'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={actionLoading[u.id]}
                          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-50 ${
                            u.isActive
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {u.isActive ? <><UserX size={12} /> Deactivate</> : <><UserCheck size={12} /> Activate</>}
                        </button>
                      </td>
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

export default AdminUsersPage;
