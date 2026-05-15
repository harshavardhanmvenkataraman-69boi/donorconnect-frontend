import PageHeader from '../../shared/ui/PageHeader'
import StatusBadge from '../../shared/ui/StatusBadge'
import DsModal from '../../shared/donor-service/DsModal'
import { DsField, DsInput } from '../../shared/donor-service/DsField'
import { DsBtnPrimary, DsBtnGhost } from '../../shared/donor-service/DsButtons'

export default function DonorProfile({
  profile, showEdit, showPwd,
  form, pwdForm, saving, savingPwd,
  onShowEdit, onCloseEdit, onFormChange, onSave,
  onTogglePwd, onPwdChange, onChangePwd,
}) {
  if (!profile) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
        <div className="spinner-border text-danger" />
      </div>
    )
  }

  const bloodLabel = `${profile.bloodGroup}${profile.rhFactor === 'POSITIVE' ? '+' : '−'}`
  const initials   = profile.name?.[0]?.toUpperCase() || '?'

  const detailFields = [
    ['Date of Birth', profile.dateOfBirth || profile.dob],
    ['Gender',        profile.gender],
    ['Donor Type',    profile.donorType],
    ['Blood Group',   bloodLabel],
  ]

  return (
    <div className="animate-fadein" style={{ maxWidth: 660 }}>
      <PageHeader title="My Profile">
        <button className="btn btn-danger btn-sm" onClick={onShowEdit}>✏️ Edit Profile</button>
      </PageHeader>

      {/* Deferred warning */}
      {profile.status === 'DEFERRED' && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-3" role="alert">
          ⚠️ Your donation eligibility is currently deferred. Please contact the blood bank for more information.
        </div>
      )}

      {/* Profile card */}
      <div className="card border shadow-sm mb-3" style={{ borderRadius: 16 }}>
        <div className="card-body p-4">
          {/* Hero */}
          <div className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
              style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #c62828, #1a1a2e)', fontSize: '1.8rem' }}
            >
              {initials}
            </div>
            <div>
              <div className="fw-bold fs-5 mb-1">{profile.name}</div>
              <div className="text-muted small mb-2">{profile.contactInfo || profile.email || '—'}</div>
              <div className="d-flex gap-2 flex-wrap align-items-center">
                <span
                  className="badge rounded-pill fw-bold"
                  style={{ background: '#ffebee', color: '#c62828', fontSize: '0.82rem', padding: '4px 12px' }}
                >
                  {bloodLabel}
                </span>
                <StatusBadge status={profile.status} />
              </div>
            </div>
          </div>

          {/* Detail grid */}
          <div className="row row-cols-2 g-3">
            {detailFields.map(([label, value]) => (
              <div key={label} className="col">
                <div
                  className="text-muted text-uppercase fw-semibold mb-1"
                  style={{ fontSize: '0.68rem', letterSpacing: '0.6px' }}
                >
                  {label}
                </div>
                <div className="fw-semibold small">{value || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Password card */}
      <div className="card border shadow-sm" style={{ borderRadius: 16 }}>
        <div className="card-body p-4">
          <button className="btn btn-outline-secondary btn-sm" onClick={onTogglePwd}>
            🔐 {showPwd ? 'Hide Password Form' : 'Change Password'}
          </button>

          {showPwd && (
            <div className="mt-3 d-flex flex-column gap-3">
              {[
                ['currentPassword', 'Current Password'],
                ['newPassword',     'New Password'],
                ['confirm',         'Confirm New Password'],
              ].map(([k, l]) => (
                <DsField key={k} label={l}>
                  <DsInput
                    type="password"
                    value={pwdForm[k]}
                    onChange={e => onPwdChange(k, e.target.value)}
                    placeholder="••••••••"
                  />
                </DsField>
              ))}
              <div className="d-flex justify-content-end">
                <DsBtnPrimary loading={savingPwd} loadingText="Updating…" onClick={onChangePwd}>
                  Update Password
                </DsBtnPrimary>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <DsModal
        show={showEdit}
        onClose={onCloseEdit}
        title="Edit Profile"
        subtitle="Update your personal details"
        footer={
          <>
            <DsBtnGhost onClick={onCloseEdit} disabled={saving}>Cancel</DsBtnGhost>
            <DsBtnPrimary loading={saving} loadingText="Saving…" onClick={onSave}>
              Save Changes
            </DsBtnPrimary>
          </>
        }
      >
        <div className="p-3 d-flex flex-column gap-3">
          <DsField label="Full Name" required>
            <DsInput
              value={form.name || ''}
              onChange={e => onFormChange('name', e.target.value)}
              placeholder="Full name"
              autoFocus
            />
          </DsField>
          <DsField label="Contact Info">
            <DsInput
              value={form.contactInfo || ''}
              onChange={e => onFormChange('contactInfo', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </DsField>
          <DsField label="Date of Birth">
            <DsInput
              type="date"
              value={form.dateOfBirth || form.dob || ''}
              onChange={e => onFormChange('dateOfBirth', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </DsField>
          <DsField label="Blood Group" hint="Read-only — contact admin to change">
            <DsInput value={bloodLabel} readOnly className="opacity-50" style={{ cursor: 'not-allowed' }} />
          </DsField>
        </div>
      </DsModal>
    </div>
  )
}