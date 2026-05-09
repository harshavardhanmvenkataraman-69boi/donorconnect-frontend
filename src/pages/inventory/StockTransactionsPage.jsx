import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

const TXN_TYPES = ['IN','OUT','ADJUSTMENT','TRANSFER','DISPOSAL','EXPIRY'];

export default function StockTransactionsPage() {
  const [txns, setTxns] = useState([]); const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(''); const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ componentId:'', transactionType:'IN', quantity:'', notes:'' });

  const load = (t) => {
    setLoading(true);
    const url = t ? `/api/stock-transactions/type/${t}` : '/api/stock-transactions?page=0&size=50';
    api.get(url).then(r => setTxns(r.data?.data?.content || r.data?.content || r.data?.data || [])).catch(() => setTxns([])).finally(() => setLoading(false));
  };
  useEffect(() => load(typeFilter), [typeFilter]);

  const submit = async () => {
    try { await api.post('/api/stock-transactions', form); showSuccess('Recorded'); setShowModal(false); load(typeFilter); }
    catch (e) { showError('Failed'); }
  };

  const columns = [
    { key:'id', label:'ID' }, { key:'componentId', label:'Component' },
    { key:'transactionType', label:'Type', render: v => <StatusBadge status={v} /> },
    { key:'quantity', label:'Quantity' }, { key:'notes', label:'Notes' },
    { key:'createdAt', label:'Date', render: v => v ? new Date(v).toLocaleString() : '—' },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Stock Transactions"><button className="btn-crimson" onClick={() => setShowModal(true)}>+ Record Transaction</button></PageHeader>
      <div className="filter-row mb-3">
        <select className="form-select" style={{ width:200 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {TXN_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="table-wrapper"><DataTable columns={columns} data={txns} loading={loading} /></div>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Record Transaction</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}><label className="form-label">Component ID</label><input type="number" className="form-control" value={form.componentId} onChange={e => setForm({...form,componentId:e.target.value})} /></Col>
            <Col xs={12}><label className="form-label">Transaction Type</label><select className="form-select" value={form.transactionType} onChange={e => setForm({...form,transactionType:e.target.value})}>{TXN_TYPES.map(t => <option key={t}>{t}</option>)}</select></Col>
            <Col xs={12}><label className="form-label">Quantity</label><input type="number" className="form-control" value={form.quantity} onChange={e => setForm({...form,quantity:e.target.value})} /></Col>
            <Col xs={12}><label className="form-label">Notes</label><textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({...form,notes:e.target.value})}></textarea></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><button className="btn-glass" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-crimson" onClick={submit}>Record</button></Modal.Footer>
      </Modal>
    </div>
  );
}
