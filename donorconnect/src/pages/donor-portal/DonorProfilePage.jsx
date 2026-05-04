import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import { getCurrentUser } from '../../api/authUtils';
import PageHeader from '../../components/shared/ui/PageHeader';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function DonorProfilePage() {
  const user = getCurrentUser();
  const donorId = user?.userId || user?.sub;
  const [profile, setProfile] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({});
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const load = () => {
    if (!donorId) return;
    api.get(`/api/donors/${donorId}`).then(r => {
      const d = r.data?.data || r.data;
      setProfile(d); setForm(d);
    });
  };
  useEffect(load, [donorId]);

  const save = async () => {
    try { await api.put(`/api/donors/${donorId}`, form); showSuccess('Profile updated'); setShowEdit(false); load(); }
    catch (e) { showError('Update failed'); }
  };
  const changePwd = async () => {
    if (pwdForm.newPassword !== pwdForm.confirm) { showError('Passwords do not match'); return; }
    try { await api.put('/api/auth/change-password', { oldPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword }); showSuccess('Password changed'); setShowPwd(false); }
    catch (e) { showError('Failed'); }
  };

  if (!profile) return <div className="loading-container"><div className="spinner-border spinner-crimson"></div></div>;

  return (
    <div className="animate-fadein">
      <PageHeader title="My Profile">
        <button className="btn-crimson" onClick={() => setShowEdit(true)}>✏️ Edit Profile</button>
      </PageHeader>
      {profile.status === 'DEFERRED' && (
        <div className="alert-glass warning mb-4">⚠️ Your donation eligibility is currently deferred. Please contact the blood bank for more information.</div>
      )}
      <div className="glass-card p-4 mb-4" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--crimson-soft), var(--blood-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Sora', fontWeight: 800, fontSize: '1.8rem', flexShrink: 0 }}>
            {profile.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '1.3rem' }}>{profile.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{profile.contactInfo}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="status-badge danger" style={{ fontSize: '0.9rem', padding: '4px 12px' }}>{profile.bloodGroup}{profile.rhFactor === 'POSITIVE' ? '+' : '-'}</span>
              <StatusBadge status={profile.status} />
            </div>
          </div>
        </div>
        <Row className="g-3">
          {[['Date of Birth', profile.dateOfBirth], ['Gender', profile.gender], ['Donor Type', profile.donorType], ['Blood Group', `${profile.bloodGroup} ${profile.rhFactor}`]].map(([l, v]) => (
            <Col key={l} sm={6}>
              <div><div className="form-label">{l}</div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{v || '—'}</div></div>
            </Col>
          ))}
        </Row>
      </div>
      <div className="glass-card p-4" style={{ maxWidth: 640 }}>
        <button className="btn-glass" onClick={() => setShowPwd(!showPwd)}>🔐 Change Password</button>
        {showPwd && (
          <div style={{ marginTop: 16 }}>
            <Row className="g-3">
              {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirm', 'Confirm New Password']].map(([k, l]) => (
                <Col key={k} xs={12}><label className="form-label">{l}</label><input type="password" className="form-control" value={pwdForm[k]} onChange={e => setPwdForm({ ...pwdForm, [k]: e.target.value })} /></Col>
              ))}
              <Col xs={12}><button className="btn-crimson" onClick={changePwd}>Update Password</button></Col>
            </Row>
          </div>
        )}
      </div>
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton><Modal.Title>Edit Profile</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}><label className="form-label">Name</label><input className="form-control" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></Col>
            <Col xs={12}><label className="form-label">Contact Info</label><input className="form-control" value={form.contactInfo || ''} onChange={e => setForm({ ...form, contactInfo: e.target.value })} /></Col>
            <Col xs={12}><label className="form-label">Date of Birth</label><input type="date" className="form-control" value={form.dateOfBirth || ''} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /></Col>
            <Col xs={12}><label className="form-label">Blood Group (read-only)</label><input className="form-control" value={`${form.bloodGroup || ''} ${form.rhFactor || ''}`} readOnly /></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><button className="btn-glass" onClick={() => setShowEdit(false)}>Cancel</button><button className="btn-crimson" onClick={save}>Save Changes</button></Modal.Footer>
      </Modal>
    </div>
  );
}
