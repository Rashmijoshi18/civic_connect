import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, Lightbulb, User,
  Shield, Users, CheckCircle, AlertTriangle, MapPin
} from 'lucide-react';

const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/my-problems', label: 'My Problems', icon: FileText },
  { to: '/my-solutions', label: 'My Solutions', icon: Lightbulb },
  { to: '/profile', label: 'Profile', icon: User },
];

const orgLinks = [
  { to: '/organization', label: 'Overview', icon: LayoutDashboard },
  { to: '/my-solutions', label: 'My Proposals', icon: Lightbulb },
  { to: '/profile', label: 'Profile', icon: User },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/problems', label: 'Problems', icon: MapPin },
  { to: '/admin/solutions', label: 'Solutions', icon: Lightbulb },
  { to: '/admin/users', label: 'Users', icon: Users },
];

const Sidebar = () => {
  const { user, isAdmin, isOrg } = useAuth();

  const links = isAdmin ? adminLinks : isOrg ? orgLinks : userLinks;
  const roleLabel = isAdmin ? 'Administrator' : isOrg ? 'Organization' : 'Citizen';

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 min-h-screen hidden lg:flex flex-col">
      {/* User info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/dashboard' || to === '/organization'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: explore link */}
      <div className="p-3 border-t border-gray-100">
        <NavLink to="/problems" className="sidebar-link">
          <MapPin size={17} />
          Explore Problems
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
