import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function ReactionsPage() {
  const [reactions, setReactions] = useState([]); const [loading, setLoading] = useState(true);
  const [showLog, setShowLog] = useState(false); const [statusModal, setStatusModal] = useState(null);
  const [form, setForm] = useState({ issueId:'', patientId:'', severity:'MILD', description:'' });

  const load = () => { api.get('/api/safety/reactions').then(r => setReactions(r.data?.data?.content || r.data?.content || r.data?.data || [])).catch(() => setReactions([])).finally(() => setLoading(false)); };
  useEffect(load, []);

  const logReaction = async () => { try { await api.post('/api/safety/reactions', form); showSuccess('Reaction logged'); setShowLog(false); load(); } catch (e) { showError('Failed'); } };
  const updateStatus = async (id, status) => { try { await api.patch(`/api/safety/reactions/${id}/status?status=${status}`); showSuccess('Updated'); setStatusModal(null); load(); } catch (e) { showError('Failed'); } };

  const columns = [
    { key:'id', label:'ID' }, { key:'issueId', label:'Issue ID' }, { key:'patientId', label:'Patient' },
    { key:'severity', label:'Severity', render: v => <StatusBadge status={v} /> },
    { key:'status', label:'Status', render: v => <StatusBadge status={v} /> },
    { key:'description', label:'Description' },
    { key:'reportedAt', label:'Reported', render: v => v ? new Date(v).toLocaleString() : '—' },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Adverse Reactions"><button className="btn-crimson" onClick={() => setShowLog(true)}>+ Log Reaction</button></PageHeader>
      <div className="table-wrapper">
        <DataTable columns={columns} data={reactions} loading={loading} actions={row => (
          <button className="btn-glass" style={{ fontSize:'0.75rem' }} onClick={() => setStatusModal(row)}>Update Status</button>
        )} />
      </div>
      <Modal show={showLog} onHide={() => setShowLog(false)} centered>
        <Modal.Header closeButton><Modal.Title>Log Adverse Reaction</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}><label className="form-label">Issue ID</label><input type="number" className="form-control" value={form.issueId} onChange={e => setForm({...form,issueId:e.target.value})} /></Col>
            <Col md={6}><label className="form-label">Patient ID</label><input type="number" className="form-control" value={form.patientId} onChange={e => setForm({...form,patientId:e.target.value})} /></Col>
            <Col xs={12}><label className="form-label">Severity</label><select className="form-select" value={form.severity} onChange={e => setForm({...form,severity:e.target.value})}><option>MILD</option><option>MODERATE</option><option>SEVERE</option><option>FATAL</option></select></Col>
            <Col xs={12}><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})}></textarea></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><button className="btn-glass" onClick={() => setShowLog(false)}>Cancel</button><button className="btn-crimson" onClick={logReaction}>Log Reaction</button></Modal.Footer>
      </Modal>
      <Modal show={!!statusModal} onHide={() => setStatusModal(null)} centered>
        <Modal.Header closeButton><Modal.Title>Update Status</Modal.Title></Modal.Header>
        <Modal.Body>
          <label className="form-label">New Status</label>
          <select className="form-select" defaultValue={statusModal?.status} id="statusSel">
            {['REPORTED','UNDER_INVESTIGATION','RESOLVED'].map(s => <option key={s}>{s}</option>)}
          </select>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={() => setStatusModal(null)}>Cancel</button>
          <button className="btn-crimson" onClick={() => updateStatus(statusModal.id, document.getElementById('statusSel').value)}>Update</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
