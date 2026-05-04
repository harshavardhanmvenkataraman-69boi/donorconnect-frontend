import { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatCard from '../../components/shared/ui/StatCard';
import StatusBadge from '../../components/shared/ui/StatusBadge';

export default function StockOverviewPage() {
  const [inventory, setInventory] = useState([]); const [summary, setSummary] = useState([]);
  const [lowStock, setLowStock] = useState([]); const [loading, setLoading] = useState(true);
  const [bgFilter, setBgFilter] = useState(''); const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    Promise.allSettled([api.get('/api/inventory'), api.get('/api/inventory/summary'), api.get('/api/inventory/low-stock')])
      .then(([inv, sum, ls]) => {
        setInventory(inv.value?.data?.data || inv.value?.data || []);
        setSummary(sum.value?.data?.data || sum.value?.data || []);
        setLowStock(ls.value?.data?.data || ls.value?.data || []);
      }).finally(() => setLoading(false));
  }, []);

  const filteredSummary = summary.filter(s =>
    (!bgFilter || s.bloodGroup === bgFilter) && (!typeFilter || s.componentType === typeFilter)
  );
  const columns = [
    { key:'bloodGroup', label:'Blood Group' }, { key:'rhFactor', label:'Rh Factor' }, { key:'componentType', label:'Component Type' },
    { key:'availableUnits', label:'Available Units' }, { key:'status', label:'Status', render: v => <StatusBadge status={v} /> },
  ];
  const uniqueBGs = [...new Set(summary.map(s => s.bloodGroup))];
  const uniqueTypes = [...new Set(summary.map(s => s.componentType))];

  return (
    <div className="animate-fadein">
      <PageHeader title="Blood Stock Overview" />
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}><StatCard title="Total Units" value={inventory.filter(i => i.status === 'AVAILABLE').length} color="primary" /></Col>
        <Col xs={6} md={3}><StatCard title="Low Stock Alerts" value={lowStock.length} color="danger" /></Col>
        <Col xs={6} md={3}><StatCard title="Blood Groups" value={[...new Set(inventory.map(i => i.bloodGroup))].length} color="success" /></Col>
        <Col xs={6} md={3}><StatCard title="Total Records" value={inventory.length} color="warning" /></Col>
      </Row>
      {lowStock.length > 0 && (
        <div className="alert-glass error mb-4">
          ⚠️ <strong>{lowStock.length} blood type(s) are critically low:</strong>{' '}
          {lowStock.slice(0,5).map(l => `${l.bloodGroup}${l.rhFactor === 'POSITIVE' ? '+' : '-'} ${l.componentType}`).join(', ')}
        </div>
      )}
      <div className="filter-row mb-3">
        <select className="form-select" style={{ width:160 }} value={bgFilter} onChange={e => setBgFilter(e.target.value)}>
          <option value="">All Blood Groups</option>
          {uniqueBGs.map(b => <option key={b}>{b}</option>)}
        </select>
        <select className="form-select" style={{ width:200 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Component Types</option>
          {uniqueTypes.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="table-wrapper"><DataTable columns={columns} data={filteredSummary} loading={loading} /></div>
    </div>
  );
}
