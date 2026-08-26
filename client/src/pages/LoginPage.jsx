import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'ADMIN' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:shadow-glow transition-all">
              <MapPin size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Civic<span className="text-primary-400">Connect</span></span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-dark-300">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="card card-body">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg mb-5">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email" name="email" type="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                className="form-input" autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-input pr-10" autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-primary-500/10 rounded-lg border border-primary-500/20">
            <p className="text-xs font-semibold text-primary-400 mb-1.5">Demo Credentials</p>
            <div className="space-y-1 text-xs text-primary-300">
              <p><span className="font-medium">Admin:</span> admin@civicconnect.com / Admin@123</p>
              <p><span className="font-medium">User:</span> arjun@example.com / User@123</p>
              <p><span className="font-medium">Org:</span> puda@example.com / User@123</p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-dark-300">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
