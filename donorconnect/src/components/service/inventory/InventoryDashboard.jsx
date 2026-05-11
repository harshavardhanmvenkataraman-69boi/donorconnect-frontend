import { Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PageHeader from '../../shared/ui/PageHeader'
import StatCard from '../../shared/ui/StatCard'
import LoadingSpinner from '../../shared/ui/LoadingSpinner'

const rhSign = (rh) => (rh === 'POSITIVE' ? '+' : rh === 'NEGATIVE' ? '−' : '')

const formatTime = (date) => {
  if (!date) return '—'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function InventoryDashboard({
  loading,
  totalUnits,
  bloodGroupsInStock,
  totalBloodGroups,
  lowStockCount,
  expiryAlertCount,
  todaysTxnCount,
  attentionItems,
  lastRefreshed,
  onRefresh,
  onViewItem,
}) {
  return (
    <div className="animate-fadein">
      <PageHeader
        title="Inventory Dashboard"
        subtitle={
          lastRefreshed
            ? `Last refreshed ${formatTime(lastRefreshed)}`
            : 'Live snapshot of blood inventory health'
        }
      >
        <button
          className="btn-glass"
          onClick={onRefresh}
          disabled={loading}
          style={{ fontSize: '0.85rem' }}
        >
          {loading ? 'Refreshing…' : '🔄 Refresh'}
        </button>
      </PageHeader>

      {/* === Stat tiles === */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <StatCard title="Total Available Units" value={totalUnits} color="primary" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard
            title="Blood Groups in Stock"
            value={`${bloodGroupsInStock} / ${totalBloodGroups}`}
            color="success"
          />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Low Stock Alerts" value={lowStockCount} color="danger" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Expiry Alerts" value={expiryAlertCount} color="warning" />
        </Col>
      </Row>

      {/* === Triage feed === */}
      <section className="mb-4">
        <h5 className="mb-3" style={{ fontSize: '1.05rem' }}>Needs attention now</h5>

        {loading && attentionItems.length === 0 ? (
          <LoadingSpinner />
        ) : attentionItems.length === 0 ? (
          <div className="alert-glass success">
            ✓ All clear. No critical alerts at this time.
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {attentionItems.map((item, idx) => (
              <button
                key={`${item.kind}-${item.id}-${idx}`}
                onClick={() => item.componentId && onViewItem(item.componentId)}
                className={`alert-glass ${item.severity} text-start w-100`}
                style={{
                  cursor: item.componentId ? 'pointer' : 'default',
                  border: 'none',
                  background: item.severity === 'error'
                    ? 'rgba(231,76,60,0.08)'
                    : item.severity === 'warning'
                    ? 'rgba(243,156,18,0.08)'
                    : 'rgba(46,204,113,0.08)',
                  padding: '0.75rem 1rem',
                }}
              >
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div style={{ fontSize: '0.9rem' }}>
                    <span style={{ marginRight: 6 }}>{item.icon}</span>
                    <strong>{item.title}</strong>
                    {item.detail && (
                      <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>
                        · {item.detail}
                      </span>
                    )}
                  </div>
                  {item.componentId && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      View →
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* === Quick links === */}
      <section>
        <h5 className="mb-3" style={{ fontSize: '1.05rem' }}>Explore</h5>
        <Row className="g-3">
          <Col xs={12} md={4}>
            <QuickLinkCard
              to="/dashboard/stock-overview"
              icon="📦"
              title="Stock Overview"
              detail={`${totalUnits} unit(s) across ${bloodGroupsInStock} group(s)`}
            />
          </Col>
          <Col xs={12} md={4}>
            <QuickLinkCard
              to="/dashboard/stock-transactions"
              icon="🔄"
              title="Transactions"
              detail={`${todaysTxnCount} recorded today`}
            />
          </Col>
          <Col xs={12} md={4}>
            <QuickLinkCard
              to="/dashboard/expiry-watch"
              icon="⏰"
              title="Expiry Watch"
              detail={`${expiryAlertCount} open alert(s)`}
              highlight={expiryAlertCount > 0}
            />
          </Col>
        </Row>
      </section>
    </div>
  )
}

function QuickLinkCard({ to, icon, title, detail, highlight }) {
  return (
    <Link
      to={to}
      className="alert-glass d-block text-decoration-none"
      style={{
        padding: '1rem 1.25rem',
        color: 'inherit',
        borderColor: highlight ? 'var(--warning)' : undefined,
      }}
    >
      <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{detail}</div>
    </Link>
  )
}
