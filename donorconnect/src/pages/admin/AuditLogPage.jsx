import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import LoadingSpinner from '../../components/shared/ui/LoadingSpinner';
import EmptyState from '../../components/shared/ui/EmptyState';
 
/* ── Action colour + icon mapping ───────────────────────────────────── */
const ACTION_META = {
  LOGIN:            { color: '#2ECC71', bg: 'rgba(46,204,113,0.12)',   icon: '🔓', label: 'Login' },
  LOGOUT:           { color: '#95A5A6', bg: 'rgba(149,165,166,0.15)',  icon: '🔒', label: 'Logout' },
  PASSWORD_RESET:   { color: '#F39C12', bg: 'rgba(243,156,18,0.12)',   icon: '🔑', label: 'Password Reset' },
  PASSWORD_CHANGE:  { color: '#F39C12', bg: 'rgba(243,156,18,0.12)',   icon: '🔑', label: 'Password Change' },
  FAILED_LOGIN:     { color: '#E74C3C', bg: 'rgba(231,76,60,0.12)',    icon: '⛔', label: 'Failed Login' },
  CREATE:           { color: '#3498DB', bg: 'rgba(52,152,219,0.12)',   icon: '➕', label: 'Create' },
  UPDATE:           { color: '#9B59B6', bg: 'rgba(155,89,182,0.12)',   icon: '✏️', label: 'Update' },
  DELETE:           { color: '#E74C3C', bg: 'rgba(231,76,60,0.12)',    icon: '🗑️', label: 'Delete' },
  VIEW:             { color: '#1ABC9C', bg: 'rgba(26,188,156,0.12)',   icon: '👁️', label: 'View' },
  EXPORT:           { color: '#E67E22', bg: 'rgba(230,126,34,0.12)',   icon: '📤', label: 'Export' },
  BLOOD_ISSUE:      { color: '#C1121F', bg: 'rgba(193,18,31,0.1)',     icon: '🩸', label: 'Blood Issue' },
  CROSSMATCH:       { color: '#8B0000', bg: 'rgba(139,0,0,0.1)',       icon: '🔬', label: 'Crossmatch' },
  SCREENING:        { color: '#27AE60', bg: 'rgba(39,174,96,0.12)',    icon: '🏥', label: 'Screening' },
  DEFER:            { color: '#E67E22', bg: 'rgba(230,126,34,0.12)',   icon: '⏸️', label: 'Defer' },
  APPOINTMENT:      { color: '#3498DB', bg: 'rgba(52,152,219,0.12)',   icon: '📅', label: 'Appointment' },
  STOCK_UPDATE:     { color: '#F39C12', bg: 'rgba(243,156,18,0.12)',   icon: '📦', label: 'Stock Update' },
  DISPOSE:          { color: '#95A5A6', bg: 'rgba(149,165,166,0.15)',  icon: '🗂️', label: 'Dispose' },
  USER_CREATED:     { color: '#3498DB', bg: 'rgba(52,152,219,0.12)',   icon: '👤', label: 'User Created' },
  USER_UPDATED:     { color: '#9B59B6', bg: 'rgba(155,89,182,0.12)',   icon: '👤', label: 'User Updated' },
  USER_DEACTIVATED: { color: '#E74C3C', bg: 'rgba(231,76,60,0.12)',    icon: '🚫', label: 'User Deactivated' },
  CONFIG_CHANGE:    { color: '#E67E22', bg: 'rgba(230,126,34,0.12)',   icon: '⚙️', label: 'Config Change' },
};
 
const ROLE_META = {
  ADMIN:        { color: '#C1121F', bg: 'rgba(193,18,31,0.1)' },
  DOCTOR:       { color: '#3498DB', bg: 'rgba(52,152,219,0.12)' },
  NURSE:        { color: '#27AE60', bg: 'rgba(39,174,96,0.12)' },
  LAB_TECH:     { color: '#9B59B6', bg: 'rgba(155,89,182,0.12)' },
  RECEPTIONIST: { color: '#E67E22', bg: 'rgba(230,126,34,0.12)' },
  STAFF:        { color: '#1ABC9C', bg: 'rgba(26,188,156,0.12)' },
};
 
function getActionMeta(action = '') {
  const key = action.toUpperCase().replace(/[\s-]/g, '_');
  return ACTION_META[key] || { color: '#7F8C8D', bg: 'rgba(127,140,141,0.12)', icon: '📋', label: action };
}
 
function getRoleMeta(role = '') {
  const key = role.toUpperCase().replace(/[\s-]/g, '_');
  return ROLE_META[key] || { color: '#7F8C8D', bg: 'rgba(127,140,141,0.12)' };
}
 
function Pill({ label, color, bg, icon }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 50,
      fontSize: '0.72rem', fontWeight: 700,
      color, background: bg, whiteSpace: 'nowrap',
    }}>
      {icon && <span style={{ fontSize: '0.75rem' }}>{icon}</span>}
      {label}
    </span>
  );
}
 
function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
 
function formatFullTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}
 
const PER_PAGE = 15;
 
export default function AuditLogPage() {
  const [logs,         setLogs]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page,         setPage]         = useState(1);
 
  useEffect(() => {
    const toArray = (p) => {
      if (Array.isArray(p)) return p;
      if (p?.content && Array.isArray(p.content)) return p.content;
      if (p?.data?.content && Array.isArray(p.data.content)) return p.data.content;
      if (p?.data && Array.isArray(p.data)) return p.data;
      return [];
    };
    api.get('/api/v1/audit-logs?page=0&size=100')
      .then(r => {
        console.log('Audit logs raw response:', r.data);
        const result = toArray(r.data?.data ?? r.data);
        console.log('Audit logs parsed:', result.length, 'records');
        setLogs(result);
      })
      .catch((e) => { console.error('Audit logs error:', e); setLogs([]); })
      .finally(() => setLoading(false));
  }, []);
 
  const roles   = useMemo(() => ['ALL', ...new Set(logs.map(l => l.userRole).filter(Boolean))], [logs]);
  const actions = useMemo(() => ['ALL', ...new Set(logs.map(l => l.action).filter(Boolean))], [logs]);
 
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter(l => {
      if (roleFilter   !== 'ALL' && l.userRole !== roleFilter)   return false;
      if (actionFilter !== 'ALL' && l.action   !== actionFilter) return false;
      if (q && ![l.auditId, l.userName, l.userRole, l.action, l.resource]
        .some(v => String(v ?? '').toLowerCase().includes(q))) return false;
      return true;
    });
  }, [logs, search, roleFilter, actionFilter]);
 
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
 
  useEffect(() => setPage(1), [search, roleFilter, actionFilter]);
 
  const exportCSV = () => {
    const header = 'ID,User,Role,Action,Resource,Timestamp\n';
    const rows = filtered.map(l =>
      `${l.auditId},"${l.userName ?? ''}","${l.userRole ?? ''}","${l.action ?? ''}","${l.resource ?? ''}","${formatFullTime(l.timestamp)}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };
 
  return (
    <div className="animate-fadein">
      <PageHeader title="Audit Logs" subtitle="Full system activity trail — every action, every user">
        <button className="btn-glass" onClick={exportCSV}>📥 Export CSV</button>
      </PageHeader>
 
      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Events',  value: logs.length,      color: 'var(--text-primary)' },
          { label: 'Filtered',      value: filtered.length,  color: 'var(--crimson)' },
          { label: 'Users Active',  value: new Set(logs.map(l => l.userName)).size, color: '#3498DB' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            borderRadius: 12, padding: '10px 18px',
            boxShadow: 'var(--glass-shadow)', backdropFilter: 'blur(16px)',
          }}>
            <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '1.3rem', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>
 
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-glass" style={{ flex: '1 1 220px', minWidth: 180 }}>
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            placeholder="Search by user, action, ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" style={{ flex: '0 0 160px' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          {roles.map(r => <option key={r} value={r}>{r === 'ALL' ? '👥 All Roles' : r}</option>)}
        </select>
        <select className="form-select" style={{ flex: '0 0 180px' }} value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          {actions.map(a => <option key={a} value={a}>{a === 'ALL' ? '⚡ All Actions' : a}</option>)}
        </select>
        {(search || roleFilter !== 'ALL' || actionFilter !== 'ALL') && (
          <button className="btn-glass" onClick={() => { setSearch(''); setRoleFilter('ALL'); setActionFilter('ALL'); }}>✕ Clear</button>
        )}
      </div>
 
      {/* Table */}
      <div className="table-wrapper">
        {loading ? <LoadingSpinner /> : paginated.length === 0 ? <EmptyState /> : (
          <div className="table-scroll">
            <table className="table-glass w-100" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  {['ID', 'User', 'Role', 'Action', 'Resource', 'Time'].map(h => (
                    <th key={h} style={{ whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((log, i) => {
                  const am = getActionMeta(log.action);
                  const rm = getRoleMeta(log.userRole);
                  return (
                    <tr key={log.auditId ?? i}>
                      {/* ID */}
                      <td>
                        <span style={{
                          fontFamily: 'monospace', fontSize: '0.78rem',
                          background: 'rgba(0,0,0,0.04)', borderRadius: 6,
                          padding: '2px 8px', color: 'var(--text-muted)', fontWeight: 600,
                        }}>
                          #{String(log.auditId ?? i + 1).slice(-6)}
                        </span>
                      </td>
                      {/* User */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--crimson), var(--blood-dark))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                          }}>
                            {(log.userName ?? '?')[0].toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            {log.userName ?? '—'}
                          </span>
                        </div>
                      </td>
                      {/* Role */}
                      <td>
                        {log.userRole
                          ? <Pill label={log.userRole.replace(/_/g, ' ')} color={rm.color} bg={rm.bg} />
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      {/* Action */}
                      <td>
                        <Pill label={am.label || log.action} color={am.color} bg={am.bg} icon={am.icon} />
                      </td>
                      {/* Resource */}
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.resource || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      {/* Time */}
                      <td>
                        <div title={formatFullTime(log.timestamp)}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {formatTime(log.timestamp)}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                            {log.timestamp ? new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
 
        {/* Pagination */}
        {!loading && filtered.length > PER_PAGE && (
          <div style={{
            padding: '14px 20px', borderTop: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-glass" disabled={page === 1} onClick={() => setPage(p => p - 1)}
                style={{ padding: '5px 14px', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const n = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={n} className={n === page ? 'btn-crimson' : 'btn-glass'}
                    onClick={() => setPage(n)} style={{ padding: '5px 12px', minWidth: 36 }}>{n}</button>
                );
              })}
              <button className="btn-glass" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                style={{ padding: '5px 14px', opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}