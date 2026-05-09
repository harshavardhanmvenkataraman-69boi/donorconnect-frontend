import { Row, Col } from 'react-bootstrap'
import PageHeader from '../../shared/ui/PageHeader'
import DataTable from '../../shared/ui/DataTable'
import StatCard from '../../shared/ui/StatCard'
import StatusBadge from '../../shared/ui/StatusBadge'

const COMP_TYPES = ['PRBC', 'PLATELET', 'PLASMA', 'CRYO']

const rhSign = (rh) => (rh === 'POSITIVE' ? '+' : rh === 'NEGATIVE' ? '−' : '')

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d) ? '—' : d.toLocaleDateString()
}

export default function StockOverview({
  inventory,
  summary,
  lowStock,
  loading,
  bgFilter,
  typeFilter,
  onBgFilterChange,
  onTypeFilterChange,
  onClearFilters,
  onView,
}) {
  // ---- Stat tiles (use whichever source is most accurate) -------------
  const availableRows = inventory.filter(i => i.status === 'AVAILABLE')
  const totalAvailableUnits = availableRows.reduce((sum, r) => sum + (r.quantity ?? 0), 0)
  const uniqueBGs = [...new Set(inventory.map(i => i.bloodGroup).filter(Boolean))]

  // ---- Filter dropdown options come from summary (covers all groups) --
  const summaryBGs = [...new Set(summary.map(s => s.bloodGroup).filter(Boolean))]

  // ---- Table data: filter the detailed inventory list -----------------
  const filteredInventory = inventory.filter(i =>
    (!bgFilter || i.bloodGroup === bgFilter) &&
    (!typeFilter || i.componentType === typeFilter)
  )

  const columns = [
    { key: 'bagNumber', label: 'Bag #', render: v => v || '—' },
    {
      key: 'bloodGroup',
      label: 'Blood Group',
      render: (v, row) => v ? `${v}${rhSign(row.rhFactor)}` : '—',
    },
    {
      key: 'componentType',
      label: 'Component',
      render: v => v ? v.replace(/_/g, ' ') : '—',
    },
    { key: 'quantity', label: 'Quantity', render: v => <strong>{v ?? 0}</strong> },
    { key: 'expiryDate', label: 'Expiry', render: formatDate },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
  ]

  return (
    <div className="animate-fadein">
      <PageHeader title="Blood Stock Overview" subtitle="Live snapshot of available inventory across all blood groups and components" />

      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <StatCard title="Total Available Units" value={totalAvailableUnits} color="primary" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Available Bags" value={availableRows.length} color="success" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Low Stock Alerts" value={lowStock.length} color="danger" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Blood Groups in Stock" value={uniqueBGs.length} color="warning" />
        </Col>
      </Row>

      {lowStock.length > 0 && (
        <div className="alert-glass error mb-4">
          ⚠️ <strong>{lowStock.length} item(s) critically low:</strong>{' '}
          {lowStock.slice(0, 5).map((l, i) => (
            <span key={l.balanceId ?? i}>
              {l.bloodGroup}{rhSign(l.rhFactor)} {l.componentType?.replace(/_/g, ' ')} ({l.quantity ?? 0} units)
              {i < Math.min(lowStock.length, 5) - 1 ? ', ' : ''}
            </span>
          ))}
          {lowStock.length > 5 && <span> +{lowStock.length - 5} more</span>}
        </div>
      )}

      <div className="filter-row mb-3">
        <select
          className="form-select"
          style={{ width: 180 }}
          value={bgFilter}
          onChange={e => onBgFilterChange(e.target.value)}
        >
          <option value="">All Blood Groups</option>
          {summaryBGs.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select
          className="form-select"
          style={{ width: 220 }}
          value={typeFilter}
          onChange={e => onTypeFilterChange(e.target.value)}
        >
          <option value="">All Component Types</option>
          {COMP_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
        {(bgFilter || typeFilter) && (
          <button className="btn btn-outline-secondary btn-sm" onClick={onClearFilters}>
            ✕ Clear
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <DataTable
          columns={columns}
          data={filteredInventory}
          loading={loading}
          actions={(row) => (
            <button
              className="btn-glass"
              style={{ fontSize: '0.75rem' }}
              onClick={() => onView?.(row)}
            >
              View
            </button>
          )}
        />
      </div>
    </div>
  )
}
