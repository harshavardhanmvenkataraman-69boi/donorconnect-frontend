// import { DsField, DsInput, DsSelect } from '../../shared/donor-service/DsField'
// import { DsBtnPrimary, DsBtnGhost } from '../../shared/donor-service/DsButtons'

// const BLOOD_GROUPS = ['A', 'B', 'AB', 'O']
// const RH_FACTORS   = ['POSITIVE', 'NEGATIVE']
// const GENDERS      = ['MALE', 'FEMALE', 'OTHER']
// const DONOR_TYPES  = ['VOLUNTARY', 'REPLACEMENT', 'STUDENT', 'CORPORATE']
// const TYPE_LABELS  = { VOLUNTARY: 'Voluntary', REPLACEMENT: 'Replacement', STUDENT: 'Student', CORPORATE: 'Corporate' }
// const BLOOD_COLOR  = { 'A+': '#e53935', 'A−': '#ef9a9a', 'B+': '#e65100', 'B−': '#ffb74d', 'AB+': '#6a1b9a', 'AB−': '#ba68c8', 'O+': '#1565c0', 'O−': '#64b5f6' }

// // Required fields and their labels
// const REQUIRED = [
//   { key: 'name',        label: 'Full Name',     check: f => !!f.name?.trim() },
//   { key: 'dob',         label: 'Date of Birth', check: f => !!f.dob },
//   { key: 'gender',      label: 'Gender',        check: f => !!f.gender },
//   { key: 'contactInfo', label: 'Contact',       check: f => !!f.contactInfo?.trim() },
//   { key: 'bloodGroup',  label: 'Blood Group',   check: f => !!f.bloodGroup },
//   { key: 'rhFactor',    label: 'Rh Factor',     check: f => !!f.rhFactor },
//   { key: 'donorType',   label: 'Donor Type',    check: f => !!f.donorType },
// ]
// const REQUIRED_ADDR = [
//   { key: 'city',    label: 'City',    check: a => !!a.city?.trim() },
//   { key: 'state',   label: 'State',   check: a => !!a.state?.trim() },
//   { key: 'pincode', label: 'Pincode', check: a => !!a.pincode?.trim() },
// ]

// export default function DonorForm({ donorId, form, address, loading, fetching, onFormChange, onAddressChange, onSubmit, onCancel }) {
//   const isEdit     = !!donorId
//   const bloodLabel = form.bloodGroup + (form.rhFactor === 'POSITIVE' ? '+' : '−')
//   const bloodBg    = BLOOD_COLOR[bloodLabel] || '#c62828'

//   // Check which required fields are missing
//   const missingFields = [
//     ...REQUIRED.filter(r => !r.check(form)).map(r => r.label),
//     ...REQUIRED_ADDR.filter(r => !r.check(address)).map(r => r.label),
//   ]
//   const allFilled = missingFields.length === 0

//   // Progress pct
//   const totalRequired = REQUIRED.length + REQUIRED_ADDR.length
//   const filledCount   = totalRequired - missingFields.length
//   const pct           = Math.round((filledCount / totalRequired) * 100)

//   if (fetching) {
//     return (
//       <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 260 }}>
//         <div className="spinner-border text-danger mb-2" />
//         <p className="text-muted small">Loading donor profile…</p>
//       </div>
//     )
//   }

//   return (
//     <div className="animate-fadein" style={{ maxWidth: 820 }}>

//       {/* Header */}
//       <div className="d-flex align-items-start justify-content-between mb-3">
//         <div className="d-flex align-items-start gap-3">
//           <button className="btn btn-outline-secondary btn-sm mt-1" onClick={onCancel} type="button">← Back</button>
//           <div>
//             <h4 className="fw-bold mb-1">{isEdit ? 'Edit Donor Profile' : 'Register New Donor'}</h4>
//             <p className="text-muted small mb-0">{isEdit ? 'Update donor information below' : 'Complete all required fields to register a new donor'}</p>
//           </div>
//         </div>
//         {form.bloodGroup && (
//           <span className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
//             style={{ width: 56, height: 56, background: bloodBg, fontSize: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', transition: 'background 0.3s' }}>
//             {bloodLabel}
//           </span>
//         )}
//       </div>

//       {/* Progress bar — live, updates on every keystroke */}
//       <div style={{ marginBottom: '1.25rem' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
//           <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>Form Progress</span>
//           <span style={{ fontSize: '0.75rem', color: pct === 100 ? '#2e7d32' : '#888', fontWeight: 700 }}>{pct}%</span>
//         </div>
//         <div style={{ height: 6, borderRadius: 20, background: '#e8e8e8', overflow: 'hidden' }}>
//           <div style={{
//             height: '100%', width: `${pct}%`, borderRadius: 20,
//             background: 'linear-gradient(90deg, #43a047, #2e7d32)',
//             transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//           }} />
//         </div>
//         {!allFilled && missingFields.length <= 3 && (
//           <p style={{ fontSize: '0.72rem', color: '#bbb', margin: '5px 0 0' }}>
//             Still needed: {missingFields.join(', ')}
//           </p>
//         )}
//       </div>

//       <form onSubmit={onSubmit} noValidate>
//         <div className="d-flex flex-column gap-3">

//           {/* Personal Info */}
//           <div className="card border shadow-sm">
//             <div className="card-body">
//               <h6 className="fw-bold mb-3">👤 Personal Information</h6>
//               <div className="row g-3">
//                 <div className="col-md-6">
//                   <DsField label="Full Name" required>
//                     <DsInput value={form.name} onChange={e => onFormChange('name', e.target.value)} placeholder="e.g. Arjun Sharma"
//                       style={!form.name?.trim() ? { borderColor: '#ffcdd2' } : {}} />
//                   </DsField>
//                 </div>
//                 <div className="col-md-6">
//                   <DsField label="Date of Birth" required>
//                     <DsInput type="date" value={form.dob} onChange={e => onFormChange('dob', e.target.value)}
//                       max={new Date().toISOString().split('T')[0]}
//                       style={!form.dob ? { borderColor: '#ffcdd2' } : {}} />
//                   </DsField>
//                 </div>
//                 <div className="col-md-6">
//                   <DsField label="Gender" required>
//                     <DsSelect value={form.gender} onChange={e => onFormChange('gender', e.target.value)}>
//                       {GENDERS.map(g => <option key={g}>{g}</option>)}
//                     </DsSelect>
//                   </DsField>
//                 </div>
//                 <div className="col-md-6">
//                   <DsField label="Contact Number" required>
//                     <DsInput type="tel" value={form.contactInfo} onChange={e => onFormChange('contactInfo', e.target.value)}
//                       placeholder="+91 98765 43210"
//                       style={!form.contactInfo?.trim() ? { borderColor: '#ffcdd2' } : {}} />
//                   </DsField>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Blood Info */}
//           <div className="card border shadow-sm">
//             <div className="card-body">
//               <h6 className="fw-bold mb-3">🩸 Blood Information</h6>
//               <div className="row g-3 mb-3">
//                 <div className="col-md-4">
//                   <DsField label="Blood Group" required>
//                     <DsSelect value={form.bloodGroup} onChange={e => onFormChange('bloodGroup', e.target.value)}>
//                       {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
//                     </DsSelect>
//                   </DsField>
//                 </div>
//                 <div className="col-md-4">
//                   <DsField label="Rh Factor" required>
//                     <DsSelect value={form.rhFactor} onChange={e => onFormChange('rhFactor', e.target.value)}>
//                       {RH_FACTORS.map(r => <option key={r}>{r}</option>)}
//                     </DsSelect>
//                   </DsField>
//                 </div>
//                 <div className="col-md-4">
//                   <DsField label="Donor Type" required>
//                     <DsSelect value={form.donorType} onChange={e => onFormChange('donorType', e.target.value)}>
//                       {DONOR_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
//                     </DsSelect>
//                   </DsField>
//                 </div>
//               </div>
//               <div className="border-top pt-3">
//                 <p className="text-muted small text-uppercase fw-semibold mb-2" style={{ letterSpacing: '0.5px' }}>Blood Type Quick Select</p>
//                 <div className="d-flex flex-wrap gap-1">
//                   {BLOOD_GROUPS.flatMap(g => ['POSITIVE', 'NEGATIVE'].map(rh => {
//                     const active = form.bloodGroup === g && form.rhFactor === rh
//                     return (
//                       <button key={g+rh} type="button"
//                         className={`btn btn-sm rounded-pill ${active ? 'btn-danger' : 'btn-outline-secondary'}`}
//                         style={{ fontSize: '0.8rem' }}
//                         onClick={() => { onFormChange('bloodGroup', g); onFormChange('rhFactor', rh) }}>
//                         {g}{rh === 'POSITIVE' ? '+' : '−'}
//                       </button>
//                     )
//                   }))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Address */}
//           <div className="card border shadow-sm">
//             <div className="card-body">
//               <h6 className="fw-bold mb-3">📍 Address Details</h6>
//               <div className="row g-3">
//                 <div className="col-12">
//                   <DsField label="Street Address">
//                     <DsInput value={address.street} onChange={e => onAddressChange('street', e.target.value)} placeholder="123, Main Street, Apartment 4B" />
//                   </DsField>
//                 </div>
//                 <div className="col-md-4">
//                   <DsField label="City" required>
//                     <DsInput value={address.city} onChange={e => onAddressChange('city', e.target.value)} placeholder="Chennai"
//                       style={!address.city?.trim() ? { borderColor: '#ffcdd2' } : {}} />
//                   </DsField>
//                 </div>
//                 <div className="col-md-4">
//                   <DsField label="State" required>
//                     <DsInput value={address.state} onChange={e => onAddressChange('state', e.target.value)} placeholder="Tamil Nadu"
//                       style={!address.state?.trim() ? { borderColor: '#ffcdd2' } : {}} />
//                   </DsField>
//                 </div>
//                 <div className="col-md-4">
//                   <DsField label="Pincode" required>
//                     <DsInput value={address.pincode} onChange={e => onAddressChange('pincode', e.target.value)} placeholder="600001"
//                       maxLength={6} pattern="[0-9]{6}"
//                       style={!address.pincode?.trim() ? { borderColor: '#ffcdd2' } : {}} />
//                   </DsField>
//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>

//         {/* Missing fields warning before submit */}
//         {!allFilled && (
//           <div style={{ marginTop: '0.75rem', background: '#fff3e0', border: '1.5px solid #ffe0b2', borderRadius: 10, padding: '0.6rem 1rem', fontSize: '0.78rem', color: '#e65100' }}>
//             ⚠ Please fill in all required fields before submitting: <strong>{missingFields.join(', ')}</strong>
//           </div>
//         )}

//         <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
//           <DsBtnGhost type="button" onClick={onCancel} disabled={loading}>Cancel</DsBtnGhost>
//           <DsBtnPrimary type="submit" loading={loading}
//             loadingText={isEdit ? 'Saving…' : 'Registering…'}
//             disabled={!allFilled}>
//             {isEdit ? '✓ Save Changes' : '＋ Register Donor'}
//           </DsBtnPrimary>
//         </div>
//       </form>
//     </div>
//   )
// }

import { DsField, DsInput, DsSelect } from '../../shared/donor-service/DsField'
import { DsBtnPrimary, DsBtnGhost } from '../../shared/donor-service/DsButtons'

const BLOOD_GROUPS = ['A', 'B', 'AB', 'O']
const RH_FACTORS   = ['POSITIVE', 'NEGATIVE']
const GENDERS      = ['MALE', 'FEMALE', 'OTHER']
const DONOR_TYPES  = ['VOLUNTARY', 'REPLACEMENT', 'STUDENT', 'CORPORATE']
const TYPE_LABELS  = { VOLUNTARY: 'Voluntary', REPLACEMENT: 'Replacement', STUDENT: 'Student', CORPORATE: 'Corporate' }
const BLOOD_COLOR  = { 'A+': '#e53935', 'A−': '#ef9a9a', 'B+': '#e65100', 'B−': '#ffb74d', 'AB+': '#6a1b9a', 'AB−': '#ba68c8', 'O+': '#1565c0', 'O−': '#64b5f6' }

// ── Validation rules ──────────────────────────────────────────────────────────
// Indian mobile: starts with 6/7/8/9, exactly 10 digits (spaces/dashes allowed)
const INDIAN_PHONE_RE = /^(?:\+91[-\s]?)?[6-9]\d{9}$/

// Indian pincode: exactly 6 digits, starts with 1-9 (no 0 prefix)
const INDIAN_PINCODE_RE = /^[1-9][0-9]{5}$/

export const validatePhone = (val) => {
  if (!val?.trim()) return 'Contact number is required'
  const digits = val.replace(/[\s\-()]/g, '').replace(/^\+91/, '')
  if (!/^\d+$/.test(digits))      return 'Only digits, spaces, dashes and +91 are allowed'
  if (digits.length !== 10)       return 'Must be exactly 10 digits'
  if (!/^[6-9]/.test(digits))     return 'Indian mobile numbers start with 6, 7, 8 or 9'
  return null // null = valid
}

export const validatePincode = (val) => {
  if (!val?.trim())                return 'Pincode is required'
  if (!/^\d+$/.test(val))         return 'Pincode must contain only digits'
  if (val.length !== 6)            return 'Pincode must be exactly 6 digits'
  if (!INDIAN_PINCODE_RE.test(val)) return 'Invalid Indian pincode (cannot start with 0)'
  return null
}
// ─────────────────────────────────────────────────────────────────────────────

// Required fields and their labels
const REQUIRED = [
  { key: 'name',        label: 'Full Name',     check: f => !!f.name?.trim() },
  { key: 'dob',         label: 'Date of Birth (must be 18+)', check: f => {
    if (!f.dob) return false
    const age = (Date.now() - new Date(f.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    return age >= 18
  }},
  { key: 'gender',      label: 'Gender',        check: f => !!f.gender },
  { key: 'contactInfo', label: 'Contact',       check: f => !!f.contactInfo?.trim() },
  { key: 'bloodGroup',  label: 'Blood Group',   check: f => !!f.bloodGroup },
  { key: 'rhFactor',    label: 'Rh Factor',     check: f => !!f.rhFactor },
  { key: 'donorType',   label: 'Donor Type',    check: f => !!f.donorType },
]
const REQUIRED_ADDR = [
  { key: 'city',    label: 'City',    check: a => !!a.city?.trim() },
  { key: 'state',   label: 'State',   check: a => !!a.state?.trim() },
  { key: 'pincode', label: 'Pincode', check: a => !!a.pincode?.trim() },
]

export default function DonorForm({ donorId, form, address, loading, fetching, onFormChange, onAddressChange, onSubmit, onCancel }) {
  const isEdit     = !!donorId
  const bloodLabel = form.bloodGroup + (form.rhFactor === 'POSITIVE' ? '+' : '−')
  const bloodBg    = BLOOD_COLOR[bloodLabel] || '#c62828'

  const missingFields = [
    ...REQUIRED.filter(r => !r.check(form)).map(r => r.label),
    ...REQUIRED_ADDR.filter(r => !r.check(address)).map(r => r.label),
    // Strict format validation — these block submit even if field is non-empty
    ...(validatePhone(form.contactInfo) ? ['Valid Contact Number'] : []),
    ...(validatePincode(address.pincode) ? ['Valid Pincode'] : []),
  ]
  const allFilled = missingFields.length === 0

  const totalRequired = REQUIRED.length + REQUIRED_ADDR.length
  const filledCount   = totalRequired - missingFields.length
  const pct           = Math.round((filledCount / totalRequired) * 100)

  const maxDob = new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

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
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div className="d-flex align-items-start gap-3">
          <button className="btn btn-outline-secondary btn-sm mt-1" onClick={onCancel} type="button">← Back</button>
          <div>
            <h4 className="fw-bold mb-1">{isEdit ? 'Edit Donor Profile' : 'Register New Donor'}</h4>
            <p className="text-muted small mb-0">{isEdit ? 'Update donor information below' : 'Complete all required fields to register a new donor'}</p>
          </div>
        </div>
        {form.bloodGroup && (
          <span className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style={{ width: 56, height: 56, background: bloodBg, fontSize: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', transition: 'background 0.3s' }}>
            {bloodLabel}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>Form Progress</span>
          <span style={{ fontSize: '0.75rem', color: pct === 100 ? '#2e7d32' : '#888', fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 20, background: '#e8e8e8', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 20,
            background: 'linear-gradient(90deg, #43a047, #2e7d32)',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
        {!allFilled && missingFields.length <= 3 && (
          <p style={{ fontSize: '0.72rem', color: '#bbb', margin: '5px 0 0' }}>
            Still needed: {missingFields.join(', ')}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div className="d-flex flex-column gap-3">

          {/* Personal Info */}
          <div className="card border shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">👤 Personal Information</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <DsField label="Full Name" required>
                    <DsInput
                      value={form.name}
                      onChange={e => onFormChange('name', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                      placeholder="e.g. Arjun Sharma"
                      style={!form.name?.trim() ? { borderColor: '#ffcdd2' } : {}}
                    />
                  </DsField>
                </div>
                <div className="col-md-6">
                  <DsField label="Date of Birth" required hint="Donor must be at least 18 years old">
                    <DsInput
                      type="date"
                      value={form.dob}
                      onChange={e => onFormChange('dob', e.target.value)}
                      max={maxDob}
                      style={!form.dob || (Date.now() - new Date(form.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000) < 18 ? { borderColor: '#ffcdd2' } : {}}
                    />
                  </DsField>
                </div>
                <div className="col-md-6">
                  <DsField label="Gender" required>
                    <DsSelect value={form.gender} onChange={e => onFormChange('gender', e.target.value)}>
                      {GENDERS.map(g => <option key={g}>{g}</option>)}
                    </DsSelect>
                  </DsField>
                </div>
                <div className="col-md-6">
                  <DsField label="Contact Number" required>
                    <DsInput type="tel" value={form.contactInfo}
                      onChange={e => onFormChange('contactInfo', e.target.value)}
                      placeholder="+91 98765 43210 or 9876543210"
                      maxLength={14}
                      style={validatePhone(form.contactInfo) && form.contactInfo ? { borderColor: '#e53935' } :
                             !form.contactInfo?.trim() ? { borderColor: '#ffcdd2' } : { borderColor: '#43a047' }} />
                    {form.contactInfo && validatePhone(form.contactInfo) && (
                      <div style={{ fontSize:'0.72rem', color:'#e53935', marginTop:4, display:'flex', alignItems:'center', gap:4 }}>
                        ⚠ {validatePhone(form.contactInfo)}
                      </div>
                    )}
                    {form.contactInfo && !validatePhone(form.contactInfo) && (
                      <div style={{ fontSize:'0.72rem', color:'#43a047', marginTop:4 }}>✓ Valid Indian mobile number</div>
                    )}
                  </DsField>
                </div>
              </div>
            </div>
          </div>

          {/* Blood Info */}
          <div className="card border shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">🩸 Blood Information</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <DsField label="Blood Group" required>
                    <DsSelect value={form.bloodGroup} onChange={e => onFormChange('bloodGroup', e.target.value)}>
                      {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                    </DsSelect>
                  </DsField>
                </div>
                <div className="col-md-4">
                  <DsField label="Rh Factor" required>
                    <DsSelect value={form.rhFactor} onChange={e => onFormChange('rhFactor', e.target.value)}>
                      {RH_FACTORS.map(r => <option key={r}>{r}</option>)}
                    </DsSelect>
                  </DsField>
                </div>
                <div className="col-md-4">
                  <DsField label="Donor Type" required>
                    <DsSelect value={form.donorType} onChange={e => onFormChange('donorType', e.target.value)}>
                      {DONOR_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                    </DsSelect>
                  </DsField>
                </div>
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
                <div className="col-12">
                  <DsField label="Street Address">
                    <DsInput value={address.street} onChange={e => onAddressChange('street', e.target.value)} placeholder="123, Main Street, Apartment 4B" />
                  </DsField>
                </div>
                <div className="col-md-4">
                  <DsField label="City" required>
                    <DsInput
                      value={address.city}
                      onChange={e => onAddressChange('city', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                      placeholder="Chennai"
                      style={!address.city?.trim() ? { borderColor: '#ffcdd2' } : {}}
                    />
                  </DsField>
                </div>
                <div className="col-md-4">
                  <DsField label="State" required>
                    <DsInput
                      value={address.state}
                      onChange={e => onAddressChange('state', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                      placeholder="Tamil Nadu"
                      style={!address.state?.trim() ? { borderColor: '#ffcdd2' } : {}}
                    />
                  </DsField>
                </div>
                <div className="col-md-4">
                  <DsField label="Pincode" required>
                    <DsInput
                      type="text"
                      inputMode="numeric"
                      value={address.pincode}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '')
                        if (val.length <= 6) onAddressChange('pincode', val)
                      }}
                      placeholder="600001"
                      style={!address.pincode?.trim() ? { borderColor: '#ffcdd2' } : {}}
                    />
                  </DsField>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Missing fields warning */}
        {!allFilled && (
          <div style={{ marginTop: '0.75rem', background: '#fff3e0', border: '1.5px solid #ffe0b2', borderRadius: 10, padding: '0.6rem 1rem', fontSize: '0.78rem', color: '#e65100' }}>
            ⚠ Please fill in all required fields before submitting: <strong>{missingFields.join(', ')}</strong>
          </div>
        )}

        <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
          <DsBtnGhost type="button" onClick={onCancel} disabled={loading}>Cancel</DsBtnGhost>
          <DsBtnPrimary type="submit" loading={loading}
            loadingText={isEdit ? 'Saving…' : 'Registering…'}
            disabled={!allFilled}>
            {isEdit ? '✓ Save Changes' : '+ Register Donor'}
          </DsBtnPrimary>
        </div>
      </form>
    </div>
  )
}