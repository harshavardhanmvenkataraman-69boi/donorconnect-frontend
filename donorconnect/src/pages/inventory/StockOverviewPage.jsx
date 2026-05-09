import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axiosInstance'
import StockOverview from '../../components/service/inventory/StockOverview'
import ComponentDetailDrawer from '../../components/service/inventory/ComponentDetailDrawer'

export default function StockOverviewPage() {
  const [inventory, setInventory] = useState([])
  const [summary, setSummary] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [bgFilter, setBgFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Drawer state
  const [drawerComponentId, setDrawerComponentId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.allSettled([
      api.get('/api/inventory'),
      api.get('/api/inventory/summary'),
      api.get('/api/inventory/low-stock'),
    ])
      .then(([invRes, sumRes, lsRes]) => {
        const unwrap = (res) => {
          if (res.status !== 'fulfilled') return []
          const d = res.value?.data?.data ?? res.value?.data ?? []
          return Array.isArray(d) ? d : []
        }
        setInventory(unwrap(invRes))
        setSummary(unwrap(sumRes))
        setLowStock(unwrap(lsRes))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <>
      <StockOverview
        inventory={inventory}
        summary={summary}
        lowStock={lowStock}
        loading={loading}
        bgFilter={bgFilter}
        typeFilter={typeFilter}
        onBgFilterChange={setBgFilter}
        onTypeFilterChange={setTypeFilter}
        onClearFilters={() => { setBgFilter(''); setTypeFilter('') }}
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
