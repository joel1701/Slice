import { useState } from 'react';
import api from '../api/axios'; // use api directly for FormData support
import Spinner from './Spinner';
import toast from 'react-hot-toast';
import Modal from './Modal';

const AddExpenseModal = ({ groupId, members, onClose, onAdded }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState(members[0]?.userId?._id || '');
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim()) { toast.error('Description is required'); return; }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) { toast.error('Enter a valid amount'); return; }

    setLoading(true);
    try {
      // FormData lets us send both text fields AND a file in one request
      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('amount', parsedAmount);
      formData.append('category', category);
      formData.append('date', date);
      formData.append('paidBy', paidBy);
      formData.append('notes', notes);
      if (receipt) formData.append('receipt', receipt);

      // when sending FormData, don't set Content-Type manually
      // the browser sets it automatically with the correct multipart boundary
      await api.post(`/groups/${groupId}/expenses`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Expense added!');
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Add an expense" maxWidth={480}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Description *</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Hotel booking, Dinner at Nobu"
            style={styles.input}
            autoFocus
          />
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Amount *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              style={styles.input}
            />
          </div>

          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={styles.input}
          >
            <option value="food">Food & drinks</option>
            <option value="travel">Travel</option>
            <option value="accommodation">Accommodation</option>
            <option value="shopping">Shopping</option>
            <option value="utilities">Utilities</option>
            <option value="entertainment">Entertainment</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Paid by</label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            style={styles.input}
          >
            {members.map((member) => (
              <option key={member._id} value={member.userId?._id}>
                {member.userId?.name}
              </option>
            ))}
          </select>
        </div>

        {/* notes field */}
        <div style={styles.field}>
          <label style={styles.label}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Included tip and service charge"
            className="input"
            rows={2}
            style={{ ...styles.input, resize: 'vertical', fontFamily: 'inherit' }}
            maxLength={500}
          />
        </div>

        {/* receipt upload */}
        <div style={styles.field}>
          <label style={styles.label}>Receipt photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setReceipt(e.target.files[0])}
            style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
          />
          {receipt && (
            <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '4px' }}>
              {receipt.name} selected
            </p>
          )}
        </div>

        <p style={styles.splitNote}>
          This expense will be split equally among all {members.length} members.
        </p>

        <div style={styles.actions}>
          <button type="button" onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Spinner size={16} color="#fff" /> : 'Add expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    width: '100%',
  },
  splitNote: {
    fontSize: '12px',
    color: '#6b7280',
    background: '#f9fafb',
    padding: '10px 12px',
    borderRadius: '8px',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '4px',
  },
  cancelBtn: {
    padding: '9px 18px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: 'transparent',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '9px 18px',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
  },
};

export default AddExpenseModal;