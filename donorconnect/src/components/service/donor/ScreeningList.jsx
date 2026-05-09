import PageHeader from '../../shared/ui/PageHeader'
import DataTable from '../../shared/ui/DataTable'
import DsModal from '../../shared/donor-service/DsModal'
import { DsField, DsInput, DsTextarea, DsSelect } from '../../shared/donor-service/DsField'
import { DsBtnPrimary, DsBtnGhost, DsBtnInline } from '../../shared/donor-service/DsButtons'
import { ClearedBadge } from '../../shared/donor-service/DsBadges'

// ─── Constants ────────────────────────────────────────────────────────────────
const Q_LABELS = {
  recentIllness:    'Had illness in the past 2 weeks?',
  recentMedication: 'Currently on medication?',
  recentTattoo:     'Tattoo / piercing in the past 6 months?',
  recentSurgery:    'Surgery in the past 6 months?',
  traveledAbroad:   'Traveled abroad in the past 3 months?',
  alcoholLast24h:   'Consumed alcohol in the past 24 hours?',
}

const VITALS_CONFIG = [
  { key: 'hemoglobin',   label: 'Hemoglobin',   unit: 'g/dL',  min: '0',  max: '25'  },
  { key: 'bpSystolic',   label: 'BP Systolic',  unit: 'mmHg',  min: '50', max: '250' },
  { key: 'bpDiastolic',  label: 'BP Diastolic', unit: 'mmHg',  min: '30', max: '150' },
  { key: 'weight',       label: 'Weight',       unit: 'kg',    min: '30', max: '300' },
  { key: 'pulse',        label: 'Pulse',        unit: 'bpm',   min: '30', max: '200' },
  { key: 'temperature',  label: 'Temperature',  unit: '°C',    min: '34', max: '42'  },
]

const EV = { hemoglobin: '', bpSystolic: '', bpDiastolic: '', weight: '', pulse: '', temperature: '' }
const EQ = { recentIllness: false, recentMedication: false, recentTattoo: false, recentSurgery: false, traveledAbroad: false, alcoholLast24h: false }
const safeJson = (raw, fb) => { try { return raw ? { ...fb, ...JSON.parse(raw) } : { ...fb } } catch { return { ...fb } } }

// ─── Shared section header ────────────────────────────────────────────────────
function SectionBlock({ icon, title, children, noBorder }) {
  return (
    <div style={{
      padding: '1.1rem 1.5rem',
      borderBottom: noBorder ? 'none' : '1px solid #f4f4f8',
    }}>
      <p style={{
        fontSize: '0.7rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.8px',
        color: '#bbb', margin: '0 0 0.9rem',
        display: 'flex', alignItems: 'center', gap: '0.4rem',
      }}>
        <span>{icon}</span> {title}
      </p>
      {children}
    </div>
  )
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ScreeningViewModal({ record, onClose, onEdit }) {
  const vitals = safeJson(record.vitalsJson, EV)
  const q      = safeJson(record.questionnaireJson, EQ)

  return (
    <DsModal
      show
      size="lg"
      onClose={onClose}
      title={`Screening #${record.screeningId}`}
      subtitle={`Donor ID #${record.donorId} · ${record.screeningDate || '—'}`}
      headerRight={<ClearedBadge cleared={record.clearedFlag} />}
      footer={
        <>
          <DsBtnGhost onClick={onClose}>Close</DsBtnGhost>
          <DsBtnPrimary onClick={onEdit}>✏ Edit</DsBtnPrimary>
        </>
      }
    >
      {/* Vitals + Questionnaire side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <SectionBlock icon="🩺" title="Vitals">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.25rem' }}>
            {VITALS_CONFIG.map(({ key, label, unit }) => (
              <div key={key}>
                <div style={{ fontSize: '0.67rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ccc', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '0.92rem', color: '#1a1a2e' }}>
                  {vitals[key] || '—'}
                  {vitals[key] && <em style={{ fontSize: '0.72rem', color: '#bbb', fontStyle: 'normal', marginLeft: 4 }}>{unit}</em>}
                </div>
              </div>
            ))}
          </div>
        </SectionBlock>

        <div style={{ borderLeft: '1px solid #f4f4f8' }}>
          <SectionBlock icon="📋" title="Questionnaire">
            {Object.entries(Q_LABELS).map(([k, l]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: q[k] ? '#ef5350' : '#c8e6c9', display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.83rem', flex: 1, color: '#555' }}>{l}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: q[k] ? '#c62828' : '#66bb6a' }}>
                  {q[k] ? 'Yes' : 'No'}
                </span>
              </div>
            ))}
          </SectionBlock>
        </div>
      </div>

      {(record.clearedBy || record.notes) && (
        <SectionBlock icon="📝" title="Notes" noBorder>
          {record.clearedBy && (
            <div style={{ marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ccc' }}>Cleared By </span>
              <span style={{ fontSize: '0.88rem' }}>{record.clearedBy}</span>
            </div>
          )}
          {record.notes && <p style={{ fontSize: '0.88rem', color: '#666', margin: 0, lineHeight: 1.5 }}>{record.notes}</p>}
        </SectionBlock>
      )}
    </DsModal>
  )
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
function ScreeningFormModal({
  form, vitals, questionnaire, editId,
  onClose, onSave, saving,
  onFormChange, onVitalsChange, onQChange, onDeferChange,
}) {
  const isEdit = !!editId

  return (
    <DsModal
      show
      size="lg"
      onClose={onClose}
      title={isEdit ? 'Edit Screening' : 'New Screening'}
      subtitle={isEdit ? `Editing record #${editId}` : 'Complete vitals and questionnaire'}
      footer={
        <>
          <DsBtnGhost onClick={onClose} disabled={saving}>Cancel</DsBtnGhost>
          <DsBtnPrimary loading={saving} onClick={onSave}>
            {isEdit ? '✓ Save Changes' : '+ Record Screening'}
          </DsBtnPrimary>
        </>
      }
    >
      {/* ── Basic Info ── */}
      <SectionBlock icon="🪪" title="Basic Info">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
          <DsField label="Donor ID" required>
            <DsInput
              type="number"
              value={form.donorId}
              onChange={e => onFormChange('donorId', e.target.value)}
              placeholder="e.g. 42"
              disabled={isEdit}
              autoFocus={!isEdit}
            />
          </DsField>
          <DsField label="Screening Date">
            <DsInput
              type="date"
              value={form.screeningDate}
              onChange={e => onFormChange('screeningDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </DsField>
          <DsField label="Cleared By">
            <DsInput
              value={form.clearedBy}
              onChange={e => onFormChange('clearedBy', e.target.value)}
              placeholder="Staff name / ID"
            />
          </DsField>
        </div>
      </SectionBlock>

      {/* ── Vitals ── */}
      <SectionBlock icon="🩺" title="Vitals">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
          {VITALS_CONFIG.map(({ key, label, unit, min, max }) => (
            <DsField key={key} label={`${label} (${unit})`}>
              <DsInput
                type="number"
                min={min}
                max={max}
                step="0.1"
                value={vitals[key]}
                onChange={e => onVitalsChange(key, e.target.value)}
                placeholder="—"
              />
            </DsField>
          ))}
        </div>
      </SectionBlock>

      {/* ── Questionnaire ── */}
      <SectionBlock icon="📋" title="Questionnaire">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem' }}>
          {Object.entries(Q_LABELS).map(([k, l]) => (
            <label
              key={k}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', padding: '0.25rem 0' }}
            >
              <input
                type="checkbox"
                checked={questionnaire[k]}
                onChange={e => onQChange(k, e.target.checked)}
                style={{ marginTop: 3, accentColor: '#c62828', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ fontSize: '0.84rem', color: '#444', lineHeight: 1.4 }}>{l}</span>
            </label>
          ))}
        </div>
      </SectionBlock>

      {/* ── Clearance Decision ── */}
      <SectionBlock icon="✅" title="Clearance Decision">
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
          {[
            { flag: true,  label: '✓ Cleared for Donation', activeColor: '#2e7d32', activeBg: '#e8f5e9', activeBorder: '#43a047' },
            { flag: false, label: '✕ Not Cleared — Defer',  activeColor: '#c62828', activeBg: '#ffebee', activeBorder: '#ef5350' },
          ].map(({ flag, label, activeColor, activeBg, activeBorder }) => {
            const active = form.clearedFlag === flag
            return (
              <button
                key={String(flag)}
                type="button"
                onClick={() => onFormChange('clearedFlag', flag)}
                style={{
                  flex: 1, padding: '10px 14px',
                  border: `2px solid ${active ? activeBorder : '#e0e0ec'}`,
                  borderRadius: 10,
                  background: active ? activeBg : '#fafafa',
                  color: active ? activeColor : '#888',
                  fontSize: '0.85rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {!form.clearedFlag && (
          <div style={{
            background: '#fff8f8', border: '1.5px solid #ffcdd2',
            borderRadius: 10, padding: '1rem',
          }}>
            <p style={{ fontSize: '0.8rem', color: '#c62828', margin: '0 0 0.75rem', lineHeight: 1.45 }}>
              ⚠ A deferral will be created and donor status set to <strong>DEFERRED</strong>.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
              <DsField label="Deferral Type">
                <DsSelect
                  value={form.deferralRequest.deferralType}
                  onChange={e => onDeferChange('deferralType', e.target.value)}
                >
                  <option>TEMPORARY</option>
                  <option>PERMANENT</option>
                </DsSelect>
              </DsField>
              <DsField label="Reason" required>
                <DsTextarea
                  rows={2}
                  value={form.deferralRequest.reason}
                  onChange={e => onDeferChange('reason', e.target.value)}
                  placeholder="Describe why the donor is being deferred…"
                />
              </DsField>
            </div>
          </div>
        )}
      </SectionBlock>

      {/* ── Notes ── */}
      <SectionBlock icon="📝" title="Additional Notes" noBorder>
        <DsTextarea
          rows={2}
          value={form.notes}
          onChange={e => onFormChange('notes', e.target.value)}
          placeholder="Any additional observations…"
        />
      </SectionBlock>
    </DsModal>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
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
    {
      key: 'screeningId', label: 'ID',
      render: v => <span style={{ fontFamily: 'Courier New', fontSize: '0.8rem', color: '#aaa' }}>#{v}</span>,
    },
    { key: 'screeningDate', label: 'Date', render: v => v || '—' },
    {
      key: 'vitalsJson', label: 'Hgb / BP',
      render: v => {
        const vt = safeJson(v, EV)
        if (!vt.hemoglobin && !vt.bpSystolic) return <span style={{ color: '#ccc' }}>—</span>
        return (
          <span style={{ fontSize: '0.83rem', color: '#555' }}>
            {vt.hemoglobin ? `${vt.hemoglobin} g/dL` : '—'}
            {vt.bpSystolic ? ` · ${vt.bpSystolic}/${vt.bpDiastolic}` : ''}
          </span>
        )
      },
    },
    { key: 'clearedFlag', label: 'Status',     render: v => <ClearedBadge cleared={v} /> },
    { key: 'clearedBy',   label: 'Cleared By', render: v => v || <span style={{ color: '#ccc', fontStyle: 'italic' }}>—</span> },
  ]

  return (
    <>
      <style>{`
        @keyframes sc-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .sc-root { animation: sc-fadein 0.3s ease both; }
        .sc-search-input {
          padding: 8px 13px; border: 1.5px solid #e0e0ec; border-radius: 9px;
          font-size: 0.88rem; outline: none; background: #fafafa;
          transition: border-color 0.15s; width: 220px;
        }
        .sc-search-input:focus { border-color: #c62828; background: #fff; }
        .sc-result-chip {
          padding: 4px 12px; background: #f5f5fa; border-radius: 20px;
          font-size: 0.77rem; color: #888; font-weight: 500;
        }
      `}</style>

      <div className="sc-root">
        <PageHeader title="Pre-Donation Screening">
          <button className="btn-crimson" onClick={onShowCreate}>+ New Screening</button>
        </PageHeader>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <input
            className="sc-search-input"
            type="number"
            placeholder="Search by Donor ID…"
            value={donorId}
            onChange={onDonorIdChange}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
          />
          <button className="btn-crimson" onClick={onSearch} disabled={!donorId?.trim()}>Search</button>
          {resultCount > 0 && (
            <span className="sc-result-chip">
              {resultCount} record{resultCount !== 1 ? 's' : ''} found
            </span>
          )}
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <DataTable
            columns={columns}
            data={screenings}
            loading={loading}
            actions={row => (
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <DsBtnInline onClick={() => onViewRecord(row)}>View</DsBtnInline>
                <DsBtnInline onClick={() => onEditRecord(row)}>Edit</DsBtnInline>
              </div>
            )}
          />
        </div>
      </div>

      {/* Modals */}
      {viewRecord && (
        <ScreeningViewModal
          record={viewRecord}
          onClose={onCloseView}
          onEdit={onEditFromView}
        />
      )}
      {editRecord && (
        <ScreeningFormModal
          editId={editRecord.id}
          form={form} vitals={vitals} questionnaire={questionnaire}
          saving={saving}
          onClose={onCloseEdit} onSave={onSaveEdit}
          onFormChange={onFormChange} onVitalsChange={onVitalsChange}
          onQChange={onQChange} onDeferChange={onDeferChange}
        />
      )}
      {showCreate && (
        <ScreeningFormModal
          form={form} vitals={vitals} questionnaire={questionnaire}
          saving={saving}
          onClose={onCloseCreate} onSave={onSaveCreate}
          onFormChange={onFormChange} onVitalsChange={onVitalsChange}
          onQChange={onQChange} onDeferChange={onDeferChange}
        />
      )}
    </>
  )
}