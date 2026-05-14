import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Modal, Row, Col } from 'react-bootstrap'
import DataTable from '../../shared/ui/DataTable'
import StatusBadge from '../../shared/ui/StatusBadge'
import PageHeader from '../../shared/ui/PageHeader'
import { getRole } from '../../../api/authUtils'

const MENU_HEIGHT = 120

function ActionsDropdown({ row, onStatusOpen, onLookback, onCheckLookback, lookbackLoading, isAdmin }) {
  const [open, setOpen]               = useState(false)
  const [menuPos, setMenuPos]         = useState({ top: 0, left: 0, openUpward: false })
  const [hasLookback, setHasLookback] = useState(null)
  const [checking, setChecking]       = useState(false)
  const btnRef = useRef(null)

  const handleToggle = async () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const openUpward = spaceBelow < MENU_HEIGHT
      setMenuPos({
        top: openUpward
          ? rect.top + window.scrollY - MENU_HEIGHT - 4
          : rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 200,
        openUpward,
      })
      if (hasLookback === null && !checking) {
        setChecking(true)
        const traces = await onCheckLookback(row.patientId)
        setHasLookback(!!traces)
        setChecking(false)
      }
    }
    setOpen(o => !o)
  }

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  const itemStyle = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 16px', fontSize: '0.83rem',
    color: 'var(--text-primary)', cursor: 'pointer',
    whiteSpace: 'nowrap', background: 'transparent',
    border: 'none', width: '100%', textAlign: 'left',
  }
  const divider = <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }} />

  const menu = open ? createPortal(
    <div onMouseDown={e => e.stopPropagation()} style={{
      position: 'absolute', top: menuPos.top, left: menuPos.left, width: 200,
      background: 'var(--glass-bg, #fff)', border: '1px solid var(--border-light)',
      borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
      zIndex: 9999, overflow: 'hidden', backdropFilter: 'blur(12px)',
    }}>

      {/* Update Status — both roles */}
      <button style={itemStyle}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--crimson-pale)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        onClick={() => { setOpen(false); onStatusOpen(row) }}>
        ✏️ Update Status
      </button>

      {divider}

      {/* Lookback section */}
      {checking ? (
        <div style={{ ...itemStyle, color: 'var(--text-muted)', cursor: 'default' }}>
          ⏳ Checking...
        </div>
      ) : hasLookback ? (
        // Lookback exists — both roles can view
        <button style={{ ...itemStyle, color: 'rgb(37, 99, 235)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--crimson-pale)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          onClick={() => { setOpen(false); onLookback(row) }}>
          👁 View Lookback
        </button>
      ) : isAdmin ? (
        // No lookback yet — only Admin can initiate
        <button style={{ ...itemStyle, opacity: lookbackLoading ? 0.5 : 1 }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--crimson-pale)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          disabled={lookbackLoading}
          onClick={() => { setOpen(false); onLookback(row) }}>
          🔍 Initiate Lookback
        </button>
      ) : (
        // No lookback yet — officer sees disabled info
        <div style={{ ...itemStyle, color: 'var(--text-muted)', cursor: 'default', fontSize: '0.78rem' }}>
          🔍 Lookback not initiated
        </div>
      )}

    </div>,
    document.body
  ) : null

  return (
    <>
      <button ref={btnRef} className="btn-glass"
        style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}
        onClick={handleToggle}>
        Actions
        <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>
          {open ? (menuPos.openUpward ? '▼' : '▲') : '▼'}
        </span>
      </button>
      {menu}
    </>
  )
}

export default function ReactionList({
  reactions, loading,
  showLog, logForm,
  statusModal, newStatus,
  lookbackLoading,
  onLogClick, onLogClose, onLogFormChange, onLogSave,
  onStatusOpen, onStatusClose, onNewStatusChange, onStatusUpdate,
  onLookback, onCheckLookback,
}) {
  const isPrefilled = !!(logForm.issueId && logForm.patientId)
  const isAdmin     = getRole() === 'ROLE_ADMIN'

  const columns = [
    { key: 'reactionId',   label: 'ID' },
    { key: 'issueId',      label: 'Issue ID' },
    { key: 'patientId',    label: 'Patient' },
    { key: 'reactionType', label: 'Type',     render: v => v || '—' },
    { key: 'severity',     label: 'Severity', render: v => <StatusBadge status={v} /> },
    { key: 'status',       label: 'Status',   render: v => <StatusBadge status={v} /> },
    { key: 'reactionDate', label: 'Date',     render: v => v ?? '—' },
  ]

  return (
    <div className="animate-fadein">
      <PageHeader title="Adverse Reactions">
        <button className="btn-crimson" onClick={onLogClick}>+ Log Reaction</button>
      </PageHeader>

      {lookbackLoading && (
        <div style={{
          marginBottom: 12, padding: '10px 16px',
          background: 'var(--crimson-pale)', border: '1px solid var(--border-light)',
          borderRadius: 8, fontSize: '0.83rem', color: 'var(--text-muted)',
        }}>
          🔍 Fetching lookback details...
        </div>
      )}

      <div className="table-wrapper">
        <DataTable
          columns={columns}
          data={reactions}
          loading={loading}
          actions={row => (
            <ActionsDropdown
              row={row}
              isAdmin={isAdmin}
              onStatusOpen={onStatusOpen}
              onLookback={onLookback}
              onCheckLookback={onCheckLookback}
              lookbackLoading={lookbackLoading}
            />
          )}
        />
      </div>

      {/* ── Log Reaction Modal ── */}
      <Modal show={showLog} onHide={onLogClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Log Adverse Reaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isPrefilled && (
            <div style={{
              background: 'var(--crimson-pale)', border: '1px solid var(--border-light)',
              borderRadius: 8, padding: '10px 14px',
              fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16,
            }}>
              ℹ️ Issue ID and Patient ID are pre-filled from the issued record.
            </div>
          )}
          <Row className="g-3">
            <Col md={6}>
              <label className="form-label">Issue ID *</label>
              <input type="number" className="form-control"
                value={logForm.issueId}
                readOnly={isPrefilled}
                style={isPrefilled ? { background: 'var(--surface-glass)', cursor: 'not-allowed' } : {}}
                onChange={e => onLogFormChange({ ...logForm, issueId: e.target.value })} />
            </Col>
            <Col md={6}>
              <label className="form-label">Patient ID *</label>
              <input type="number" className="form-control"
                value={logForm.patientId}
                readOnly={isPrefilled}
                style={isPrefilled ? { background: 'var(--surface-glass)', cursor: 'not-allowed' } : {}}
                onChange={e => onLogFormChange({ ...logForm, patientId: e.target.value })} />
            </Col>
            <Col md={6}>
              <label className="form-label">Reaction Type</label>
              <input className="form-control" placeholder="e.g. Febrile, Allergic"
                value={logForm.reactionType}
                onChange={e => onLogFormChange({ ...logForm, reactionType: e.target.value })} />
            </Col>
            <Col md={6}>
              <label className="form-label">Severity</label>
              <select className="form-select" value={logForm.severity}
                onChange={e => onLogFormChange({ ...logForm, severity: e.target.value })}>
                <option>MILD</option>
                <option>MODERATE</option>
                <option>SEVERE</option>
                <option>FATAL</option>
              </select>
            </Col>
            <Col xs={12}>
              <label className="form-label">Notes</label>
              <textarea className="form-control" rows={3}
                value={logForm.notes}
                onChange={e => onLogFormChange({ ...logForm, notes: e.target.value })} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={onLogClose}>Cancel</button>
          <button className="btn-crimson" onClick={onLogSave}
            disabled={!logForm.issueId || !logForm.patientId}>
            Log Reaction
          </button>
        </Modal.Footer>
      </Modal>

      {/* ── Update Status Modal ── */}
      <Modal show={!!statusModal} onHide={onStatusClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Reaction Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <div style={{ marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Reaction ID: <strong>{statusModal?.reactionId}</strong> &nbsp;|&nbsp;
                Patient: <strong>{statusModal?.patientId}</strong> &nbsp;|&nbsp;
                Current: <strong>{statusModal?.status}</strong>
              </div>
            </Col>
            <Col xs={12}>
              <label className="form-label">New Status</label>
              <select className="form-select" value={newStatus}
                onChange={e => onNewStatusChange(e.target.value)}>
                <option value="PENDING">PENDING</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={onStatusClose}>Cancel</button>
          <button className="btn-crimson" onClick={onStatusUpdate}>Update</button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}