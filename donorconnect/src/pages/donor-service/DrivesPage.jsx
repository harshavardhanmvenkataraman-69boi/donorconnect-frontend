import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatCard from '../../components/shared/ui/StatCard';
import { getRole } from '../../api/authUtils';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

// ─── Constants ────────────────────────────────────────────────────────────────

// Valid server-side status transitions
const STATUS_TRANSITIONS = {
  PLANNED:   ['ACTIVE', 'CANCELLED'],
  ACTIVE:    ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

const DRIVE_STATUS_CONFIG = {
  PLANNED:   { color: '#1565c0', bg: '#e3f2fd', dot: '#42a5f5', label: 'Planned'   },
  ACTIVE:    { color: '#1b5e20', bg: '#e8f5e9', dot: '#43a047', label: 'Active'    },
  COMPLETED: { color: '#4a148c', bg: '#f3e5f5', dot: '#ab47bc', label: 'Completed' },
  CANCELLED: { color: '#555',    bg: '#f5f5f5', dot: '#9e9e9e', label: 'Cancelled' },
};

const APPT_STATUS_CONFIG = {
  BOOKED:     { color: '#1565c0', bg: '#e3f2fd', dot: '#42a5f5' },
  CHECKED_IN: { color: '#e65100', bg: '#fff3e0', dot: '#fb8c00' },
  COMPLETED:  { color: '#1b5e20', bg: '#e8f5e9', dot: '#43a047' },
  CANCELLED:  { color: '#555',    bg: '#f5f5f5', dot: '#9e9e9e' },
  NO_SHOW:    { color: '#b71c1c', bg: '#ffebee', dot: '#e53935' },
};

// Actions available per appointment status (maps to PATCH endpoint suffix)
const APPT_ACTIONS = {
  BOOKED:     [{ label: '✓ Check In', endpoint: 'check-in', role: 'RECEPTION' }, { label: '✕ Cancel', endpoint: 'cancel', role: 'ALL' }, { label: '⚠ No Show', endpoint: 'no-show', role: 'RECEPTION' }],
  CHECKED_IN: [{ label: '✓ Complete', endpoint: 'complete', role: 'RECEPTION' }, { label: '✕ Cancel', endpoint: 'cancel', role: 'ALL' }],
  COMPLETED:  [],
  CANCELLED:  [],
  NO_SHOW:    [],
};

const INIT_DRIVE_FORM = {
  name:          '',
  location:      '',
  scheduledDate: '',
  capacity:      '',
  organizer:     '',
};

const INIT_APPT_FORM = {
  donorId:  '',
  dateTime: '',
  driveId:  '',
  centerId: '',
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
function StatusPill({ status, config }) {
  const cfg = config[status];
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
      {cfg.label || status}
    </span>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="dr-field">
      <label className="dr-label">{label}</label>
      {hint && <span className="dr-hint">{hint}</span>}
      {children}
    </div>
  );
}

// ─── Drive Form Modal (create / edit) ─────────────────────────────────────────
function DriveFormModal({ initial, editId, onClose, onSaved }) {
  const [form, setForm] = useState(initial || INIT_DRIVE_FORM);
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
    if (!form.name.trim())          { showError('Drive name is required'); return; }
    if (!form.scheduledDate)        { showError('Scheduled date is required'); return; }
    if (form.capacity && Number(form.capacity) <= 0) { showError('Capacity must be positive'); return; }

    const payload = {
      name:          form.name.trim(),
      location:      form.location.trim() || null,
      scheduledDate: form.scheduledDate,
      capacity:      form.capacity ? Number(form.capacity) : null,
      organizer:     form.organizer.trim() || null,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/api/drives/${editId}`, payload);
        showSuccess('Drive updated');
      } else {
        await api.post('/api/drives', payload);
        showSuccess('Drive created');
      }
      onSaved();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save drive');
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="dr-backdrop" onClick={onClose} />
      <div className="dr-modal" role="dialog" aria-modal="true">

        <div className="dr-modal-header">
          <div>
            <h2 className="dr-modal-title">{isEdit ? 'Edit Drive' : 'Create Blood Drive'}</h2>
            <p className="dr-modal-sub">{isEdit ? `Editing drive #${editId}` : 'Schedule a new donation drive'}</p>
          </div>
          <button className="dr-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="dr-divider" />

        <div className="dr-form-body">
          <div className="dr-form-grid dr-grid-2">

            <div className="dr-span-2">
              <Field label="Drive Name *">
                <input className="dr-input" type="text" value={form.name} onChange={setF('name')} placeholder="e.g. World Blood Donor Day Drive" />
              </Field>
            </div>

            <Field label="Location">
              <input className="dr-input" type="text" value={form.location} onChange={setF('location')} placeholder="Venue / address" />
            </Field>

            <Field label="Organizer">
              <input className="dr-input" type="text" value={form.organizer} onChange={setF('organizer')} placeholder="Name or org" />
            </Field>

            <Field label="Scheduled Date *" hint="Cannot be in the past">
              <input className="dr-input" type="date" value={form.scheduledDate} onChange={setF('scheduledDate')} min={today} />
            </Field>

            <Field label="Capacity (slots)">
              <input className="dr-input" type="number" min="1" value={form.capacity} onChange={setF('capacity')} placeholder="e.g. 100" />
            </Field>

          </div>
        </div>

        <div className="dr-divider" />
        <div className="dr-modal-footer">
          <button className="dr-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="dr-btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <><span className="dr-btn-spinner" /> Saving…</> : isEdit ? '✓ Save Changes' : '+ Create Drive'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Drive Status Modal ───────────────────────────────────────────────────────
function DriveStatusModal({ drive, onClose, onSaved }) {
  const [updating, setUpdating] = useState(null);
  const transitions = STATUS_TRANSITIONS[drive.status] || [];

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const handleStatus = async (newStatus) => {
    setUpdating(newStatus);
    try {
      await api.patch(`/api/drives/${drive.driveId}/status?status=${newStatus}`);
      showSuccess(`Drive status updated to ${newStatus}`);
      onSaved();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const STATUS_BTN = {
    ACTIVE:    { cls: 'dr-status-btn-green',  label: '▶ Mark Active'    },
    COMPLETED: { cls: 'dr-status-btn-purple', label: '✓ Mark Completed' },
    CANCELLED: { cls: 'dr-status-btn-grey',   label: '✕ Cancel Drive'   },
  };

  return (
    <>
      <div className="dr-backdrop" onClick={onClose} />
      <div className="dr-modal dr-modal-sm" role="dialog" aria-modal="true">
        <div className="dr-modal-header">
          <div>
            <h2 className="dr-modal-title">Update Drive Status</h2>
            <p className="dr-modal-sub">{drive.name}</p>
          </div>
          <button className="dr-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="dr-divider" />

        <div className="dr-form-body">
          <div className="dr-status-current">
            <span className="dr-label">Current Status</span>
            <StatusPill status={drive.status} config={DRIVE_STATUS_CONFIG} />
          </div>

          {transitions.length === 0 ? (
            <div className="dr-info-box">
              This drive is <strong>{drive.status}</strong> — no further status changes are possible.
            </div>
          ) : (
            <>
              <p className="dr-label" style={{ marginBottom: '0.5rem' }}>Transition to</p>
              <div className="dr-status-actions">
                {transitions.map(s => (
                  <button
                    key={s}
                    className={`dr-status-action-btn ${STATUS_BTN[s]?.cls || ''}`}
                    onClick={() => handleStatus(s)}
                    disabled={!!updating}
                  >
                    {updating === s
                      ? <><span className="dr-btn-spinner" /> Updating…</>
                      : STATUS_BTN[s]?.label || s
                    }
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="dr-divider" />
        <div className="dr-modal-footer">
          <button className="dr-btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}

// ─── Appointments Modal ───────────────────────────────────────────────────────
function AppointmentsModal({ drive, onClose }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showBook, setShowBook]         = useState(false);
  const [actioning, setActioning]       = useState(null);
  const role = getRole();

  const loadAppts = useCallback(() => {
    setLoading(true);
    api.get(`/api/drives/${drive.driveId}/appointments`)
      .then(r => setAppointments(r.data?.data || r.data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [drive.driveId]);

  useEffect(() => {
    loadAppts();
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, []);

  const handleAction = async (apptId, endpoint) => {
    setActioning(apptId + endpoint);
    try {
      await api.patch(`/api/appointments/${apptId}/${endpoint}`);
      showSuccess('Appointment updated');
      loadAppts();
    } catch (err) {
      showError(err.response?.data?.message || 'Action failed');
    } finally {
      setActioning(null);
    }
  };

  const canAction = (actionRole) => {
    if (actionRole === 'ALL') return true;
    if (actionRole === 'RECEPTION') return role === 'ROLE_RECEPTION' || role === 'ROLE_ADMIN';
    return role === 'ROLE_ADMIN';
  };

  return (
    <>
      <div className="dr-backdrop" onClick={onClose} />
      <div className="dr-modal dr-modal-xl" role="dialog" aria-modal="true">

        <div className="dr-modal-header">
          <div>
            <h2 className="dr-modal-title">Appointments — {drive.name}</h2>
            <p className="dr-modal-sub">
              {drive.scheduledDate} · {drive.location || 'No location'} · {appointments.length} booking{appointments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            {drive.status === 'ACTIVE' && (
              <button className="dr-btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={() => setShowBook(true)}>
                + Book
              </button>
            )}
            <button className="dr-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="dr-divider" />

        <div className="dr-appt-body">
          {loading ? (
            <div className="dr-loader-wrap"><div className="dr-spinner" /><p className="dr-loader-text">Loading appointments…</p></div>
          ) : appointments.length === 0 ? (
            <div className="dr-empty">No appointments booked for this drive yet.</div>
          ) : (
            <table className="dr-appt-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Donor ID</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => {
                  const actions = APPT_ACTIONS[a.status] || [];
                  return (
                    <tr key={a.appointmentId}>
                      <td><span style={{ fontFamily: 'Courier New', fontSize: '0.8rem', color: '#888' }}>#{a.appointmentId}</span></td>
                      <td><span style={{ fontFamily: 'Courier New', fontSize: '0.82rem' }}>#{a.donorId}</span></td>
                      <td style={{ fontSize: '0.85rem', color: '#444' }}>
                        {a.dateTime ? new Date(a.dateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                      </td>
                      <td><StatusPill status={a.status} config={APPT_STATUS_CONFIG} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {actions.filter(ac => canAction(ac.role)).map(ac => (
                            <button
                              key={ac.endpoint}
                              className="dr-appt-action-btn"
                              disabled={actioning === a.appointmentId + ac.endpoint}
                              onClick={() => handleAction(a.appointmentId, ac.endpoint)}
                            >
                              {actioning === a.appointmentId + ac.endpoint
                                ? <span className="dr-btn-spinner dr-spinner-dark" />
                                : ac.label
                              }
                            </button>
                          ))}
                          {actions.length === 0 && <span style={{ fontSize: '0.75rem', color: '#bbb' }}>—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="dr-divider" />
        <div className="dr-modal-footer">
          <button className="dr-btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>

      {/* Book appointment sub-modal */}
      {showBook && (
        <BookAppointmentModal
          driveId={drive.driveId}
          onClose={() => setShowBook(false)}
          onSaved={() => { setShowBook(false); loadAppts(); }}
        />
      )}
    </>
  );
}

// ─── Book Appointment Modal ───────────────────────────────────────────────────
function BookAppointmentModal({ driveId, onClose, onSaved }) {
  const [form, setForm] = useState({ ...INIT_APPT_FORM, driveId });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleBook = async () => {
    if (!form.donorId) { showError('Donor ID is required'); return; }
    if (!form.dateTime) { showError('Date & time is required'); return; }

    const payload = {
      donorId:  Number(form.donorId),
      dateTime: form.dateTime,          // ISO string from datetime-local input
      driveId:  Number(driveId),
      centerId: form.centerId ? Number(form.centerId) : null,
    };

    setSaving(true);
    try {
      await api.post('/api/appointments', payload);
      showSuccess('Appointment booked');
      onSaved();
    } catch (err) {
      showError(err.response?.data?.message || 'Booking failed — ensure donor is ACTIVE and has a cleared screening');
    } finally {
      setSaving(false);
    }
  };

  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <>
      <div className="dr-backdrop" style={{ zIndex: 1100 }} onClick={onClose} />
      <div className="dr-modal dr-modal-sm" style={{ zIndex: 1101 }} role="dialog" aria-modal="true">
        <div className="dr-modal-header">
          <div>
            <h2 className="dr-modal-title">Book Appointment</h2>
            <p className="dr-modal-sub">Drive #{driveId} · Donor must be ACTIVE with a cleared screening</p>
          </div>
          <button className="dr-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="dr-divider" />

        <div className="dr-form-body">
          <div className="dr-form-grid dr-grid-1">
            <Field label="Donor ID *">
              <input className="dr-input" type="number" value={form.donorId} onChange={setF('donorId')} placeholder="e.g. 42" />
            </Field>
            <Field label="Date &amp; Time *" hint="Cannot be in the past">
              <input className="dr-input" type="datetime-local" value={form.dateTime} onChange={setF('dateTime')} min={minDateTime} />
            </Field>
            <Field label="Center ID" hint="Optional">
              <input className="dr-input" type="number" value={form.centerId} onChange={setF('centerId')} placeholder="Leave blank if N/A" />
            </Field>
          </div>
        </div>

        <div className="dr-divider" />
        <div className="dr-modal-footer">
          <button className="dr-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="dr-btn-primary" onClick={handleBook} disabled={saving}>
            {saving ? <><span className="dr-btn-spinner" /> Booking…</> : '+ Book Appointment'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DrivesPage() {
  const [drives, setDrives]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [editDrive, setEditDrive]   = useState(null);
  const [statusDrive, setStatusDrive] = useState(null);
  const [apptDrive, setApptDrive]   = useState(null);
  const isAdmin = getRole() === 'ROLE_ADMIN';

  const load = useCallback(() => {
    setLoading(true);
    const url = tab === 'UPCOMING' ? '/api/drives/upcoming' : '/api/drives';
    api.get(url)
      .then(r => setDrives(r.data?.data || r.data || []))
      .catch(() => setDrives([]))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleSaved = () => {
    setShowCreate(false);
    setEditDrive(null);
    setStatusDrive(null);
    load();
  };

  // Filtered data for ALL tab (client-side filter by status)
  const displayDrives = (tab === 'ALL' || tab === 'UPCOMING')
    ? drives
    : drives.filter(d => d.status === tab);

  const counts = (s) => drives.filter(d => d.status === s).length;

  const columns = [
    {
      key: 'driveId', label: 'ID',
      render: v => <span style={{ fontFamily: 'Courier New', fontSize: '0.8rem', color: '#888' }}>#{v}</span>,
    },
    { key: 'name',          label: 'Name'       },
    { key: 'location',      label: 'Location',  render: v => v || <span style={{ color: '#bbb' }}>—</span> },
    { key: 'organizer',     label: 'Organizer', render: v => v || <span style={{ color: '#bbb' }}>—</span> },
    { key: 'scheduledDate', label: 'Date'       },
    {
      key: 'capacity', label: 'Capacity',
      render: v => v != null ? v : <span style={{ color: '#bbb' }}>—</span>,
    },
    {
      key: 'status', label: 'Status',
      render: v => <StatusPill status={v} config={DRIVE_STATUS_CONFIG} />,
    },
  ];

  const TABS = [
    { key: 'ALL',       label: 'All Drives'  },
    { key: 'UPCOMING',  label: 'Upcoming'    },
    { key: 'PLANNED',   label: 'Planned'     },
    { key: 'ACTIVE',    label: 'Active'      },
    { key: 'COMPLETED', label: 'Completed'   },
    { key: 'CANCELLED', label: 'Cancelled'   },
  ];

  return (
    <>
      <Style />
      <div className="animate-fadein">
        <PageHeader title="Blood Drives">
          {isAdmin && (
            <button className="btn-crimson" onClick={() => setShowCreate(true)}>
              + Create Drive
            </button>
          )}
        </PageHeader>

        {/* ── Stat cards ── */}
        <div className="dr-stat-row">
          <div className="dr-stat-card">
            <span className="dr-stat-value">{drives.length}</span>
            <span className="dr-stat-label">Total</span>
          </div>
          <div className="dr-stat-card dr-stat-blue">
            <span className="dr-stat-value">{counts('PLANNED')}</span>
            <span className="dr-stat-label">Planned</span>
          </div>
          <div className="dr-stat-card dr-stat-green">
            <span className="dr-stat-value">{counts('ACTIVE')}</span>
            <span className="dr-stat-label">Active</span>
          </div>
          <div className="dr-stat-card dr-stat-purple">
            <span className="dr-stat-value">{counts('COMPLETED')}</span>
            <span className="dr-stat-label">Completed</span>
          </div>
          <div className="dr-stat-card dr-stat-grey">
            <span className="dr-stat-value">{counts('CANCELLED')}</span>
            <span className="dr-stat-label">Cancelled</span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="nav-tabs-glass mb-4">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`nav-link${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="table-wrapper">
          <DataTable
            columns={columns}
            data={displayDrives}
            loading={loading}
            actions={row => (
              <div className="d-flex gap-2">
                <button className="btn-glass" style={{ fontSize: '0.75rem' }} onClick={() => setApptDrive(row)}>
                  Appointments
                </button>
                {isAdmin && (
                  <>
                    <button
                      className="btn-glass"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setEditDrive(row)}
                      disabled={row.status === 'COMPLETED' || row.status === 'CANCELLED'}
                    >
                      Edit
                    </button>
                    <button
                      className="dr-btn-status-inline"
                      onClick={() => setStatusDrive(row)}
                      disabled={STATUS_TRANSITIONS[row.status]?.length === 0}
                    >
                      Status ▾
                    </button>
                  </>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <DriveFormModal onClose={() => setShowCreate(false)} onSaved={handleSaved} />
      )}
      {editDrive && (
        <DriveFormModal
          editId={editDrive.driveId}
          initial={{
            name:          editDrive.name          || '',
            location:      editDrive.location      || '',
            scheduledDate: editDrive.scheduledDate || '',
            capacity:      editDrive.capacity      ?? '',
            organizer:     editDrive.organizer     || '',
          }}
          onClose={() => setEditDrive(null)}
          onSaved={handleSaved}
        />
      )}
      {statusDrive && (
        <DriveStatusModal
          drive={statusDrive}
          onClose={() => setStatusDrive(null)}
          onSaved={handleSaved}
        />
      )}
      {apptDrive && (
        <AppointmentsModal
          drive={apptDrive}
          onClose={() => setApptDrive(null)}
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

      /* Backdrop & modal */
      .dr-backdrop {
        position: fixed; inset: 0;
        background: rgba(15,15,30,0.52);
        backdrop-filter: blur(4px);
        z-index: 1000;
        animation: dr-fade 0.18s ease;
      }
      .dr-modal {
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: min(560px, calc(100vw - 2rem));
        max-height: calc(100vh - 3rem);
        background: #fff; border-radius: 20px;
        box-shadow: 0 28px 72px rgba(0,0,0,0.22);
        z-index: 1001;
        display: flex; flex-direction: column;
        overflow: hidden;
        font-family: 'DM Sans', sans-serif;
        animation: dr-pop 0.22s cubic-bezier(0.34,1.56,0.64,1);
      }
      .dr-modal-sm { width: min(420px, calc(100vw - 2rem)); }
      .dr-modal-xl { width: min(860px, calc(100vw - 2rem)); }

      /* Header */
      .dr-modal-header {
        display: flex; align-items: flex-start;
        justify-content: space-between;
        padding: 1.2rem 1.4rem 1rem; gap: 1rem; flex-shrink: 0;
      }
      .dr-modal-title {
        font-family: 'Syne', sans-serif;
        font-size: 1.1rem; font-weight: 800;
        margin: 0 0 0.2rem; color: #1a1a2e;
      }
      .dr-modal-sub { margin: 0; font-size: 0.8rem; color: #888; }
      .dr-close-btn {
        width: 28px; height: 28px; border-radius: 50%;
        border: 1.5px solid #e0e0e8;
        background: #fafafa; color: #888;
        font-size: 0.72rem; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.15s; flex-shrink: 0;
      }
      .dr-close-btn:hover { background: #fff0f0; border-color: #c62828; color: #c62828; }
      .dr-divider { height: 1px; background: #f0f0f8; flex-shrink: 0; }

      /* Form */
      .dr-form-body { padding: 1.2rem 1.4rem; overflow-y: auto; }
      .dr-form-grid { display: grid; gap: 0.85rem; }
      .dr-grid-1 { grid-template-columns: 1fr; }
      .dr-grid-2 { grid-template-columns: 1fr 1fr; }
      .dr-span-2 { grid-column: 1 / -1; }
      .dr-field  { display: flex; flex-direction: column; gap: 0.3rem; }
      .dr-label  { font-size: 0.72rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.6px; color: #888; }
      .dr-hint   { font-size: 0.67rem; color: #bbb; margin-top: -1px; }
      .dr-input {
        width: 100%; padding: 9px 13px;
        border: 1.5px solid #e0e0ec; border-radius: 9px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem; color: #1a1a2e;
        background: #fafafa; outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        box-sizing: border-box;
      }
      .dr-input:focus { border-color: #c62828; background: #fff; box-shadow: 0 0 0 3px rgba(198,40,40,0.07); }

      /* Status modal */
      .dr-status-current { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
      .dr-status-actions { display: flex; flex-direction: column; gap: 0.5rem; }
      .dr-status-action-btn {
        display: inline-flex; align-items: center; gap: 0.5rem;
        padding: 9px 16px; border-radius: 9px; border: none;
        font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700;
        cursor: pointer; transition: all 0.15s;
      }
      .dr-status-btn-green  { background: #e8f5e9; color: #2e7d32; }
      .dr-status-btn-green:hover  { background: #2e7d32; color: white; }
      .dr-status-btn-purple { background: #f3e5f5; color: #6a1b9a; }
      .dr-status-btn-purple:hover { background: #6a1b9a; color: white; }
      .dr-status-btn-grey   { background: #f5f5f5; color: #555; }
      .dr-status-btn-grey:hover   { background: #555; color: white; }
      .dr-status-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      /* Info box */
      .dr-info-box {
        background: #e3f2fd; border: 1.5px solid #bbdefb;
        border-radius: 10px; padding: 0.75rem 1rem;
        font-size: 0.82rem; color: #1565c0; line-height: 1.45;
      }

      /* Stat row */
      .dr-stat-row {
        display: flex; gap: 0.75rem; flex-wrap: wrap;
        margin-bottom: 1.25rem;
      }
      .dr-stat-card {
        flex: 1; min-width: 90px;
        background: #fff; border: 1px solid #e8e8f0;
        border-radius: 12px; padding: 0.9rem 1rem;
        display: flex; flex-direction: column; gap: 2px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.04);
      }
      .dr-stat-value {
        font-family: 'Syne', sans-serif;
        font-size: 1.6rem; font-weight: 800; color: #1a1a2e; line-height: 1;
      }
      .dr-stat-label { font-size: 0.72rem; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
      .dr-stat-blue   .dr-stat-value { color: #1565c0; }
      .dr-stat-green  .dr-stat-value { color: #2e7d32; }
      .dr-stat-purple .dr-stat-value { color: #6a1b9a; }
      .dr-stat-grey   .dr-stat-value { color: #888; }

      /* Inline status button in table */
      .dr-btn-status-inline {
        padding: 4px 10px;
        border: 1.5px solid #e0e0ec; border-radius: 6px;
        background: #f5f5ff; color: #555;
        font-size: 0.75rem; font-weight: 600;
        cursor: pointer; transition: all 0.15s;
        font-family: 'Syne', sans-serif;
      }
      .dr-btn-status-inline:hover:not(:disabled) { background: #1a1a2e; color: white; border-color: #1a1a2e; }
      .dr-btn-status-inline:disabled { opacity: 0.4; cursor: not-allowed; }

      /* Appointments table */
      .dr-appt-body { overflow-y: auto; max-height: 55vh; padding: 0.25rem 0; }
      .dr-appt-table { width: 100%; border-collapse: collapse; font-family: 'DM Sans', sans-serif; }
      .dr-appt-table th {
        padding: 0.6rem 1rem;
        font-size: 0.7rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.6px;
        color: #aaa; background: #fafafa;
        border-bottom: 1px solid #f0f0f8;
        text-align: left;
      }
      .dr-appt-table td {
        padding: 0.7rem 1rem;
        border-bottom: 1px solid #f8f8fc;
        vertical-align: middle;
      }
      .dr-appt-table tr:last-child td { border-bottom: none; }
      .dr-appt-table tr:hover td { background: #fafafe; }

      .dr-appt-action-btn {
        padding: 3px 9px;
        border: 1.5px solid #e0e0ec; border-radius: 6px;
        background: #fafafa; color: #555;
        font-size: 0.72rem; font-weight: 600;
        cursor: pointer; transition: all 0.12s;
        font-family: 'DM Sans', sans-serif;
        white-space: nowrap;
      }
      .dr-appt-action-btn:hover:not(:disabled) { background: #1a1a2e; color: white; border-color: #1a1a2e; }
      .dr-appt-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      /* Loader / empty */
      .dr-loader-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; gap: 0.75rem; }
      .dr-spinner {
        width: 28px; height: 28px;
        border: 3px solid #f0e0e0;
        border-top-color: #c62828;
        border-radius: 50%;
        animation: dr-spin 0.8s linear infinite;
      }
      .dr-loader-text { color: #888; font-size: 0.85rem; }
      .dr-empty { padding: 2.5rem; text-align: center; color: #aaa; font-size: 0.88rem; }

      /* Footer */
      .dr-modal-footer {
        display: flex; justify-content: flex-end; gap: 0.6rem;
        padding: 0.9rem 1.4rem; flex-shrink: 0;
      }
      .dr-btn-ghost {
        padding: 8px 16px; background: none; color: #666;
        border: 1.5px solid #ddd; border-radius: 8px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
      }
      .dr-btn-ghost:hover:not(:disabled) { background: #f5f5f5; }
      .dr-btn-ghost:disabled { opacity: 0.5; }
      .dr-btn-primary {
        display: inline-flex; align-items: center; gap: 0.4rem;
        padding: 8px 20px; background: #c62828; color: white;
        border: none; border-radius: 8px;
        font-family: 'Syne', sans-serif;
        font-size: 0.85rem; font-weight: 700;
        cursor: pointer; transition: background 0.15s, transform 0.1s;
      }
      .dr-btn-primary:hover:not(:disabled) { background: #b71c1c; transform: translateY(-1px); }
      .dr-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      .dr-btn-spinner {
        width: 12px; height: 12px;
        border: 2px solid rgba(255,255,255,0.4);
        border-top-color: white; border-radius: 50%;
        animation: dr-spin 0.7s linear infinite;
        display: inline-block;
      }
      .dr-spinner-dark {
        border-color: rgba(0,0,0,0.15);
        border-top-color: #555;
      }

      @keyframes dr-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes dr-pop  {
        from { opacity: 0; transform: translate(-50%, -47%) scale(0.94); }
        to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes dr-spin { to { transform: rotate(360deg); } }

      @media (max-width: 500px) {
        .dr-grid-2 { grid-template-columns: 1fr; }
        .dr-span-2 { grid-column: 1; }
        .dr-stat-row { gap: 0.5rem; }
        .dr-stat-card { min-width: 70px; }
      }
    `}</style>
  );
}