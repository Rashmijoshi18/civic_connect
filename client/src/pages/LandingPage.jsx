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
  { label: 'Roads', icon: Truck, color: 'bg-orange-500/15 text-orange-400' },
  { label: 'Waste Management', icon: AlertTriangle, color: 'bg-yellow-500/15 text-yellow-400' },
  { label: 'Water', icon: Droplets, color: 'bg-blue-500/15 text-blue-400' },
  { label: 'Electricity', icon: Zap, color: 'bg-amber-500/15 text-amber-400' },
  { label: 'Education', icon: BookOpen, color: 'bg-indigo-500/15 text-indigo-400' },
  { label: 'Public Safety', icon: Shield, color: 'bg-red-500/15 text-red-400' },
  { label: 'Environment', icon: Leaf, color: 'bg-emerald-500/15 text-emerald-400' },
  { label: 'Other', icon: HelpCircle, color: 'bg-dark-600 text-dark-300' },
];

const STEPS = [
  { step: '01', title: 'Report', desc: 'Citizens submit community problems with photos and location details.', icon: MapPin, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  { step: '02', title: 'Verify', desc: 'Admins review and verify problems to ensure authenticity.', icon: FileCheck, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
  { step: '03', title: 'Collaborate', desc: 'Organizations and citizens propose practical solutions.', icon: Users, color: 'bg-gradient-to-br from-amber-500 to-amber-600' },
  { step: '04', title: 'Resolve', desc: 'Best solutions are selected and implemented by authorities.', icon: CheckCircle, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
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
      <section className="relative overflow-hidden bg-dark-950 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/3 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="container-app py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-primary-300">Empowering Communities Across India</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              <span className="text-white">Civic</span>
              <span className="bg-gradient-to-r from-primary-400 to-accent-teal bg-clip-text text-transparent">Connect</span>
            </h1>
            <p className="text-xl md:text-2xl text-dark-200 mb-4 font-light text-balance">
              Report problems. Collaborate on solutions.
            </p>
            <p className="text-xl md:text-2xl bg-gradient-to-r from-primary-400 to-accent-teal bg-clip-text text-transparent font-semibold mb-10">
              Build better communities.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? '/report-problem' : '/register'}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-400 hover:to-primary-500 transition-all shadow-glow hover:shadow-glow-cyan active:scale-95"
              >
                <MapPin size={18} /> Report a Problem <ArrowRight size={16} />
              </Link>
              <Link
                to="/problems"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-dark-800 border border-dark-600 text-dark-100 font-semibold rounded-xl hover:bg-dark-700 hover:border-dark-500 transition-all"
              >
                Explore Problems <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 64L1440 64L1440 32C1200 64 720 0 0 32L0 64Z" fill="#0d0d14" />
          </svg>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="bg-dark-900 py-16">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: problems, suffix: '+', label: 'Problems Reported', icon: MapPin, color: 'text-blue-400 bg-blue-500/15' },
              { value: resolved, suffix: '', label: 'Problems Resolved', icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/15' },
              { value: contributors, suffix: '', label: 'Active Contributors', icon: Users, color: 'text-purple-400 bg-purple-500/15' },
              { value: orgs, suffix: '', label: 'Organizations', icon: Building2, color: 'text-amber-400 bg-amber-500/15' },
            ].map(({ value, suffix, label, icon: Icon, color }) => (
              <div key={label} className="card card-body text-center">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-3`}>
                  <Icon size={22} />
                </div>
                <p className="text-3xl font-extrabold text-white">{value.toLocaleString()}{suffix}</p>
                <p className="text-sm text-dark-300 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section className="py-20 bg-dark-850">
        <div className="container-app">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-dark-300 max-w-xl mx-auto">From reporting to resolution — a transparent, community-driven process.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-dark-700" />
            {STEPS.map(({ step, title, desc, icon: Icon, color }, idx) => (
              <div key={step} className="text-center group">
                <div className={`w-20 h-20 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200 group-hover:shadow-glow`}>
                  <Icon size={32} className="text-white" />
                </div>
                <div className="text-xs font-bold text-dark-400 mb-1">STEP {step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-dark-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-dark-900">
        <div className="container-app">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Problem Categories</h2>
            <p className="text-dark-300">Report issues across 8 key civic infrastructure areas.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(({ label, icon: Icon, color }) => (
              <Link
                key={label}
                to={`/problems?category=${label.toUpperCase().replace(/ /g, '_')}`}
                className="card card-body flex flex-col items-center gap-3 text-center group hover:border-primary-500/30 hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <span className="text-sm font-medium text-dark-100">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-primary-900/50 via-primary-800/30 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container-app text-center relative">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to make a difference?</h2>
          <p className="text-dark-200 mb-8 max-w-xl mx-auto">
            Join thousands of citizens and organizations working together to build better communities across India.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-400 hover:to-primary-500 transition-all shadow-glow active:scale-95">
              Create Free Account
            </Link>
            <Link to="/problems" className="px-6 py-3.5 border border-dark-500 text-dark-100 font-semibold rounded-xl hover:bg-dark-800 transition-all">
              Browse Problems
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 text-dark-400 py-10 border-t border-dark-800">
        <div className="container-app text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
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
