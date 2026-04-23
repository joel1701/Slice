import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserGroups } from '../api/groups';
import { useAuth } from '../context/AuthContext';
import CreateGroupModal from '../components/CreateGroupModal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

// category color helper — same as GroupCard
const groupColor = (name) => {
  const palette = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];
  const i = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
  return palette[i];
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchUserGroups();
      setGroups(data.groups);
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // derive initials for avatar
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div style={styles.shell}>

      {/* ── SIDEBAR ── */}
      <aside style={styles.sidebar}>
        {/* logo */}
        <div style={styles.sidebarLogo}>
          <img src="/favicon.svg" alt="Slice" width="26" height="26" />
          <span style={styles.sidebarLogoText}>Slice</span>
        </div>

        {/* nav */}
        <nav style={styles.sidebarNav}>
          <div style={styles.navSection}>
            <p style={styles.navSectionLabel}>Menu</p>
            {[
              { icon: '⊞', label: 'Dashboard', active: true },
            ].map((item) => (
              <div key={item.label} style={{ ...styles.navItem, ...(item.active ? styles.navItemActive : {}) }}>
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* groups list in sidebar */}
          <div style={styles.navSection}>
            <p style={styles.navSectionLabel}>Your groups</p>
            {loading ? (
              <div style={{ padding: '8px 12px' }}><Spinner size={16} /></div>
            ) : groups.slice(0, 8).map((g) => (
              <div
                key={g._id}
                style={styles.navGroupItem}
                onClick={() => navigate(`/group/${g._id}`)}
              >
                <div style={{ ...styles.navGroupDot, background: groupColor(g.name) }} />
                <span style={styles.navGroupName}>{g.name}</span>
              </div>
            ))}
            <div
              style={styles.navNewGroup}
              onClick={() => setShowModal(true)}
            >
              <span style={styles.navIcon}>+</span>
              <span>New group</span>
            </div>
          </div>
        </nav>

        {/* user card at bottom */}
        <div style={styles.sidebarUser}>
          <div style={styles.userAvatar}>{initials}</div>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user?.name}</p>
            <p style={styles.userEmail}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={styles.main}>
        {/* topbar */}
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowModal(true)}
          >
            + New group
          </button>
        </div>

        {/* content */}
        <div style={styles.content}>
          {loading ? (
            <div style={styles.center}><Spinner size={36} /></div>
          ) : groups.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No groups yet"
              subtitle="Create a group and invite your friends to start tracking expenses together."
              action={{ label: '+ Create your first group', onClick: () => setShowModal(true) }}
              variant="solid"
            />
          ) : (
            <>
              {/* summary row */}
              <div style={styles.summaryRow}>
                {[
                  { label: 'Total groups', value: groups.length, mono: false },
                  { label: 'Active groups', value: groups.length, mono: false },
                ].map((s, i) => (
                  <div key={i} style={styles.summaryCard} className="card">
                    <p style={styles.summaryLabel}>{s.label}</p>
                    <p style={styles.summaryValue}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* group cards grid */}
              <div style={styles.groupGrid}>
                {groups.map((g, i) => (
                  <div
                    key={g._id}
                    className={`card animate-fadeUp delay-${Math.min(i + 1, 5)}`}
                    style={styles.groupCard}
                    onClick={() => navigate(`/group/${g._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/group/${g._id}`)}
                  >
                    {/* colored top bar */}
                    <div style={{ ...styles.groupCardAccent, background: groupColor(g.name) }} />

                    <div style={styles.groupCardBody}>
                      {/* avatar + name */}
                      <div style={styles.groupCardHeader}>
                        <div style={{ ...styles.groupAvatar, background: groupColor(g.name) }}>
                          {g.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={styles.groupName}>{g.name}</p>
                          {g.description && (
                            <p style={styles.groupDesc} className="truncate">{g.description}</p>
                          )}
                        </div>
                      </div>

                      {/* currency badge + role */}
                      <div style={styles.groupCardFooter}>
                        <span className="badge badge-gray">{g.currency}</span>
                        <span className="badge badge-gray">{g.userRole}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* add new group card */}
                <div
                  style={styles.newGroupCard}
                  onClick={() => setShowModal(true)}
                  role="button"
                  tabIndex={0}
                >
                  <div style={styles.newGroupIcon}>+</div>
                  <p style={styles.newGroupText}>New group</p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {showModal && (
        <CreateGroupModal
          onClose={() => setShowModal(false)}
          onCreated={(g) => setGroups((prev) => [g, ...prev])}
        />
      )}
    </div>
  );
};

const styles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--surface-app)',
  },

  /* sidebar */
  sidebar: {
    width: 'var(--sidebar-width)',
    flexShrink: 0,
    background: 'var(--surface-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '1.25rem 1.25rem 1rem',
    borderBottom: '1px solid var(--border-dark)',
  },
  sidebarLogoText: {
    fontSize: '19px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.3px',
  },
  sidebarNav: {
    flex: 1,
    padding: '1rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    overflowY: 'auto',
  },
  navSection: { display: 'flex', flexDirection: 'column', gap: '2px' },
  navSectionLabel: {
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-muted-dark)',
    padding: '0 10px',
    marginBottom: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    color: 'var(--text-muted-dark)',
    cursor: 'pointer',
    transition: 'all var(--duration) var(--ease)',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
  },
  navIcon: { fontSize: '16px', width: '18px', textAlign: 'center' },
  navGroupItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '7px 12px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    color: 'var(--text-muted-dark)',
    fontSize: '13px',
    transition: 'background var(--duration)',
  },
  navGroupDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  navGroupName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  navNewGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '7px 12px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    color: 'var(--accent)',
    fontSize: '13px',
    marginTop: '4px',
  },
  sidebarUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '1rem 1.25rem',
    borderTop: '1px solid var(--border-dark)',
  },
  userAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-on-dark)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userEmail: {
    fontSize: '11px',
    color: 'var(--text-muted-dark)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted-dark)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    flexShrink: 0,
    borderRadius: '6px',
  },

  /* main */
  main: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface-card)',
    gap: '1rem',
  },
  pageTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
  },
  pageSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  content: {
    padding: '2rem',
    flex: 1,
  },
  center: { display: 'flex', justifyContent: 'center', paddingTop: '5rem' },

  /* summary */
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  summaryCard: {
    padding: '1.25rem 1.5rem',
  },
  summaryLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
  },
  summaryValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '-1px',
  },

  /* group grid */
  groupGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },
  groupCard: {
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'transform var(--duration) var(--ease), box-shadow var(--duration) var(--ease)',
  },
  groupCardAccent: {
    height: '4px',
  },
  groupCardBody: { padding: '1.25rem' },
  groupCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '1rem',
  },
  groupAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  groupName: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    letterSpacing: '-0.2px',
  },
  groupDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  groupCardFooter: {
    display: 'flex',
    gap: '6px',
  },
  newGroupCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    border: '1.5px dashed var(--border)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    minHeight: '140px',
    transition: 'border-color var(--duration)',
    color: 'var(--text-tertiary)',
  },
  newGroupIcon: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--gray-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    color: 'var(--text-secondary)',
  },
  newGroupText: { fontSize: '13px', fontWeight: '500' },
};

export default DashboardPage;