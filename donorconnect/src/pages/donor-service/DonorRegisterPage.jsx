// import { useState, useEffect } from 'react'
// import { useNavigate, useParams } from 'react-router-dom'
// import api from '../../api/axiosInstance'
// import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
// import DonorForm from '../../components/service/donor/DonorForm.jsx'

// const EMPTY_ADDRESS = { street: '', city: '', state: '', pincode: '' }
// const INIT_FORM = {
//   name: '', dob: '', gender: 'MALE', bloodGroup: 'O',
//   rhFactor: 'POSITIVE', contactInfo: '', donorType: 'VOLUNTARY',
// }

// const parseAddress = (raw) => {
//   if (!raw) return { ...EMPTY_ADDRESS }
//   try { return { ...EMPTY_ADDRESS, ...JSON.parse(raw) } }
//   catch { return { ...EMPTY_ADDRESS } }
// }

// export default function DonorRegisterPage() {
//   const [form, setForm]       = useState({ ...INIT_FORM })
//   const [address, setAddress] = useState({ ...EMPTY_ADDRESS })
//   const [loading, setLoading] = useState(false)
//   const [fetching, setFetching] = useState(false)

//   const { id }   = useParams()
//   const navigate = useNavigate()
//   const isEdit   = !!id

//   useEffect(() => {
//     if (!isEdit) return
//     setFetching(true)
//     api.get(`/api/donors/${id}`)
//       .then(r => {
//         const d = r.data?.data || r.data
//         setForm({
//           name:        d.name        ?? '',
//           dob:         d.dob         ?? '',
//           gender:      d.gender      ?? 'MALE',
//           bloodGroup:  d.bloodGroup  ?? 'O',
//           rhFactor:    d.rhFactor    ?? 'POSITIVE',
//           contactInfo: d.contactInfo ?? '',
//           donorType:   d.donorType   ?? 'VOLUNTARY',
//         })
//         setAddress(parseAddress(d.addressJson))
//       })
//       .catch(() => showError('Failed to load donor details'))
//       .finally(() => setFetching(false))
//   }, [id, isEdit])

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (form.contactInfo && !/^\+?[\d\s\-()]{7,15}$/.test(form.contactInfo)) {
//       showError('Contact info must be a valid phone number'); return
//     }
//     setLoading(true)
//     try {
//       const payload = { ...form, addressJson: JSON.stringify(address) }
//       if (isEdit) await api.put(`/api/donors/${id}`, payload)
//       else        await api.post('/api/donors', payload)
//       showSuccess(`Donor ${isEdit ? 'updated' : 'registered'} successfully`)
//       navigate('/dashboard/donors')
//     } catch (err) {
//       showError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'register'} donor`)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <DonorForm
//       donorId={id}
//       form={form}
//       address={address}
//       loading={loading}
//       fetching={fetching}
//       onFormChange={(key, val) => setForm(f => ({ ...f, [key]: val }))}
//       onAddressChange={(key, val) => setAddress(a => ({ ...a, [key]: val }))}
//       onSubmit={handleSubmit}
//       onCancel={() => navigate('/dashboard/donors')}
//     />
//   )
// }

  import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axiosInstance'
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner'
import DonorForm, { validatePhone, validatePincode } from '../../components/service/donor/DonorForm.jsx'

const EMPTY_ADDRESS = { street: '', city: '', state: '', pincode: '' }
const INIT_FORM = {
  name: '', dob: '', gender: 'MALE', bloodGroup: 'O',
  rhFactor: 'POSITIVE', contactInfo: '', donorType: 'VOLUNTARY',
}

const parseAddress = (raw) => {
  if (!raw) return { ...EMPTY_ADDRESS }
  try { return { ...EMPTY_ADDRESS, ...JSON.parse(raw) } }
  catch { return { ...EMPTY_ADDRESS } }
}

export default function DonorRegisterPage() {
  const [form, setForm]       = useState({ ...INIT_FORM })
  const [address, setAddress] = useState({ ...EMPTY_ADDRESS })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = !!id

  useEffect(() => {
    if (!isEdit) return
    setFetching(true)
    api.get(`/api/donors/${id}`)
      .then(r => {
        const d = r.data?.data || r.data
        setForm({
          name:        d.name        ?? '',
          dob:         d.dob         ?? '',
          gender:      d.gender      ?? 'MALE',
          bloodGroup:  d.bloodGroup  ?? 'O',
          rhFactor:    d.rhFactor    ?? 'POSITIVE',
          contactInfo: d.contactInfo ?? '',
          donorType:   d.donorType   ?? 'VOLUNTARY',
        })
        setAddress(parseAddress(d.addressJson))
      })
      .catch(() => showError('Failed to load donor details'))
      .finally(() => setFetching(false))
  }, [id, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Phone validation — must be valid Indian mobile number
    const phoneErr = validatePhone(form.contactInfo)
    if (phoneErr) { showError(phoneErr); return }

    // Pincode validation — must be valid Indian pincode
    const pincodeErr = validatePincode(address.pincode)
    if (pincodeErr) { showError(pincodeErr); return }

    setLoading(true)
    try {
      const payload = { ...form, addressJson: JSON.stringify(address) }
      if (isEdit) await api.put(`/api/donors/${id}`, payload)
      else        await api.post('/api/donors', payload)
      showSuccess(`Donor ${isEdit ? 'updated' : 'registered'} successfully`)
      navigate('/dashboard/donors')
    } catch (err) {
      showError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'register'} donor`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DonorForm
      donorId={id}
      form={form}
      address={address}
      loading={loading}
      fetching={fetching}
      onFormChange={(key, val) => setForm(f => ({ ...f, [key]: val }))}
      onAddressChange={(key, val) => setAddress(a => ({ ...a, [key]: val }))}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/dashboard/donors')}
    />
  )
}