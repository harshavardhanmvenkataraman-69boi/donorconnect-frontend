/**
 * DsBadges — Bootstrap 5 badge/pill components for donor-service.
 * No custom CSS. Uses Bootstrap utility classes + minimal inline style for colour data.
 */

// ─── Status config (colours only — layout from Bootstrap) ────────────────────
const STATUS_MAP = {
  // Donor
  ACTIVE:      { bg: '#e8f5e9', color: '#1b5e20', dot: '#43a047' },
  DEFERRED:    { bg: '#fff3e0', color: '#e65100', dot: '#fb8c00' },
  BLACKLISTED: { bg: '#ffebee', color: '#b71c1c', dot: '#e53935' },
  INACTIVE:    { bg: '#f5f5f5', color: '#555',    dot: '#9e9e9e' },
  // Deferral
  LIFTED:      { bg: '#e3f2fd', color: '#1565c0', dot: '#42a5f5', label: 'Lifted'  },
  EXPIRED:     { bg: '#f5f5f5', color: '#555',    dot: '#9e9e9e', label: 'Expired' },
  // Appointment
  BOOKED:      { bg: '#e3f2fd', color: '#1565c0', dot: '#42a5f5', label: 'Booked'     },
  CHECKED_IN:  { bg: '#fff3e0', color: '#e65100', dot: '#fb8c00', label: 'Checked In' },
  COMPLETED:   { bg: '#e8f5e9', color: '#1b5e20', dot: '#43a047', label: 'Completed'  },
  CANCELLED:   { bg: '#f5f5f5', color: '#555',    dot: '#9e9e9e', label: 'Cancelled'  },
  NO_SHOW:     { bg: '#ffebee', color: '#b71c1c', dot: '#e53935', label: 'No Show'    },
  // Drive
  PLANNED:     { bg: '#e3f2fd', color: '#1565c0', dot: '#42a5f5', label: 'Planned'   },
  // ACTIVE and COMPLETED already defined above — Drive reuses them
}

export function StatusPill({ status }) {
  const cfg = STATUS_MAP[status]
  if (!cfg) return <span className="text-muted small">{status || '—'}</span>
  return (
    <span className="badge rounded-pill d-inline-flex align-items-center gap-1 text-uppercase fw-semibold"
      style={{ background: cfg.bg, color: cfg.color, fontSize: '0.7rem', letterSpacing: '0.4px' }}>
      <span className="rounded-circle flex-shrink-0"
        style={{ width: 6, height: 6, background: cfg.dot, display: 'inline-block' }} />
      {cfg.label || status}
    </span>
  )
}

const BLOOD_COLOR = {
  'A+': '#e53935', 'A−': '#ef9a9a', 'B+': '#e65100', 'B−': '#ffb74d',
  'AB+': '#6a1b9a', 'AB−': '#ba68c8', 'O+': '#1565c0', 'O−': '#64b5f6',
}

export function BloodCircle({ group, rh, size = 36 }) {
  if (!group) return <span className="text-muted">—</span>
  const label = group + (rh === 'POSITIVE' ? '+' : '−')
  return (
    <span className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
      style={{
        width: size, height: size,
        background: BLOOD_COLOR[label] || '#c62828',
        color: 'white',
        fontSize: size > 40 ? '1.05rem' : '0.75rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
      }}>
      {label}
    </span>
  )
}

const TYPE_COLOR = {
  TEMPORARY: { bg: '#fff3e0', color: '#e65100' },
  PERMANENT: { bg: '#ffebee', color: '#b71c1c' },
}

export function TypeBadge({ type }) {
  const cfg = TYPE_COLOR[type] || TYPE_COLOR.TEMPORARY
  return (
    <span className="badge rounded-pill fw-bold text-uppercase"
      style={{ background: cfg.bg, color: cfg.color, fontSize: '0.7rem', letterSpacing: '0.4px' }}>
      {type}
    </span>
  )
}

export function ClearedBadge({ cleared }) {
  return (
    <span className={`badge rounded-pill fw-bold ${cleared ? 'text-success' : 'text-danger'}`}
      style={{ background: cleared ? '#e8f5e9' : '#ffebee', fontSize: '0.72rem' }}>
      {cleared ? '✓ Cleared' : '✕ Not Cleared'}
    </span>
  )
}