import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import { getCurrentUser } from '../../api/authUtils';
import PageHeader from '../../components/shared/ui/PageHeader';
import StatCard from '../../components/shared/ui/StatCard';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function DonorDashboardPage() {
  const user = getCurrentUser();
  const donorId = user?.userId || user?.sub;
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [form, setForm] = useState({ donorId: donorId || '', driveId: '', scheduledAt: '' });

  useEffect(() => {
    if (!donorId) return;
    Promise.allSettled([
      api.get(`/api/donors/${donorId}`),
      api.get(`/api/appointments/donor/${donorId}`),
      api.get('/api/notifications?page=0&size=3'),
      api.get('/api/drives/upcoming'),
    ]).then(([p, a, n, d]) => {
      setProfile(p.value?.data?.data || p.value?.data);
      setAppointments(a.value?.data?.data?.content || a.value?.data?.content || a.value?.data?.data || []);
      setNotifications(n.value?.data?.data?.content || n.value?.data?.content || n.value?.data?.data || []);
      setDrives(d.value?.data?.data || d.value?.data || []);
    });
  }, [donorId]);

  const nextAppt = appointments.find(a => a.status === 'SCHEDULED');
  const donationCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const lastDonation = appointments.filter(a => a.status === 'COMPLETED').sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))[0];

  const book = async () => {
    try { await api.post('/api/appointments', form); showSuccess('Appointment booked!'); setShowBook(false); }
    catch (e) { showError(e.response?.data?.message || 'Booking failed'); }
  };

  return (
    <div className="animate-fadein">
      <PageHeader title={`Welcome back, ${profile?.name || 'Donor'} 👋`} subtitle="Your donation journey at a glance" />
      <Row className="g-3 mb-4">
        <Col xs={6} md={4}><StatCard title="Blood Group" value={profile ? `${profile.bloodGroup}${profile.rhFactor === 'POSITIVE' ? '+' : '-'}` : '—'} color="danger" icon="🩸" /></Col>
        <Col xs={6} md={4}><StatCard title="Total Donations" value={donationCount} color="success" icon="💉" /></Col>
        <Col xs={6} md={4}><StatCard title="Last Donation" value={lastDonation ? new Date(lastDonation.scheduledAt).toLocaleDateString() : 'N/A'} color="primary" icon="📅" /></Col>
      </Row>
      <Row className="g-4">
        <Col md={6}>
          <div className="glass-card p-4 h-100">
            <h6 style={{ fontFamily: 'Sora', fontWeight: 700, marginBottom: 16 }}>📅 Next Appointment</h6>
            {nextAppt ? (
              <div style={{ background: 'var(--crimson-pale)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Drive #{nextAppt.driveId}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{new Date(nextAppt.scheduledAt).toLocaleString()}</div>
                <StatusBadge status={nextAppt.status} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 12 }}>No upcoming appointments.</p>
                <button className="btn-crimson" onClick={() => setShowBook(true)}>Book Now</button>
              </div>
            )}
            {nextAppt && <button className="btn-glass mt-3 w-100 justify-content-center" onClick={() => setShowBook(true)}>+ Book Another</button>}
          </div>
        </Col>
        <Col md={6}>
          <div className="glass-card p-4 h-100">
            <h6 style={{ fontFamily: 'Sora', fontWeight: 700, marginBottom: 16 }}>🔔 Recent Notifications</h6>
            {notifications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No new notifications.</p>
            ) : notifications.map(n => (
              <div key={n.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{n.message}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.sentAt ? new Date(n.sentAt).toLocaleString() : ''}</div>
              </div>
            ))}
          </div>
        </Col>
      </Row>
      <Modal show={showBook} onHide={() => setShowBook(false)} centered>
        <Modal.Header closeButton><Modal.Title>Book Appointment</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Blood Drive</label>
            <select className="form-select" value={form.driveId} onChange={e => setForm({ ...form, driveId: e.target.value })}>
              <option value="">Select a drive...</option>
              {drives.map(d => <option key={d.driveId} value={d.driveId}>{d.driveName} — {d.location}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Preferred Date & Time</label>
            <input type="datetime-local" className="form-control" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={() => setShowBook(false)}>Cancel</button>
          <button className="btn-crimson" onClick={book}>Book Appointment</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
