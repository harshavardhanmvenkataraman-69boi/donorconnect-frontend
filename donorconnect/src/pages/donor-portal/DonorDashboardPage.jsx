import { useState, useEffect } from 'react'
import api from '../../api/axiosInstance'
import { getCurrentUser } from '../../api/authUtils'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import DonorDashboard from '../../components/service/donor-portal/Donordashboard.jsx'

export default function DonorDashboardPage() {
  const user    = getCurrentUser()
  const donorId = user?.userId || user?.sub

  const [profile,       setProfile]       = useState(null)
  const [appointments,  setAppointments]  = useState([])
  const [notifications, setNotifications] = useState([])
  const [drives,        setDrives]        = useState([])
  const [showBook,      setShowBook]      = useState(false)
  const [bookForm,      setBookForm]      = useState({ donorId: donorId || '', driveId: '', scheduledAt: '' })

  useEffect(() => {
    if (!donorId) return
    Promise.allSettled([
      api.get(`/api/donors/${donorId}`),
      api.get(`/api/appointments/donor/${donorId}`),
      api.get('/api/notifications?page=0&size=3'),
      api.get('/api/drives/upcoming'),
    ]).then(([p, a, n, d]) => {
      setProfile(p.value?.data?.data || p.value?.data)
      setAppointments(a.value?.data?.data?.content || a.value?.data?.content || a.value?.data?.data || [])
      setNotifications(n.value?.data?.data?.content || n.value?.data?.content || n.value?.data?.data || [])
      setDrives(d.value?.data?.data || d.value?.data || [])
    })
  }, [donorId])

  const handleBook = async () => {
    try {
      await api.post('/api/appointments', {
        donorId:     Number(bookForm.donorId),
        driveId:     bookForm.driveId ? Number(bookForm.driveId) : null,
        dateTime:    bookForm.scheduledAt,
      })
      showSuccess('Appointment booked!')
      setShowBook(false)
      setBookForm(f => ({ ...f, driveId: '', scheduledAt: '' }))
      // Refresh appointments
      api.get(`/api/appointments/donor/${donorId}`)
        .then(r => setAppointments(r.data?.data?.content || r.data?.content || r.data?.data || []))
    } catch (e) {
      showError(e.response?.data?.message || 'Booking failed')
    }
  }

  return (
    <DonorDashboard
      profile={profile}
      appointments={appointments}
      notifications={notifications}
      drives={drives}
      showBook={showBook}
      bookForm={bookForm}
      onBookFormChange={(field, val) => setBookForm(f => ({ ...f, [field]: val }))}
      onShowBook={() => setShowBook(true)}
      onCloseBook={() => setShowBook(false)}
      onBook={handleBook}
    />
  )
}