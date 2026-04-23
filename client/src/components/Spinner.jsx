const Spinner = ({ size = 28, color = 'var(--accent)' }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `2.5px solid var(--border)`,
      borderTop: `2.5px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }}
  />
);

export default Spinner;