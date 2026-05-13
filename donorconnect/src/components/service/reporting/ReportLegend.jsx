// Donut chart legend item
export default function ReportLegend({ color, label, value, pct }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
      <span style={{
        width: 10, height: 10, borderRadius: 3, background: color,
        flexShrink: 0, boxShadow: `0 1px 3px ${color}55`,
      }} />
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1, fontFamily: 'var(--font-body)' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', minWidth: 24, textAlign: 'right' }}>
        {value ?? 0}
      </span>
      {pct !== undefined && (
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 34, textAlign: 'right' }}>
          {pct}%
        </span>
      )}
    </div>
  );
}
