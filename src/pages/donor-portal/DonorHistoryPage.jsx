import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { getCurrentUser } from '../../api/authUtils';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import ConfirmModal from '../../components/shared/ui/ConfirmModal';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function DonorHistoryPage() {
  const user = getCurrentUser();
  const donorId = user?.userId || user?.sub;
  const [appointments, setAppointments] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('appointments');
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      api.get(`/api/appointments/donor/${donorId}`),
      api.get(`/api/donations/donor/${donorId}`),
    ]).then(([a, d]) => {
      setAppointments(a.value?.data?.data?.content || a.value?.data?.content || a.value?.data?.data || []);
      setDonations(d.value?.data?.data || d.value?.data || []);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { if (donorId) load(); }, [donorId]);

  const cancel = async (id) => {
    try { await api.patch(`/api/appointments/${id}/cancel`); showSuccess('Cancelled'); load(); }
    catch (e) { showError('Failed'); }
  };

  const apptCols = [
    { key: 'id', label: 'ID' }, { key: 'driveId', label: 'Drive' },
    { key: 'scheduledAt', label: 'Scheduled At', render: v => v ? new Date(v).toLocaleString() : '—' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
  ];
  const donCols = [
    { key: 'id', label: 'Donation ID' }, { key: 'donatedAt', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'volumeMl', label: 'Volume (ml)' }, { key: 'collectionStatus', label: 'Status', render: v => <StatusBadge status={v} /> },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="My Donation History" />
      <div className="nav-tabs-glass mb-4">
        <button className={`nav-link${tab === 'appointments' ? ' active' : ''}`} onClick={() => setTab('appointments')}>Appointments</button>
        <button className={`nav-link${tab === 'donations' ? ' active' : ''}`} onClick={() => setTab('donations')}>Donations</button>
      </div>
      {tab === 'appointments' ? (
        <div className="table-wrapper">
          <DataTable columns={apptCols} data={appointments} loading={loading} actions={row =>
            row.status === 'SCHEDULED' ? (
              <button className="btn-glass" style={{ fontSize: '0.75rem' }} onClick={() => setConfirm(row.id)}>Cancel</button>
            ) : null
          } />
        </div>
      ) : (
        donations.length === 0 && !loading ? (
          <div className="glass-card p-4 text-center">
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🩸</div>
            <p style={{ color: 'var(--text-muted)' }}>Donation history coming soon. Contact your blood bank for records.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <DataTable columns={donCols} data={donations} loading={loading} />
          </div>
        )
      )}
      <ConfirmModal show={!!confirm} onHide={() => setConfirm(null)} onConfirm={() => { cancel(confirm); setConfirm(null); }} title="Cancel Appointment" message="Are you sure you want to cancel this appointment?" />
    </div>
  );
}
