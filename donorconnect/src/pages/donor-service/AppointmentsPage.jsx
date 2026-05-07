import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import AppointmentList from '../../components/service/donor/AppointmentList.jsx'

export default function AppointmentsPage() {
  const [tab, setTab]             = useState('today')
  const [appts, setAppts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [drives, setDrives]       = useState([])
  const [showBook, setShowBook]   = useState(false)
  const [viewAppt, setViewAppt]   = useState(null)
  const [confirm, setConfirm]     = useState(null)
  const [actioning, setActioning] = useState(null)
  const [donorSearch, setDonorSearch] = useState('')
  const debounceRef = useRef(null)

  const load = useCallback(() => {
    setLoading(true)
    let url
    if (tab === 'today')     url = '/api/appointments/today'
    else if (tab === 'all')  url = '/api/appointments?page=0&size=50'
    else if (tab === 'donor' && donorSearch.trim()) url = `/api/appointments/donor/${donorSearch.trim()}`
    else { setAppts([]); setLoading(false); return }

    api.get(url)
      .then(r => {
        const data = r.data?.data?.content ?? r.data?.content ?? r.data?.data ?? r.data ?? []
        setAppts(Array.isArray(data) ? data : [])
      })
      .catch(() => setAppts([]))
      .finally(() => setLoading(false))
  }, [tab, donorSearch])

  useEffect(() => { load() }, [tab])

  useEffect(() => {
    api.get('/api/drives').then(r => setDrives(r.data?.data || r.data || [])).catch(() => {})
  }, [])

  const doAction = async (appointmentId, endpoint) => {
    setActioning(`${appointmentId}${endpoint}`)
    try {
      await api.patch(`/api/appointments/${appointmentId}/${endpoint}`)
      showSuccess(`Appointment ${endpoint.replace('-', ' ')}`)
      load()
    } catch (err) {
      showError(err.response?.data?.message || 'Action failed')
    } finally {
      setActioning(null)
    }
  }

  const handleAction = (appointmentId, endpoint, requiresConfirm = false) => {
    if (requiresConfirm) {
      setConfirm({ appointmentId, endpoint })
      setViewAppt(null)
      return
    }
    doAction(appointmentId, endpoint)
  }

  const handleBook = async (form) => {
    const payload = {
      donorId:  Number(form.donorId),
      dateTime: form.dateTime,
      driveId:  form.driveId  ? Number(form.driveId)  : null,
      centerId: form.centerId ? Number(form.centerId) : null,
    }
    try {
      await api.post('/api/appointments', payload)
      showSuccess('Appointment booked successfully')
      setShowBook(false)
      load()
    } catch (err) {
      showError(err.response?.data?.message || 'Booking failed — donor must be ACTIVE with a cleared screening')
    }
  }

  const handleDonorSearchChange = (e) => {
    const val = e.target.value
    setDonorSearch(val)
    clearTimeout(debounceRef.current)
    if (tab === 'donor') {
      debounceRef.current = setTimeout(() => { if (val.trim()) load() }, 400)
    }
  }

  return (
    <AppointmentList
      tab={tab}
      appts={appts}
      loading={loading}
      drives={drives}
      donorSearch={donorSearch}
      actioning={actioning}
      showBook={showBook}
      viewAppt={viewAppt}
      confirm={confirm}
      onTabChange={(key) => { setTab(key); setAppts([]) }}
      onDonorSearchChange={handleDonorSearchChange}
      onDonorSearch={load}
      onAction={handleAction}
      onViewAppt={(row) => row ? setViewAppt(row) : setShowBook(true)}
      onBookClose={() => setShowBook(false)}
      onBookDone={handleBook}
      onViewClose={() => setViewAppt(null)}
      onConfirmClose={() => setConfirm(null)}
      onConfirmDone={() => { doAction(confirm.appointmentId, confirm.endpoint); setConfirm(null) }}
    />
  )
}