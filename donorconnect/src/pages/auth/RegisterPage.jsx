import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const pwdStrength = (p) => {
    if (!p) return null;
    if (p.length < 6)  return { label:'Too short',  color:'#E74C3C', width:'20%' };
    if (p.length < 8)  return { label:'Weak',        color:'#F39C12', width:'45%' };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label:'Fair', color:'#F39C12', width:'65%' };
    return { label:'Strong', color:'#27AE60', width:'100%' };
  };
  const strength = pwdStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/public/register', {
        name:     form.name,
        email:    form.email,
        phone:    form.phone,
        password: form.password,
      });
      navigate('/login?registered=true');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (err.response?.status === 409 || msg.toLowerCase().includes('already'))
        setError('An account with this email already exists.');
      else
        setError(msg || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrapper">
      <div className="app-background" />

      <div className="login-card animate-fadeup" style={{ width: 460 }}>

        {/* Back to home */}
        <Link to="/" style={{
          display:'inline-flex', alignItems:'center', gap:6,
          color:'var(--text-muted)', textDecoration:'none',
          fontSize:'0.8rem', fontWeight:600, marginBottom:20, transition:'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color='var(--crimson)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Home
        </Link>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div className="login-logo">🩸</div>
          <h4 style={{ fontFamily:'Sora', fontWeight:800, fontSize:'1.5rem', marginBottom:4 }}>Create Account</h4>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>
            Join DonorConnect
          </p>
        </div>

        {error && (
          <div className="alert-glass error mb-3" style={{ display:'flex', gap:8 }}>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label">Full Name *</label>
            <input
              className="form-control" required
              placeholder="e.g. Your Name"
              value={form.name}
              onChange={e => setForm({...form, name:e.target.value})}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email Address *</label>
            <input
              type="email" className="form-control" required
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({...form, email:e.target.value})}
            />
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel" className="form-control"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={e => setForm({...form, phone:e.target.value})}
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password *</label>
            <div style={{ position:'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-control" required
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm({...form, password:e.target.value})}
                style={{ paddingRight:40 }}
              />
              <button type="button" onClick={() => setShowPwd(p => !p)} style={{
                position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer',
                color:'var(--text-muted)', fontSize:'1rem', padding:0,
              }}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Strength bar */}
            {strength && (
              <div style={{ marginTop:6 }}>
                <div style={{ height:4, borderRadius:50, background:'rgba(0,0,0,0.08)', overflow:'hidden' }}>
                  <div style={{ width:strength.width, height:'100%', background:strength.color, borderRadius:50, transition:'width 0.3s ease' }} />
                </div>
                <div style={{ fontSize:'0.68rem', color:strength.color, marginTop:3, fontWeight:600 }}>{strength.label}</div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label">Confirm Password *</label>
            <input
              type="password" className="form-control" required
              placeholder="Re-enter your password"
              value={form.confirm}
              onChange={e => setForm({...form, confirm:e.target.value})}
            />
            {form.confirm && form.password !== form.confirm && (
              <div style={{ fontSize:'0.72rem', color:'#E74C3C', marginTop:4 }}>⚠️ Passwords do not match</div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit" className="btn-crimson w-100 justify-content-center"
            disabled={loading} style={{ padding:'13px', fontSize:'0.95rem' }}
          >
            {loading
              ? <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                  <span className="spinner-border spinner-border-sm" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} />
                  Creating account…
                </span>
              : 'Create Account →'
            }
          </button>
        </form>

        {/* Footer links */}
        <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
          <div style={{ height:1, width:'100%', background:'var(--border-light)' }} />

          <Link to="/login" style={{
            color:'var(--crimson)', fontSize:'0.85rem',
            textDecoration:'none', fontWeight:600,
          }}>
            Already have an account? <strong>Sign In</strong>
          </Link>

          <Link to="/forgot-password" style={{
            color:'var(--text-muted)', fontSize:'0.78rem', textDecoration:'none',
          }}>
            Forgot your password?
          </Link>
        </div>

      </div>
    </div>
  );
}
