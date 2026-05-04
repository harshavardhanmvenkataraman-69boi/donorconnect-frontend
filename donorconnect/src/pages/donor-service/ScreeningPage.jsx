import { useState } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function ScreeningPage() {
  const [donorId, setDonorId] = useState(''); const [screenings, setScreenings] = useState([]); const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ donorId:'', appointmentId:'', hemoglobin:'', bpSystolic:'', bpDiastolic:'', weight:'', clearedFlag:true, deferralRequest:{ type:'TEMPORARY', reason:'', endDate:'' } });

  const search = () => { if (!donorId) return; setLoading(true); api.get(`/api/screenings/donor/${donorId}`).then(r => setScreenings(r.data?.data || r.data || [])).catch(() => setScreenings([])).finally(() => setLoading(false)); };
  const submit = async () => {
    const payload = { ...form }; if (form.clearedFlag) delete payload.deferralRequest;
    try { await api.post('/api/screenings', payload); showSuccess('Screening recorded'); setShowModal(false); search(); }
    catch (e) { showError('Failed'); }
  };

  const columns = [
    { key:'id', label:'ID' }, { key:'appointmentId', label:'Appointment' }, { key:'hemoglobin', label:'Hemoglobin' },
    { key:'bpSystolic', label:'BP Sys' }, { key:'bpDiastolic', label:'BP Dia' }, { key:'weight', label:'Weight' },
    { key:'clearedFlag', label:'Cleared?', render: v => <span className={`status-badge ${v ? 'success' : 'danger'}`}>{v ? 'Yes' : 'No'}</span> },
    { key:'createdAt', label:'Date', render: v => v ? new Date(v).toLocaleString() : '—' },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Pre-Donation Screening"><button className="btn-crimson" onClick={() => setShowModal(true)}>+ New Screening</button></PageHeader>
      <div className="filter-row mb-4">
        <input className="form-control" style={{ maxWidth:220 }} placeholder="Donor ID..." value={donorId} onChange={e => setDonorId(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
        <button className="btn-crimson" onClick={search}>Search</button>
      </div>
      <div className="table-wrapper"><DataTable columns={columns} data={screenings} loading={loading} /></div>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>New Screening</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}><label className="form-label">Donor ID</label><input type="number" className="form-control" value={form.donorId} onChange={e => setForm({...form,donorId:e.target.value})} /></Col>
            <Col md={6}><label className="form-label">Appointment ID</label><input type="number" className="form-control" value={form.appointmentId} onChange={e => setForm({...form,appointmentId:e.target.value})} /></Col>
            {[['hemoglobin','Hemoglobin'],['bpSystolic','BP Systolic'],['bpDiastolic','BP Diastolic'],['weight','Weight (kg)']].map(([k,l]) => (
              <Col key={k} md={6}><label className="form-label">{l}</label><input type="number" className="form-control" value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} /></Col>
            ))}
            <Col xs={12}><div className="form-check"><input type="checkbox" className="form-check-input" id="cleared" checked={form.clearedFlag} onChange={e => setForm({...form,clearedFlag:e.target.checked})} /><label className="form-check-label" htmlFor="cleared" style={{ fontSize:'0.875rem',fontWeight:500 }}>Cleared for donation?</label></div></Col>
            {!form.clearedFlag && <>
              <Col xs={12}><div className="alert-glass warning">Deferral will be created automatically.</div></Col>
              <Col md={6}><label className="form-label">Deferral Type</label><select className="form-select" value={form.deferralRequest.type} onChange={e => setForm({...form,deferralRequest:{...form.deferralRequest,type:e.target.value}})}><option>TEMPORARY</option><option>PERMANENT</option></select></Col>
              <Col xs={12}><label className="form-label">Reason</label><textarea className="form-control" rows={2} value={form.deferralRequest.reason} onChange={e => setForm({...form,deferralRequest:{...form.deferralRequest,reason:e.target.value}})}></textarea></Col>
            </>}
          </Row>
        </Modal.Body>
        <Modal.Footer><button className="btn-glass" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-crimson" onClick={submit}>Submit</button></Modal.Footer>
      </Modal>
    </div>
  );
}
