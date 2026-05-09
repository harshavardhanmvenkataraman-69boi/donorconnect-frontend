import { Container, Row, Col } from 'react-bootstrap';

const features = [
  {
    icon: '🫀',
    title: 'Donor Management',
    desc: 'End-to-end donor lifecycle management — register, screen, schedule, defer, and track every donor with full history and health records in one place.',
  },
  {
    icon: '🩸',
    title: 'Blood Supply Chain',
    desc: 'From donation collection to component processing and lab testing, every unit is tracked with mandatory quarantine controls and recall capabilities.',
  },
  {
    icon: '📦',
    title: 'Real-Time Inventory',
    desc: 'Live stock levels across all blood groups and components, with automated expiry alerts, low-stock notifications, and full transaction traceability.',
  },
  {
    icon: '🔗',
    title: 'Transfusion Workflow',
    desc: 'Crossmatch compatibility checks, one-click blood issuance, return tracking, and adverse reaction monitoring keep every transfusion safe.',
  },
  {
    icon: '📋',
    title: 'Audit & Compliance',
    desc: 'Immutable audit logs capture every action across every role — meeting NACO, WHO, and NABH compliance requirements with zero manual effort.',
  },
  {
    icon: '📈',
    title: 'Reports & Analytics',
    desc: 'Scheduled reports, billing summaries, and operational dashboards give administrators complete visibility into every corner of the blood bank.',
  },
];

const audiences = [
  {
    icon: '🏥',
    who: 'Hospital Blood Banks',
    pain: 'Paper registers, mismatched stock, and manual crossmatch records put patients at risk.',
    gain: 'DonorConnect replaces every paper form with a live, role-based digital workflow — reducing errors, saving staff hours, and ensuring every unit is traceable from vein to vein.',
  },
  {
    icon: '🚑',
    who: 'Standalone Blood Banks',
    pain: 'Managing donors, drives, components, and billing across disconnected spreadsheets is unsustainable.',
    gain: 'One integrated platform handles everything — donor registry, lab results, inventory, transfusion, and billing — so your team focuses on saving lives, not chasing data.',
  },
  {
    icon: '🏛️',
    who: 'Healthcare Administrators',
    pain: 'No real-time visibility into stock levels, expiry risks, or compliance status across the organisation.',
    gain: 'Live dashboards, automated expiry watches, and a full audit trail give leadership the oversight they need to stay compliant and proactive.',
  },
];

const stats = [
  { value: '8', label: 'Microservices', sub: 'independently scalable' },
  { value: '30+', label: 'API Endpoints', sub: 'fully documented' },
  { value: '6', label: 'User Roles', sub: 'fine-grained access' },
  { value: '100%', label: 'Audit Coverage', sub: 'every action logged' },
];

const techStack = [
  { icon: '⚛️', name: 'React + Bootstrap', role: 'Frontend UI' },
  { icon: '☕', name: 'Spring Boot', role: 'Microservices Backend' },
  { icon: '🔀', name: 'Apache Kafka', role: 'Event Streaming' },
  { icon: '🔐', name: 'Spring Security + JWT', role: 'Auth & Roles' },
  { icon: '🌐', name: 'Spring Cloud Gateway', role: 'API Gateway' },
  { icon: '🗄️', name: 'MySQL', role: 'Data Storage' },
];

export default function AboutPage() {
  return (
    <div style={{ padding: '60px 0' }}>
      <Container style={{ maxWidth: 960 }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: 64, padding: '20px 0' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--crimson-pale)', borderRadius: 50,
            padding: '6px 18px', marginBottom: 20,
          }}>
            <span style={{ fontSize: '0.85rem' }}>🩸</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--crimson)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Our Story</span>
          </div>
          <h1 style={{
            fontFamily: 'Sora', fontWeight: 900,
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
            color: 'var(--text-primary)', lineHeight: 1.15,
            whiteSpace: 'nowrap', marginBottom: 16,
          }}>
            About <span style={{ color: 'var(--crimson)' }}>DonorConnect</span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)', lineHeight: 1.85,
            fontSize: '1.05rem', margin: 0, maxWidth: 560,
          }}>
            A purpose-built Blood Bank Management System that digitizes every step of the blood supply chain — designed for hospitals, blood banks, and the patients who depend on them.
          </p>
        </div>

        {/* ── Mission statement ── */}
        <div style={{
          marginBottom: 64,
          background: 'linear-gradient(135deg, var(--crimson), var(--blood-dark))',
          borderRadius: 20, padding: '40px 44px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-30, left:-20, width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontSize:'0.72rem', fontWeight:700, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>Our Mission</div>
            <p style={{ fontFamily:'Sora', fontWeight:700, fontSize:'clamp(1.2rem, 2.5vw, 1.6rem)', color:'white', lineHeight:1.5, marginBottom:16, maxWidth:680 }}>
              "To eliminate preventable deaths caused by blood shortages and transfusion errors — by giving every blood bank the technology it deserves."
            </p>
            <p style={{ color:'rgba(255,255,255,0.72)', fontSize:'0.95rem', lineHeight:1.8, margin:0, maxWidth:620 }}>
              Blood cannot be manufactured. It can only come from people — and it must reach patients safely, at the right time, in the right quantity. DonorConnect exists to make that happen, reliably, every single day.
            </p>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <Row className="g-3" style={{ marginBottom: 64 }}>
          {stats.map(s => (
            <Col key={s.label} xs={6} md={3}>
              <div className="glass-card p-4" style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'Sora', fontWeight:900, fontSize:'2rem', color:'var(--crimson)', lineHeight:1 }}>{s.value}</div>
                <div style={{ fontFamily:'Sora', fontWeight:700, fontSize:'0.85rem', color:'var(--text-primary)', marginTop:6 }}>{s.label}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:3 }}>{s.sub}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* ── What we offer ── */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily:'Sora', fontWeight:800, fontSize:'1.7rem', color:'var(--text-primary)', marginBottom:8 }}>
              Everything a blood bank needs, <span style={{ color:'var(--crimson)' }}>in one platform</span>
            </h2>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.95rem', lineHeight:1.75, maxWidth:560, margin:0 }}>
              DonorConnect covers the complete operational workflow — no integrations needed, no data gaps, no compromises on safety.
            </p>
          </div>
          <Row className="g-4">
            {features.map(f => (
              <Col key={f.title} md={4}>
                <div className="glass-card p-4 h-100" style={{ transition:'all 0.2s' }}>
                  <div style={{
                    width:44, height:44, borderRadius:12,
                    background:'var(--crimson-pale)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'1.3rem', marginBottom:16,
                  }}>{f.icon}</div>
                  <h5 style={{ fontFamily:'Sora', fontWeight:700, fontSize:'0.95rem', color:'var(--text-primary)', marginBottom:10 }}>{f.title}</h5>
                  <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', lineHeight:1.75, margin:0 }}>{f.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* ── Who it's for ── */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily:'Sora', fontWeight:800, fontSize:'1.7rem', color:'var(--text-primary)', marginBottom:8 }}>
              Built for the people <span style={{ color:'var(--crimson)' }}>on the front line</span>
            </h2>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.95rem', lineHeight:1.75, maxWidth:560, margin:0 }}>
              Whether you run a hospital blood bank or a standalone donation centre, DonorConnect is designed around your real-world workflow.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {audiences.map(a => (
              <div key={a.who} className="glass-card p-4" style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
                <div style={{
                  width:52, height:52, borderRadius:14, flexShrink:0,
                  background:'var(--crimson-pale)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.5rem',
                }}>{a.icon}</div>
                <div>
                  <div style={{ fontFamily:'Sora', fontWeight:800, fontSize:'1rem', color:'var(--text-primary)', marginBottom:6 }}>{a.who}</div>
                  <p style={{ color:'var(--text-muted)', fontSize:'0.83rem', lineHeight:1.7, marginBottom:8 }}>
                    <strong style={{ color:'var(--text-secondary)' }}>The problem:</strong> {a.pain}
                  </p>
                  <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', lineHeight:1.75, margin:0 }}>
                    <strong style={{ color:'var(--crimson)' }}>DonorConnect:</strong> {a.gain}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Role-based access ── */}
        <div style={{ marginBottom: 64 }}>
          <div className="glass-card p-4">
            <h4 style={{ fontFamily:'Sora', fontWeight:800, fontSize:'1.2rem', color:'var(--text-primary)', marginBottom:8 }}>Designed for every role in your organisation</h4>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem', lineHeight:1.75, marginBottom:20, maxWidth:600 }}>
              Six dedicated role profiles ensure every team member sees exactly what they need — nothing more, nothing less. Receptionists register donors. Lab technicians process components. Transfusion officers issue blood. Admins oversee everything.
            </p>
            <Row className="g-2">
              {[
                ['👑', 'Admin', 'Full system access, audit logs, user management'],
                ['🏥', 'Reception', 'Donor registration, appointments, blood drives'],
                ['🔬', 'Lab Technician', 'Donations, component processing, test results'],
                ['📦', 'Inventory Controller', 'Stock management, expiry tracking, transactions'],
                ['💉', 'Transfusion Officer', 'Crossmatch, blood issuance, adverse reactions'],
                ['🫀', 'Donor', 'Personal portal, history, appointments, notifications'],
              ].map(([icon, role, desc]) => (
                <Col key={role} sm={6}>
                  <div style={{
                    display:'flex', alignItems:'center', gap:12,
                    background:'var(--crimson-pale)', borderRadius:10, padding:'12px 16px',
                  }}>
                    <span style={{ fontSize:'1.1rem' }}>{icon}</span>
                    <div>
                      <div style={{ fontFamily:'Sora', fontWeight:700, fontSize:'0.82rem', color:'var(--crimson)' }}>{role}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{desc}</div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* ── Technology stack ── */}
        <div>
          <div className="glass-card p-4">
            <h4 style={{ fontFamily:'Sora', fontWeight:800, fontSize:'1.2rem', color:'var(--text-primary)', marginBottom:8 }}>Built on enterprise-grade technology</h4>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem', lineHeight:1.75, marginBottom:20, maxWidth:600 }}>
              A microservices architecture with event-driven communication means DonorConnect scales with your institution — from a single blood bank to a network of hospitals.
            </p>
            <Row className="g-3">
              {techStack.map(t => (
                <Col key={t.name} sm={6} md={4}>
                  <div style={{
                    display:'flex', alignItems:'center', gap:12,
                    background:'var(--crimson-pale)', borderRadius:10, padding:'12px 16px',
                  }}>
                    <span style={{ fontSize:'1.2rem' }}>{t.icon}</span>
                    <div>
                      <div style={{ fontFamily:'Sora', fontWeight:700, fontSize:'0.8rem', color:'var(--crimson)' }}>{t.name}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:2 }}>{t.role}</div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>

      </Container>
    </div>
  );
}
