import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import LookbackSearch from '../../components/service/safety/LookbackSearch'

const INIT_FORM = { donationId: '', componentId: '', patientId: '', reactionId: '' }

export default function LookbackPage() {
  const location = useLocation()

  const [searchType, setSearchType]           = useState('donation')
  const [searchId, setSearchId]               = useState('')
  const [traces, setTraces]                   = useState([])
  const [searchLoading, setSearchLoading]     = useState(false)
  const [showNew, setShowNew]                 = useState(false)
  const [form, setForm]                       = useState(INIT_FORM)
  const [investigateData, setInvestigateData] = useState(null)
  const [investigateLoading, setInvestigateLoading] = useState(false)

  // Auto-open initiate modal when navigated from ReactionsPage with prefill
  // Auto-search when navigated with search state (View Lookback)
  useEffect(() => {
    const prefill = location.state?.prefill
    const search  = location.state?.search

    if (prefill) {
      setForm({
        donationId:  prefill.donationId  ? String(prefill.donationId)  : '',
        componentId: prefill.componentId ? String(prefill.componentId) : '',
        patientId:   prefill.patientId   ? String(prefill.patientId)   : '',
        reactionId:  prefill.reactionId  ? String(prefill.reactionId)  : '',
      })
      setShowNew(true)
      window.history.replaceState({}, '')
    }

    if (search) {
      // Auto-search by patient to show existing lookback
      setSearchType(search.type)
      setSearchId(search.id)
      window.history.replaceState({}, '')
      // Trigger search after state updates
      setTimeout(() => {
        api.get(`/api/safety/lookback/${search.type}/${search.id}`)
          .then(r => {
            const data = r.data?.data ?? r.data ?? []
            setTraces(Array.isArray(data) ? data : [data])
          })
          .catch(() => setTraces([]))
      }, 100)
    }
  }, [location.state])

  const handleSearchTypeChange = (type) => {
    setSearchType(type); setSearchId(''); setTraces([]); setInvestigateData(null)
  }

  const handleSearch = async () => {
    if (!searchId) return
    setSearchLoading(true); setTraces([]); setInvestigateData(null)
    try {
      const r = await api.get(`/api/safety/lookback/${searchType}/${searchId}`)
      const data = r.data?.data ?? r.data ?? []
      setTraces(Array.isArray(data) ? data : [data])
    } catch {
      showError('Trace not found or service unavailable')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleInitiateClick = () => { setForm(INIT_FORM); setShowNew(true) }
  const handleNewClose      = () => { setShowNew(false); setForm(INIT_FORM) }

  const handleInitiate = async () => {
    if (!form.donationId || !form.componentId || !form.patientId) {
      showError('Donation ID, Component ID and Patient ID are all required')
      return
    }
    try {
      await api.post('/api/safety/lookback', {
        donationId:  Number(form.donationId),
        componentId: Number(form.componentId),
        patientId:   Number(form.patientId),
        // Pass reactionId so backend auto-updates reaction status to INVESTIGATING
        reactionId:  form.reactionId ? Number(form.reactionId) : null,
      })
      showSuccess('Lookback trace initiated — reaction status updated to INVESTIGATING')
      handleNewClose()
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to initiate lookback')
    }
  }

  const handleInvestigate = async (donationId) => {
    setInvestigateLoading(true); setInvestigateData(null)
    try {
      const r = await api.get(`/api/safety/lookback-details/${donationId}`)
      setInvestigateData(r.data?.data ?? r.data)
    } catch {
      showError('Could not fetch investigation details.')
    } finally {
      setInvestigateLoading(false)
    }
  }

  return (
    <LookbackSearch
      searchType={searchType} searchId={searchId} traces={traces} searchLoading={searchLoading}
      showNew={showNew} form={form}
      investigateData={investigateData} investigateLoading={investigateLoading}
      onSearchTypeChange={handleSearchTypeChange}
      onSearchIdChange={setSearchId}
      onSearch={handleSearch}
      onInitiateClick={handleInitiateClick}
      onNewClose={handleNewClose}
      onFormChange={setForm}
      onInitiate={handleInitiate}
      onInvestigate={handleInvestigate}
      onInvestigateClose={() => setInvestigateData(null)}
    />
  )
}