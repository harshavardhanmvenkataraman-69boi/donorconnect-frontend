import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosInstance'
import DonorList from '../../components/service/donor/DonorList.jsx'

export default function DonorListPage() {
  const [donors, setDonors]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [bgFilter, setBgFilter]         = useState('')
  const [phoneSearch, setPhoneSearch]   = useState('')   // ← NEW
  const [selectedDonor, setSelectedDonor] = useState(null)
  const debounceRef = useRef(null)
  const navigate    = useNavigate()

  const load = useCallback((s, b, phone) => {
    setLoading(true)
    let url

    if (phone?.trim())  url = `/api/donors/search/phone?phone=${encodeURIComponent(phone.trim())}`
    else if (s?.trim()) url = `/api/donors/search?name=${encodeURIComponent(s.trim())}`
    else if (b)         url = `/api/donors/blood-group/${b}`
    else                url = '/api/donors?page=0&size=20'

    api.get(url)
      .then(r => {
        const data = r.data?.data?.content ?? r.data?.content ?? r.data?.data ?? r.data ?? []
        setDonors(Array.isArray(data) ? data : [])
      })
      .catch(() => setDonors([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load('', '', '') }, [load])

  // Name search — clears phone when typing name
  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearch(val)
    setPhoneSearch('')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(val, bgFilter, ''), 300)
  }

  // Phone search — clears name when typing phone, fires on every keystroke after 300ms pause
  const handlePhoneChange = (e) => {
    const val = e.target.value
    setPhoneSearch(val)
    setSearch('')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (val.trim()) load('', '', val)
      else load('', bgFilter, '')
    }, 300)
  }

  // Blood group — clears phone search
  const handleBgChange = (e) => {
    const val = e.target.value
    setBgFilter(val)
    setPhoneSearch('')
    load(search, val, '')
  }

  return (
    <DonorList
      donors={donors}
      loading={loading}
      search={search}
      bgFilter={bgFilter}
      phoneSearch={phoneSearch}
      selectedDonor={selectedDonor}
      onSearchChange={handleSearchChange}
      onPhoneChange={handlePhoneChange}
      onBgChange={handleBgChange}
      onClearFilters={() => {
        setSearch('')
        setBgFilter('')
        setPhoneSearch('')
        load('', '', '')
      }}
      onRegisterClick={() => navigate('/dashboard/donors/register')}
      onSelectDonor={setSelectedDonor}
      onCloseModal={() => setSelectedDonor(null)}
      onEditDonor={(id) => navigate(`/dashboard/donors/edit/${id}`)}
    />
  )
}