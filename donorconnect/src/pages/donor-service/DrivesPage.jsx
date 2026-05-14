import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axiosInstance'
import { getRole } from '../../api/authUtils'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import DriveList from '../../components/service/donor/DriveList.jsx'

const INIT_DRIVE_FORM = { name: '', location: '', scheduledDate: '', capacity: '', organizer: '' }
const INIT_BOOK_FORM  = { donorId: '', dateTime: '', centerId: '' }

export default function DrivesPage() {
  const [drives, setDrives]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('ALL')
  const isAdmin = getRole() === 'ROLE_ADMIN'

  const [showCreate, setShowCreate]   = useState(false)
  const [editDrive, setEditDrive]     = useState(null)
  const [statusDrive, setStatusDrive] = useState(null)
  const [apptDrive, setApptDrive]     = useState(null)

  const [driveForm, setDriveForm]         = useState({ ...INIT_DRIVE_FORM })
  const [savingDrive, setSavingDrive]     = useState(false)
  const [savingEdit, setSavingEdit]       = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(null)

  const [appointments, setAppointments]     = useState([])
  const [loadingAppts, setLoadingAppts]     = useState(false)
  const [apptActioning, setApptActioning]   = useState(null)
  const [showBookAppt, setShowBookAppt]     = useState(false)
  const [bookApptForm, setBookApptForm]     = useState({ ...INIT_BOOK_FORM })
  const [savingBookAppt, setSavingBookAppt] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const url = tab === 'UPCOMING' ? '/api/drives/upcoming' : '/api/drives'
    api.get(url)
      .then(r => setDrives(r.data?.data || r.data || []))
      .catch(() => setDrives([]))
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => { load() }, [load])

  const loadAppts = useCallback((driveId) => {
    setLoadingAppts(true)
    api.get(`/api/drives/${driveId}/appointments`)
      .then(r => setAppointments(r.data?.data || r.data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoadingAppts(false))
  }, [])

  const validateDriveForm = (form) => {
    if (!form.name.trim())   { showError('Drive name is required'); return false }
    if (!form.scheduledDate) { showError('Scheduled date is required'); return false }
    return true
  }
  const buildDrivePayload = (form) => ({
    name: form.name.trim(),
    location: form.location.trim() || null,
    scheduledDate: form.scheduledDate,
    capacity: form.capacity ? Number(form.capacity) : null,
    organizer: form.organizer.trim() || null,
  })

  const handleSaveDrive = async () => {
    if (!validateDriveForm(driveForm)) return
    setSavingDrive(true)
    try {
      await api.post('/api/drives', buildDrivePayload(driveForm))
      showSuccess('Drive created successfully')
      setShowCreate(false); setDriveForm({ ...INIT_DRIVE_FORM }); load()
    } catch (err) { showError(err.response?.data?.message || 'Failed to create drive') }
    finally { setSavingDrive(false) }
  }

  const handleSaveEdit = async () => {
    if (!validateDriveForm(driveForm)) return
    setSavingEdit(true)
    try {
      await api.put(`/api/drives/${editDrive.driveId}`, buildDrivePayload(driveForm))
      showSuccess('Drive updated successfully')
      setEditDrive(null); load()
    } catch (err) { showError(err.response?.data?.message || 'Failed to update drive') }
    finally { setSavingEdit(false) }
  }

  const handleUpdateStatus = async (newStatus) => {
    setStatusUpdating(newStatus)
    try {
      await api.patch(`/api/drives/${statusDrive.driveId}/status?status=${newStatus}`)
      showSuccess(`Drive status updated to ${newStatus}`)
      setStatusDrive(null); load()
    } catch (err) { showError(err.response?.data?.message || 'Failed to update status') }
    finally { setStatusUpdating(null) }
  }

  const handleApptAction = async (apptId, endpoint) => {
    setApptActioning(apptId + endpoint)
    try {
      await api.patch(`/api/appointments/${apptId}/${endpoint}`)
      showSuccess('Appointment updated')
      loadAppts(apptDrive.driveId)
    } catch (err) { showError(err.response?.data?.message || 'Action failed') }
    finally { setApptActioning(null) }
  }

  const handleBookAppt = async () => {
    if (!bookApptForm.donorId)  { showError('Donor ID is required'); return }
    if (!bookApptForm.dateTime) { showError('Date & time is required'); return }
    setSavingBookAppt(true)
    try {
      await api.post('/api/appointments', {
        donorId:  Number(bookApptForm.donorId),
        dateTime: bookApptForm.dateTime,
        driveId:  Number(apptDrive.driveId),
        centerId: bookApptForm.centerId ? Number(bookApptForm.centerId) : null,
      })
      showSuccess('Appointment booked successfully')
      setShowBookAppt(false); setBookApptForm({ ...INIT_BOOK_FORM })
      loadAppts(apptDrive.driveId)
    } catch (err) { showError(err.response?.data?.message || 'Booking failed') }
    finally { setSavingBookAppt(false) }
  }

  const displayDrives = (tab === 'ALL' || tab === 'UPCOMING')
    ? drives
    : drives.filter(d => d.status === tab)

  return (
    <DriveList
      drives={drives}
      loading={loading}
      tab={tab}
      displayDrives={displayDrives}
      isAdmin={isAdmin}
      showCreate={showCreate}
      editDrive={editDrive}
      statusDrive={statusDrive}
      apptDrive={apptDrive}
      appointments={appointments}
      loadingAppts={loadingAppts}
      driveForm={driveForm}
      setDriveForm={setDriveForm}
      statusUpdating={statusUpdating}
      apptActioning={apptActioning}
      showBookAppt={showBookAppt}
      bookApptForm={bookApptForm}
      setBookApptForm={setBookApptForm}
      savingBookAppt={savingBookAppt}
      savingDrive={savingDrive}
      savingEdit={savingEdit}
      onTabChange={setTab}
      onShowCreate={() => { setDriveForm({ ...INIT_DRIVE_FORM }); setShowCreate(true) }}
      onCloseCreate={() => setShowCreate(false)}
      onSaveDrive={handleSaveDrive}
      onEditDrive={(row) => {
        setDriveForm({ name: row.name || '', location: row.location || '', scheduledDate: row.scheduledDate || '', capacity: row.capacity ?? '', organizer: row.organizer || '' })
        setEditDrive(row)
      }}
      onCloseEdit={() => setEditDrive(null)}
      onSaveEdit={handleSaveEdit}
      onStatusDrive={setStatusDrive}
      onCloseStatus={() => setStatusDrive(null)}
      onUpdateStatus={handleUpdateStatus}
      onApptDrive={(row) => { setApptDrive(row); loadAppts(row.driveId) }}
      onCloseAppts={() => { setApptDrive(null); setAppointments([]) }}
      onApptAction={handleApptAction}
      onToggleBookAppt={(show) => { setShowBookAppt(show ?? !showBookAppt); if (!show) setBookApptForm({ ...INIT_BOOK_FORM }) }}
      onBookAppt={handleBookAppt}
    />
  )
}