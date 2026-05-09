import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ email:'', token:'', newPassword:'', confirm:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      // Gateway: POST /api/auth/reset-password → /api/v1/auth/reset-password
      await api.post('/api/auth/reset-password', {
        email: form.email, token: form.token, newPassword: form.newPassword,
      });
      navigate('/login');
    } catch (err) { setError(err.response?.data?.message || 'Reset failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-wrapper">
      <div className="app-background"></div>
      <div className="login-card animate-fadeup">
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div className="login-logo">🔐</div>
          <h4 style={{ fontFamily:'Sora', fontWeight:800, fontSize:'1.5rem', marginBottom:4 }}>Set New Password</h4>
        </div>
        {error && <div className="alert-glass error mb-3">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3"><label className="form-label">Email Address</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required /></div>
          <div className="mb-3"><label className="form-label">Reset Token</label><input className="form-control" value={form.token} onChange={e => setForm({...form,token:e.target.value})} required placeholder="Paste token here" /></div>
          <div className="mb-3"><label className="form-label">New Password</label><input type="password" className="form-control" value={form.newPassword} onChange={e => setForm({...form,newPassword:e.target.value})} required /></div>
          <div className="mb-4"><label className="form-label">Confirm Password</label><input type="password" className="form-control" value={form.confirm} onChange={e => setForm({...form,confirm:e.target.value})} required /></div>
          <button type="submit" className="btn-crimson w-100 justify-content-center" disabled={loading} style={{ padding:'12px' }}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
        <div style={{ textAlign:'center', marginTop:20 }}><Link to="/login" style={{ color:'var(--crimson)', fontSize:'0.8rem', textDecoration:'none' }}>← Back to Login</Link></div>
      </div>
    </div>
  );
}
