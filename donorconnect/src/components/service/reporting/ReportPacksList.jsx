import { Modal } from 'react-bootstrap';
import DataTable from '../../shared/ui/DataTable';
import StatusBadge from '../../shared/ui/StatusBadge';
import LoadingSpinner from '../../shared/ui/LoadingSpinner';

const SCOPE_BADGE = {
  SITE:     'primary',
  REGIONAL: 'warning',
  NATIONAL: 'success',
};

const fmtDate = (v) =>
  v ? new Date(v).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function ReportPacksList({
  packs,
  loading,
  viewingPack,
  onViewPack,
  onCloseModal,
}) {
  const columns = [
    { key: 'packId', label: 'Pack ID', render: (v) => `#${v}` },
    {
      key: 'scope',
      label: 'Scope',
      render: (v) => (
        <span className={`status-badge ${SCOPE_BADGE[v] || 'secondary'}`}>{v}</span>
      ),
    },
    {
      key: 'generatedDate',
      label: 'Generated At',
      render: (v, row) => fmtDate(v || row.createdAt),
    },
  ];

  return (
    <>
      <div className="table-wrapper">
        <div className="table-header-row">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
            Generated Report Packs
          </span>
          <span className="status-badge secondary">{packs.length} packs</span>
        </div>
        <DataTable
          columns={columns}
          data={packs}
          loading={loading}
          actions={(row) => (
            <button className="btn-glass" style={{ fontSize: '0.78rem', padding: '4px 12px' }}
              onClick={() => onViewPack(row.packId || row.id)}>
              View
            </button>
          )}
        />
      </div>

      <Modal show={!!viewingPack} onHide={onCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Report Pack #{viewingPack?.packId || viewingPack?.id}
            {viewingPack?.scope && (
              <span className={`status-badge ${SCOPE_BADGE[viewingPack.scope] || 'secondary'} ms-2`}
                style={{ fontSize: '0.72rem', verticalAlign: 'middle' }}>
                {viewingPack.scope}
              </span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewingPack?.generatedDate && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              Generated: {fmtDate(viewingPack.generatedDate)}
            </p>
          )}
          <div style={{
            background: 'rgba(193,18,31,0.03)', border: '1px solid var(--border-light)',
            borderRadius: 10, padding: 16,
          }}>
            <pre style={{
              fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap',
              color: 'var(--text-primary)', margin: 0, lineHeight: 1.6,
              maxHeight: 400, overflowY: 'auto',
            }}>
              {JSON.stringify(viewingPack, null, 2)}
            </pre>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={onCloseModal}>Close</button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
