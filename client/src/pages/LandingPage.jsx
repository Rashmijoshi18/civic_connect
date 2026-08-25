import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, ChevronRight, ArrowRight, CheckCircle,
  TrendingUp, Users, Building2, FileCheck,
  Truck, Droplets, Zap, BookOpen, Shield, Leaf, AlertTriangle, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Animated counter hook
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, start]);
  return count;
}

const CATEGORIES = [
  { label: 'Roads', icon: Truck, color: 'bg-orange-100 text-orange-600' },
  { label: 'Waste Management', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600' },
  { label: 'Water', icon: Droplets, color: 'bg-blue-100 text-blue-600' },
  { label: 'Electricity', icon: Zap, color: 'bg-amber-100 text-amber-600' },
  { label: 'Education', icon: BookOpen, color: 'bg-indigo-100 text-indigo-600' },
  { label: 'Public Safety', icon: Shield, color: 'bg-red-100 text-red-600' },
  { label: 'Environment', icon: Leaf, color: 'bg-green-100 text-green-600' },
  { label: 'Other', icon: HelpCircle, color: 'bg-gray-100 text-gray-600' },
];

const STEPS = [
  { step: '01', title: 'Report', desc: 'Citizens submit community problems with photos and location details.', icon: MapPin, color: 'bg-blue-500' },
  { step: '02', title: 'Verify', desc: 'Admins review and verify problems to ensure authenticity.', icon: FileCheck, color: 'bg-purple-500' },
  { step: '03', title: 'Collaborate', desc: 'Organizations and citizens propose practical solutions.', icon: Users, color: 'bg-amber-500' },
  { step: '04', title: 'Resolve', desc: 'Best solutions are selected and implemented by authorities.', icon: CheckCircle, color: 'bg-green-500' },
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const problems = useCounter(1250, 2000, statsVisible);
  const resolved = useCounter(840, 2000, statsVisible);
  const contributors = useCounter(320, 2000, statsVisible);
  const orgs = useCounter(95, 2000, statsVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-indigo-900 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container-app py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90">Empowering Communities Across India</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              <span className="text-white">Civic</span>
              <span className="text-primary-300">Connect</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-4 font-light text-balance">
              Report problems. Collaborate on solutions.
            </p>
            <p className="text-xl md:text-2xl text-primary-300 font-semibold mb-10">
              Build better communities.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? '/report-problem' : '/register'}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                <MapPin size={18} /> Report a Problem <ArrowRight size={16} />
              </Link>
              <Link
                to="/problems"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                Explore Problems <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 64L1440 64L1440 32C1200 64 720 0 0 32L0 64Z" fill="#F9FAFB" />
          </svg>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="bg-gray-50 py-16">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: problems, suffix: '+', label: 'Problems Reported', icon: MapPin, color: 'text-blue-600 bg-blue-50' },
              { value: resolved, suffix: '', label: 'Problems Resolved', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
              { value: contributors, suffix: '', label: 'Active Contributors', icon: Users, color: 'text-purple-600 bg-purple-50' },
              { value: orgs, suffix: '', label: 'Organizations', icon: Building2, color: 'text-amber-600 bg-amber-50' },
            ].map(({ value, suffix, label, icon: Icon, color }) => (
              <div key={label} className="card card-body text-center">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-3`}>
                  <Icon size={22} />
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{value.toLocaleString()}{suffix}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container-app">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From reporting to resolution — a transparent, community-driven process.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gray-100" />
            {STEPS.map(({ step, title, desc, icon: Icon, color }, idx) => (
              <div key={step} className="text-center group">
                <div className={`w-20 h-20 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={32} className="text-white" />
                </div>
                <div className="text-xs font-bold text-gray-400 mb-1">STEP {step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="container-app">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Problem Categories</h2>
            <p className="text-gray-500">Report issues across 8 key civic infrastructure areas.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(({ label, icon: Icon, color }) => (
              <Link
                key={label}
                to={`/problems?category=${label.toUpperCase().replace(/ /g, '_')}`}
                className="card card-body flex flex-col items-center gap-3 text-center group hover:border-primary-200 hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-primary-600">
        <div className="container-app text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to make a difference?</h2>
          <p className="text-primary-200 mb-8 max-w-xl mx-auto">
            Join thousands of citizens and organizations working together to build better communities across India.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="px-6 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow active:scale-95">
              Create Free Account
            </Link>
            <Link to="/problems" className="px-6 py-3.5 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
              Browse Problems
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="container-app text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <MapPin size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">CivicConnect</span>
          </div>
          <p className="text-sm">Community Problem Reporting & Solution Platform</p>
          <p className="text-xs mt-2">Built for Smart India Hackathon 2024 • Made with ❤️ in India</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
