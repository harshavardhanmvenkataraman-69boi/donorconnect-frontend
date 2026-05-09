import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import StockTransactions from '../../components/service/inventory/StockTransactions'
import ComponentDetailDrawer from '../../components/service/inventory/ComponentDetailDrawer'

const PAGE_SIZE = 20

const INIT_FORM = {
  componentId: '',
  txnType: 'RECEIPT',
  quantity: '',
  txnDate: '',
  referenceId: '',
  notes: '',
}

export default function StockTransactionsPage() {
  const [txns, setTxns] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Modal + form state
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...INIT_FORM })
  const [saving, setSaving] = useState(false)

  // Live balance lookup for the entered componentId
  const [componentBalance, setComponentBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  // Drawer state for clicking a row
  const [drawerComponentId, setDrawerComponentId] = useState(null)

  const loadTxns = useCallback((currentPage = page, currentType = typeFilter) => {
    setLoading(true)
    const url = currentType
      ? `/api/stock-transactions/type/${currentType}`
      : `/api/stock-transactions?page=${currentPage}&size=${PAGE_SIZE}`

    api.get(url)
      .then(r => {
        const payload = r.data?.data ?? r.data ?? {}
        if (Array.isArray(payload)) {
          setTxns(payload)
          setHasMore(false)
        } else {
          const content = payload.content ?? []
          setTxns(Array.isArray(content) ? content : [])
          if (typeof payload.last === 'boolean') setHasMore(!payload.last)
          else setHasMore(content.length === PAGE_SIZE)
        }
      })
      .catch(() => { setTxns([]); setHasMore(false) })
      .finally(() => setLoading(false))
  }, [page, typeFilter])

  useEffect(() => {
    setPage(0)
    loadTxns(0, typeFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter])

  useEffect(() => {
    if (!typeFilter) loadTxns(page, '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  // Debounced balance lookup whenever componentId changes
  useEffect(() => {
    if (!showModal) return
    const id = form.componentId?.toString().trim()
    if (!id || Number(id) < 1) {
      setComponentBalance(null)
      setBalanceLoading(false)
      return
    }

    setBalanceLoading(true)
    const handle = setTimeout(() => {
      api.get(`/api/inventory/component/${id}`)
        .then(r => {
          const data = r.data?.data ?? r.data ?? null
          setComponentBalance(data)
        })
        .catch(() => setComponentBalance(null))
        .finally(() => setBalanceLoading(false))
    }, 350) // debounce typing

    return () => clearTimeout(handle)
  }, [form.componentId, showModal])

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    if (!form.componentId || Number(form.componentId) < 1) {
      showError('Component ID is required')
      return false
    }
    if (!form.txnType) {
      showError('Transaction type is required')
      return false
    }
    if (!form.quantity || Number(form.quantity) < 1) {
      showError('Quantity must be at least 1')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        componentId: Number(form.componentId),
        txnType: form.txnType,
        quantity: Number(form.quantity),
        txnDate: form.txnDate || null,
        referenceId: form.referenceId.trim() || null,
        notes: form.notes.trim() || null,
      }
      await api.post('/api/stock-transactions', payload)
      showSuccess('Transaction recorded')
      setShowModal(false)
      setForm({ ...INIT_FORM })
      setComponentBalance(null)
      loadTxns(page, typeFilter)
    } catch (err) {
      // Backend returns specific messages for 404 / 409 — surface them
      const msg = err.response?.data?.message
                  || err.response?.data?.error
                  || 'Failed to record transaction'
      showError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <StockTransactions
        txns={txns}
        loading={loading}
        typeFilter={typeFilter}
        page={page}
        pageSize={PAGE_SIZE}
        hasMore={hasMore}
        showModal={showModal}
        form={form}
        saving={saving}
        componentBalance={componentBalance}
        balanceLoading={balanceLoading}
        onTypeFilterChange={setTypeFilter}
        onPrevPage={() => setPage(p => Math.max(0, p - 1))}
        onNextPage={() => setPage(p => p + 1)}
        onOpenModal={() => {
          setForm({ ...INIT_FORM })
          setComponentBalance(null)
          setShowModal(true)
        }}
        onCloseModal={() => {
          setShowModal(false)
          setComponentBalance(null)
        }}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
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
