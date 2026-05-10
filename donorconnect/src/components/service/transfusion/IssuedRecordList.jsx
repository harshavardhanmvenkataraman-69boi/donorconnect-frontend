import { Modal } from 'react-bootstrap'
import DataTable from '../../shared/ui/DataTable'
import StatusBadge from '../../shared/ui/StatusBadge'
import ConfirmModal from '../../shared/ui/ConfirmModal'
import PageHeader from '../../shared/ui/PageHeader'

export default function IssuedRecordList({ records, loading, confirm, reactModal, onReturn, onReturnDismiss, onReturnConfirm, onViewReactions, onReactClose }) {
  const columns = [
    { key:'issueId', label:'ID' }, { key:'componentId', label:'Component' }, { key:'patientId', label:'Patient' },
    { key:'issuedBy', label:'Issued By', render: v => v || '—' },
    { key:'indication', label:'Indication', render: v => v || '—' },
    { key:'status', label:'Status', render: v => <StatusBadge status={v} /> },
    { key:'issueDate', label:'Issue Date', render: v => v ?? '—' },
  ]
  return (
    <div className="animate-fadein">
      <PageHeader title="Issued Records" />
      <div className="table-wrapper">
        <DataTable columns={columns} data={records} loading={loading} actions={row => (
          <div className="d-flex gap-2">
            {row.status === 'ISSUED' && <button className="btn-glass" style={{ fontSize:'0.75rem' }} onClick={() => onReturn(row.issueId)}>Return</button>}
            <button className="btn-glass" style={{ fontSize:'0.75rem' }} onClick={() => onViewReactions(row.patientId)}>Reactions</button>
          </div>
        )} />
      </div>
      <ConfirmModal show={!!confirm} onHide={onReturnDismiss} onConfirm={() => onReturnConfirm(confirm)} title="Return Unit" message="Confirm return of this blood unit?" />
      <Modal show={!!reactModal} onHide={onReactClose} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Patient Reactions</Modal.Title></Modal.Header>
        <Modal.Body>
          {!reactModal?.length ? <p style={{ color:'var(--text-muted)' }}>No reactions recorded for this patient.</p> : (
            <table className="table-glass w-100">
              <thead><tr><th>ID</th><th>Severity</th><th>Status</th><th>Description</th></tr></thead>
              <tbody>{reactModal.map(r => (<tr key={r.id}><td>{r.id}</td><td><StatusBadge status={r.severity} /></td><td><StatusBadge status={r.status} /></td><td>{r.description}</td></tr>))}</tbody>
            </table>
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}
