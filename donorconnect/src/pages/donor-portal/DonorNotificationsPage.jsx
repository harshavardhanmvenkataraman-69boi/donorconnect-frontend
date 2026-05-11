import { useState, useEffect } from 'react'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import DonorNotifications from '../../components/service/donor-portal/Donornotifications.jsx'

export default function DonorNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [tab,           setTab]           = useState('ALL')

  const load = () => {
    setLoading(true)
    api.get('/api/notifications')
      .then(r => setNotifications(r.data?.data?.content || r.data?.content || r.data?.data || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`)
      showSuccess('Marked as read')
      load()
    } catch {
      showError('Failed to mark as read')
    }
  }

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length

  return (
    <DonorNotifications
      notifications={notifications}
      loading={loading}
      tab={tab}
      unreadCount={unreadCount}
      onTabChange={setTab}
      onMarkRead={handleMarkRead}
    />
  )
}