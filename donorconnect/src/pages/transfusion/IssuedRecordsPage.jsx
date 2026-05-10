import { useState, useEffect } from 'react'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import IssuedRecordList from '../../components/service/transfusion/IssuedRecordList.jsx'

export default function IssuedRecordsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [reactModal, setReactModal] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/api/transfusion/issue?page=0&size=50').then(r => { const data = r.data?.data; setRecords(data?.content ?? (Array.isArray(data) ? data : [])) }).catch(() => setRecords([])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const returnUnit = async (id) => {
    try { await api.patch(`/api/transfusion/issue/${id}/return`); showSuccess('Unit returned successfully'); load() }
    catch (e) { showError(e.response?.data?.message || 'Return failed') }
  }
  const viewReactions = async (patientId) => {
    try { const r = await api.get(`/api/safety/reactions/patient/${patientId}`); setReactModal(r.data?.data || r.data || []) }
    catch { setReactModal([]) }
  }

  return <IssuedRecordList records={records} loading={loading} confirm={confirm} reactModal={reactModal} onReturn={setConfirm} onReturnDismiss={() => setConfirm(null)} onReturnConfirm={id => { returnUnit(id); setConfirm(null) }} onViewReactions={viewReactions} onReactClose={() => setReactModal(null)} />
}
