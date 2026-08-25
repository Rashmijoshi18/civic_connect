import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Eye, EyeOff, AlertCircle, User, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'USER' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(err => ({ ...err, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email) e.email = 'Email is required.';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created successfully!');
      navigate(user.role === 'ORGANIZATION' ? '/organization' : '/dashboard', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <MapPin size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Civic<span className="text-primary-600">Connect</span></span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">Join the community making India better</p>
        </div>

        <div className="card card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selection */}
            <div>
              <label className="form-label">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'USER', label: 'Citizen', desc: 'Report & engage', icon: User },
                  { value: 'ORGANIZATION', label: 'Organization', desc: 'Propose solutions', icon: Building2 },
                ].map(({ value, label, desc, icon: Icon }) => (
                  <button
                    key={value} type="button"
                    onClick={() => setForm(f => ({ ...f, role: value }))}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border-2 text-left transition-all ${
                      form.role === value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} className={form.role === value ? 'text-primary-600' : 'text-gray-400'} />
                    <div>
                      <p className={`text-sm font-semibold ${form.role === value ? 'text-primary-700' : 'text-gray-700'}`}>{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="form-label">Full Name</label>
              <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                placeholder="Arjun Sharma" className="form-input" />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="arjun@example.com" className="form-input" />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 6 characters" className="form-input pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword} onChange={handleChange}
                placeholder="Repeat your password" className="form-input" />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
