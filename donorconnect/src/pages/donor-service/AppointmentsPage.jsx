import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import ConfirmModal from '../../components/shared/ui/ConfirmModal';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function AppointmentsPage() {
  const [tab, setTab] = useState('today');
  const [appts, setAppts] = useState([]); const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState({ donorId:'', driveId:'', scheduledAt:'' });
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    const url = tab === 'today' ? '/api/appointments/today' : '/api/appointments?page=0&size=50';
    api.get(url).then(r => setAppts(r.data?.data?.content || r.data?.content || r.data?.data || [])).catch(() => setAppts([])).finally(() => setLoading(false));
  };
  useEffect(load, [tab]);
  useEffect(() => { api.get('/api/drives/upcoming').then(r => setDrives(r.data?.data || r.data || [])); }, []);

  const action = async (id, act) => {
    try { await api.patch(`/api/appointments/${id}/${act}`); showSuccess('Updated'); load(); }
    catch (e) { showError('Failed'); }
  };
  const book = async () => {
    try { await api.post('/api/appointments', form); showSuccess('Appointment booked'); setShowBook(false); load(); }
    catch (e) { showError(e.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key:'id', label:'ID' }, { key:'donorId', label:'Donor' }, { key:'driveId', label:'Drive' },
    { key:'scheduledAt', label:'Scheduled', render: v => v ? new Date(v).toLocaleString() : '—' },
    { key:'status', label:'Status', render: v => <StatusBadge status={v} /> },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Appointments"><button className="btn-crimson" onClick={() => setShowBook(true)}>+ Book Appointment</button></PageHeader>
      <div className="nav-tabs-glass mb-4">
        {['today','all'].map(t => <button key={t} className={`nav-link${tab===t?' active':''}`} onClick={() => setTab(t)}>{t === 'today' ? "Today's" : 'All'} Appointments</button>)}
      </div>
      <div className="table-wrapper">
        <DataTable columns={columns} data={appts} loading={loading} actions={row => (
          <div className="d-flex gap-1 flex-wrap">
            {row.status === 'SCHEDULED' && <>
              <button className="btn-glass" style={{ fontSize:'0.75rem',padding:'4px 10px' }} onClick={() => action(row.id,'check-in')}>Check In</button>
              <button className="btn-glass" style={{ fontSize:'0.75rem',padding:'4px 10px' }} onClick={() => action(row.id,'complete')}>Complete</button>
              <button className="btn-glass" style={{ fontSize:'0.75rem',padding:'4px 10px' }} onClick={() => setConfirm(row.id)}>Cancel</button>
            </>}
            {row.status === 'CHECKED_IN' && <button className="btn-glass" style={{ fontSize:'0.75rem',padding:'4px 10px' }} onClick={() => action(row.id,'no-show')}>No Show</button>}
          </div>
        )} />
      </div>
      <Modal show={showBook} onHide={() => setShowBook(false)} centered>
        <Modal.Header closeButton><Modal.Title>Book Appointment</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}><label className="form-label">Donor ID</label><input type="number" className="form-control" value={form.donorId} onChange={e => setForm({...form,donorId:e.target.value})} /></Col>
            <Col xs={12}><label className="form-label">Blood Drive</label>
              <select className="form-select" value={form.driveId} onChange={e => setForm({...form,driveId:e.target.value})}>
                <option value="">Select Drive</option>
                {drives.map(d => <option key={d.driveId} value={d.driveId}>{d.driveName} — {d.location}</option>)}
              </select>
            </Col>
            <Col xs={12}><label className="form-label">Scheduled Date & Time</label><input type="datetime-local" className="form-control" value={form.scheduledAt} onChange={e => setForm({...form,scheduledAt:e.target.value})} /></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><button className="btn-glass" onClick={() => setShowBook(false)}>Cancel</button><button className="btn-crimson" onClick={book}>Book</button></Modal.Footer>
      </Modal>
      <ConfirmModal show={!!confirm} onHide={() => setConfirm(null)} onConfirm={() => { action(confirm,'cancel'); setConfirm(null); }} title="Cancel Appointment" message="Are you sure you want to cancel this appointment?" />
    </div>
  );
}
