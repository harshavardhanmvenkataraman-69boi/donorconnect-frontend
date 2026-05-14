import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getRole, getUserName, logout } from '../../../api/authUtils';

const ICONS = {
  dashboard:    "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  users:        "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  audit:        "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  config:       "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  reports:      "M22 12h-4l-3 9L9 3l-3 9H2",
  donor:        "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  calendar:     "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18",
  drives:       "M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2M14 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  defer:        "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM4.93 4.93l14.14 14.14",
  screening:    "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  droplet:      "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z",
  flask:        "M10 2v7.31L5.72 18a2 2 0 0 0 1.8 2.88h9a2 2 0 0 0 1.8-2.88L14 9.31V2M8.5 2h7",
  test:         "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5m4 0h10m0-11v11m0 0h4M9 14l2 2 4-4",
  quarantine:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  inventory:    "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
  transactions: "M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3",
  expiry:       "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2",
  crossmatch:   "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  issue:        "M22 12h-4l-3 9L9 3l-3 9H2",
  records:      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15l3 3 3-3",
  reactions:    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  lookback:     "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
  billing:      "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  bell:         "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  logout:       "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  collapse:     "M15 18l-6-6 6-6",
  expand:       "M9 18l6-6-6-6",
  chevron:      "M6 9l6 6 6-6",
};

const SvgIcon = ({ name, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    <path d={ICONS[name] || ''} />
  </svg>
);

const ACCENTS = {
  'Overview':         '#FF6B9D',
  'Donor Service':    '#FF8C42',
  'Blood Supply':     '#FF4757',
  'Inventory':        '#5DADE2',
  'Transfusion':      '#A569BD',
  'Safety & Billing': '#58D68D',
  'Communication':    '#45C1A4',
  'Service':          '#FF8C42',
};

const SECTIONS = {
  ROLE_ADMIN: [
    { label: 'Overview', links: [
      { to: '/dashboard/admin',      icon: 'dashboard',   label: 'Dashboard' },
      { to: '/dashboard/users',      icon: 'users',       label: 'User Management' },
      { to: '/dashboard/audit-logs', icon: 'audit',       label: 'Audit Logs' },
      { to: '/dashboard/config',     icon: 'config',      label: 'System Config' },
      { to: '/dashboard/reports',    icon: 'reports',     label: 'Reports' },
    ]},
    { label: 'Donor Service', links: [
      { to: '/dashboard/donors',       icon: 'donor',     label: 'Donor Registry' },
      { to: '/dashboard/appointments', icon: 'calendar',  label: 'Appointments' },
      { to: '/dashboard/drives',       icon: 'drives',    label: 'Blood Drives' },
      { to: '/dashboard/deferrals',    icon: 'defer',     label: 'Deferrals' },
      { to: '/dashboard/screenings',   icon: 'screening', label: 'Screening' },
    ]},
    { label: 'Blood Supply', links: [
      { to: '/dashboard/lab', icon: 'dashboard', label: 'Dashboard' },
      { to: '/dashboard/donations',    icon: 'droplet',    label: 'Donations' },
      { to: '/dashboard/components',   icon: 'flask',      label: 'Components' },
      { to: '/dashboard/test-results', icon: 'test',       label: 'Test Results' },
      { to: '/dashboard/quarantine',   icon: 'quarantine', label: 'Quarantine & Disposal' },
    ]},
    { label: 'Inventory', links: [
      { to: '/dashboard/inventory',          icon: 'dashboard',    label: 'Dashboard' },
      { to: '/dashboard/stock-overview',     icon: 'inventory',    label: 'Stock Overview' },
      { to: '/dashboard/stock-transactions', icon: 'transactions', label: 'Transactions' },
      { to: '/dashboard/expiry-watch',       icon: 'expiry',       label: 'Expiry Watch' },
    ]},
    { label: 'Transfusion', links: [
      { to: '/dashboard/crossmatch',    icon: 'crossmatch', label: 'Crossmatch' },
      { to: '/dashboard/issue',         icon: 'issue',      label: 'Issue Blood' },
      { to: '/dashboard/issue-records', icon: 'records',    label: 'Issued Records' },
    ]},
    { label: 'Safety & Billing', links: [
      { to: '/dashboard/reactions', icon: 'reactions', label: 'Adverse Reactions' },
      { to: '/dashboard/lookback',  icon: 'lookback',  label: 'Lookback' },
      { to: '/dashboard/billing',   icon: 'billing',   label: 'Billing' },
    ]},
    { label: 'Communication', links: [
      { to: '/dashboard/notifications', icon: 'bell', label: 'Notifications' },
    ]},
  ],
  ROLE_RECEPTION: [
    { label: 'Donor Service', links: [
      { to: '/dashboard/donors',       icon: 'donor',     label: 'Donor Registry' },
      { to: '/dashboard/appointments', icon: 'calendar',  label: 'Appointments' },
      { to: '/dashboard/drives',       icon: 'drives',    label: 'Blood Drives' },
      { to: '/dashboard/deferrals',    icon: 'defer',     label: 'Deferrals' },
      { to: '/dashboard/screenings',   icon: 'screening', label: 'Screening' },
    ]},
    { label: 'Communication', links: [
      { to: '/dashboard/notifications', icon: 'bell', label: 'Notifications' },
    ]},
  ],
  ROLE_PHLEBOTOMIST: [
    { label: 'Service', links: [
      { to: '/dashboard/screenings',    icon: 'screening', label: 'Screening' },
      { to: '/dashboard/notifications', icon: 'bell',      label: 'Notifications' },
    ]},
  ],
  ROLE_LAB_TECHNICIAN: [
    { label: 'Blood Supply', links: [
      { to: '/dashboard/lab', icon: 'dashboard', label: 'Dashboard' },
      { to: '/dashboard/donations',    icon: 'droplet',    label: 'Donations' },
      { to: '/dashboard/components',   icon: 'flask',      label: 'Components' },
      { to: '/dashboard/test-results', icon: 'test',       label: 'Test Results' },
      { to: '/dashboard/quarantine',   icon: 'quarantine', label: 'Quarantine & Disposal' },
    ]},
    { label: 'Communication', links: [
      { to: '/dashboard/notifications', icon: 'bell', label: 'Notifications' },
    ]},
  ],
  ROLE_INVENTORY_CONTROLLER: [
    { label: 'Inventory', links: [
      { to: '/dashboard/inventory',          icon: 'dashboard',    label: 'Dashboard' },
      { to: '/dashboard/stock-overview',     icon: 'inventory',    label: 'Stock Overview' },
      { to: '/dashboard/stock-transactions', icon: 'transactions', label: 'Transactions' },
      { to: '/dashboard/expiry-watch',       icon: 'expiry',       label: 'Expiry Watch' },
    ]},
    { label: 'Communication', links: [
      { to: '/dashboard/notifications', icon: 'bell', label: 'Notifications' },
    ]},
  ],
  ROLE_TRANSFUSION_OFFICER: [
    { label: 'Transfusion', links: [
      { to: '/dashboard/crossmatch',    icon: 'crossmatch', label: 'Crossmatch' },
      { to: '/dashboard/issue',         icon: 'issue',      label: 'Issue Blood' },
      { to: '/dashboard/issue-records', icon: 'records',    label: 'Issued Records' },
      { to: '/dashboard/reactions',     icon: 'reactions',  label: 'Adverse Reactions' },
      { to: '/dashboard/lookback',      icon: 'lookback',  label: 'Lookback' },
    ]},
    { label: 'Communication', links: [
      { to: '/dashboard/notifications', icon: 'bell', label: 'Notifications' },
    ]},
  ],
};

function Section({ section, collapsed }) {
  const [open, setOpen] = useState(true);
  const color = ACCENTS[section.label] || '#FF6B9D';

  return (
    <div style={{ marginBottom: 2 }}>
      {!collapsed && (
        <button onClick={() => setOpen(o => !o)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '12px 16px 4px',
          background: 'none', border: 'none', cursor: 'pointer',
        }}>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: color, opacity: 0.7,
          }}>{section.label}</span>
          <div style={{ flex: 1, height: '1px', background: `${color}25` }} />
          <span style={{
            color: color, opacity: 0.5,
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s', display: 'flex',
          }}>
            <SvgIcon name="chevron" size={10} />
          </span>
        </button>
      )}

      <div style={{
        overflow: 'hidden',
        maxHeight: open || collapsed ? '600px' : '0px',
        transition: 'max-height 0.25s ease',
        padding: collapsed ? '2px 8px' : '2px 8px',
      }}>
        {section.links.map(link => (
          <NavLink key={link.to} to={link.to} style={{ textDecoration: 'none', display: 'block' }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '9px 0' : '8px 10px',
                margin: '1px 0',
                borderRadius: 9,
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? `${color}18` : 'transparent',
                border: `1px solid ${isActive ? `${color}30` : 'transparent'}`,
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                position: 'relative',
              }}
                className={collapsed ? 'dc-item-collapsed' : 'dc-item-expanded'}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                {/* Left active bar */}
                {isActive && !collapsed && (
                  <span style={{
                    position: 'absolute', left: 0, top: '20%', height: '60%',
                    width: 3, borderRadius: 3,
                    background: color,
                  }} />
                )}

                {/* Icon */}
                <span style={{
                  width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 7, flexShrink: 0,
                  color: isActive ? color : 'rgba(255,255,255,0.38)',
                  background: isActive ? `${color}20` : 'transparent',
                  transition: 'all 0.15s',
                }}>
                  <SvgIcon name={link.icon} size={15} />
                </span>

                {/* Label */}
                {!collapsed && (
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.45)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    transition: 'color 0.15s',
                  }}>
                    {link.label}
                  </span>
                )}

                {/* Tooltip for collapsed */}
                {collapsed && (
                  <span style={{
                    display: 'none',
                    position: 'absolute',
                    left: 'calc(100% + 12px)', top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#1E0810',
                    border: '1px solid rgba(193,18,31,0.3)',
                    color: 'rgba(255,255,255,0.88)',
                    padding: '5px 11px', borderRadius: 7,
                    fontSize: '0.78rem', fontWeight: 500,
                    whiteSpace: 'nowrap', zIndex: 9999,
                    pointerEvents: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                  }} className="dc-tip">{link.label}</span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const role      = getRole();
  const name      = getUserName();
  const sections  = SECTIONS[role] || [];
  const initials  = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
  const roleLabel = role?.replace('ROLE_', '').replace(/_/g, ' ') || 'USER';

  const [collapsed, setCollapsed] = useState(true);
  const width = collapsed ? 80 : 256;

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', width + 'px');
  }, [collapsed]);

  return (
    <>
      <style>{`
        .dc-item-collapsed:hover .dc-tip { display: block !important; }
        .dc-sidebar-nav::-webkit-scrollbar { width: 2px; }
        .dc-sidebar-nav::-webkit-scrollbar-thumb { background: rgba(193,18,31,0.25); border-radius: 1px; }
        @keyframes dc-pulse {
          0%,100% { opacity:1; } 50% { opacity:0.5; }
        }
      `}</style>

      <aside
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        style={{
        position: 'fixed', top: 0, left: 0,
        width, height: '100vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 1000,
        /* Warm deep burgundy — harmonises with the pink dashboard */
        background: 'linear-gradient(175deg, #2A0810 0%, #1C0608 45%, #22080E 100%)',
        borderRight: '1px solid rgba(193,18,31,0.18)',
        boxShadow: '4px 0 24px rgba(100,0,20,0.25)',
      }}>

        {/* Subtle static glow — top only, no animation */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(193,18,31,0.18) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* ── Logo ── */}
        <div style={{
          padding: collapsed ? '18px 0' : '18px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
          flexShrink: 0, position: 'relative', zIndex: 1,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #C1121F, #8B0000)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(193,18,31,0.45)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 55%)', borderRadius:10 }} />
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
              <path d="M8 1C8 1 1 8 1 13a7 7 0 0 0 14 0C15 8 8 1 8 1z" fill="white" opacity=".95"/>
              <ellipse cx="5.5" cy="12" rx="1.3" ry="2.2" fill="white" opacity=".28" transform="rotate(-20 5.5 12)"/>
            </svg>
          </div>
          {!collapsed && (
            <div>
              <div style={{
                fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:'0.95rem',
                color:'rgba(255,255,255,0.92)', letterSpacing:'-0.02em', lineHeight:1.1,
              }}>DonorConnect</div>
              <div style={{ fontSize:'0.56rem', color:'rgba(255,255,255,0.25)', marginTop:2, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                Blood Bank System
              </div>
            </div>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="dc-sidebar-nav" style={{
          flex:1, overflowY:'auto', overflowX:'hidden',
          padding:'6px 0 8px', position:'relative', zIndex:1,
        }}>
          {sections.map(s => <Section key={s.label} section={s} collapsed={collapsed} />)}
        </nav>

        {/* ── User footer ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: collapsed ? '10px 8px' : '12px 12px',
          flexShrink: 0, zIndex: 1, position: 'relative',
          background: 'rgba(0,0,0,0.15)',
        }}>
          {!collapsed ? (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:9 }}>
                <div style={{
                  width:32, height:32, borderRadius:'50%', flexShrink:0,
                  background:'linear-gradient(135deg,#FF6B9D,#C1121F)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'white', fontFamily:'Sora', fontWeight:800, fontSize:'0.72rem',
                  boxShadow:'0 0 12px rgba(255,107,157,0.35)',
                }}>{initials}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.78rem', fontWeight:600, color:'rgba(255,255,255,0.85)', fontFamily:'Sora', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name || 'User'}</div>
                  <div style={{ fontSize:'0.58rem', color:'#FF6B9D', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', marginTop:1 }}>{roleLabel}</div>
                </div>
                <button onClick={logout} title="Logout" style={{
                  width:28, height:28, borderRadius:7,
                  border:'1px solid rgba(255,255,255,0.08)',
                  background:'rgba(255,255,255,0.04)',
                  color:'rgba(255,255,255,0.35)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', flexShrink:0, transition:'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(193,18,31,0.25)'; e.currentTarget.style.color='#FF6B9D'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.35)'; }}
                >
                  <SvgIcon name="logout" size={13} />
                </button>
              </div>
              <div style={{
                display:'flex', alignItems:'center', gap:6,
                background:'rgba(88,214,141,0.06)', borderRadius:7,
                padding:'4px 9px', border:'1px solid rgba(88,214,141,0.12)',
              }}>
                <span style={{
                  width:5, height:5, borderRadius:'50%', background:'#58D68D',
                  boxShadow:'0 0 6px #58D68D', flexShrink:0,
                  animation:'dc-pulse 2.5s ease-in-out infinite',
                }} />
                <span style={{ fontSize:'0.62rem', color:'#58D68D', fontWeight:600 }}>Online</span>
                <span style={{ marginLeft:'auto', fontSize:'0.6rem', color:'rgba(255,255,255,0.2)' }}>
                  {new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                </span>
              </div>
            </>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:7 }}>
              <div style={{
                width:30, height:30, borderRadius:'50%',
                background:'linear-gradient(135deg,#FF6B9D,#C1121F)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'white', fontFamily:'Sora', fontWeight:800, fontSize:'0.7rem',
              }}>{initials}</div>
              <button onClick={logout} style={{
                width:28, height:28, borderRadius:7,
                border:'1px solid rgba(255,255,255,0.08)',
                background:'rgba(255,255,255,0.04)',
                color:'rgba(255,255,255,0.35)',
                display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              }}>
                <SvgIcon name="logout" size={13} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}