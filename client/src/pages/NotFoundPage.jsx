import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.code}>404</p>
        <h1 style={styles.title}>Page not found</h1>
        <p style={styles.subtitle}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          style={styles.btn}
          // send logged-in users to dashboard, others to login
          onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}
        >
          {isLoggedIn ? 'Go to dashboard' : 'Go to login'}
        </button>
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
    background: '#f9fafb',
    padding: '1rem',
  },
  card: {
    textAlign: 'center',
    maxWidth: '360px',
    width: '100%',
  },
  code: {
    fontSize: '5rem',
    fontWeight: '800',
    color: '#e5e7eb',
    margin: '0 0 8px',
    lineHeight: 1,
  },
  title: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 10px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 1.5rem',
    lineHeight: 1.6,
  },
  btn: {
    padding: '10px 24px',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

export default NotFoundPage;