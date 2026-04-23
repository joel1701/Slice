import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false); // true after form submission

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      // always show success — backend doesn't confirm whether email exists
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="animate-fadeUp">
        {/* logo */}
        <Link to="/" style={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#10b981"/>
            <path d="M16 5L16 27" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M9 10L23 10" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
          </svg>
          <span style={styles.logoText}>Slice</span>
        </Link>

        {sent ? (
          // ── success state ──
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✉</div>
            <h2 style={styles.title}>Check your inbox</h2>
            <p style={styles.sub}>
              If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
              Check your spam folder if you don't see it.
            </p>
            <Link to="/login" style={styles.backLink}>← Back to sign in</Link>
          </div>
        ) : (
          // ── form ──
          <>
            <h2 style={styles.title}>Forgot your password?</h2>
            <p style={styles.sub}>
              Enter your email and we'll send you a link to reset it.
            </p>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={styles.btn}
              >
                {loading ? <Spinner size={17} color="#fff" /> : 'Send reset link'}
              </button>
            </form>
            <Link to="/login" style={styles.backLink}>← Back to sign in</Link>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--gray-50)',
    padding: '1rem',
  },
  card: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '400px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '2rem',
    textDecoration: 'none',
  },
  logoText: { fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' },
  title: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.4px',
    marginBottom: '8px',
  },
  sub: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.65,
    marginBottom: '1.5rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' },
  btn: { padding: '12px', fontSize: '15px', width: '100%', marginTop: '4px' },
  backLink: {
    display: 'block',
    textAlign: 'center',
    marginTop: '1.25rem',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
  },
  successBox: { textAlign: 'center' },
  successIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    display: 'block',
  },
};

export default ForgotPasswordPage;