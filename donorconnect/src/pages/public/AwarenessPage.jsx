import { useState } from 'react';
import { Container, Row, Col, Accordion } from 'react-bootstrap';

const bloodTypes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

// Full compatibility matrix — medically accurate
const COMPATIBILITY = {
  'A+':  { donateTo: ['A+','AB+'],                         receiveFrom: ['A+','A-','O+','O-'] },
  'A-':  { donateTo: ['A+','A-','AB+','AB-'],              receiveFrom: ['A-','O-'] },
  'B+':  { donateTo: ['B+','AB+'],                         receiveFrom: ['B+','B-','O+','O-'] },
  'B-':  { donateTo: ['B+','B-','AB+','AB-'],              receiveFrom: ['B-','O-'] },
  'AB+': { donateTo: ['AB+'],                              receiveFrom: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  'AB-': { donateTo: ['AB+','AB-'],                        receiveFrom: ['A-','B-','AB-','O-'] },
  'O+':  { donateTo: ['A+','B+','O+','AB+'],               receiveFrom: ['O+','O-'] },
  'O-':  { donateTo: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], receiveFrom: ['O-'] },
};

const FACTS = {
  'A+':  'Second most common blood type (35.7%). Great for A+ and AB+ patients.',
  'A-':  'Rare but versatile — red cells can go to all A and AB patients.',
  'B+':  'Found in about 8.5% of people. Important for B+ and AB+ patients.',
  'B-':  'Very rare (1.5%). B- donors are highly sought after.',
  'AB+': 'Universal recipient — can receive from all blood types.',
  'AB-': 'Rarest type (0.6%) but a universal plasma donor.',
  'O+':  'Most common type (37.4%). Compatible with all positive blood types.',
  'O-':  'Universal donor for red cells — critical in emergencies.',
};

const TYPE_COLORS = {
  'A+': '#E63946', 'A-': '#C1121F',
  'B+': '#3498DB', 'B-': '#2471A3',
  'AB+':'#8B0000', 'AB-':'#6B0F1A',
  'O+': '#27AE60', 'O-': '#1E8449',
};

function BloodTypePill({ type, dim }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 44, padding: '4px 12px', borderRadius: 50,
      fontFamily: 'Sora', fontWeight: 800, fontSize: '0.85rem',
      background: dim ? 'rgba(0,0,0,0.05)' : `${TYPE_COLORS[type]}18`,
      color: dim ? 'var(--text-muted)' : TYPE_COLORS[type],
      border: `1.5px solid ${dim ? 'rgba(0,0,0,0.08)' : TYPE_COLORS[type]}40`,
      transition: 'all 0.2s',
    }}>
      {type}
    </span>
  );
}

function CompatibilityModal({ type, onClose }) {
  const { donateTo, receiveFrom } = COMPATIBILITY[type];
  const color = TYPE_COLORS[type];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1050,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1051, width: '92vw', maxWidth: 520,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)',
        borderRadius: 24,
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        border: '1px solid rgba(255,255,255,0.8)',
        overflow: 'hidden',
        animation: 'slideUp 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          padding: '28px 28px 24px',
          position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)', border: 'none',
            color: 'white', fontSize: '1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, lineHeight: 1,
          }}>✕</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Sora', fontWeight: 900, fontSize: '1.8rem', color: 'white',
            }}>{type}</div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Blood Type</div>
              <div style={{ color: 'white', fontFamily: 'Sora', fontWeight: 800, fontSize: '1.3rem', marginTop: 2 }}>Compatibility Guide</div>
            </div>
          </div>

          <div style={{
            marginTop: 16, background: 'rgba(255,255,255,0.15)',
            borderRadius: 10, padding: '10px 14px',
            color: 'rgba(255,255,255,0.92)', fontSize: '0.8rem', lineHeight: 1.6,
          }}>
            {FACTS[type]}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>

          {/* Can Donate To */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'rgba(231,76,60,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem',
              }}>🩸</div>
              <div>
                <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Can Donate To</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{type} blood can be given to these groups</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {bloodTypes.map(t => (
                <BloodTypePill key={t} type={t} dim={!donateTo.includes(t)} />
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              ✅ {donateTo.length} compatible {donateTo.length === 1 ? 'type' : 'types'}: <strong>{donateTo.join(', ')}</strong>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border-light)', marginBottom: 24 }} />

          {/* Can Receive From */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'rgba(39,174,96,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem',
              }}>💉</div>
              <div>
                <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Can Receive From</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{type} patients can accept blood from these groups</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {bloodTypes.map(t => (
                <BloodTypePill key={t} type={t} dim={!receiveFrom.includes(t)} />
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              ✅ {receiveFrom.length} compatible {receiveFrom.length === 1 ? 'type' : 'types'}: <strong>{receiveFrom.join(', ')}</strong>
            </div>
          </div>

          <div style={{
            marginTop: 20, padding: '10px 14px',
            background: 'rgba(193,18,31,0.05)', borderRadius: 10,
            border: '1px solid rgba(193,18,31,0.1)',
            fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.6,
          }}>
            ⚕️ <strong>Note:</strong> Compatibility shown is for red blood cell transfusions. Plasma and platelet compatibility follows different rules. Always consult a medical professional.
          </div>
        </div>
      </div>
    </>
  );
}

const faqs = [
  ['How often can I donate?', 'Whole blood donors can donate every 56 days. Platelet donors can donate every 7 days.'],
  ['Does donating blood hurt?', 'You may feel a brief pinch when the needle is inserted, but the process is generally painless.'],
  ['How long does donation take?', 'The entire process takes about an hour, with the actual donation taking only 8–10 minutes.'],
  ['What should I eat before donating?', 'Eat a healthy meal and drink extra fluids before donating. Avoid fatty foods.'],
  ['Are there any side effects?', 'Some donors feel light-headed briefly. Serious reactions are very rare.'],
];

export default function AwarenessPage() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ padding: '60px 0' }}>
      {/* Keyframe styles */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>

      <Container>
        <div className="glass-card p-5 mb-5" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🩸</div>
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800 }}>Blood Donation Awareness</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '12px auto 0', lineHeight: 1.7 }}>
            Every two seconds, someone needs blood. Learn how your donation saves lives.
          </p>
        </div>

        <Row className="g-4 mb-5">
          {[
            ['What is Blood Donation?', 'Blood donation is a voluntary procedure where you allow blood to be drawn from your body for use in transfusions or manufactured into biopharmaceutical medications. A healthy adult can donate without any significant risk.'],
            ['Who Can Donate?', 'Generally, donors must be 18–65 years old, weigh at least 45kg, and be in good health. You must not have donated in the last 56 days, and must not have certain medical conditions or recent illnesses.'],
            ['Benefits of Donating', 'Donating blood offers health benefits including reduced risk of heart disease, free health screening, and the profound satisfaction of knowing you have saved lives. Each donation can save up to 3 lives.'],
          ].map(([t, d]) => (
            <Col key={t} md={4}>
              <div className="glass-card p-4 h-100">
                <h5 style={{ fontFamily: 'Sora', fontWeight: 700, color: 'var(--crimson)', marginBottom: 12 }}>{t}</h5>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.875rem', marginBottom: 0 }}>{d}</p>
              </div>
            </Col>
          ))}
        </Row>

        {/* Blood Types Grid */}
        <div className="glass-card p-4 mb-5">
          <h4 style={{ fontFamily: 'Sora', fontWeight: 700, marginBottom: 6 }}>Blood Types Explained</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Click any blood type to see full donation &amp; compatibility details
          </p>
          <Row className="g-3">
            {bloodTypes.map(t => (
              <Col key={t} xs={6} sm={3} md={3}>
                <button
                  onClick={() => setSelected(t)}
                  style={{
                    width: '100%', background: 'var(--crimson-pale)',
                    borderRadius: 12, padding: '20px 12px', textAlign: 'center',
                    border: '2px solid transparent', cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${TYPE_COLORS[t]}18`;
                    e.currentTarget.style.borderColor = `${TYPE_COLORS[t]}60`;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${TYPE_COLORS[t]}25`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--crimson-pale)';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontFamily: 'Sora', fontSize: '1.8rem', fontWeight: 800, color: TYPE_COLORS[t] }}>{t}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Blood Group</div>
                  <div style={{ fontSize: '0.65rem', color: TYPE_COLORS[t], marginTop: 6, opacity: 0.8, fontWeight: 600 }}>
                    tap to explore →
                  </div>
                </button>
              </Col>
            ))}
          </Row>
        </div>

        {/* FAQ */}
        <div className="glass-card p-4">
          <h4 style={{ fontFamily: 'Sora', fontWeight: 700, marginBottom: 20 }}>Frequently Asked Questions</h4>
          <Accordion flush>
            {faqs.map(([q, a], i) => (
              <Accordion.Item key={i} eventKey={String(i)} style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-light)' }}>
                <Accordion.Header style={{ fontWeight: 600, fontSize: '0.9rem' }}>{q}</Accordion.Header>
                <Accordion.Body style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>{a}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </Container>

      {/* Compatibility Modal */}
      {selected && (
        <CompatibilityModal type={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
