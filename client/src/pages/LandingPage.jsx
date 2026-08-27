import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, ChevronRight, ArrowRight, CheckCircle,
  TrendingUp, Users, Building2, FileCheck,
  Truck, Droplets, Zap, BookOpen, Shield, Leaf, AlertTriangle, HelpCircle,
  Clock, Map
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

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const problems = useCounter(1250, 2000, statsVisible);
  const resolved = useCounter(850, 2000, statsVisible);
  const communities = useCounter(25, 2000, statsVisible);
  const resolution = useCounter(92, 2000, statsVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 transition-colors duration-300">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-primary-100 dark:bg-primary-500/5 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-40 -left-20 w-[500px] h-[500px] bg-cyan-50 dark:bg-accent-cyan/5 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="container-app relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300 border border-primary-100 dark:border-primary-500/20 rounded-full text-sm mb-6 font-medium">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                Empowering Communities Across India
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 text-title tracking-tight">
                Report Problems. <br />
                <span className="text-primary-600">Build Better Communities.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-dark-300 mb-8 font-light leading-relaxed">
                CivicConnect is the modern platform for citizens to report local issues, track progress, and collaborate directly with civic authorities.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to={isAuthenticated ? '/report-problem' : '/register'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20 active:scale-95"
                >
                  <MapPin size={18} /> Report a Problem
                </Link>
                <Link
                  to="/problems"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-dark-900 border border-dark-650 text-title font-semibold rounded-lg hover:bg-dark-850 transition-all active:scale-95 shadow-sm"
                >
                  Explore Problems <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right Visual (Dashboard Illustration) */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-2xl bg-dark-900 border border-dark-650 shadow-xl p-4 md:p-6 overflow-hidden">
                {/* Mock header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-750">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                      <MapPin className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-title">Active Issues</div>
                      <div className="text-xs text-dark-300">Mumbai Central</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold">
                    Live
                  </div>
                </div>

                {/* Mock map/activity area */}
                <div className="space-y-4">
                  {[
                    { title: 'Pothole on Linking Road', status: 'In Progress', color: 'bg-blue-500', time: '10 mins ago' },
                    { title: 'Streetlight completely out', status: 'Pending', color: 'bg-amber-500', time: '2 hours ago' },
                    { title: 'Water pipe leakage', status: 'Resolved', color: 'bg-emerald-500', time: '1 day ago' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-dark-750 border border-dark-650">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <div>
                          <div className="text-sm font-medium text-title">{item.title}</div>
                          <div className="text-xs text-dark-300">{item.time}</div>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-dark-300 bg-dark-950 px-2 py-1 rounded shadow-sm border border-dark-650">
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Decorative overlay elements */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-accent-cyan/10 rounded-full blur-2xl" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-dark-750">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-title mb-4 tracking-tight">Making Communities Better, Together</h2>
            <p className="text-lg text-dark-300">
              Report issues, track progress, and collaborate with your community to build a cleaner, safer environment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Report Issues', desc: 'Easily report potholes, garbage, streetlights, water problems, and other civic issues.', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/20' },
              { title: 'Track Progress', desc: 'Follow the status of reported problems from submission to resolution.', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/20' },
              { title: 'Community Collaboration', desc: 'Support and interact with reports submitted by people in your area.', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/20' },
              { title: 'Transparent Governance', desc: 'Help create visibility into civic problems and their resolution.', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
            ].map(({ title, desc, icon: Icon, color, bg }, idx) => (
              <div key={idx} className="bg-dark-900 p-6 rounded-2xl border border-dark-650 shadow-sm hover:shadow-md transition-shadow group">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                  <Icon className={color} size={24} />
                </div>
                <h3 className="text-lg font-bold text-title mb-2">{title}</h3>
                <p className="text-sm text-dark-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ───────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-16 bg-primary-700 dark:bg-dark-900 border-y border-primary-800 dark:border-dark-800 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container-app relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center divide-x-0 md:divide-x divide-white/10 dark:divide-white/5">
            {[
              { value: problems, suffix: '+', label: 'Issues Reported' },
              { value: resolved, suffix: '+', label: 'Issues Resolved' },
              { value: communities, suffix: '+', label: 'Active Communities' },
              { value: resolution, suffix: '%', label: 'Resolution Rate' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="px-4">
                <p className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                  {value.toLocaleString()}{suffix}
                </p>
                <p className="text-sm md:text-base font-medium text-white/70 dark:text-dark-300">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explore Preview ────────────────────────────────────────────── */}
      <section className="py-24 bg-dark-950">
        <div className="container-app">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold text-title mb-4 tracking-tight">Recent Reports in Your Area</h2>
              <p className="text-lg text-dark-300">
                See what citizens are reporting and how authorities are responding.
              </p>
            </div>
            <Link to="/problems" className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              View All Reports <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Pothole on Main Road', category: 'Roads', location: 'Downtown Avenue', status: 'In Progress', statusColor: 'bg-blue-500/20 text-blue-400', date: 'Oct 12, 2024', icon: Truck },
              { title: 'Streetlight Not Working', category: 'Electricity', location: 'Park Street, Sector 4', status: 'Resolved', statusColor: 'bg-emerald-500/20 text-emerald-400', date: 'Oct 10, 2024', icon: Zap },
              { title: 'Garbage Collection Issue', category: 'Waste', location: 'North Residential Area', status: 'Pending', statusColor: 'bg-amber-500/20 text-amber-400', date: 'Oct 14, 2024', icon: AlertTriangle },
            ].map((prob, idx) => (
              <div key={idx} className="bg-dark-900 border border-dark-650 rounded-2xl p-5 hover:shadow-lg transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-dark-750 flex items-center justify-center">
                    <prob.icon size={18} className="text-dark-300" />
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${prob.statusColor}`}>
                    {prob.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-title mb-2 line-clamp-1">{prob.title}</h3>
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-dark-400">
                    <MapPin size={14} /> <span className="line-clamp-1">{prob.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-400">
                    <Clock size={14} /> <span>{prob.date}</span>
                  </div>
                </div>
                <Link to="/problems" className="w-full py-2.5 px-4 bg-dark-750 text-dark-200 font-semibold text-sm rounded-lg text-center border border-dark-650 hover:bg-dark-700 transition-colors">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-dark-750">
        <div className="container-app">
          <div className="bg-dark-900 rounded-3xl p-8 md:p-14 text-center relative overflow-hidden border border-dark-650">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-cyan/20 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-title mb-6 relative z-10">Start improving your community today.</h2>
            <p className="text-lg text-dark-300 mb-8 max-w-2xl mx-auto relative z-10">
              Join thousands of active citizens. Report issues, propose solutions, and make a real difference in your neighborhood.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-all shadow-lg active:scale-95">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-dark-750 border-t border-dark-650 py-12">
        <div className="container-app flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="font-bold text-title text-lg tracking-tight">CivicConnect</span>
          </div>
          
          <div className="text-sm text-dark-400 text-center md:text-left">
            <p>© {new Date().getFullYear()} CivicConnect. Empowering Smart Communities.</p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-dark-400">
            <Link to="#" className="hover:text-primary-600 transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-primary-600 transition-colors">Terms</Link>
            <Link to="#" className="hover:text-primary-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
