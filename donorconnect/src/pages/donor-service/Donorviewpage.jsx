import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axiosInstance'
import { showError } from '../../components/shared/ui/AlertBanner'
import DonorView from '../../components/service/donor/DonorView.jsx'

export default function DonorViewPage() {
  const [donor, setDonor]     = useState(null)
  const [loading, setLoading] = useState(true)
  const { id }    = useParams()
  const navigate  = useNavigate()

  useEffect(() => {
    setLoading(true)
    api.get(`/api/donors/${id}`)
      .then(r => setDonor(r.data?.data || r.data))
      .catch(() => {
        showError('Failed to load donor details')
        navigate('/dashboard/donors')
      })
      .finally(() => setLoading(false))
  }, [id])

  return (
    <DonorView
      donor={donor}
      loading={loading}
      onBack={() => navigate('/dashboard/donors')}
      onEdit={donorId => navigate(`/dashboard/donors/edit/${donorId}`)}
    />
  )
}