import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { User, Mail, Calendar, Edit2, Check, X } from 'lucide-react';
import { formatDate, getInitials, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    usersAPI.getStats().then(r => setStats(r.data.data.stats)).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty.'); return; }
    setSaving(true);
    try {
      const res = await usersAPI.updateProfile({ name });
      updateUser(res.data.data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const roleColors = { USER: 'bg-blue-100 text-blue-700', ORGANIZATION: 'bg-purple-100 text-purple-700', ADMIN: 'bg-red-100 text-red-700' };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 bg-gray-50 py-8 px-4 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-5">
          <h1 className="page-title">My Profile</h1>

          {/* Profile card */}
          <div className="card card-body">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {getInitials(user?.name)}
              </div>

              <div className="flex-1">
                {/* Name */}
                <div className="flex items-center gap-2 mb-1">
                  {editing ? (
                    <>
                      <input
                        value={name} onChange={e => setName(e.target.value)}
                        className="form-input py-1.5 text-lg font-bold"
                        autoFocus
                      />
                      <button onClick={handleSave} disabled={saving} className="btn-primary btn-sm">
                        <Check size={14} />
                      </button>
                      <button onClick={() => { setEditing(false); setName(user?.name); }} className="btn-secondary btn-sm">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                      <button onClick={() => setEditing(true)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Mail size={14} />{user?.email}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} />Joined {formatDate(user?.createdAt)}</span>
                </div>

                <div className="mt-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[user?.role]}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="card card-body">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Contribution Stats</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Problems Reported', value: stats.totalReported },
                  { label: 'Solutions Submitted', value: stats.totalSolutions },
                  { label: 'Votes Received', value: stats.totalVotesReceived },
                  { label: 'Resolved', value: stats.resolvedProblems },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account info */}
          <div className="card card-body">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Account Information</h3>
            <dl className="space-y-3 text-sm">
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email Address', value: user?.email },
                { label: 'Account Type', value: user?.role },
                { label: 'Account Status', value: user?.isActive ? 'Active' : 'Inactive' },
                { label: 'Member Since', value: formatDate(user?.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
