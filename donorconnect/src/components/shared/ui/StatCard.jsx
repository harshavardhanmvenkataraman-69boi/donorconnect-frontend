export default function StatCard({ title, value, color = 'primary', icon }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-value text-${color === 'danger' ? 'crimson' : color}">{value ?? '—'}</div>
      <div className="stat-label">{title}</div>
      {icon && <div className="stat-icon">{icon}</div>}
    </div>
  );
}
