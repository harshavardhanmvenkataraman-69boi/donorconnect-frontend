import { useState, useEffect } from 'react'
import api from '../../api/axiosInstance'
import { StatCard, DataTable, StatusBadge, PageHeader, ConfirmModal, showSuccess, showError, LoadingSpinner } from '../../components/shared/ui/index.jsx'
import { useNavigate } from 'react-router-dom'

// ─── ADMIN OVERVIEW ───
export function AdminOverviewPage() {
  const [stats, setStats] = useState({ donors: 0, crossmatches: 0, lowStock: 0, expiry: 0 })
  const [reactions, setReactions] = useState([])
  const [billing, setBilling] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.allSettled([
      api.get('/api/donors?page=0&size=1'),
      api.get('/api/transfusion/crossmatch/requests/pending'),
      api.get('/api/inventory/low-stock'),
      api.get('/api/expiry-watch/open'),
      api.get('/api/safety/reactions?page=0&size=5'),
      api.get('/api/billing'),
    ]).then(([d, cm, ls, ex, rx, bil]) => {
      setStats({
        donors: d.value?.data?.data?.totalElements ?? d.value?.data?.totalElements ?? 0,
        crossmatches: Array.isArray(cm.value?.data?.data) ? cm.value.data.data.length : (Array.isArray(cm.value?.data) ? cm.value.data.length : 0),
        lowStock: Array.isArray(ls.value?.data?.data) ? ls.value.data.data.length : (Array.isArray(ls.value?.data) ? ls.value.data.length : 0),
        expiry: Array.isArray(ex.value?.data?.data) ? ex.value.data.data.length : (Array.isArray(ex.value?.data) ? ex.value.data.length : 0),
      })
      const rxData = rx.value?.data?.data?.content || rx.value?.data?.content || []
      setReactions(rxData.slice(0, 5))
      const bilData = bil.value?.data?.data || bil.value?.data || []
      setBilling(Array.isArray(bilData) ? bilData : [])
      setLoading(false)
    })
  }, [])

  const quickLinks = [
    { icon: 'bi-person-gear', label: 'User Management', to: '/dashboard/users', color: '#4a9eff' },
    { icon: 'bi-people', label: 'Donor Registry', to: '/dashboard/donors', color: '#ff6b7a' },
    { icon: 'bi-layers', label: 'Blood Components', to: '/dashboard/components', color: '#2ec27e' },
    { icon: 'bi-box-seam', label: 'Inventory', to: '/dashboard/inventory', color: '#f0a500' },
    { icon: 'bi-diagram-3', label: 'Transfusion', to: '/dashboard/crossmatch', color: '#a78bfa' },
    { icon: 'bi-activity', label: 'Safety', to: '/dashboard/reactions', color: '#ff6b7a' },
    { icon: 'bi-receipt', label: 'Billing', to: '/dashboard/billing', color: '#4a9eff' },
    { icon: 'bi-bar-chart', label: 'Reports', to: '/dashboard/reports', color: '#2ec27e' },
  ]

  if (loading) return <LoadingSpinner />

  return (
    <>
      <PageHeader title="Admin Overview" subtitle="DonorConnect Blood Bank Management System" />
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard title="Total Donors" value={stats.donors} color="primary" icon="bi-people-fill" />
        <StatCard title="Pending Crossmatches" value={stats.crossmatches} color="warning" icon="bi-diagram-3" />
        <StatCard title="Low Stock Alerts" value={stats.lowStock} color="danger" icon="bi-box-seam-fill" />
        <StatCard title="Expiry Alerts" value={stats.expiry} color="warning" icon="bi-clock-history" />
      </div>
      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="glass-card-flat" style={{ padding: 22 }}>
          <h6 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Recent Adverse Reactions</h6>
          {reactions.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent reactions.</p> : (
            <table className="dc-table"><thead><tr><th>Severity</th><th>Patient</th><th>Status</th></tr></thead>
            <tbody>{reactions.map((r, i) => <tr key={i}><td><StatusBadge status={r.severity} /></td><td>{r.patientId}</td><td><StatusBadge status={r.status} /></td></tr>)}</tbody></table>
          )}
        </div>
        <div className="glass-card-flat" style={{ padding: 22 }}>
          <h6 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Billing Summary</h6>
          {['PENDING', 'PAID', 'WAIVED', 'CANCELLED'].map(s => {
            const count = billing.filter(b => b.status === s).length
            return <div key={s} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
              <StatusBadge status={s} /><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
            </div>
          })}
        </div>
      </div>
      <div className="glass-card-flat" style={{ padding: 22 }}>
        <h6 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 14 }}>Quick Navigation</h6>
        <div className="grid-4" style={{ gap: 12 }}>
          {quickLinks.map(ql => (
            <button key={ql.to} onClick={() => navigate(ql.to)} className="btn-dc-ghost" style={{ flexDirection: 'column', gap: 8, padding: '16px 12px', justifyContent: 'center', alignItems: 'center' }}>
              <i className={`bi ${ql.icon}`} style={{ fontSize: 20, color: ql.color }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{ql.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── USER MANAGEMENT ───
function UserModal({ user, onClose, onSaved }) {
  const isEdit = !!user?.id
  const [form, setForm] = useState(user || { name: '', email: '', password: '', role: 'ROLE_RECEPTION' })
  const [loading, setLoading] = useState(false)
  const ROLES = ['ROLE_ADMIN','ROLE_RECEPTION','ROLE_PHLEBOTOMIST','ROLE_LAB_TECHNICIAN','ROLE_INVENTORY_CONTROLLER','ROLE_TRANSFUSION_OFFICER','ROLE_DONOR']
  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      showSuccess('User registered.'); onSaved()
    } catch { showError('Failed to save user.') } finally { setLoading(false) }
  }
  return (
    <div className="dc-modal-overlay" onClick={onClose}>
      <div className="dc-modal" onClick={e => e.stopPropagation()}>
        <div className="dc-modal-header"><span className="dc-modal-title">Register New User</span><button className="btn-dc-icon" onClick={onClose}><i className="bi bi-x-lg"/></button></div>
        <div className="dc-modal-body">
          {[['name','Name','text'],['email','Email','email'],['password','Password','password']].map(([k,l,t]) => (
            <div key={k} style={{ marginBottom: 14 }}><label className="dc-form-label">{l}</label>
              <input className="dc-input" type={t} value={form[k]||''} onChange={e => setForm(p=>({...p,[k]:e.target.value}))} /></div>
          ))}
          <div><label className="dc-form-label">Role</label>
            <select className="dc-input" value={form.role} onChange={e => setForm(p=>({...p,role:e.target.value}))}>
              {ROLES.map(r => <option key={r}>{r}</option>)}</select></div>
        </div>
        <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={onClose}>Cancel</button><button className="btn-dc-primary" onClick={handleSubmit} disabled={loading}>Save</button></div>
      </div>
    </div>
  )
}

export function UserManagementPage() {
  const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null); const [confirm, setConfirm] = useState(null)
  const [roleFilter, setRoleFilter] = useState('')
  const ROLES = ['','ROLE_ADMIN','ROLE_RECEPTION','ROLE_PHLEBOTOMIST','ROLE_LAB_TECHNICIAN','ROLE_INVENTORY_CONTROLLER','ROLE_TRANSFUSION_OFFICER','ROLE_DONOR']

  const load = async () => {
    setLoading(true)
    try {
      const url = roleFilter ? `/api/v1/users/role/${roleFilter}` : '/api/v1/users?page=0&size=50'
      const res = await api.get(url)
      const d = res.data?.data?.content || res.data?.content || res.data?.data || res.data || []
      setUsers(Array.isArray(d) ? d : [])
    } catch { showError('Failed to load users.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [roleFilter])

  const action = async (url, msg) => {
    try { await api.patch(url); showSuccess(msg); load() } catch { showError('Action failed.') }
  }

  const cols = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: v => <StatusBadge status={v?.replace('ROLE_','')} /> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div style={{ display:'flex', gap:6 }}>
        <button className="btn-dc-success" onClick={() => action(`/api/v1/users/${row.id}/unlock`, 'Unlocked.')}>Unlock</button>
        <button className="btn-dc-warning" onClick={() => action(`/api/v1/users/${row.id}/lock`, 'Locked.')}>Lock</button>
        <button className="btn-dc-danger" onClick={() => setConfirm({ id: row.id, label: row.name })}>Deactivate</button>
      </div>
    )},
  ]

  return (
    <>
      <PageHeader title="User Management" />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <select className="dc-input" style={{ maxWidth:220 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          {ROLES.map(r => <option key={r} value={r}>{r || 'All Roles'}</option>)}
        </select>
        <button className="btn-dc-primary" onClick={() => setModal({})}><i className="bi bi-plus-lg"/>Register User</button>
      </div>
      <DataTable columns={cols} data={users} loading={loading} />
      {modal && <UserModal user={modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />}
      <ConfirmModal show={!!confirm} onHide={() => setConfirm(null)} onConfirm={() => action(`/api/v1/users/${confirm?.id}/deactivate`, 'Deactivated.')} title="Deactivate User" message={`Deactivate ${confirm?.label}?`} />
    </>
  )
}

// ─── AUDIT LOGS ───
export function AuditLogPage() {
  const [logs, setLogs] = useState([]); const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/v1/audit-logs')
      const d = res.data?.data || res.data || []
      setLogs(Array.isArray(d) ? d : [])
    } catch { showError('Failed to load audit logs.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const exportCSV = () => {
    const headers = ['ID', 'User', 'Action', 'IP Address', 'Timestamp']
    const rows = logs.map(l => [l.id, l.userId || l.user, l.action, l.ipAddress, l.timestamp || l.createdAt])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'audit_logs.csv'; a.click()
  }

  const cols = [
    { key: 'id', label: 'ID' },
    { key: 'userId', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'ipAddress', label: 'IP Address' },
    { key: 'timestamp', label: 'Timestamp', render: v => v ? new Date(v).toLocaleString() : '—' },
  ]

  return (
    <>
      <PageHeader title="Audit Logs" />
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <input className="dc-input" style={{ maxWidth:200 }} placeholder="Filter by User ID" value={userId} onChange={e => setUserId(e.target.value)} />
        <button className="btn-dc-ghost" onClick={exportCSV}><i className="bi bi-download"/>Export CSV</button>
      </div>
      <DataTable columns={cols} data={logs.filter(l => !userId || String(l.userId).includes(userId))} loading={loading} />
    </>
  )
}

// ─── SYSTEM CONFIG ───
export function SystemConfigPage() {
  const [configs, setConfigs] = useState([]); const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ key: '', value: '', scope: 'GLOBAL', description: '' })

  const load = async () => {
    setLoading(true)
    try { const res = await api.get('/api/config'); setConfigs(res.data?.data || res.data || []) }
    catch { showError('Failed to load config.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      if (modal?.key) await api.put(`/api/config/${modal.key}`, form)
      else await api.post('/api/config', form)
      showSuccess('Config saved.'); setModal(null); load()
    } catch { showError('Failed to save.') }
  }

  const cols = [
    { key: 'key', label: 'Key' },
    { key: 'value', label: 'Value' },
    { key: 'scope', label: 'Scope', render: v => <StatusBadge status={v} /> },
    { key: 'description', label: 'Description' },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <button className="btn-dc-ghost" onClick={() => { setForm(row); setModal(row) }}>Edit</button>
    )},
  ]

  return (
    <>
      <PageHeader title="System Configuration" />
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button className="btn-dc-primary" onClick={() => { setForm({ key:'', value:'', scope:'GLOBAL', description:'' }); setModal({}) }}><i className="bi bi-plus-lg"/>Add Config</button>
      </div>
      <DataTable columns={cols} data={Array.isArray(configs) ? configs : []} loading={loading} />
      {modal !== null && (
        <div className="dc-modal-overlay" onClick={() => setModal(null)}>
          <div className="dc-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">{modal?.key ? 'Edit' : 'Add'} Config</span><button className="btn-dc-icon" onClick={() => setModal(null)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body">
              {[['key','Key','text'],['value','Value','text'],['description','Description','text']].map(([k,l,t]) => (
                <div key={k} style={{ marginBottom:14 }}><label className="dc-form-label">{l}</label>
                  <input className="dc-input" type={t} value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} readOnly={k==='key'&&!!modal?.key} /></div>
              ))}
              <div><label className="dc-form-label">Scope</label>
                <select className="dc-input" value={form.scope} onChange={e=>setForm(p=>({...p,scope:e.target.value}))}>
                  <option>GLOBAL</option><option>SERVICE</option></select></div>
            </div>
            <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn-dc-primary" onClick={save}>Save</button></div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── REPORTS ───
export function ReportsPage() {
  const [reports, setReports] = useState([]); const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null); const [detail, setDetail] = useState(null)

  useEffect(() => {
    api.get('/api/reports').then(res => { setReports(res.data?.data || res.data || []) }).catch(() => showError('Failed to load reports.')).finally(() => setLoading(false))
  }, [])

  const viewReport = async (id) => {
    try { const res = await api.get(`/api/reports/${id}`); setDetail(res.data?.data || res.data); setSelected(id) }
    catch { showError('Failed to load report.') }
  }

  const cols = [
    { key: 'id', label: 'ID' },
    { key: 'scope', label: 'Scope', render: v => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Created At', render: v => v ? new Date(v).toLocaleString() : '—' },
    { key: 'actions', label: 'Actions', render: (_, row) => <button className="btn-dc-ghost" onClick={() => viewReport(row.id)}>View</button> },
  ]

  return (
    <>
      <PageHeader title="Reports" subtitle="Reports are generated automatically by the system on a scheduled basis." />
      <div className="dc-alert info" style={{ marginBottom:20 }}><i className="bi bi-info-circle"/>Reports are auto-generated by the backend scheduler. New reports appear here automatically.</div>
      <DataTable columns={cols} data={Array.isArray(reports) ? reports : []} loading={loading} />
      {selected && detail && (
        <div className="dc-modal-overlay" onClick={() => setSelected(null)}>
          <div className="dc-modal dc-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">Report #{selected}</span><button className="btn-dc-icon" onClick={() => setSelected(null)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body"><pre style={{ color:'var(--text-secondary)', fontSize:12, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2)}</pre></div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── NOTIFICATIONS ───
export function NotificationsPage() {
  const [notifs, setNotifs] = useState([]); const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/notifications').then(res => {
      const d = res.data?.data?.content || res.data?.content || res.data?.data || res.data || []
      setNotifs(Array.isArray(d) ? d : [])
    }).catch(() => showError('Failed to load.')).finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    try { await api.patch(`/api/notifications/${id}/read`); setNotifs(n => n.map(x => x.id === id ? {...x, status:'READ'} : x)) }
    catch { showError('Failed.') }
  }

  const cols = [
    { key: 'id', label: 'ID' },
    { key: 'category', label: 'Category', render: v => <StatusBadge status={v} /> },
    { key: 'message', label: 'Message' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'sentAt', label: 'Sent At', render: v => v ? new Date(v).toLocaleString() : '—' },
    { key: 'actions', label: '', render: (_, row) => row.status === 'UNREAD' ? <button className="btn-dc-ghost" onClick={() => markRead(row.id)}>Mark Read</button> : null },
  ]

  return (
    <>
      <PageHeader title="Notifications" />
      <DataTable columns={cols} data={notifs} loading={loading} />
    </>
  )
}
