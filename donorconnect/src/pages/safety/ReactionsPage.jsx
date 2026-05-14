import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import ReactionList from '../../components/service/safety/ReactionList'

const INIT_LOG = {
  issueId: '', patientId: '', reactionType: '', severity: 'MILD', notes: '',
}

export default function ReactionsPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [reactions, setReactions]             = useState([])
  const [loading, setLoading]                 = useState(true)
  const [showLog, setShowLog]                 = useState(false)
  const [logForm, setLogForm]                 = useState(INIT_LOG)
  const [statusModal, setStatusModal]         = useState(null)
  const [newStatus, setNewStatus]             = useState('PENDING')
  const [lookbackLoading, setLookbackLoading] = useState(false)
  // Tracks which patientIds already have lookback initiated { patientId: [traces] }
  const [lookbackMap, setLookbackMap]         = useState({})

  const load = () => {
    setLoading(true)
    api.get('/api/safety/reactions?page=0&size=50')
      .then(r => {
        const data = r.data?.data
        setReactions(data?.content ?? (Array.isArray(data) ? data : []))
      })
      .catch(() => setReactions([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  useEffect(() => {
    const prefill = location.state?.prefill
    if (prefill?.issueId && prefill?.patientId) {
      setLogForm({ ...INIT_LOG, issueId: String(prefill.issueId), patientId: String(prefill.patientId) })
      setShowLog(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const handleLogOpen  = () => { setLogForm(INIT_LOG); setShowLog(true) }
  const handleLogClose = () => { setShowLog(false); setLogForm(INIT_LOG) }

  const handleLogSave = async () => {
    if (!logForm.issueId || !logForm.patientId) {
      showError('Issue ID and Patient ID are required')
      return
    }
    try {
      await api.post('/api/safety/reactions', {
        issueId:      Number(logForm.issueId),
        patientId:    Number(logForm.patientId),
        reactionType: logForm.reactionType,
        severity:     logForm.severity,
        notes:        logForm.notes,
      })
      showSuccess('Reaction logged successfully')
      handleLogClose()
      load()
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to log reaction')
    }
  }

  const handleStatusOpen   = (row) => { setStatusModal(row); setNewStatus(row.status) }
  const handleStatusClose  = () => setStatusModal(null)

  const handleStatusUpdate = async () => {
    try {
      await api.patch(`/api/safety/reactions/${statusModal.reactionId}/status?status=${newStatus}`)
      showSuccess('Status updated')
      handleStatusClose()
      load()
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to update status')
    }
  }

  // Check if lookback already exists for this patient
  // Returns traces if exists, null if not
  const checkLookbackExists = async (patientId) => {
    // Use cached result if available
    if (lookbackMap[patientId] !== undefined) return lookbackMap[patientId]
    try {
      const r = await api.get(`/api/safety/lookback/exists/patient/${patientId}`)
      const data = r.data?.data
      const traces = data?.exists ? data.traces : null
      setLookbackMap(prev => ({ ...prev, [patientId]: traces }))
      return traces
    } catch {
      return null
    }
  }

  // View existing lookback — navigate to lookback page and search by patient
  const handleViewLookback = (row) => {
    navigate('/dashboard/lookback', {
      state: { search: { type: 'patient', id: String(row.patientId) } }
    })
  }

  // Initiate new lookback — fetch all IDs then navigate
  const handleLookback = async (row) => {
    // First check if lookback already exists
    const existingTraces = await checkLookbackExists(row.patientId)
    if (existingTraces) {
      // Already exists — view instead
      handleViewLookback(row)
      return
    }

    setLookbackLoading(true)
    let componentId = ''
    let donationId  = ''

    // Step 1 — issueId → componentId
    try {
      const issueRes = await api.get(`/api/safety/issue-component/${row.issueId}`)
      componentId = String(issueRes.data?.data?.componentId ?? '')
    } catch {
      showError('Could not fetch Component ID.')
      setLookbackLoading(false)
      navigate('/dashboard/lookback', {
        state: { prefill: { donationId: '', componentId: '', patientId: String(row.patientId), reactionId: row.reactionId } }
      })
      return
    }

    // Step 2 — componentId → donationId
    try {
      const compRes = await api.get(`/api/safety/component-donation/${componentId}`)
      donationId = String(compRes.data?.data?.donationId ?? '')
    } catch {
      showError('Could not fetch Donation ID. Please enter manually.')
    }

    setLookbackLoading(false)

    // Navigate with reactionId so backend can auto-update status to INVESTIGATING
    navigate('/dashboard/lookback', {
      state: {
        prefill: {
          donationId,
          componentId,
          patientId:  String(row.patientId),
          reactionId: row.reactionId,  // ← passed to auto-update reaction status
        }
      }
    })
  }

  return (
    <ReactionList
      reactions={reactions}
      loading={loading}
      showLog={showLog}
      logForm={logForm}
      statusModal={statusModal}
      newStatus={newStatus}
      lookbackLoading={lookbackLoading}
      lookbackMap={lookbackMap}
      onLogClick={handleLogOpen}
      onLogClose={handleLogClose}
      onLogFormChange={setLogForm}
      onLogSave={handleLogSave}
      onStatusOpen={handleStatusOpen}
      onStatusClose={handleStatusClose}
      onNewStatusChange={setNewStatus}
      onStatusUpdate={handleStatusUpdate}
      onLookback={handleLookback}
      onCheckLookback={checkLookbackExists}
    />
  )
}