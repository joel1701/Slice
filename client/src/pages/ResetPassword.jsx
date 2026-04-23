import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams(); // the reset token from the URL
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) { toast.error('Please fill in both fields'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="animate-fadeUp">
        <Link to="/" style={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#10b981"/>
            <path d="M16 5L16 27" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M9 10L23 10" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
          </svg>
          <span style={styles.logoText}>Slice</span>
        </Link>

        <h2 style={styles.title}>Set a new password</h2>
        <p style={styles.sub}>Choose a strong password for your account.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="input"
              autoFocus
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your new password"
              className="input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={styles.btn}
          >
            {loading ? <Spinner size={17} color="#fff" /> : 'Reset password'}
          </button>
        </form>

        <Link to="/login" style={styles.backLink}>← Back to sign in</Link>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: '1rem' },
  card: { background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem 2rem', width: '100%', maxWidth: '400px' },
  logo: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', textDecoration: 'none' },
  logoText: { fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' },
  title: { fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: '8px' },
  sub: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' },
  btn: { padding: '12px', fontSize: '15px', width: '100%', marginTop: '4px' },
  backLink: { display: 'block', textAlign: 'center', marginTop: '1.25rem', fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' },
};

export default ResetPasswordPage;