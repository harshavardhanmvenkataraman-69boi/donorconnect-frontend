import { useState } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import { showError } from '../../components/shared/ui/AlertBanner';

export default function LookbackPage() {
  const [donationId, setDonationId] = useState(''); const [patientId, setPatientId] = useState('');
  const [donationTrace, setDonationTrace] = useState(null); const [patientTrace, setPatientTrace] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ donationId:'', componentId:'', reason:'' });

  const traceDonation = async () => { try { const r = await api.get(`/api/safety/lookback/donation/${donationId}`); setDonationTrace(r.data?.data || r.data); } catch (e) { showError('Trace failed'); } };
  const tracePatient = async () => { try { const r = await api.get(`/api/safety/lookback/patient/${patientId}`); setPatientTrace(r.data?.data || r.data || []); } catch (e) { showError('Trace failed'); } };
  const initiate = async () => { try { await api.post('/api/safety/lookback', form); setShowNew(false); } catch (e) { showError('Failed'); } };

  return (
    <div className="animate-fadein">
      <PageHeader title="Lookback Traceability"><button className="btn-crimson" onClick={() => setShowNew(true)}>+ Initiate Lookback</button></PageHeader>
      <Row className="g-4">
        <Col md={6}>
          <div className="glass-card p-4">
            <h6 style={{ fontFamily:'Sora', fontWeight:700, marginBottom:12 }}>Search by Donation</h6>
            <div className="d-flex gap-2">
              <input className="form-control" placeholder="Donation ID" value={donationId} onChange={e => setDonationId(e.target.value)} />
              <button className="btn-crimson" onClick={traceDonation}>Trace</button>
            </div>
            {donationTrace && (
              <div style={{ marginTop:16 }}>
                {[['Donation', donationTrace.donation], ['Component', donationTrace.component], ['Issue Record', donationTrace.issueRecord], ['Patient', donationTrace.patient]].map(([label, val]) => (
                  val && <div key={label} style={{ marginBottom:10, padding:'10px 14px', background:'var(--crimson-pale)', borderRadius:8 }}>
                    <div style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', color:'var(--crimson)', marginBottom:4 }}>{label}</div>
                    <pre style={{ fontSize:'0.75rem', marginBottom:0, whiteSpace:'pre-wrap' }}>{JSON.stringify(val, null, 2)}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>
        <Col md={6}>
          <div className="glass-card p-4">
            <h6 style={{ fontFamily:'Sora', fontWeight:700, marginBottom:12 }}>Search by Patient</h6>
            <div className="d-flex gap-2">
              <input className="form-control" placeholder="Patient ID" value={patientId} onChange={e => setPatientId(e.target.value)} />
              <button className="btn-crimson" onClick={tracePatient}>Trace</button>
            </div>
            {patientTrace && (
              <div style={{ marginTop:16 }}>
                {Array.isArray(patientTrace) ? (
                  <table className="table-glass w-100"><thead><tr><th>Donation</th><th>Component</th><th>Issue</th><th>Date</th></tr></thead>
                    <tbody>{patientTrace.map((t,i) => (<tr key={i}><td>{t.donationId}</td><td>{t.componentId}</td><td>{t.issueId}</td><td>{t.issuedAt}</td></tr>))}</tbody>
                  </table>
                ) : <pre style={{ fontSize:'0.8rem' }}>{JSON.stringify(patientTrace, null, 2)}</pre>}
              </div>
            )}
          </div>
        </Col>
      </Row>
      <Modal show={showNew} onHide={() => setShowNew(false)} centered>
        <Modal.Header closeButton><Modal.Title>Initiate Lookback</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}><label className="form-label">Donation ID</label><input type="number" className="form-control" value={form.donationId} onChange={e => setForm({...form,donationId:e.target.value})} /></Col>
            <Col xs={12}><label className="form-label">Component ID</label><input type="number" className="form-control" value={form.componentId} onChange={e => setForm({...form,componentId:e.target.value})} /></Col>
            <Col xs={12}><label className="form-label">Reason</label><textarea className="form-control" rows={2} value={form.reason} onChange={e => setForm({...form,reason:e.target.value})}></textarea></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><button className="btn-glass" onClick={() => setShowNew(false)}>Cancel</button><button className="btn-crimson" onClick={initiate}>Initiate</button></Modal.Footer>
      </Modal>
    </div>
  );
}
