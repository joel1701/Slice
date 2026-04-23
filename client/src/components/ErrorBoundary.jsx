import { Component } from 'react';

// ── ERROR BOUNDARY ─────────────────────────────────────────────────────────────
// Class components can implement componentDidCatch — function components cannot
// This wraps your entire app so any unhandled render error shows a fallback UI
// instead of a blank white screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    // hasError: whether we caught a crash
    // error: the actual error object, so we can show the message
    this.state = { hasError: false, error: null };
  }

  // called when any child component throws during render
  // return new state based on the error
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // called after the error is caught — good place to log to a service like Sentry
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.page}>
          <div style={styles.card}>
            <p style={styles.icon}>⚠</p>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <p style={styles.sub}>
              Try refreshing the page. If the problem persists, check the console for details.
            </p>
            <button
              style={styles.btn}
              // reloading is the simplest recovery — resets all state
              onClick={() => window.location.reload()}
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    // no error — render children normally
    return this.props.children;
  }
}

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
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '2.5rem 2rem',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
  },
  icon: {
    fontSize: '2.5rem',
    margin: '0 0 12px',
    color: '#d97706',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 10px',
  },
  message: {
    fontSize: '13px',
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '10px 12px',
    margin: '0 0 12px',
    fontFamily: 'monospace',
    textAlign: 'left',
    wordBreak: 'break-word',
  },
  sub: {
    fontSize: '13px',
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

export default ErrorBoundary;