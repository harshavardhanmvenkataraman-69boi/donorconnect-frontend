import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axiosInstance'
import InventoryDashboard from '../../components/service/inventory/InventoryDashboard'
import ComponentDetailDrawer from '../../components/service/inventory/ComponentDetailDrawer'

const ALL_BLOOD_GROUPS = 8 // A+/-, B+/-, AB+/-, O+/-

const rhSign = (rh) => (rh === 'POSITIVE' ? '+' : rh === 'NEGATIVE' ? '−' : '')

const daysUntil = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d)) return null
  const ms = d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.floor(ms / 86400000)
}

const isToday = (iso) => {
  if (!iso) return false
  const d = new Date(iso)
  if (isNaN(d)) return false
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

export default function InventoryDashboardPage() {
  const [inventory, setInventory] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [openExpiry, setOpenExpiry] = useState([])
  const [recentTxns, setRecentTxns] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState(null)
  const [drawerComponentId, setDrawerComponentId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.allSettled([
      api.get('/api/inventory'),
      api.get('/api/inventory/low-stock'),
      api.get('/api/expiry-watch/open'),
      api.get('/api/stock-transactions?page=0&size=50'),
    ])
      .then(([invRes, lsRes, ewRes, txnRes]) => {
        const unwrapList = (res) => {
          if (res.status !== 'fulfilled') return []
          const d = res.value?.data?.data ?? res.value?.data ?? []
          return Array.isArray(d) ? d : []
        }
        const unwrapPaged = (res) => {
          if (res.status !== 'fulfilled') return []
          const payload = res.value?.data?.data ?? res.value?.data ?? {}
          const c = payload.content
          return Array.isArray(c) ? c : (Array.isArray(payload) ? payload : [])
        }

        setInventory(unwrapList(invRes))
        setLowStock(unwrapList(lsRes))
        setOpenExpiry(unwrapList(ewRes))
        setRecentTxns(unwrapPaged(txnRes))
        setLastRefreshed(new Date())
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // -------- Derived metrics --------
  const availableInventory = inventory.filter(i => i.status === 'AVAILABLE')
  const totalUnits = availableInventory.reduce((sum, r) => sum + (r.quantity ?? 0), 0)
  const uniqueBGs = new Set(availableInventory.map(i => `${i.bloodGroup}${i.rhFactor}`).filter(k => k && !k.includes('undefined')))
  const todaysTxnCount = recentTxns.filter(t => isToday(t.createdAt)).length

  // -------- Attention feed (sorted: most-urgent first) --------
  const attentionItems = []

  // Tier 1 — data integrity: inventory items expired but still AVAILABLE
  availableInventory.forEach(i => {
    const days = daysUntil(i.expiryDate)
    if (days !== null && days < 0) {
      attentionItems.push({
        kind: 'integrity',
        id: i.balanceId ?? i.componentId,
        componentId: i.componentId,
        severity: 'error',
        icon: '⚠️',
        title: `${i.bloodGroup}${rhSign(i.rhFactor)} ${(i.componentType ?? '').replace(/_/g, ' ')} expired ${Math.abs(days)}d ago`,
        detail: 'still marked AVAILABLE',
        sortKey: -1000 + days, // most-expired first
      })
    }
  })

  // Tier 2 — expiry watch: OPEN entries within 3 days (or already expired in watch)
  openExpiry.forEach(e => {
    const days = daysUntil(e.expiryDate)
    if (days === null) return
    if (days < 0) {
      attentionItems.push({
        kind: 'expiry',
        id: e.expiryId,
        componentId: e.componentId,
        severity: 'error',
        icon: '⏰',
        title: `Component #${e.componentId} expired ${Math.abs(days)}d ago`,
        detail: 'flagged but unactioned',
        sortKey: -500 + days,
      })
    } else if (days <= 3) {
      attentionItems.push({
        kind: 'expiry',
        id: e.expiryId,
        componentId: e.componentId,
        severity: 'warning',
        icon: '⏰',
        title: `Component #${e.componentId} ${days === 0 ? 'expires today' : `expires in ${days}d`}`,
        detail: 'action required',
        sortKey: days,
      })
    }
  })

  // Tier 3 — low stock
  lowStock.forEach(l => {
    attentionItems.push({
      kind: 'lowstock',
      id: l.balanceId ?? `${l.bloodGroup}-${l.componentType}`,
      componentId: l.componentId,
      severity: l.quantity === 0 ? 'error' : 'warning',
      icon: '📉',
      title: `${l.bloodGroup}${rhSign(l.rhFactor)} ${(l.componentType ?? '').replace(/_/g, ' ')} low`,
      detail: `${l.quantity ?? 0} unit(s) left`,
      sortKey: 100 + (l.quantity ?? 0),
    })
  })

  attentionItems.sort((a, b) => a.sortKey - b.sortKey)

  return (
    <>
      <InventoryDashboard
        loading={loading}
        totalUnits={totalUnits}
        bloodGroupsInStock={uniqueBGs.size}
        totalBloodGroups={ALL_BLOOD_GROUPS}
        lowStockCount={lowStock.length}
        expiryAlertCount={openExpiry.length}
        todaysTxnCount={todaysTxnCount}
        attentionItems={attentionItems}
        lastRefreshed={lastRefreshed}
        onRefresh={load}
        onViewItem={(componentId) => setDrawerComponentId(componentId)}
      />
      <ComponentDetailDrawer
        componentId={drawerComponentId}
        show={drawerComponentId !== null}
        onClose={() => setDrawerComponentId(null)}
      />
    </>
  )
}
