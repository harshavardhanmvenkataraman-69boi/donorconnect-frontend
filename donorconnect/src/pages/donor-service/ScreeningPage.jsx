import { useState, useRef } from 'react'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import ScreeningList from '../../components/service/donor/ScreeningList.jsx'

const EMPTY_VITALS = { hemoglobin: '', bpSystolic: '', bpDiastolic: '', weight: '', pulse: '', temperature: '' }
const EMPTY_Q      = { recentIllness: false, recentMedication: false, recentTattoo: false, recentSurgery: false, traveledAbroad: false, alcoholLast24h: false }

const INIT_FORM = {
  donorId: '', screeningDate: new Date().toISOString().split('T')[0],
  clearedBy: '', notes: '', clearedFlag: true,
  deferralRequest: { deferralType: 'TEMPORARY', reason: '' },
}

const safeJson = (raw, fallback) => {
  try { return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback } }
  catch { return { ...fallback } }
}

export default function ScreeningPage() {
  const [donorId, setDonorId]       = useState('')
  const [screenings, setScreenings] = useState([])
  const [loading, setLoading]       = useState(false)
  const [viewRecord, setViewRecord] = useState(null)
  const [editRecord, setEditRecord] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving]         = useState(false)

  // Shared form state for both create & edit modals
  const [form, setForm]             = useState({ ...INIT_FORM })
  const [vitals, setVitals]         = useState({ ...EMPTY_VITALS })
  const [questionnaire, setQ]       = useState({ ...EMPTY_Q })

  const search = (id = donorId) => {
    const val = String(id).trim()
    if (!val) return
    setLoading(true)
    api.get(`/api/screenings/donor/${val}`)
      .then(r => setScreenings(r.data?.data || r.data || []))
      .catch(() => setScreenings([]))
      .finally(() => setLoading(false))
  }

  const resetForm = (prefill = {}) => {
    setForm({ ...INIT_FORM, ...prefill })
    setVitals({ ...EMPTY_VITALS })
    setQ({ ...EMPTY_Q })
  }

  const populateForm = (record) => {
    setForm({
      donorId:       record.donorId,
      screeningDate: record.screeningDate || new Date().toISOString().split('T')[0],
      clearedBy:     record.clearedBy || '',
      notes:         record.notes || '',
      clearedFlag:   record.clearedFlag ?? true,
      deferralRequest: { deferralType: 'TEMPORARY', reason: '' },
    })
    setVitals(safeJson(record.vitalsJson, EMPTY_VITALS))
    setQ(safeJson(record.questionnaireJson, EMPTY_Q))
  }

  const buildPayload = () => ({
    donorId: Number(form.donorId),
    screeningDate: form.screeningDate,
    clearedFlag: form.clearedFlag,
    clearedBy: form.clearedBy || null,
    notes: form.notes || null,
    vitalsJson: JSON.stringify(vitals),
    questionnaireJson: JSON.stringify(questionnaire),
    ...(form.clearedFlag ? {} : {
      deferralRequest: {
        donorId: Number(form.donorId),
        deferralType: form.deferralRequest.deferralType,
        reason: form.deferralRequest.reason,
      },
    }),
  })

  const handleSave = async (isEdit) => {
    if (!form.donorId) { showError('Donor ID is required'); return }
    if (!form.clearedFlag && !form.deferralRequest.reason.trim()) {
      showError('Deferral reason is required when donor is not cleared'); return
    }
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/api/screenings/${editRecord.id}`, buildPayload())
        showSuccess('Screening updated'); setEditRecord(null)
      } else {
        await api.post('/api/screenings', buildPayload())
        showSuccess('Screening recorded'); setShowCreate(false)
      }
      search()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save screening')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScreeningList
      screenings={screenings}
      loading={loading}
      donorId={donorId}
      resultCount={screenings.length}
      viewRecord={viewRecord}
      editRecord={editRecord}
      showCreate={showCreate}
      form={form}
      vitals={vitals}
      questionnaire={questionnaire}
      saving={saving}
      onDonorIdChange={e => setDonorId(e.target.value)}
      onSearch={() => search()}
      onViewRecord={setViewRecord}
      onCloseView={() => setViewRecord(null)}
      onEditFromView={() => { populateForm(viewRecord); setEditRecord({ record: viewRecord, id: viewRecord.screeningId }); setViewRecord(null) }}
      onEditRecord={(row) => { populateForm(row); setEditRecord({ record: row, id: row.screeningId }) }}
      onCloseEdit={() => setEditRecord(null)}
      onShowCreate={() => { resetForm({ donorId: donorId || '' }); setShowCreate(true) }}
      onCloseCreate={() => setShowCreate(false)}
      onFormChange={(key, val) => setForm(f => ({ ...f, [key]: val }))}
      onVitalsChange={(key, val) => setVitals(v => ({ ...v, [key]: val }))}
      onQChange={(key, val) => setQ(q => ({ ...q, [key]: val }))}
      onDeferChange={(key, val) => setForm(f => ({ ...f, deferralRequest: { ...f.deferralRequest, [key]: val } }))}
      onSaveCreate={() => handleSave(false)}
      onSaveEdit={() => handleSave(true)}
    />
  )
}