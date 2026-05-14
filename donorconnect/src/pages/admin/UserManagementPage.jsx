import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import ConfirmModal from '../../components/shared/ui/ConfirmModal';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

const ROLES = ['ROLE_ADMIN','ROLE_RECEPTION','ROLE_PHLEBOTOMIST','ROLE_LAB_TECHNICIAN','ROLE_INVENTORY_CONTROLLER','ROLE_TRANSFUSION_OFFICER','ROLE_DONOR'];

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'ROLE_DONOR' });

  const load = () => {
    setLoading(true);
    api.get('/api/v1/users?page=0&size=50')
      .then(r => {
        // ApiResponse wraps Page<User>: r.data.data.content
        const data = r.data?.data?.content ?? r.data?.content ?? r.data?.data ?? [];
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const doAction = async (userId, action) => {
    if (!userId) { showError('User ID missing'); return; }
    try { await api.patch(`/api/v1/users/${userId}/${action}`); showSuccess('User updated'); load(); }
    catch (e) { showError(e.response?.data?.message || 'Action failed'); }
  };

  const createUser = async () => {
    try { await api.post('/api/auth/register', form); showSuccess('User created'); setShowCreate(false); setForm({ name:'', email:'', password:'', role:'ROLE_DONOR' }); load(); }
    catch (e) { showError(e.response?.data?.message || 'Create failed'); }
  };

  const columns = [
    { key: 'userId', label: 'ID', render: v => (
      <span style={{ fontFamily:'monospace', fontSize:'0.78rem', background:'rgba(0,0,0,0.04)', borderRadius:6, padding:'2px 8px', color:'var(--text-muted)', fontWeight:600 }}>#{v}</span>
    )},
    { key: 'name',  label: 'Name',  render: (v, row) => (
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,var(--crimson),var(--blood-dark))', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.7rem', fontWeight:700, flexShrink:0 }}>
          {(v ?? '?')[0].toUpperCase()}
        </div>
        <span style={{ fontWeight:600, fontSize:'0.85rem' }}>{v}</span>
      </div>
    )},
    { key: 'email', label: 'Email', render: v => <span style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{v}</span> },
    { key: 'role',  label: 'Role',  render: v => <span className="status-badge primary">{v?.replace('ROLE_','')}</span> },
    { key: 'status',label: 'Status',render: v => <StatusBadge status={v} /> },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="User Management" subtitle="Manage system users and access">
        <button className="btn-crimson" onClick={() => setShowCreate(true)}>+ Register User</button>
      </PageHeader>
      <div className="table-wrapper">
        <DataTable columns={columns} data={users} loading={loading} actions={row => (
          <div className="d-flex gap-2">
            {row.status !== 'LOCKED'  && <button className="btn-icon" title="Lock"       onClick={() => doAction(row.userId, 'lock')}>🔒</button>}
            {row.status === 'LOCKED'  && <button className="btn-icon success" title="Unlock"    onClick={() => doAction(row.userId, 'unlock')}>🔓</button>}
            {row.status === 'ACTIVE'  && <button className="btn-icon danger"  title="Deactivate" onClick={() => setConfirm({ id: row.userId, action: 'deactivate' })}>✕</button>}
          </div>
        )} />
      </div>
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton><Modal.Title>Register New User</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            {[['name','Full Name','text'],['email','Email','email'],['password','Password','password']].map(([k,l,t]) => (
              <Col key={k} xs={12}><label className="form-label">{l}</label><input type={t} className="form-control" value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} /></Col>
            ))}
            <Col xs={12}><label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm({...form,role:e.target.value})}>
                {ROLES.map(r => <option key={r} value={r}>{r.replace('ROLE_','')}</option>)}
              </select>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={() => setShowCreate(false)}>Cancel</button>
          <button className="btn-crimson" onClick={createUser}>Create User</button>
        </Modal.Footer>
      </Modal>
      <ConfirmModal show={!!confirm} onHide={() => setConfirm(null)} onConfirm={() => { doAction(confirm.id, confirm.action); setConfirm(null); }} title="Confirm" message="Are you sure you want to perform this action?" />
    </div>
  );
}
