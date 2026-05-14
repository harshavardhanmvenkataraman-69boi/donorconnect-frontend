import { useState } from 'react'                        // ← ADDED useState
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../shared/ui/PageHeader'
import DataTable from '../../shared/ui/DataTable'
import StatusBadge from '../../shared/ui/StatusBadge'
import DsModal from '../../shared/donor-service/DsModal'
import { DsBtnPrimary, DsBtnGhost, DsBtnInline } from '../../shared/donor-service/DsButtons'
import { BloodCircle, StatusPill } from '../../shared/donor-service/DsBadges'
import { getRole } from '../../../api/authUtils'         // ← ADDED

const TYPE_LABELS = { VOLUNTARY: 'Voluntary', REPLACEMENT: 'Replacement', STUDENT: 'Student', CORPORATE: 'Corporate' }

const parseAddress = (raw) => {
  try { const a = JSON.parse(raw); return [a.street, a.city, a.state, a.pincode].filter(Boolean).join(', ') || null }
  catch { return null }
}

function DonorDetailModal({ donor, onClose, onEdit }) {
  const address = parseAddress(donor.addressJson)
  const typeLabel = TYPE_LABELS[donor.donorType] || donor.donorType
  return (
    <DsModal show onClose={onClose} title={donor.name}
      subtitle={`ID #${donor.donorId} · ${typeLabel}`}
      headerRight={<BloodCircle group={donor.bloodGroup} rh={donor.rhFactor} size={52} />}
      footer={<><DsBtnGhost onClick={onClose}>Close</DsBtnGhost><DsBtnPrimary onClick={onEdit}>✏ Edit Donor</DsBtnPrimary></>}>
      <div className="p-3">
        <div className="row g-4">
          <div className="col-6">
            <p className="text-muted text-uppercase fw-bold small mb-2" style={{ letterSpacing: '0.7px' }}>👤 Personal</p>
            {[['Full Name', donor.name], ['Date of Birth', donor.dob || '—'], ['Gender', donor.gender], ['Contact', donor.contactInfo || '—']].map(([l, v]) => (
              <div key={l} className="mb-2">
                <div className="text-muted" style={{ fontSize: '0.67rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
                <div className="small">{v}</div>
              </div>
            ))}
          </div>
          <div className="col-6">
            <p className="text-muted text-uppercase fw-bold small mb-2" style={{ letterSpacing: '0.7px' }}>🩸 Blood Info</p>
            {[['Blood Group', donor.bloodGroup], ['Rh Factor', donor.rhFactor], ['Donor Type', typeLabel], ['Status', <StatusPill status={donor.status} />]].map(([l, v]) => (
              <div key={l} className="mb-2">
                <div className="text-muted" style={{ fontSize: '0.67rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
                <div className="small">{v}</div>
              </div>
            ))}
          </div>
          {address && (
            <div className="col-12">
              <p className="text-muted text-uppercase fw-bold small mb-1" style={{ letterSpacing: '0.7px' }}>📍 Address</p>
              <div className="small text-secondary">{address}</div>
            </div>
          )}
        </div>
      </div>
    </DsModal>
  )
}

// ── ADDED: Delete confirm modal ───────────────────────────────────────────────
const DELETE_REASONS = [
  'Donor deceased',
  'Duplicate record',
  'Data entry error',
  'Donor request',
  'Other',
]

function DeleteConfirmModal({ donor, onClose, onConfirm }) {
  const [reason, setReason] = useState('Donor deceased')
  const [deleting, setDeleting] = useState(false)

  const handle = async () => {
    setDeleting(true)
    await onConfirm(donor.donorId, reason)
    setDeleting(false)
  }

  return (
    <DsModal show size="sm" onClose={onClose}
      title="Delete Donor Record"
      subtitle={`${donor.name} · ID #${donor.donorId}`}
      footer={
        <>
          <DsBtnGhost onClick={onClose} disabled={deleting}>Cancel</DsBtnGhost>
          <button
            className="btn btn-danger btn-sm"
            onClick={handle}
            disabled={deleting}
          >
            {deleting
              ? <><span className="spinner-border spinner-border-sm me-1" />Deleting…</>
              : '🗑 Delete Permanently'}
          </button>
        </>
      }>
      <div className="p-3 d-flex flex-column gap-3">
        <div className="alert alert-danger py-2 mb-0 small">
          ⚠ This action <strong>cannot be undone</strong>. All appointments,
          screenings and deferrals linked to this donor will also be removed.
        </div>
        <div>
          <label className="form-label small fw-semibold text-uppercase text-secondary"
            style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
            Reason for deletion
          </label>
          <select
            className="form-select form-select-sm"
            value={reason}
            onChange={e => setReason(e.target.value)}
          >
            {DELETE_REASONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
    </DsModal>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

export default function DonorList({
  donors, loading, search, bgFilter, phoneSearch,
  selectedDonor, onSearchChange, onPhoneChange,
  onBgChange, onClearFilters, onRegisterClick,
  onSelectDonor, onCloseModal, onEditDonor,
  deleteTarget, onDeleteRequest, onDeleteConfirm, onDeleteClose,  // ← ADDED
}) {
  const navigate = useNavigate()
  const isAdmin  = getRole() === 'ROLE_ADMIN'               // ← ADDED

  const columns = [
    { key: 'donorId', label: 'ID', render: v => <code className="text-muted">#{v}</code> },
    { key: 'name', label: 'Name' },
    { key: 'bloodGroup', label: 'Blood Type', render: (v, row) => <BloodCircle group={v} rh={row.rhFactor} /> },
    { key: 'donorType', label: 'Type', render: v => TYPE_LABELS[v] || v || '—' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
  ]

  return (
    <div className="animate-fadein">
      <PageHeader title="Donor Registry">
        <button className="btn btn-danger btn-sm" onClick={onRegisterClick}>+ Register Donor</button>
      </PageHeader>

      <div className="d-flex gap-2 align-items-center mb-3 flex-wrap">

        {/* Name search */}
        <div className="input-group input-group-sm" style={{ maxWidth: 240 }}>
          <span className="input-group-text">🔍</span>
          <input
            className="form-control"
            placeholder="Search by name…"
            value={search}
            onChange={onSearchChange}
          />
        </div>

        {/* Phone search */}
        <div className="input-group input-group-sm" style={{ maxWidth: 220 }}>
          <span className="input-group-text">📞</span>
          <input
            className="form-control"
            type="tel"
            placeholder="Search by phone…"
            value={phoneSearch}
            onChange={onPhoneChange}
          />
        </div>

        {/* Blood group filter */}
        <select className="form-select form-select-sm" style={{ width: 160 }} value={bgFilter} onChange={onBgChange}>
          <option value="">All Blood Groups</option>
          {['A', 'B', 'AB', 'O'].map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        {/* Clear button — shows when any filter is active */}
        {(search || bgFilter || phoneSearch) && (
          <button className="btn btn-outline-secondary btn-sm" onClick={onClearFilters}>✕ Clear</button>
        )}
      </div>

      <div className="table-wrapper">
        <DataTable columns={columns} data={donors} loading={loading}
          actions={row => (
            <div className="d-flex gap-1">
              <DsBtnInline onClick={() => onSelectDonor(row)}>View</DsBtnInline>
              <DsBtnInline onClick={() => navigate(`/dashboard/donors/edit/${row.donorId}`)}>Edit</DsBtnInline>
              {/* ── ADDED: Delete button — admin only ── */}
              {isAdmin && (
                <DsBtnInline variant="red" onClick={() => onDeleteRequest(row)}>Delete</DsBtnInline>
              )}
            </div>
          )}
        />
      </div>

      {selectedDonor && (
        <DonorDetailModal
          donor={selectedDonor}
          onClose={onCloseModal}
          onEdit={() => { onCloseModal(); onEditDonor(selectedDonor.donorId) }}
        />
      )}

      {/* ── ADDED: Delete confirm modal ── */}
      {deleteTarget && (
        <DeleteConfirmModal
          donor={deleteTarget}
          onClose={onDeleteClose}
          onConfirm={onDeleteConfirm}
        />
      )}
    </div>
  )
}