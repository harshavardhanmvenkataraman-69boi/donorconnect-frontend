import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import DeferralList from '../../components/service/donor/DeferralList.jsx'

const INIT_FORM = { donorId: '', deferralType: 'TEMPORARY', reason: '' }

const TABS = [
  { key: 'ACTIVE',  endpoint: '/api/deferrals/active'  },
  { key: 'EXPIRED', endpoint: '/api/deferrals/expired' },
  { key: 'DONOR',   endpoint: null                     },
]

export default function DeferralsPage() {
  const [deferrals, setDeferrals]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState('ACTIVE')
  const [donorIdSearch, setDonorIdSearch] = useState('')
  const [viewRecord, setViewRecord] = useState(null)
  const [editRecord, setEditRecord] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ ...INIT_FORM })
  const [editForm,   setEditForm]   = useState({ ...INIT_FORM })
  const [saving, setSaving]         = useState(false)
  const [lifting, setLifting]       = useState(false)

  const load = useCallback((currentTab = tab, donorId = donorIdSearch) => {
    setLoading(true)
    let url
    if (currentTab === 'DONOR') {
      if (!donorId.trim()) { setDeferrals([]); setLoading(false); return }
      url = `/api/deferrals/donor/${donorId.trim()}`
    } else {
      url = TABS.find(t => t.key === currentTab)?.endpoint
    }
    if (!url) { setLoading(false); return }
    api.get(url)
      .then(r => setDeferrals(r.data?.data || r.data || []))
      .catch(() => setDeferrals([]))
      .finally(() => setLoading(false))
  }, [tab, donorIdSearch])

  useEffect(() => { load(tab) }, [tab])

  const handleSaveCreate = async () => {
    if (!createForm.donorId) { showError('Donor ID is required'); return }
    if (!createForm.reason.trim()) { showError('Reason is required'); return }
    setSaving(true)
    try {
      await api.post('/api/deferrals', { donorId: Number(createForm.donorId), deferralType: createForm.deferralType, reason: createForm.reason.trim() })
      showSuccess('Deferral issued — donor status set to DEFERRED')
      setShowCreate(false)
      setCreateForm({ ...INIT_FORM })
      load(tab)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save deferral')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editForm.reason.trim()) { showError('Reason is required'); return }
    setSaving(true)
    try {
      await api.put(`/api/deferrals/${editRecord.id}`, { donorId: Number(editForm.donorId), deferralType: editForm.deferralType, reason: editForm.reason.trim() })
      showSuccess('Deferral updated')
      setEditRecord(null)
      load(tab)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save deferral')
    } finally {
      setSaving(false)
    }
  }

  const handleLift = async (deferralId) => {
    setLifting(true)
    try {
      await api.patch(`/api/deferrals/${deferralId}/lift`)
      showSuccess('Deferral lifted — donor restored to ACTIVE if no other active deferrals remain')
      setViewRecord(null)
      load(tab)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to lift deferral')
    } finally {
      setLifting(false)
    }
  }

  const openEdit = (row) => {
    setEditForm({ donorId: row.donorId, deferralType: row.deferralType || 'TEMPORARY', reason: row.reason || '' })
    setEditRecord({ record: row, id: row.deferralId })
  }

  return (
    <DeferralList
      deferrals={deferrals}
      loading={loading}
      tab={tab}
      donorIdSearch={donorIdSearch}
      viewRecord={viewRecord}
      editRecord={editRecord}
      showCreate={showCreate}
      createForm={createForm}
      setCreateForm={setCreateForm}
      editForm={editForm}
      setEditForm={setEditForm}
      saving={saving}
      lifting={lifting}
      onTabChange={(key) => { setTab(key); setDeferrals([]) }}
      onDonorSearchChange={e => setDonorIdSearch(e.target.value)}
      onDonorSearch={() => load('DONOR', donorIdSearch)}
      onViewRecord={setViewRecord}
      onCloseView={() => setViewRecord(null)}
      onEditFromView={() => { openEdit(viewRecord); setViewRecord(null) }}
      onEditRecord={openEdit}
      onCloseEdit={() => setEditRecord(null)}
      onShowCreate={() => { setCreateForm({ ...INIT_FORM }); setShowCreate(true) }}
      onCloseCreate={() => setShowCreate(false)}
      onSaveCreate={handleSaveCreate}
      onSaveEdit={handleSaveEdit}
      onLift={handleLift}
      onLiftInline={async (row) => {
        if (window.confirm(`Lift deferral #${row.deferralId}? This will restore the donor to ACTIVE.`)) {
          await handleLift(row.deferralId)
        }
      }}
    />
  )
}