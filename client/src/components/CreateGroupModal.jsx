import { useState } from 'react';
import { createGroup } from '../api/groups';
import Modal from './Modal';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

const CreateGroupModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setLoading(true);
    try {
      const data = await createGroup({ name: name.trim(), description, currency });
      toast.success(`Group "${data.group.name}" created!`);
      onCreated(data.group); // tell the parent to add this group to its list
      onClose();             // close the modal
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create group';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // replace the entire return block in CreateGroupModal.jsx with this:
return (
  <Modal onClose={onClose} title="Create a group">
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.field}>
        <label style={styles.label}>Group name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Goa Trip, Flat 4B"
          style={styles.input}
          autoFocus
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Description (optional)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this group for?"
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Currency</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={styles.input}
        >
          <option value="INR">INR — Indian Rupee</option>
          <option value="USD">USD — US Dollar</option>
          <option value="EUR">EUR — Euro</option>
          <option value="GBP">GBP — British Pound</option>
        </select>
      </div>

      <div style={styles.actions}>
        <button type="button" onClick={onClose} style={styles.cancelBtn}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <Spinner size={16} color="#fff" /> : 'Create group'}
        </button>
      </div>
    </form>
  </Modal>
);
};

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,                          // shorthand for top/right/bottom/left all = 0
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '1rem',
  },
  modal: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '440px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
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
    outline: 'none',
    width: '100%',
    color: '#111827',
    background: '#ffffff',
    fontFamily: 'inherit',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '4px',
  },
  cancelBtn: {
    padding: '9px 18px',
    fontSize: '14px',
    background: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#374151',
    fontFamily: 'inherit',
  },
  submitBtn: {
    padding: '9px 18px',
    fontSize: '14px',
    background: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    fontWeight: '500',
  },
};

export default CreateGroupModal;