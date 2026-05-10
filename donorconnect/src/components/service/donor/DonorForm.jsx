import { DsField, DsInput, DsSelect } from '../../shared/donor-service/DsField'
import { DsBtnPrimary, DsBtnGhost } from '../../shared/donor-service/DsButtons'

const BLOOD_GROUPS = ['A', 'B', 'AB', 'O']
const RH_FACTORS   = ['POSITIVE', 'NEGATIVE']
const GENDERS      = ['MALE', 'FEMALE', 'OTHER']
const DONOR_TYPES  = ['VOLUNTARY', 'REPLACEMENT', 'STUDENT', 'CORPORATE']
const TYPE_LABELS  = { VOLUNTARY: 'Voluntary', REPLACEMENT: 'Replacement', STUDENT: 'Student', CORPORATE: 'Corporate' }
const BLOOD_COLOR  = { 'A+': '#e53935', 'A−': '#ef9a9a', 'B+': '#e65100', 'B−': '#ffb74d', 'AB+': '#6a1b9a', 'AB−': '#ba68c8', 'O+': '#1565c0', 'O−': '#64b5f6' }

export default function DonorForm({ donorId, form, address, loading, fetching, onFormChange, onAddressChange, onSubmit, onCancel }) {
  const isEdit = !!donorId
  const bloodLabel = form.bloodGroup + (form.rhFactor === 'POSITIVE' ? '+' : '−')
  const bloodBg = BLOOD_COLOR[bloodLabel] || '#c62828'

  if (fetching) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 260 }}>
        <div className="spinner-border text-danger mb-2" />
        <p className="text-muted small">Loading donor profile…</p>
      </div>
    )
  }

  return (
    <div className="animate-fadein" style={{ maxWidth: 820 }}>
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-4">
        <div className="d-flex align-items-start gap-3">
          <button className="btn btn-outline-secondary btn-sm mt-1" onClick={onCancel} type="button">← Back</button>
          <div>
            <h4 className="fw-bold mb-1">{isEdit ? 'Edit Donor Profile' : 'Register New Donor'}</h4>
            <p className="text-muted small mb-0">{isEdit ? 'Update donor information below' : 'Complete all required fields to register a new donor'}</p>
          </div>
        </div>
        {form.bloodGroup && (
          <span className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style={{ width: 56, height: 56, background: bloodBg, fontSize: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
            {bloodLabel}
          </span>
        )}
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div className="d-flex flex-column gap-3">

          {/* Personal Info */}
          <div className="card border shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">👤 Personal Information</h6>
              <div className="row g-3">
                <div className="col-md-6"><DsField label="Full Name" required><DsInput value={form.name} onChange={e => onFormChange('name', e.target.value)} placeholder="e.g. Arjun Sharma" required /></DsField></div>
                <div className="col-md-6"><DsField label="Date of Birth"><DsInput type="date" value={form.dob} onChange={e => onFormChange('dob', e.target.value)} max={new Date().toISOString().split('T')[0]} /></DsField></div>
                <div className="col-md-6"><DsField label="Gender"><DsSelect value={form.gender} onChange={e => onFormChange('gender', e.target.value)}>{GENDERS.map(g => <option key={g}>{g}</option>)}</DsSelect></DsField></div>
                <div className="col-md-6"><DsField label="Contact Number"><DsInput type="tel" value={form.contactInfo} onChange={e => onFormChange('contactInfo', e.target.value)} placeholder="+91 98765 43210" /></DsField></div>
              </div>
            </div>
          </div>

          {/* Blood Info */}
          <div className="card border shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">🩸 Blood Information</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-4"><DsField label="Blood Group" required><DsSelect value={form.bloodGroup} onChange={e => onFormChange('bloodGroup', e.target.value)}>{BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}</DsSelect></DsField></div>
                <div className="col-md-4"><DsField label="Rh Factor" required><DsSelect value={form.rhFactor} onChange={e => onFormChange('rhFactor', e.target.value)}>{RH_FACTORS.map(r => <option key={r}>{r}</option>)}</DsSelect></DsField></div>
                <div className="col-md-4"><DsField label="Donor Type"><DsSelect value={form.donorType} onChange={e => onFormChange('donorType', e.target.value)}>{DONOR_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}</DsSelect></DsField></div>
              </div>
              <div className="border-top pt-3">
                <p className="text-muted small text-uppercase fw-semibold mb-2" style={{ letterSpacing: '0.5px' }}>Blood Type Quick Select</p>
                <div className="d-flex flex-wrap gap-1">
                  {BLOOD_GROUPS.flatMap(g => ['POSITIVE', 'NEGATIVE'].map(rh => {
                    const active = form.bloodGroup === g && form.rhFactor === rh
                    return (
                      <button key={g+rh} type="button"
                        className={`btn btn-sm rounded-pill ${active ? 'btn-danger' : 'btn-outline-secondary'}`}
                        style={{ fontSize: '0.8rem' }}
                        onClick={() => { onFormChange('bloodGroup', g); onFormChange('rhFactor', rh) }}>
                        {g}{rh === 'POSITIVE' ? '+' : '−'}
                      </button>
                    )
                  }))}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="card border shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">📍 Address Details</h6>
              <div className="row g-3">
                <div className="col-12"><DsField label="Street Address"><DsInput value={address.street} onChange={e => onAddressChange('street', e.target.value)} placeholder="123, Main Street, Apartment 4B" /></DsField></div>
                <div className="col-md-4"><DsField label="City"><DsInput value={address.city} onChange={e => onAddressChange('city', e.target.value)} placeholder="Chennai" /></DsField></div>
                <div className="col-md-4"><DsField label="State"><DsInput value={address.state} onChange={e => onAddressChange('state', e.target.value)} placeholder="Tamil Nadu" /></DsField></div>
                <div className="col-md-4"><DsField label="Pincode"><DsInput value={address.pincode} onChange={e => onAddressChange('pincode', e.target.value)} placeholder="600001" maxLength={6} pattern="[0-9]{6}" /></DsField></div>
              </div>
              <details className="mt-3">
                <summary className="text-muted small" style={{ cursor: 'pointer' }}>View raw addressJson payload</summary>
                <pre className="bg-dark text-info rounded p-2 mt-2 small">{JSON.stringify(address, null, 2)}</pre>
              </details>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
          <DsBtnGhost type="button" onClick={onCancel} disabled={loading}>Cancel</DsBtnGhost>
          <DsBtnPrimary type="submit" loading={loading} loadingText={isEdit ? 'Saving…' : 'Registering…'} disabled={!form.name.trim()}>
            {isEdit ? '✓ Save Changes' : '＋ Register Donor'}
          </DsBtnPrimary>
        </div>
      </form>
    </div>
  )
}