import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function DeferralsPage() {
  const [deferrals, setDeferrals] = useState([]); const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL'); const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ donorId:'', type:'TEMPORARY', reason:'', endDate:'' });

  const load = () => { api.get('/api/deferrals').then(r => setDeferrals(r.data?.data || r.data || [])).catch(() => setDeferrals([])).finally(() => setLoading(false)); };
  useEffect(load, []);

  const filtered = tab === 'ALL' ? deferrals : deferrals.filter(d => d.type === tab);
  const submit = async () => {
    try { await api.post('/api/deferrals', form); showSuccess('Deferral issued'); setShowModal(false); load(); }
    catch (e) { showError('Failed'); }
  };

  const columns = [
    { key:'id', label:'ID' }, { key:'donorId', label:'Donor ID' }, { key:'type', label:'Type', render: v => <span className="status-badge primary">{v}</span> },
    { key:'reason', label:'Reason' }, { key:'startDate', label:'Start' }, { key:'endDate', label:'End' },
    { key:'status', label:'Status', render: v => <StatusBadge status={v} /> },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Deferral Management"><button className="btn-crimson" onClick={() => setShowModal(true)}>+ Issue Deferral</button></PageHeader>
      <div className="nav-tabs-glass mb-4">
        {['ALL','TEMPORARY','PERMANENT'].map(t => <button key={t} className={`nav-link${tab===t?' active':''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="table-wrapper"><DataTable columns={columns} data={filtered} loading={loading} /></div>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Issue Deferral</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}><label className="form-label">Donor ID</label><input type="number" className="form-control" value={form.donorId} onChange={e => setForm({...form,donorId:e.target.value})} /></Col>
            <Col xs={12}><label className="form-label">Type</label><select className="form-select" value={form.type} onChange={e => setForm({...form,type:e.target.value})}><option>TEMPORARY</option><option>PERMANENT</option></select></Col>
            <Col xs={12}><label className="form-label">Reason</label><textarea className="form-control" rows={2} value={form.reason} onChange={e => setForm({...form,reason:e.target.value})}></textarea></Col>
            {form.type === 'TEMPORARY' && <Col xs={12}><label className="form-label">End Date</label><input type="date" className="form-control" value={form.endDate} onChange={e => setForm({...form,endDate:e.target.value})} /></Col>}
          </Row>
        </Modal.Body>
        <Modal.Footer><button className="btn-glass" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-crimson" onClick={submit}>Issue Deferral</button></Modal.Footer>
      </Modal>
    </div>
  );
}
