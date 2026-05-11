import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosInstance'
import DonorList from '../../components/service/donor/DonorList.jsx'

export default function DonorListPage() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [bgFilter, setBgFilter] = useState('')
  const [phoneSearch, setPhoneSearch] = useState('')
  const [selectedDonor, setSelectedDonor] = useState(null)

  const debounceRef = useRef(null)
  const navigate = useNavigate()

  const load = useCallback((s, b, phone) => {
    setLoading(true)

    const hasName = !!s?.trim()
    const hasPhone = !!phone?.trim()
    const hasBg = !!b

    if (hasName && hasPhone) {
      Promise.all([
        api.get(`/api/donors/search?name=${encodeURIComponent(s.trim())}`),
        api.get(`/api/donors/search/phone?phone=${encodeURIComponent(phone.trim())}`),
      ])
        .then(([nameRes, phoneRes]) => {
          const byName = extractList(nameRes)
          const byPhone = extractList(phoneRes)
          const phoneIds = new Set(byPhone.map((d) => d.donorId))
          let result = byName.filter((d) => phoneIds.has(d.donorId))

          if (hasBg) result = result.filter((d) => d.bloodGroup === b)

          setDonors(result)
        })
        .catch(() => setDonors([]))
        .finally(() => setLoading(false))

      return
    }

    let url

    if (hasPhone) url = `/api/donors/search/phone?phone=${encodeURIComponent(phone.trim())}`
    else if (hasName) url = `/api/donors/search?name=${encodeURIComponent(s.trim())}`
    else if (hasBg) url = `/api/donors/blood-group/${b}`
    else url = '/api/donors?page=0&size=50'

    api.get(url)
      .then((r) => {
        let data = extractList(r)

        if (hasBg && (hasName || hasPhone)) {
          data = data.filter((d) => d.bloodGroup === b)
        }

        setDonors(data)
      })
      .catch(() => setDonors([]))
      .finally(() => setLoading(false))
  }, [])

  const extractList = (res) => {
    const data = res.data?.data?.content ?? res.data?.content ?? res.data?.data ?? res.data ?? []
    return Array.isArray(data) ? data : []
  }

  useEffect(() => {
    load('', '', '')
  }, [load])

  const handleSearchChange = (e) => {
    const val = e.target.value

    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(val, bgFilter, phoneSearch), 300)
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value

    setPhoneSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(search, bgFilter, val), 300)
  }

  const handleBgChange = (e) => {
    const val = e.target.value

    setBgFilter(val)
    load(search, val, phoneSearch)
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