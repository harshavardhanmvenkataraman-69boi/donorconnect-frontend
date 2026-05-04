import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axiosInstance'
import { StatCard, DataTable, StatusBadge, PageHeader, ConfirmModal, showSuccess, showError, LoadingSpinner } from '../../components/shared/ui/index.jsx'

const BG_OPTIONS = ['A', 'B', 'AB', 'O']
const DONOR_TYPES = ['WALK_IN', 'REGULAR', 'DIRECTED', 'AUTOLOGOUS']
const GENDERS = ['MALE', 'FEMALE', 'OTHER']
const RH = ['POSITIVE', 'NEGATIVE']

// ─── DONOR LIST ───
export function DonorListPage() {
  const [donors, setDonors] = useState([]); const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(''); const [bgFilter, setBgFilter] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      let url = '/api/donors?page=0&size=50'
      if (search) url = `/api/donors/search?name=${encodeURIComponent(search)}`
      else if (bgFilter) url = `/api/donors/blood-group/${bgFilter}`
      const res = await api.get(url)
      const d = res.data?.data?.content || res.data?.content || res.data?.data || res.data || []
      setDonors(Array.isArray(d) ? d : [])
    } catch { showError('Failed to load donors.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [search, bgFilter])

  const cols = [
    { key: 'donorId', label: 'Donor ID' },
    { key: 'name', label: 'Name' },
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'rhFactor', label: 'Rh' },
    { key: 'donorType', label: 'Type', render: v => <StatusBadge status={v} /> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'actions', label: 'Actions', render: (_, r) => (
      <div style={{ display:'flex', gap:6 }}>
        <button className="btn-dc-ghost" onClick={() => navigate(`/dashboard/donors/edit/${r.donorId}`)}>Edit</button>
        <button className="btn-dc-ghost" onClick={() => navigate(`/dashboard/donors/${r.donorId}`)}>View</button>
      </div>
    )},
  ]

  return (
    <>
      <PageHeader title="Donor Registry" />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', gap:10, flex:1, minWidth:0 }}>
          <input className="dc-input" placeholder="Search by name…" value={search} onChange={e => { setSearch(e.target.value); setBgFilter('') }} style={{ maxWidth:240 }} />
          <select className="dc-input" style={{ maxWidth:160 }} value={bgFilter} onChange={e => { setBgFilter(e.target.value); setSearch('') }}>
            <option value="">All Blood Groups</option>{BG_OPTIONS.map(b => <option key={b}>{b}</option>)}</select>
        </div>
        <button className="btn-dc-primary" onClick={() => navigate('/dashboard/donors/register')}><i className="bi bi-plus-lg"/>Register Donor</button>
      </div>
      <DataTable columns={cols} data={donors} loading={loading} />
    </>
  )
}

// ─── DONOR REGISTER / EDIT ───
export function DonorRegisterPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', dateOfBirth:'', gender:'MALE', bloodGroup:'A', rhFactor:'POSITIVE', contactInfo:'', address:'{"street":"","city":"","state":"","pincode":""}', donorType:'WALK_IN' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) api.get(`/api/donors/${id}`).then(r => {
      const d = r.data?.data || r.data
      setForm({ ...d, address: typeof d.address === 'object' ? JSON.stringify(d.address) : d.address || '' })
    }).catch(() => showError('Failed to load donor.'))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { ...form, address: JSON.parse(form.address) }
      if (id) await api.put(`/api/donors/${id}`, payload)
      else await api.post('/api/donors', payload)
      showSuccess(id ? 'Donor updated.' : 'Donor registered.'); navigate('/dashboard/donors')
    } catch { showError('Failed to save donor.') } finally { setLoading(false) }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <>
      <PageHeader title={id ? 'Edit Donor' : 'Register New Donor'} />
      <div className="glass-card-flat" style={{ padding: 28, maxWidth: 700 }}>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div><label className="dc-form-label">Full Name *</label><input className="dc-input" required value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><label className="dc-form-label">Date of Birth</label><input className="dc-input" type="date" value={form.dateOfBirth || ''} onChange={e => set('dateOfBirth', e.target.value)} /></div>
            <div><label className="dc-form-label">Gender</label><select className="dc-input" value={form.gender} onChange={e => set('gender', e.target.value)}>{GENDERS.map(g => <option key={g}>{g}</option>)}</select></div>
            <div><label className="dc-form-label">Blood Group</label><select className="dc-input" value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>{BG_OPTIONS.map(b => <option key={b}>{b}</option>)}</select></div>
            <div><label className="dc-form-label">Rh Factor</label><select className="dc-input" value={form.rhFactor} onChange={e => set('rhFactor', e.target.value)}>{RH.map(r => <option key={r}>{r}</option>)}</select></div>
            <div><label className="dc-form-label">Donor Type</label><select className="dc-input" value={form.donorType} onChange={e => set('donorType', e.target.value)}>{DONOR_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div style={{ gridColumn:'1/-1' }}><label className="dc-form-label">Contact Info</label><input className="dc-input" value={form.contactInfo || ''} onChange={e => set('contactInfo', e.target.value)} /></div>
            <div style={{ gridColumn:'1/-1' }}><label className="dc-form-label">Address (JSON)</label><textarea className="dc-input" rows={3} value={form.address || ''} onChange={e => set('address', e.target.value)} /></div>
          </div>
          <div style={{ marginTop: 22, display:'flex', gap:10 }}>
            <button type="submit" className="btn-dc-primary" disabled={loading}>{loading ? 'Saving…' : (id ? 'Update Donor' : 'Register Donor')}</button>
            <button type="button" className="btn-dc-ghost" onClick={() => navigate('/dashboard/donors')}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  )
}

// ─── APPOINTMENTS ───
function BookModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ donorId:'', driveId:'', scheduledAt:'' })
  const [drives, setDrives] = useState([])
  useEffect(() => { api.get('/api/drives/upcoming').then(r => setDrives(r.data?.data || r.data || [])).catch(() => {}) }, [])
  const save = async () => {
    try { await api.post('/api/appointments', form); showSuccess('Appointment booked.'); onSaved() }
    catch { showError('Failed to book.') }
  }
  return (
    <div className="dc-modal-overlay" onClick={onClose}>
      <div className="dc-modal" onClick={e => e.stopPropagation()}>
        <div className="dc-modal-header"><span className="dc-modal-title">Book Appointment</span><button className="btn-dc-icon" onClick={onClose}><i className="bi bi-x-lg"/></button></div>
        <div className="dc-modal-body">
          <div style={{ marginBottom:14 }}><label className="dc-form-label">Donor ID</label><input className="dc-input" type="number" value={form.donorId} onChange={e => setForm(p=>({...p,donorId:e.target.value}))} /></div>
          <div style={{ marginBottom:14 }}><label className="dc-form-label">Drive</label>
            <select className="dc-input" value={form.driveId} onChange={e => setForm(p=>({...p,driveId:e.target.value}))}>
              <option value="">Select drive</option>{drives.map(d => <option key={d.driveId||d.id} value={d.driveId||d.id}>{d.driveName||d.name}</option>)}</select></div>
          <div><label className="dc-form-label">Scheduled Date & Time</label><input className="dc-input" type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p=>({...p,scheduledAt:e.target.value}))} /></div>
        </div>
        <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={onClose}>Cancel</button><button className="btn-dc-primary" onClick={save}>Book</button></div>
      </div>
    </div>
  )
}

export function AppointmentsPage() {
  const [tab, setTab] = useState('today'); const [data, setData] = useState([]); const [loading, setLoading] = useState(true)
  const [bookModal, setBookModal] = useState(false); const [confirm, setConfirm] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const url = tab === 'today' ? '/api/appointments/today' : '/api/appointments?page=0&size=50'
      const res = await api.get(url)
      const d = res.data?.data?.content || res.data?.content || res.data?.data || res.data || []
      setData(Array.isArray(d) ? d : [])
    } catch { showError('Failed to load appointments.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [tab])

  const action = async (url, msg) => { try { await api.patch(url); showSuccess(msg); load() } catch { showError('Action failed.') } }

  const cols = [
    { key: 'id', label: 'ID' },
    { key: 'donorName', label: 'Donor' },
    { key: 'driveId', label: 'Drive' },
    { key: 'scheduledAt', label: 'Scheduled At', render: v => v ? new Date(v).toLocaleString() : '—' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'actions', label: 'Actions', render: (_, r) => (
      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
        <button className="btn-dc-success" onClick={() => action(`/api/appointments/${r.id}/check-in`, 'Checked in.')}>Check In</button>
        <button className="btn-dc-ghost" onClick={() => action(`/api/appointments/${r.id}/complete`, 'Completed.')}>Complete</button>
        <button className="btn-dc-warning" onClick={() => action(`/api/appointments/${r.id}/no-show`, 'Marked no-show.')}>No Show</button>
        <button className="btn-dc-danger" onClick={() => setConfirm(r.id)}>Cancel</button>
      </div>
    )},
  ]

  return (
    <>
      <PageHeader title="Appointments" />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div className="dc-tabs" style={{ flex:'none' }}>
          <button className={`dc-tab${tab==='today'?' active':''}`} onClick={() => setTab('today')}>Today</button>
          <button className={`dc-tab${tab==='all'?' active':''}`} onClick={() => setTab('all')}>All</button>
        </div>
        <button className="btn-dc-primary" onClick={() => setBookModal(true)}><i className="bi bi-plus-lg"/>Book Appointment</button>
      </div>
      <DataTable columns={cols} data={data} loading={loading} />
      {bookModal && <BookModal onClose={() => setBookModal(false)} onSaved={() => { setBookModal(false); load() }} />}
      <ConfirmModal show={!!confirm} onHide={() => setConfirm(null)} onConfirm={() => action(`/api/appointments/${confirm}/cancel`, 'Cancelled.')} title="Cancel Appointment" message="Cancel this appointment?" />
    </>
  )
}

// ─── DRIVES ───
export function DrivesPage() {
  const [drives, setDrives] = useState([]); const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ driveName:'', location:'', startDate:'', endDate:'', totalSlots:'' })

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/api/drives'); setDrives(r.data?.data || r.data || []) }
    catch { showError('Failed.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      if (modal?.id) await api.put(`/api/drives/${modal.id}`, form)
      else await api.post('/api/drives', form)
      showSuccess('Drive saved.'); setModal(null); load()
    } catch { showError('Failed.') }
  }

  const statCounts = (s) => (Array.isArray(drives) ? drives : []).filter(d => d.status === s).length

  const cols = [
    { key: 'driveId', label: 'ID' },
    { key: 'driveName', label: 'Drive Name' },
    { key: 'location', label: 'Location' },
    { key: 'startDate', label: 'Start', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'endDate', label: 'End', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'totalSlots', label: 'Slots' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'actions', label: 'Actions', render: (_, r) => <button className="btn-dc-ghost" onClick={() => { setForm(r); setModal(r) }}>Edit</button> },
  ]

  return (
    <>
      <PageHeader title="Blood Drives" />
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[['Total', drives.length, 'primary'],['Active', statCounts('ACTIVE'), 'success'],['Upcoming', statCounts('PLANNED'), 'warning'],['Completed', statCounts('COMPLETED'), 'secondary']].map(([l,v,c]) => (
          <StatCard key={l} title={l} value={v} color={c} />
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button className="btn-dc-primary" onClick={() => { setForm({ driveName:'', location:'', startDate:'', endDate:'', totalSlots:'' }); setModal({}) }}><i className="bi bi-plus-lg"/>Create Drive</button>
      </div>
      <DataTable columns={cols} data={Array.isArray(drives) ? drives : []} loading={loading} />
      {modal !== null && (
        <div className="dc-modal-overlay" onClick={() => setModal(null)}>
          <div className="dc-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">{modal?.driveId ? 'Edit' : 'Create'} Drive</span><button className="btn-dc-icon" onClick={() => setModal(null)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body">
              {[['driveName','Drive Name'],['location','Location'],['startDate','Start Date'],['endDate','End Date'],['totalSlots','Total Slots']].map(([k,l]) => (
                <div key={k} style={{ marginBottom:14 }}><label className="dc-form-label">{l}</label>
                  <input className="dc-input" type={k.includes('Date') ? 'date' : k === 'totalSlots' ? 'number' : 'text'} value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} /></div>
              ))}
            </div>
            <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn-dc-primary" onClick={save}>Save</button></div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── DEFERRALS ───
export function DeferralsPage() {
  const [deferrals, setDeferrals] = useState([]); const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('ALL'); const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ donorId:'', deferralType:'TEMPORARY', reason:'', endDate:'' })

  const load = async () => {
    setLoading(true)
    try { const r = await api.get('/api/deferrals'); setDeferrals(r.data?.data || r.data || []) }
    catch { showError('Failed.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = (Array.isArray(deferrals) ? deferrals : []).filter(d => tab === 'ALL' || d.deferralType === tab)

  const save = async () => {
    try { await api.post('/api/deferrals', form); showSuccess('Deferral issued.'); setModal(false); load() }
    catch { showError('Failed.') }
  }

  const cols = [
    { key: 'id', label: 'ID' },
    { key: 'donorId', label: 'Donor ID' },
    { key: 'deferralType', label: 'Type', render: v => <StatusBadge status={v} /> },
    { key: 'reason', label: 'Reason' },
    { key: 'startDate', label: 'Start', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'endDate', label: 'End', render: v => v ? new Date(v).toLocaleDateString() : 'Permanent' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
  ]

  return (
    <>
      <PageHeader title="Deferral Management" />
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <div className="dc-tabs" style={{ flex:'none' }}>
          {['ALL','TEMPORARY','PERMANENT'].map(t => <button key={t} className={`dc-tab${tab===t?' active':''}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>
        <button className="btn-dc-primary" onClick={() => setModal(true)}><i className="bi bi-plus-lg"/>Issue Deferral</button>
      </div>
      <DataTable columns={cols} data={filtered} loading={loading} />
      {modal && (
        <div className="dc-modal-overlay" onClick={() => setModal(false)}>
          <div className="dc-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">Issue Deferral</span><button className="btn-dc-icon" onClick={() => setModal(false)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body">
              <div style={{ marginBottom:14 }}><label className="dc-form-label">Donor ID</label><input className="dc-input" type="number" value={form.donorId} onChange={e=>setForm(p=>({...p,donorId:e.target.value}))} /></div>
              <div style={{ marginBottom:14 }}><label className="dc-form-label">Type</label>
                <select className="dc-input" value={form.deferralType} onChange={e=>setForm(p=>({...p,deferralType:e.target.value}))}>
                  <option>TEMPORARY</option><option>PERMANENT</option></select></div>
              <div style={{ marginBottom:14 }}><label className="dc-form-label">Reason</label><textarea className="dc-input" rows={3} value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))} /></div>
              {form.deferralType === 'TEMPORARY' && <div><label className="dc-form-label">End Date</label><input className="dc-input" type="date" value={form.endDate} onChange={e=>setForm(p=>({...p,endDate:e.target.value}))} /></div>}
            </div>
            <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn-dc-primary" onClick={save}>Issue</button></div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── SCREENINGS ───
export function ScreeningPage() {
  const [donorId, setDonorId] = useState(''); const [screenings, setScreenings] = useState([]); const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ donorId:'', appointmentId:'', hemoglobin:'', bpSystolic:'', bpDiastolic:'', weight:'', clearedFlag:true, deferralRequest:{ type:'TEMPORARY', reason:'', endDate:'' } })

  const search = async () => {
    if (!donorId) return; setLoading(true)
    try { const r = await api.get(`/api/screenings/donor/${donorId}`); setScreenings(r.data?.data || r.data || []) }
    catch { showError('No screenings found.') } finally { setLoading(false) }
  }

  const save = async () => {
    try {
      const payload = { ...form }
      if (!payload.clearedFlag) payload.deferralRequest = form.deferralRequest
      else delete payload.deferralRequest
      await api.post('/api/screenings', payload); showSuccess('Screening recorded.'); setModal(false)
    } catch { showError('Failed.') }
  }

  const cols = [
    { key: 'id', label: 'ID' },
    { key: 'appointmentId', label: 'Appt ID' },
    { key: 'hemoglobin', label: 'Hgb' },
    { key: 'bpSystolic', label: 'BP Sys' },
    { key: 'bpDiastolic', label: 'BP Dia' },
    { key: 'weight', label: 'Weight' },
    { key: 'clearedFlag', label: 'Cleared?', render: v => <StatusBadge status={v ? 'PASSED' : 'FAILED'} /> },
    { key: 'screeningDate', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '—' },
  ]

  return (
    <>
      <PageHeader title="Pre-Donation Screening" />
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <input className="dc-input" placeholder="Enter Donor ID…" value={donorId} onChange={e => setDonorId(e.target.value)} style={{ maxWidth:200 }} />
        <button className="btn-dc-ghost" onClick={search}><i className="bi bi-search"/>Search</button>
        <button className="btn-dc-primary" onClick={() => setModal(true)} style={{ marginLeft:'auto' }}><i className="bi bi-plus-lg"/>New Screening</button>
      </div>
      <DataTable columns={cols} data={Array.isArray(screenings) ? screenings : []} loading={loading} />
      {modal && (
        <div className="dc-modal-overlay" onClick={() => setModal(false)}>
          <div className="dc-modal dc-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-header"><span className="dc-modal-title">New Screening</span><button className="btn-dc-icon" onClick={() => setModal(false)}><i className="bi bi-x-lg"/></button></div>
            <div className="dc-modal-body">
              <div className="grid-2">
                {[['donorId','Donor ID','number'],['appointmentId','Appointment ID','number'],['hemoglobin','Hemoglobin','number'],['bpSystolic','BP Systolic','number'],['bpDiastolic','BP Diastolic','number'],['weight','Weight (kg)','number']].map(([k,l,t]) => (
                  <div key={k}><label className="dc-form-label">{l}</label><input className="dc-input" type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} /></div>
                ))}
              </div>
              <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:10 }}>
                <input type="checkbox" id="cleared" checked={form.clearedFlag} onChange={e=>setForm(p=>({...p,clearedFlag:e.target.checked}))} />
                <label htmlFor="cleared" style={{ color:'var(--text-secondary)', fontSize:14 }}>Cleared for donation?</label>
              </div>
              {!form.clearedFlag && (
                <div style={{ marginTop:16, padding:16, background:'rgba(240,165,0,0.06)', border:'1px solid rgba(240,165,0,0.2)', borderRadius:8 }}>
                  <p style={{ color:'#f0a500', fontSize:12, fontWeight:600, marginBottom:12 }}>DEFERRAL DETAILS</p>
                  <div style={{ marginBottom:12 }}><label className="dc-form-label">Deferral Type</label>
                    <select className="dc-input" value={form.deferralRequest.type} onChange={e=>setForm(p=>({...p,deferralRequest:{...p.deferralRequest,type:e.target.value}}))}>
                      <option>TEMPORARY</option><option>PERMANENT</option></select></div>
                  <div style={{ marginBottom:12 }}><label className="dc-form-label">Reason</label><textarea className="dc-input" rows={2} value={form.deferralRequest.reason} onChange={e=>setForm(p=>({...p,deferralRequest:{...p.deferralRequest,reason:e.target.value}}))} /></div>
                  <div><label className="dc-form-label">End Date</label><input className="dc-input" type="date" value={form.deferralRequest.endDate} onChange={e=>setForm(p=>({...p,deferralRequest:{...p.deferralRequest,endDate:e.target.value}}))} /></div>
                </div>
              )}
            </div>
            <div className="dc-modal-footer"><button className="btn-dc-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn-dc-primary" onClick={save}>Submit</button></div>
          </div>
        </div>
      )}
    </>
  )
}
