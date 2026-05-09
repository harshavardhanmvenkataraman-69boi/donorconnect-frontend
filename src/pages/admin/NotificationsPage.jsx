import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]); const [loading, setLoading] = useState(true);
  const load = () => { api.get('/api/notifications').then(r => setNotifs(r.data?.data?.content || r.data?.content || r.data?.data || [])).catch(() => setNotifs([])).finally(() => setLoading(false)); };
  useEffect(load, []);
  const markRead = async (id) => { try { await api.patch(`/api/notifications/${id}/read`); showSuccess('Marked read'); load(); } catch { showError('Failed'); } };
  const columns = [
    { key:'id', label:'ID' }, { key:'category', label:'Category', render: v => <StatusBadge status={v} /> },
    { key:'message', label:'Message' }, { key:'status', label:'Status', render: v => <StatusBadge status={v} /> },
    { key:'sentAt', label:'Sent At', render: v => v ? new Date(v).toLocaleString() : '—' },
  ];
  return (
    <div className="animate-fadein">
      <PageHeader title="Notifications" />
      <div className="table-wrapper"><DataTable columns={columns} data={notifs} loading={loading} actions={row => row.status === 'UNREAD' ? (<button className="btn-glass" onClick={() => markRead(row.id)}>Mark Read</button>) : null} /></div>
    </div>
  );
}
