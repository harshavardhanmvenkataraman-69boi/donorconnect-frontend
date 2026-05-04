import { useState, useEffect } from 'react'
import api from '../../api/axiosInstance'
import { StatCard, DataTable, StatusBadge, PageHeader, showSuccess, showError } from '../../components/shared/ui/index.jsx'

const COMP_TYPES = ['WHOLE_BLOOD','RED_BLOOD_CELLS','PLASMA','PLATELETS','CRYOPRECIPITATE']
const TXN_TYPES = ['IN','OUT','ADJUSTMENT','TRANSFER','DISPOSAL','EXPIRY']

// ─── STOCK OVERVIEW ───
export function StockOverviewPage() {
  const [inventory, setInventory] = useState([]); const [lowStock, setLowStock] = useState([])
  const [summary, setSummary] = useState([]); const [loading, setLoading] = useState(true)
  const [bgFilter, setBgFilter] = useState(''); const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    Promise.allSettled([api.get('/api/inventory'), api.get('/api/inventory/low-stock'), api.get('/api/inventory/summary')]).then(([inv, ls, sum]) => {
      setInventory(inv.value?.data?.data || inv.value?.data || [])
      setLowStock(ls.value?.data?.data || ls.value?.data || [])
      setSummary(sum.value?.data?.data || sum.value?.data || [])
      setLoading(false)
    })
  }, [])

  const available = (Array.isArray(inventory)?inventory:[]).filter(i => i.status === 'AVAILABLE')
  const uniqueBG = [...new Set((Array.isArray(summary)?summary:[]).map(s => s.bloodGroup).filter(Boolean))]

  const filtered = (Array.isArray(summary)?summary:[]).filter(s =>
    (!bgFilter || s.bloodGroup === bgFilter) && (!typeFilter || s.componentType === typeFilter))

  const cols = [
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'rhFactor', label: 'Rh' },
    { key: 'componentType', label: 'Component Type' },
    { key: 'availableUnits', label: 'Available Units' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
  ]

  return (
    <>
      <PageHeader title="Blood Stock Overview" />
      <div className="grid-4" style={{ marginBottom:20 }}>
        <StatCard title="Total in Stock" value={available.length} color="primary" icon="bi-box-seam" />
        <StatCard title="Low Stock Alerts" value={Array.isArray(lowStock)?lowStock.length:0} color="danger" icon="bi-exclamation-triangle" />
        <StatCard title="Blood Groups Tracked" value={uniqueBG.length} color="info" icon="bi-droplet" />
        <StatCard title="Total Records" value={Array.isArray(inventory)?inventory.length:0} color="secondary" icon="bi-list" />
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <select className="dc-input" style={{ maxWidth:160 }} value={bgFilter} onChange={e => setBgFilter(e.target.value)}>
          <option value="">All Blood Groups</option>{uniqueBG.map(b => <option key={b}>{b}</option>)}</select>
        <select className="dc-input" style={{ maxWidth:200 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Component Types</option>{COMP_TYPES.map(t => <option key={t}>{t}</option>)}</select>
      </div>
      <DataTable columns={cols} data={filtered} loading={loading} />
      {Array.isArray(lowStock) && lowStock.length > 0 && (
        <div style={{ marginTop:24 }}>
          <h6 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, marginBottom:12, color:'#ff6b7a' }}>
            <i className="bi bi-exclamation-triangle" style={{ marginRight:8 }} />Low Stock Alerts
          </h6>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {lowStock.map((item, i) => (
              <div key={i} className="dc-alert danger" style={{ margin:0 }}>
                <i className="bi bi-droplet-fill" />{item.bloodGroup} {item.rhFactor} — {item.componentType}: {item.availableUnits} units
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ─── STOCK TRANSACTIONS ───
export function StockTransactionsPage() {
  const [txns, setTxns] = useState([]); const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState(''); const [page, setPage] = useState(0)
  const [modal, setModal] = useState(false); const [form, setForm] = useState({ componentId:'', transactionType:'IN', quantity:'', notes:'' })

  const load = async () => {
    setLoading(true)
    try {
      const url = typeFilter ? `/api/stock-transactions/type/${typeFilter}` : `/api/stock-transactions?page=${page}&size=20`
      const res = await api.get(url)
      const d = res.data?.data?.content || res.data?.content || res.data?.data || res.data || []
      setTxns(Array.isArray(d) ? d : [])
    } catch { showError('Failed.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [typeFilter, page])

  const txnColor = (t) => ({ IN:'success', OUT:'warning', DISPOSAL:'danger', EXPIRY:'danger' }[t] || 'secondary')
  const save = async () => {
    try { await api.post('/api/stock-transactions', form); showSuccess('Transaction recorded.'); setModal(false); load() }
    catch { showError('Failed.') }
  }

  const cols = [
    { key: 'id', label: 'ID' },
    { key: 'componentId', label: 'Component ID' },
    { key: 'transactionType', label: 'Type', render: v => <span className={`dc-badge ${txnColor(v)}`}>{v}</span> },
    { key: 'quantity', label: 'Quantity' },
    { key: 'notes', label: 'Notes' },
    { key: 'createdAt', label: 'Created At', render: v => v ? new Date(v).toLocaleString() : '—' },
  ]

  return (
    <>
      <PageHeader title="Stock Transactions" />
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <select className="dc-input" style={{ maxWidth:200 }} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0) }}>
          <option value="">All Types</option>{TXN_TYPES.map(t => <option key={t}>{t}</option>)}</select>
        <button className="btn-dc-primary" onClick={() => setModal(true)}><i className="bi bi-plus-lg"/>Record Transaction</button>
      </div>
      <DataTable columns={cols} data={txns} loading={loading} />
      <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:16 }}>
        <button className="btn-dc-ghost" onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}>← Prev</button>
        <span style={{ color:'var(--text-muted)', fontSize:13, display:'flex', alignItems:'center' }}>Page {page+1}</span>
        <button className="btn-dc-ghost" onClick={() => setPage(p => p+1)}>Next →</button>
      </div>
      {modal && (
        <div className="dc-modal-overlay" onClick={() => setModal(false)}>
          <div className="dc-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">Record Transaction</span><button className="btn-dc-icon" onClick={() => setModal(false)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body">
              <div style={{ marginBottom:14 }}><label className="dc-form-label">Component ID</label><input className="dc-input" type="number" value={form.componentId} onChange={e=>setForm(p=>({...p,componentId:e.target.value}))} /></div>
              <div style={{ marginBottom:14 }}><label className="dc-form-label">Transaction Type</label><select className="dc-input" value={form.transactionType} onChange={e=>setForm(p=>({...p,transactionType:e.target.value}))}>{TXN_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div style={{ marginBottom:14 }}><label className="dc-form-label">Quantity</label><input className="dc-input" type="number" value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} /></div>
              <div><label className="dc-form-label">Notes</label><textarea className="dc-input" rows={3} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} /></div>
            </div>
            <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn-dc-primary" onClick={save}>Record</button></div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── EXPIRY WATCH ───
export function ExpiryWatchPage() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('ALL')

  const load = async () => {
    setLoading(true)
    try {
      const url = tab === 'OPEN' ? '/api/expiry-watch/open' : '/api/expiry-watch'
      const res = await api.get(url)
      setItems(res.data?.data || res.data || [])
    } catch { showError('Failed.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [tab])

  const daysUntil = (d) => d ? Math.ceil((new Date(d) - new Date()) / (1000*60*60*24)) : null
  const openCount = (Array.isArray(items)?items:[]).filter(i => i.status === 'OPEN' || !i.status).length

  const action = async (id) => {
    try { await api.patch(`/api/expiry-watch/${id}/action`); showSuccess('Marked as actioned.'); load() }
    catch { showError('Failed.') }
  }

  const filtered = (Array.isArray(items)?items:[]).filter(i => {
    if (tab === 'OPEN') return true
    if (tab === 'ACTIONED') return i.status === 'ACTIONED'
    return true
  })

  const rowClass = (row) => {
    const d = daysUntil(row.expiryDate)
    if (d !== null && d <= 0) return 'table-danger'
    if (d !== null && d <= 3) return 'table-warning'
    return ''
  }

  return (
    <>
      <PageHeader title="Expiry Watch" />
      {openCount > 0 && <div className="dc-alert warning"><i className="bi bi-exclamation-triangle"/>⚠ {openCount} item{openCount!==1?'s':''} require attention.</div>}
      <div style={{ display:'flex', marginBottom:16 }}>
        <div className="dc-tabs" style={{ flex:'none' }}>
          {['ALL','OPEN','ACTIONED'].map(t => <button key={t} className={`dc-tab${tab===t?' active':''}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>
      </div>
      <div className="dc-table-wrapper">
        <div style={{ overflowX:'auto' }}>
          <table className="dc-table">
            <thead><tr><th>ID</th><th>Component ID</th><th>Blood Group</th><th>Type</th><th>Expiry Date</th><th>Days Until Expiry</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} style={{ textAlign:'center', padding:40 }}><div className="dc-spinner" style={{ margin:'0 auto' }} /></td></tr>
              : filtered.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><i className="bi bi-inbox" /><p>No records found.</p></div></td></tr>
              : filtered.map((row, i) => {
                const d = daysUntil(row.expiryDate)
                return (
                  <tr key={i} className={rowClass(row)}>
                    <td>{row.id||row.expiryId}</td>
                    <td>{row.componentId}</td>
                    <td>{row.bloodGroup||'—'}</td>
                    <td>{row.componentType||'—'}</td>
                    <td>{row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : '—'}</td>
                    <td style={{ fontWeight:700, color: d !== null && d <= 0 ? '#ff6b7a' : d !== null && d <= 3 ? '#f0a500' : 'var(--text-secondary)' }}>
                      {d !== null ? (d <= 0 ? 'EXPIRED' : `${d} days`) : '—'}
                    </td>
                    <td><StatusBadge status={row.status||'OPEN'} /></td>
                    <td>{(row.status !== 'ACTIONED') && <button className="btn-dc-ghost" onClick={() => action(row.id||row.expiryId)}>Mark Actioned</button>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
