import { Row, Col } from 'react-bootstrap'
import PageHeader from '../../shared/ui/PageHeader'
import LoadingSpinner from '../../shared/ui/LoadingSpinner'
import StatusBadge from '../../shared/ui/StatusBadge'
import StatCard from '../../shared/ui/StatCard'

const TABS = [
  { key: 'ALL',      label: 'All' },
  { key: 'OPEN',     label: 'Open' },
  { key: 'ACTIONED', label: 'Actioned' },
]

// Live days-until calculation. Stored daysToExpire is stale by the time it's read.
const daysUntil = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d)) return null
  // Floor to whole days for stable display
  const ms = d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.floor(ms / 86400000)
}

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d) ? '—' : d.toLocaleDateString()
}

const rowClass = (days, status) => {
  if (status === 'ACTIONED') return 'opacity-75'
  if (days === null) return ''
  if (days < 0) return 'table-danger'    // already expired
  if (days <= 3) return 'table-warning'  // urgent
  return ''
}

const daysCell = (days) => {
  if (days === null) return '—'
  if (days < 0) {
    return <strong style={{ color: 'var(--danger)' }}>EXPIRED ({Math.abs(days)}d ago)</strong>
  }
  if (days === 0) {
    return <strong style={{ color: 'var(--danger)' }}>Today</strong>
  }
  const color = days <= 3 ? 'var(--warning)' : 'inherit'
  return <strong style={{ color }}>{days}d</strong>
}

export default function ExpiryWatch({
  items,
  loading,
  tab,
  actioningId,
  onTabChange,
  onAction,
  onView,
}) {
  // Counts (always from the full set when tab=ALL or filtered to current tab)
  const openCount     = items.filter(i => i.status === 'OPEN').length
  const actionedCount = items.filter(i => i.status === 'ACTIONED').length
  const expiredCount  = items.filter(i => {
    const d = daysUntil(i.expiryDate)
    return d !== null && d < 0 && i.status === 'OPEN'
  }).length
  const urgentCount   = items.filter(i => {
    const d = daysUntil(i.expiryDate)
    return d !== null && d >= 0 && d <= 3 && i.status === 'OPEN'
  }).length

  // Tab-driven row filtering. The data source already varies by tab
  // (Open tab calls /api/expiry-watch/open), so this is mostly a safety net.
  const filtered =
    tab === 'OPEN'     ? items.filter(i => i.status === 'OPEN') :
    tab === 'ACTIONED' ? items.filter(i => i.status === 'ACTIONED') :
    items // ALL → show everything

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Expiry Watch"
        subtitle="Monitor blood components nearing or past their expiry date"
      />

      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <StatCard title="Already Expired" value={expiredCount} color="danger" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Urgent (≤3 days)" value={urgentCount} color="warning" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Open Alerts" value={openCount} color="primary" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Resolved" value={actionedCount} color="success" />
        </Col>
      </Row>

      {openCount > 0 && tab !== 'ACTIONED' && (
        <div className="alert-glass warning mb-4">
          ⚠️ <strong>{openCount} item(s) require attention.</strong>
          {expiredCount > 0 && <> {expiredCount} already expired.</>}
          {urgentCount > 0 && <> {urgentCount} expiring within 3 days.</>}
        </div>
      )}

      <div className="nav-tabs-glass mb-4">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`nav-link${tab === t.key ? ' active' : ''}`}
            onClick={() => onTabChange(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        {loading ? <LoadingSpinner /> : (
          <div className="table-scroll">
            <table className="table-glass w-100">
              <thead>
                <tr>
                  <th>Expiry ID</th>
                  <th>Component ID</th>
                  <th>Flagged On</th>
                  <th>Expiry Date</th>
                  <th>Days Left</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(i => {
                    const days = daysUntil(i.expiryDate)
                    const isActioning = actioningId === i.expiryId
                    return (
                      <tr key={i.expiryId} className={rowClass(days, i.status)}>
                        <td>{i.expiryId}</td>
                        <td>{i.componentId}</td>
                        <td>{formatDate(i.flagDate)}</td>
                        <td>{formatDate(i.expiryDate)}</td>
                        <td>{daysCell(days)}</td>
                        <td><StatusBadge status={i.status} /></td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn-glass"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => onView?.(i)}
                            >
                              View
                            </button>
                            {i.status === 'OPEN' && (
                              <button
                                className="btn-glass"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => onAction(i.expiryId)}
                                disabled={isActioning}
                              >
                                {isActioning ? 'Marking…' : 'Mark Actioned'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
