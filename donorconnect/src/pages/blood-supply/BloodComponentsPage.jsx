import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import StatCard from '../../components/shared/ui/StatCard';
import ConfirmModal from '../../components/shared/ui/ConfirmModal';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

const TYPES = ['WHOLE_BLOOD','RED_BLOOD_CELLS','PLASMA','PLATELETS','CRYOPRECIPITATE'];

export default function BloodComponentsPage() {
  const [components, setComponents] = useState([]); const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false); const [confirm, setConfirm] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [form, setForm] = useState({ donationId:'', componentType:'WHOLE_BLOOD', expiryDate:'' });

  const load = () => { api.get('/api/components').then(r => setComponents(r.data?.data || r.data || [])).catch(() => setComponents([])).finally(() => setLoading(false)); };
  useEffect(load, []);

  const filtered = typeFilter ? components.filter(c => c.componentType === typeFilter) : components;
  const count = s => components.filter(c => c.status === s).length;

  const quarantine = async (id) => {
    try { await api.post('/api/quarantine', { componentId: id, reason: 'Manual quarantine' }); showSuccess('Quarantined'); load(); }
    catch (e) { showError('Failed'); }
  };
  const dispose = async (id) => {
    try { await api.post('/api/disposal', { componentId: id, reason: 'Manual disposal' }); showSuccess('Disposed'); load(); }
    catch (e) { showError('Failed'); }
  };
  const create = async () => {
    try { await api.post('/api/components', form); showSuccess('Component registered'); setShowCreate(false); load(); }
    catch (e) { showError('Failed'); }
  };

  const columns = [
    { key:'id', label:'ID' }, { key:'donationId', label:'Donation ID' }, { key:'componentType', label:'Type' },
    { key:'status', label:'Status', render: v => <StatusBadge status={v} /> },
    { key:'expiryDate', label:'Expiry' },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Blood Components"><button className="btn-crimson" onClick={() => setShowCreate(true)}>+ Register Component</button></PageHeader>
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}><StatCard title="Total" value={components.length} color="primary" /></Col>
        <Col xs={6} md={3}><StatCard title="Available" value={count('AVAILABLE')} color="success" /></Col>
        <Col xs={6} md={3}><StatCard title="Quarantined" value={count('QUARANTINED')} color="warning" /></Col>
        <Col xs={6} md={3}><StatCard title="Disposed" value={count('DISPOSED')} color="danger" /></Col>
      </Row>
      <div className="filter-row mb-3">
        <select className="form-select" style={{ width:220 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="table-wrapper">
        <DataTable columns={columns} data={filtered} loading={loading} actions={row => (
          <div className="d-flex gap-2">
            {row.status === 'AVAILABLE' && <button className="btn-icon" title="Quarantine" onClick={() => setConfirm({id:row.id,action:'quarantine'})}>🚫</button>}
            {row.status !== 'DISPOSED' && <button className="btn-icon danger" title="Dispose" onClick={() => setConfirm({id:row.id,action:'dispose'})}>🗑️</button>}
          </div>
        )} />
      </div>
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton><Modal.Title>Register Component</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}><label className="form-label">Donation ID</label><input type="number" className="form-control" value={form.donationId} onChange={e => setForm({...form,donationId:e.target.value})} /></Col>
            <Col xs={12}><label className="form-label">Component Type</label><select className="form-select" value={form.componentType} onChange={e => setForm({...form,componentType:e.target.value})}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></Col>
            <Col xs={12}><label className="form-label">Expiry Date</label><input type="date" className="form-control" value={form.expiryDate} onChange={e => setForm({...form,expiryDate:e.target.value})} /></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><button className="btn-glass" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn-crimson" onClick={create}>Register</button></Modal.Footer>
      </Modal>
      <ConfirmModal show={!!confirm} onHide={() => setConfirm(null)} title={`Confirm ${confirm?.action}`} message={`Are you sure you want to ${confirm?.action} this component?`}
        onConfirm={() => { if (confirm.action === 'quarantine') quarantine(confirm.id); else dispose(confirm.id); setConfirm(null); }} />
    </div>
  );
}
