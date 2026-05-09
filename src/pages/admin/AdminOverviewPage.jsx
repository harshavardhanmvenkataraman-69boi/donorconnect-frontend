import { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import StatCard from '../../components/shared/ui/StatCard';
import StatusBadge from '../../components/shared/ui/StatusBadge';

const quickLinks = [
  { icon: '👥', label: 'Users', to: '/dashboard/users' }, { icon: '🫀', label: 'Donors', to: '/dashboard/donors' },
  { icon: '🧪', label: 'Components', to: '/dashboard/components' }, { icon: '📦', label: 'Inventory', to: '/dashboard/inventory' },
  { icon: '💉', label: 'Transfusion', to: '/dashboard/crossmatch' }, { icon: '⚠️', label: 'Safety', to: '/dashboard/reactions' },
  { icon: '💰', label: 'Billing', to: '/dashboard/billing' }, { icon: '📈', label: 'Reports', to: '/dashboard/reports' },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ donors: 0, crossmatches: 0, lowStock: 0, expiry: 0 });
  const [reactions, setReactions] = useState([]);
  const [billing, setBilling] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([
      api.get('/api/donors?page=0&size=1'),
      api.get('/api/transfusion/crossmatch/requests/pending'),
      api.get('/api/inventory/low-stock'),
      api.get('/api/expiry-watch/open'),
      api.get('/api/safety/reactions?page=0&size=5'),
      api.get('/api/billing'),
    ]).then(([d, c, ls, ex, r, b]) => {
      setStats({
        donors: d.value?.data?.data?.totalElements ?? 0,
        crossmatches: c.value?.data?.data?.length ?? c.value?.data?.length ?? 0,
        lowStock: ls.value?.data?.data?.length ?? ls.value?.data?.length ?? 0,
        expiry: ex.value?.data?.data?.length ?? ex.value?.data?.length ?? 0,
      });
      setReactions(r.value?.data?.data?.content || r.value?.data?.content || []);
      setBilling(b.value?.data || []);
    });
  }, []);

  return (
    <div className="animate-fadein">
      <PageHeader title="Admin Overview — DonorConnect" subtitle="System-wide summary and quick access" />
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}><StatCard title="Total Donors" value={stats.donors} color="primary" icon="🫀" /></Col>
        <Col xs={6} md={3}><StatCard title="Pending Crossmatches" value={stats.crossmatches} color="warning" icon="🔗" /></Col>
        <Col xs={6} md={3}><StatCard title="Low Stock Alerts" value={stats.lowStock} color="danger" icon="📦" /></Col>
        <Col xs={6} md={3}><StatCard title="Expiry Alerts" value={stats.expiry} color="warning" icon="⏰" /></Col>
      </Row>
      <Row className="g-4 mb-4">
        <Col md={6}>
          <div className="table-wrapper">
            <div className="table-header-row"><span style={{ fontFamily:'Sora',fontWeight:700,fontSize:'0.9rem' }}>Recent Adverse Reactions</span></div>
            <div style={{ padding:'0 0 8px' }}>
              {reactions.length === 0 ? <div className="empty-state"><div className="empty-state-text">No recent reactions</div></div> :
                <table className="table-glass w-100"><thead><tr><th>Severity</th><th>Patient</th><th>Status</th></tr></thead>
                  <tbody>{reactions.map(r => (<tr key={r.id}><td><StatusBadge status={r.severity} /></td><td>{r.patientId}</td><td><StatusBadge status={r.status} /></td></tr>))}</tbody>
                </table>
              }
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div className="table-wrapper">
            <div className="table-header-row"><span style={{ fontFamily:'Sora',fontWeight:700,fontSize:'0.9rem' }}>Billing Summary</span></div>
            <div style={{ padding:'16px 20px' }}>
              {['PENDING','PAID','WAIVED','CANCELLED'].map(s => (
                <div key={s} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border-light)' }}>
                  <StatusBadge status={s} />
                  <span style={{ fontFamily:'Sora',fontWeight:700 }}>{billing.filter(b => b.status === s).length}</span>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
      <div className="glass-card p-4">
        <h6 style={{ fontFamily:'Sora',fontWeight:700,marginBottom:16 }}>Quick Navigation</h6>
        <Row className="g-3">
          {quickLinks.map(l => (
            <Col key={l.label} xs={6} sm={4} md={3}>
              <button onClick={() => navigate(l.to)} className="btn-glass w-100 justify-content-center py-3" style={{ flexDirection:'column',gap:6,height:'auto' }}>
                <span style={{ fontSize:'1.5rem' }}>{l.icon}</span>
                <span style={{ fontSize:'0.8rem',fontWeight:600 }}>{l.label}</span>
              </button>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
