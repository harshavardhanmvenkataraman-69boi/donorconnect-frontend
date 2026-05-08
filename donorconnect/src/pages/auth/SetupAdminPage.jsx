import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function SetupAdminPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'', phone:'' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      // Gateway: POST /api/auth/setup-admin → rewrites to /api/v1/auth/setup-admin (no JWT needed)
      await api.post('/api/auth/setup-admin', {
        name: form.name, email: form.email,
        password: form.password, phone: form.phone,
      });
      setSuccess('Admin account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (err.response?.status === 409 || msg.toLowerCase().includes('already')) {
        setError('An admin already exists. Please log in instead.');
      } else {
        setError(msg || 'Setup failed. Please try again.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrapper">
      <div className="app-background"></div>
      <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(193,18,31,0.07) 0%, transparent 70%)', top:-100, right:-100, pointerEvents:'none' }}></div>
      <div className="login-card animate-fadeup" style={{ width:460 }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div className="login-logo" style={{ fontSize:'1.4rem' }}>⚙️</div>
          <h4 style={{ fontFamily:'Sora', fontWeight:800, fontSize:'1.5rem', marginBottom:4 }}>Setup Admin</h4>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', lineHeight:1.5 }}>
            Create the initial admin account — <strong>one time only</strong>.
          </p>
        </div>
        <div style={{ background:'var(--crimson-pale)', border:'1px solid rgba(193,18,31,0.15)', borderRadius:10, padding:'12px 14px', marginBottom:20, fontSize:'0.8rem', color:'var(--crimson-deep)', lineHeight:1.6 }}>
          🔐 After this, the admin registers all other staff (Reception, Lab Tech, etc.) from the <strong>User Management</strong> dashboard.
        </div>
        {error && <div className="alert-glass error mb-3" style={{ display:'flex', gap:8 }}><span>⚠️</span><span>{error}</span></div>}
        {success && <div className="alert-glass success mb-3" style={{ display:'flex', gap:8 }}><span>✅</span><span>{success}</span></div>}
        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="mb-3"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm({...form,name:e.target.value})} required placeholder="Dr. Admin Name" /></div>
            <div className="mb-3"><label className="form-label">Email Address *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required placeholder="admin@hospital.org" /></div>
            <div className="mb-3"><label className="form-label">Phone (optional)</label><input className="form-control" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="+91 99999 99999" /></div>
            <div className="mb-3"><label className="form-label">Password *</label><input type="password" className="form-control" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required placeholder="Min. 6 characters" /></div>
            <div className="mb-4"><label className="form-label">Confirm Password *</label><input type="password" className="form-control" value={form.confirm} onChange={e => setForm({...form,confirm:e.target.value})} required placeholder="Re-enter password" /></div>
            <button type="submit" className="btn-crimson w-100 justify-content-center" disabled={loading} style={{ padding:'13px', fontSize:'0.95rem' }}>
              {loading ? <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}><span className="spinner-border spinner-border-sm" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }}></span>Creating...</span> : '🔐 Create Admin Account'}
            </button>
          </form>
        )}
        <div style={{ textAlign:'center', marginTop:20 }}>
          <Link to="/login" style={{ color:'var(--crimson)', fontSize:'0.8rem', textDecoration:'none', fontWeight:500 }}>← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
