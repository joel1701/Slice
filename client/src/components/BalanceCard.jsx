import { useState } from 'react';
import { recordSettlement } from '../api/groups';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

// Props:
//   settlement — { from, to, amount, fromUser, toUser }
//   groupId    — needed to call the settle API
//   currency   — for the currency symbol
//   onSettled  — callback to refresh balances after settling
const BalanceCard = ({ settlement, groupId, currency, onSettled }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '';

  // only the person who owes money can mark it as settled
  // compare settlement.from (the debtor's id) with the logged-in user's id
  const isDebtor = settlement.from === user?.id ||
                   settlement.fromUser?._id === user?.id;

  const handleSettle = async () => {
    if (!window.confirm(
      `Mark ₹${settlement.amount} payment to ${settlement.toUser?.name} as settled?`
    )) return;

    setLoading(true);
    try {
      await recordSettlement(groupId, settlement.to, settlement.amount);
      toast.success('Settlement recorded!');
      onSettled(); // refresh the balances section
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to record settlement';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      {/* debtor name */}
      <div style={styles.person}>
        <div style={{ ...styles.avatar, background: '#fee2e2', color: '#dc2626' }}>
          {settlement.fromUser?.name?.charAt(0).toUpperCase()}
        </div>
        <span style={styles.name}>{settlement.fromUser?.name}</span>
      </div>

      {/* arrow + amount in the middle */}
      <div style={styles.middle}>
        <span style={styles.arrow}>owes</span>
        <span style={styles.amount}>
          {symbol}{Number(settlement.amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
          })}
        </span>
      </div>

      {/* creditor name */}
      <div style={styles.person}>
        <div style={{ ...styles.avatar, background: '#dcfce7', color: '#16a34a' }}>
          {settlement.toUser?.name?.charAt(0).toUpperCase()}
        </div>
        <span style={styles.name}>{settlement.toUser?.name}</span>
      </div>

      {/* settle button — only shown to the debtor */}
      {isDebtor && (
        <button
          onClick={handleSettle}
          disabled={loading}
          style={{ ...styles.settleBtn, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <Spinner size={14} color="#059669" /> : 'Mark settled'}
        </button>
      )}
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    flexWrap: 'wrap',
  },
  person: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    flexShrink: 0,
  },
  name: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
  },
  middle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    gap: '2px',
  },
  arrow: {
    fontSize: '11px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  amount: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#dc2626',
  },
  settleBtn: {
    padding: '6px 14px',
    fontSize: '13px',
    background: 'transparent',
    border: '1px solid #059669',
    color: '#059669',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginLeft: 'auto',
  },
};

export default BalanceCard;