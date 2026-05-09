import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosInstance'
import DonorList from '../../components/service/donor/DonorList.jsx'

export default function DonorListPage() {
  const [donors, setDonors]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [bgFilter, setBgFilter]   = useState('')
  const [selectedDonor, setSelectedDonor] = useState(null)
  const debounceRef = useRef(null)
  const navigate    = useNavigate()

  const load = useCallback((s, b) => {
    setLoading(true)
    let url
    if (s?.trim())  url = `/api/donors/search?name=${encodeURIComponent(s.trim())}`
    else if (b)     url = `/api/donors/blood-group/${b}`
    else            url = '/api/donors?page=0&size=20'

    api.get(url)
      .then(r => {
        const data = r.data?.data?.content ?? r.data?.content ?? r.data?.data ?? r.data ?? []
        setDonors(Array.isArray(data) ? data : [])
      })
      .catch(() => setDonors([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load('', '') }, [load])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(val, bgFilter), 350)
  }

  const handleBgChange = (e) => {
    const val = e.target.value
    setBgFilter(val)
    load(search, val)
  }

  return (
    <DonorList
      donors={donors}
      loading={loading}
      search={search}
      bgFilter={bgFilter}
      selectedDonor={selectedDonor}
      onSearchChange={handleSearchChange}
      onBgChange={handleBgChange}
      onClearFilters={() => { setSearch(''); setBgFilter(''); load('', '') }}
      onRegisterClick={() => navigate('/dashboard/donors/register')}
      onSelectDonor={setSelectedDonor}
      onCloseModal={() => setSelectedDonor(null)}
      onEditDonor={(id) => navigate(`/dashboard/donors/edit/${id}`)}
    />
  )
}