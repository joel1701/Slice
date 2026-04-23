// ── EMPTY STATE ────────────────────────────────────────────────────────────────
// Reusable component for when a list has no items yet
// Props:
//   icon        — emoji or character to display large (e.g. "👥")
//   title       — bold heading line
//   subtitle    — softer explanation line
//   action      — optional: { label: string, onClick: fn } renders a button
//   variant     — 'default' (white card) or 'dashed' (dashed border, used inside lists)
const EmptyState = ({ icon, title, subtitle, action, variant = 'dashed' }) => {
  return (
    <div style={{
      ...styles.container,
      ...(variant === 'dashed' ? styles.dashed : styles.solid),
    }}>
      {icon && <p style={styles.icon}>{icon}</p>}
      <p style={styles.title}>{title}</p>
      {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      {action && (
        <button onClick={action.onClick} style={styles.btn}>
          {action.label}
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    borderRadius: '10px',
  },
  dashed: {
    background: '#f9fafb',
    border: '1px dashed #e5e7eb',
  },
  solid: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
  },
  icon: {
    fontSize: '2.25rem',
    margin: '0 0 12px',
    lineHeight: 1,
  },
  title: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 6px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '0 0 1.25rem',
    lineHeight: 1.6,
    maxWidth: '280px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  btn: {
    padding: '9px 20px',
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

export default EmptyState;