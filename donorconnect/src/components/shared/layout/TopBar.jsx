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
  const title = ROUTE_TITLES[location.pathname] || 'Dashboard';

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
      </div>
    </header>
  );
}
