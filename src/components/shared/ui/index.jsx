// StatCard
export function StatCard({ title, value, color = 'primary', icon }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="value">{value ?? '—'}</div>
      <div className="label">{title}</div>
      {icon && <i className={`bi ${icon} icon`} />}
    </div>
  )
}

// DataTable
export function DataTable({ columns = [], data = [], loading = false }) {
  if (loading) return <div className="spinner-wrap"><div className="dc-spinner" /></div>
  return (
    <div className="dc-table-wrapper">
      <div style={{ overflowX: 'auto' }}>
        <table className="dc-table">
          <thead>
            <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {data.length === 0
              ? <tr><td colSpan={columns.length}><EmptyState /></td></tr>
              : data.map((row, i) => (
                  <tr key={row.id ?? i}>
                    {columns.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}</td>)}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// StatusBadge
const STATUS_MAP = {
  ACTIVE: 'success', AVAILABLE: 'success', PASSED: 'success', COMPATIBLE: 'success', COMPLETED: 'success', RELEASED: 'success', RESOLVED: 'success', PAID: 'success',
  PENDING: 'warning', SCHEDULED: 'warning', NORMAL: 'warning', DEFERRED: 'warning', QUARANTINED: 'warning', EXPIRING_SOON: 'warning', UNDER_INVESTIGATION: 'warning', WAIVED: 'primary', NOTIFIED: 'warning', PROCESSING: 'warning',
  INACTIVE: 'danger', FAILED: 'danger', INCOMPATIBLE: 'danger', EXPIRED: 'danger', LOCKED: 'danger', FATAL: 'dark', OPEN: 'danger',
  CANCELLED: 'secondary', DISPOSED: 'secondary', LIFTED: 'success', ISSUED: 'primary', COLLECTED: 'primary', IN_PROGRESS: 'primary',
  MILD: 'success', MODERATE: 'warning', SEVERE: 'danger',
  REPORTED: 'warning', RETURNED: 'success', DISCARDED: 'secondary',
}
export function StatusBadge({ status }) {
  const color = STATUS_MAP[status] || 'secondary'
  return <span className={`dc-badge ${color}`}>{status?.replace(/_/g, ' ')}</span>
}

// PageHeader
export function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <h4>{title}</h4>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </div>
  )
}

// LoadingSpinner
export function LoadingSpinner() {
  return <div className="spinner-wrap"><div className="dc-spinner" /></div>
}

// EmptyState
export function EmptyState({ message = 'No records found.' }) {
  return (
    <div className="empty-state">
      <i className="bi bi-inbox" />
      <p>{message}</p>
    </div>
  )
}

// ConfirmModal
export function ConfirmModal({ show, onHide, onConfirm, title = 'Confirm Action', message = 'Are you sure?' }) {
  if (!show) return null
  return (
    <div className="dc-modal-overlay" onClick={onHide}>
      <div className="dc-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="dc-modal-header">
          <span className="dc-modal-title">{title}</span>
          <button className="btn-dc-icon" onClick={onHide}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="dc-modal-body" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{message}</div>
        <div className="dc-modal-footer">
          <button className="btn-dc-ghost" onClick={onHide}>Cancel</button>
          <button className="btn-dc-danger" style={{ padding: '9px 20px' }} onClick={() => { onConfirm(); onHide(); }}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

// AlertBanner (toast helpers)
import { toast } from 'react-toastify'
export const showSuccess = (msg) => toast.success(msg)
export const showError = (msg) => toast.error(msg)
export const showWarning = (msg) => toast.warning(msg)
