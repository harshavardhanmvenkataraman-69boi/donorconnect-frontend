import PageHeader from '../../shared/ui/PageHeader'
import DataTable from '../../shared/ui/DataTable'
import DsModal from '../../shared/donor-service/DsModal'
import { DsField, DsInput, DsTextarea, DsSelect } from '../../shared/donor-service/DsField'
import { DsBtnPrimary, DsBtnGhost, DsBtnInline } from '../../shared/donor-service/DsButtons'
import { ClearedBadge } from '../../shared/donor-service/DsBadges'

const Q_LABELS = {
  recentIllness:    'Had illness in the past 2 weeks?',
  recentMedication: 'Currently on medication?',
  recentTattoo:     'Tattoo / piercing in the past 6 months?',
  recentSurgery:    'Surgery in the past 6 months?',
  traveledAbroad:   'Traveled abroad in the past 3 months?',
  alcoholLast24h:   'Consumed alcohol in the past 24 hours?',
}
const EV = { hemoglobin: '', bpSystolic: '', bpDiastolic: '', weight: '', pulse: '', temperature: '' }
const EQ = { recentIllness: false, recentMedication: false, recentTattoo: false, recentSurgery: false, traveledAbroad: false, alcoholLast24h: false }
const safeJson = (raw, fb) => { try { return raw ? { ...fb, ...JSON.parse(raw) } : { ...fb } } catch { return { ...fb } } }

function ScreeningViewModal({ record, onClose, onEdit }) {
  const vitals = safeJson(record.vitalsJson, EV)
  const q = safeJson(record.questionnaireJson, EQ)
  return (
    <DsModal show size="lg" onClose={onClose}
      title={`Screening #${record.screeningId}`}
      subtitle={`Donor ID #${record.donorId} · ${record.screeningDate || '—'}`}
      headerRight={<ClearedBadge cleared={record.clearedFlag} />}
      footer={<><DsBtnGhost onClick={onClose}>Close</DsBtnGhost><DsBtnPrimary onClick={onEdit}>✏ Edit</DsBtnPrimary></>}>
      <div className="p-3">
        <div className="row g-4">
          <div className="col-md-6">
            <p className="text-muted text-uppercase fw-bold small mb-2" style={{ letterSpacing: '0.7px' }}>🩺 Vitals</p>
            <div className="row row-cols-2 g-2">
              {[['Hemoglobin', vitals.hemoglobin, 'g/dL'], ['BP Systolic', vitals.bpSystolic, 'mmHg'],
                ['BP Diastolic', vitals.bpDiastolic, 'mmHg'], ['Weight', vitals.weight, 'kg'],
                ['Pulse', vitals.pulse, 'bpm'], ['Temperature', vitals.temperature, '°C']].map(([l, v, u]) => (
                <div key={l} className="col">
                  <div className="text-muted" style={{ fontSize: '0.67rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
                  <div className="small">{v || '—'} {v && <em className="text-muted" style={{ fontSize: '0.75rem' }}>{u}</em>}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-6">
            <p className="text-muted text-uppercase fw-bold small mb-2" style={{ letterSpacing: '0.7px' }}>📋 Questionnaire</p>
            {Object.entries(Q_LABELS).map(([k, l]) => (
              <div key={k} className="d-flex align-items-center gap-2 mb-1">
                <span className="rounded-circle flex-shrink-0" style={{ width: 7, height: 7, background: q[k] ? '#ef5350' : '#c8e6c9', display: 'inline-block' }} />
                <span className="small flex-grow-1">{l}</span>
                <span className={`small fw-bold ${q[k] ? 'text-danger' : 'text-success'}`}>{q[k] ? 'Yes' : 'No'}</span>
              </div>
            ))}
          </div>
          {(record.clearedBy || record.notes) && (
            <div className="col-12">
              <p className="text-muted text-uppercase fw-bold small mb-2" style={{ letterSpacing: '0.7px' }}>📝 Notes</p>
              {record.clearedBy && <div className="small"><span className="text-muted">Cleared By: </span>{record.clearedBy}</div>}
              {record.notes && <p className="small text-secondary mb-0 mt-1">{record.notes}</p>}
            </div>
          )}
        </div>
      </div>
    </DsModal>
  )
}

function ScreeningFormModal({ form, vitals, questionnaire, editId, onClose, onSave, saving, onFormChange, onVitalsChange, onQChange, onDeferChange }) {
  const isEdit = !!editId
  return (
    <DsModal show size="lg" onClose={onClose}
      title={isEdit ? 'Edit Screening' : 'New Screening'}
      subtitle={isEdit ? `Editing record #${editId}` : 'Complete vitals and questionnaire'}
      footer={<><DsBtnGhost onClick={onClose} disabled={saving}>Cancel</DsBtnGhost>
        <DsBtnPrimary loading={saving} onClick={onSave}>{isEdit ? '✓ Save Changes' : '+ Record Screening'}</DsBtnPrimary></>}>
      <div>
        {/* Basic Info */}
        <div className="p-3 border-bottom">
          <p className="text-muted text-uppercase fw-bold small mb-2" style={{ letterSpacing: '0.7px' }}>🪪 Basic Info</p>
          <div className="row g-2">
            <div className="col-md-4"><DsField label="Donor ID" required><DsInput type="number" value={form.donorId} onChange={e => onFormChange('donorId', e.target.value)} placeholder="e.g. 42" disabled={isEdit} /></DsField></div>
            <div className="col-md-4"><DsField label="Screening Date"><DsInput type="date" value={form.screeningDate} onChange={e => onFormChange('screeningDate', e.target.value)} max={new Date().toISOString().split('T')[0]} /></DsField></div>
            <div className="col-md-4"><DsField label="Cleared By"><DsInput value={form.clearedBy} onChange={e => onFormChange('clearedBy', e.target.value)} placeholder="Staff name / ID" /></DsField></div>
          </div>
        </div>
        {/* Vitals */}
        <div className="p-3 border-bottom">
          <p className="text-muted text-uppercase fw-bold small mb-2" style={{ letterSpacing: '0.7px' }}>🩺 Vitals</p>
          <div className="row g-2">
            {[['hemoglobin','Hemoglobin (g/dL)','0','25'],['bpSystolic','BP Systolic (mmHg)','50','250'],
              ['bpDiastolic','BP Diastolic (mmHg)','30','150'],['weight','Weight (kg)','30','300'],
              ['pulse','Pulse (bpm)','30','200'],['temperature','Temperature (°C)','34','42']].map(([k,l,mn,mx]) => (
              <div key={k} className="col-md-4 col-6">
                <DsField label={l}><DsInput type="number" min={mn} max={mx} step="0.1" value={vitals[k]} onChange={e => onVitalsChange(k, e.target.value)} placeholder="—" /></DsField>
              </div>
            ))}
          </div>
        </div>
        {/* Questionnaire */}
        <div className="p-3 border-bottom">
          <p className="text-muted text-uppercase fw-bold small mb-2" style={{ letterSpacing: '0.7px' }}>📋 Questionnaire</p>
          <div className="row g-1">
            {Object.entries(Q_LABELS).map(([k, l]) => (
              <div key={k} className="col-md-6">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id={`q-${k}`} checked={questionnaire[k]} onChange={e => onQChange(k, e.target.checked)} style={{ accentColor: '#dc3545' }} />
                  <label className="form-check-label small" htmlFor={`q-${k}`}>{l}</label>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Clearance */}
        <div className="p-3 border-bottom">
          <p className="text-muted text-uppercase fw-bold small mb-2" style={{ letterSpacing: '0.7px' }}>✅ Clearance Decision</p>
          <div className="btn-group w-100 mb-2" role="group">
            <button type="button" className={`btn btn-sm ${form.clearedFlag ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => onFormChange('clearedFlag', true)}>✓ Cleared for Donation</button>
            <button type="button" className={`btn btn-sm ${!form.clearedFlag ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => onFormChange('clearedFlag', false)}>✕ Not Cleared — Defer</button>
          </div>
          {!form.clearedFlag && (
            <div className="bg-danger bg-opacity-10 border border-danger-subtle rounded p-3 mt-2">
              <p className="text-danger small mb-2">⚠ A deferral will be created and donor status set to <strong>DEFERRED</strong>.</p>
              <div className="row g-2">
                <div className="col-md-6"><DsField label="Deferral Type"><DsSelect value={form.deferralRequest.deferralType} onChange={e => onDeferChange('deferralType', e.target.value)}><option>TEMPORARY</option><option>PERMANENT</option></DsSelect></DsField></div>
                <div className="col-12"><DsField label="Reason" required><DsTextarea rows={2} value={form.deferralRequest.reason} onChange={e => onDeferChange('reason', e.target.value)} placeholder="Describe why the donor is being deferred…" /></DsField></div>
              </div>
            </div>
          )}
        </div>
        {/* Notes */}
        <div className="p-3">
          <p className="text-muted text-uppercase fw-bold small mb-2" style={{ letterSpacing: '0.7px' }}>📝 Notes</p>
          <DsField label="Additional Notes"><DsTextarea rows={2} value={form.notes} onChange={e => onFormChange('notes', e.target.value)} placeholder="Any additional observations…" /></DsField>
        </div>
      </div>
    </DsModal>
  )
}

export default function ScreeningList({
  screenings, loading, donorId, resultCount,
  viewRecord, editRecord, showCreate,
  form, vitals, questionnaire, saving,
  onDonorIdChange, onSearch,
  onViewRecord, onCloseView, onEditFromView, onEditRecord, onCloseEdit,
  onShowCreate, onCloseCreate,
  onFormChange, onVitalsChange, onQChange, onDeferChange,
  onSaveCreate, onSaveEdit,
}) {
  const columns = [
    { key: 'screeningId', label: 'ID', render: v => <code className="text-muted">#{v}</code> },
    { key: 'screeningDate', label: 'Date', render: v => v || '—' },
    { key: 'vitalsJson', label: 'Hgb / BP', render: v => {
      const vt = safeJson(v, EV)
      if (!vt.hemoglobin && !vt.bpSystolic) return <span className="text-muted">—</span>
      return <span className="small text-secondary">{vt.hemoglobin ? `${vt.hemoglobin} g/dL` : '—'}{vt.bpSystolic ? ` · ${vt.bpSystolic}/${vt.bpDiastolic}` : ''}</span>
    }},
    { key: 'clearedFlag', label: 'Status', render: v => <ClearedBadge cleared={v} /> },
    { key: 'clearedBy', label: 'Cleared By', render: v => v || <span className="text-muted">—</span> },
  ]

  return (
    <div className="animate-fadein">
      <PageHeader title="Pre-Donation Screening">
        <button className="btn btn-danger btn-sm" onClick={onShowCreate}>+ New Screening</button>
      </PageHeader>
      <div className="d-flex gap-2 align-items-center mb-3 flex-wrap">
        <input className="form-control form-control-sm" style={{ maxWidth: 220 }} type="number"
          placeholder="Donor ID…" value={donorId} onChange={onDonorIdChange}
          onKeyDown={e => e.key === 'Enter' && onSearch()} />
        <button className="btn btn-danger btn-sm" onClick={onSearch} disabled={!donorId?.trim()}>Search</button>
        {resultCount > 0 && (
          <span className="badge bg-light text-secondary border">{resultCount} record{resultCount !== 1 ? 's' : ''} found</span>
        )}
      </div>
      <div className="table-wrapper">
        <DataTable columns={columns} data={screenings} loading={loading}
          actions={row => (
            <div className="d-flex gap-1">
              <DsBtnInline onClick={() => onViewRecord(row)}>View</DsBtnInline>
              <DsBtnInline onClick={() => onEditRecord(row)}>Edit</DsBtnInline>
            </div>
          )}
        />
      </div>
      {viewRecord && <ScreeningViewModal record={viewRecord} onClose={onCloseView} onEdit={onEditFromView} />}
      {editRecord && <ScreeningFormModal editId={editRecord.id} form={form} vitals={vitals} questionnaire={questionnaire} saving={saving} onClose={onCloseEdit} onSave={onSaveEdit} onFormChange={onFormChange} onVitalsChange={onVitalsChange} onQChange={onQChange} onDeferChange={onDeferChange} />}
      {showCreate && <ScreeningFormModal form={form} vitals={vitals} questionnaire={questionnaire} saving={saving} onClose={onCloseCreate} onSave={onSaveCreate} onFormChange={onFormChange} onVitalsChange={onVitalsChange} onQChange={onQChange} onDeferChange={onDeferChange} />}
    </div>
  )
}