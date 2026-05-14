import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // Gateway: POST /api/auth/login → rewrites to /api/v1/auth/login on auth-service
      const res = await api.post('/api/auth/login', form);
      const { token, role, name } = res.data?.data || {};
      if (!token) throw new Error('No token received');

      localStorage.setItem('token', token);
      localStorage.setItem('userName', name || '');

      if (role === 'ROLE_ADMIN')                navigate('/dashboard/admin');
      else if (role === 'ROLE_RECEPTION')       navigate('/dashboard/donors');
      else if (role === 'ROLE_PHLEBOTOMIST')    navigate('/dashboard/screenings');
      else if (role === 'ROLE_LAB_TECHNICIAN')  navigate('/dashboard/donations');
      else if (role === 'ROLE_INVENTORY_CONTROLLER') navigate('/dashboard/inventory');
      else if (role === 'ROLE_TRANSFUSION_OFFICER')  navigate('/dashboard/crossmatch');
      else navigate('/dashboard/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrapper">
      <div className="app-background"></div>
      <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(193,18,31,0.07) 0%, transparent 70%)', top:-100, left:-100, pointerEvents:'none' }}></div>
      <div style={{ position:'fixed', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,0,0,0.05) 0%, transparent 70%)', bottom:-80, right:-80, pointerEvents:'none' }}></div>
      <div className="login-card animate-fadeup">
        {/* Back to Home */}
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-muted)', textDecoration: 'none',
          fontSize: '0.8rem', fontWeight: 600,
          marginBottom: 20,
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--crimson)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Home
        </Link>

        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div className="login-logo">🩸</div>
          <h4 style={{ fontFamily:'Sora', fontWeight:800, fontSize:'1.6rem', marginBottom:4 }}>Welcome Back</h4>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>Sign in to DonorConnect</p>
        </div>
        {error && <div className="alert-glass error mb-4" style={{ display:'flex', alignItems:'center', gap:8 }}><span>⚠️</span><span>{error}</span></div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required placeholder="you@hospital.org" autoComplete="email" />
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required placeholder="••••••••" autoComplete="current-password" />
          </div>
          <button type="submit" className="btn-crimson w-100 justify-content-center" disabled={loading} style={{ padding:'13px', fontSize:'0.95rem' }}>
            {loading ? <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}><span className="spinner-border spinner-border-sm" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }}></span>Signing in...</span> : 'Sign In →'}
          </button>
        </form>
        <div style={{ textAlign:'center', marginTop: 16 }}>
            <Link to="/forgot-password" style={{ color:'var(--crimson)', fontSize:'0.82rem', textDecoration:'none', fontWeight:500 }}>
              Forgot your password?
            </Link>
          </div>
      </div>
    </div>
  );
}
