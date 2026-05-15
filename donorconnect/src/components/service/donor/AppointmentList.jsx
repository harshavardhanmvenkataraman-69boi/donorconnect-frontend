import { useState } from 'react'
import PageHeader from '../../shared/ui/PageHeader'
import DataTable from '../../shared/ui/DataTable'
import DsModal from '../../shared/donor-service/DsModal'
import { DsField, DsInput, DsSelect } from '../../shared/donor-service/DsField'
import { DsBtnPrimary, DsBtnGhost, DsBtnDanger, DsBtnInline } from '../../shared/donor-service/DsButtons'
import { StatusPill } from '../../shared/donor-service/DsBadges'
import { getRole } from '../../../api/authUtils'

// ─── Constants ────────────────────────────────────────────────────────────────
const APPT_STATUS_CONFIG = {
  BOOKED:     { bg: '#e3f2fd', color: '#1565c0', dot: '#42a5f5', label: 'Booked'     },
  CHECKED_IN: { bg: '#fff3e0', color: '#e65100', dot: '#fb8c00', label: 'Checked In' },
  COMPLETED:  { bg: '#e8f5e9', color: '#1b5e20', dot: '#43a047', label: 'Completed'  },
  CANCELLED:  { bg: '#f5f5f5', color: '#555',    dot: '#9e9e9e', label: 'Cancelled'  },
  NO_SHOW:    { bg: '#ffebee', color: '#b71c1c', dot: '#e53935', label: 'No Show'    },
}

const APPT_ACTIONS = {
  BOOKED: [
    { label: '✓ Check In', endpoint: 'check-in', role: 'RECEPTION', variant: 'green'  },
    { label: '⚠ No Show',  endpoint: 'no-show',  role: 'RECEPTION', variant: 'orange' },
    { label: '✕ Cancel',   endpoint: 'cancel',   role: 'ALL',       variant: 'default', confirm: true },
  ],
  CHECKED_IN: [
    { label: '✓ Complete', endpoint: 'complete', role: 'RECEPTION', variant: 'green' },
    { label: '✕ Cancel',   endpoint: 'cancel',   role: 'ALL',       variant: 'default', confirm: true },
  ],
  COMPLETED: [], CANCELLED: [], NO_SHOW: [],
}

const fmtDateTime = (v) =>
  v ? new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const TABS = [
  { key: 'today', label: "Today's Appointments" },
  { key: 'all',   label: 'All Appointments'     },
  { key: 'donor', label: 'By Donor'             },
]

// ─── Donor status indicator ───────────────────────────────────────────────────
function DonorStatusHint({ status, name }) {
  if (status === 'idle')     return null
  if (status === 'checking') return (
    <span style={{ fontSize: '0.78rem', color: '#888', marginTop: 4, display: 'block' }}>
      ⏳ Verifying donor…
    </span>
  )
  if (status === 'valid') return (
    <span style={{ fontSize: '0.78rem', color: '#2e7d32', marginTop: 4, display: 'block', fontWeight: 600 }}>
      ✓ {name}
    </span>
  )
  if (status === 'invalid') return (
    <span style={{ fontSize: '0.78rem', color: '#c62828', marginTop: 4, display: 'block' }}>
      ✕ Donor not found or inactive
    </span>
  )
  return null
}

// ─── Book Modal ───────────────────────────────────────────────────────────────
// FIX: BookModal now receives and uses donorStatus/donorName from the parent,
// which performs the real API validation. The local form no longer decides
// validity on its own — it delegates to the parent via onDonorIdChange.
function BookModal({ drives, onClose, onBook, donorStatus, donorName, onDonorIdChange }) {
  const [form, setForm]   = useState({ donorId: '', dateTime: '', driveId: '', centerId: '' })
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const upcoming = drives.filter(d => d.status === 'ACTIVE' || d.status === 'PLANNED')

  const selectedDrive = upcoming.find(d => d.driveId === Number(form.driveId))

  const handleDonorIdChange = (e) => {
    const val = e.target.value
    setForm(f => ({ ...f, donorId: val }))
    // Notify parent so it can run the debounced API check
    onDonorIdChange(val)
  }

  const handle = async () => {
    if (!form.donorId)  return
    if (!form.dateTime) return
    // FIX: guard against clicking Book while the debounce is still in-flight
    if (donorStatus === 'checking' || donorStatus !== 'valid') return
    setSaving(true)
    await onBook(form)
    setSaving(false)
  }

  // FIX: Book button is disabled until the parent confirms the donor is valid
  const canBook = form.donorId && form.dateTime && donorStatus === 'valid'

  return (
    <DsModal
      show
      onClose={onClose}
      title="Book Appointment"
      subtitle="Donor must be ACTIVE with at least one cleared screening"
      footer={
        <>
          <DsBtnGhost onClick={onClose} disabled={saving}>Cancel</DsBtnGhost>
          <DsBtnPrimary
            loading={saving}
            loadingText="Booking…"
            onClick={handle}
            disabled={!canBook || saving}
          >
            + Book Appointment
          </DsBtnPrimary>
        </>
      }
    >
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

        {/* Donor ID — wired to parent validation */}
        <DsField label="Donor ID" required>
          <DsInput
            type="number"
            value={form.donorId}
            onChange={handleDonorIdChange}
            placeholder="e.g. 42"
            autoFocus
          />
          {/* Live feedback below the input */}
          <DonorStatusHint status={donorStatus} name={donorName} />
        </DsField>

        {/* Date & Time */}
        <DsField label="Date" required hint={selectedDrive ? 'Must be on ' + selectedDrive.scheduledDate : 'Cannot be in the past'}>
  <DsInput
    type="date"
    value={form.dateTime}
    onChange={set('dateTime')}
    min={selectedDrive ? selectedDrive.scheduledDate : new Date().toISOString().split('T')[0]}
    max={selectedDrive ? selectedDrive.scheduledDate : undefined}
  />
</DsField>

        {/* Blood Drive */}
        <DsField label="Blood Drive" hint="Optional — leave blank for walk-in">
          <DsSelect value={form.driveId} onChange={set('driveId')}>
            <option value="">— No drive / walk-in —</option>
            {upcoming.map(d => (
              <option key={d.driveId} value={d.driveId}>
                {d.name}{d.location ? ` — ${d.location}` : ''} ({d.scheduledDate})
              </option>
            ))}
          </DsSelect>
        </DsField>

        {/* Center ID */}
        <DsField label="Center ID" hint="Optional">
          <DsInput
            type="number"
            value={form.centerId}
            onChange={set('centerId')}
            placeholder="Leave blank if N/A"
          />
        </DsField>

      </div>
    </DsModal>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ appt, drives, onClose, onAction }) {
  const drive   = drives.find(d => d.driveId === appt.driveId)
  const actions = APPT_ACTIONS[appt.status] || []
  const role    = getRole()
  const canAct  = (r) => r === 'ALL' || role === 'ROLE_RECEPTION' || role === 'ROLE_ADMIN'

  const fields = [
    ['Appointment ID', <code style={{ fontFamily: 'Courier New', fontSize: '0.9rem' }}>#{appt.appointmentId}</code>],
    ['Donor ID',       <code style={{ fontFamily: 'Courier New', fontSize: '0.9rem' }}>#{appt.donorId}</code>],
    ['Date & Time',    fmtDateTime(appt.dateTime)],
    ['Status',         <StatusPill status={appt.status} />],
    ['Drive',          drive ? `${drive.name}${drive.location ? ` — ${drive.location}` : ''}` : appt.driveId ? `#${appt.driveId}` : '—'],
    ['Center ID',      appt.centerId ?? '—'],
  ]

  return (
    <DsModal
      show
      onClose={onClose}
      title={`Appointment #${appt.appointmentId}`}
      subtitle={`Donor #${appt.donorId}`}
      headerRight={<StatusPill status={appt.status} />}
      footer={<DsBtnGhost onClick={onClose}>Close</DsBtnGhost>}
    >
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 1.5rem', marginBottom: '1rem' }}>
          {fields.map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: '0.67rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#bbb', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: '0.9rem', color: '#1a1a2e' }}>{value}</div>
            </div>
          ))}
        </div>
        {actions.filter(a => canAct(a.role)).length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.9rem', borderTop: '1px solid #f0f0f8' }}>
            <span style={{ fontSize: '0.67rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#bbb' }}>Actions</span>
            {actions.filter(a => canAct(a.role)).map(a => (
              <DsBtnInline
                key={a.endpoint}
                variant={a.variant}
                onClick={() => onAction(appt.appointmentId, a.endpoint, a.confirm)}
              >
                {a.label}
              </DsBtnInline>
            ))}
          </div>
        )}
      </div>
    </DsModal>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <DsModal
      show
      onClose={onCancel}
      title="Confirm Cancellation"
      size="sm"
      zIndex={10000}
      footer={
        <>
          <DsBtnGhost onClick={onCancel}>No, keep it</DsBtnGhost>
          <DsBtnDanger onClick={onConfirm}>Yes, cancel</DsBtnDanger>
        </>
      }
    >
      <p style={{ padding: '1.25rem 1.5rem', margin: 0, fontSize: '0.92rem', color: '#444', lineHeight: 1.6 }}>
        {message}
      </p>
    </DsModal>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AppointmentList({
  tab, appts, loading, drives, donorSearch, actioning,
  onTabChange, onDonorSearchChange, onDonorSearch, onAction, onViewAppt,
  showBook, viewAppt, confirm,
  onBookClose, onViewClose, onConfirmClose, onBookDone, onConfirmDone,
  // FIX: accept the donor validation props passed down from AppointmentsPage
  bookDonorStatus, bookDonorName, onBookDonorIdChange,
}) {
  const role   = getRole()
  const canAct = (r) => r === 'ALL' || role === 'ROLE_RECEPTION' || role === 'ROLE_ADMIN'
  const counts = (s) => appts.filter(a => a.status === s).length

  const columns = [
    {
      key: 'appointmentId', label: 'ID',
      render: v => <span style={{ fontFamily: 'Courier New', fontSize: '0.8rem', color: '#aaa' }}>#{v}</span>
    },
    {
      key: 'donorId', label: 'Donor',
      render: v => <span style={{ fontFamily: 'Courier New', fontSize: '0.82rem', fontWeight: 600 }}>#{v}</span>
    },
    {
      key: 'driveId', label: 'Drive',
      render: v => {
        if (!v) return <span style={{ color: '#bbb', fontSize: '0.8rem', fontStyle: 'italic' }}>Walk-in</span>
        const d = drives.find(dr => dr.driveId === v)
        return <span style={{ fontSize: '0.82rem' }}>{d ? d.name : `#${v}`}</span>
      }
    },
    {
      key: 'dateTime', label: 'Date & Time',
      render: v => <span style={{ fontSize: '0.83rem', color: '#555' }}>{fmtDateTime(v)}</span>
    },
    { key: 'status', label: 'Status', render: v => <StatusPill status={v} /> },
  ]

  return (
    <>
      <style>{`
        .appt-tab-bar { display: flex; gap: 0; border-bottom: 2px solid #f0f0f8; margin-bottom: 1.25rem; }
        .appt-tab {
          padding: 0.6rem 1.2rem; border: none; background: none;
          font-size: 0.85rem; font-weight: 500; color: #999;
          cursor: pointer; transition: all 0.15s;
          border-bottom: 2.5px solid transparent; margin-bottom: -2px;
          white-space: nowrap;
        }
        .appt-tab:hover { color: #c62828; }
        .appt-tab.active { color: #c62828; border-bottom-color: #c62828; font-weight: 700; }
        .appt-summary-strip { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
        .appt-summary-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 20px;
          font-size: 0.75rem; font-weight: 600;
        }
        .appt-search-row { display: flex; gap: 0.6rem; align-items: center; margin-bottom: 1.25rem; }
        .appt-search-input {
          padding: 8px 13px; border: 1.5px solid #e0e0ec; border-radius: 9px;
          font-size: 0.88rem; outline: none; background: #fafafa;
          transition: border-color 0.15s;
          width: 220px;
        }
        .appt-search-input:focus { border-color: #c62828; background: #fff; }
        @keyframes appt-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .appt-root { animation: appt-fadein 0.3s ease both; }
      `}</style>

      <div className="appt-root">
        <PageHeader title="Appointments">
          <button className="btn-crimson" onClick={() => onViewAppt(null)}>+ Book Appointment</button>
        </PageHeader>

        {/* Summary chips — only on today tab */}
        {tab === 'today' && appts.length > 0 && (
          <div className="appt-summary-strip">
            {Object.entries(APPT_STATUS_CONFIG).map(([s, cfg]) => {
              const n = counts(s)
              if (n === 0) return null
              return (
                <span key={s} className="appt-summary-chip" style={{ color: cfg.color, background: cfg.bg }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
                  {cfg.label}: <strong>{n}</strong>
                </span>
              )
            })}
          </div>
        )}

        {/* Tab bar */}
        <div className="appt-tab-bar">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`appt-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => onTabChange(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Donor search */}
        {tab === 'donor' && (
          <div className="appt-search-row">
            <input
              className="appt-search-input"
              type="number"
              placeholder="Search by Donor ID…"
              value={donorSearch}
              onChange={onDonorSearchChange}
              onKeyDown={e => e.key === 'Enter' && onDonorSearch()}
            />
            <button className="btn-crimson" onClick={onDonorSearch} disabled={!donorSearch?.trim()}>
              Search
            </button>
          </div>
        )}

        {/* Table */}
        <div className="table-wrapper">
          <DataTable
            columns={columns}
            data={appts}
            loading={loading}
            actions={row => {
              const visible = (APPT_ACTIONS[row.status] || []).filter(a => canAct(a.role))
              if (!visible.length) return null
              return (
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {visible.map(a => (
                    <DsBtnInline
                      key={a.endpoint}
                      variant={a.variant}
                      loading={actioning === `${row.appointmentId}${a.endpoint}`}
                      onClick={() => onAction(row.appointmentId, a.endpoint, a.confirm)}
                    >
                      {a.label}
                    </DsBtnInline>
                  ))}
                  <DsBtnInline onClick={() => onViewAppt(row)}>View</DsBtnInline>
                </div>
              )
            }}
          />
        </div>
      </div>

      {/* Modals */}
      {showBook && (
        <BookModal
          drives={drives}
          onClose={onBookClose}
          onBook={onBookDone}
          donorStatus={bookDonorStatus}
          donorName={bookDonorName}
          onDonorIdChange={onBookDonorIdChange}
        />
      )}
      {viewAppt && (
        <DetailModal
          appt={viewAppt}
          drives={drives}
          onClose={onViewClose}
          onAction={(id, ep, nc) => { onViewClose(); onAction(id, ep, nc) }}
        />
      )}
      {confirm && (
        <ConfirmDialog
          message={`Cancel appointment #${confirm.appointmentId}? This action cannot be undone.`}
          onConfirm={onConfirmDone}
          onCancel={onConfirmClose}
        />
      )}
    </>
  )
}
