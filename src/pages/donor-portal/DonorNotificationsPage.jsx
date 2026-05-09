import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function DonorNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL');

  const load = () => {
    setLoading(true);
    api.get('/api/notifications').then(r => setNotifications(r.data?.data?.content || r.data?.content || r.data?.data || [])).catch(() => setNotifications([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const markRead = async (id) => {
    try { await api.patch(`/api/notifications/${id}/read`); showSuccess('Marked as read'); load(); }
    catch (e) { showError('Failed'); }
  };

  const filtered = tab === 'Unread' ? notifications.filter(n => n.status === 'UNREAD') : notifications;
  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'category', label: 'Category', render: v => <StatusBadge status={v} /> },
    { key: 'message', label: 'Message' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'sentAt', label: 'Sent At', render: v => v ? new Date(v).toLocaleString() : '—' },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="My Notifications" />
      <div className="nav-tabs-glass mb-4">
        <button className={`nav-link${tab === 'ALL' ? ' active' : ''}`} onClick={() => setTab('ALL')}>All</button>
        <button className={`nav-link${tab === 'Unread' ? ' active' : ''}`} onClick={() => setTab('Unread')}>
          Unread {unreadCount > 0 && <span style={{ marginLeft: 4, background: 'var(--crimson)', color: 'white', borderRadius: '50%', padding: '1px 6px', fontSize: '0.65rem', fontWeight: 800 }}>{unreadCount}</span>}
        </button>
      </div>
      <div className="table-wrapper">
        <DataTable columns={columns} data={filtered} loading={loading} actions={row =>
          row.status === 'UNREAD' ? <button className="btn-glass" style={{ fontSize: '0.75rem' }} onClick={() => markRead(row.id)}>Mark Read</button> : null
        } />
      </div>
    </div>
  );
}
