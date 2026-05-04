export default function LoadingSpinner({ size = 'md' }) {
  return (
    <div className="loading-container">
      <div className={`spinner-border spinner-crimson spinner-border-${size}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
