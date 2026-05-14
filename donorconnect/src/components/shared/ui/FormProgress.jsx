export default function FormProgress({ fields }) {
  const total  = fields.length
  const filled = fields.filter(f => f.filled).length
  const pct    = total === 0 ? 0 : Math.round((filled / total) * 100)

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>Form Progress</span>
        <span style={{ fontSize: '0.75rem', color: pct === 100 ? '#2e7d32' : '#888', fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 20, background: '#e8e8e8', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 20,
          background: 'linear-gradient(90deg, #43a047, #2e7d32)',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  )
}