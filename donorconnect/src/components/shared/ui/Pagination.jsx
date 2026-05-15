
export default function Pagination({ page, totalPages, totalElements, pageSize, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null

  const from  = page * pageSize + 1
  const to    = Math.min((page + 1) * pageSize, totalElements)

  // Show max 5 page buttons centered around current page
  const getPageNumbers = () => {
    const pages = []
    let start = Math.max(0, page - 2)
    let end   = Math.min(totalPages - 1, start + 4)
    start     = Math.max(0, end - 4)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const btnStyle = (active) => ({
    minWidth: 34, height: 34,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, border: active ? 'none' : '1px solid var(--border-light)',
    background: active ? 'var(--crimson, #C1121F)' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)',
    fontWeight: active ? 700 : 400,
    fontSize: '0.82rem', cursor: active ? 'default' : 'pointer',
    transition: 'all 0.15s',
    padding: '0 6px',
  })

  const arrowStyle = (disabled) => ({
    ...btnStyle(false),
    opacity: disabled ? 0.3 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 10,
      marginTop: 16, padding: '12px 4px',
    }}>
      {/* Record count */}
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Showing <strong>{from}–{to}</strong> of <strong>{totalElements}</strong> records
      </span>

      {/* Page buttons */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {/* First */}
        <button style={arrowStyle(page === 0)} disabled={page === 0}
          onClick={() => onPageChange(0)}>«</button>

        {/* Prev */}
        <button style={arrowStyle(page === 0)} disabled={page === 0}
          onClick={() => onPageChange(page - 1)}>‹</button>

        {/* Page numbers */}
        {getPageNumbers().map(p => (
          <button key={p} style={btnStyle(p === page)}
            onClick={() => p !== page && onPageChange(p)}
            onMouseEnter={e => { if (p !== page) e.currentTarget.style.background = 'var(--crimson-pale)' }}
            onMouseLeave={e => { if (p !== page) e.currentTarget.style.background = 'transparent' }}
          >
            {p + 1}
          </button>
        ))}

        {/* Next */}
        <button style={arrowStyle(page >= totalPages - 1)} disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}>›</button>

        {/* Last */}
        <button style={arrowStyle(page >= totalPages - 1)} disabled={page >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}>»</button>
      </div>
    </div>
  )
}