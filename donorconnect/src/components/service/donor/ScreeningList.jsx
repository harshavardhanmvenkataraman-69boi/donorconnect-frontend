import { useEffect } from 'react'
import PageHeader from '../../shared/ui/PageHeader'
import DataTable from '../../shared/ui/DataTable'
import DsModal from '../../shared/donor-service/DsModal'
import { DsField, DsInput, DsTextarea, DsSelect } from '../../shared/donor-service/DsField'
import { DsBtnPrimary, DsBtnGhost, DsBtnInline } from '../../shared/donor-service/DsButtons'
import { ClearedBadge } from '../../shared/donor-service/DsBadges'

function DonorStatusRow({ status, name }) {
  if (!status || status === 'idle') return null
  const cfg = {
    checking: { color: '#fb8c00', msg: 'Verifying donor ID…' },
    valid:    { color: '#43a047', msg: `✓ ${name}` },
    invalid:  { color: '#ef5350', msg: 'Donor ID not found. Please check and try again.' },
  }[status]
  return <p style={{ fontSize: '0.72rem', color: cfg.color, margin: '4px 0 0', fontWeight: 600 }}>{cfg.msg}</p>
}

const VITALS_CONFIG = [
  { key: 'hemoglobin',  label: 'Hemoglobin',   unit: 'g/dL', placeholder: 'e.g. 14.5', min: 0,   max: 25,  dangerLow: 7,   dangerHigh: 22  },
  { key: 'bpSystolic',  label: 'BP Systolic',  unit: 'mmHg', placeholder: 'e.g. 110',  min: 50,  max: 250, dangerLow: 70,  dangerHigh: 180 },
  { key: 'bpDiastolic', label: 'BP Diastolic', unit: 'mmHg', placeholder: 'e.g. 75',   min: 30,  max: 150, dangerLow: 40,  dangerHigh: 110 },
  { key: 'weight',      label: 'Weight',       unit: 'kg',   placeholder: 'e.g. 65',   min: 30,  max: 300, dangerLow: 45,  dangerHigh: 200 },
  { key: 'pulse',       label: 'Pulse',        unit: 'bpm',  placeholder: 'e.g. 72',   min: 30,  max: 200, dangerLow: 45,  dangerHigh: 130 },
  { key: 'temperature', label: 'Temperature',  unit: '°C',   placeholder: 'e.g. 36.6', min: 34,  max: 42,  dangerLow: 35,  dangerHigh: 38.5},
]

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

const isExtreme = (key, val) => {
  if (!val) return false
  const cfg = VITALS_CONFIG.find(v => v.key === key)
  if (!cfg) return false
  const n = parseFloat(val)
  return !isNaN(n) && (n < cfg.dangerLow || n > cfg.dangerHigh)
}

function SectionBlock({ icon, title, children, noBorder }) {
  return (
    <div style={{ padding: '1.1rem 1.5rem', borderBottom: noBorder ? 'none' : '1px solid #f4f4f8' }}>
      <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#bbb', margin: '0 0 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span>{icon}</span> {title}
      </p>
      {children}
    </div>
  )
}

function ScreeningViewModal({ record, onClose, onEdit }) {
  const vitals = safeJson(record.vitalsJson, EV)
  const q      = safeJson(record.questionnaireJson, EQ)
  return (
    <DsModal show size="lg" onClose={onClose}
      title={`Screening #${record.screeningId}`}
      subtitle={`Donor ID #${record.donorId} · ${record.screeningDate || '—'}`}
      headerRight={<ClearedBadge cleared={record.clearedFlag} />}
      footer={<><DsBtnGhost onClick={onClose}>Close</DsBtnGhost><DsBtnPrimary onClick={onEdit}>✏ Edit</DsBtnPrimary></>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <SectionBlock icon="🩺" title="Vitals">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.25rem' }}>
            {VITALS_CONFIG.map(({ key, label, unit }) => {
              const ext = isExtreme(key, vitals[key])
              return (
                <div key={key}>
                  <div style={{ fontSize: '0.67rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ccc', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: '0.92rem', color: ext ? '#c62828' : '#1a1a2e', fontWeight: ext ? 700 : 400 }}>
                    {vitals[key] || '—'}
                    {vitals[key] && <em style={{ fontSize: '0.72rem', color: '#bbb', fontStyle: 'normal', marginLeft: 4 }}>{unit}</em>}
                    {ext && <span style={{ marginLeft: 6, fontSize: '0.68rem', background: '#ffebee', color: '#c62828', padding: '1px 6px', borderRadius: 6, fontWeight: 700 }}>Extreme</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </SectionBlock>
        <div style={{ borderLeft: '1px solid #f4f4f8' }}>
          <SectionBlock icon="📋" title="Questionnaire">
            {Object.entries(Q_LABELS).map(([k, l]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: q[k] ? '#ef5350' : '#c8e6c9', display: 'inline-block' }} />
                <span style={{ fontSize: '0.83rem', flex: 1, color: '#555' }}>{l}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: q[k] ? '#c62828' : '#66bb6a' }}>{q[k] ? 'Yes' : 'No'}</span>
              </div>
            ))}
          </SectionBlock>
        </div>
      </div>
      {(record.clearedBy || record.notes) && (
        <SectionBlock icon="📝" title="Notes" noBorder>
          {record.clearedBy && <div style={{ marginBottom: '0.4rem' }}><span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ccc' }}>Cleared By </span><span style={{ fontSize: '0.88rem' }}>{record.clearedBy}</span></div>}
          {record.notes && <p style={{ fontSize: '0.88rem', color: '#666', margin: 0, lineHeight: 1.5 }}>{record.notes}</p>}
        </SectionBlock>
      )}
    </DsModal>
  )
}

function ScreeningFormModal({ form, vitals, questionnaire, editId, onClose, onSave, saving, onFormChange, onVitalsChange, onQChange, onDeferChange, progressPct, scDonorStatus, scDonorName, onScDonorIdChange }) {
  const isEdit = !!editId

  useEffect(() => {
    const hasExtremeVital = VITALS_CONFIG.some(v => isExtreme(v.key, vitals[v.key]))
    const hasRiskyQ       = Object.values(questionnaire).some(v => v === true)
    if (hasExtremeVital || hasRiskyQ) {
      onFormChange('clearedFlag', false)
    }
  }, [vitals, questionnaire])

  const hasExtremes = VITALS_CONFIG.some(v => isExtreme(v.key, vitals[v.key]))
  const hasRiskyQ   = Object.values(questionnaire).some(v => v === true)

  return (
    <DsModal show size="lg" onClose={onClose}
      title={isEdit ? 'Edit Screening' : 'New Screening'}
      subtitle={isEdit ? `Editing record #${editId}` : 'Complete vitals and questionnaire'}
      footer={<><DsBtnGhost onClick={onClose} disabled={saving}>Cancel</DsBtnGhost><DsBtnPrimary loading={saving} onClick={onSave} disabled={form.clearedFlag === null || (!isEdit && scDonorStatus !== 'valid')}>{isEdit ? '✓ Save Changes' : '+ Record Screening'}</DsBtnPrimary></>}
    >
      <div style={{ padding: '1rem 1.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>Form Progress</span>
          <span style={{ fontSize: '0.75rem', color: progressPct === 100 ? '#2e7d32' : '#888', fontWeight: 700 }}>{progressPct}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 20, background: '#e8e8e8', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, borderRadius: 20, background: 'linear-gradient(90deg, #43a047, #2e7d32)', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
        </div>
      </div>

      <SectionBlock icon="🪪" title="Basic Info">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
          <DsField label="Donor ID" required>
            <div style={{ position: 'relative' }}>
              <DsInput type="number" value={form.donorId}
                onChange={e => { onFormChange('donorId', e.target.value); if (!isEdit) onScDonorIdChange?.(e.target.value) }}
                placeholder="e.g. 42" disabled={isEdit} autoFocus={!isEdit}
                style={!isEdit && scDonorStatus && scDonorStatus !== 'idle'
                  ? { borderColor: { checking: '#fb8c00', valid: '#43a047', invalid: '#ef5350' }[scDonorStatus], boxShadow: `0 0 0 3px ${{ checking: '#fb8c00', valid: '#43a047', invalid: '#ef5350' }[scDonorStatus]}22` }
                  : {}}
              />
              {!isEdit && scDonorStatus === 'checking' && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, border: '2px solid #fb8c00', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'sc-spin 0.7s linear infinite' }} />}
              {!isEdit && scDonorStatus === 'valid'    && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#43a047', fontWeight: 700 }}>✓</span>}
              {!isEdit && scDonorStatus === 'invalid'  && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#ef5350', fontWeight: 700 }}>✕</span>}
            </div>
            {!isEdit && <DonorStatusRow status={scDonorStatus || 'idle'} name={scDonorName || ''} />}
          </DsField>
          <DsField label="Screening Date">
            <DsInput type="date" value={form.screeningDate} onChange={e => onFormChange('screeningDate', e.target.value)} max={new Date().toISOString().split('T')[0]} />
          </DsField>
          <DsField label="Cleared By">
            <DsInput value={form.clearedBy} onChange={e => onFormChange('clearedBy', e.target.value)} placeholder="Staff name / ID" />
          </DsField>
        </div>
      </SectionBlock>

      <SectionBlock icon="🩺" title="Vitals">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
          {VITALS_CONFIG.map(({ key, label, unit, placeholder, min, max }) => {
            const ext = isExtreme(key, vitals[key])
            return (
              <DsField key={key} label={`${label} (${unit})`}>
                <div style={{ position: 'relative' }}>
                  <DsInput type="number" min={min} max={max} step="0.1" value={vitals[key]}
                    onChange={e => onVitalsChange(key, e.target.value)}
                    placeholder={placeholder}
                    style={{ ...(ext ? { borderColor: '#ef5350', background: '#fff8f8' } : {}), color: '#333' }} />
                  {ext && <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', fontWeight: 700, color: '#c62828', background: '#ffebee', padding: '1px 5px', borderRadius: 5 }}>!</span>}
                </div>
                {ext && <p style={{ fontSize: '0.68rem', color: '#c62828', margin: '3px 0 0', fontWeight: 600 }}>Extreme value — donor will be deferred</p>}
              </DsField>
            )
          })}
        </div>
        {hasExtremes && (
          <div style={{ marginTop: '0.85rem', background: '#fff3e0', border: '1.5px solid #ffe0b2', borderRadius: 10, padding: '0.6rem 0.9rem', fontSize: '0.78rem', color: '#e65100' }}>
            ⚠ Extreme vital value detected. Clearance has been set to <strong>Not Cleared</strong> automatically.
          </div>
        )}
      </SectionBlock>

      <SectionBlock icon="📋" title="Questionnaire">
        {hasRiskyQ && (
          <div style={{ marginBottom: '0.75rem', background: '#fff3e0', border: '1.5px solid #ffe0b2', borderRadius: 10, padding: '0.6rem 0.9rem', fontSize: '0.78rem', color: '#e65100' }}>
            ⚠ Positive response detected. Clearance has been set to <strong>Not Cleared</strong> automatically.
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem' }}>
          {Object.entries(Q_LABELS).map(([k, l]) => (
            <label key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', padding: '0.25rem 0' }}>
              <input type="checkbox" checked={questionnaire[k]} onChange={e => onQChange(k, e.target.checked)}
                style={{ marginTop: 3, accentColor: '#c62828', cursor: 'pointer', flexShrink: 0 }} />
              <span style={{ fontSize: '0.84rem', color: questionnaire[k] ? '#c62828' : '#444', fontWeight: questionnaire[k] ? 600 : 400, lineHeight: 1.4 }}>{l}</span>
            </label>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock icon="✅" title="Clearance Decision">
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
          {[
            { flag: true,  label: '✓ Cleared for Donation', activeColor: '#2e7d32', activeBg: '#e8f5e9', activeBorder: '#43a047' },
            { flag: false, label: '✕ Not Cleared — Defer',  activeColor: '#c62828', activeBg: '#ffebee', activeBorder: '#ef5350' },
          ].map(({ flag, label, activeColor, activeBg, activeBorder }) => {
            const active = form.clearedFlag === flag
            return (
              <button key={String(flag)} type="button" onClick={() => onFormChange('clearedFlag', flag)}
                style={{ flex: 1, padding: '10px 14px', border: `2px solid ${active ? activeBorder : '#e0e0ec'}`, borderRadius: 10, background: active ? activeBg : '#fafafa', color: active ? activeColor : '#999', fontSize: '0.85rem', fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {label}
              </button>
            )
          })}
        </div>
        {form.clearedFlag === null && <p style={{ fontSize: '0.75rem', color: '#bbb', margin: 0 }}>Select a clearance decision before saving.</p>}
        {form.clearedFlag === false && (
          <div style={{ background: '#fff8f8', border: '1.5px solid #ffcdd2', borderRadius: 10, padding: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#c62828', margin: '0 0 0.75rem', lineHeight: 1.45 }}>⚠ A deferral will be created and donor status set to <strong>DEFERRED</strong>.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
              <DsField label="Deferral Type">
                <DsSelect value={form.deferralRequest.deferralType} onChange={e => onDeferChange('deferralType', e.target.value)}>
                  <option>TEMPORARY</option><option>PERMANENT</option>
                </DsSelect>
              </DsField>
              <DsField label="Reason" required>
                <DsTextarea rows={2} value={form.deferralRequest.reason} onChange={e => onDeferChange('reason', e.target.value)} placeholder="Describe why the donor is being deferred…" />
              </DsField>
            </div>
          </div>
        )}
      </SectionBlock>

      <SectionBlock icon="📝" title="Additional Notes" noBorder>
        <DsTextarea rows={2} value={form.notes} onChange={e => onFormChange('notes', e.target.value)} placeholder="Any additional observations…" />
      </SectionBlock>
    </DsModal>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ScreeningList({
  screenings, loading, donorId, resultCount, totalCount,   // ← added totalCount
  viewRecord, editRecord, showCreate,
  form, vitals, questionnaire, saving, progressPct,
  scDonorStatus, scDonorName, onScDonorIdChange,
  onDonorIdChange, onSearch, onClearSearch,                // ← added onClearSearch
  onViewRecord, onCloseView, onEditFromView, onEditRecord, onCloseEdit,
  onShowCreate, onCloseCreate,
  onFormChange, onVitalsChange, onQChange, onDeferChange,
  onSaveCreate, onSaveEdit,
}) {
  const columns = [
    { key: 'screeningId', label: 'ID', render: v => <span style={{ fontFamily: 'Courier New', fontSize: '0.8rem', color: '#aaa' }}>#{v}</span> },
    { key: 'screeningDate', label: 'Date', render: v => v || '—' },
    { key: 'vitalsJson', label: 'Hgb / BP', render: v => {
      const vt = safeJson(v, EV)
      if (!vt.hemoglobin && !vt.bpSystolic) return <span style={{ color: '#ccc' }}>—</span>
      return <span style={{ fontSize: '0.83rem', color: '#555' }}>{vt.hemoglobin ? `${vt.hemoglobin} g/dL` : '—'}{vt.bpSystolic ? ` · ${vt.bpSystolic}/${vt.bpDiastolic}` : ''}</span>
    }},
    { key: 'clearedFlag', label: 'Status', render: v => <ClearedBadge cleared={v} /> },
    { key: 'clearedBy', label: 'Cleared By', render: v => v || <span style={{ color: '#ccc', fontStyle: 'italic' }}>—</span> },
  ]

  return (
    <>
      <style>{`
        @keyframes sc-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .sc-root { animation: sc-fadein 0.3s ease both; }
        .sc-search-input { padding: 8px 13px; border: 1.5px solid #e0e0ec; border-radius: 9px; font-size: 0.88rem; outline: none; background: #fafafa; transition: border-color 0.15s; width: 220px; }
        .sc-search-input:focus { border-color: #c62828; background: #fff; }
        .sc-result-chip { padding: 4px 12px; background: #f5f5fa; border-radius: 20px; font-size: 0.77rem; color: #888; font-weight: 500; }
        .dsf-input::placeholder { color: #c0c0cc; }
        @keyframes sc-spin { to { transform: translateY(-50%) rotate(360deg); } }
      `}</style>

      <div className="sc-root">
        <PageHeader title="Pre-Donation Screening">
          <button className="btn-crimson" onClick={onShowCreate}>+ New Screening</button>
        </PageHeader>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <input className="sc-search-input" type="number" placeholder="Search by Donor ID…"
            value={donorId} onChange={onDonorIdChange} onKeyDown={e => e.key === 'Enter' && onSearch()} />
          <button className="btn-crimson" onClick={onSearch} disabled={!donorId?.trim()}>Search</button>

          {/* ── NEW: Show All button — only visible when search is active ── */}
          {donorId?.trim() && (
            <button onClick={onClearSearch}
              style={{ padding: '7px 13px', border: '1.5px solid #ddd', borderRadius: 9, background: 'none', fontSize: '0.83rem', cursor: 'pointer', color: '#888', transition: 'all 0.15s' }}>
              ✕ Show All
            </button>
          )}

          {/* ── NEW: Smart count chip ── */}
          <span className="sc-result-chip">
            {donorId?.trim()
              ? `${resultCount} record${resultCount !== 1 ? 's' : ''} for Donor #${donorId}`
              : `${totalCount} total record${totalCount !== 1 ? 's' : ''}`
            }
          </span>
        </div>

        <div className="table-wrapper">
          <DataTable columns={columns} data={screenings} loading={loading}
            actions={row => (
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <DsBtnInline onClick={() => onViewRecord(row)}>View</DsBtnInline>
                <DsBtnInline onClick={() => onEditRecord(row)}>Edit</DsBtnInline>
              </div>
            )}
          />
        </div>
      </div>

      {viewRecord && <ScreeningViewModal record={viewRecord} onClose={onCloseView} onEdit={onEditFromView} />}
      {editRecord && <ScreeningFormModal editId={editRecord.id} form={form} vitals={vitals} questionnaire={questionnaire} saving={saving} progressPct={progressPct} onClose={onCloseEdit} onSave={onSaveEdit} onFormChange={onFormChange} onVitalsChange={onVitalsChange} onQChange={onQChange} onDeferChange={onDeferChange} />}
      {showCreate && <ScreeningFormModal form={form} vitals={vitals} questionnaire={questionnaire} saving={saving} progressPct={progressPct} onClose={onCloseCreate} onSave={onSaveCreate} onFormChange={onFormChange} onVitalsChange={onVitalsChange} onQChange={onQChange} onDeferChange={onDeferChange} scDonorStatus={scDonorStatus} scDonorName={scDonorName} onScDonorIdChange={onScDonorIdChange} />}
    </>
  )
}