import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import IssuedRecordList from '../../components/service/transfusion/IssuedRecordList.jsx'

export default function IssuedRecordsPage() {
  const [records, setRecords]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [confirm, setConfirm]       = useState(null)
  const [reactModal, setReactModal] = useState(null)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    api.get('/api/transfusion/issue?page=0&size=50')
      .then(r => {
        const data = r.data?.data
        setRecords(data?.content ?? (Array.isArray(data) ? data : []))
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleReturn        = (issueId) => setConfirm(issueId)
  const handleReturnDismiss = () => setConfirm(null)

  const handleReturnConfirm = async (issueId) => {
    setConfirm(null)
    try {
      await api.patch(`/api/transfusion/issue/${issueId}/return`)
      showSuccess('Unit returned successfully')
      load()
    } catch (e) {
      showError(e.response?.data?.message || 'Return failed')
    }
  }

  const handleViewReactions = async (patientId) => {
    try {
      const r = await api.get(`/api/safety/reactions/patient/${patientId}`)
      const data = r.data?.data ?? r.data ?? []
      setReactModal(Array.isArray(data) ? data : [])
    } catch {
      setReactModal([])
    }
  }

  // Navigate to ReactionsPage with issueId + patientId pre-filled
  const handleLogReaction = ({ issueId, patientId }) => {
    navigate('/dashboard/reactions', {
      state: { prefill: { issueId, patientId } }
    })
  }

  return (
    <IssuedRecordList
      records={records}
      loading={loading}
      confirm={confirm}
      reactModal={reactModal}
      onReturn={handleReturn}
      onReturnDismiss={handleReturnDismiss}
      onReturnConfirm={handleReturnConfirm}
      onViewReactions={handleViewReactions}
      onReactClose={() => setReactModal(null)}
      onLogReaction={handleLogReaction}
    />
  )
}