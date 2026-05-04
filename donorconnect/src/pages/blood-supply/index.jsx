import { useState, useEffect } from 'react'
import api from '../../api/axiosInstance'
import { StatCard, DataTable, StatusBadge, PageHeader, ConfirmModal, showSuccess, showError } from '../../components/shared/ui/index.jsx'

const COMPONENT_TYPES = ['WHOLE_BLOOD','RED_BLOOD_CELLS','PLASMA','PLATELETS','CRYOPRECIPITATE']
const TEST_TYPES = ['HIV','HBV','HCV','SYPHILIS','MALARIA','GROUPING','CROSSMATCH']

// ─── DONATIONS ───
export function DonationsPage() {
  const [donations, setDonations] = useState([]); const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false); const [form, setForm] = useState({ donorId:'', volumeMl:'' })
  const [compModal, setCompModal] = useState(null); const [components, setComponents] = useState([])

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/api/donations'); setDonations(r.data?.data || r.data || []) }
    catch { showError('Failed.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const viewComponents = async (donationId) => {
    try { const r = await api.get(`/api/components?donationId=${donationId}`); setComponents(r.data?.data || r.data || []); setCompModal(donationId) }
    catch { setComponents([]); setCompModal(donationId) }
  }

  const save = async () => {
    try { await api.post('/api/donations', form); showSuccess('Donation recorded.'); setModal(false); load() }
    catch { showError('Failed.') }
  }

  const cols = [
    { key: 'id', label: 'ID' },
    { key: 'donorId', label: 'Donor ID' },
    { key: 'volumeMl', label: 'Volume (ml)' },
    { key: 'collectionStatus', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'donatedAt', label: 'Donated At', render: v => v ? new Date(v).toLocaleString() : '—' },
    { key: 'actions', label: 'Actions', render: (_, r) => <button className="btn-dc-ghost" onClick={() => viewComponents(r.id)}>View Components</button> },
  ]

  return (
    <>
      <PageHeader title="Donations Log" />
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button className="btn-dc-primary" onClick={() => setModal(true)}><i className="bi bi-plus-lg"/>Record Donation</button>
      </div>
      <DataTable columns={cols} data={Array.isArray(donations)?donations:[]} loading={loading} />

      {modal && (
        <div className="dc-modal-overlay" onClick={() => setModal(false)}>
          <div className="dc-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">Record Donation</span><button className="btn-dc-icon" onClick={() => setModal(false)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body">
              {[['donorId','Donor ID','number'],['volumeMl','Volume (ml)','number']].map(([k,l,t]) => (
                <div key={k} style={{ marginBottom:14 }}><label className="dc-form-label">{l}</label><input className="dc-input" type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} /></div>
              ))}
            </div>
            <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn-dc-primary" onClick={save}>Record</button></div>
          </div>
        </div>
      )}

      {compModal && (
        <div className="dc-modal-overlay" onClick={() => setCompModal(null)}>
          <div className="dc-modal dc-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">Components for Donation #{compModal}</span><button className="btn-dc-icon" onClick={() => setCompModal(null)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body">
              <DataTable columns={[{key:'id',label:'ID'},{key:'componentType',label:'Type'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>},{key:'expiryDate',label:'Expiry',render:v=>v?new Date(v).toLocaleDateString():'—'}]} data={Array.isArray(components)?components:[]} loading={false} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── BLOOD COMPONENTS ───
export function BloodComponentsPage() {
  const [comps, setComps] = useState([]); const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState(''); const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState(false); const [form, setForm] = useState({ donationId:'', componentType:'WHOLE_BLOOD', expiryDate:'' })
  const [qModal, setQModal] = useState(null); const [qReason, setQReason] = useState('')
  const [confirm, setConfirm] = useState(null)

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/api/components'); setComps(r.data?.data || r.data || []) }
    catch { showError('Failed.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = (Array.isArray(comps)?comps:[]).filter(c => (!typeFilter || c.componentType === typeFilter) && (!statusFilter || c.status === statusFilter))
  const counts = (s) => (Array.isArray(comps)?comps:[]).filter(c => c.status === s).length

  const quarantine = async () => {
    try { await api.post('/api/quarantine', { componentId: qModal, reason: qReason }); showSuccess('Quarantined.'); setQModal(null); load() }
    catch { showError('Failed.') }
  }
  const dispose = async (id) => {
    try { await api.post('/api/disposal', { componentId: id, reason: 'Disposed by lab technician.' }); showSuccess('Disposed.'); load() }
    catch { showError('Failed.') }
  }
  const save = async () => {
    try { await api.post('/api/components', form); showSuccess('Component registered.'); setModal(false); load() }
    catch { showError('Failed.') }
  }

  const cols = [
    { key: 'id', label: 'ID' },
    { key: 'donationId', label: 'Donation ID' },
    { key: 'componentType', label: 'Type' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'expiryDate', label: 'Expiry', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'actions', label: 'Actions', render: (_, r) => (
      <div style={{ display:'flex', gap:5 }}>
        <button className="btn-dc-warning" onClick={() => { setQModal(r.id); setQReason('') }}>Quarantine</button>
        <button className="btn-dc-danger" onClick={() => setConfirm(r.id)}>Dispose</button>
      </div>
    )},
  ]

  return (
    <>
      <PageHeader title="Blood Components" />
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[['Total', comps.length,'primary'],['Available',counts('AVAILABLE'),'success'],['Quarantined',counts('QUARANTINED'),'warning'],['Disposed',counts('DISPOSED'),'secondary']].map(([l,v,c]) => <StatCard key={l} title={l} value={v} color={c} />)}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', gap:10 }}>
          <select className="dc-input" style={{ maxWidth:200 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>{COMPONENT_TYPES.map(t => <option key={t}>{t}</option>)}</select>
          <select className="dc-input" style={{ maxWidth:160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>{['AVAILABLE','QUARANTINED','DISPOSED','ISSUED'].map(s => <option key={s}>{s}</option>)}</select>
        </div>
        <button className="btn-dc-primary" onClick={() => setModal(true)}><i className="bi bi-plus-lg"/>Register Component</button>
      </div>
      <DataTable columns={cols} data={filtered} loading={loading} />

      {modal && (
        <div className="dc-modal-overlay" onClick={() => setModal(false)}>
          <div className="dc-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">Register Component</span><button className="btn-dc-icon" onClick={() => setModal(false)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body">
              <div style={{ marginBottom:14 }}><label className="dc-form-label">Donation ID</label><input className="dc-input" type="number" value={form.donationId} onChange={e=>setForm(p=>({...p,donationId:e.target.value}))} /></div>
              <div style={{ marginBottom:14 }}><label className="dc-form-label">Component Type</label><select className="dc-input" value={form.componentType} onChange={e=>setForm(p=>({...p,componentType:e.target.value}))}>{COMPONENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label className="dc-form-label">Expiry Date</label><input className="dc-input" type="date" value={form.expiryDate} onChange={e=>setForm(p=>({...p,expiryDate:e.target.value}))} /></div>
            </div>
            <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn-dc-primary" onClick={save}>Register</button></div>
          </div>
        </div>
      )}

      {qModal && (
        <div className="dc-modal-overlay" onClick={() => setQModal(null)}>
          <div className="dc-modal" style={{ maxWidth:380 }} onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">Quarantine Component #{qModal}</span><button className="btn-dc-icon" onClick={() => setQModal(null)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body"><label className="dc-form-label">Reason</label><textarea className="dc-input" rows={3} value={qReason} onChange={e=>setQReason(e.target.value)} /></div>
            <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={() => setQModal(null)}>Cancel</button><button className="btn-dc-warning" style={{ padding:'9px 20px' }} onClick={quarantine}>Quarantine</button></div>
          </div>
        </div>
      )}
      <ConfirmModal show={!!confirm} onHide={() => setConfirm(null)} onConfirm={() => dispose(confirm)} title="Dispose Component" message="Permanently dispose this component?" />
    </>
  )
}

// ─── TEST RESULTS ───
export function TestResultsPage() {
  const [results, setResults] = useState([]); const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('ALL'); const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ componentId:'', testType:'HIV', passed:true, notes:'' })

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/api/test-results'); setResults(r.data?.data || r.data || []) }
    catch { showError('Failed.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = (Array.isArray(results)?results:[]).filter(r => tab === 'ALL' || r.status === tab || r.testStatus === tab)
  const save = async () => {
    try { await api.post('/api/test-results', form); showSuccess('Test result entered.'); setModal(false); load() }
    catch { showError('Failed.') }
  }

  const cols = [
    { key: 'id', label: 'ID' },
    { key: 'componentId', label: 'Component ID' },
    { key: 'testType', label: 'Test Type' },
    { key: 'status', label: 'Status', render: (v, r) => <StatusBadge status={v || r.testStatus} /> },
    { key: 'notes', label: 'Notes', render: v => <span style={{ fontSize:12 }}>{v || '—'}</span> },
    { key: 'testedAt', label: 'Tested At', render: v => v ? new Date(v).toLocaleString() : '—' },
  ]

  return (
    <>
      <PageHeader title="Test Results" />
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <div className="dc-tabs" style={{ flex:'none' }}>
          {['ALL','PENDING','PASSED','FAILED'].map(t => <button key={t} className={`dc-tab${tab===t?' active':''}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>
        <button className="btn-dc-primary" onClick={() => setModal(true)}><i className="bi bi-plus-lg"/>Enter Result</button>
      </div>
      <DataTable columns={cols} data={filtered} loading={loading} />
      {modal && (
        <div className="dc-modal-overlay" onClick={() => setModal(false)}>
          <div className="dc-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">Enter Test Result</span><button className="btn-dc-icon" onClick={() => setModal(false)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body">
              <div className="dc-alert info" style={{ marginBottom:16 }}><i className="bi bi-info-circle"/>If this test fails, the component will be automatically quarantined.</div>
              <div style={{ marginBottom:14 }}><label className="dc-form-label">Component ID</label><input className="dc-input" type="number" value={form.componentId} onChange={e=>setForm(p=>({...p,componentId:e.target.value}))} /></div>
              <div style={{ marginBottom:14 }}><label className="dc-form-label">Test Type</label><select className="dc-input" value={form.testType} onChange={e=>setForm(p=>({...p,testType:e.target.value}))}>{TEST_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div style={{ marginBottom:14 }}>
                <label className="dc-form-label">Result</label>
                <div style={{ display:'flex', gap:16, marginTop:6 }}>
                  {[true,false].map(v => (
                    <label key={String(v)} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:'var(--text-secondary)', fontSize:14 }}>
                      <input type="radio" checked={form.passed===v} onChange={() => setForm(p=>({...p,passed:v}))} />
                      <span style={{ color: v ? '#2ec27e' : '#ff6b7a' }}>{v ? '✓ Pass' : '✗ Fail'}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div><label className="dc-form-label">Notes</label><textarea className="dc-input" rows={3} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} /></div>
            </div>
            <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn-dc-primary" onClick={save}>Submit</button></div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── QUARANTINE & RECALL ───
export function QuarantineRecallPage() {
  const [tab, setTab] = useState('quarantine')
  const [quarantines, setQuarantines] = useState([]); const [recalls, setRecalls] = useState([])
  const [loading, setLoading] = useState(true); const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ componentId:'', reason:'' })

  const load = async () => {
    setLoading(true)
    try {
      const [q, r] = await Promise.allSettled([api.get('/api/quarantine'), api.get('/api/recalls')])
      setQuarantines(q.value?.data?.data || q.value?.data || [])
      setRecalls(r.value?.data?.data || r.value?.data || [])
    } catch { showError('Failed.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const release = async (id) => {
    try { await api.patch(`/api/quarantine/${id}/release`); showSuccess('Released.'); load() }
    catch { showError('Failed.') }
  }
  const save = async () => {
    try {
      if (modal === 'quarantine') await api.post('/api/quarantine', form)
      else await api.post('/api/recalls', { reason: form.reason })
      showSuccess('Created.'); setModal(null); load()
    } catch { showError('Failed.') }
  }

  const qCols = [
    { key: 'id', label: 'ID' },
    { key: 'componentId', label: 'Component ID' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Created At', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'actions', label: 'Actions', render: (_, r) => <button className="btn-dc-success" onClick={() => release(r.id)}>Release</button> },
  ]
  const rCols = [
    { key: 'id', label: 'ID' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Created At', render: v => v ? new Date(v).toLocaleDateString() : '—' },
  ]

  return (
    <>
      <PageHeader title="Quarantine & Recall" />
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <div className="dc-tabs" style={{ flex:'none' }}>
          <button className={`dc-tab${tab==='quarantine'?' active':''}`} onClick={() => setTab('quarantine')}>Quarantine</button>
          <button className={`dc-tab${tab==='recalls'?' active':''}`} onClick={() => setTab('recalls')}>Recalls</button>
        </div>
        <button className="btn-dc-primary" onClick={() => { setForm({ componentId:'', reason:'' }); setModal(tab) }}>
          <i className="bi bi-plus-lg"/>{tab === 'quarantine' ? 'Add Quarantine' : 'Issue Recall'}
        </button>
      </div>
      <DataTable columns={tab === 'quarantine' ? qCols : rCols} data={tab === 'quarantine' ? (Array.isArray(quarantines)?quarantines:[]) : (Array.isArray(recalls)?recalls:[])} loading={loading} />
      {modal && (
        <div className="dc-modal-overlay" onClick={() => setModal(null)}>
          <div className="dc-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">{modal === 'quarantine' ? 'Add Quarantine' : 'Issue Recall'}</span><button className="btn-dc-icon" onClick={() => setModal(null)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body">
              {modal === 'quarantine' && <div style={{ marginBottom:14 }}><label className="dc-form-label">Component ID</label><input className="dc-input" type="number" value={form.componentId} onChange={e=>setForm(p=>({...p,componentId:e.target.value}))} /></div>}
              <div><label className="dc-form-label">Reason</label><textarea className="dc-input" rows={3} value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))} /></div>
            </div>
            <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn-dc-primary" onClick={save}>Submit</button></div>
          </div>
        </div>
      )}
    </>
  )
}
