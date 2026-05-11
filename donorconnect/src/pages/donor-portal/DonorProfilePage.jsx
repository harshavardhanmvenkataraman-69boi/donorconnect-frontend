import { useState, useEffect } from 'react'
import api from '../../api/axiosInstance'
import { getCurrentUser } from '../../api/authUtils'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import DonorProfile from '../../components/service/donor-portal/Donorprofile.jsx'

export default function DonorProfilePage() {
  const user    = getCurrentUser()
  const donorId = user?.userId || user?.sub

  const [profile,   setProfile]   = useState(null)
  const [showEdit,  setShowEdit]  = useState(false)
  const [showPwd,   setShowPwd]   = useState(false)
  const [form,      setForm]      = useState({})
  const [pwdForm,   setPwdForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [saving,    setSaving]    = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const load = () => {
    if (!donorId) return
    api.get(`/api/donors/${donorId}`).then(r => {
      const d = r.data?.data || r.data
      setProfile(d)
      setForm(d)
    })
  }
  useEffect(load, [donorId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/api/donors/${donorId}`, form)
      showSuccess('Profile updated successfully')
      setShowEdit(false)
      load()
    } catch {
      showError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePwd = async () => {
    if (pwdForm.newPassword !== pwdForm.confirm) {
      showError('Passwords do not match')
      return
    }
    if (pwdForm.newPassword.length < 6) {
      showError('Password must be at least 6 characters')
      return
    }
    setSavingPwd(true)
    try {
      await api.put('/api/auth/change-password', {
        oldPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      })
      showSuccess('Password changed successfully')
      setShowPwd(false)
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch {
      showError('Failed to change password')
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <DonorProfile
      profile={profile}
      showEdit={showEdit}
      showPwd={showPwd}
      form={form}
      pwdForm={pwdForm}
      saving={saving}
      savingPwd={savingPwd}
      onShowEdit={() => setShowEdit(true)}
      onCloseEdit={() => setShowEdit(false)}
      onFormChange={(field, val) => setForm(f => ({ ...f, [field]: val }))}
      onSave={handleSave}
      onTogglePwd={() => setShowPwd(v => !v)}
      onPwdChange={(field, val) => setPwdForm(f => ({ ...f, [field]: val }))}
      onChangePwd={handleChangePwd}
    />
  )
}