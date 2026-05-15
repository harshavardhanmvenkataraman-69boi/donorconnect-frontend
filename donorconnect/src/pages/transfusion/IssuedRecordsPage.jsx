import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import IssuedRecordList from '../../components/service/transfusion/IssuedRecordList.jsx'

const PAGE_SIZE = 10

export default function IssuedRecordsPage() {
  const [records, setRecords]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [confirm, setConfirm]       = useState(null)
  const [reactModal, setReactModal] = useState(null)

  // Pagination state
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const navigate = useNavigate()

  const load = (currentPage = 0) => {
    setLoading(true)
    api.get(`/api/transfusion/issue?page=${currentPage}&size=${PAGE_SIZE}`)
      .then(r => {
        const data = r.data?.data
        if (data?.content) {
          setRecords(data.content)
          setTotalPages(data.totalPages ?? 0)
          setTotalElements(data.totalElements ?? 0)
        } else {
          const list = Array.isArray(data) ? data : []
          setRecords(list)
          setTotalPages(1)
          setTotalElements(list.length)
        }
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(0), [])

  const handlePageChange = (newPage) => {
    setPage(newPage)
    load(newPage)
  }

  const handleReturn        = (issueId) => setConfirm(issueId)
  const handleReturnDismiss = () => setConfirm(null)

  const handleReturnConfirm = async (issueId) => {
    setConfirm(null)
    try {
      await api.patch(`/api/transfusion/issue/${issueId}/return`)
      showSuccess('Unit returned successfully')
      load(page)
    } catch (e) {
      showError(e.response?.data?.message || 'Return failed')
    }
  }

  const handleViewReactions = async (patientId) => {
    try {
      const r = await api.get(`/api/safety/reactions/patient/${patientId}`)
      const data = r.data?.data ?? r.data ?? []
      setReactModal(Array.isArray(data) ? data : [])
    } catch {
      setReactModal([])
    }
  }

  const handleLogReaction = ({ issueId, patientId }) => {
    navigate('/dashboard/reactions', {
      state: { prefill: { issueId, patientId } }
    })
  }

  return (
    <IssuedRecordList
      records={records}
      loading={loading}
      confirm={confirm}
      reactModal={reactModal}
      page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      pageSize={PAGE_SIZE}
      onPageChange={handlePageChange}
      onReturn={handleReturn}
      onReturnDismiss={handleReturnDismiss}
      onReturnConfirm={handleReturnConfirm}
      onViewReactions={handleViewReactions}
      onReactClose={() => setReactModal(null)}
      onLogReaction={handleLogReaction}
    />
  )
}