import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

const TEST_TYPES = ['HIV','HBV','HCV','SYPHILIS','MALARIA','GROUPING','CROSSMATCH'];

export default function TestResultsPage() {
  const [results, setResults] = useState([]); const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL'); const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ componentId:'', testType:'HIV', passed:true, notes:'' });

  const load = () => { api.get('/api/test-results').then(r => setResults(r.data?.data || r.data || [])).catch(() => setResults([])).finally(() => setLoading(false)); };
  useEffect(load, []);

  const filtered = tab === 'ALL' ? results : results.filter(r => r.status === tab);
  const submit = async () => {
    try { await api.post('/api/test-results', form); showSuccess('Result entered'); setShowModal(false); load(); }
    catch (e) { showError('Failed'); }
  };

  const columns = [
    { key:'id', label:'ID' }, { key:'componentId', label:'Component' }, { key:'testType', label:'Test Type' },
    { key:'status', label:'Status', render: v => <StatusBadge status={v} /> },
    { key:'resultNotes', label:'Notes' }, { key:'testedAt', label:'Tested At', render: v => v ? new Date(v).toLocaleString() : '—' },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Test Results"><button className="btn-crimson" onClick={() => setShowModal(true)}>+ Enter Result</button></PageHeader>
      <div className="nav-tabs-glass mb-4">
        {['ALL','PENDING','PASSED','FAILED'].map(t => <button key={t} className={`nav-link${tab===t?' active':''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="table-wrapper"><DataTable columns={columns} data={filtered} loading={loading} /></div>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Enter Test Result</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="alert-glass warning mb-3">If this test fails, the component will be automatically quarantined.</div>
          <Row className="g-3">
            <Col xs={12}><label className="form-label">Component ID</label><input type="number" className="form-control" value={form.componentId} onChange={e => setForm({...form,componentId:e.target.value})} /></Col>
            <Col xs={12}><label className="form-label">Test Type</label><select className="form-select" value={form.testType} onChange={e => setForm({...form,testType:e.target.value})}>{TEST_TYPES.map(t => <option key={t}>{t}</option>)}</select></Col>
            <Col xs={12}>
              <label className="form-label">Result</label>
              <div className="d-flex gap-3">
                {['Pass','Fail'].map(v => (
                  <label key={v} style={{ display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:'0.875rem',fontWeight:500 }}>
                    <input type="radio" name="result" checked={form.passed === (v==='Pass')} onChange={() => setForm({...form,passed:v==='Pass'})} /> {v}
                  </label>
                ))}
              </div>
            </Col>
            <Col xs={12}><label className="form-label">Notes</label><textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({...form,notes:e.target.value})}></textarea></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><button className="btn-glass" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-crimson" onClick={submit}>Submit</button></Modal.Footer>
      </Modal>
    </div>
  );
}
