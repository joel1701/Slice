import { useNavigate } from 'react-router-dom';

// ── GROUP CARD ────────────────────────────────────────────────────────────────
// Props:
//   group — the group object from the API
// Clicking the card navigates to /group/:id
const GroupCard = ({ group }) => {
  const navigate = useNavigate();

  // generate a consistent background color from the group name
  // so each group card has its own color without storing a color field
  const getColor = (name) => {
    const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed'];
    // sum the char codes of the name and use modulo to pick a color
    const index = name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const color = getColor(group.name);

  // generate initials from the group name (up to 2 characters)
  const initials = group.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/group/${group._id}`)}
      // make the card keyboard accessible too
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/group/${group._id}`)}
    >
      {/* colored avatar circle with group initials */}
      <div style={{ ...styles.avatar, background: color }}>
        {initials}
      </div>

      {/* group info */}
      <div style={styles.info}>
        <p style={styles.name}>{group.name}</p>
        {group.description && (
          <p style={styles.description}>{group.description}</p>
        )}
      </div>

      {/* currency badge */}
      <div style={styles.badge}>{group.currency}</div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '1rem 1.25rem',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '700',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0, // allows text to truncate with ellipsis
  },
  name: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    // truncate long group names with "..."
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  description: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '2px 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    background: '#f3f4f6',
    padding: '3px 8px',
    borderRadius: '20px',
    flexShrink: 0,
  },
};

export default GroupCard;