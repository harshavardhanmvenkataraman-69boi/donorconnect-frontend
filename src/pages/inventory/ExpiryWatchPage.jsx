import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import LoadingSpinner from '../../components/shared/ui/LoadingSpinner';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

const daysUntil = (d) => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;

export default function ExpiryWatchPage() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL');

  const load = () => {
    setLoading(true);
    const url = tab === 'Open' ? '/api/expiry-watch/open' : '/api/expiry-watch';
    api.get(url).then(r => setItems(r.data?.data || r.data || [])).catch(() => setItems([])).finally(() => setLoading(false));
  };
  useEffect(load, [tab]);

  const action = async (id) => {
    try { await api.patch(`/api/expiry-watch/${id}/action`); showSuccess('Marked actioned'); load(); }
    catch (e) { showError('Failed'); }
  };

  const filtered = tab === 'Actioned' ? items.filter(i => i.status === 'ACTIONED') : items.filter(i => tab !== 'Open' || i.status !== 'ACTIONED');

  const rowClass = (days) => {
    if (days === null) return '';
    if (days <= 0) return 'table-danger';
    if (days <= 3) return 'table-warning';
    return '';
  };

  return (
    <div className="animate-fadein">
      <PageHeader title="Expiry Watch" />
      {items.filter(i => i.status !== 'ACTIONED').length > 0 && (
        <div className="alert-glass warning mb-4">⚠️ {items.filter(i => i.status !== 'ACTIONED').length} items require attention.</div>
      )}
      <div className="nav-tabs-glass mb-4">
        {['ALL','Open','Actioned'].map(t => <button key={t} className={`nav-link${tab===t?' active':''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="table-wrapper">
        {loading ? <LoadingSpinner /> : (
          <div className="table-scroll">
            <table className="table-glass w-100">
              <thead><tr><th>ID</th><th>Component</th><th>Blood Group</th><th>Type</th><th>Expiry Date</th><th>Days Left</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan={8} className="text-center py-4" style={{ color:'var(--text-muted)' }}>No records found.</td></tr> :
                  filtered.map(i => {
                    const days = daysUntil(i.expiryDate);
                    return (
                      <tr key={i.id} className={rowClass(days)}>
                        <td>{i.id}</td><td>{i.componentId}</td><td>{i.bloodGroup}</td><td>{i.componentType}</td>
                        <td>{i.expiryDate}</td>
                        <td>{days !== null ? <strong style={{ color: days <= 0 ? 'var(--danger)' : days <= 3 ? 'var(--warning)' : 'inherit' }}>{days}d</strong> : '—'}</td>
                        <td><StatusBadge status={i.status} /></td>
                        <td>{i.status !== 'ACTIONED' && <button className="btn-glass" style={{ fontSize:'0.75rem' }} onClick={() => action(i.id)}>Mark Actioned</button>}</td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
