import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';

export default function ReportsPage() {
  const [reports, setReports] = useState([]); const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  useEffect(() => { api.get('/api/reports').then(r => setReports(r.data?.data || r.data || [])).catch(() => setReports([])).finally(() => setLoading(false)); }, []);
  const view = async (id) => { try { const r = await api.get(`/api/reports/${id}`); setViewing(r.data?.data || r.data); } catch { setViewing({ content: 'Failed to load report.' }); } };
  const columns = [{ key:'id', label:'ID' }, { key:'scope', label:'Scope' }, { key:'createdAt', label:'Created At', render: v => v ? new Date(v).toLocaleString() : '—' }];
  return (
    <div className="animate-fadein">
      <PageHeader title="Reports" subtitle="Auto-generated system reports">
        <div className="alert-glass warning" style={{ marginBottom:0 }}>Reports are generated automatically on a scheduled basis.</div>
      </PageHeader>
      <div className="table-wrapper"><DataTable columns={columns} data={reports} loading={loading} actions={row => (<button className="btn-glass" onClick={() => view(row.id)}>View</button>)} /></div>
      <Modal show={!!viewing} onHide={() => setViewing(null)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Report Details</Modal.Title></Modal.Header>
        <Modal.Body><pre style={{ fontFamily:'DM Sans',fontSize:'0.85rem',whiteSpace:'pre-wrap',color:'var(--text-primary)' }}>{JSON.stringify(viewing, null, 2)}</pre></Modal.Body>
      </Modal>
    </div>
  );
}
