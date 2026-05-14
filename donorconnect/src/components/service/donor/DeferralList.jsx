import PageHeader from '../../shared/ui/PageHeader'
import DataTable from '../../shared/ui/DataTable'
import DsModal from '../../shared/donor-service/DsModal'
import { DsField, DsInput, DsTextarea } from '../../shared/donor-service/DsField'
import { DsBtnPrimary, DsBtnGhost, DsBtnSecondary, DsBtnLift, DsBtnInline } from '../../shared/donor-service/DsButtons'
import { StatusPill, TypeBadge } from '../../shared/donor-service/DsBadges'

function DonorStatusRow({ status, name }) {
  if (status === 'idle') return null
  const cfg = {
    checking: { color: '#fb8c00', msg: 'Verifying donor ID…' },
    valid:    { color: '#43a047', msg: `✓ ${name}` },
    invalid:  { color: '#ef5350', msg: 'Donor ID not found. Please check and try again.' },
  }[status]
  return <p style={{ fontSize: '0.72rem', color: cfg.color, margin: '4px 0 0', fontWeight: 600 }}>{cfg.msg}</p>
}

const TABS = [
  { key: 'ACTIVE',  label: 'Active'   },
  { key: 'EXPIRED', label: 'Expired'  },
  { key: 'DONOR',   label: 'By Donor' },
]

function DeferralFormModal({ initial, editId, onClose, onSave, saving, createDonorStatus, createDonorName, onCreateDonorIdChange }) {
  const isEdit = !!editId
  const { form, setForm } = initial
  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const borderStyle = !isEdit && createDonorStatus && createDonorStatus !== 'idle' ? {
    borderColor: { checking: '#fb8c00', valid: '#43a047', invalid: '#ef5350' }[createDonorStatus],
    boxShadow:   `0 0 0 3px ${{ checking: '#fb8c00', valid: '#43a047', invalid: '#ef5350' }[createDonorStatus]}22`,
  } : {}

  return (
    <DsModal show onClose={onClose}
      title={isEdit ? 'Edit Deferral' : 'Issue New Deferral'}
      subtitle={isEdit ? `Editing deferral #${editId}` : 'Donor status will be set to DEFERRED immediately'}
      footer={
        <>
          <DsBtnGhost onClick={onClose} disabled={saving}>Cancel</DsBtnGhost>
          <DsBtnPrimary loading={saving} onClick={onSave} disabled={!isEdit && createDonorStatus !== 'valid'}>
            {isEdit ? '✓ Save Changes' : '+ Issue Deferral'}
          </DsBtnPrimary>
        </>
      }>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

        <DsField label="Donor ID" required>
          <div style={{ position: 'relative' }}>
            <DsInput
              type="number"
              value={form.donorId}
              onChange={e => { setF('donorId')(e); if (!isEdit) onCreateDonorIdChange?.(e.target.value) }}
              placeholder="e.g. 42"
              disabled={isEdit}
              autoFocus={!isEdit}
              style={borderStyle}
            />
            {!isEdit && createDonorStatus === 'checking' && (
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, border: '2px solid #fb8c00', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'def-spin 0.7s linear infinite' }} />
            )}
            {!isEdit && createDonorStatus === 'valid'   && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#43a047', fontWeight: 700 }}>✓</span>}
            {!isEdit && createDonorStatus === 'invalid' && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#ef5350', fontWeight: 700 }}>✕</span>}
          </div>
          {!isEdit && <DonorStatusRow status={createDonorStatus || 'idle'} name={createDonorName || ''} />}
        </DsField>

        <DsField label="Deferral Type">
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {[
              { key: 'TEMPORARY', label: '⏱ Temporary', activeColor: '#e65100', activeBg: '#fff3e0', activeBorder: '#fb8c00' },
              { key: 'PERMANENT', label: '⛔ Permanent', activeColor: '#b71c1c', activeBg: '#ffebee', activeBorder: '#ef5350' },
            ].map(({ key, label, activeColor, activeBg, activeBorder }) => {
              const active = form.deferralType === key
              return (
                <button key={key} type="button"
                  onClick={() => setForm(f => ({ ...f, deferralType: key }))}
                  style={{
                    flex: 1, padding: '9px 14px',
                    border: `2px solid ${active ? activeBorder : '#e0e0ec'}`,
                    borderRadius: 10,
                    background: active ? activeBg : '#fafafa',
                    color: active ? activeColor : '#888',
                    fontSize: '0.85rem', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  {label}
                </button>
              )
            })}
          </div>
          <p style={{ fontSize: '0.75rem', margin: '0.35rem 0 0', color: form.deferralType === 'PERMANENT' ? '#b71c1c' : '#888' }}>
            {form.deferralType === 'TEMPORARY'
              ? 'End date will be automatically set to 3 months from today.'
              : '⚠ Permanent deferrals cannot be lifted. Use only when required.'}
          </p>
        </DsField>

        <DsField label="Reason" required>
          <DsTextarea value={form.reason} onChange={setF('reason')} placeholder="Describe the reason for deferral…" rows={3} />
        </DsField>

      </div>
      <style>{`@keyframes def-spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </DsModal>
  )
}

function DeferralDetailModal({ deferral, onClose, onEdit, onLift, lifting }) {
  const canLift = deferral.deferralType === 'TEMPORARY' && deferral.status === 'ACTIVE'
  return (
    <DsModal show onClose={onClose}
      title={`Deferral #${deferral.deferralId}`}
      subtitle={`Donor ID #${deferral.donorId}`}
      headerRight={<TypeBadge type={deferral.deferralType} />}
      footer={
        <>
          <DsBtnGhost onClick={onClose}>Close</DsBtnGhost>
          <DsBtnSecondary onClick={onEdit}>✏ Edit</DsBtnSecondary>
          {canLift && <DsBtnLift loading={lifting} onClick={onLift}>↑ Lift Deferral</DsBtnLift>}
        </>
      }>
      <div style={{ padding: '1.25rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem 1.5rem' }}>
          {[
            ['Status',     <StatusPill status={deferral.status} />],
            ['Type',       <TypeBadge type={deferral.deferralType} />],
            ['Start Date', deferral.startDate || '—'],
            ['End Date',   deferral.deferralType === 'PERMANENT'
              ? <em style={{ color: '#b71c1c', fontStyle: 'normal', fontSize: '0.82rem' }}>Permanent — no end date</em>
              : deferral.endDate || '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: '0.67rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#bbb', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: '0.9rem', color: '#1a1a2e' }}>{value}</div>
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '0.67rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#bbb', marginBottom: 3 }}>Reason</div>
            <div style={{ fontSize: '0.9rem', color: '#1a1a2e', lineHeight: 1.5 }}>{deferral.reason || '—'}</div>
          </div>
        </div>

        {deferral.deferralType === 'PERMANENT' && deferral.status === 'ACTIVE' && (
          <div style={{ background: '#ffebee', border: '1.5px solid #ffcdd2', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#b71c1c' }}>
            ⚠ This is a <strong>permanent deferral</strong>. It cannot be lifted manually.
          </div>
        )}
        {canLift && (
          <div style={{ background: '#e3f2fd', border: '1.5px solid #bbdefb', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#1565c0' }}>
            💡 Lifting will restore the donor to <strong>ACTIVE</strong> status if no other active deferrals remain.
          </div>
        )}
      </div>
    </DsModal>
  )
}

export default function DeferralList({
  deferrals, loading, tab, donorIdSearch,
  viewRecord, editRecord, showCreate,
  createForm, setCreateForm, editForm, setEditForm,
  saving, lifting,
  createDonorStatus, createDonorName, onCreateDonorIdChange,
  onTabChange, onDonorSearchChange, onDonorSearch,
  onViewRecord, onCloseView, onEditFromView, onEditRecord, onCloseEdit,
  onShowCreate, onCloseCreate, onSaveCreate, onSaveEdit,
  onLift, onLiftInline,
}) {
  const columns = [
    { key: 'deferralId',   label: 'ID',     render: v => <span style={{ fontFamily: 'Courier New', fontSize: '0.8rem', color: '#aaa' }}>#{v}</span> },
    { key: 'donorId',      label: 'Donor',  render: v => <span style={{ fontFamily: 'Courier New', fontSize: '0.82rem', fontWeight: 600 }}>#{v}</span> },
    { key: 'deferralType', label: 'Type',   render: v => <TypeBadge type={v} /> },
    { key: 'reason',       label: 'Reason', render: v => <span style={{ fontSize: '0.84rem', color: '#555', maxWidth: 200, display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{v || '—'}</span> },
    { key: 'startDate',    label: 'Start',  render: v => <span style={{ fontSize: '0.83rem', color: '#555' }}>{v || '—'}</span> },
    { key: 'endDate',      label: 'End',    render: (v, row) => row.deferralType === 'PERMANENT'
        ? <span style={{ color: '#b71c1c', fontSize: '0.78rem', fontWeight: 700 }}>Permanent</span>
        : <span style={{ fontSize: '0.83rem', color: '#555' }}>{v || '—'}</span> },
    { key: 'status',       label: 'Status', render: v => <StatusPill status={v} /> },
  ]

  return (
    <>
      <style>{`
        @keyframes def-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .def-root { animation: def-fadein 0.3s ease both; }
        .def-tab-bar { display: flex; border-bottom: 2px solid #f0f0f8; margin-bottom: 1.25rem; }
        .def-tab {
          padding: 0.6rem 1.2rem; border: none; background: none;
          font-size: 0.85rem; font-weight: 500; color: #999;
          cursor: pointer; transition: all 0.15s;
          border-bottom: 2.5px solid transparent; margin-bottom: -2px;
          display: flex; align-items: center; gap: 0.4rem;
        }
        .def-tab:hover { color: #c62828; }
        .def-tab.active { color: #c62828; border-bottom-color: #c62828; font-weight: 700; }
        .def-count { background: #c62828; color: white; border-radius: 20px; padding: 1px 7px; font-size: 0.65rem; font-weight: 800; }
        .def-search-input { padding: 8px 13px; border: 1.5px solid #e0e0ec; border-radius: 9px; font-size: 0.88rem; outline: none; background: #fafafa; transition: border-color 0.15s; width: 220px; }
        .def-search-input:focus { border-color: #c62828; background: #fff; }
      `}</style>

      <div className="def-root">
        <PageHeader title="Deferral Management">
          <button className="btn btn-danger btn-sm" onClick={onShowCreate}>+ Issue Deferral</button>
        </PageHeader>

        <div className="def-tab-bar">
          {TABS.map(t => (
            <button key={t.key} className={`def-tab${tab === t.key ? ' active' : ''}`} onClick={() => onTabChange(t.key)}>
              {t.label}
              {(t.key === 'ACTIVE' || t.key === 'EXPIRED') && tab === t.key && deferrals.length > 0 && (
                <span className="def-count">{deferrals.length}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'DONOR' && (
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            <input className="def-search-input" type="number" placeholder="Search by Donor ID…"
              value={donorIdSearch} onChange={onDonorSearchChange}
              onKeyDown={e => e.key === 'Enter' && onDonorSearch()} />
            <button className="btn btn-danger btn-sm" onClick={onDonorSearch} disabled={!donorIdSearch?.trim()}>Search</button>
          </div>
        )}

        <div className="table-wrapper">
          <DataTable columns={columns} data={deferrals} loading={loading}
            actions={row => (
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <DsBtnInline onClick={() => onViewRecord(row)}>View</DsBtnInline>
                <DsBtnInline onClick={() => onEditRecord(row)}>Edit</DsBtnInline>
                {row.deferralType === 'TEMPORARY' && row.status === 'ACTIVE' && (
                  <DsBtnInline variant="blue" onClick={() => onLiftInline(row)}>↑ Lift</DsBtnInline>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {viewRecord && <DeferralDetailModal deferral={viewRecord} lifting={lifting}
        onClose={onCloseView} onEdit={onEditFromView} onLift={() => onLift(viewRecord.deferralId)} />}
      {editRecord && <DeferralFormModal editId={editRecord.id} initial={{ form: editForm, setForm: setEditForm }}
        onClose={onCloseEdit} onSave={onSaveEdit} saving={saving} />}
      {showCreate && <DeferralFormModal initial={{ form: createForm, setForm: setCreateForm }}
        onClose={onCloseCreate} onSave={onSaveCreate} saving={saving}
        createDonorStatus={createDonorStatus} createDonorName={createDonorName}
        onCreateDonorIdChange={onCreateDonorIdChange} />}
    </>
  )
}