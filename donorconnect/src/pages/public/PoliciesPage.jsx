import { Container, Accordion } from 'react-bootstrap';

const policies = [
  ['Drugs and Cosmetics Act, 1940', 'Regulates the import, manufacture, and distribution of drugs and cosmetics in India. Blood and blood products fall under Schedule C of this Act, requiring strict quality standards and licensing for blood banks.'],
  ['NACO Guidelines on Blood Safety', 'The National AIDS Control Organisation mandates mandatory testing of all donated blood for HIV, Hepatitis B, Hepatitis C, Syphilis, and Malaria before use in transfusion.'],
  ['National Blood Transfusion Policy 2007', 'Establishes a framework for a voluntary, non-remunerated blood donation system. Prohibits commercial blood donation and mandates proper donor selection, collection, processing, storage, and distribution.'],
  ['Clinical Establishments Act, 2010', 'Regulates clinical establishments including blood banks, requiring registration, compliance with minimum standards, and adherence to prescribed protocols for patient safety.'],
  ['WHO Blood Safety Guidelines', 'World Health Organization guidelines adopted in India for universal precautions, sterile technique, proper labeling, traceability, and post-transfusion surveillance.'],
  ['NABH Standards for Blood Banks', 'National Accreditation Board for Hospitals and Healthcare Providers standards ensure quality management, infrastructure requirements, competency of personnel, and documentation for blood banks.'],
];

export default function PoliciesPage() {
  return (
    <div style={{ padding: '60px 0' }}>
      <Container style={{ maxWidth: 800 }}>

        {/* Hero banner with illustration */}
        <div style={{
          marginBottom: 48,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #fff0f0 0%, #fde8ea 50%, #fdf0f2 100%)',
          border: '1px solid rgba(193,18,31,0.08)',
          boxShadow: '0 8px 40px rgba(193,18,31,0.07)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          minHeight: 220,
          position: 'relative',
        }}>
          {/* Subtle background circles */}
          <div style={{ position:'absolute', top:-40, right:120, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(193,18,31,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-30, right:20, width:150, height:150, borderRadius:'50%', background:'radial-gradient(circle, rgba(193,18,31,0.04) 0%, transparent 70%)', pointerEvents:'none' }} />

          {/* Left — text */}
          <div style={{ flex: 1, padding: '40px 40px 40px 44px', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(193,18,31,0.1)', borderRadius: 50,
              padding: '5px 14px', marginBottom: 18,
            }}>
              <span style={{ fontSize: '0.75rem' }}>⚖️</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--crimson)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Compliance & Regulation</span>
            </div>
            <h1 style={{
              fontFamily: 'Sora', fontWeight: 900,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              color: 'var(--text-primary)', lineHeight: 1.15,
              marginBottom: 14,
            }}>
              Regulatory <span style={{ color: 'var(--crimson)' }}>Policies</span>
            </h1>
            <p style={{
              color: 'var(--text-secondary)', lineHeight: 1.75,
              fontSize: '0.95rem', margin: 0, maxWidth: 400,
            }}>
              Government acts and guidelines governing blood donation and banking in India — ensuring every process meets the highest safety standards.
            </p>
          </div>

          {/* Right — SVG illustration */}
          <div style={{ flexShrink: 0, padding: '24px 40px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">

              {/* ── Document base ── */}
              <rect x="54" y="28" width="92" height="118" rx="8" fill="white" opacity="0.9"/>
              <rect x="54" y="28" width="92" height="118" rx="8" stroke="rgba(193,18,31,0.15)" strokeWidth="1.5"/>

              {/* Doc fold corner */}
              <path d="M124 28 L146 50 L124 50 Z" fill="rgba(193,18,31,0.08)"/>
              <path d="M124 28 L146 50 L124 50" stroke="rgba(193,18,31,0.2)" strokeWidth="1" fill="none"/>

              {/* Text lines on doc */}
              <rect x="66" y="60" width="52" height="5" rx="2.5" fill="rgba(193,18,31,0.18)"/>
              <rect x="66" y="72" width="64" height="4" rx="2" fill="rgba(0,0,0,0.07)"/>
              <rect x="66" y="82" width="58" height="4" rx="2" fill="rgba(0,0,0,0.07)"/>
              <rect x="66" y="92" width="62" height="4" rx="2" fill="rgba(0,0,0,0.07)"/>
              <rect x="66" y="102" width="44" height="4" rx="2" fill="rgba(0,0,0,0.07)"/>
              <rect x="66" y="116" width="30" height="4" rx="2" fill="rgba(193,18,31,0.12)"/>
              <rect x="66" y="126" width="30" height="4" rx="2" fill="rgba(193,18,31,0.12)"/>

              {/* ── Scales of justice — centred top ── */}
              {/* Central pole */}
              <line x1="100" y1="10" x2="100" y2="52" stroke="#C1121F" strokeWidth="2.5" strokeLinecap="round"/>
              {/* Top sphere */}
              <circle cx="100" cy="9" r="4" fill="#C1121F"/>

              {/* Cross beam */}
              <line x1="68" y1="26" x2="132" y2="26" stroke="#C1121F" strokeWidth="2" strokeLinecap="round"/>

              {/* Left chain */}
              <line x1="72" y1="26" x2="68" y2="38" stroke="#C1121F" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
              {/* Right chain */}
              <line x1="128" y1="26" x2="132" y2="38" stroke="#C1121F" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>

              {/* Left pan */}
              <path d="M58 38 Q68 44 78 38" stroke="#C1121F" strokeWidth="2" fill="rgba(193,18,31,0.12)" strokeLinecap="round"/>
              {/* Right pan — slightly lower (tipped) */}
              <path d="M122 42 Q132 48 142 42" stroke="#C1121F" strokeWidth="2" fill="rgba(193,18,31,0.12)" strokeLinecap="round"/>

              {/* ── Shield badge bottom-right ── */}
              <path d="M148 130 C148 130 162 124 162 116 L162 106 L148 102 L134 106 L134 116 C134 124 148 130 148 130Z"
                fill="rgba(193,18,31,0.12)" stroke="rgba(193,18,31,0.35)" strokeWidth="1.5"/>
              {/* Tick inside shield */}
              <path d="M142 114 L146 118 L154 110" stroke="#C1121F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

              {/* ── Small floating tags ── */}
              <rect x="20" y="70" width="26" height="18" rx="5" fill="rgba(193,18,31,0.10)" stroke="rgba(193,18,31,0.2)" strokeWidth="1"/>
              <text x="33" y="83" textAnchor="middle" fontFamily="Sora" fontSize="7" fontWeight="700" fill="#C1121F">ACT</text>

              <rect x="154" y="75" width="30" height="18" rx="5" fill="rgba(193,18,31,0.10)" stroke="rgba(193,18,31,0.2)" strokeWidth="1"/>
              <text x="169" y="88" textAnchor="middle" fontFamily="Sora" fontSize="7" fontWeight="700" fill="#C1121F">WHO</text>

              <rect x="26" y="110" width="32" height="18" rx="5" fill="rgba(193,18,31,0.10)" stroke="rgba(193,18,31,0.2)" strokeWidth="1"/>
              <text x="42" y="123" textAnchor="middle" fontFamily="Sora" fontSize="7" fontWeight="700" fill="#C1121F">NACO</text>

            </svg>
          </div>
        </div>

        <div className="glass-card p-4">
          <Accordion flush>
            {policies.map(([title, desc], i) => (
              <Accordion.Item key={i} eventKey={String(i)} style={{ background: 'transparent', borderBottom: '1px solid var(--border-light)' }}>
                <Accordion.Header><span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</span></Accordion.Header>
                <Accordion.Body style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.8 }}>{desc}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </Container>
    </div>
  );
}
