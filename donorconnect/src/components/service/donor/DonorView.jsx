import { StatusPill, BloodCircle } from '../../shared/donor-service/DsBadges'

const parseAddress = (raw) => {
  if (!raw) return null
  try { const a = JSON.parse(raw); if (!a.street && !a.city && !a.state && !a.pincode) return null; return a }
  catch { return null }
}
const TYPE_LABEL = { VOLUNTARY: 'Voluntary', REPLACEMENT: 'Replacement', STUDENT: 'Student', CORPORATE: 'Corporate', WALK_IN: 'Walk-in', REGULAR: 'Regular', DIRECTED: 'Directed', AUTOLOGOUS: 'Autologous' }

function InfoRow({ label, value, mono }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="mb-2">
      <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>{label}</div>
      <div className={mono ? 'font-monospace small' : 'small'}>{value}</div>
    </div>
  )
}

export default function DonorView({ donor, loading, onBack, onEdit }) {
  const address = donor ? parseAddress(donor.addressJson) : null
  const fullAddress = address ? [address.street, address.city, address.state, address.pincode].filter(Boolean).join(', ') : null
  const typeLabel = TYPE_LABEL[donor?.donorType] || donor?.donorType

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 300 }}>
        <div className="spinner-border text-danger mb-2" />
        <p className="text-muted small">Loading donor profile…</p>
      </div>
    )
  }

  if (!donor) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center gap-2" style={{ minHeight: 300 }}>
        <p className="text-muted">Donor not found.</p>
        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>← Back to Registry</button>
      </div>
    )
  }

  return (
    <div className="animate-fadein" style={{ maxWidth: 820 }}>
      {/* Top bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>← Back to Registry</button>
        <button className="btn btn-dark btn-sm" onClick={() => onEdit(donor.donorId)}>✏ Edit Donor</button>
      </div>

      {/* Hero card */}
      <div className="card border shadow-sm rounded-4 mb-3">
        <div className="card-body d-flex align-items-center justify-content-between p-4">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
              style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #c62828, #1a1a2e)', fontSize: '1.5rem' }}>
              {donor.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h4 className="fw-bold mb-1">{donor.name}</h4>
              <div className="d-flex align-items-center flex-wrap gap-2">
                <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: '0.72rem' }}>ID #{donor.donorId}</span>
                <StatusPill status={donor.status} />
                <span className="badge rounded-pill" style={{ background: '#e8f0fe', color: '#1a73e8', fontSize: '0.72rem' }}>{typeLabel}</span>
              </div>
            </div>
          </div>
          <BloodCircle group={donor.bloodGroup} rh={donor.rhFactor} size={64} />
        </div>
      </div>

      {/* Detail cards */}
      <div className="d-flex flex-column gap-3">
        <div className="card border shadow-sm">
          <div className="card-body">
            <h6 className="text-uppercase fw-bold text-muted mb-3" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>👤 Personal Information</h6>
            <div className="row row-cols-2 g-2">
              <div className="col"><InfoRow label="Full Name" value={donor.name} /></div>
              <div className="col"><InfoRow label="Date of Birth" value={donor.dob || donor.dateOfBirth} /></div>
              <div className="col"><InfoRow label="Gender" value={donor.gender} /></div>
              <div className="col"><InfoRow label="Contact" value={donor.contactInfo} /></div>
            </div>
          </div>
        </div>

        <div className="card border shadow-sm">
          <div className="card-body">
            <h6 className="text-uppercase fw-bold text-muted mb-3" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>🩸 Blood Information</h6>
            <div className="row row-cols-2 g-2">
              <div className="col"><InfoRow label="Blood Group" value={donor.bloodGroup} /></div>
              <div className="col"><InfoRow label="Rh Factor" value={donor.rhFactor} /></div>
              <div className="col"><InfoRow label="Donor Type" value={typeLabel} /></div>
              <div className="col">
                <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>Status</div>
                <div className="small mt-1"><StatusPill status={donor.status} /></div>
              </div>
            </div>
          </div>
        </div>

        {address && (
          <div className="card border shadow-sm">
            <div className="card-body">
              <h6 className="text-uppercase fw-bold text-muted mb-3" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>📍 Address</h6>
              <div className="row row-cols-2 g-2">
                <div className="col"><InfoRow label="Street" value={address.street} /></div>
                <div className="col"><InfoRow label="City" value={address.city} /></div>
                <div className="col"><InfoRow label="State" value={address.state} /></div>
                <div className="col"><InfoRow label="Pincode" value={address.pincode} mono /></div>
              </div>
              {fullAddress && (
                <div className="d-flex align-items-start gap-2 mt-2 pt-2 border-top text-secondary small">
                  <span>🗺</span>{fullAddress}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="d-flex justify-content-end mt-3 pt-3 border-top">
        <button className="btn btn-danger" onClick={() => onEdit(donor.donorId)}>✏ Edit This Donor</button>
      </div>
    </div>
  )
}