import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';

export default function DonorListPage() {
  const [donors, setDonors] = useState([]); const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(''); const [bg, setBg] = useState('');
  const navigate = useNavigate();

  const load = (s, b) => {
    setLoading(true);
    let url = '/api/donors?page=0&size=20';
    if (s) url = `/api/donors/search?name=${s}`;
    else if (b) url = `/api/donors/blood-group/${b}`;
    api.get(url).then(r => setDonors(r.data?.data?.content || r.data?.content || r.data?.data || [])).catch(() => setDonors([])).finally(() => setLoading(false));
  };
  useEffect(() => load(search, bg), []);

  const columns = [
    { key:'donorId', label:'ID' }, { key:'name', label:'Name' }, { key:'bloodGroup', label:'Blood Group' },
    { key:'rhFactor', label:'Rh' }, { key:'donorType', label:'Type' },
    { key:'status', label:'Status', render: v => <StatusBadge status={v} /> },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Donor Registry">
        <button className="btn-crimson" onClick={() => navigate('/dashboard/donors/register')}>+ Register Donor</button>
      </PageHeader>
      <div className="filter-row mb-4">
        <div className="search-glass flex-grow-1" style={{ maxWidth: 300 }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Search by name..." value={search} onChange={e => { setSearch(e.target.value); load(e.target.value, bg); }} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={bg} onChange={e => { setBg(e.target.value); load(search, e.target.value); }}>
          <option value="">All Blood Groups</option>
          {['A','B','AB','O'].map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <div className="table-wrapper">
        <DataTable columns={columns} data={donors} loading={loading} actions={row => (
          <div className="d-flex gap-2">
            <button className="btn-glass" onClick={() => navigate(`/dashboard/donors/edit/${row.donorId}`)}>Edit</button>
            <button className="btn-glass" onClick={() => navigate(`/dashboard/donors/${row.donorId}`)}>View</button>
          </div>
        )} />
      </div>
    </div>
  );
}
