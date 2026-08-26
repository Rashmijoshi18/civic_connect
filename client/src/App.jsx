import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExplorePage from './pages/ExplorePage';
import ProblemDetailPage from './pages/ProblemDetailPage';

// User pages
import UserDashboard from './pages/UserDashboard';
import ReportProblemPage from './pages/ReportProblemPage';
import MyProblemsPage from './pages/MyProblemsPage';
import MySolutionsPage from './pages/MySolutionsPage';
import ProfilePage from './pages/ProfilePage';

// Organization pages
import OrgDashboard from './pages/OrgDashboard';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminProblemsPage from './pages/AdminProblemsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSolutionsPage from './pages/AdminSolutionsPage';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '10px', fontSize: '14px', fontWeight: '500', background: 'var(--color-surface-850)', color: 'var(--color-text-main)', border: '1px solid var(--color-surface-700)' },
            success: { iconTheme: { primary: '#34d399', secondary: 'var(--color-surface-900)' } },
            error: { iconTheme: { primary: '#f87171', secondary: 'var(--color-surface-900)' } },
          }}
        />

        <Navbar />

        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/problems" element={<ExplorePage />} />
          <Route path="/problems/:id" element={<ProblemDetailPage />} />

          {/* Protected — any authenticated user */}
          <Route path="/dashboard" element={
            <ProtectedRoute><UserDashboard /></ProtectedRoute>
          } />
          <Route path="/report-problem" element={
            <ProtectedRoute><ReportProblemPage /></ProtectedRoute>
          } />
          <Route path="/my-problems" element={
            <ProtectedRoute><MyProblemsPage /></ProtectedRoute>
          } />
          <Route path="/my-solutions" element={
            <ProtectedRoute><MySolutionsPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* Organization */}
          <Route path="/organization" element={
            <ProtectedRoute roles={['ORGANIZATION', 'ADMIN']}><OrgDashboard /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/problems" element={
            <ProtectedRoute roles={['ADMIN']}><AdminProblemsPage /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>
          } />
          <Route path="/admin/solutions" element={
            <ProtectedRoute roles={['ADMIN']}><AdminSolutionsPage /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
