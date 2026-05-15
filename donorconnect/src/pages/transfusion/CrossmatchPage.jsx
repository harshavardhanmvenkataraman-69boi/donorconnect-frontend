import { useState, useEffect } from 'react'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import CrossmatchList from '../../components/service/transfusion/CrossmatchList.jsx'

const INIT_FORM   = { patientId:'', bloodGroup:'O', rhFactor:'POSITIVE', requiredUnits:1, priority:'ROUTINE', orderBy:'', componentType:'PRBC', notes:'' }
const INIT_RESULT = { requestId:'', componentId:'', compatibility:'COMPATIBLE', testedBy:'' }
const PAGE_SIZE   = 10

export default function CrossmatchPage() {
  const [tab, setTab]               = useState('pending')
  const [requests, setRequests]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [patientIdFilter, setPatientIdFilter] = useState('')
  const [patientError, setPatientError]       = useState('')
  const [showNew, setShowNew]       = useState(false)
  const [showResult, setShowResult] = useState(null)
  const [form, setForm]             = useState(INIT_FORM)
  const [resultForm, setResultForm] = useState(INIT_RESULT)

  // Pagination state
  const [page, setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const load = (patientId, currentPage = 0) => {
    setLoading(true)
    let url

    if (patientId) {
      // Patient search — no pagination (returns list)
      url = `/api/transfusion/crossmatch/requests/patient/${patientId}`
    } else if (tab === 'pending') {
      url = '/api/transfusion/crossmatch/requests/pending'
    } else {
      url = `/api/transfusion/crossmatch/requests?page=${currentPage}&size=${PAGE_SIZE}`
    }

    api.get(url)
      .then(r => {
        const data = r.data?.data
        let fetchedData

        if (data?.content) {
          // Paginated response
          fetchedData = data.content
          setTotalPages(data.totalPages ?? 0)
          setTotalElements(data.totalElements ?? 0)
        } else {
          fetchedData = Array.isArray(data) ? data : []
          setTotalPages(1)
          setTotalElements(fetchedData.length)
        }

        if (tab === 'pending') {
          fetchedData = fetchedData.sort((a, b) => {
            if (a.priority === 'STAT' && b.priority !== 'STAT') return -1
            if (a.priority !== 'STAT' && b.priority === 'STAT') return 1
            return new Date(a.requestDate) - new Date(b.requestDate)
          })
        }

        setRequests(fetchedData)
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { setPage(0); load(null, 0) }, [tab])

  const handlePageChange = (newPage) => {
    setPage(newPage)
    load(null, newPage)
  }

  const create = async () => {
    try {
      await api.post('/api/transfusion/crossmatch/requests', {
        ...form, patientId: Number(form.patientId), requiredUnits: Number(form.requiredUnits)
      })
      showSuccess('Crossmatch request created')
      setShowNew(false); setForm(INIT_FORM)
      load(null, page)
    } catch (e) { showError(e.response?.data?.message || 'Failed') }
  }

  const submitResult = async () => {
    if (!resultForm.testedBy.trim()) { showError('Tested By is required'); return }
    try {
      await api.post('/api/transfusion/crossmatch/results', {
        ...resultForm,
        requestId:   Number(resultForm.requestId),
        componentId: Number(resultForm.componentId),
      })
      showSuccess('Result recorded')
      setShowResult(null); setResultForm(INIT_RESULT)
      load(null, page)
    } catch (e) { showError(e.response?.data?.message || 'Failed') }
  }

  const searchByPatient = () => {
    if (!patientIdFilter) { load(null, 0); return }
    setPatientError('')
    load(Number(patientIdFilter), 0)
  }

  const clearPatientSearch = () => {
    setPatientIdFilter('')
    setPatientError('')
    setPage(0)
    load(null, 0)
  }

  return (
    <CrossmatchList
      tab={tab} requests={requests} loading={loading}
      showNew={showNew} showResult={showResult} form={form} resultForm={resultForm}
      patientIdFilter={patientIdFilter} patientError={patientError}
      page={page} totalPages={totalPages} totalElements={totalElements} pageSize={PAGE_SIZE}
      onPageChange={handlePageChange}
      onPatientIdFilterChange={setPatientIdFilter}
      onSearchByPatient={searchByPatient}
      onClearPatientSearch={clearPatientSearch}
      onTabChange={t => { setTab(t); setPage(0) }}
      onNewClick={() => setShowNew(true)}
      onNewClose={() => setShowNew(false)}
      onFormChange={setForm} onCreate={create}
      onResultClose={() => { setShowResult(null); setResultForm(INIT_RESULT) }}
      onResultFormChange={setResultForm} onSubmitResult={submitResult}
      onRecordResult={row => {
        setShowResult(row)
        setResultForm({
          requestId:     row.requestId,
          componentId:   row.availableComponentIds?.split(',').filter(Boolean)[0]?.trim() || '',
          compatibility: 'COMPATIBLE',
          testedBy:      '',
        })
      }}
    />
  )
}