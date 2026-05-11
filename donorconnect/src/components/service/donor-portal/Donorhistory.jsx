import PageHeader from '../../shared/ui/PageHeader'
import DataTable from '../../shared/ui/DataTable'
import StatusBadge from '../../shared/ui/StatusBadge'
import DsModal from '../../shared/donor-service/DsModal'
import { DsBtnPrimary, DsBtnGhost, DsBtnInline } from '../../shared/donor-service/DsButtons'

const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'
const fmtDT   = (v) => v ? new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const TABS = [
  { key: 'appointments', label: 'Appointments' },
  { key: 'donations',    label: 'Donations'    },
]

export default function DonorHistory({
  appointments, donations, loading, tab, confirm,
  onTabChange, onCancelRequest, onCancelConfirm, onCancelDismiss,
}) {
  const apptCols = [
    { key: 'appointmentId', label: 'ID',
      render: v => <code className="text-muted small">#{v || '—'}</code> },
    { key: 'driveId', label: 'Drive',
      render: v => v
        ? <code className="small">#{v}</code>
        : <span className="text-muted fst-italic small">Walk-in</span> },
    { key: 'dateTime', label: 'Scheduled At',
      render: (v, row) => <span className="small text-secondary">{fmtDT(v || row.scheduledAt)}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
  ]

  const donCols = [
    { key: 'id', label: 'Donation ID',
      render: v => <code className="text-muted small">#{v}</code> },
    { key: 'donatedAt', label: 'Date',
      render: v => <span className="small text-secondary">{fmtDate(v)}</span> },
    { key: 'volumeMl', label: 'Volume (ml)' },
    { key: 'collectionStatus', label: 'Status', render: v => <StatusBadge status={v} /> },
  ]

  return (
    <div className="animate-fadein">
      <PageHeader title="My Donation History" />

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {TABS.map(t => (
          <li key={t.key} className="nav-item">
            <button
              className={`nav-link${tab === t.key ? ' active' : ''}`}
              onClick={() => onTabChange(t.key)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {tab === 'appointments' ? (
        <div className="table-wrapper">
          <DataTable
            columns={apptCols}
            data={appointments}
            loading={loading}
            actions={row =>
              row.status === 'SCHEDULED' || row.status === 'BOOKED' ? (
                <DsBtnInline variant="red" onClick={() => onCancelRequest(row.appointmentId || row.id)}>
                  ✕ Cancel
                </DsBtnInline>
              ) : null
            }
          />
        </div>
      ) : donations.length === 0 && !loading ? (
        <div className="card border text-center p-5" style={{ borderRadius: 16 }}>
          <div style={{ fontSize: '2.2rem' }} className="mb-2">🩸</div>
          <p className="text-muted small mb-0">
            Donation history coming soon. Contact your blood bank for records.
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <DataTable columns={donCols} data={donations} loading={loading} />
        </div>
      )}

      {/* Cancel Confirm Modal */}
      <DsModal
        show={!!confirm}
        onClose={onCancelDismiss}
        title="Cancel Appointment"
        size="sm"
        footer={
          <>
            <DsBtnGhost onClick={onCancelDismiss}>No, keep it</DsBtnGhost>
            <DsBtnPrimary onClick={onCancelConfirm}>Yes, cancel</DsBtnPrimary>
          </>
        }
      >
        <p className="p-3 mb-0 text-secondary">
          Are you sure you want to cancel this appointment? This action cannot be undone.
        </p>
      </DsModal>
    </div>
  )
}