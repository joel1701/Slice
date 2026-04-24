import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/auth';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

// ✅ NEW: import CSS for responsiveness
import './login.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // redirect target after login
  const redirectTo = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { 
      toast.error('Please fill in all fields'); 
      return; 
    }

    setLoading(true);
    try {
      const data = await loginUser(email, password);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate(redirectTo);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={styles.page}>
      
      {/* left panel — branding */}
      <div className="login-left" style={styles.left}>
        <div style={styles.leftInner}>
          
          <div style={styles.logo} onClick={() => navigate('/')}>
            <img src="/favicon.svg" alt="Slice" width="32" height="32" />
            <span style={styles.logoText}>Slice</span>
          </div>

          <h1 style={styles.leftHeading}>
            Split smarter.<br/>Settle faster.
          </h1>

          <p style={styles.leftSub}>
            Track shared expenses with anyone. The math is automatic.
          </p>

          <div className="stat-cards" style={styles.statCards}>
            {[
              { label: 'Groups created', value: '12,400+' },
              { label: 'Expenses tracked', value: '₹2.1Cr+' },
            ].map((s, i) => (
              <div key={i} style={styles.statCard}>
                <p style={styles.statValue}>{s.value}</p>
                <p style={styles.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* right panel — form */}
      <div className="login-right" style={styles.right}>
        <div style={styles.formWrap} className="animate-fadeUp">
          
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Sign in</h2>
            <p style={styles.formSub}>
              Don't have an account?{' '}
              <Link to="/register" style={styles.link}>Create one</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            
            <div style={styles.field}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="input"
                autoComplete="current-password"
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: '-4px' }}>
              <Link 
                to="/forgot-password" 
                style={{ fontSize: '13px', color: 'var(--accent)' }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={styles.submitBtn}
            >
              {loading ? <Spinner size={17} color="#fff" /> : 'Sign in'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
  },

  left: {
    width: '45%',
    background: 'var(--gray-900)',
    padding: '3rem',
    display: 'flex',
    alignItems: 'center',
  },

  leftInner: { maxWidth: '360px' },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '3rem',
    cursor: 'pointer',
  },

  logoText: {
    fontSize: '21px',
    fontWeight: '700',
    color: '#fff',
  },

  leftHeading: {
    fontSize: 'clamp(1.4rem, 5vw, 2.2rem)',
    fontWeight: '700',
    color: '#fff',
    lineHeight: 1.2,
    marginBottom: '1rem',
  },

  leftSub: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.65,
    marginBottom: '2.5rem',
  },

  statCards: { display: 'flex', gap: '12px' },

  statCard: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 18px',
    flex: 1,
  },

  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
  },

  statLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.45)',
  },

  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'var(--gray-50)',
  },

  formWrap: { width: '100%', maxWidth: '380px' },

  formHeader: { marginBottom: '2rem' },

  formTitle: {
    fontSize: '1.6rem',
    fontWeight: '700',
  },

  formSub: { fontSize: '14px' },

  link: { color: 'var(--accent)' },

  form: { display: 'flex', flexDirection: 'column', gap: '1.1rem' },

  field: { display: 'flex', flexDirection: 'column', gap: '7px' },

  label: {
    fontSize: '13px',
    fontWeight: '500',
  },

  submitBtn: {
    marginTop: '6px',
    padding: '14px',
    fontSize: '15px',
    width: '100%',
  },
};

export default LoginPage;