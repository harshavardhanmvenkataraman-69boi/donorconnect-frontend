import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      // Gateway: POST /api/auth/forgot-password?email=x → rewrites to /api/v1/auth/forgot-password
      const res = await api.post(`/api/auth/forgot-password?email=${encodeURIComponent(email)}`);
      const msg = res.data?.message || '';
      const match = msg.match(/Token:\s*(\S+)/);
      if (match) setToken(match[1]);
      setSent(true);
    } catch { setSent(true); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-wrapper">
      <div className="app-background"></div>
      <div className="login-card animate-fadeup">
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div className="login-logo">🔑</div>
          <h4 style={{ fontFamily:'Sora', fontWeight:800, fontSize:'1.5rem', marginBottom:4 }}>Reset Password</h4>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>Enter your email to receive a reset token</p>
        </div>
        {sent ? (
          <div>
            <div className="alert-glass success mb-3">✅ Reset token generated.</div>
            {token && (
              <div style={{ background:'var(--crimson-pale)', border:'1px solid rgba(193,18,31,0.2)', borderRadius:10, padding:'12px 14px', marginBottom:16 }}>
                <div style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', color:'var(--crimson)', marginBottom:4 }}>Your Reset Token</div>
                <code style={{ fontSize:'0.8rem', wordBreak:'break-all', color:'var(--text-primary)', display:'block' }}>{token}</code>
                <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:6 }}>Copy this token and use it on the next page.</div>
              </div>
            )}
            <Link to="/reset-password"><button className="btn-crimson w-100 justify-content-center" style={{ padding:'12px' }}>Go to Reset Password →</button></Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4"><label className="form-label">Email Address</label><input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@hospital.org" /></div>
            <button type="submit" className="btn-crimson w-100 justify-content-center" disabled={loading} style={{ padding:'12px' }}>{loading ? 'Sending...' : 'Send Reset Token'}</button>
          </form>
        )}
        <div style={{ textAlign:'center', marginTop:20 }}><Link to="/login" style={{ color:'var(--crimson)', fontSize:'0.8rem', textDecoration:'none' }}>← Back to Login</Link></div>
      </div>
    </div>
  );
}
