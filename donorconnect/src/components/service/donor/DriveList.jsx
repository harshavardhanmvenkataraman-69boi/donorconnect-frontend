import PageHeader from '../../shared/ui/PageHeader'
import DataTable from '../../shared/ui/DataTable'
import DsModal from '../../shared/donor-service/DsModal'
import { DsField, DsInput } from '../../shared/donor-service/DsField'
import { DsBtnPrimary, DsBtnGhost, DsBtnInline } from '../../shared/donor-service/DsButtons'
import { StatusPill } from '../../shared/donor-service/DsBadges'

const STATUS_TRANSITIONS = {
  PLANNED:   ['ACTIVE', 'CANCELLED'],
  ACTIVE:    ['COMPLETED', 'CANCELLED'],
  COMPLETED: [], CANCELLED: [],
}

const APPT_ACTIONS = {
  BOOKED:     [{ label: '✓ Check In', endpoint: 'check-in' }, { label: '✕ Cancel', endpoint: 'cancel' }, { label: '⚠ No Show', endpoint: 'no-show' }],
  CHECKED_IN: [{ label: '✓ Complete', endpoint: 'complete' }, { label: '✕ Cancel', endpoint: 'cancel' }],
  COMPLETED: [], CANCELLED: [], NO_SHOW: [],
}

const TABS = [
  { key: 'ALL',       label: 'All Drives'  },
  { key: 'UPCOMING',  label: 'Upcoming'    },
  { key: 'PLANNED',   label: 'Planned'     },
  { key: 'ACTIVE',    label: 'Active'      },
  { key: 'COMPLETED', label: 'Completed'   },
  { key: 'CANCELLED', label: 'Cancelled'   },
]

const STAT_CONFIG = [
  { label: 'Total',     key: null,        accent: '#1a1a2e', bg: '#f5f5fa'  },
  { label: 'Planned',   key: 'PLANNED',   accent: '#1565c0', bg: '#e3f2fd'  },
  { label: 'Active',    key: 'ACTIVE',    accent: '#2e7d32', bg: '#e8f5e9'  },
  { label: 'Completed', key: 'COMPLETED', accent: '#6a1b9a', bg: '#f3e5f5'  },
  { label: 'Cancelled', key: 'CANCELLED', accent: '#888',    bg: '#f5f5f5'  },
]

const STATUS_BTN = {
  ACTIVE:    { label: '▶ Mark Active',    color: '#2e7d32', bg: '#e8f5e9' },
  COMPLETED: { label: '✓ Mark Completed', color: '#6a1b9a', bg: '#f3e5f5' },
  CANCELLED: { label: '✕ Cancel Drive',   color: '#555',    bg: '#f5f5f5' },
}

// ─── Drive Form Modal ─────────────────────────────────────────────────────────
function DriveFormModal({ form, setForm, editId, onClose, onSave, saving }) {
  const isEdit = !!editId
  const setF   = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const today  = new Date().toISOString().split('T')[0]

  return (
    <DsModal
      show
      onClose={onClose}
      title={isEdit ? 'Edit Drive' : 'Create Blood Drive'}
      subtitle={isEdit ? `Editing drive #${editId}` : 'Schedule a new donation drive'}
      footer={
        <>
          <DsBtnGhost onClick={onClose} disabled={saving}>Cancel</DsBtnGhost>
          <DsBtnPrimary loading={saving} onClick={onSave}>
            {isEdit ? '✓ Save Changes' : '+ Create Drive'}
          </DsBtnPrimary>
        </>
      }
    >
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <DsField label="Drive Name" required>
          <DsInput value={form.name} onChange={setF('name')} placeholder="e.g. World Blood Donor Day Drive" autoFocus />
        </DsField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <DsField label="Location">
            <DsInput value={form.location} onChange={setF('location')} placeholder="Venue / address" />
          </DsField>
          <DsField label="Organizer">
            <DsInput value={form.organizer} onChange={setF('organizer')} placeholder="Name or org" />
          </DsField>
          <DsField label="Scheduled Date" required hint="Cannot be in the past">
            <DsInput type="date" value={form.scheduledDate} onChange={setF('scheduledDate')} min={today} />
          </DsField>
          <DsField label="Capacity (slots)">
            <DsInput type="number" min="1" value={form.capacity} onChange={setF('capacity')} placeholder="e.g. 100" />
          </DsField>
        </div>
      </div>
    </DsModal>
  )
}

// ─── Status Modal ─────────────────────────────────────────────────────────────
function DriveStatusModal({ drive, onClose, onUpdateStatus, updating }) {
  const transitions = STATUS_TRANSITIONS[drive.status] || []

  return (
    <DsModal
      show
      size="sm"
      onClose={onClose}
      title="Update Drive Status"
      subtitle={drive.name}
      footer={<DsBtnGhost onClick={onClose}>Close</DsBtnGhost>}
    >
      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#bbb' }}>Current</span>
          <StatusPill status={drive.status} />
        </div>
        {transitions.length === 0 ? (
          <div style={{ background: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#1565c0' }}>
            This drive is <strong>{drive.status}</strong> — no further status changes are possible.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#bbb' }}>Transition to</span>
            {transitions.map(s => {
              const cfg = STATUS_BTN[s] || { label: s, color: '#555', bg: '#f5f5f5' }
              return (
                <button key={s} disabled={!!updating} onClick={() => onUpdateStatus(s)}
                  style={{ padding: '10px 16px', border: 'none', borderRadius: 10, background: cfg.bg, color: cfg.color, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.15s', opacity: updating ? 0.6 : 1 }}>
                  {updating === s
                    ? <><span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'drive-spin 0.7s linear infinite' }} /> Updating…</>
                    : cfg.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </DsModal>
  )
}

// ─── Appointments Modal ───────────────────────────────────────────────────────
function DriveAppointmentsModal({
  drive, appointments, loadingAppts, onClose, onAction, actioning,
  onBookClick, showBook, bookForm, setBookForm, onBook, savingBook,
}) {
  const fmtDT = (v) => v ? new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

  // capacity calculations
  const activeCount = appointments.filter(a => !['CANCELLED', 'NO_SHOW'].includes(a.status)).length
  const isFull      = drive.capacity != null && activeCount >= drive.capacity
  const slotsLeft   = drive.capacity != null ? Math.max(0, drive.capacity - activeCount) : null

  const subtitleCapacity = slotsLeft != null
    ? (isFull ? ' · ⛔ Fully booked' : ` · ${slotsLeft} slot${slotsLeft !== 1 ? 's' : ''} left`)
    : ''

  return (
    <DsModal
      show
      size="xl"
      onClose={onClose}
      title={'Appointments — ' + drive.name}
      subtitle={drive.scheduledDate + ' · ' + (drive.location || 'No location') + ' · ' + appointments.length + ' booking' + (appointments.length !== 1 ? 's' : '') + subtitleCapacity}
      headerRight={
        drive.status === 'ACTIVE' && (
          <button
            onClick={onBookClick}
            disabled={isFull}
            title={isFull ? 'This drive is fully booked' : 'Book an appointment'}
            style={{
              padding: '5px 14px', border: 'none', borderRadius: 7,
              background: isFull ? '#e0e0e0' : '#c62828',
              color: isFull ? '#999' : 'white',
              fontSize: '0.8rem', fontWeight: 700,
              cursor: isFull ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isFull ? '⛔ Full' : '+ Book'}
          </button>
        )
      }
      footer={<DsBtnGhost onClick={onClose}>Close</DsBtnGhost>}
    >
      <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
        {loadingAppts ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '3rem', color: '#999' }}>
            <span style={{ width: 20, height: 20, border: '2px solid #f0e0e0', borderTopColor: '#c62828', borderRadius: '50%', display: 'inline-block', animation: 'drive-spin 0.8s linear infinite' }} />
            Loading appointments…
          </div>
        ) : appointments.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#bbb', padding: '3rem', margin: 0, fontSize: '0.9rem' }}>
            No appointments booked for this drive yet.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f8' }}>
                {['ID', 'Donor ID', 'Date & Time', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 1rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#bbb', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.appointmentId} style={{ borderBottom: '1px solid #f8f8fc' }}>
                  <td style={{ padding: '0.75rem 1rem' }}><span style={{ fontFamily: 'Courier New', fontSize: '0.8rem', color: '#bbb' }}>#{a.appointmentId}</span></td>
                  <td style={{ padding: '0.75rem 1rem' }}><span style={{ fontFamily: 'Courier New', fontSize: '0.83rem', fontWeight: 600 }}>#{a.donorId}</span></td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#555' }}>{fmtDT(a.dateTime)}</td>
                  <td style={{ padding: '0.75rem 1rem' }}><StatusPill status={a.status} /></td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {(APPT_ACTIONS[a.status] || []).map(ac => (
                        <DsBtnInline key={ac.endpoint} loading={actioning === a.appointmentId + ac.endpoint} onClick={() => onAction(a.appointmentId, ac.endpoint)}>
                          {ac.label}
                        </DsBtnInline>
                      ))}
                      {!(APPT_ACTIONS[a.status] || []).length && <span style={{ color: '#ddd', fontSize: '0.8rem' }}>—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showBook && (
        <DsModal
          show
          size="sm"
          zIndex={10000}
          onClose={() => onBookClick(false)}
          title="Book Appointment"
          subtitle={'Drive #' + drive.driveId + ' · Donor must be ACTIVE'}
          footer={
            <>
              <DsBtnGhost onClick={() => onBookClick(false)} disabled={savingBook}>Cancel</DsBtnGhost>
              <DsBtnPrimary loading={savingBook} loadingText="Booking…" onClick={onBook}>+ Book</DsBtnPrimary>
            </>
          }
        >
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <DsField label="Donor ID" required>
              <DsInput type="number" value={bookForm.donorId} onChange={e => setBookForm(f => ({ ...f, donorId: e.target.value }))} placeholder="e.g. 42" autoFocus />
            </DsField>
            <DsField label="Date & Time" required hint="Cannot be in the past">
              <DsInput type="datetime-local" value={bookForm.dateTime} onChange={e => setBookForm(f => ({ ...f, dateTime: e.target.value }))}  min={drive.scheduledDate + 'T00:00'} max={drive.scheduledDate + 'T23:59'}/>
            </DsField>
            <DsField label="Center ID" hint="Optional">
              <DsInput type="number" value={bookForm.centerId} onChange={e => setBookForm(f => ({ ...f, centerId: e.target.value }))} placeholder="Leave blank if N/A" />
            </DsField>
          </div>
        </DsModal>
      )}
    </DsModal>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DriveList({
  drives, loading, tab, displayDrives, isAdmin,
  showCreate, editDrive, statusDrive, apptDrive,
  appointments, loadingAppts,
  driveForm, setDriveForm, statusUpdating,
  apptActioning, showBookAppt, bookApptForm, setBookApptForm, savingBookAppt,
  savingDrive, savingEdit,
  onTabChange, onShowCreate, onCloseCreate, onSaveDrive,
  onEditDrive, onCloseEdit, onSaveEdit,
  onStatusDrive, onCloseStatus, onUpdateStatus,
  onApptDrive, onCloseAppts, onApptAction, onToggleBookAppt, onBookAppt,
}) {
  const counts = (k) => drives.filter(d => d.status === k).length

  const columns = [
    { key: 'driveId',       label: 'ID',        render: v => <span style={{ fontFamily: 'Courier New', fontSize: '0.8rem', color: '#aaa' }}>#{v}</span> },
    { key: 'name',          label: 'Name' },
    { key: 'location',      label: 'Location',  render: v => v || <span style={{ color: '#ccc', fontStyle: 'italic' }}>—</span> },
    { key: 'organizer',     label: 'Organizer', render: v => v || <span style={{ color: '#ccc', fontStyle: 'italic' }}>—</span> },
    { key: 'scheduledDate', label: 'Date' },
    { key: 'capacity',      label: 'Capacity',  render: v => v != null ? v : <span style={{ color: '#ccc' }}>—</span> },
    { key: 'status',        label: 'Status',    render: v => <StatusPill status={v} /> },
  ]

  return (
    <>
      <style>{`
        @keyframes drive-spin { to { transform: rotate(360deg); } }
        @keyframes drive-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .drive-root { animation: drive-fadein 0.3s ease both; }
        .drive-stat-grid { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .drive-stat-card { flex: 1; min-width: 100px; border-radius: 14px; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 3px; cursor: default; transition: transform 0.15s, box-shadow 0.15s; }
        .drive-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
        .drive-stat-value { font-size: 1.75rem; font-weight: 800; line-height: 1; }
        .drive-stat-label { font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.7px; opacity: 0.7; }
        .drive-tab-bar { display: flex; gap: 0; border-bottom: 2px solid #f0f0f8; margin-bottom: 1.25rem; overflow-x: auto; }
        .drive-tab { padding: 0.6rem 1.15rem; border: none; background: none; font-size: 0.84rem; font-weight: 500; color: #999; cursor: pointer; transition: all 0.15s; white-space: nowrap; border-bottom: 2.5px solid transparent; margin-bottom: -2px; }
        .drive-tab:hover { color: #c62828; }
        .drive-tab.active { color: #c62828; border-bottom-color: #c62828; font-weight: 700; }
      `}</style>

      <div className="drive-root">
        <PageHeader title="Blood Drives">
          {isAdmin && <button className="btn-crimson" onClick={onShowCreate}>+ Create Drive</button>}
        </PageHeader>

        <div className="drive-stat-grid">
          {STAT_CONFIG.map(({ label, key, accent, bg }) => (
            <div key={label} className="drive-stat-card" style={{ background: bg }}>
              <span className="drive-stat-value" style={{ color: accent }}>{key === null ? drives.length : counts(key)}</span>
              <span className="drive-stat-label" style={{ color: accent }}>{label}</span>
            </div>
          ))}
        </div>

        <div className="drive-tab-bar">
          {TABS.map(t => (
            <button key={t.key} className={'drive-tab' + (tab === t.key ? ' active' : '')} onClick={() => onTabChange(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="table-wrapper">
          <DataTable columns={columns} data={displayDrives} loading={loading}
            actions={row => (
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                <DsBtnInline onClick={() => onApptDrive(row)}>Appointments</DsBtnInline>
                {isAdmin && (
                  <>
                    <DsBtnInline disabled={row.status === 'COMPLETED' || row.status === 'CANCELLED'} onClick={() => onEditDrive(row)}>Edit</DsBtnInline>
                    <DsBtnInline disabled={STATUS_TRANSITIONS[row.status]?.length === 0} onClick={() => onStatusDrive(row)}>Status ▾</DsBtnInline>
                  </>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {showCreate && <DriveFormModal form={driveForm} setForm={setDriveForm} onClose={onCloseCreate} onSave={onSaveDrive} saving={savingDrive} />}
      {editDrive  && <DriveFormModal form={driveForm} setForm={setDriveForm} editId={editDrive.driveId} onClose={onCloseEdit} onSave={onSaveEdit} saving={savingEdit} />}
      {statusDrive && <DriveStatusModal drive={statusDrive} updating={statusUpdating} onClose={onCloseStatus} onUpdateStatus={onUpdateStatus} />}
      {apptDrive && (
        <DriveAppointmentsModal
          drive={apptDrive} appointments={appointments} loadingAppts={loadingAppts}
          onClose={onCloseAppts} onAction={onApptAction} actioning={apptActioning}
          showBook={showBookAppt} bookForm={bookApptForm} setBookForm={setBookApptForm}
          onBookClick={onToggleBookAppt} onBook={onBookAppt} savingBook={savingBookAppt}
        />
      )}
    </>
  )
}   