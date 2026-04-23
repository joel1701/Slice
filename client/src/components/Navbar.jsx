import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/'); // send to login page
  };

  // ── generate avatar initials from name ──
  // "Rahul Sharma" → "RS"
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2); // max 2 characters
  };

  return (
    <nav style={styles.nav}>
      {/* app name / logo — clicking it goes to dashboard */}
      <div
        style={styles.logo}
        onClick={() => isLoggedIn && navigate('/dashboard')}
      >
        Slice
      </div>

      {/* only show user info and logout if logged in */}
      {isLoggedIn && (
        <div style={styles.right}>
          {/* avatar circle with initials */}
          <div style={styles.avatar}>
            {getInitials(user?.name)}
          </div>

          {/* user name */}
          <span style={styles.userName}>{user?.name}</span>

          {/* logout button */}
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

// ── inline styles ─────────────────────────────────────────────────────────────
// keeping styles here for now — on Day 6 you can migrate to Tailwind if you want
const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    height: '60px',
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',    // sticks to top when you scroll down
    top: 0,
    zIndex: 100,           // stays above all other content
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#4f46e5',
    cursor: 'pointer',
    letterSpacing: '-0.5px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#4f46e5',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    flexShrink: 0,
  },
  userName: {
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500',
  },
  logoutBtn: {
    padding: '6px 14px',
    fontSize: '13px',
    background: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#374151',
  },
};

export default Navbar;