import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import StatCard from '../../components/shared/ui/StatCard';
import { getRole } from '../../api/authUtils';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function DrivesPage() {
  const [drives, setDrives] = useState([]); const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false); const [apptModal, setApptModal] = useState(null);
  const [form, setForm] = useState({ driveName:'', location:'', startDate:'', endDate:'', totalSlots:'' });
  const isAdmin = getRole() === 'ROLE_ADMIN';

  const load = () => { api.get('/api/drives').then(r => setDrives(r.data?.data || r.data || [])).catch(() => setDrives([])).finally(() => setLoading(false)); };
  useEffect(load, []);

  const create = async () => {
    try { await api.post('/api/drives', form); showSuccess('Drive created'); setShowCreate(false); load(); }
    catch (e) { showError('Failed'); }
  };
  const viewAppts = async (id) => {
    const r = await api.get(`/api/drives/${id}/appointments`).catch(() => ({ data: [] }));
    setApptModal(r.data?.data || r.data || []);
  };

  const counts = s => drives.filter(d => d.status === s).length;
  const columns = [
    { key:'driveId', label:'ID' }, { key:'driveName', label:'Name' }, { key:'location', label:'Location' },
    { key:'startDate', label:'Start' }, { key:'endDate', label:'End' }, { key:'totalSlots', label:'Slots' },
    { key:'status', label:'Status', render: v => <StatusBadge status={v} /> },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Blood Drives">
        {isAdmin && <button className="btn-crimson" onClick={() => setShowCreate(true)}>+ Create Drive</button>}
      </PageHeader>
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}><StatCard title="Total" value={drives.length} color="primary" /></Col>
        <Col xs={6} md={3}><StatCard title="Active" value={counts('ACTIVE')} color="success" /></Col>
        <Col xs={6} md={3}><StatCard title="Upcoming" value={counts('PLANNED')} color="warning" /></Col>
        <Col xs={6} md={3}><StatCard title="Completed" value={counts('COMPLETED')} color="secondary" /></Col>
      </Row>
      <div className="table-wrapper">
        <DataTable columns={columns} data={drives} loading={loading} actions={row => (
          <div className="d-flex gap-2"><button className="btn-glass" style={{ fontSize:'0.75rem' }} onClick={() => viewAppts(row.driveId)}>Appointments</button></div>
        )} />
      </div>
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton><Modal.Title>Create Blood Drive</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}><label className="form-label">Drive Name</label><input className="form-control" value={form.driveName} onChange={e => setForm({...form,driveName:e.target.value})} /></Col>
            <Col xs={12}><label className="form-label">Location</label><input className="form-control" value={form.location} onChange={e => setForm({...form,location:e.target.value})} /></Col>
            <Col md={6}><label className="form-label">Start Date</label><input type="date" className="form-control" value={form.startDate} onChange={e => setForm({...form,startDate:e.target.value})} /></Col>
            <Col md={6}><label className="form-label">End Date</label><input type="date" className="form-control" value={form.endDate} onChange={e => setForm({...form,endDate:e.target.value})} /></Col>
            <Col xs={12}><label className="form-label">Total Slots</label><input type="number" className="form-control" value={form.totalSlots} onChange={e => setForm({...form,totalSlots:e.target.value})} /></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><button className="btn-glass" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn-crimson" onClick={create}>Create Drive</button></Modal.Footer>
      </Modal>
      <Modal show={!!apptModal} onHide={() => setApptModal(null)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Drive Appointments</Modal.Title></Modal.Header>
        <Modal.Body>
          {apptModal?.length === 0 ? <p style={{ color:'var(--text-muted)' }}>No appointments for this drive.</p> :
            <table className="table-glass w-100"><thead><tr><th>ID</th><th>Donor</th><th>Scheduled At</th><th>Status</th></tr></thead>
              <tbody>{apptModal?.map(a => (<tr key={a.id}><td>{a.id}</td><td>{a.donorId}</td><td>{a.scheduledAt ? new Date(a.scheduledAt).toLocaleString() : '—'}</td><td><StatusBadge status={a.status} /></td></tr>))}</tbody>
            </table>
          }
        </Modal.Body>
      </Modal>
    </div>
  );
}
