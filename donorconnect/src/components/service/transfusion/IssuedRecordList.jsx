import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Modal } from 'react-bootstrap'
import DataTable from '../../shared/ui/DataTable'
import StatusBadge from '../../shared/ui/StatusBadge'
import ConfirmModal from '../../shared/ui/ConfirmModal'
import PageHeader from '../../shared/ui/PageHeader'
import Pagination from '../../shared/ui/Pagination'

const ComponentIdBadge = ({ value }) => {
  if (!value && value !== 0) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'rgba(59, 130, 246, 0.1)', border: '1.5px solid rgb(37, 99, 235)',
      borderRadius: 20, padding: '4px 12px',
      fontWeight: 600, fontSize: '0.85rem', color: 'rgb(37, 99, 235)', whiteSpace: 'nowrap',
    }}>
      {value}
    </div>
  )
}

const MENU_HEIGHT = 150

function ActionsDropdown({ row, onReturn, onViewReactions, onLogReaction }) {
  const [open, setOpen]     = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, openUpward: false })
  const btnRef = useRef(null)

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const openUpward = spaceBelow < MENU_HEIGHT
      setMenuPos({
        top: openUpward
          ? rect.top + window.scrollY - MENU_HEIGHT - 4
          : rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 200, openUpward,
      })
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
      {row.status === 'ISSUED' && (
        <>
          <button style={itemStyle}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--crimson-pale)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => { setOpen(false); onReturn(row.issueId) }}>
            ↩ Return Unit
          </button>
          {divider}
        </>
      )}
      <button style={itemStyle}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--crimson-pale)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        onClick={() => { setOpen(false); onViewReactions(row.patientId) }}>
        🔬 View Reactions
      </button>
      <button style={itemStyle}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--crimson-pale)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        onClick={() => { setOpen(false); onLogReaction({ issueId: row.issueId, patientId: row.patientId }) }}>
        ⚠️ Log Reaction
      </button>
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

export default function IssuedRecordList({
  records, loading, confirm, reactModal,
  page, totalPages, totalElements, pageSize, onPageChange,
  onReturn, onReturnDismiss, onReturnConfirm,
  onViewReactions, onReactClose, onLogReaction,
}) {
  const columns = [
    { key: 'issueId',     label: 'ID' },
    { key: 'componentId', label: 'Component',  render: v => <ComponentIdBadge value={v} /> },
    { key: 'patientId',   label: 'Patient' },
    { key: 'issuedBy',    label: 'Issued By',  render: v => v || '—' },
    { key: 'indication',  label: 'Indication', render: v => v || '—' },
    { key: 'status',      label: 'Status',     render: v => <StatusBadge status={v} /> },
    { key: 'issueDate',   label: 'Issue Date', render: v => v ?? '—' },
  ]

  return (
    <div className="animate-fadein">
      <PageHeader title="Issued Records" />
      <div className="table-wrapper">
        <DataTable
          columns={columns}
          data={records}
          loading={loading}
          actions={row => (
            <ActionsDropdown
              row={row}
              onReturn={onReturn}
              onViewReactions={onViewReactions}
              onLogReaction={onLogReaction}
            />
          )}
        />
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />

      <ConfirmModal
        show={!!confirm} onHide={onReturnDismiss}
        onConfirm={() => onReturnConfirm(confirm)}
        title="Return Unit" message="Confirm return of this blood unit?" />

      <Modal show={reactModal !== null} onHide={onReactClose} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Patient Reactions</Modal.Title></Modal.Header>
        <Modal.Body>
          {!reactModal?.length ? (
            <div style={{ textAlign:'center', padding:'32px 16px', color:'var(--text-muted)', fontSize:'0.9rem' }}>
              <div style={{ fontSize:'2rem', marginBottom:8 }}>✅</div>
              No adverse reactions recorded for this patient.
            </div>
          ) : (
            <table className="table-glass w-100">
              <thead><tr><th>ID</th><th>Type</th><th>Severity</th><th>Status</th><th>Notes</th><th>Date</th></tr></thead>
              <tbody>
                {reactModal.map(r => (
                  <tr key={r.reactionId}>
                    <td>{r.reactionId}</td>
                    <td>{r.reactionType || '—'}</td>
                    <td><StatusBadge status={r.severity} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ maxWidth:200, wordBreak:'break-word' }}>{r.notes || '—'}</td>
                    <td>{r.reactionDate ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}