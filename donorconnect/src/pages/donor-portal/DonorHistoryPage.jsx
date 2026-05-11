import { useState, useEffect } from 'react'
import api from '../../api/axiosInstance'
import { getCurrentUser } from '../../api/authUtils'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import DonorHistory from '../../components/service/donor-portal/Donorhistory.jsx'

export default function DonorHistoryPage() {
  const user    = getCurrentUser()
  const donorId = user?.userId || user?.sub

  const [appointments, setAppointments] = useState([])
  const [donations,    setDonations]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [tab,          setTab]          = useState('appointments')
  const [confirm,      setConfirm]      = useState(null)

  const load = () => {
    if (!donorId) return
    setLoading(true)
    Promise.allSettled([
      api.get(`/api/appointments/donor/${donorId}`),
      api.get(`/api/donations/donor/${donorId}`),
    ]).then(([a, d]) => {
      setAppointments(a.value?.data?.data?.content || a.value?.data?.content || a.value?.data?.data || [])
      setDonations(d.value?.data?.data || d.value?.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { if (donorId) load() }, [donorId])

  const handleCancelConfirm = async () => {
    try {
      await api.patch(`/api/appointments/${confirm}/cancel`)
      showSuccess('Appointment cancelled')
      setConfirm(null)
      load()
    } catch {
      showError('Failed to cancel appointment')
    }
  }

  return (
    <DonorHistory
      appointments={appointments}
      donations={donations}
      loading={loading}
      tab={tab}
      confirm={confirm}
      onTabChange={setTab}
      onCancelRequest={setConfirm}
      onCancelConfirm={handleCancelConfirm}
      onCancelDismiss={() => setConfirm(null)}
    />
  )
}