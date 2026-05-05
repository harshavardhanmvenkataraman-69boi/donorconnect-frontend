import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import { getRole } from '../../api/authUtils';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

// ─── Constants ────────────────────────────────────────────────────────────────
// Exact AppointmentStatus enum values from backend
const APPT_STATUS_CONFIG = {
  BOOKED:     { color: '#1565c0', bg: '#e3f2fd', dot: '#42a5f5', label: 'Booked'     },
  CHECKED_IN: { color: '#e65100', bg: '#fff3e0', dot: '#fb8c00', label: 'Checked In' },
  COMPLETED:  { color: '#1b5e20', bg: '#e8f5e9', dot: '#43a047', label: 'Completed'  },
  CANCELLED:  { color: '#555',    bg: '#f5f5f5', dot: '#9e9e9e', label: 'Cancelled'  },
  NO_SHOW:    { color: '#b71c1c', bg: '#ffebee', dot: '#e53935', label: 'No Show'    },
};

/**
 * Valid action buttons per status — matches exact backend transition rules:
 *   BOOKED     → check-in (RECEPTION), cancel (ALL), no-show (RECEPTION)
 *   CHECKED_IN → complete (RECEPTION), cancel (ALL)
 *   COMPLETED / CANCELLED → no actions
 */
const APPT_ACTIONS = {
  BOOKED: [
    { label: '✓ Check In', endpoint: 'check-in', role: 'RECEPTION', style: 'green'  },
    { label: '⚠ No Show',  endpoint: 'no-show',  role: 'RECEPTION', style: 'orange' },
    { label: '✕ Cancel',   endpoint: 'cancel',   role: 'ALL',       style: 'grey', confirm: true },
  ],
  CHECKED_IN: [
    { label: '✓ Complete', endpoint: 'complete', role: 'RECEPTION', style: 'green' },
    { label: '✕ Cancel',   endpoint: 'cancel',   role: 'ALL',       style: 'grey', confirm: true },
  ],
  COMPLETED:  [],
  CANCELLED:  [],
  NO_SHOW:    [],
};

const ACTION_STYLES = {
  green:  { border: '#43a047', bg: '#e8f5e9', color: '#2e7d32', hoverBg: '#2e7d32' },
  orange: { border: '#fb8c00', bg: '#fff3e0', color: '#e65100', hoverBg: '#e65100' },
  grey:   { border: '#ddd',    bg: '#fafafa', color: '#666',    hoverBg: '#555'    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDateTime = (v) => v
  ? new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  : '—';

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = APPT_STATUS_CONFIG[status];
  if (!cfg) return <span style={{ color: '#bbb', fontSize: '0.78rem' }}>{status || '—'}</span>;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '0.72rem', fontWeight: 600,
      padding: '3px 10px', borderRadius: 20,
      color: cfg.color, background: cfg.bg,
      textTransform: 'uppercase', letterSpacing: '0.4px',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onCancel]);

  return (
    <>
      <div className="ap-backdrop ap-backdrop-top" onClick={onCancel} />
      <div className="ap-confirm" role="alertdialog">
        <p className="ap-confirm-msg">{message}</p>
        <div className="ap-confirm-actions">
          <button className="ap-btn-ghost" onClick={onCancel}>No, keep it</button>
          <button className="ap-btn-danger" onClick={onConfirm}>Yes, cancel</button>
        </div>
      </div>
    </>
  );
}

// ─── Appointment Detail Modal ─────────────────────────────────────────────────
function ApptDetailModal({ appt, drives, onClose, onAction }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const drive = drives.find(d => d.driveId === appt.driveId);
  const actions = APPT_ACTIONS[appt.status] || [];
  const role = getRole();
  const canAction = (actionRole) => actionRole === 'ALL' || role === 'ROLE_RECEPTION' || role === 'ROLE_ADMIN';

  return (
    <>
      <div className="ap-backdrop" onClick={onClose} />
      <div className="ap-modal" role="dialog" aria-modal="true">

        <div className="ap-modal-header">
          <div>
            <h2 className="ap-modal-title">Appointment #{appt.appointmentId}</h2>
            <p className="ap-modal-sub">Donor #{appt.donorId}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <StatusPill status={appt.status} />
            <button className="ap-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="ap-divider" />

        <div className="ap-detail-body">
          <div className="ap-detail-grid">
            <div className="ap-detail-row">
              <span className="ap-detail-label">Appointment ID</span>
              <span className="ap-detail-value" style={{ fontFamily: 'Courier New' }}>#{appt.appointmentId}</span>
            </div>
            <div className="ap-detail-row">
              <span className="ap-detail-label">Donor ID</span>
              <span className="ap-detail-value" style={{ fontFamily: 'Courier New' }}>#{appt.donorId}</span>
            </div>
            <div className="ap-detail-row">
              <span className="ap-detail-label">Date &amp; Time</span>
              <span className="ap-detail-value">{fmtDateTime(appt.dateTime)}</span>
            </div>
            <div className="ap-detail-row">
              <span className="ap-detail-label">Status</span>
              <span className="ap-detail-value"><StatusPill status={appt.status} /></span>
            </div>
            <div className="ap-detail-row">
              <span className="ap-detail-label">Drive</span>
              <span className="ap-detail-value">
                {drive ? `${drive.name} — ${drive.location || 'No location'}` : appt.driveId ? `#${appt.driveId}` : '—'}
              </span>
            </div>
            <div className="ap-detail-row">
              <span className="ap-detail-label">Center ID</span>
              <span className="ap-detail-value">{appt.centerId ?? '—'}</span>
            </div>
          </div>
        </div>

        {actions.length > 0 && (
          <>
            <div className="ap-divider" />
            <div className="ap-detail-actions">
              <span className="ap-detail-label" style={{ alignSelf: 'center' }}>Actions</span>
              {actions.filter(a => canAction(a.role)).map(a => (
                <button
                  key={a.endpoint}
                  className="ap-action-btn"
                  data-style={a.style}
                  onClick={() => onAction(appt.appointmentId, a.endpoint, a.confirm)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="ap-divider" />
        <div className="ap-modal-footer">
          <button className="ap-btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}

// ─── Book Appointment Modal ───────────────────────────────────────────────────
function BookModal({ drives, onClose, onSaved, prefillDonorId }) {
  const [form, setForm] = useState({
    donorId:  prefillDonorId || '',
    dateTime: '',
    driveId:  '',
    centerId: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleBook = async () => {
    if (!form.donorId)  { showError('Donor ID is required'); return; }
    if (!form.dateTime) { showError('Date & time is required'); return; }

    // Payload matches AppointmentRequest exactly:
    // donorId (Long), dateTime (LocalDateTime), centerId (Long?), driveId (Long?)
    const payload = {
      donorId:  Number(form.donorId),
      dateTime: form.dateTime,              // datetime-local gives ISO-compatible string
      driveId:  form.driveId  ? Number(form.driveId)  : null,
      centerId: form.centerId ? Number(form.centerId) : null,
    };

    setSaving(true);
    try {
      await api.post('/api/appointments', payload);
      showSuccess('Appointment booked');
      onSaved();
    } catch (err) {
      showError(err.response?.data?.message || 'Booking failed — donor must be ACTIVE with a cleared screening');
    } finally {
      setSaving(false);
    }
  };

  const minDateTime = new Date().toISOString().slice(0, 16);
  const upcomingDrives = drives.filter(d => d.status === 'ACTIVE' || d.status === 'PLANNED');

  return (
    <>
      <div className="ap-backdrop" onClick={onClose} />
      <div className="ap-modal" role="dialog" aria-modal="true">

        <div className="ap-modal-header">
          <div>
            <h2 className="ap-modal-title">Book Appointment</h2>
            <p className="ap-modal-sub">Donor must be ACTIVE with at least one cleared screening</p>
          </div>
          <button className="ap-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="ap-divider" />

        <div className="ap-form-body">

          <div className="ap-field">
            <label className="ap-label">Donor ID *</label>
            <input className="ap-input" type="number" value={form.donorId} onChange={setF('donorId')} placeholder="e.g. 42" />
          </div>

          <div className="ap-field">
            <label className="ap-label">Date &amp; Time *</label>
            <span className="ap-hint">Cannot be in the past. One appointment per donor per day.</span>
            <input className="ap-input" type="datetime-local" value={form.dateTime} onChange={setF('dateTime')} min={minDateTime} />
          </div>

          <div className="ap-field">
            <label className="ap-label">Blood Drive <span className="ap-optional">(optional)</span></label>
            <div className="ap-select-wrap">
              <select className="ap-select" value={form.driveId} onChange={setF('driveId')}>
                <option value="">— No drive / walk-in —</option>
                {upcomingDrives.map(d => (
                  <option key={d.driveId} value={d.driveId}>
                    {d.name}{d.location ? ` — ${d.location}` : ''} ({d.scheduledDate})
                  </option>
                ))}
              </select>
              <span className="ap-chevron">▾</span>
            </div>
          </div>

          <div className="ap-field">
            <label className="ap-label">Center ID <span className="ap-optional">(optional)</span></label>
            <input className="ap-input" type="number" value={form.centerId} onChange={setF('centerId')} placeholder="Leave blank if N/A" />
          </div>

        </div>

        <div className="ap-divider" />
        <div className="ap-modal-footer">
          <button className="ap-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="ap-btn-primary" onClick={handleBook} disabled={saving}>
            {saving ? <><span className="ap-btn-spinner" /> Booking…</> : '+ Book Appointment'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AppointmentsPage() {
  const [tab, setTab]           = useState('today');
  const [appts, setAppts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [drives, setDrives]     = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [viewAppt, setViewAppt] = useState(null);
  const [confirm, setConfirm]   = useState(null);   // { appointmentId, endpoint }
  const [actioning, setActioning] = useState(null); // appointmentId+endpoint key
  const [donorSearch, setDonorSearch] = useState('');
  const debounceRef = useRef(null);
  const role = getRole();
  const canAct = (actionRole) => actionRole === 'ALL' || role === 'ROLE_RECEPTION' || role === 'ROLE_ADMIN';

  const load = useCallback(() => {
    setLoading(true);
    let url;
    if (tab === 'today')  url = '/api/appointments/today';
    else if (tab === 'all') url = '/api/appointments?page=0&size=50';
    else if (tab === 'donor' && donorSearch.trim()) url = `/api/appointments/donor/${donorSearch.trim()}`;
    else { setAppts([]); setLoading(false); return; }

    api.get(url)
      .then(r => {
        const data = r.data?.data?.content ?? r.data?.content ?? r.data?.data ?? r.data ?? [];
        setAppts(Array.isArray(data) ? data : []);
      })
      .catch(() => setAppts([]))
      .finally(() => setLoading(false));
  }, [tab, donorSearch]);

  useEffect(() => { load(); }, [tab]);

  // Load drives for dropdown (ACTIVE + PLANNED)
  useEffect(() => {
    api.get('/api/drives')
      .then(r => setDrives(r.data?.data || r.data || []))
      .catch(() => {});
  }, []);

  const handleAction = (appointmentId, endpoint, requiresConfirm = false) => {
    if (requiresConfirm) {
      setConfirm({ appointmentId, endpoint });
      setViewAppt(null);
      return;
    }
    doAction(appointmentId, endpoint);
  };

  const doAction = async (appointmentId, endpoint) => {
    const key = `${appointmentId}${endpoint}`;
    setActioning(key);
    try {
      await api.patch(`/api/appointments/${appointmentId}/${endpoint}`);
      showSuccess(`Appointment ${endpoint.replace('-', ' ')}`);
      load();
    } catch (err) {
      showError(err.response?.data?.message || 'Action failed');
    } finally {
      setActioning(null);
    }
  };

  const handleDonorSearch = (e) => {
    const val = e.target.value;
    setDonorSearch(val);
    clearTimeout(debounceRef.current);
    if (tab === 'donor') {
      debounceRef.current = setTimeout(() => {
        if (val.trim()) load();
      }, 400);
    }
  };

  const columns = [
    {
      key: 'appointmentId', label: 'ID',
      render: v => <span style={{ fontFamily: 'Courier New', fontSize: '0.8rem', color: '#888' }}>#{v}</span>,
    },
    {
      key: 'donorId', label: 'Donor',
      render: v => <span style={{ fontFamily: 'Courier New', fontSize: '0.82rem' }}>#{v}</span>,
    },
    {
      key: 'driveId', label: 'Drive',
      render: (v) => {
        if (!v) return <span style={{ color: '#bbb', fontSize: '0.8rem' }}>Walk-in</span>;
        const d = drives.find(dr => dr.driveId === v);
        return <span style={{ fontSize: '0.82rem' }}>{d ? d.name : `#${v}`}</span>;
      },
    },
    {
      key: 'dateTime', label: 'Date & Time',
      render: v => <span style={{ fontSize: '0.83rem', color: '#444' }}>{fmtDateTime(v)}</span>,
    },
    {
      key: 'status', label: 'Status',
      render: v => <StatusPill status={v} />,
    },
  ];

  const TABS = [
    { key: 'today',  label: "Today's" },
    { key: 'all',    label: 'All'     },
    { key: 'donor',  label: 'By Donor'},
  ];

  // Summary counts from loaded data
  const counts = (s) => appts.filter(a => a.status === s).length;

  return (
    <>
      <Style />
      <div className="animate-fadein">
        <PageHeader title="Appointments">
          <button className="btn-crimson" onClick={() => setShowBook(true)}>+ Book Appointment</button>
        </PageHeader>

        {/* ── Summary strip (today tab only) ── */}
        {tab === 'today' && appts.length > 0 && (
          <div className="ap-summary-strip">
            {Object.entries(APPT_STATUS_CONFIG).map(([s, cfg]) => {
              const n = counts(s);
              if (n === 0) return null;
              return (
                <span key={s} className="ap-summary-chip" style={{ color: cfg.color, background: cfg.bg }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                  {cfg.label}: <strong>{n}</strong>
                </span>
              );
            })}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="nav-tabs-glass mb-4">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`nav-link${tab === t.key ? ' active' : ''}`}
              onClick={() => { setTab(t.key); setAppts([]); }}
            >
              {t.label}{t.key === 'today' ? ' Appointments' : ''}
            </button>
          ))}
        </div>

        {/* ── Donor search (By Donor tab) ── */}
        {tab === 'donor' && (
          <div className="filter-row mb-4">
            <div className="search-glass" style={{ maxWidth: 260 }}>
              <span className="search-icon">🔍</span>
              <input
                className="form-control"
                type="number"
                placeholder="Donor ID…"
                value={donorSearch}
                onChange={handleDonorSearch}
                onKeyDown={e => e.key === 'Enter' && load()}
              />
            </div>
            <button className="btn-crimson" onClick={load} disabled={!donorSearch.trim()}>Search</button>
          </div>
        )}

        {/* ── Table ── */}
        <div className="table-wrapper">
          <DataTable
            columns={columns}
            data={appts}
            loading={loading}
            actions={row => {
              const actions = APPT_ACTIONS[row.status] || [];
              const visible = actions.filter(a => canAct(a.role));
              if (visible.length === 0) return null;

              return (
                <div className="d-flex gap-1 flex-wrap">
                  {visible.map(a => {
                    const key = `${row.appointmentId}${a.endpoint}`;
                    const sty = ACTION_STYLES[a.style] || ACTION_STYLES.grey;
                    return (
                      <button
                        key={a.endpoint}
                        className="ap-tbl-action-btn"
                        style={{ '--btn-border': sty.border, '--btn-bg': sty.bg, '--btn-color': sty.color }}
                        disabled={actioning === key}
                        onClick={() => handleAction(row.appointmentId, a.endpoint, a.confirm)}
                      >
                        {actioning === key
                          ? <span className="ap-btn-spinner ap-spinner-dark" />
                          : a.label
                        }
                      </button>
                    );
                  })}
                  <button
                    className="ap-tbl-action-btn"
                    style={{ '--btn-border': '#e0e0ec', '--btn-bg': '#f5f5ff', '--btn-color': '#555' }}
                    onClick={() => setViewAppt(row)}
                  >
                    View
                  </button>
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* ── Detail modal ── */}
      {viewAppt && (
        <ApptDetailModal
          appt={viewAppt}
          drives={drives}
          onClose={() => setViewAppt(null)}
          onAction={(id, endpoint, requiresConfirm) => {
            setViewAppt(null);
            handleAction(id, endpoint, requiresConfirm);
          }}
        />
      )}

      {/* ── Book modal ── */}
      {showBook && (
        <BookModal
          drives={drives}
          onClose={() => setShowBook(false)}
          onSaved={() => { setShowBook(false); load(); }}
        />
      )}

      {/* ── Cancel confirm dialog ── */}
      {confirm && (
        <ConfirmDialog
          message={`Cancel appointment #${confirm.appointmentId}? This cannot be undone.`}
          onConfirm={() => { doAction(confirm.appointmentId, confirm.endpoint); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
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
      .ap-backdrop {
        position: fixed; inset: 0;
        background: rgba(15,15,30,0.52);
        backdrop-filter: blur(4px);
        z-index: 1000;
        animation: ap-fade 0.18s ease;
      }
      .ap-backdrop-top { z-index: 1200; }

      /* Modal */
      .ap-modal {
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: min(520px, calc(100vw - 2rem));
        max-height: calc(100vh - 3rem);
        background: #fff; border-radius: 20px;
        box-shadow: 0 28px 72px rgba(0,0,0,0.22);
        z-index: 1001;
        display: flex; flex-direction: column;
        overflow: hidden;
        font-family: 'DM Sans', sans-serif;
        animation: ap-pop 0.22s cubic-bezier(0.34,1.56,0.64,1);
      }

      /* Header */
      .ap-modal-header {
        display: flex; align-items: flex-start;
        justify-content: space-between;
        padding: 1.2rem 1.4rem 1rem; gap: 1rem; flex-shrink: 0;
      }
      .ap-modal-title {
        font-family: 'Syne', sans-serif;
        font-size: 1.1rem; font-weight: 800;
        margin: 0 0 0.2rem; color: #1a1a2e;
      }
      .ap-modal-sub { margin: 0; font-size: 0.8rem; color: #888; }
      .ap-close-btn {
        width: 28px; height: 28px; border-radius: 50%;
        border: 1.5px solid #e0e0e8;
        background: #fafafa; color: #888;
        font-size: 0.72rem; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.15s; flex-shrink: 0;
      }
      .ap-close-btn:hover { background: #fff0f0; border-color: #c62828; color: #c62828; }
      .ap-divider { height: 1px; background: #f0f0f8; flex-shrink: 0; }

      /* Detail body */
      .ap-detail-body { padding: 1.2rem 1.4rem; overflow-y: auto; }
      .ap-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 1.5rem; }
      .ap-detail-row  { display: flex; flex-direction: column; gap: 2px; }
      .ap-detail-label {
        font-size: 0.68rem; font-weight: 500;
        text-transform: uppercase; letter-spacing: 0.5px; color: #bbb;
      }
      .ap-detail-value { font-size: 0.9rem; color: #1a1a2e; }

      /* Detail actions row */
      .ap-detail-actions {
        display: flex; align-items: center; gap: 0.5rem;
        padding: 0.85rem 1.4rem; flex-wrap: wrap;
      }
      .ap-action-btn {
        padding: 5px 12px; border-radius: 7px; border: 1.5px solid #e0e0ec;
        background: #fafafa; color: #555;
        font-family: 'Syne', sans-serif; font-size: 0.78rem; font-weight: 700;
        cursor: pointer; transition: all 0.13s;
      }
      .ap-action-btn[data-style="green"]  { border-color: #43a047; background: #e8f5e9; color: #2e7d32; }
      .ap-action-btn[data-style="green"]:hover  { background: #2e7d32; color: white; }
      .ap-action-btn[data-style="orange"] { border-color: #fb8c00; background: #fff3e0; color: #e65100; }
      .ap-action-btn[data-style="orange"]:hover { background: #e65100; color: white; }
      .ap-action-btn[data-style="grey"]   { border-color: #ddd; background: #fafafa; color: #666; }
      .ap-action-btn[data-style="grey"]:hover   { background: #555; color: white; }

      /* Form body */
      .ap-form-body { padding: 1.2rem 1.4rem; display: flex; flex-direction: column; gap: 0.9rem; overflow-y: auto; }
      .ap-field { display: flex; flex-direction: column; gap: 0.3rem; }
      .ap-label {
        font-size: 0.72rem; font-weight: 500;
        text-transform: uppercase; letter-spacing: 0.6px; color: #888;
      }
      .ap-optional { font-size: 0.65rem; color: #bbb; text-transform: none; font-weight: 400; }
      .ap-hint     { font-size: 0.68rem; color: #bbb; margin-top: -2px; }
      .ap-input {
        width: 100%; padding: 9px 13px;
        border: 1.5px solid #e0e0ec; border-radius: 9px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem; color: #1a1a2e;
        background: #fafafa; outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        box-sizing: border-box;
      }
      .ap-input:focus { border-color: #c62828; background: #fff; box-shadow: 0 0 0 3px rgba(198,40,40,0.07); }
      .ap-select-wrap { position: relative; }
      .ap-select {
        width: 100%; padding: 9px 32px 9px 13px;
        border: 1.5px solid #e0e0ec; border-radius: 9px;
        appearance: none; font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem; background: #fafafa;
        color: #1a1a2e; outline: none; cursor: pointer;
        transition: border-color 0.15s; box-sizing: border-box;
      }
      .ap-select:focus { border-color: #c62828; }
      .ap-chevron {
        position: absolute; right: 10px; top: 50%;
        transform: translateY(-50%);
        font-size: 0.72rem; color: #888; pointer-events: none;
      }

      /* Summary strip */
      .ap-summary-strip {
        display: flex; flex-wrap: wrap; gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .ap-summary-chip {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 12px; border-radius: 20px;
        font-size: 0.75rem; font-weight: 500;
      }

      /* Table action buttons (CSS variable-based) */
      .ap-tbl-action-btn {
        display: inline-flex; align-items: center; gap: 3px;
        padding: 3px 9px; border-radius: 6px;
        border: 1.5px solid var(--btn-border, #e0e0ec);
        background: var(--btn-bg, #fafafa);
        color: var(--btn-color, #555);
        font-size: 0.72rem; font-weight: 600;
        cursor: pointer; transition: all 0.12s;
        font-family: 'DM Sans', sans-serif;
        white-space: nowrap;
      }
      .ap-tbl-action-btn:hover:not(:disabled) { opacity: 0.85; filter: brightness(0.92); }
      .ap-tbl-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      /* Confirm dialog */
      .ap-confirm {
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: min(360px, calc(100vw - 2rem));
        background: #fff; border-radius: 16px;
        box-shadow: 0 24px 64px rgba(0,0,0,0.28);
        z-index: 1201;
        padding: 1.4rem;
        font-family: 'DM Sans', sans-serif;
        animation: ap-pop 0.2s cubic-bezier(0.34,1.56,0.64,1);
      }
      .ap-confirm-msg { font-size: 0.92rem; color: #1a1a2e; margin: 0 0 1.1rem; line-height: 1.5; }
      .ap-confirm-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
      .ap-btn-danger {
        padding: 8px 18px; background: #c62828; color: white;
        border: none; border-radius: 8px;
        font-family: 'Syne', sans-serif;
        font-size: 0.85rem; font-weight: 700; cursor: pointer;
        transition: background 0.15s;
      }
      .ap-btn-danger:hover { background: #b71c1c; }

      /* Footer */
      .ap-modal-footer {
        display: flex; justify-content: flex-end; gap: 0.6rem;
        padding: 0.9rem 1.4rem; flex-shrink: 0;
      }
      .ap-btn-ghost {
        padding: 8px 16px; background: none; color: #666;
        border: 1.5px solid #ddd; border-radius: 8px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
      }
      .ap-btn-ghost:hover:not(:disabled) { background: #f5f5f5; }
      .ap-btn-ghost:disabled { opacity: 0.5; }
      .ap-btn-primary {
        display: inline-flex; align-items: center; gap: 0.4rem;
        padding: 8px 20px; background: #c62828; color: white;
        border: none; border-radius: 8px;
        font-family: 'Syne', sans-serif;
        font-size: 0.85rem; font-weight: 700;
        cursor: pointer; transition: background 0.15s, transform 0.1s;
      }
      .ap-btn-primary:hover:not(:disabled) { background: #b71c1c; transform: translateY(-1px); }
      .ap-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

      /* Spinners */
      .ap-btn-spinner {
        width: 12px; height: 12px;
        border: 2px solid rgba(255,255,255,0.4);
        border-top-color: white; border-radius: 50%;
        animation: ap-spin 0.7s linear infinite;
        display: inline-block;
      }
      .ap-spinner-dark { border-color: rgba(0,0,0,0.15); border-top-color: #555; }

      @keyframes ap-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes ap-pop  {
        from { opacity: 0; transform: translate(-50%, -47%) scale(0.94); }
        to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes ap-spin { to { transform: rotate(360deg); } }

      @media (max-width: 480px) {
        .ap-detail-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}