import { useState, useEffect } from 'react'
import api from '../../api/axiosInstance'
import { DataTable, StatusBadge, PageHeader, ConfirmModal, showSuccess, showError } from '../../components/shared/ui/index.jsx'

// ─── CROSSMATCH ───
export function CrossmatchPage() {
  const [tab, setTab] = useState('PENDING'); const [data, setData] = useState([]); const [loading, setLoading] = useState(true)
  const [resultModal, setResultModal] = useState(null); const [newModal, setNewModal] = useState(false)
  const [resultForm, setResultForm] = useState({ compatibility:'COMPATIBLE', notes:'' })
  const [newForm, setNewForm] = useState({ componentId:'', patientId:'', priority:'ROUTINE' })

  const load = async () => {
    setLoading(true)
    try {
      const url = tab === 'PENDING' ? '/api/transfusion/crossmatch/requests/pending' : '/api/transfusion/crossmatch/requests?page=0&size=50'
      const r = await api.get(url)
      const d = r.data?.data?.content || r.data?.content || r.data?.data || r.data || []
      setData(Array.isArray(d) ? d : [])
    } catch { showError('Failed.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [tab])

  const submitResult = async () => {
    try {
      await api.post('/api/transfusion/crossmatch/results', { crossmatchRequestId: resultModal, ...resultForm })
      showSuccess('Result recorded.'); setResultModal(null); load()
    } catch { showError('Failed.') }
  }
  const submitNew = async () => {
    try { await api.post('/api/transfusion/crossmatch/requests', newForm); showSuccess('Request created.'); setNewModal(false); load() }
    catch { showError('Failed.') }
  }

  const pColor = { EMERGENCY:'danger', URGENT:'warning', ROUTINE:'primary' }
  const cols = [
    { key: 'id', label: 'ID' },
    { key: 'componentId', label: 'Component ID' },
    { key: 'patientId', label: 'Patient ID' },
    { key: 'priority', label: 'Priority', render: v => <span className={`dc-badge ${pColor[v]||'secondary'}`}>{v}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'requestedAt', label: 'Requested At', render: v => v ? new Date(v).toLocaleString() : '—' },
    { key: 'actions', label: 'Actions', render: (_, r) => <button className="btn-dc-ghost" onClick={() => { setResultModal(r.id); setResultForm({ compatibility:'COMPATIBLE', notes:'' }) }}>Record Result</button> },
  ]

  return (
    <>
      <PageHeader title="Crossmatch Requests" />
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <div className="dc-tabs" style={{ flex:'none' }}>
          <button className={`dc-tab${tab==='PENDING'?' active':''}`} onClick={() => setTab('PENDING')}>Pending</button>
          <button className={`dc-tab${tab==='ALL'?' active':''}`} onClick={() => setTab('ALL')}>All</button>
        </div>
        <button className="btn-dc-primary" onClick={() => setNewModal(true)}><i className="bi bi-plus-lg"/>New Request</button>
      </div>
      <DataTable columns={cols} data={data} loading={loading} />

      {resultModal && (
        <div className="dc-modal-overlay" onClick={() => setResultModal(null)}>
          <div className="dc-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">Record Crossmatch Result</span><button className="btn-dc-icon" onClick={() => setResultModal(null)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body">
              <div style={{ marginBottom:14 }}><label className="dc-form-label">Compatibility</label>
                <select className="dc-input" value={resultForm.compatibility} onChange={e=>setResultForm(p=>({...p,compatibility:e.target.value}))}>
                  <option>COMPATIBLE</option><option>INCOMPATIBLE</option><option>MINOR_INCOMPATIBILITY</option></select></div>
              <div><label className="dc-form-label">Notes</label><textarea className="dc-input" rows={3} value={resultForm.notes} onChange={e=>setResultForm(p=>({...p,notes:e.target.value}))} /></div>
            </div>
            <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={() => setResultModal(null)}>Cancel</button><button className="btn-dc-primary" onClick={submitResult}>Submit</button></div>
          </div>
        </div>
      )}

      {newModal && (
        <div className="dc-modal-overlay" onClick={() => setNewModal(false)}>
          <div className="dc-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">New Crossmatch Request</span><button className="btn-dc-icon" onClick={() => setNewModal(false)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body">
              {[['componentId','Component ID'],['patientId','Patient ID']].map(([k,l]) => (
                <div key={k} style={{ marginBottom:14 }}><label className="dc-form-label">{l}</label><input className="dc-input" type="number" value={newForm[k]} onChange={e=>setNewForm(p=>({...p,[k]:e.target.value}))} /></div>
              ))}
              <div><label className="dc-form-label">Priority</label><select className="dc-input" value={newForm.priority} onChange={e=>setNewForm(p=>({...p,priority:e.target.value}))}>
                <option>ROUTINE</option><option>URGENT</option><option>EMERGENCY</option></select></div>
            </div>
            <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={() => setNewModal(false)}>Cancel</button><button className="btn-dc-primary" onClick={submitNew}>Create</button></div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── ISSUE BLOOD ───
export function IssueBloodPage() {
  const [form, setForm] = useState({ componentId:'', patientId:'', ward:'', doctorName:'', notes:'' })
  const [checked, setChecked] = useState(false); const [showCheck, setShowCheck] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!checked) return
    setLoading(true)
    try {
      await api.post('/api/transfusion/issue', form)
      showSuccess('Blood component issued successfully.')
      setForm({ componentId:'', patientId:'', ward:'', doctorName:'', notes:'' }); setChecked(false); setShowCheck(false)
    } catch { showError('Failed to issue component.') } finally { setLoading(false) }
  }

  return (
    <>
      <PageHeader title="Issue Blood Component" />
      <div style={{ maxWidth:600, margin:'0 auto' }}>
        <div className="glass-card-flat" style={{ padding:28 }}>
          <div className="grid-2">
            {[['componentId','Component ID *','number'],['patientId','Patient ID *','number'],['ward','Ward / Location','text'],['doctorName','Doctor Name','text']].map(([k,l,t]) => (
              <div key={k}><label className="dc-form-label">{l}</label><input className="dc-input" type={t} required={l.includes('*')} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} /></div>
            ))}
            <div style={{ gridColumn:'1/-1' }}><label className="dc-form-label">Notes</label><textarea className="dc-input" rows={3} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} /></div>
          </div>

          {!showCheck ? (
            <button className="btn-dc-ghost" style={{ marginTop:20 }} onClick={() => setShowCheck(true)} disabled={!form.componentId || !form.patientId}>
              <i className="bi bi-shield-check"/>Check Compatibility
            </button>
          ) : (
            <div style={{ marginTop:20, padding:18, background:'rgba(74,158,255,0.06)', border:'1px solid rgba(74,158,255,0.2)', borderRadius:10 }}>
              <div className="dc-alert info" style={{ marginBottom:14 }}><i className="bi bi-info-circle"/>Please ensure crossmatch has been completed and marked COMPATIBLE before issuing.</div>
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', color:'var(--text-secondary)', fontSize:14 }}>
                <input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)} />
                I confirm this component is crossmatch-compatible
              </label>
            </div>
          )}

          <div style={{ marginTop:22 }}>
            <button className="btn-dc-primary" onClick={submit} disabled={!checked || loading} style={{ opacity:!checked?0.5:1 }}>
              {loading ? 'Issuing…' : <><i className="bi bi-bag-plus"/>Issue Blood Component</>}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── ISSUED RECORDS ───
export function IssuedRecordsPage() {
  const [records, setRecords] = useState([]); const [loading, setLoading] = useState(true)
  const [patFilter, setPatFilter] = useState(''); const [confirm, setConfirm] = useState(null)
  const [reactModal, setReactModal] = useState(null); const [reactions, setReactions] = useState([])

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/api/transfusion/issue?page=0&size=50'); setRecords(r.data?.data?.content || r.data?.content || r.data?.data || r.data || []) }
    catch { showError('Failed.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const ret = async (id) => {
    try { await api.patch(`/api/transfusion/issue/${id}/return`); showSuccess('Returned.'); load() }
    catch { showError('Failed.') }
  }
  const viewReactions = async (patientId) => {
    try { const r = await api.get(`/api/reactions/patient/${patientId}`); setReactions(r.data?.data || r.data || []); setReactModal(patientId) }
    catch { setReactions([]); setReactModal(patientId) }
  }

  const filtered = (Array.isArray(records)?records:[]).filter(r => !patFilter || String(r.patientId).includes(patFilter))

  const cols = [
    { key: 'id', label: 'ID' },
    { key: 'componentId', label: 'Component ID' },
    { key: 'patientId', label: 'Patient ID' },
    { key: 'ward', label: 'Ward' },
    { key: 'doctorName', label: 'Doctor' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'issuedAt', label: 'Issued At', render: v => v ? new Date(v).toLocaleString() : '—' },
    { key: 'actions', label: 'Actions', render: (_, r) => (
      <div style={{ display:'flex', gap:5 }}>
        <button className="btn-dc-success" onClick={() => setConfirm(r.id)}>Return</button>
        <button className="btn-dc-ghost" onClick={() => viewReactions(r.patientId)}>Reactions</button>
      </div>
    )},
  ]

  return (
    <>
      <PageHeader title="Issued Records" />
      <div style={{ marginBottom:16 }}>
        <input className="dc-input" placeholder="Filter by Patient ID…" value={patFilter} onChange={e => setPatFilter(e.target.value)} style={{ maxWidth:220 }} />
      </div>
      <DataTable columns={cols} data={filtered} loading={loading} />
      <ConfirmModal show={!!confirm} onHide={() => setConfirm(null)} onConfirm={() => ret(confirm)} title="Return Unit" message="Confirm return of this blood unit?" />
      {reactModal && (
        <div className="dc-modal-overlay" onClick={() => setReactModal(null)}>
          <div className="dc-modal dc-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">Reactions — Patient {reactModal}</span><button className="btn-dc-icon" onClick={() => setReactModal(null)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body"><DataTable columns={[{key:'id',label:'ID'},{key:'severity',label:'Severity',render:v=><StatusBadge status={v}/>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>},{key:'description',label:'Description'}]} data={Array.isArray(reactions)?reactions:[]} loading={false} /></div>
          </div>
        </div>
      )}
    </>
  )
}
