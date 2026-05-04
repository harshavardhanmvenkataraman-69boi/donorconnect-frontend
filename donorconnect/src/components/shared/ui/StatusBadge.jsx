const STATUS_MAP = {
  ACTIVE: 'success', AVAILABLE: 'success', PASSED: 'success', COMPATIBLE: 'success', COMPLETED: 'success',
  COLLECTED: 'primary', COLLECTED_PROCESSING: 'warning',
  PENDING: 'warning', SCHEDULED: 'primary', NORMAL: 'primary', PROCESSING: 'warning',
  DEFERRED: 'warning', QUARANTINED: 'warning', EXPIRING_SOON: 'warning',
  INACTIVE: 'secondary', FAILED: 'danger', INCOMPATIBLE: 'danger', EXPIRED: 'secondary', LOCKED: 'danger',
  CANCELLED: 'secondary', DISPOSED: 'secondary', ISSUED: 'primary',
  RETURNED: 'success', DISCARDED: 'secondary',
  MILD: 'success', MODERATE: 'warning', SEVERE: 'danger', FATAL: 'dark',
  REPORTED: 'warning', UNDER_INVESTIGATION: 'primary', RESOLVED: 'success',
  PAID: 'success', WAIVED: 'primary', OPEN: 'danger', NOTIFIED: 'warning',
  IN_PROGRESS: 'primary', PLANNED: 'primary',
  EMERGENCY: 'danger', URGENT: 'warning', ROUTINE: 'primary',
};

export default function StatusBadge({ status }) {
  const variant = STATUS_MAP[status] || 'secondary';
  return <span className={`status-badge ${variant}`}>{status?.replace(/_/g, ' ')}</span>;
}
