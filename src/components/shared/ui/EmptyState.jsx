export default function EmptyState({ message = 'No records found.' }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">🩸</div>
      <div className="empty-state-text">{message}</div>
    </div>
  );
}
