import { NavLink } from 'react-router-dom';
import { getRole } from '../../../api/authUtils';

const SECTIONS = {
  ROLE_ADMIN: [
    { label: 'Overview', links: [
      { to: '/dashboard/admin', icon: '📊', label: 'Dashboard' },
      { to: '/dashboard/users', icon: '👥', label: 'User Management' },
      { to: '/dashboard/audit-logs', icon: '📋', label: 'Audit Logs' },
      { to: '/dashboard/config', icon: '⚙️', label: 'System Config' },
      { to: '/dashboard/reports', icon: '📈', label: 'Reports' },
    ]},
    { label: 'Donor Service', links: [
      { to: '/dashboard/donors', icon: '🫀', label: 'Donor Registry' },
      { to: '/dashboard/appointments', icon: '📅', label: 'Appointments' },
      { to: '/dashboard/drives', icon: '🚗', label: 'Blood Drives' },
      { to: '/dashboard/deferrals', icon: '⛔', label: 'Deferrals' },
      { to: '/dashboard/screenings', icon: '🔬', label: 'Screening' },
    ]},
    { label: 'Blood Supply', links: [
      { to: '/dashboard/donations', icon: '🩸', label: 'Donations' },
      { to: '/dashboard/components', icon: '🧪', label: 'Components' },
      { to: '/dashboard/test-results', icon: '✅', label: 'Test Results' },
      { to: '/dashboard/quarantine', icon: '🚫', label: 'Quarantine & Recall' },
    ]},
    { label: 'Inventory', links: [
      { to: '/dashboard/inventory', icon: '📦', label: 'Stock Overview' },
      { to: '/dashboard/stock-transactions', icon: '🔄', label: 'Transactions' },
      { to: '/dashboard/expiry-watch', icon: '⏰', label: 'Expiry Watch' },
    ]},
    { label: 'Transfusion', links: [
      { to: '/dashboard/crossmatch', icon: '🔗', label: 'Crossmatch' },
      { to: '/dashboard/issue', icon: '💉', label: 'Issue Blood' },
      { to: '/dashboard/issue-records', icon: '📝', label: 'Issued Records' },
    ]},
    { label: 'Safety & Billing', links: [
      { to: '/dashboard/reactions', icon: '⚠️', label: 'Adverse Reactions' },
      { to: '/dashboard/lookback', icon: '🔍', label: 'Lookback' },
      { to: '/dashboard/billing', icon: '💰', label: 'Billing' },
    ]},
    { label: 'Communication', links: [
      { to: '/dashboard/notifications', icon: '🔔', label: 'Notifications' },
    ]},
  ],
  ROLE_RECEPTION: [
    { label: 'Donor Service', links: [
      { to: '/dashboard/donors', icon: '🫀', label: 'Donor Registry' },
      { to: '/dashboard/appointments', icon: '📅', label: 'Appointments' },
      { to: '/dashboard/drives', icon: '🚗', label: 'Blood Drives' },
      { to: '/dashboard/deferrals', icon: '⛔', label: 'Deferrals' },
      { to: '/dashboard/screenings', icon: '🔬', label: 'Screening' },
    ]},
  ],
  ROLE_PHLEBOTOMIST: [
    { label: 'Service', links: [
      { to: '/dashboard/screenings', icon: '🔬', label: 'Screening' },
    ]},
  ],
  ROLE_LAB_TECHNICIAN: [
    { label: 'Blood Supply', links: [
      { to: '/dashboard/lab', icon: '📊', label: 'Dashboard' },
      { to: '/dashboard/donations', icon: '🩸', label: 'Donations' },
      { to: '/dashboard/components', icon: '🧪', label: 'Components' },
      { to: '/dashboard/test-results', icon: '✅', label: 'Test Results' },
      { to: '/dashboard/quarantine', icon: '🚫', label: 'Quarantine & Recall' },
    ]},
  ],
  ROLE_INVENTORY_CONTROLLER: [
    { label: 'Inventory', links: [
      { to: '/dashboard/inventory', icon: '📦', label: 'Stock Overview' },
      { to: '/dashboard/stock-transactions', icon: '🔄', label: 'Transactions' },
      { to: '/dashboard/expiry-watch', icon: '⏰', label: 'Expiry Watch' },
    ]},
  ],
  ROLE_TRANSFUSION_OFFICER: [
    { label: 'Transfusion', links: [
      { to: '/dashboard/crossmatch', icon: '🔗', label: 'Crossmatch' },
      { to: '/dashboard/issue', icon: '💉', label: 'Issue Blood' },
      { to: '/dashboard/issue-records', icon: '📝', label: 'Issued Records' },
      { to: '/dashboard/reactions', icon: '⚠️', label: 'Adverse Reactions' },
    ]},
  ],
  ROLE_DONOR: [
    { label: 'My Portal', links: [
      { to: '/dashboard/my', icon: '🏠', label: 'My Dashboard' },
      { to: '/dashboard/my/profile', icon: '👤', label: 'My Profile' },
      { to: '/dashboard/my/history', icon: '📜', label: 'Donation History' },
      { to: '/dashboard/my/notifications', icon: '🔔', label: 'Notifications' },
    ]},
  ],
};

export default function Sidebar() {
  const role = getRole();
  const sections = SECTIONS[role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🩸</div>
        <div>
          <div className="sidebar-logo-text">DonorConnect</div>
          <span className="sidebar-logo-sub">Blood Bank System</span>
        </div>
      </div>
      <nav style={{ padding: '8px 0 24px' }}>
        {sections.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
              >
                <span className="sidebar-nav-icon">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
