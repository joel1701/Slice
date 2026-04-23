import { deleteExpense } from '../api/expenses';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// category labels and colors for the badge
const CATEGORY_STYLES = {
  food:          { label: 'Food',          color: '#f59e0b', bg: '#fffbeb' },
  travel:        { label: 'Travel',        color: '#3b82f6', bg: '#eff6ff' },
  accommodation: { label: 'Stay',          color: '#8b5cf6', bg: '#f5f3ff' },
  shopping:      { label: 'Shopping',      color: '#ec4899', bg: '#fdf2f8' },
  utilities:     { label: 'Utilities',     color: '#6b7280', bg: '#f9fafb' },
  entertainment: { label: 'Fun',           color: '#10b981', bg: '#ecfdf5' },
  other:         { label: 'Other',         color: '#6b7280', bg: '#f9fafb' },
};

// Props:
//   expenses  — array of expense objects from the API
//   currency  — the group's currency string (e.g. "INR")
//   onDeleted — callback to refresh the list after a deletion
const ExpenseList = ({ expenses, currency, onDeleted }) => {
  const { user } = useAuth();

  const handleDelete = async (expenseId) => {
    // confirm before deleting — prevents accidental taps
    if (!window.confirm('Delete this expense? This cannot be undone.')) return;

    try {
      await deleteExpense(expenseId);
      toast.success('Expense deleted');
      onDeleted(); // tell the parent to refresh
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete';
      toast.error(message);
    }
  };

  // format currency amounts nicely
  // e.g. 1500 → "₹1,500.00" for INR, "$1,500.00" for USD
  const formatAmount = (amount) => {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || '';
    return `${symbol}${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // format the date into something readable: "Apr 20, 2026"
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (expenses.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyTitle}>No expenses yet</p>
        <p style={styles.emptySubtitle}>Add the first expense to get started</p>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {expenses.map((expense) => {
        const catStyle = CATEGORY_STYLES[expense.category] || CATEGORY_STYLES.other;

        // check if the logged-in user is the one who paid this expense
        // if so, show the delete button
        const isPayer = expense.paidBy?._id === user?.id ||
                        expense.paidBy?.id === user?.id;

        return (
          <div key={expense._id} style={styles.item}>
            {/* left: category badge + description */}
            <div style={styles.left}>
              <span style={{
                ...styles.categoryBadge,
                color: catStyle.color,
                background: catStyle.bg,
              }}>
                {catStyle.label}
              </span>
              <p style={styles.description}>{expense.description}</p>
              <p style={styles.meta}>
                Paid by {expense.paidBy?.name} · {formatDate(expense.date)}
              </p>
            </div>

            {/* right: amount + delete */}
            <div style={styles.right}>
              <p style={styles.amount}>{formatAmount(expense.amount)}</p>
              {isPayer && (
                <button
                  onClick={() => handleDelete(expense._id)}
                  style={styles.deleteBtn}
                  title="Delete expense"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '14px 16px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  categoryBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '20px',
    marginBottom: '4px',
  },
  description: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
  },
  meta: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '3px 0 0',
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
    flexShrink: 0,
  },
  amount: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  deleteBtn: {
    fontSize: '12px',
    color: '#dc2626',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem 1rem',
    background: '#f9fafb',
    borderRadius: '10px',
    border: '1px dashed #e5e7eb',
  },
  emptyTitle: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#374151',
    margin: '0 0 4px',
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
};

export default ExpenseList;