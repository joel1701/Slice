import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';

import LandingPage   from './pages/LandingPage';
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GroupPage     from './pages/GroupPage';
import NotFoundPage  from './pages/NotFoundPage';

import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage  from './pages/ResetPassword';

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontSize: '14px', borderRadius: '10px', fontFamily: 'DM Sans, sans-serif' },
            success: { style: { borderLeft: '4px solid #10b981' } },
            error:   { style: { borderLeft: '4px solid #ef4444' } },
          }}
        />
        <Routes>
          <Route path="/"          element={<LandingPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/group/:id" element={<PrivateRoute><GroupPage /></PrivateRoute>} />
          <Route path="*"          element={<NotFoundPage />} />
          <Route path="/forgot-password"        element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token"  element={<ResetPasswordPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;