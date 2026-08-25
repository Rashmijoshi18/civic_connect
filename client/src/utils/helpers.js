// Shared utility functions for UI formatting

export const STATUS_LABELS = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
};

export const STATUS_CLASSES = {
  PENDING: 'badge-pending',
  VERIFIED: 'badge-verified',
  IN_PROGRESS: 'badge-in-progress',
  RESOLVED: 'badge-resolved',
  REJECTED: 'badge-rejected',
};

export const SEVERITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const SEVERITY_CLASSES = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
  CRITICAL: 'badge-critical',
};

export const CATEGORY_LABELS = {
  ROADS: 'Roads',
  WASTE_MANAGEMENT: 'Waste Management',
  WATER: 'Water',
  ELECTRICITY: 'Electricity',
  EDUCATION: 'Education',
  PUBLIC_SAFETY: 'Public Safety',
  ENVIRONMENT: 'Environment',
  OTHER: 'Other',
};

export const SOLUTION_STATUS_CLASSES = {
  PENDING: 'badge-pending',
  APPROVED: 'badge-resolved',
  REJECTED: 'badge-rejected',
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

export const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
};

export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.errors?.[0]?.msg) return error.response.data.errors[0].msg;
  if (error?.message) return error.message;
  return 'Something went wrong. Please try again.';
};
