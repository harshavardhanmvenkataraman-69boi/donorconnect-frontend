import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, getRole, getUserName, logout } from '../../../api/authUtils';

const ROUTE_TITLES = {
  '/dashboard/admin': 'Admin Overview', '/dashboard/users': 'User Management',
  '/dashboard/audit-logs': 'Audit Logs', '/dashboard/config': 'System Config',
  '/dashboard/reports': 'Reports', '/dashboard/donors': 'Donor Registry',
  '/dashboard/donors/register': 'Register Donor',
  '/dashboard/appointments': 'Appointments', '/dashboard/drives': 'Blood Drives',
  '/dashboard/deferrals': 'Deferral Management', '/dashboard/screenings': 'Screening',
  '/dashboard/donations': 'Donations', '/dashboard/components': 'Blood Components',
  '/dashboard/test-results': 'Test Results', '/dashboard/quarantine': 'Quarantine & Recall',
  '/dashboard/inventory': 'Blood Stock', '/dashboard/stock-transactions': 'Stock Transactions',
  '/dashboard/expiry-watch': 'Expiry Watch', '/dashboard/crossmatch': 'Crossmatch',
  '/dashboard/issue': 'Issue Blood', '/dashboard/issue-records': 'Issued Records',
  '/dashboard/reactions': 'Adverse Reactions', '/dashboard/lookback': 'Lookback',
  '/dashboard/billing': 'Billing', '/dashboard/notifications': 'Notifications',
  '/dashboard/my': 'My Dashboard', '/dashboard/my/profile': 'My Profile',
  '/dashboard/my/history': 'Donation History', '/dashboard/my/notifications': 'Notifications',
};

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const role = getRole();
  const name = getUserName();
  const title = ROUTE_TITLES[location.pathname] || 'Dashboard';
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'U';

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <button
          className="topbar-notif-btn"
          onClick={() => navigate('/dashboard/notifications')}
          title="Notifications"
        >
          🔔<span className="notif-badge"></span>
        </button>
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{name}</div>
            <div className="role-badge-pill">{role?.replace('ROLE_','') || 'USER'}</div>
          </div>
        </div>
        <button className="btn-glass" onClick={logout} style={{ padding:'6px 12px', fontSize:'0.78rem' }}>
          ↪ Logout
        </button>
      </div>
    </header>
  );
}
