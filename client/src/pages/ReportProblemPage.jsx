import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { problemsAPI } from '../services/api';
import { CATEGORY_LABELS } from '../utils/helpers';
import { getErrorMessage } from '../utils/helpers';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SEVERITY_COLORS = { LOW: 'text-dark-300', MEDIUM: 'text-yellow-400', HIGH: 'text-orange-400', CRITICAL: 'text-red-400' };

const ReportProblemPage = () => {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '', city: '', severity: 'MEDIUM',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(err => ({ ...err, [e.target.name]: '' }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed.'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB.'); return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    else if (form.title.length > 200) e.title = 'Title must be under 200 characters.';
    if (!form.description.trim()) e.description = 'Description is required.';
    else if (form.description.length < 20) e.description = 'Description must be at least 20 characters.';
    if (!form.category) e.category = 'Please select a category.';
    if (!form.location.trim()) e.location = 'Location is required.';
    if (!form.city.trim()) e.city = 'City is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await problemsAPI.create(fd);
      setSuccess(true);
      setTimeout(() => navigate('/my-problems'), 3000);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-title mb-3">Problem Submitted!</h2>
          <p className="text-dark-300 mb-2">
            Your problem has been submitted successfully and is now pending review.
          </p>
          <p className="text-sm text-primary-400 font-medium">
            It will appear publicly after verification by our admin team.
          </p>
          <p className="text-xs text-dark-400 mt-4">Redirecting to your problems...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 bg-dark-950 py-8 px-4 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="page-header">
            <h1 className="page-title">Report a Problem</h1>
            <p className="page-subtitle">Help your community by reporting a local issue. All submissions are reviewed by our team.</p>
          </div>

          <div className="card card-body">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="form-label">Problem Title *</label>
                <input name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. Large pothole on Main Street causing accidents"
                  className="form-input" maxLength={200} />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="form-label">Category *</label>
                <select name="category" value={form.category} onChange={handleChange} className="form-input cursor-pointer">
                  <option value="">Select a category</option>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                {errors.category && <p className="form-error">{errors.category}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Description *</label>
                <textarea name="description" rows={5} value={form.description} onChange={handleChange}
                  placeholder="Describe the problem in detail. Include when it started, how it affects people, etc."
                  className="form-input resize-none" maxLength={2000} />
                <p className="text-xs text-dark-400 mt-1">{form.description.length}/2000 characters (min 20)</p>
                {errors.description && <p className="form-error">{errors.description}</p>}
              </div>

              {/* Location + City */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Location / Landmark *</label>
                  <input name="location" value={form.location} onChange={handleChange}
                    placeholder="e.g. Near Bus Stand, GT Road" className="form-input" />
                  {errors.location && <p className="form-error">{errors.location}</p>}
                </div>
                <div>
                  <label className="form-label">City *</label>
                  <input name="city" value={form.city} onChange={handleChange}
                    placeholder="e.g. Phagwara, Ludhiana" className="form-input" />
                  {errors.city && <p className="form-error">{errors.city}</p>}
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="form-label">Severity *</label>
                <div className="grid grid-cols-4 gap-2">
                  {SEVERITIES.map(s => (
                    <button key={s} type="button"
                      onClick={() => setForm(f => ({ ...f, severity: s }))}
                      className={`py-2.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                        form.severity === s
                          ? `border-current ${SEVERITY_COLORS[s]} ${s === 'LOW' ? 'bg-dark-700' : s === 'MEDIUM' ? 'bg-yellow-500/10' : s === 'HIGH' ? 'bg-orange-500/10' : 'bg-red-500/10'}`
                          : 'border-dark-600 text-dark-400 hover:border-dark-500'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="form-label">Photo (optional)</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-dark-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary-500/50 hover:bg-primary-500/5 transition-all"
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg mx-auto object-contain" />
                      <button type="button"
                        onClick={e => { e.stopPropagation(); setImage(null); setImagePreview(null); }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-400">
                        <X size={12} />
                      </button>
                      <p className="text-xs text-dark-400 mt-2">{image?.name}</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto text-dark-400 mb-2" />
                      <p className="text-sm text-dark-300">Click to upload a photo</p>
                      <p className="text-xs text-dark-400 mt-1">JPEG, PNG, WebP — max 5MB</p>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </div>
              </div>

              {/* Info banner */}
              <div className="flex items-start gap-2.5 p-3.5 bg-primary-500/10 rounded-lg border border-primary-500/20">
                <AlertCircle size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-primary-300">
                  Your problem will be reviewed by an admin before appearing publicly. You'll be able to track its status in My Problems.
                </p>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : 'Submit Problem Report'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportProblemPage;
