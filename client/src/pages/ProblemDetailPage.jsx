import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, User, Tag, ArrowLeft, Image, PlusCircle, X } from 'lucide-react';
import { problemsAPI, solutionsAPI } from '../services/api';
import { StatusBadge, SeverityBadge, PriorityBadge } from '../components/Badges';
import ProblemTimeline from '../components/ProblemTimeline';
import SolutionCard from '../components/SolutionCard';
import EmptyState from '../components/EmptyState';
import { DetailSkeleton } from '../components/Skeletons';
import { CATEGORY_LABELS, formatDate, getErrorMessage, getImageUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProblemDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [solutionForm, setSolutionForm] = useState({ title: '', description: '', estimatedCost: '', expectedImpact: '' });
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [pRes, sRes] = await Promise.all([
          problemsAPI.getById(id),
          solutionsAPI.getByProblem(id),
        ]);
        setProblem(pRes.data.data.problem);
        setSolutions(sRes.data.data.solutions);
      } catch (err) {
        toast.error('Failed to load problem.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleSolutionSubmit = async (e) => {
    e.preventDefault();
    if (!solutionForm.title || !solutionForm.description || !solutionForm.expectedImpact) {
      toast.error('Please fill in required fields.'); return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(solutionForm).forEach(([k, v]) => v && fd.append(k, v));
      if (attachment) fd.append('attachment', attachment);
      const res = await solutionsAPI.create(id, fd);
      setSolutions(prev => [{ ...res.data.data.solution, hasVoted: false }, ...prev]);
      setSolutionForm({ title: '', description: '', estimatedCost: '', expectedImpact: '' });
      setAttachment(null);
      setShowForm(false);
      toast.success('Solution submitted successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="container-app py-10"><DetailSkeleton /></div>
  );

  if (!problem) return (
    <div className="container-app py-20 text-center">
      <p className="text-gray-500">Problem not found.</p>
      <Link to="/problems" className="btn-primary mt-4 inline-flex">Back to Explore</Link>
    </div>
  );

  const canPropose = isAuthenticated && !['PENDING', 'REJECTED', 'RESOLVED'].includes(problem.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app">
        {/* Back */}
        <Link to="/problems" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft size={15} /> Back to Explore
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header card */}
            <div className="card card-body">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                    {CATEGORY_LABELS[problem.category]}
                  </span>
                  <StatusBadge status={problem.status} />
                  <SeverityBadge severity={problem.severity} />
                </div>
                <PriorityBadge score={problem.priorityScore} level={problem.priorityLevel} />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">{problem.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1.5"><MapPin size={14} />{problem.location}, {problem.city}</span>
                <span className="flex items-center gap-1.5"><User size={14} />{problem.reporter?.name}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} />{formatDate(problem.createdAt)}</span>
              </div>

              <p className="text-gray-700 leading-relaxed">{problem.description}</p>

              {/* Image */}
              {problem.imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden">
                  <img src={getImageUrl(problem.imageUrl)} alt="Problem" className="w-full max-h-80 object-cover" />
                </div>
              )}
            </div>

            {/* Solutions section */}
            <div className="card card-body">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Proposed Solutions <span className="text-gray-400 font-normal text-base">({solutions.length})</span>
                </h2>
                {canPropose && (
                  <button onClick={() => setShowForm(!showForm)}
                    className={showForm ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}>
                    {showForm ? <><X size={14} /> Cancel</> : <><PlusCircle size={14} /> Propose Solution</>}
                  </button>
                )}
              </div>

              {/* Solution form */}
              {showForm && (
                <form onSubmit={handleSolutionSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 animate-slide-up">
                  <h3 className="text-sm font-semibold text-gray-900">Submit Your Solution</h3>
                  <div>
                    <label className="form-label">Solution Title *</label>
                    <input className="form-input" placeholder="Brief title for your solution"
                      value={solutionForm.title} onChange={e => setSolutionForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Description *</label>
                    <textarea rows={4} className="form-input resize-none" placeholder="Describe your solution in detail..."
                      value={solutionForm.description} onChange={e => setSolutionForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label">Estimated Cost</label>
                      <input className="form-input" placeholder="e.g. ₹50,000 - ₹1,00,000"
                        value={solutionForm.estimatedCost} onChange={e => setSolutionForm(f => ({ ...f, estimatedCost: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label">Expected Impact *</label>
                      <input className="form-input" placeholder="e.g. Reduces accidents by 80%"
                        value={solutionForm.expectedImpact} onChange={e => setSolutionForm(f => ({ ...f, expectedImpact: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Attachment (optional)</label>
                    <input type="file" accept="image/*" onChange={e => setAttachment(e.target.files[0])}
                      className="form-input text-sm" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={submitting} className="btn-primary btn-sm">
                      {submitting ? 'Submitting...' : 'Submit Solution'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary btn-sm">Cancel</button>
                  </div>
                </form>
              )}

              {!canPropose && !isAuthenticated && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <Link to="/login" className="font-medium hover:underline">Sign in</Link> to propose a solution.
                </div>
              )}

              {solutions.length === 0 ? (
                <EmptyState icon="solutions" title="No solutions yet"
                  description="Be the first to propose a solution for this problem." />
              ) : (
                <div className="space-y-4">
                  {solutions.map(s => <SolutionCard key={s.id} solution={s} />)}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Stats */}
            <div className="card card-body">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Problem Details</h3>
              <dl className="space-y-3 text-sm">
                {[
                  { label: 'Priority Score', value: <PriorityBadge score={problem.priorityScore} level={problem.priorityLevel} /> },
                  { label: 'Reports', value: problem.reportCount },
                  { label: 'Affected Users', value: `~${problem.affectedUsers?.toLocaleString()}` },
                  { label: 'Solutions', value: solutions.length },
                  { label: 'Reported By', value: problem.reporter?.name },
                  { label: 'Reported On', value: formatDate(problem.createdAt) },
                  { label: 'Last Updated', value: formatDate(problem.updatedAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="text-gray-900 font-medium text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Timeline */}
            <div className="card card-body">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Problem Timeline</h3>
              <ProblemTimeline status={problem.status} statusHistory={problem.statusHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;
