import { useState, useEffect } from 'react'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import CrossmatchList from '../../components/service/transfusion/CrossmatchList.jsx'

const INIT_FORM = { patientId:'', bloodGroup:'O', rhFactor:'POSITIVE', requiredUnits:1, priority:'ROUTINE', orderBy:'', componentType:'PRBC', notes:'' }
const INIT_RESULT = { requestId:'', componentId:'', compatibility:'COMPATIBLE', testedBy:'' }

export default function CrossmatchPage() {
  const [tab, setTab] = useState('pending')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [patientIdFilter, setPatientIdFilter] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showResult, setShowResult] = useState(null)
  const [form, setForm] = useState(INIT_FORM)
  const [resultForm, setResultForm] = useState(INIT_RESULT)

  const load = (patientId) => {
    setLoading(true)
    const url = patientId
      ? `/api/transfusion/crossmatch/requests/patient/${patientId}`
      : tab === 'pending'
        ? '/api/transfusion/crossmatch/requests/pending'
        : '/api/transfusion/crossmatch/requests?page=0&size=50'
    api.get(url).then(r => { 
      const data = r.data?.data
      let fetchedData = data?.content ?? (Array.isArray(data) ? data : [])
      if (tab === 'pending') {
        fetchedData = fetchedData.sort((a, b) => {
          // STAT has higher priority
          if (a.priority === 'STAT' && b.priority !== 'STAT') return -1
          if (a.priority !== 'STAT' && b.priority === 'STAT') return 1
          // Then sort by date ascending (earliest first)
          const dateA = new Date(a.requestDate)
          const dateB = new Date(b.requestDate)
          return dateA - dateB
        })
      }
      setRequests(fetchedData)
    }).catch(() => setRequests([])).finally(() => setLoading(false))
  }
  useEffect(load, [tab])
  
  // // Auto-refresh every 10 seconds to show updated statuses
  // useEffect(() => {
  //   const interval = setInterval(load, 10000)
  //   return () => clearInterval(interval)
  // }, [tab])

  const create = async () => {
    try {
      await api.post('/api/transfusion/crossmatch/requests', { ...form, patientId:Number(form.patientId), requiredUnits:Number(form.requiredUnits) })
      showSuccess('Crossmatch request created'); setShowNew(false); setForm(INIT_FORM); load()
    } catch (e) { showError(e.response?.data?.message || 'Failed') }
  }

  const submitResult = async () => {
    if (!resultForm.testedBy.trim()) { showError('Tested By is required'); return }
    try {
      await api.post('/api/transfusion/crossmatch/results', { ...resultForm, requestId:Number(resultForm.requestId), componentId:Number(resultForm.componentId) })
      showSuccess('Result recorded'); setShowResult(null); setResultForm(INIT_RESULT); load()
    } catch (e) { showError(e.response?.data?.message || 'Failed') }
  }

  const searchByPatient = () => {
    if (!patientIdFilter) {
      load()
      return
    }
    load(Number(patientIdFilter))
  }

  const clearPatientSearch = () => {
    setPatientIdFilter('')
    load()
  }

  return (
    <CrossmatchList
      tab={tab} requests={requests} loading={loading}
      showNew={showNew} showResult={showResult} form={form} resultForm={resultForm}
      patientIdFilter={patientIdFilter}
      onPatientIdFilterChange={setPatientIdFilter}
      onSearchByPatient={searchByPatient}
      onClearPatientSearch={clearPatientSearch}
      onTabChange={setTab} onNewClick={() => setShowNew(true)} onNewClose={() => setShowNew(false)}
      onFormChange={setForm} onCreate={create}
      onResultClose={() => { setShowResult(null); setResultForm(INIT_RESULT) }}
      onResultFormChange={setResultForm} onSubmitResult={submitResult}
      onRecordResult={row => { setShowResult(row); setResultForm({ requestId:row.requestId, componentId:row.availableComponentIds?.split(',').filter(Boolean)[0]?.trim()||'', compatibility:'COMPATIBLE', testedBy:'' }) }}
    />
  )
}
