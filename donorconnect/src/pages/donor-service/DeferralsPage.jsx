import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

// ─── Constants ────────────────────────────────────────────────────────────────
// Tabs map exactly to available backend endpoints
const TABS = [
  { key: 'ACTIVE',   label: 'Active',   endpoint: '/api/deferrals/active'  },
  { key: 'EXPIRED',  label: 'Expired',  endpoint: '/api/deferrals/expired' },
  { key: 'DONOR',    label: 'By Donor', endpoint: null                     },
];

const DEFERRAL_TYPES = ['TEMPORARY', 'PERMANENT'];

const TYPE_CONFIG = {
  TEMPORARY: { color: '#e65100', bg: '#fff3e0' },
  PERMANENT: { color: '#b71c1c', bg: '#ffebee' },
};

const STATUS_CONFIG = {
  ACTIVE:  { color: '#1b5e20', bg: '#e8f5e9', dot: '#43a047', label: 'Active'  },
  LIFTED:  { color: '#1565c0', bg: '#e3f2fd', dot: '#42a5f5', label: 'Lifted'  },
  EXPIRED: { color: '#555',    bg: '#f5f5f5', dot: '#9e9e9e', label: 'Expired' },
};

const INIT_FORM = { donorId: '', deferralType: 'TEMPORARY', reason: '' };

// ─── Small UI pieces ──────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.TEMPORARY;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: '0.72rem', fontWeight: 700,
      color: cfg.color, background: cfg.bg,
      textTransform: 'uppercase', letterSpacing: '0.4px',
    }}>
      {type}
    </span>
  );
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.EXPIRED;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '0.72rem', fontWeight: 600,
      padding: '3px 10px', borderRadius: 20,
      color: cfg.color, background: cfg.bg,
      textTransform: 'uppercase', letterSpacing: '0.4px',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div className="df-field">
      <label className="df-label">{label}</label>
      {children}
    </div>
  );
}

// ─── Deferral Detail Modal ────────────────────────────────────────────────────
function DeferralDetailModal({ deferral, onClose, onLift, onEdit, lifting }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const canLift = deferral.deferralType === 'TEMPORARY' && deferral.status === 'ACTIVE';

  return (
    <>
      <div className="df-backdrop" onClick={onClose} />
      <div className="df-modal" role="dialog" aria-modal="true">
        <div className="df-modal-header">
          <div>
            <h2 className="df-modal-title">Deferral #{deferral.deferralId}</h2>
            <p className="df-modal-sub">Donor ID #{deferral.donorId}</p>
          </div>
          <div className="df-header-right">
            <TypeBadge type={deferral.deferralType} />
            <button className="df-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="df-divider" />

        <div className="df-modal-body">
          <div className="df-detail-grid">
            <div className="df-detail-row">
              <span className="df-detail-label">Status</span>
              <span className="df-detail-value"><StatusPill status={deferral.status} /></span>
            </div>
            <div className="df-detail-row">
              <span className="df-detail-label">Type</span>
              <span className="df-detail-value"><TypeBadge type={deferral.deferralType} /></span>
            </div>
            <div className="df-detail-row">
              <span className="df-detail-label">Start Date</span>
              <span className="df-detail-value">{deferral.startDate || '—'}</span>
            </div>
            <div className="df-detail-row">
              <span className="df-detail-label">End Date</span>
              <span className="df-detail-value">
                {deferral.deferralType === 'PERMANENT'
                  ? <em style={{ color: '#b71c1c', fontSize: '0.82rem' }}>Permanent — no end date</em>
                  : deferral.endDate || '—'
                }
              </span>
            </div>
            <div className="df-detail-row df-full">
              <span className="df-detail-label">Reason</span>
              <span className="df-detail-value">{deferral.reason || '—'}</span>
            </div>
          </div>

          {deferral.deferralType === 'PERMANENT' && deferral.status === 'ACTIVE' && (
            <div className="df-warning-box">
              ⚠ This is a <strong>permanent deferral</strong>. It cannot be lifted manually.
            </div>
          )}

          {canLift && (
            <div className="df-info-box">
              💡 This deferral can be lifted early. Lifting will restore the donor to <strong>ACTIVE</strong> status if no other active deferrals remain.
            </div>
          )}
        </div>

        <div className="df-divider" />
        <div className="df-modal-footer">
          <button className="df-btn-ghost" onClick={onClose}>Close</button>
          <button className="df-btn-secondary" onClick={onEdit}>✏ Edit</button>
          {canLift && (
            <button className="df-btn-lift" onClick={onLift} disabled={lifting}>
              {lifting ? <><span className="df-btn-spinner" /> Lifting…</> : '↑ Lift Deferral'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Deferral Form Modal (create / edit) ─────────────────────────────────────
function DeferralFormModal({ initial, editId, onClose, onSaved }) {
  const [form, setForm] = useState(initial || INIT_FORM);
  const [saving, setSaving] = useState(false);
  const isEdit = !!editId;

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.donorId) { showError('Donor ID is required'); return; }
    if (!form.reason.trim()) { showError('Reason is required'); return; }

    // Backend auto-sets startDate and endDate — do NOT send them
    const payload = {
      donorId:      Number(form.donorId),
      deferralType: form.deferralType,
      reason:       form.reason.trim(),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/api/deferrals/${editId}`, payload);
        showSuccess('Deferral updated');
      } else {
        await api.post('/api/deferrals', payload);
        showSuccess('Deferral issued — donor status set to DEFERRED');
      }
      onSaved();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save deferral');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="df-backdrop" onClick={onClose} />
      <div className="df-modal" role="dialog" aria-modal="true">
        <div className="df-modal-header">
          <div>
            <h2 className="df-modal-title">{isEdit ? 'Edit Deferral' : 'Issue New Deferral'}</h2>
            <p className="df-modal-sub">
              {isEdit
                ? `Editing deferral #${editId}`
                : 'Donor status will be set to DEFERRED immediately'}
            </p>
          </div>
          <button className="df-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="df-divider" />

        <div className="df-form-body">

          <Field label="Donor ID *">
            <input
              className="df-input"
              type="number"
              value={form.donorId}
              onChange={setF('donorId')}
              placeholder="e.g. 42"
              disabled={isEdit}
            />
          </Field>

          <Field label="Deferral Type">
            <div className="df-type-toggle">
              {DEFERRAL_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`df-type-btn ${form.deferralType === t ? `active-${t.toLowerCase()}` : ''}`}
                  onClick={() => setForm(f => ({ ...f, deferralType: t }))}
                >
                  {t === 'TEMPORARY' ? '⏱ Temporary' : '⛔ Permanent'}
                </button>
              ))}
            </div>
            {form.deferralType === 'TEMPORARY' && (
              <p className="df-type-hint">
                End date will be automatically set to <strong>3 months</strong> from today by the system.
              </p>
            )}
            {form.deferralType === 'PERMANENT' && (
              <p className="df-type-hint df-type-hint-danger">
                ⚠ Permanent deferrals <strong>cannot be lifted</strong>. Use only when required.
              </p>
            )}
          </Field>

          <Field label="Reason *">
            <textarea
              className="df-input df-textarea"
              rows={3}
              value={form.reason}
              onChange={setF('reason')}
              placeholder="Describe the reason for deferral…"
            />
          </Field>

        </div>

        <div className="df-divider" />
        <div className="df-modal-footer">
          <button className="df-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="df-btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><span className="df-btn-spinner" /> Saving…</>
              : isEdit ? '✓ Save Changes' : '+ Issue Deferral'
            }
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DeferralsPage() {
  const [deferrals, setDeferrals]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('ACTIVE');
  const [donorIdSearch, setDonorIdSearch] = useState('');
  const [viewRecord, setViewRecord] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [lifting, setLifting]       = useState(false);

  const load = useCallback((currentTab = tab, donorId = donorIdSearch) => {
    setLoading(true);
    let url;
    if (currentTab === 'DONOR') {
      if (!donorId.trim()) { setDeferrals([]); setLoading(false); return; }
      url = `/api/deferrals/donor/${donorId.trim()}`;
    } else {
      const found = TABS.find(t => t.key === currentTab);
      url = found?.endpoint;
    }
    if (!url) { setLoading(false); return; }

    api.get(url)
      .then(r => setDeferrals(r.data?.data || r.data || []))
      .catch(() => setDeferrals([]))
      .finally(() => setLoading(false));
  }, [tab, donorIdSearch]);

  useEffect(() => { load(tab); }, [tab]);

  const handleLift = async (deferralId) => {
    setLifting(true);
    try {
      await api.patch(`/api/deferrals/${deferralId}/lift`);
      showSuccess('Deferral lifted — donor restored to ACTIVE if no other active deferrals remain');
      setViewRecord(null);
      load(tab);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to lift deferral');
    } finally {
      setLifting(false);
    }
  };

  const handleSaved = () => {
    setShowCreate(false);
    setEditRecord(null);
    load(tab);
  };

  const columns = [
    {
      key: 'deferralId', label: 'ID',
      render: v => <span style={{ fontFamily: 'Courier New', fontSize: '0.8rem', color: '#888' }}>#{v}</span>,
    },
    {
      key: 'donorId', label: 'Donor',
      render: v => <span style={{ fontFamily: 'Courier New', fontSize: '0.82rem' }}>#{v}</span>,
    },
    {
      key: 'deferralType', label: 'Type',
      render: v => <TypeBadge type={v} />,
    },
    {
      key: 'reason', label: 'Reason',
      render: v => (
        <span style={{ fontSize: '0.85rem', color: '#444', maxWidth: 200, display: 'block',
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {v || '—'}
        </span>
      ),
    },
    { key: 'startDate', label: 'Start', render: v => v || '—' },
    {
      key: 'endDate', label: 'End',
      render: (v, row) => row.deferralType === 'PERMANENT'
        ? <span style={{ color: '#b71c1c', fontSize: '0.78rem', fontWeight: 600 }}>Permanent</span>
        : v || '—',
    },
    {
      key: 'status', label: 'Status',
      render: v => <StatusPill status={v} />,
    },
  ];

  const tabCounts = {
    ACTIVE:  deferrals.filter(d => d.status === 'ACTIVE').length,
    EXPIRED: deferrals.filter(d => d.status === 'EXPIRED').length,
  };

  return (
    <>
      <Style />
      <div className="animate-fadein">
        <PageHeader title="Deferral Management">
          <button className="btn-crimson" onClick={() => setShowCreate(true)}>
            + Issue Deferral
          </button>
        </PageHeader>

        {/* ── Tabs ── */}
        <div className="nav-tabs-glass mb-4">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`nav-link${tab === t.key ? ' active' : ''}`}
              onClick={() => { setTab(t.key); setDeferrals([]); }}
            >
              {t.label}
              {/* show live count on active/expired tabs */}
              {(t.key === 'ACTIVE' || t.key === 'EXPIRED') && tab === t.key && deferrals.length > 0 && (
                <span className="df-tab-count">{deferrals.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Donor search (only on DONOR tab) ── */}
        {tab === 'DONOR' && (
          <div className="filter-row mb-4">
            <div className="search-glass" style={{ maxWidth: 260 }}>
              <span className="search-icon">🔍</span>
              <input
                className="form-control"
                type="number"
                placeholder="Donor ID…"
                value={donorIdSearch}
                onChange={e => setDonorIdSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && load('DONOR', donorIdSearch)}
              />
            </div>
            <button
              className="btn-crimson"
              onClick={() => load('DONOR', donorIdSearch)}
              disabled={!donorIdSearch.trim()}
            >
              Search
            </button>
          </div>
        )}

        {/* ── Table ── */}
        <div className="table-wrapper">
          <DataTable
            columns={columns}
            data={deferrals}
            loading={loading}
            actions={row => (
              <div className="d-flex gap-2">
                <button className="btn-glass" onClick={() => setViewRecord(row)}>View</button>
                <button className="btn-glass" onClick={() => setEditRecord({ record: row, id: row.deferralId })}>Edit</button>
                {row.deferralType === 'TEMPORARY' && row.status === 'ACTIVE' && (
                  <button
                    className="df-btn-lift-inline"
                    onClick={async () => {
                      if (window.confirm(`Lift deferral #${row.deferralId}? This will restore the donor to ACTIVE.`)) {
                        await handleLift(row.deferralId);
                      }
                    }}
                  >
                    ↑ Lift
                  </button>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* ── View detail modal ── */}
      {viewRecord && (
        <DeferralDetailModal
          deferral={viewRecord}
          lifting={lifting}
          onClose={() => setViewRecord(null)}
          onEdit={() => { setEditRecord({ record: viewRecord, id: viewRecord.deferralId }); setViewRecord(null); }}
          onLift={() => handleLift(viewRecord.deferralId)}
        />
      )}

      {/* ── Edit modal ── */}
      {editRecord && (
        <DeferralFormModal
          editId={editRecord.id}
          initial={{
            donorId:      editRecord.record.donorId,
            deferralType: editRecord.record.deferralType || 'TEMPORARY',
            reason:       editRecord.record.reason || '',
          }}
          onClose={() => setEditRecord(null)}
          onSaved={handleSaved}
        />
      )}

      {/* ── Create modal ── */}
      {showCreate && (
        <DeferralFormModal
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

      /* Backdrop */
      .df-backdrop {
        position: fixed; inset: 0;
        background: rgba(15,15,30,0.52);
        backdrop-filter: blur(4px);
        z-index: 1000;
        animation: df-fade 0.18s ease;
      }

      /* Modal shell */
      .df-modal {
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: min(500px, calc(100vw - 2rem));
        max-height: calc(100vh - 3rem);
        background: #fff; border-radius: 20px;
        box-shadow: 0 28px 72px rgba(0,0,0,0.22);
        z-index: 1001;
        display: flex; flex-direction: column;
        overflow: hidden;
        font-family: 'DM Sans', sans-serif;
        animation: df-pop 0.22s cubic-bezier(0.34,1.56,0.64,1);
      }

      /* Header */
      .df-modal-header {
        display: flex; align-items: flex-start;
        justify-content: space-between;
        padding: 1.2rem 1.4rem 1rem; gap: 1rem; flex-shrink: 0;
      }
      .df-header-right { display: flex; align-items: center; gap: 0.6rem; flex-shrink: 0; }
      .df-modal-title {
        font-family: 'Syne', sans-serif;
        font-size: 1.1rem; font-weight: 800;
        margin: 0 0 0.2rem; color: #1a1a2e;
      }
      .df-modal-sub { margin: 0; font-size: 0.8rem; color: #888; }

      .df-close-btn {
        width: 28px; height: 28px; border-radius: 50%;
        border: 1.5px solid #e0e0e8;
        background: #fafafa; color: #888;
        font-size: 0.72rem; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.15s;
      }
      .df-close-btn:hover { background: #fff0f0; border-color: #c62828; color: #c62828; }
      .df-divider { height: 1px; background: #f0f0f8; flex-shrink: 0; }

      /* Detail modal body */
      .df-modal-body { padding: 1.2rem 1.4rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
      .df-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem 1.5rem; }
      .df-detail-row  { display: flex; flex-direction: column; gap: 3px; }
      .df-full        { grid-column: 1 / -1; }
      .df-detail-label {
        font-size: 0.68rem; font-weight: 500;
        text-transform: uppercase; letter-spacing: 0.5px; color: #bbb;
      }
      .df-detail-value { font-size: 0.9rem; color: #1a1a2e; }

      .df-warning-box {
        background: #ffebee; border: 1.5px solid #ffcdd2;
        border-radius: 10px; padding: 0.7rem 1rem;
        font-size: 0.82rem; color: #b71c1c; line-height: 1.45;
      }
      .df-info-box {
        background: #e3f2fd; border: 1.5px solid #bbdefb;
        border-radius: 10px; padding: 0.7rem 1rem;
        font-size: 0.82rem; color: #1565c0; line-height: 1.45;
      }

      /* Form body */
      .df-form-body {
        padding: 1.2rem 1.4rem;
        display: flex; flex-direction: column; gap: 1rem;
        overflow-y: auto;
      }
      .df-field { display: flex; flex-direction: column; gap: 0.35rem; }
      .df-label {
        font-size: 0.72rem; font-weight: 500;
        text-transform: uppercase; letter-spacing: 0.6px; color: #888;
      }
      .df-input {
        width: 100%; padding: 9px 13px;
        border: 1.5px solid #e0e0ec; border-radius: 9px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem; color: #1a1a2e;
        background: #fafafa; outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        box-sizing: border-box;
      }
      .df-input:focus { border-color: #c62828; background: #fff; box-shadow: 0 0 0 3px rgba(198,40,40,0.07); }
      .df-input:disabled { opacity: 0.5; cursor: not-allowed; }
      .df-textarea { resize: vertical; min-height: 80px; }

      /* Type toggle */
      .df-type-toggle { display: flex; gap: 0.5rem; }
      .df-type-btn {
        flex: 1; padding: 9px 12px;
        border: 2px solid #e0e0ec; border-radius: 10px;
        background: #fafafa; color: #888;
        font-family: 'Syne', sans-serif;
        font-size: 0.82rem; font-weight: 700;
        cursor: pointer; transition: all 0.15s;
      }
      .df-type-btn.active-temporary { border-color: #e65100; background: #fff3e0; color: #e65100; }
      .df-type-btn.active-permanent { border-color: #b71c1c; background: #ffebee; color: #b71c1c; }
      .df-type-hint {
        font-size: 0.75rem; color: #888;
        margin: 0.35rem 0 0; line-height: 1.4;
      }
      .df-type-hint-danger { color: #b71c1c; }

      /* Tab count badge */
      .df-tab-count {
        display: inline-flex; align-items: center; justify-content: center;
        width: 18px; height: 18px; border-radius: 50%;
        background: #c62828; color: white;
        font-size: 0.65rem; font-weight: 700;
        margin-left: 5px;
      }

      /* Inline lift button in table */
      .df-btn-lift-inline {
        padding: 4px 10px;
        border: 1.5px solid #1565c0; border-radius: 6px;
        background: #e3f2fd; color: #1565c0;
        font-size: 0.75rem; font-weight: 700;
        cursor: pointer; transition: all 0.15s;
        font-family: 'Syne', sans-serif;
      }
      .df-btn-lift-inline:hover { background: #1565c0; color: white; }

      /* Footer */
      .df-modal-footer {
        display: flex; justify-content: flex-end; gap: 0.6rem;
        padding: 0.9rem 1.4rem; flex-shrink: 0;
      }
      .df-btn-ghost {
        padding: 8px 16px; background: none; color: #666;
        border: 1.5px solid #ddd; border-radius: 8px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
      }
      .df-btn-ghost:hover:not(:disabled) { background: #f5f5f5; }
      .df-btn-ghost:disabled { opacity: 0.5; }
      .df-btn-secondary {
        padding: 8px 16px; background: #f5f5f5; color: #333;
        border: 1.5px solid #ddd; border-radius: 8px;
        font-family: 'Syne', sans-serif;
        font-size: 0.85rem; font-weight: 700; cursor: pointer;
        transition: all 0.15s;
      }
      .df-btn-secondary:hover { background: #e8e8e8; }
      .df-btn-primary {
        display: inline-flex; align-items: center; gap: 0.4rem;
        padding: 8px 20px; background: #c62828; color: white;
        border: none; border-radius: 8px;
        font-family: 'Syne', sans-serif;
        font-size: 0.85rem; font-weight: 700;
        cursor: pointer; transition: background 0.15s, transform 0.1s;
      }
      .df-btn-primary:hover:not(:disabled) { background: #b71c1c; transform: translateY(-1px); }
      .df-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      .df-btn-lift {
        display: inline-flex; align-items: center; gap: 0.4rem;
        padding: 8px 18px; background: #1565c0; color: white;
        border: none; border-radius: 8px;
        font-family: 'Syne', sans-serif;
        font-size: 0.85rem; font-weight: 700;
        cursor: pointer; transition: background 0.15s;
      }
      .df-btn-lift:hover:not(:disabled) { background: #0d47a1; }
      .df-btn-lift:disabled { opacity: 0.6; cursor: not-allowed; }
      .df-btn-spinner {
        width: 12px; height: 12px;
        border: 2px solid rgba(255,255,255,0.4);
        border-top-color: white; border-radius: 50%;
        animation: df-spin 0.7s linear infinite;
        display: inline-block;
      }

      @keyframes df-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes df-pop  {
        from { opacity: 0; transform: translate(-50%, -47%) scale(0.94); }
        to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes df-spin { to { transform: rotate(360deg); } }

      @media (max-width: 480px) {
        .df-detail-grid { grid-template-columns: 1fr; }
        .df-full { grid-column: 1; }
        .df-type-toggle { flex-direction: column; }
      }
    `}</style>
  );
}