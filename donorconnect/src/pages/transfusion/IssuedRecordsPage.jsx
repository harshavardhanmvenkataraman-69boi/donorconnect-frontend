import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import ConfirmModal from '../../components/shared/ui/ConfirmModal';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function IssuedRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [reactModal, setReactModal] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/api/transfusion/issue?page=0&size=50')
      .then(r => {
        const data = r.data?.data;
        // paginated → data.content, plain list → data directly
        setRecords(data?.content ?? (Array.isArray(data) ? data : []));
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const returnUnit = async (issueId) => {
    try {
      await api.patch(`/api/transfusion/issue/${issueId}/return`);
      showSuccess('Unit returned successfully');
      load();
    } catch (e) {
      showError(e.response?.data?.message || 'Return failed');
    }
  };

  const viewReactions = async (patientId) => {
    try {
      const r = await api.get(`/api/safety/reactions/patient/${patientId}`);
      setReactModal(r.data?.data || r.data || []);
    } catch {
      setReactModal([]);
    }
  };

  // IssueRecord entity fields (from backend):
  // issueId, componentId, patientId, issueDate, issuedBy, indication, status
  // FIX: was using 'id', 'ward', 'doctorName', 'issuedAt' — all wrong keys
  const columns = [
    { key: 'issueId',     label: 'ID' },
    { key: 'componentId', label: 'Component' },
    { key: 'patientId',   label: 'Patient' },
    { key: 'issuedBy',    label: 'Issued By',  render: v => v || '—' },
    { key: 'indication',  label: 'Indication', render: v => v || '—' },
    { key: 'status',      label: 'Status',     render: v => <StatusBadge status={v} /> },
    { key: 'issueDate',   label: 'Issue Date', render: v => v ?? '—' },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Issued Records" />

      <div className="table-wrapper">
        <DataTable
          columns={columns}
          data={records}
          loading={loading}
          actions={row => (
            <div className="d-flex gap-2">
              {row.status === 'ISSUED' && (
                <button
                  className="btn-glass"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => setConfirm(row.issueId)}
                >
                  Return
                </button>
              )}
              <button
                className="btn-glass"
                style={{ fontSize: '0.75rem' }}
                onClick={() => viewReactions(row.patientId)}
              >
                Reactions
              </button>
            </div>
          )}
        />
      </div>

      <ConfirmModal
        show={!!confirm}
        onHide={() => setConfirm(null)}
        onConfirm={() => { returnUnit(confirm); setConfirm(null); }}
        title="Return Unit"
        message="Confirm return of this blood unit?"
      />

      <Modal show={!!reactModal} onHide={() => setReactModal(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Patient Reactions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!reactModal?.length ? (
            <p style={{ color: 'var(--text-muted)' }}>No reactions recorded for this patient.</p>
          ) : (
            <table className="table-glass w-100">
              <thead>
                <tr><th>ID</th><th>Severity</th><th>Status</th><th>Description</th></tr>
              </thead>
              <tbody>
                {reactModal.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td><StatusBadge status={r.severity} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}