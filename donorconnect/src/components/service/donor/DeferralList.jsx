import PageHeader from '../../shared/ui/PageHeader'
import DataTable from '../../shared/ui/DataTable'
import DsModal from '../../shared/donor-service/DsModal'
import { DsField, DsInput, DsTextarea } from '../../shared/donor-service/DsField'
import { DsBtnPrimary, DsBtnGhost, DsBtnSecondary, DsBtnLift, DsBtnInline } from '../../shared/donor-service/DsButtons'
import { StatusPill, TypeBadge } from '../../shared/donor-service/DsBadges'

const TABS = [
  { key: 'ACTIVE',  label: 'Active'   },
  { key: 'EXPIRED', label: 'Expired'  },
  { key: 'DONOR',   label: 'By Donor' },
]

function DeferralFormModal({ initial, editId, onClose, onSave, saving }) {
  const isEdit = !!editId
  const { form, setForm } = initial
  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <DsModal show onClose={onClose}
      title={isEdit ? 'Edit Deferral' : 'Issue New Deferral'}
      subtitle={isEdit ? `Editing deferral #${editId}` : 'Donor status will be set to DEFERRED immediately'}
      footer={<><DsBtnGhost onClick={onClose} disabled={saving}>Cancel</DsBtnGhost>
        <DsBtnPrimary loading={saving} onClick={onSave}>{isEdit ? '✓ Save Changes' : '+ Issue Deferral'}</DsBtnPrimary></>}>
      <div className="p-3 d-flex flex-column gap-3">
        <DsField label="Donor ID" required>
          <DsInput type="number" value={form.donorId} onChange={setF('donorId')} placeholder="e.g. 42" disabled={isEdit} />
        </DsField>
        <DsField label="Deferral Type">
          <div className="btn-group w-100" role="group">
            {['TEMPORARY', 'PERMANENT'].map(t => (
              <button key={t} type="button"
                className={`btn btn-sm ${form.deferralType === t ? (t === 'TEMPORARY' ? 'btn-warning' : 'btn-danger') : 'btn-outline-secondary'}`}
                onClick={() => setForm(f => ({ ...f, deferralType: t }))}>
                {t === 'TEMPORARY' ? '⏱ Temporary' : '⛔ Permanent'}
              </button>
            ))}
          </div>
          <div className={`form-text ${form.deferralType === 'PERMANENT' ? 'text-danger' : ''}`}>
            {form.deferralType === 'TEMPORARY'
              ? 'End date will be automatically set to 3 months from today.'
              : '⚠ Permanent deferrals cannot be lifted. Use only when required.'}
          </div>
        </DsField>
        <DsField label="Reason" required>
          <DsTextarea value={form.reason} onChange={setF('reason')} placeholder="Describe the reason for deferral…" rows={3} />
        </DsField>
      </div>
    </DsModal>
  )
}

function DeferralDetailModal({ deferral, onClose, onEdit, onLift, lifting }) {
  const canLift = deferral.deferralType === 'TEMPORARY' && deferral.status === 'ACTIVE'
  return (
    <DsModal show onClose={onClose}
      title={`Deferral #${deferral.deferralId}`} subtitle={`Donor ID #${deferral.donorId}`}
      headerRight={<TypeBadge type={deferral.deferralType} />}
      footer={<><DsBtnGhost onClick={onClose}>Close</DsBtnGhost>
        <DsBtnSecondary onClick={onEdit}>✏ Edit</DsBtnSecondary>
        {canLift && <DsBtnLift loading={lifting} onClick={onLift}>↑ Lift Deferral</DsBtnLift>}</>}>
      <div className="p-3 d-flex flex-column gap-3">
        <div className="row row-cols-2 g-3">
          {[['Status', <StatusPill status={deferral.status} />], ['Type', <TypeBadge type={deferral.deferralType} />],
            ['Start Date', deferral.startDate || '—'],
            ['End Date', deferral.deferralType === 'PERMANENT'
              ? <em className="text-danger small">Permanent — no end date</em>
              : deferral.endDate || '—']].map(([label, value]) => (
            <div key={label} className="col">
              <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>{label}</div>
              <div style={{ fontSize: '0.9rem' }}>{value}</div>
            </div>
          ))}
          <div className="col-12">
            <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>Reason</div>
            <div style={{ fontSize: '0.9rem' }}>{deferral.reason || '—'}</div>
          </div>
        </div>
        {deferral.deferralType === 'PERMANENT' && deferral.status === 'ACTIVE' && (
          <div className="alert alert-danger py-2 mb-0 small">⚠ This is a <strong>permanent deferral</strong>. It cannot be lifted manually.</div>
        )}
        {canLift && (
          <div className="alert alert-info py-2 mb-0 small">💡 Lifting will restore the donor to <strong>ACTIVE</strong> status if no other active deferrals remain.</div>
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
  onTabChange, onDonorSearchChange, onDonorSearch,
  onViewRecord, onCloseView, onEditFromView, onEditRecord, onCloseEdit,
  onShowCreate, onCloseCreate, onSaveCreate, onSaveEdit,
  onLift, onLiftInline,
}) {
  const columns = [
    { key: 'deferralId', label: 'ID', render: v => <code className="text-muted">#{v}</code> },
    { key: 'donorId',    label: 'Donor', render: v => <code>#{v}</code> },
    { key: 'deferralType', label: 'Type', render: v => <TypeBadge type={v} /> },
    { key: 'reason', label: 'Reason', render: v => <span className="small text-truncate d-block" style={{ maxWidth: 200 }}>{v || '—'}</span> },
    { key: 'startDate', label: 'Start', render: v => v || '—' },
    { key: 'endDate', label: 'End', render: (v, row) => row.deferralType === 'PERMANENT'
      ? <span className="text-danger small fw-bold">Permanent</span> : v || '—' },
    { key: 'status', label: 'Status', render: v => <StatusPill status={v} /> },
  ]

  return (
    <div className="animate-fadein">
      <PageHeader title="Deferral Management">
        <button className="btn btn-danger btn-sm" onClick={onShowCreate}>+ Issue Deferral</button>
      </PageHeader>

      <ul className="nav nav-tabs mb-3">
        {TABS.map(t => (
          <li key={t.key} className="nav-item">
            <button className={`nav-link${tab === t.key ? ' active' : ''}`} onClick={() => onTabChange(t.key)}>
              {t.label}
              {(t.key === 'ACTIVE' || t.key === 'EXPIRED') && tab === t.key && deferrals.length > 0 && (
                <span className="badge bg-danger rounded-pill ms-2" style={{ fontSize: '0.65rem' }}>{deferrals.length}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {tab === 'DONOR' && (
        <div className="d-flex gap-2 mb-3">
          <input className="form-control form-control-sm" style={{ maxWidth: 220 }} type="number"
            placeholder="Donor ID…" value={donorIdSearch} onChange={onDonorSearchChange}
            onKeyDown={e => e.key === 'Enter' && onDonorSearch()} />
          <button className="btn btn-danger btn-sm" onClick={onDonorSearch} disabled={!donorIdSearch?.trim()}>Search</button>
        </div>
      )}

      <div className="table-wrapper">
        <DataTable columns={columns} data={deferrals} loading={loading}
          actions={row => (
            <div className="d-flex gap-1">
              <DsBtnInline onClick={() => onViewRecord(row)}>View</DsBtnInline>
              <DsBtnInline onClick={() => onEditRecord(row)}>Edit</DsBtnInline>
              {row.deferralType === 'TEMPORARY' && row.status === 'ACTIVE' && (
                <DsBtnInline variant="blue" onClick={() => onLiftInline(row)}>↑ Lift</DsBtnInline>
              )}
            </div>
          )}
        />
      </div>

      {viewRecord && <DeferralDetailModal deferral={viewRecord} lifting={lifting}
        onClose={onCloseView} onEdit={onEditFromView} onLift={() => onLift(viewRecord.deferralId)} />}
      {editRecord && <DeferralFormModal editId={editRecord.id} initial={{ form: editForm, setForm: setEditForm }}
        onClose={onCloseEdit} onSave={onSaveEdit} saving={saving} />}
      {showCreate && <DeferralFormModal initial={{ form: createForm, setForm: setCreateForm }}
        onClose={onCloseCreate} onSave={onSaveCreate} saving={saving} />}
    </div>
  )
}