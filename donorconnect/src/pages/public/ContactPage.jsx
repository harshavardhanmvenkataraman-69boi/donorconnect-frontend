import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const reasons = [
  { icon: '🏥', title: 'Hospital Onboarding', desc: 'Looking to implement DonorConnect at your hospital or blood bank? Our team will walk you through everything.' },
  { icon: '🛠️', title: 'Technical Support', desc: 'Facing an issue or need help with configuration? Our support engineers are available on all business days.' },
  { icon: '🤝', title: 'Partnership & Integration', desc: 'Want to integrate DonorConnect with your existing HIS or LIS systems? Let\'s talk about how we can connect.' },
  { icon: '📋', title: 'Demo Request', desc: 'Want to see DonorConnect in action before committing? Schedule a live walkthrough with our product team.' },
];

const contacts = [
  { icon: '📍', label: 'Our Office', value: '12 Medical Campus Road\nHealthcare District, Chennai — 600003\nTamil Nadu, India' },
  { icon: '📞', label: 'Phone', value: '+91 44 1234 5678\n+91 44 9876 5432' },
  { icon: '📧', label: 'Email', value: 'support@donorconnect.in\npartnerships@donorconnect.in' },
  { icon: '⏰', label: 'Working Hours', value: 'Mon – Fri: 8:00 AM – 8:00 PM\nSaturday: 9:00 AM – 5:00 PM\nEmergency line: 24 / 7' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', org: '', email: '', reason: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div style={{ padding: '60px 0' }}>
      <Container style={{ maxWidth: 1000 }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: 56, padding: '20px 0' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--crimson-pale)', borderRadius: 50,
            padding: '6px 18px', marginBottom: 20,
          }}>
            <span style={{ fontSize: '0.85rem' }}>💬</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--crimson)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Get In Touch</span>
          </div>
          <h1 style={{
            fontFamily: 'Sora', fontWeight: 900,
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
            color: 'var(--text-primary)', lineHeight: 1.15,
            whiteSpace: 'nowrap', marginBottom: 16,
          }}>
            Contact <span style={{ color: 'var(--crimson)' }}>Us</span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)', lineHeight: 1.85,
            fontSize: '1.05rem', margin: 0, maxWidth: 520,
          }}>
            Whether you're a hospital looking to onboard, a developer with a question, or a partner wanting to integrate — we'd love to hear from you.
          </p>
        </div>

        {/* ── Why reach out cards ── */}
        <Row className="g-3" style={{ marginBottom: 56 }}>
          {reasons.map(r => (
            <Col key={r.title} xs={12} sm={6} md={3}>
              <div className="glass-card p-4 h-100">
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--crimson-pale)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', marginBottom: 14,
                }}>{r.icon}</div>
                <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 8 }}>{r.title}</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.75, margin: 0 }}>{r.desc}</p>
              </div>
            </Col>
          ))}
        </Row>

        {/* ── Two column: form + contact info ── */}
        <Row className="g-4">

          {/* Contact form */}
          <Col md={7}>
            <div className="glass-card p-4 h-100">
              <h4 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 6 }}>Send us a message</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 24 }}>We typically respond within one business day.</p>

              {sent ? (
                <div style={{
                  textAlign: 'center', padding: '48px 24px',
                  background: 'var(--crimson-pale)', borderRadius: 14,
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✅</div>
                  <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 8 }}>Message Sent!</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                    Thank you, <strong>{form.name}</strong>. Our team will get back to you at <strong>{form.email}</strong> within one business day.
                  </p>
                  <button
                    className="btn-glass"
                    style={{ marginTop: 20 }}
                    onClick={() => { setSent(false); setForm({ name:'', org:'', email:'', reason:'', message:'' }); }}
                  >Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col xs={12} sm={6}>
                      <label className="form-label">Full Name *</label>
                      <input
                        className="form-control" required
                        placeholder="Dr. Priya Sharma"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <label className="form-label">Organisation</label>
                      <input
                        className="form-control"
                        placeholder="Apollo Hospitals, Chennai"
                        value={form.org}
                        onChange={e => setForm({ ...form, org: e.target.value })}
                      />
                    </Col>
                    <Col xs={12}>
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email" className="form-control" required
                        placeholder="you@hospital.org"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                      />
                    </Col>
                    <Col xs={12}>
                      <label className="form-label">Reason for Contact</label>
                      <select
                        className="form-select"
                        value={form.reason}
                        onChange={e => setForm({ ...form, reason: e.target.value })}
                      >
                        <option value="">Select a reason…</option>
                        <option>Hospital Onboarding</option>
                        <option>Technical Support</option>
                        <option>Partnership & Integration</option>
                        <option>Demo Request</option>
                        <option>General Enquiry</option>
                      </select>
                    </Col>
                    <Col xs={12}>
                      <label className="form-label">Message *</label>
                      <textarea
                        className="form-control" rows={4} required
                        placeholder="Tell us about your blood bank, what you're looking for, or any questions you have…"
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                      />
                    </Col>
                    <Col xs={12}>
                      <button type="submit" className="btn-crimson" style={{ padding: '12px 28px', fontSize: '0.9rem' }}>
                        Send Message →
                      </button>
                    </Col>
                  </Row>
                </form>
              )}
            </div>
          </Col>

          {/* Contact info */}
          <Col md={5}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>

              {contacts.map(c => (
                <div key={c.label} className="glass-card p-4" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: 'var(--crimson-pale)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem',
                  }}>{c.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '0.8rem', color: 'var(--crimson)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>{c.value}</p>
                  </div>
                </div>
              ))}

              {/* Emergency strip */}
              <div style={{
                borderRadius: 14,
                background: 'linear-gradient(135deg, var(--crimson), var(--blood-dark))',
                padding: '20px 22px',
                display: 'flex', gap: 14, alignItems: 'center',
              }}>
                <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>🚨</div>
                <div>
                  <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '0.9rem', color: 'white', marginBottom: 4 }}>Blood Emergency?</div>
                  <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.78rem', lineHeight: 1.6, margin: 0 }}>
                    Call our 24/7 emergency hotline immediately. Do not use this form for urgent blood requests.
                  </p>
                  <div style={{ fontFamily: 'Sora', fontWeight: 900, fontSize: '1.1rem', color: 'white', marginTop: 8 }}>1910</div>
                </div>
              </div>

            </div>
          </Col>
        </Row>

      </Container>
    </div>
  );
}
