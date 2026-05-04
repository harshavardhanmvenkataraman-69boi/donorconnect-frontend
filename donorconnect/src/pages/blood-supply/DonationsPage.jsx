import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function DonationsPage() {
  const [donations, setDonations] = useState([]); const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); const [compModal, setCompModal] = useState(null);
  const [form, setForm] = useState({ donorId:'', volumeMl:'' });

  const load = () => { api.get('/api/donations').then(r => setDonations(r.data?.data || r.data || [])).catch(() => setDonations([])).finally(() => setLoading(false)); };
  useEffect(load, []);

  const record = async () => {
    try { await api.post('/api/donations', form); showSuccess('Donation recorded'); setShowModal(false); load(); }
    catch (e) { showError('Failed'); }
  };
  const viewComponents = async (id) => {
    const r = await api.get(`/api/components?donationId=${id}`).catch(() => ({ data:[] }));
    setCompModal(r.data?.data || r.data || []);
  };

  const columns = [
    { key:'id', label:'ID' }, { key:'donorId', label:'Donor ID' }, { key:'volumeMl', label:'Volume (ml)' },
    { key:'collectionStatus', label:'Status', render: v => <StatusBadge status={v} /> },
    { key:'donatedAt', label:'Donated At', render: v => v ? new Date(v).toLocaleString() : '—' },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Donations Log"><button className="btn-crimson" onClick={() => setShowModal(true)}>+ Record Donation</button></PageHeader>
      <div className="table-wrapper"><DataTable columns={columns} data={donations} loading={loading} actions={row => (<button className="btn-glass" onClick={() => viewComponents(row.id)}>Components</button>)} /></div>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Record Donation</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="mb-3"><label className="form-label">Donor ID</label><input type="number" className="form-control" value={form.donorId} onChange={e => setForm({...form,donorId:e.target.value})} /></div>
          <div><label className="form-label">Volume (ml)</label><input type="number" className="form-control" value={form.volumeMl} onChange={e => setForm({...form,volumeMl:e.target.value})} /></div>
        </Modal.Body>
        <Modal.Footer><button className="btn-glass" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-crimson" onClick={record}>Record</button></Modal.Footer>
      </Modal>
      <Modal show={!!compModal} onHide={() => setCompModal(null)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Blood Components</Modal.Title></Modal.Header>
        <Modal.Body>
          {!compModal?.length ? <p style={{ color:'var(--text-muted)' }}>No components found.</p> :
            <table className="table-glass w-100"><thead><tr><th>ID</th><th>Type</th><th>Status</th><th>Expiry</th></tr></thead>
              <tbody>{compModal.map(c => (<tr key={c.id}><td>{c.id}</td><td>{c.componentType}</td><td><StatusBadge status={c.status} /></td><td>{c.expiryDate}</td></tr>))}</tbody>
            </table>}
        </Modal.Body>
      </Modal>
    </div>
  );
}
