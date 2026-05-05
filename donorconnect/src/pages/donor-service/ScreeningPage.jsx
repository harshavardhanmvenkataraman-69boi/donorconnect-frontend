import { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFERRAL_TYPES = ['TEMPORARY', 'PERMANENT'];

const EMPTY_VITALS = {
  hemoglobin:   '',
  bpSystolic:   '',
  bpDiastolic:  '',
  weight:       '',
  pulse:        '',
  temperature:  '',
};

const EMPTY_QUESTIONNAIRE = {
  recentIllness:      false,
  recentMedication:   false,
  recentTattoo:       false,
  recentSurgery:      false,
  traveledAbroad:     false,
  alcoholLast24h:     false,
};

const QUESTIONNAIRE_LABELS = {
  recentIllness:    'Had illness in the past 2 weeks?',
  recentMedication: 'Currently on medication?',
  recentTattoo:     'Tattoo / piercing in the past 6 months?',
  recentSurgery:    'Surgery in the past 6 months?',
  traveledAbroad:   'Traveled abroad in the past 3 months?',
  alcoholLast24h:   'Consumed alcohol in the past 24 hours?',
};

const INIT_FORM = {
  donorId:       '',
  screeningDate: new Date().toISOString().split('T')[0],
  clearedBy:     '',
  notes:         '',
  clearedFlag:   true,
  deferralRequest: { deferralType: 'TEMPORARY', reason: '' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const safeParseJson = (raw, fallback) => {
  try { return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback }; }
  catch { return { ...fallback }; }
};

// ─── Field components ─────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div className="sc-field">
      <label className="sc-label">{label}</label>
      {hint && <span className="sc-hint">{hint}</span>}
      {children}
    </div>
  );
}

function NumInput({ label, hint, value, onChange, unit, min, max, step = '0.1' }) {
  return (
    <Field label={label} hint={hint}>
      <div className="sc-input-unit">
        <input
          className="sc-input"
          type="number"
          min={min} max={max} step={step}
          value={value}
          onChange={onChange}
          placeholder="—"
        />
        {unit && <span className="sc-unit">{unit}</span>}
      </div>
    </Field>
  );
}

// ─── Screening Detail Modal (view existing) ───────────────────────────────────
function ScreeningDetailModal({ record, onClose, onEdit }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const vitals = safeParseJson(record.vitalsJson, EMPTY_VITALS);
  const q      = safeParseJson(record.questionnaireJson, EMPTY_QUESTIONNAIRE);

  return (
    <>
      <div className="sc-backdrop" onClick={onClose} />
      <div className="sc-modal" role="dialog" aria-modal="true">

        <div className="sc-modal-header">
          <div>
            <h2 className="sc-modal-title">Screening #{record.screeningId}</h2>
            <p className="sc-modal-sub">Donor ID #{record.donorId} · {record.screeningDate || '—'}</p>
          </div>
          <div className="sc-modal-header-right">
            <span className={`sc-cleared-badge ${record.clearedFlag ? 'cleared' : 'deferred'}`}>
              {record.clearedFlag ? '✓ Cleared' : '✕ Not Cleared'}
            </span>
            <button className="sc-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="sc-modal-divider" />

        <div className="sc-modal-body">

          <div className="sc-view-section">
            <p className="sc-view-section-title">🩺 Vitals</p>
            <div className="sc-view-grid">
              {[
                ['Hemoglobin',   vitals.hemoglobin,  'g/dL'],
                ['BP Systolic',  vitals.bpSystolic,  'mmHg'],
                ['BP Diastolic', vitals.bpDiastolic, 'mmHg'],
                ['Weight',       vitals.weight,      'kg'],
                ['Pulse',        vitals.pulse,       'bpm'],
                ['Temperature',  vitals.temperature, '°C'],
              ].map(([l, v, u]) => (
                <div key={l} className="sc-view-row">
                  <span className="sc-view-label">{l}</span>
                  <span className="sc-view-value">{v || '—'} {v ? <em>{u}</em> : ''}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sc-view-section">
            <p className="sc-view-section-title">📋 Questionnaire</p>
            <div className="sc-q-list">
              {Object.entries(QUESTIONNAIRE_LABELS).map(([k, l]) => (
                <div key={k} className="sc-q-view-row">
                  <span className={`sc-q-dot ${q[k] ? 'yes' : 'no'}`} />
                  <span className="sc-q-text">{l}</span>
                  <span className={`sc-q-ans ${q[k] ? 'yes' : 'no'}`}>{q[k] ? 'Yes' : 'No'}</span>
                </div>
              ))}
            </div>
          </div>

          {(record.clearedBy || record.notes) && (
            <div className="sc-view-section sc-full">
              <p className="sc-view-section-title">📝 Notes</p>
              {record.clearedBy && (
                <div className="sc-view-row"><span className="sc-view-label">Cleared By</span><span className="sc-view-value">{record.clearedBy}</span></div>
              )}
              {record.notes && <p className="sc-notes-text">{record.notes}</p>}
            </div>
          )}

        </div>

        <div className="sc-modal-divider" />
        <div className="sc-modal-footer">
          <button className="sc-btn-ghost" onClick={onClose}>Close</button>
          <button className="sc-btn-primary" onClick={onEdit}>✏ Edit</button>
        </div>
      </div>
    </>
  );
}

// ─── Screening Form Modal (create / edit) ─────────────────────────────────────
function ScreeningFormModal({ initial, editId, onClose, onSaved }) {
  const [form, setForm]     = useState(initial);
  const [vitals, setVitals] = useState(
    safeParseJson(initial?.vitalsJson, EMPTY_VITALS)
  );
  const [questionnaire, setQuestionnaire] = useState(
    safeParseJson(initial?.questionnaireJson, EMPTY_QUESTIONNAIRE)
  );
  const [saving, setSaving] = useState(false);
  const isEdit = !!editId;

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const setF   = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setV   = (k) => (e) => setVitals(v => ({ ...v, [k]: e.target.value }));
  const setQ   = (k) => (e) => setQuestionnaire(q => ({ ...q, [k]: e.target.checked }));
  const setDef = (k) => (e) => setForm(f => ({ ...f, deferralRequest: { ...f.deferralRequest, [k]: e.target.value } }));

  const handleSubmit = async () => {
    if (!form.donorId) { showError('Donor ID is required'); return; }
    if (!form.clearedFlag && !form.deferralRequest.reason.trim()) {
      showError('Deferral reason is required when donor is not cleared'); return;
    }

    setSaving(true);
    const payload = {
      donorId:          Number(form.donorId),
      screeningDate:    form.screeningDate,
      clearedFlag:      form.clearedFlag,
      clearedBy:        form.clearedBy || null,
      notes:            form.notes || null,
      vitalsJson:       JSON.stringify(vitals),
      questionnaireJson: JSON.stringify(questionnaire),
      ...(form.clearedFlag ? {} : {
        deferralRequest: {
          donorId:      Number(form.donorId),
          deferralType: form.deferralRequest.deferralType,
          reason:       form.deferralRequest.reason,
        },
      }),
    };

    try {
      if (isEdit) {
        await api.put(`/api/screenings/${editId}`, payload);
        showSuccess('Screening updated');
      } else {
        await api.post('/api/screenings', payload);
        showSuccess('Screening recorded');
      }
      onSaved();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save screening');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="sc-backdrop" onClick={onClose} />
      <div className="sc-modal sc-modal-lg" role="dialog" aria-modal="true">

        <div className="sc-modal-header">
          <div>
            <h2 className="sc-modal-title">{isEdit ? 'Edit Screening' : 'New Screening'}</h2>
            <p className="sc-modal-sub">{isEdit ? `Editing record #${editId}` : 'Complete vitals and questionnaire'}</p>
          </div>
          <button className="sc-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="sc-modal-divider" />

        <div className="sc-modal-body sc-form-body">

          {/* ── Basic info ── */}
          <div className="sc-form-section">
            <p className="sc-form-section-title">🪪 Basic Info</p>
            <div className="sc-form-grid sc-grid-3">
              <Field label="Donor ID *">
                <input
                  className="sc-input"
                  type="number"
                  value={form.donorId}
                  onChange={setF('donorId')}
                  placeholder="e.g. 42"
                  disabled={isEdit}
                />
              </Field>
              <Field label="Screening Date">
                <input
                  className="sc-input"
                  type="date"
                  value={form.screeningDate}
                  onChange={setF('screeningDate')}
                  max={new Date().toISOString().split('T')[0]}
                />
              </Field>
              <Field label="Cleared By">
                <input
                  className="sc-input"
                  type="text"
                  value={form.clearedBy}
                  onChange={setF('clearedBy')}
                  placeholder="Staff name / ID"
                />
              </Field>
            </div>
          </div>

          {/* ── Vitals ── */}
          <div className="sc-form-section">
            <p className="sc-form-section-title">🩺 Vitals</p>
            <div className="sc-form-grid sc-grid-3">
              <NumInput label="Hemoglobin"   unit="g/dL" min="0"   max="25"  value={vitals.hemoglobin}   onChange={setV('hemoglobin')} />
              <NumInput label="BP Systolic"  unit="mmHg" min="50"  max="250" step="1" value={vitals.bpSystolic}  onChange={setV('bpSystolic')} />
              <NumInput label="BP Diastolic" unit="mmHg" min="30"  max="150" step="1" value={vitals.bpDiastolic} onChange={setV('bpDiastolic')} />
              <NumInput label="Weight"       unit="kg"   min="30"  max="300" value={vitals.weight}       onChange={setV('weight')} />
              <NumInput label="Pulse"        unit="bpm"  min="30"  max="200" step="1" value={vitals.pulse}       onChange={setV('pulse')} />
              <NumInput label="Temperature"  unit="°C"   min="34"  max="42"  value={vitals.temperature}  onChange={setV('temperature')} />
            </div>
          </div>

          {/* ── Questionnaire ── */}
          <div className="sc-form-section">
            <p className="sc-form-section-title">📋 Questionnaire</p>
            <div className="sc-q-grid">
              {Object.entries(QUESTIONNAIRE_LABELS).map(([k, l]) => (
                <label key={k} className="sc-q-item">
                  <input
                    type="checkbox"
                    className="sc-q-check"
                    checked={questionnaire[k]}
                    onChange={setQ(k)}
                  />
                  <span className="sc-q-label">{l}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Clearance ── */}
          <div className="sc-form-section">
            <p className="sc-form-section-title">✅ Clearance Decision</p>

            <div className="sc-toggle-row">
              <button
                type="button"
                className={`sc-toggle-btn ${form.clearedFlag ? 'cleared' : ''}`}
                onClick={() => setForm(f => ({ ...f, clearedFlag: true }))}
              >
                ✓ Cleared for Donation
              </button>
              <button
                type="button"
                className={`sc-toggle-btn ${!form.clearedFlag ? 'not-cleared' : ''}`}
                onClick={() => setForm(f => ({ ...f, clearedFlag: false }))}
              >
                ✕ Not Cleared — Defer
              </button>
            </div>

            {/* Deferral fields — only when not cleared */}
            {!form.clearedFlag && (
              <div className="sc-deferral-box">
                <p className="sc-deferral-warning">
                  ⚠ A deferral will be automatically created and the donor status will be set to <strong>DEFERRED</strong>.
                </p>
                <div className="sc-form-grid sc-grid-2">
                  <Field label="Deferral Type">
                    <div className="sc-select-wrap">
                      <select
                        className="sc-select"
                        value={form.deferralRequest.deferralType}
                        onChange={setDef('deferralType')}
                      >
                        {DEFERRAL_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <span className="sc-chevron">▾</span>
                    </div>
                  </Field>
                  <div /> {/* spacer */}
                  <div className="sc-span-2">
                    <Field label="Deferral Reason *">
                      <textarea
                        className="sc-input sc-textarea"
                        rows={2}
                        value={form.deferralRequest.reason}
                        onChange={setDef('reason')}
                        placeholder="Describe why the donor is being deferred…"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Notes ── */}
          <div className="sc-form-section">
            <p className="sc-form-section-title">📝 Notes</p>
            <Field label="Additional Notes">
              <textarea
                className="sc-input sc-textarea"
                rows={2}
                value={form.notes}
                onChange={setF('notes')}
                placeholder="Any additional observations…"
              />
            </Field>
          </div>

        </div>

        <div className="sc-modal-divider" />
        <div className="sc-modal-footer">
          <button className="sc-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="sc-btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><span className="sc-btn-spinner" /> Saving…</>
              : isEdit ? '✓ Save Changes' : '+ Record Screening'
            }
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ScreeningPage() {
  const [donorId, setDonorId]         = useState('');
  const [screenings, setScreenings]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [viewRecord, setViewRecord]   = useState(null);   // for detail modal
  const [editRecord, setEditRecord]   = useState(null);   // for edit modal  { record, id }
  const [showCreate, setShowCreate]   = useState(false);
  const searchInputRef                = useRef(null);

  const search = (id = donorId) => {
    const val = String(id).trim();
    if (!val) return;
    setLoading(true);
    api.get(`/api/screenings/donor/${val}`)
      .then(r => setScreenings(r.data?.data || r.data || []))
      .catch(() => setScreenings([]))
      .finally(() => setLoading(false));
  };

  const handleSaved = () => {
    setShowCreate(false);
    setEditRecord(null);
    search();
  };

  const columns = [
    {
      key: 'screeningId', label: 'ID',
      render: v => <span style={{ fontFamily: 'Courier New', fontSize: '0.8rem', color: '#888' }}>#{v}</span>,
    },
    {
      key: 'screeningDate', label: 'Date',
      render: v => v || '—',
    },
    {
      key: 'vitalsJson', label: 'Hgb / BP',
      render: v => {
        const vt = safeParseJson(v, EMPTY_VITALS);
        if (!vt.hemoglobin && !vt.bpSystolic) return <span style={{ color: '#bbb' }}>—</span>;
        return (
          <span style={{ fontSize: '0.82rem', color: '#444' }}>
            {vt.hemoglobin ? `${vt.hemoglobin} g/dL` : '—'}
            {vt.bpSystolic ? ` · ${vt.bpSystolic}/${vt.bpDiastolic}` : ''}
          </span>
        );
      },
    },
    {
      key: 'clearedFlag', label: 'Status',
      render: v => (
        <span className={`sc-cleared-badge ${v ? 'cleared' : 'deferred'}`}>
          {v ? '✓ Cleared' : '✕ Not Cleared'}
        </span>
      ),
    },
    {
      key: 'clearedBy', label: 'Cleared By',
      render: v => v || <span style={{ color: '#bbb' }}>—</span>,
    },
  ];

  return (
    <>
      <Style />
      <div className="animate-fadein">
        <PageHeader title="Pre-Donation Screening">
          <button className="btn-crimson" onClick={() => setShowCreate(true)}>
            + New Screening
          </button>
        </PageHeader>

        {/* ── Search bar ── */}
        <div className="filter-row mb-4">
          <div className="search-glass" style={{ maxWidth: 260 }}>
            <span className="search-icon">🔍</span>
            <input
              ref={searchInputRef}
              className="form-control"
              type="number"
              placeholder="Donor ID…"
              value={donorId}
              onChange={e => setDonorId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
          </div>
          <button className="btn-crimson" onClick={() => search()} disabled={!donorId.trim()}>
            Search
          </button>
          {screenings.length > 0 && (
            <span className="sc-result-count">{screenings.length} record{screenings.length !== 1 ? 's' : ''} found</span>
          )}
        </div>

        {/* ── Table ── */}
        <div className="table-wrapper">
          <DataTable
            columns={columns}
            data={screenings}
            loading={loading}
            actions={row => (
              <div className="d-flex gap-2">
                <button className="btn-glass" onClick={() => setViewRecord(row)}>View</button>
                <button className="btn-glass" onClick={() => setEditRecord({ record: row, id: row.screeningId })}>Edit</button>
              </div>
            )}
          />
        </div>
      </div>

      {/* ── View detail modal ── */}
      {viewRecord && (
        <ScreeningDetailModal
          record={viewRecord}
          onClose={() => setViewRecord(null)}
          onEdit={() => { setEditRecord({ record: viewRecord, id: viewRecord.screeningId }); setViewRecord(null); }}
        />
      )}

      {/* ── Edit modal ── */}
      {editRecord && (
        <ScreeningFormModal
          editId={editRecord.id}
          initial={{
            donorId:       editRecord.record.donorId,
            screeningDate: editRecord.record.screeningDate || new Date().toISOString().split('T')[0],
            clearedBy:     editRecord.record.clearedBy || '',
            notes:         editRecord.record.notes || '',
            clearedFlag:   editRecord.record.clearedFlag ?? true,
            vitalsJson:    editRecord.record.vitalsJson,
            questionnaireJson: editRecord.record.questionnaireJson,
            deferralRequest: { deferralType: 'TEMPORARY', reason: '' },
          }}
          onClose={() => setEditRecord(null)}
          onSaved={handleSaved}
        />
      )}

      {/* ── Create modal ── */}
      {showCreate && (
        <ScreeningFormModal
          initial={{ ...INIT_FORM, donorId: donorId || '' }}
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

      /* ── Backdrop & modal shell ── */
      .sc-backdrop {
        position: fixed; inset: 0;
        background: rgba(15,15,30,0.52);
        backdrop-filter: blur(4px);
        z-index: 1000;
        animation: sc-fade 0.18s ease;
      }
      .sc-modal {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: min(520px, calc(100vw - 2rem));
        max-height: calc(100vh - 3rem);
        background: #fff;
        border-radius: 20px;
        box-shadow: 0 28px 72px rgba(0,0,0,0.22);
        z-index: 1001;
        display: flex; flex-direction: column;
        overflow: hidden;
        font-family: 'DM Sans', sans-serif;
        animation: sc-pop 0.22s cubic-bezier(0.34,1.56,0.64,1);
      }
      .sc-modal-lg { width: min(700px, calc(100vw - 2rem)); }

      /* ── Modal header ── */
      .sc-modal-header {
        display: flex; align-items: flex-start;
        justify-content: space-between;
        padding: 1.2rem 1.4rem 1rem; gap: 1rem; flex-shrink: 0;
      }
      .sc-modal-header-right { display: flex; align-items: center; gap: 0.6rem; flex-shrink: 0; }
      .sc-modal-title {
        font-family: 'Syne', sans-serif;
        font-size: 1.15rem; font-weight: 800;
        margin: 0 0 0.2rem; color: #1a1a2e;
      }
      .sc-modal-sub { margin: 0; font-size: 0.82rem; color: #888; }

      .sc-close-btn {
        width: 28px; height: 28px; border-radius: 50%;
        border: 1.5px solid #e0e0e8;
        background: #fafafa; color: #888;
        font-size: 0.72rem; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.15s; flex-shrink: 0;
      }
      .sc-close-btn:hover { background: #fff0f0; border-color: #c62828; color: #c62828; }

      .sc-modal-divider { height: 1px; background: #f0f0f8; flex-shrink: 0; }

      /* ── Cleared badge ── */
      .sc-cleared-badge {
        display: inline-flex; align-items: center;
        padding: 3px 10px; border-radius: 20px;
        font-size: 0.72rem; font-weight: 700;
        letter-spacing: 0.3px;
      }
      .sc-cleared-badge.cleared  { background: #e8f5e9; color: #2e7d32; }
      .sc-cleared-badge.deferred { background: #ffebee; color: #c62828; }

      /* ── Modal body ── */
      .sc-modal-body {
        padding: 1.2rem 1.4rem;
        overflow-y: auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem 2rem;
      }
      .sc-form-body { display: flex; flex-direction: column; gap: 0; padding: 0; }

      /* ── View sections ── */
      .sc-view-section { display: flex; flex-direction: column; gap: 0.55rem; }
      .sc-full { grid-column: 1 / -1; }
      .sc-view-section-title {
        font-family: 'Syne', sans-serif;
        font-size: 0.7rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.8px;
        color: #bbb; margin: 0 0 0.1rem;
      }
      .sc-view-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1.5rem; }
      .sc-view-row  { display: flex; flex-direction: column; gap: 1px; }
      .sc-view-label { font-size: 0.67rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #ccc; }
      .sc-view-value { font-size: 0.9rem; color: #1a1a2e; }
      .sc-view-value em { font-style: normal; font-size: 0.75rem; color: #999; margin-left: 2px; }
      .sc-notes-text { font-size: 0.88rem; color: #444; line-height: 1.5; margin: 0.25rem 0 0; }

      /* ── Questionnaire view ── */
      .sc-q-list { display: flex; flex-direction: column; gap: 0.35rem; }
      .sc-q-view-row { display: flex; align-items: center; gap: 0.5rem; }
      .sc-q-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
      .sc-q-dot.yes { background: #ef5350; }
      .sc-q-dot.no  { background: #c8e6c9; }
      .sc-q-text { font-size: 0.83rem; color: #444; flex: 1; }
      .sc-q-ans  { font-size: 0.72rem; font-weight: 700; }
      .sc-q-ans.yes { color: #c62828; }
      .sc-q-ans.no  { color: #66bb6a; }

      /* ── Form sections ── */
      .sc-form-section {
        padding: 1.1rem 1.4rem;
        border-bottom: 1px solid #f8f8fc;
      }
      .sc-form-section:last-child { border-bottom: none; }
      .sc-form-section-title {
        font-family: 'Syne', sans-serif;
        font-size: 0.72rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.7px;
        color: #aaa; margin: 0 0 0.9rem;
      }
      .sc-form-grid { display: grid; gap: 0.75rem; }
      .sc-grid-2 { grid-template-columns: 1fr 1fr; }
      .sc-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
      .sc-span-2 { grid-column: 1 / -1; }

      /* ── Field ── */
      .sc-field { display: flex; flex-direction: column; gap: 0.3rem; }
      .sc-label {
        font-size: 0.72rem; font-weight: 500;
        text-transform: uppercase; letter-spacing: 0.6px; color: #888;
      }
      .sc-hint { font-size: 0.68rem; color: #bbb; margin-top: -2px; }

      .sc-input-unit { position: relative; }
      .sc-input {
        width: 100%; padding: 8px 12px;
        border: 1.5px solid #e0e0ec; border-radius: 9px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem; color: #1a1a2e;
        background: #fafafa; outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        box-sizing: border-box;
      }
      .sc-input:focus { border-color: #c62828; background: #fff; box-shadow: 0 0 0 3px rgba(198,40,40,0.07); }
      .sc-input:disabled { opacity: 0.5; cursor: not-allowed; }
      .sc-textarea { resize: vertical; min-height: 64px; }
      .sc-unit {
        position: absolute; right: 10px; top: 50%;
        transform: translateY(-50%);
        font-size: 0.7rem; color: #aaa; pointer-events: none;
      }

      .sc-select-wrap { position: relative; }
      .sc-select {
        width: 100%; padding: 8px 32px 8px 12px;
        border: 1.5px solid #e0e0ec; border-radius: 9px;
        appearance: none; font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem; background: #fafafa;
        color: #1a1a2e; outline: none; cursor: pointer;
        transition: border-color 0.15s;
        box-sizing: border-box;
      }
      .sc-select:focus { border-color: #c62828; }
      .sc-chevron {
        position: absolute; right: 10px; top: 50%;
        transform: translateY(-50%);
        font-size: 0.72rem; color: #888; pointer-events: none;
      }

      /* ── Questionnaire checkboxes ── */
      .sc-q-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1.5rem; }
      .sc-q-item {
        display: flex; align-items: flex-start; gap: 0.5rem;
        cursor: pointer; padding: 0.3rem 0;
      }
      .sc-q-check { margin-top: 2px; accent-color: #c62828; cursor: pointer; flex-shrink: 0; }
      .sc-q-label { font-size: 0.82rem; color: #444; line-height: 1.4; }

      /* ── Clearance toggle ── */
      .sc-toggle-row { display: flex; gap: 0.6rem; margin-bottom: 0.9rem; flex-wrap: wrap; }
      .sc-toggle-btn {
        flex: 1; padding: 9px 14px;
        border: 2px solid #e0e0ec; border-radius: 10px;
        background: #fafafa; color: #888;
        font-family: 'Syne', sans-serif;
        font-size: 0.82rem; font-weight: 700;
        cursor: pointer; transition: all 0.15s;
        white-space: nowrap;
      }
      .sc-toggle-btn.cleared    { border-color: #43a047; background: #e8f5e9; color: #2e7d32; }
      .sc-toggle-btn.not-cleared{ border-color: #c62828; background: #ffebee; color: #c62828; }

      /* ── Deferral box ── */
      .sc-deferral-box {
        background: #fff8f8;
        border: 1.5px solid #ffcdd2;
        border-radius: 10px;
        padding: 0.9rem 1rem;
      }
      .sc-deferral-warning {
        font-size: 0.8rem; color: #c62828;
        margin: 0 0 0.75rem;
        line-height: 1.45;
      }

      /* ── Result count ── */
      .sc-result-count {
        font-size: 0.8rem; color: #888;
        padding: 4px 10px;
        background: #f0f0f8;
        border-radius: 20px;
        font-weight: 500;
      }

      /* ── Modal footer ── */
      .sc-modal-footer {
        display: flex; justify-content: flex-end; gap: 0.6rem;
        padding: 0.9rem 1.4rem; flex-shrink: 0;
      }
      .sc-btn-ghost {
        padding: 8px 18px; background: none; color: #666;
        border: 1.5px solid #ddd; border-radius: 8px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
      }
      .sc-btn-ghost:hover:not(:disabled) { background: #f5f5f5; }
      .sc-btn-ghost:disabled { opacity: 0.5; }
      .sc-btn-primary {
        display: inline-flex; align-items: center; gap: 0.4rem;
        padding: 8px 20px; background: #c62828; color: white;
        border: none; border-radius: 8px;
        font-family: 'Syne', sans-serif;
        font-size: 0.85rem; font-weight: 700;
        cursor: pointer; transition: background 0.15s, transform 0.1s;
      }
      .sc-btn-primary:hover:not(:disabled) { background: #b71c1c; transform: translateY(-1px); }
      .sc-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      .sc-btn-spinner {
        width: 12px; height: 12px;
        border: 2px solid rgba(255,255,255,0.4);
        border-top-color: white; border-radius: 50%;
        animation: sc-spin 0.7s linear infinite;
        display: inline-block;
      }

      /* ── Animations ── */
      @keyframes sc-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes sc-pop  {
        from { opacity: 0; transform: translate(-50%, -47%) scale(0.94); }
        to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes sc-spin { to { transform: rotate(360deg); } }

      @media (max-width: 500px) {
        .sc-modal-body { grid-template-columns: 1fr; }
        .sc-full, .sc-span-2 { grid-column: 1; }
        .sc-grid-2, .sc-grid-3 { grid-template-columns: 1fr; }
        .sc-q-grid { grid-template-columns: 1fr; }
        .sc-view-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}