import PageHeader from '../../shared/ui/PageHeader'
import StatCard from '../../shared/ui/StatCard'
import StatusBadge from '../../shared/ui/StatusBadge'
import DsModal from '../../shared/donor-service/DsModal'
import { DsField, DsInput, DsSelect } from '../../shared/donor-service/DsField'
import { DsBtnPrimary, DsBtnGhost } from '../../shared/donor-service/DsButtons'

const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A'
const fmtDT   = (v) => v ? new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

export default function DonorDashboard({
  profile, appointments, notifications, drives,
  showBook, bookForm, onBookFormChange, onShowBook, onCloseBook, onBook,
}) {
  const nextAppt      = appointments.find(a => ['BOOKED','SCHEDULED','CHECKED_IN'].includes(a.status))
  const donationCount = appointments.filter(a => a.status === 'COMPLETED').length
  const lastDonation  = appointments
    .filter(a => a.status === 'COMPLETED')
    .sort((a, b) => new Date(b.scheduledAt || b.dateTime) - new Date(a.scheduledAt || a.dateTime))[0]

  const bloodLabel = profile
    ? `${profile.bloodGroup}${profile.rhFactor === 'POSITIVE' ? '+' : '−'}`
    : '—'

  return (
    <div className="animate-fadein">
      <PageHeader
        title={`Welcome back, ${profile?.name || 'Donor'} 👋`}
        subtitle="Your donation journey at a glance"
      />

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4">
          <StatCard title="Blood Group" value={bloodLabel} color="danger" icon="🩸" />
        </div>
        <div className="col-6 col-md-4">
          <StatCard title="Total Donations" value={donationCount} color="success" icon="💉" />
        </div>
        <div className="col-6 col-md-4">
          <StatCard title="Last Donation" value={fmtDate(lastDonation?.scheduledAt || lastDonation?.dateTime)} color="primary" icon="📅" />
        </div>
      </div>

      {/* Main cards */}
      <div className="row g-3">

        {/* Next Appointment */}
        <div className="col-md-6">
          <div className="card border shadow-sm h-100" style={{ borderRadius: 16 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">📅 Next Appointment</h6>
              {nextAppt ? (
                <>
                  <div className="rounded-3 p-3 mb-3" style={{ background: '#fff5f5', border: '1.5px solid #ffd6d6' }}>
                    <div className="fw-bold mb-1">{nextAppt.driveName || `Drive #${nextAppt.driveId}`}</div>
                    <div className="text-muted small mb-2">{fmtDT(nextAppt.scheduledAt || nextAppt.dateTime)}</div>
                    <StatusBadge status={nextAppt.status} />
                  </div>
                  <button className="btn btn-outline-secondary btn-sm w-100" onClick={onShowBook}>
                    + Book Another
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <div style={{ fontSize: '2rem' }} className="mb-2">📭</div>
                  <p className="text-muted small mb-3">No upcoming appointments.</p>
                  <button className="btn btn-danger btn-sm" onClick={onShowBook}>Book Now</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="col-md-6">
          <div className="card border shadow-sm h-100" style={{ borderRadius: 16 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">🔔 Recent Notifications</h6>
              {notifications.length === 0 ? (
                <div className="text-center py-4">
                  <div style={{ fontSize: '2rem' }} className="mb-2">🔕</div>
                  <p className="text-muted small mb-0">No new notifications.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="py-2 border-bottom">
                    <div className="small fw-semibold">{n.message}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: 2 }}>{fmtDT(n.sentAt)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <DsModal
        show={showBook}
        onClose={onCloseBook}
        title="Book Appointment"
        subtitle="Select a drive and your preferred date & time"
        footer={
          <>
            <DsBtnGhost onClick={onCloseBook}>Cancel</DsBtnGhost>
            <DsBtnPrimary onClick={onBook} disabled={!bookForm.driveId || !bookForm.scheduledAt}>
              Book Appointment
            </DsBtnPrimary>
          </>
        }
      >
        <div className="p-3 d-flex flex-column gap-3">
          <DsField label="Blood Drive" required>
            <DsSelect value={bookForm.driveId} onChange={e => onBookFormChange('driveId', e.target.value)}>
              <option value="">— Select a drive —</option>
              {drives.map(d => (
                <option key={d.driveId} value={d.driveId}>
                  {d.name || d.driveName}{d.location ? ` — ${d.location}` : ''}{d.scheduledDate ? ` (${d.scheduledDate})` : ''}
                </option>
              ))}
            </DsSelect>
          </DsField>
          <DsField label="Preferred Date & Time" required hint="Cannot be in the past">
            <DsInput
              type="datetime-local"
              value={bookForm.scheduledAt}
              onChange={e => onBookFormChange('scheduledAt', e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </DsField>
        </div>
      </DsModal>
    </div>
  )
}