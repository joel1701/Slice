import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/auth';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) { toast.error('Fill in all fields'); return; }
    if (password !== confirm) { toast.error('Passwords don\'t match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const data = await registerUser(name, email, password);
      login(data.token, data.user);
      toast.success(`Welcome to Slice, ${data.user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // reuse exact same left panel and styles as LoginPage
  const styles = {
    page: { minHeight: '100vh', display: 'flex' },
    left: {
      width: '45%',
      background: 'var(--gray-900)',
      padding: '3rem',
      display: 'flex',
      alignItems: 'center',
    },
    leftInner: { maxWidth: '360px' },
    logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem', cursor: 'pointer' },
    logoText: { fontSize: '21px', fontWeight: '700', color: '#fff', letterSpacing: '-0.3px' },
    leftHeading: { fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '700', color: '#fff', letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: '1rem' },
    leftSub: { fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: '2rem' },
    checkList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' },
    checkItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' },
    checkIcon: { color: 'var(--accent)', fontWeight: '700', fontSize: '16px' },
    right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--gray-50)' },
    formWrap: { width: '100%', maxWidth: '380px' },
    formHeader: { marginBottom: '2rem' },
    formTitle: { fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text-primary)', marginBottom: '6px' },
    formSub: { fontSize: '14px', color: 'var(--text-secondary)' },
    link: { color: 'var(--accent)', fontWeight: '500' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    field: { display: 'flex', flexDirection: 'column', gap: '7px' },
    label: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', letterSpacing: '0.01em' },
    submitBtn: { marginTop: '6px', padding: '12px', fontSize: '15px', width: '100%' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logo} onClick={() => navigate('/')}>
            <img src="/favicon.svg" alt="Slice" width="32" height="32" />
            <span style={styles.logoText}>Slice</span>
          </div>
          <h1 style={styles.leftHeading}>Join thousands splitting smarter.</h1>
          <p style={styles.leftSub}>Free forever. No credit card. No nonsense.</p>
          <ul style={styles.checkList}>
            {['Unlimited groups', 'Instant settlement math', 'Invite anyone by email', 'Multi-currency support'].map((f) => (
              <li key={f} style={styles.checkItem}>
                <span style={styles.checkIcon}>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formWrap} className="animate-fadeUp">
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create account</h2>
            <p style={styles.formSub}>
              Already have one? <Link to="/login" style={styles.link}>Sign in</Link>
            </p>
          </div>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" className="input" autoFocus />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="input" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirm password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" className="input" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={styles.submitBtn}>
              {loading ? <Spinner size={17} color="#fff" /> : 'Create my account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;