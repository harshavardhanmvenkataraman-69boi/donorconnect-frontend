import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axiosInstance'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await api.post(`/api/auth/forgot-password?email=${encodeURIComponent(email)}`); setSent(true) }
    catch { setSent(true) }
    finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔑</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Reset Password</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Enter your email to receive a reset link</p>
        </div>
        {sent
          ? <div className="dc-alert success"><i className="bi bi-check-circle" />If this email exists, a reset link has been sent.</div>
          : <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label className="dc-form-label">Email Address</label>
                <input className="dc-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@hospital.com" />
              </div>
              <button className="btn-dc-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
        }
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>← Back to login</Link>
        </div>
      </div>
    </div>
  )
}

export function ResetPasswordPage() {
  const [form, setForm] = useState({ token: '', newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) return setError('Passwords do not match.')
    setLoading(true); setError('')
    try {
      await api.post('/api/auth/reset-password', { token: form.token, newPassword: form.newPassword })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Token may be invalid or expired.')
    } finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Set New Password</h3>
        </div>
        <form onSubmit={handleSubmit}>
          {['token', 'newPassword', 'confirm'].map(f => (
            <div key={f} style={{ marginBottom: 16 }}>
              <label className="dc-form-label">{f === 'token' ? 'Reset Token' : f === 'newPassword' ? 'New Password' : 'Confirm Password'}</label>
              <input className="dc-input" type={f === 'token' ? 'text' : 'password'} value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} required />
            </div>
          ))}
          {error && <div className="dc-alert danger" style={{ marginBottom: 14 }}><i className="bi bi-exclamation-circle" />{error}</div>}
          <button className="btn-dc-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
