// import { useState, useEffect } from 'react';
// import { Modal, Row, Col } from 'react-bootstrap';
// import api from '../../api/axiosInstance';
// import PageHeader from '../../components/shared/ui/PageHeader';
// import DataTable from '../../components/shared/ui/DataTable';
// import StatusBadge from '../../components/shared/ui/StatusBadge';
// import ConfirmModal from '../../components/shared/ui/ConfirmModal';
// import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

// const ROLES = ['ROLE_ADMIN','ROLE_RECEPTION','ROLE_PHLEBOTOMIST','ROLE_LAB_TECHNICIAN','ROLE_INVENTORY_CONTROLLER','ROLE_TRANSFUSION_OFFICER','ROLE_DONOR'];

// export default function UserManagementPage() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showCreate, setShowCreate] = useState(false);
//   const [confirm, setConfirm] = useState(null);
//   const [form, setForm] = useState({ name:'', email:'', password:'', role:'ROLE_DONOR' });

//   const load = () => {
//     setLoading(true);
//     api.get('/api/v1/users?page=0&size=50')
//       .then(r => {
//         // ApiResponse wraps Page<User>: r.data.data.content
//         const data = r.data?.data?.content ?? r.data?.content ?? r.data?.data ?? [];
//         setUsers(Array.isArray(data) ? data : []);
//       })
//       .catch(() => setUsers([]))
//       .finally(() => setLoading(false));
//   };
//   useEffect(load, []);

//   const doAction = async (userId, action) => {
//     if (!userId) { showError('User ID missing'); return; }
//     try { await api.patch(`/api/v1/users/${userId}/${action}`); showSuccess('User updated'); load(); }
//     catch (e) { showError(e.response?.data?.message || 'Action failed'); }
//   };

//   const createUser = async () => {
//     try { await api.post('/api/auth/register', form); showSuccess('User created'); setShowCreate(false); setForm({ name:'', email:'', password:'', role:'ROLE_DONOR' }); load(); }
//     catch (e) { showError(e.response?.data?.message || 'Create failed'); }
//   };

//   const columns = [
//     { key: 'userId', label: 'ID', render: v => (
//       <span style={{ fontFamily:'monospace', fontSize:'0.78rem', background:'rgba(0,0,0,0.04)', borderRadius:6, padding:'2px 8px', color:'var(--text-muted)', fontWeight:600 }}>#{v}</span>
//     )},
//     { key: 'name',  label: 'Name',  render: (v, row) => (
//       <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//         <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,var(--crimson),var(--blood-dark))', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.7rem', fontWeight:700, flexShrink:0 }}>
//           {(v ?? '?')[0].toUpperCase()}
//         </div>
//         <span style={{ fontWeight:600, fontSize:'0.85rem' }}>{v}</span>
//       </div>
//     )},
//     { key: 'email', label: 'Email', render: v => <span style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{v}</span> },
//     { key: 'role',  label: 'Role',  render: v => <span className="status-badge primary">{v?.replace('ROLE_','')}</span> },
//     { key: 'status',label: 'Status',render: v => <StatusBadge status={v} /> },
//   ];

//   return (
//     <div className="animate-fadein">
//       <PageHeader title="User Management" subtitle="Manage system users and access">
//         <button className="btn-crimson" onClick={() => setShowCreate(true)}>+ Register User</button>
//       </PageHeader>
//       <div className="table-wrapper">
//         <DataTable columns={columns} data={users} loading={loading} actions={row => (
//           <div className="d-flex gap-2">
//             {row.status !== 'LOCKED'  && <button className="btn-icon" title="Lock"       onClick={() => doAction(row.userId, 'lock')}>🔒</button>}
//             {row.status === 'LOCKED'  && <button className="btn-icon success" title="Unlock"    onClick={() => doAction(row.userId, 'unlock')}>🔓</button>}
//             {row.status === 'ACTIVE'  && <button className="btn-icon danger"  title="Deactivate" onClick={() => setConfirm({ id: row.userId, action: 'deactivate' })}>✕</button>}
//           </div>
//         )} />
//       </div>
//       <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
//         <Modal.Header closeButton><Modal.Title>Register New User</Modal.Title></Modal.Header>
//         <Modal.Body>
//           <Row className="g-3">
//             {[['name','Full Name','text'],['email','Email','email'],['password','Password','password']].map(([k,l,t]) => (
//               <Col key={k} xs={12}><label className="form-label">{l}</label><input type={t} className="form-control" value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} /></Col>
//             ))}
//             <Col xs={12}><label className="form-label">Role</label>
//               <select className="form-select" value={form.role} onChange={e => setForm({...form,role:e.target.value})}>
//                 {ROLES.map(r => <option key={r} value={r}>{r.replace('ROLE_','')}</option>)}
//               </select>
//             </Col>
//           </Row>
//         </Modal.Body>
//         <Modal.Footer>
//           <button className="btn-glass" onClick={() => setShowCreate(false)}>Cancel</button>
//           <button className="btn-crimson" onClick={createUser}>Create User</button>
//         </Modal.Footer>
//       </Modal>
//       <ConfirmModal show={!!confirm} onHide={() => setConfirm(null)} onConfirm={() => { doAction(confirm.id, confirm.action); setConfirm(null); }} title="Confirm" message="Are you sure you want to perform this action?" />
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import ConfirmModal from '../../components/shared/ui/ConfirmModal';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

const ROLES = [
  'ROLE_ADMIN','ROLE_SUPER_ADMIN','ROLE_RECEPTION','ROLE_PHLEBOTOMIST',
  'ROLE_LAB_TECHNICIAN','ROLE_INVENTORY_CONTROLLER','ROLE_TRANSFUSION_OFFICER',
];

// ── Password validation ───────────────────────────────────────────────────────
const validatePassword = (v) => {
  if (!v)              return 'Password is required';
  if (v.length < 8)    return 'Must be at least 8 characters';
  if (!/[A-Z]/.test(v)) return 'Must contain at least one uppercase letter';
  if (!/[a-z]/.test(v)) return 'Must contain at least one lowercase letter';
  if (!/[0-9]/.test(v)) return 'Must contain at least one number';
  if (!/[^A-Za-z0-9]/.test(v)) return 'Must contain at least one special character (!@#$%^&*)';
  return null;
};

const validateEmail = (v) => {
  if (!v?.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
  return null;
};

const validateName = (v) => {
  if (!v?.trim())       return 'Full name is required';
  if (v.trim().length < 3) return 'Name must be at least 3 characters';
  return null;
};

// Password strength indicator
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: '8+ characters',        pass: password.length >= 8 },
    { label: 'Uppercase (A-Z)',       pass: /[A-Z]/.test(password) },
    { label: 'Lowercase (a-z)',       pass: /[a-z]/.test(password) },
    { label: 'Number (0-9)',          pass: /[0-9]/.test(password) },
    { label: 'Special char (!@#...)', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const passed = checks.filter(c => c.pass).length;
  const color  = passed <= 2 ? '#E74C3C' : passed <= 3 ? '#F39C12' : passed === 4 ? '#F39C12' : '#27AE60';
  const label  = passed <= 2 ? 'Weak' : passed <= 3 ? 'Fair' : passed === 4 ? 'Good' : 'Strong';

  return (
    <div style={{ marginTop: 8 }}>
      {/* Bar */}
      <div style={{ display:'flex', gap:3, marginBottom:6 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i <= passed ? color : 'rgba(0,0,0,0.08)', transition:'background 0.2s' }} />
        ))}
      </div>
      <div style={{ fontSize:'0.68rem', color, fontWeight:700, marginBottom:6 }}>{label}</div>
      {/* Checklist */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'3px 12px' }}>
        {checks.map(c => (
          <span key={c.label} style={{ fontSize:'0.68rem', color: c.pass ? '#27AE60' : '#aaa', display:'flex', alignItems:'center', gap:3 }}>
            {c.pass ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [confirm,    setConfirm]    = useState(null);
  const [showPwd,    setShowPwd]    = useState(false);
  const [touched,    setTouched]    = useState({});
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'ROLE_RECEPTION' });

  const load = () => {
    setLoading(true);
    api.get('/api/v1/users?page=0&size=50')
      .then(r => {
        const data = r.data?.data?.content ?? r.data?.content ?? r.data?.data ?? [];
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const touch = (field) => setTouched(t => ({ ...t, [field]: true }));
  const touchAll = () => setTouched({ name:true, email:true, password:true });

  const nameErr     = validateName(form.name);
  const emailErr    = validateEmail(form.email);
  const passwordErr = validatePassword(form.password);
  const formValid   = !nameErr && !emailErr && !passwordErr;

  const doAction = async (userId, action) => {
    if (!userId) { showError('User ID missing'); return; }
    try { await api.patch(`/api/v1/users/${userId}/${action}`); showSuccess('User updated'); load(); }
    catch (e) { showError(e.response?.data?.message || 'Action failed'); }
  };

  const createUser = async () => {
    touchAll();
    if (!formValid) { showError('Please fix all validation errors before submitting'); return; }
    try {
      await api.post('/api/auth/register', form);
      showSuccess('User created successfully');
      setShowCreate(false);
      setForm({ name:'', email:'', password:'', role:'ROLE_RECEPTION' });
      setTouched({});
      load();
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to create user');
    }
  };

  const handleClose = () => {
    setShowCreate(false);
    setForm({ name:'', email:'', password:'', role:'ROLE_RECEPTION' });
    setTouched({});
    setShowPwd(false);
  };

  const columns = [
    { key: 'userId', label: 'ID', render: v => (
      <span style={{ fontFamily:'monospace', fontSize:'0.78rem', background:'rgba(0,0,0,0.04)', borderRadius:6, padding:'2px 8px', color:'var(--text-muted)', fontWeight:600 }}>#{v}</span>
    )},
    { key: 'name', label: 'Name', render: (v) => (
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,var(--crimson),var(--blood-dark))', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.7rem', fontWeight:700, flexShrink:0 }}>
          {(v ?? '?')[0].toUpperCase()}
        </div>
        <span style={{ fontWeight:600, fontSize:'0.85rem' }}>{v}</span>
      </div>
    )},
    { key: 'email',  label: 'Email',  render: v => <span style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{v}</span> },
    { key: 'role',   label: 'Role',   render: v => <span className="status-badge primary">{v?.replace('ROLE_','')}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="User Management" subtitle="Manage system users and access">
        <button className="btn-crimson" onClick={() => setShowCreate(true)}>+ Register User</button>
      </PageHeader>

      <div className="table-wrapper">
        <DataTable columns={columns} data={users} loading={loading} actions={row => (
          <div className="d-flex gap-2">
            {row.status !== 'LOCKED' && <button className="btn-icon" title="Lock"       onClick={() => doAction(row.userId, 'lock')}>🔒</button>}
            {row.status === 'LOCKED' && <button className="btn-icon success" title="Unlock"    onClick={() => doAction(row.userId, 'unlock')}>🔓</button>}
            {row.status === 'ACTIVE' && <button className="btn-icon danger"  title="Deactivate" onClick={() => setConfirm({ id: row.userId, action: 'deactivate' })}>✕</button>}
          </div>
        )} />
      </div>

      {/* Create User Modal */}
      <Modal show={showCreate} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontFamily:'Sora', fontWeight:700, fontSize:'1.1rem' }}>Register New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">

            {/* Name */}
            <Col xs={12}>
              <label className="form-label">Full Name *</label>
              <input
                type="text" className="form-control"
                value={form.name} placeholder="e.g. Priya Sharma"
                onChange={e => setForm({...form, name: e.target.value})}
                onBlur={() => touch('name')}
                style={touched.name && nameErr ? { borderColor:'#E74C3C' } :
                       touched.name && !nameErr ? { borderColor:'#27AE60' } : {}}
              />
              {touched.name && nameErr && (
                <div style={{ fontSize:'0.72rem', color:'#E74C3C', marginTop:4 }}>⚠ {nameErr}</div>
              )}
            </Col>

            {/* Email */}
            <Col xs={12}>
              <label className="form-label">Email Address *</label>
              <input
                type="email" className="form-control"
                value={form.email} placeholder="staff@hospital.org"
                onChange={e => setForm({...form, email: e.target.value})}
                onBlur={() => touch('email')}
                style={touched.email && emailErr ? { borderColor:'#E74C3C' } :
                       touched.email && !emailErr ? { borderColor:'#27AE60' } : {}}
              />
              {touched.email && emailErr && (
                <div style={{ fontSize:'0.72rem', color:'#E74C3C', marginTop:4 }}>⚠ {emailErr}</div>
              )}
            </Col>

            {/* Password */}
            <Col xs={12}>
              <label className="form-label">Password *</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="form-control"
                  value={form.password} placeholder="Min. 8 chars with uppercase, number & special char"
                  onChange={e => setForm({...form, password: e.target.value})}
                  onBlur={() => touch('password')}
                  style={{
                    paddingRight: 40,
                    ...(touched.password && passwordErr ? { borderColor:'#E74C3C' } :
                        touched.password && !passwordErr ? { borderColor:'#27AE60' } : {}),
                  }}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)} style={{
                  position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:0,
                }}>{showPwd ? '🙈' : '👁️'}</button>
              </div>
              {touched.password && passwordErr && (
                <div style={{ fontSize:'0.72rem', color:'#E74C3C', marginTop:4 }}>⚠ {passwordErr}</div>
              )}
              <PasswordStrength password={form.password} />
            </Col>

            {/* Role */}
            <Col xs={12}>
              <label className="form-label">Role *</label>
              <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                {ROLES.map(r => <option key={r} value={r}>{r.replace('ROLE_','').replace(/_/g,' ')}</option>)}
              </select>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:4 }}>
                {form.role === 'ROLE_ADMIN' || form.role === 'ROLE_SUPER_ADMIN'
                  ? '⚠️ This role has elevated system access'
                  : '✓ Standard staff access role'}
              </div>
            </Col>

          </Row>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={handleClose}>Cancel</button>
          <button className="btn-crimson" onClick={createUser} disabled={!formValid}>
            Create User
          </button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={!!confirm} onHide={() => setConfirm(null)}
        onConfirm={() => { doAction(confirm.id, confirm.action); setConfirm(null); }}
        title="Confirm Action"
        message="Are you sure you want to perform this action?"
      />
    </div>
  );
}
