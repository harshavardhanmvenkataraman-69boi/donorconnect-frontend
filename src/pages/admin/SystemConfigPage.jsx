import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

export default function SystemConfigPage() {
  const [configs, setConfigs] = useState([]); const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ key:'', value:'', scope:'GLOBAL', description:'' });
  const load = () => { api.get('/api/config').then(r => setConfigs(r.data?.data || r.data || [])).catch(() => setConfigs([])).finally(() => setLoading(false)); };
  useEffect(load, []);
  const save = async () => {
    try {
      if (editing) await api.put(`/api/config/${editing.key}`, form);
      else await api.post('/api/config', form);
      showSuccess('Config saved'); setShowModal(false); load();
    } catch (e) { showError('Save failed'); }
  };
  const openEdit = (row) => { setEditing(row); setForm(row); setShowModal(true); };
  const openAdd = () => { setEditing(null); setForm({ key:'', value:'', scope:'GLOBAL', description:'' }); setShowModal(true); };
  const columns = [
    { key:'key', label:'Key' }, { key:'value', label:'Value' },
    { key:'scope', label:'Scope', render: v => <span className="status-badge primary">{v}</span> },
    { key:'description', label:'Description' },
  ];
  return (
    <div className="animate-fadein">
      <PageHeader title="System Configuration"><button className="btn-crimson" onClick={openAdd}>+ Add Config</button></PageHeader>
      <div className="table-wrapper"><DataTable columns={columns} data={configs} loading={loading} actions={row => (<button className="btn-icon" onClick={() => openEdit(row)}>✏️</button>)} /></div>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editing ? 'Edit Config' : 'Add Config'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}><label className="form-label">Key</label><input className="form-control" value={form.key} onChange={e => setForm({...form,key:e.target.value})} readOnly={!!editing} /></Col>
            <Col xs={12}><label className="form-label">Value</label><input className="form-control" value={form.value} onChange={e => setForm({...form,value:e.target.value})} /></Col>
            <Col xs={6}><label className="form-label">Scope</label><select className="form-select" value={form.scope} onChange={e => setForm({...form,scope:e.target.value})}><option>GLOBAL</option><option>SERVICE</option></select></Col>
            <Col xs={12}><label className="form-label">Description</label><input className="form-control" value={form.description} onChange={e => setForm({...form,description:e.target.value})} /></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><button className="btn-glass" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-crimson" onClick={save}>Save</button></Modal.Footer>
      </Modal>
    </div>
  );
}
