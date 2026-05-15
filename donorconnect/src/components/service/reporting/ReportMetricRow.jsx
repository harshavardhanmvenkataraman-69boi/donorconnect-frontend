// Simple key-value row matching the project table/list style
export default function ReportMetricRow({ label, value, color, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0',
      borderBottom: last ? 'none' : '1px solid var(--border-light)',
    }}>
      <span style={{
        fontSize: '0.82rem', color: 'var(--text-secondary)',
        fontFamily: 'var(--font-body)', fontWeight: 400,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '0.92rem', fontWeight: 700,
        fontFamily: 'var(--font-display)',
        color: color || 'var(--text-primary)',
      }}>
        {value ?? '—'}
      </span>
    </div>
  );
}
