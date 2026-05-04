import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

const INIT = { name:'', dateOfBirth:'', gender:'MALE', bloodGroup:'O', rhFactor:'POSITIVE', contactInfo:'', address:'{"street":"","city":"","state":"","pincode":""}', donorType:'WALK_IN' };

export default function DonorRegisterPage() {
  const [form, setForm] = useState(INIT);
  const { id } = useParams(); const navigate = useNavigate();
  const isEdit = !!id;

  useEffect(() => { if (isEdit) api.get(`/api/donors/${id}`).then(r => setForm(r.data?.data || r.data)).catch(() => {}); }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) await api.put(`/api/donors/${id}`, form);
      else await api.post('/api/donors', form);
      showSuccess(`Donor ${isEdit ? 'updated' : 'registered'} successfully`);
      navigate('/dashboard/donors');
    } catch (err) { showError(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="animate-fadein">
      <PageHeader title={isEdit ? 'Edit Donor' : 'Register New Donor'} />
      <div className="glass-card p-4" style={{ maxWidth: 700 }}>
        <form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}><label className="form-label">Full Name *</label><input className="form-control" required value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></Col>
            <Col md={6}><label className="form-label">Date of Birth</label><input type="date" className="form-control" value={form.dateOfBirth} onChange={e => setForm({...form,dateOfBirth:e.target.value})} /></Col>
            <Col md={4}><label className="form-label">Gender</label><select className="form-select" value={form.gender} onChange={e => setForm({...form,gender:e.target.value})}><option>MALE</option><option>FEMALE</option><option>OTHER</option></select></Col>
            <Col md={4}><label className="form-label">Blood Group</label><select className="form-select" value={form.bloodGroup} onChange={e => setForm({...form,bloodGroup:e.target.value})}>{['A','B','AB','O'].map(g=><option key={g}>{g}</option>)}</select></Col>
            <Col md={4}><label className="form-label">Rh Factor</label><select className="form-select" value={form.rhFactor} onChange={e => setForm({...form,rhFactor:e.target.value})}><option>POSITIVE</option><option>NEGATIVE</option></select></Col>
            <Col md={6}><label className="form-label">Contact Info</label><input className="form-control" value={form.contactInfo} onChange={e => setForm({...form,contactInfo:e.target.value})} /></Col>
            <Col md={6}><label className="form-label">Donor Type</label><select className="form-select" value={form.donorType} onChange={e => setForm({...form,donorType:e.target.value})}>{['WALK_IN','REGULAR','DIRECTED','AUTOLOGOUS'].map(t=><option key={t}>{t}</option>)}</select></Col>
            <Col xs={12}><label className="form-label">Address (JSON)</label><textarea className="form-control" rows={3} value={form.address} onChange={e => setForm({...form,address:e.target.value})} placeholder='{"street":"","city":"","state":"","pincode":""}'></textarea></Col>
            <Col xs={12} className="d-flex gap-3 pt-2">
              <button type="submit" className="btn-crimson">{isEdit ? '✓ Save Changes' : '+ Register Donor'}</button>
              <button type="button" className="btn-glass" onClick={() => navigate('/dashboard/donors')}>Cancel</button>
            </Col>
          </Row>
        </form>
      </div>
    </div>
  );
}
