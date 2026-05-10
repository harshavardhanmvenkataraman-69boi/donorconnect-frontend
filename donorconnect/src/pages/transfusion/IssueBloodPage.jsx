import { useState } from 'react'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import IssueBloodForm from '../../components/service/transfusion/IssueBloodForm.jsx'

export default function IssueBloodPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (form) => {
    setLoading(true)
    try {
      await api.post('/api/transfusion/issue', {
        componentId: Number(form.componentId),
        patientId: Number(form.patientId),
        issuedBy: form.issuedBy,
        indication: form.indication,
      })
      showSuccess('Blood component issued successfully')
    } catch (err) {
      showError(err.response?.data?.message || 'Issue failed — ensure component is RESERVED')
    } finally {
      setLoading(false)
    }
  }

  return <IssueBloodForm onSubmit={handleSubmit} loading={loading} />
}