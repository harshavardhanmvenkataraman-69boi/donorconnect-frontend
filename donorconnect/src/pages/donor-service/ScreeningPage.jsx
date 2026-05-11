import { useState, useEffect, useRef } from 'react'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import ScreeningList from '../../components/service/donor/ScreeningList.jsx'

const EMPTY_VITALS = { hemoglobin: '', bpSystolic: '', bpDiastolic: '', weight: '', pulse: '', temperature: '' }
const EMPTY_Q      = { recentIllness: false, recentMedication: false, recentTattoo: false, recentSurgery: false, traveledAbroad: false, alcoholLast24h: false }
const INIT_FORM    = {
  donorId: '', screeningDate: new Date().toISOString().split('T')[0],
  clearedBy: '', notes: '', clearedFlag: null,
  deferralRequest: { deferralType: 'TEMPORARY', reason: '' },
}

const safeJson = (raw, fallback) => {
  try { return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback } }
  catch { return { ...fallback } }
}

const calcPct = (form, vitals) => {
  const fields = [
    !!form.donorId, !!form.screeningDate, !!form.clearedBy?.trim(),
    !!vitals.hemoglobin, !!vitals.bpSystolic, !!vitals.bpDiastolic,
    !!vitals.weight, !!vitals.pulse, !!vitals.temperature,
  ]
  return Math.round((fields.filter(Boolean).length / fields.length) * 100)
}

export default function ScreeningPage() {
  const [donorId, setDonorId]         = useState('')
  const [screenings, setScreenings]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [totalCount, setTotalCount]   = useState(0)
  const [viewRecord, setViewRecord]   = useState(null)
  const [editRecord, setEditRecord]   = useState(null)
  const [showCreate, setShowCreate]   = useState(false)
  const [saving, setSaving]           = useState(false)
  const [progressPct, setProgressPct] = useState(0)
  const [form, setForm]               = useState({ ...INIT_FORM })
  const [vitals, setVitals]           = useState({ ...EMPTY_VITALS })
  const [questionnaire, setQ]         = useState({ ...EMPTY_Q })

  // ── Donor ID validation state (for New Screening modal) ──────────────────
  const [scDonorStatus, setScDonorStatus] = useState('idle')
  const [scDonorName,   setScDonorName]   = useState('')
  const donorCheckRef = useRef(null)

  const checkScDonor = (id) => {
    if (!id) { setScDonorStatus('idle'); setScDonorName(''); return }
    setScDonorStatus('checking')
    clearTimeout(donorCheckRef.current)
    donorCheckRef.current = setTimeout(async () => {
      try {
        const r     = await api.get(`/api/donors/${id}`)
        const donor = r.data?.data || r.data
        if (donor && donor.donorId) {
          setScDonorStatus('valid'); setScDonorName(donor.name || `Donor #${id}`)
        } else {
          setScDonorStatus('invalid'); setScDonorName('')
        }
      } catch { setScDonorStatus('invalid'); setScDonorName('') }
    }, 600)
  }

  const resetScDonor = () => {
    clearTimeout(donorCheckRef.current)
    setScDonorStatus('idle'); setScDonorName('')
  }
  // ─────────────────────────────────────────────────────────────────────────

  const formRef   = useRef(form)
  const vitalsRef = useRef(vitals)
  formRef.current   = form
  vitalsRef.current = vitals

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') setProgressPct(calcPct(formRef.current, vitalsRef.current))
  }
  const attachEnter = () => document.addEventListener('keydown', handleKeyDown)
  const detachEnter = () => document.removeEventListener('keydown', handleKeyDown)

  const loadAll = () => {
    setLoading(true); setDonorId('')
    api.get('/api/screenings?page=0&size=50')
      .then(r => {
        const data  = r.data?.data?.content ?? r.data?.content ?? r.data?.data ?? r.data ?? []
        const total = r.data?.data?.totalElements ?? r.data?.totalElements ?? data.length
        setScreenings(Array.isArray(data) ? data : []); setTotalCount(total)
      })
      .catch(() => setScreenings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const search = (id = donorId) => {
    const val = String(id).trim()
    if (!val) { loadAll(); return }
    setLoading(true)
    api.get(`/api/screenings/donor/${val}`)
      .then(r => {
        const data = r.data?.data || r.data || []
        setScreenings(Array.isArray(data) ? data : [])
        setTotalCount(Array.isArray(data) ? data.length : 0)
      })
      .catch(() => setScreenings([]))
      .finally(() => setLoading(false))
  }

  const reload = () => { if (donorId.trim()) search(donorId); else loadAll() }

  const resetForm = (prefill = {}) => {
    setForm({ ...INIT_FORM, ...prefill })
    setVitals({ ...EMPTY_VITALS }); setQ({ ...EMPTY_Q }); setProgressPct(0)
  }

  const populateForm = (record) => {
    const f = {
      donorId: record.donorId, screeningDate: record.screeningDate || new Date().toISOString().split('T')[0],
      clearedBy: record.clearedBy || '', notes: record.notes || '',
      clearedFlag: record.clearedFlag ?? null,
      deferralRequest: { deferralType: 'TEMPORARY', reason: '' },
    }
    const v = safeJson(record.vitalsJson, EMPTY_VITALS)
    setForm(f); setVitals(v); setQ(safeJson(record.questionnaireJson, EMPTY_Q))
    setProgressPct(calcPct(f, v))
  }

  const buildPayload = () => ({
    donorId: Number(form.donorId), screeningDate: form.screeningDate,
    clearedFlag: form.clearedFlag, clearedBy: form.clearedBy || null, notes: form.notes || null,
    vitalsJson: JSON.stringify(vitals), questionnaireJson: JSON.stringify(questionnaire),
    ...(form.clearedFlag === false ? {
      deferralRequest: { donorId: Number(form.donorId), deferralType: form.deferralRequest.deferralType, reason: form.deferralRequest.reason },
    } : {}),
  })

  const handleSave = async (isEdit) => {
    if (!form.donorId) { showError('Donor ID is required'); return }
    if (!isEdit && scDonorStatus !== 'valid') { showError('Please enter a valid Donor ID'); return }
    if (form.clearedFlag === null) { showError('Please select a clearance decision'); return }
    if (form.clearedFlag === false && !form.deferralRequest.reason.trim()) {
      showError('Deferral reason is required when donor is not cleared'); return
    }
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/api/screenings/${editRecord.id}`, buildPayload())
        showSuccess('Screening updated'); setEditRecord(null); detachEnter()
      } else {
        await api.post('/api/screenings', buildPayload())
        showSuccess('Screening recorded'); setShowCreate(false); resetScDonor(); detachEnter()
      }
      reload()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save screening')
    } finally { setSaving(false) }
  }

  return (
    <ScreeningList
      screenings={screenings} loading={loading}
      donorId={donorId} resultCount={screenings.length} totalCount={totalCount}
      viewRecord={viewRecord} editRecord={editRecord} showCreate={showCreate}
      form={form} vitals={vitals} questionnaire={questionnaire}
      saving={saving} progressPct={progressPct}
      scDonorStatus={scDonorStatus} scDonorName={scDonorName}
      onScDonorIdChange={checkScDonor}
      onDonorIdChange={e => setDonorId(e.target.value)}
      onSearch={() => search()} onClearSearch={loadAll}
      onViewRecord={setViewRecord}
      onCloseView={() => setViewRecord(null)}
      onEditFromView={() => { populateForm(viewRecord); setEditRecord({ record: viewRecord, id: viewRecord.screeningId }); setViewRecord(null); attachEnter() }}
      onEditRecord={(row) => { populateForm(row); setEditRecord({ record: row, id: row.screeningId }); attachEnter() }}
      onCloseEdit={() => { setEditRecord(null); detachEnter() }}
      onShowCreate={() => { resetForm({ donorId: donorId || '' }); setShowCreate(true); attachEnter() }}
      onCloseCreate={() => { setShowCreate(false); resetScDonor(); detachEnter() }}
      onFormChange={(key, val) => setForm(f => ({ ...f, [key]: val }))}
      onVitalsChange={(key, val) => setVitals(v => ({ ...v, [key]: val }))}
      onQChange={(key, val) => setQ(q => ({ ...q, [key]: val }))}
      onDeferChange={(key, val) => setForm(f => ({ ...f, deferralRequest: { ...f.deferralRequest, [key]: val } }))}
      onSaveCreate={() => handleSave(false)}
      onSaveEdit={() => handleSave(true)}
    />
  )
}