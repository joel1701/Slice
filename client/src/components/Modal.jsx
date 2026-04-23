import { useEffect } from 'react';

// ── MODAL WRAPPER ──────────────────────────────────────────────────────────────
// Provides the dark backdrop and centered white box
// Children render inside the box
// Props:
//   onClose  — called when user clicks the backdrop or presses Escape
//   title    — shown in the modal header
//   maxWidth — optional width override (default 440px)
const Modal = ({ onClose, title, children, maxWidth = 440 }) => {

  // close on Escape key — keyboard accessibility
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    // addEventListener attaches the handler to the whole document
    document.addEventListener('keydown', handleKey);

    // the return function is the cleanup — it removes the listener when
    // the modal unmounts so we don't stack up listeners over time
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // prevent body scrolling while modal is open
  // without this, you can scroll the page behind the modal
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      style={styles.backdrop}
      onClick={onClose} // click the dark area to close
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{ ...styles.box, maxWidth }}
        onClick={(e) => e.stopPropagation()} // don't close when clicking inside the box
      >
        {/* header row with title and X button */}
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* the form or content passed as children */}
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '1rem',
  },
  box: {
    background: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem 0',
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
    lineHeight: 1,
  },
  body: {
    padding: '1.25rem 1.5rem 1.5rem',
  },
};

export default Modal;