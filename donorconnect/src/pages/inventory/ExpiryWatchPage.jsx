import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import ExpiryWatch from '../../components/service/inventory/ExpiryWatch'
import ComponentDetailDrawer from '../../components/service/inventory/ComponentDetailDrawer'

export default function ExpiryWatchPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('ALL')
  const [actioningId, setActioningId] = useState(null)
  const [drawerComponentId, setDrawerComponentId] = useState(null)

  const load = useCallback((currentTab = tab) => {
    setLoading(true)
    // The backend has a dedicated /open endpoint for unactioned alerts.
    // Use it when the tab demands it; otherwise fetch the full set.
    const url = currentTab === 'OPEN'
      ? '/api/expiry-watch/open'
      : '/api/expiry-watch'

    api.get(url)
      .then(r => {
        const data = r.data?.data ?? r.data ?? []
        setItems(Array.isArray(data) ? data : [])
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => { load(tab) }, [tab, load])

  const handleAction = async (expiryId) => {
    setActioningId(expiryId)
    try {
      await api.patch(`/api/expiry-watch/${expiryId}/action`)
      showSuccess('Marked as actioned')
      load(tab)
    } catch (err) {
      const msg = err.response?.data?.message
                  || err.response?.data?.error
                  || 'Failed to mark as actioned'
      showError(msg)
    } finally {
      setActioningId(null)
    }
  }

  return (
    <>
      <ExpiryWatch
        items={items}
        loading={loading}
        tab={tab}
        actioningId={actioningId}
        onTabChange={setTab}
        onAction={handleAction}
        onView={(row) => setDrawerComponentId(row.componentId)}
      />
      <ComponentDetailDrawer
        componentId={drawerComponentId}
        show={drawerComponentId !== null}
        onClose={() => setDrawerComponentId(null)}
      />
    </>
  )
}
