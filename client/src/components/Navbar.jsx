import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Menu, X, ChevronDown, Bell, User, LogOut,
  LayoutDashboard, Shield, AlertCircle, Home, Search, PlusCircle,
  Sun, Moon
} from 'lucide-react';
import { useState } from 'react';
import { getInitials } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/problems', label: 'Explore', icon: Search },
    ...(isAuthenticated ? [{ to: '/report-problem', label: 'Report', icon: PlusCircle }] : []),
    ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/90 backdrop-blur-xl border-b border-dark-750 shadow-sm">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="font-bold text-title text-lg tracking-tight">
              Civic<span className="text-primary-600">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'text-primary-600 bg-primary-500/15'
                      : 'text-dark-300 hover:text-title hover:bg-dark-800'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg text-dark-300 hover:text-title hover:bg-dark-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-dark-800 transition-colors border border-transparent hover:border-dark-650"
                >
                  <div className="w-7 h-7 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center text-xs font-bold">
                    {getInitials(user?.name)}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-title leading-none">{user?.name?.split(' ')[0]}</p>
                  </div>
                  <ChevronDown size={14} className={`text-dark-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-900 border border-dark-750 rounded-lg shadow-lg py-1 animate-fade-in">
                    <Link to="/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-dark-300 hover:bg-dark-800 hover:text-title transition-colors">
                      <User size={15} /> Profile
                    </Link>
                    <hr className="my-1 border-dark-750" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-dark-300 hover:text-title transition-colors">Sign In</Link>
                <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-dark-800 text-dark-300">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-dark-750 bg-dark-900 px-4 py-3 space-y-1 animate-slide-up shadow-lg">
          <button 
            onClick={toggleTheme} 
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-dark-300 hover:bg-dark-800 transition-colors mb-1"
          >
            {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
          </button>
          <hr className="my-1 border-dark-750" />
          
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                location.pathname === to ? 'bg-primary-500/15 text-primary-600' : 'text-dark-300'
              }`}>
              <Icon size={16} />{label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-dark-300 hover:bg-dark-800">
                <User size={16} /> Profile
              </Link>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-dark-800">
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2 border-t border-dark-750 mt-2">
              <Link to="/login" className="btn-secondary btn-sm flex-1 text-center" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn-primary btn-sm flex-1 text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
