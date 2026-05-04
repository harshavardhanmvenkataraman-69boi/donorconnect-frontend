import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function QuarantineRecallPage() {
  const [tab, setTab] = useState('quarantine');
  const [quarantines, setQuarantines] = useState([]); const [recalls, setRecalls] = useState([]);
  const [loading, setLoading] = useState(true); const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ componentId:'', reason:'' }); const [recallForm, setRecallForm] = useState({ reason:'' });

  const loadQ = () => { api.get('/api/quarantine').then(r => setQuarantines(r.data?.data || r.data || [])).catch(() => setQuarantines([])).finally(() => setLoading(false)); };
  const loadR = () => { api.get('/api/recalls').then(r => setRecalls(r.data?.data || r.data || [])); };
  useEffect(() => { loadQ(); loadR(); }, []);

  const release = async (id) => { try { await api.patch(`/api/quarantine/${id}/release`); showSuccess('Released'); loadQ(); } catch (e) { showError('Failed'); } };
  const addQ = async () => { try { await api.post('/api/quarantine', form); showSuccess('Quarantined'); setShowModal(false); loadQ(); } catch (e) { showError('Failed'); } };
  const addR = async () => { try { await api.post('/api/recalls', recallForm); showSuccess('Recall issued'); loadR(); } catch (e) { showError('Failed'); } };

  const qCols = [{ key:'id', label:'ID' }, { key:'componentId', label:'Component' }, { key:'reason', label:'Reason' }, { key:'status', label:'Status', render: v => <StatusBadge status={v} /> }, { key:'createdAt', label:'Created', render: v => v ? new Date(v).toLocaleString() : '—' }];
  const rCols = [{ key:'id', label:'ID' }, { key:'reason', label:'Reason' }, { key:'status', label:'Status', render: v => <StatusBadge status={v} /> }, { key:'createdAt', label:'Created', render: v => v ? new Date(v).toLocaleString() : '—' }];

  return (
    <div className="animate-fadein">
      <PageHeader title="Quarantine & Recall">
        <button className="btn-crimson" onClick={() => setShowModal(true)}>+ {tab === 'quarantine' ? 'Add Quarantine' : 'Issue Recall'}</button>
      </PageHeader>
      <div className="nav-tabs-glass mb-4">
        {['quarantine','recalls'].map(t => <button key={t} className={`nav-link${tab===t?' active':''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
      </div>
      <div className="table-wrapper">
        {tab === 'quarantine' ? <DataTable columns={qCols} data={quarantines} loading={loading} actions={row => row.status !== 'RELEASED' ? (<button className="btn-glass" onClick={() => release(row.id)}>Release</button>) : null} />
        : <DataTable columns={rCols} data={recalls} loading={false} />}
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{tab === 'quarantine' ? 'Add Quarantine' : 'Issue Recall'}</Modal.Title></Modal.Header>
        <Modal.Body>
          {tab === 'quarantine' ? <>
            <div className="mb-3"><label className="form-label">Component ID</label><input type="number" className="form-control" value={form.componentId} onChange={e => setForm({...form,componentId:e.target.value})} /></div>
            <div><label className="form-label">Reason</label><textarea className="form-control" rows={2} value={form.reason} onChange={e => setForm({...form,reason:e.target.value})}></textarea></div>
          </> : <><label className="form-label">Recall Reason</label><textarea className="form-control" rows={3} value={recallForm.reason} onChange={e => setRecallForm({reason:e.target.value})}></textarea></>}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn-crimson" onClick={tab === 'quarantine' ? addQ : addR}>Submit</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
