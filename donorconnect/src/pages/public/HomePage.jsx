import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useState, useEffect, useRef } from 'react';

const features = [
  { icon: '🫀', title: 'Donor Management', desc: 'Comprehensive donor registry with full lifecycle tracking from registration through scheduling and deferral management.' },
  { icon: '💉', title: 'Safe Transfusions', desc: 'End-to-end crossmatch workflows, compatibility checks, and adverse reaction monitoring for maximum patient safety.' },
  { icon: '📦', title: 'Real-time Inventory', desc: 'Live blood stock monitoring with expiry alerts, low-stock notifications, and complete transaction traceability.' },
];

const statsConfig = [
  { target: 1000,  suffix: '+', label: 'Registered Donors', decimals: 0 },
  { target: 50,    suffix: '+', label: 'Blood Drives',       decimals: 0 },
  { target: 10000, suffix: '+', label: 'Lives Saved',        decimals: 0 },
  { target: 99.9,  suffix: '%', label: 'System Uptime',      decimals: 1 },
];

function useCountUp(target, decimals, duration, start) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((ease * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start]);
  return value;
}

function AnimatedStat({ target, suffix, label, decimals, started }) {
  const value = useCountUp(target, decimals, 2000, started);
  const display = decimals > 0
    ? value.toFixed(decimals)
    : Math.floor(value).toLocaleString();
  return (
    <div style={{ color:'white', padding:'20px 0' }}>
      <div style={{ fontFamily:'Sora', fontSize:'2.5rem', fontWeight:800 }}>
        {display}{suffix}
      </div>
      <div style={{ opacity:0.75, fontSize:'0.875rem', marginTop:4 }}>{label}</div>
    </div>
  );
}

function StatsSection() {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ padding:'60px 0', background:'linear-gradient(135deg, var(--crimson), var(--blood-dark))' }}>
      <Container>
        <Row className="text-center">
          {statsConfig.map(s => (
            <Col key={s.label} xs={6} md={3}>
              <AnimatedStat {...s} started={started} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-glow"></div>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="animate-fadeup">
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--crimson-pale)', borderRadius:50, padding:'6px 14px', marginBottom:20 }}>
                <span style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--crimson)', textTransform:'uppercase', letterSpacing:'0.05em' }}>🩸 Life-Saving Technology</span>
              </div>
              <h1 className="hero-title">Saving Lives Through <span>Every Drop</span></h1>
              <p className="hero-subtitle">DonorConnect is a complete blood bank management platform — connecting donors, staff, and life-saving resources in real-time.</p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/login"><button className="btn-crimson" style={{ padding:'14px 28px', fontSize:'1rem' }}>Book Appointment →</button></Link>
                <Link to="/awareness"><button className="btn-glass" style={{ padding:'13px 24px', fontSize:'0.95rem' }}>Learn About Donating</button></Link>
              </div>
            </Col>
            {/* <Col lg={6} className="mt-5 mt-lg-0">
              <div style={{ position:'relative' }}>
                <div className="glass-card p-4" style={{ maxWidth:380, margin:'0 auto' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                    <div style={{ width:48,height:48,borderRadius:12,background:'linear-gradient(135deg,#E63946,#8B0000)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'1.3rem' }}>🩸</div>
                    <div><div style={{ fontFamily:'Sora',fontWeight:700 }}>Blood Inventory</div><div style={{ fontSize:'0.75rem',color:'var(--text-muted)' }}>Live Status</div></div>
                  </div>
                  {[['A+','82%','var(--success)'],['B+','61%','var(--info)'],['O-','34%','var(--warning)'],['AB+','78%','var(--crimson)']].map(([g,p,c]) => (
                    <div key={g} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:'0.8rem',fontWeight:600 }}><span>{g}</span><span style={{ color:c }}>{p}</span></div>
                      <div style={{ height:6,borderRadius:3,background:'rgba(0,0,0,0.06)' }}><div style={{ width:p,height:'100%',borderRadius:3,background:c,transition:'width 0.8s ease' }}></div></div>
                    </div>
                  ))}
                </div>
              </div>
            </Col> */}
          </Row>
        </Container>
      </section>

      <StatsSection />

      {/* ===== HOW DONATION WORKS ===== */}
      <section style={{ padding:'80px 0', background:'linear-gradient(160deg, #fff5f6 0%, #ffeaec 60%, #fff0f2 100%)', position:'relative', overflow:'hidden' }}>
        {/* Background decorative blobs */}
        <div style={{ position:'absolute', top:-80, left:-80, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(193,18,31,0.07) 0%, transparent 70%)', pointerEvents:'none' }}></div>
        <div style={{ position:'absolute', bottom:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,0,0,0.05) 0%, transparent 70%)', pointerEvents:'none' }}></div>

        <Container>
          {/* Heading */}
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <h2 style={{ fontFamily:'Sora', fontWeight:800, fontSize:'2.1rem', color:'var(--crimson-deep)', marginBottom:12 }}>How Donation Works</h2>
            <p style={{ color:'var(--text-secondary)', maxWidth:440, margin:'0 auto', fontSize:'0.95rem', lineHeight:1.7 }}>
              Register, get a quick health check, and donate —<br />a simple process to help save lives.
            </p>
          </div>

          {/* Steps row */}
          <div style={{ position:'relative', display:'flex', alignItems:'flex-start', justifyContent:'center', gap:0 }}>

            {/* Dashed connecting line behind the icons */}
            <div style={{
              position:'absolute',
              top: 36,
              left:'15%',
              right:'15%',
              height:2,
              borderTop:'2.5px dashed rgba(193,18,31,0.25)',
              zIndex:0,
            }}></div>

            {/* Step 1 – Registration */}
            <div style={{ flex:1, textAlign:'center', padding:'0 16px', position:'relative', zIndex:1 }}>
              <div style={{
                width:72, height:72, borderRadius:'50%',
                background:'white',
                border:'2px solid rgba(193,18,31,0.18)',
                boxShadow:'0 4px 18px rgba(193,18,31,0.10)',
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 20px',
                fontSize:'1.9rem',
              }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="3" width="22" height="26" rx="3" stroke="#C1121F" strokeWidth="2" fill="none"/>
                  <line x1="10" y1="10" x2="22" y2="10" stroke="#C1121F" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="10" y1="15" x2="22" y2="15" stroke="#C1121F" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="10" y1="20" x2="17" y2="20" stroke="#C1121F" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="23" cy="25" r="5" fill="#fff" stroke="#C1121F" strokeWidth="1.5"/>
                  <line x1="21" y1="25" x2="23" y2="27" stroke="#C1121F" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="23" y1="27" x2="26" y2="23" stroke="#C1121F" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h5 style={{ fontFamily:'Sora', fontWeight:700, fontSize:'1rem', color:'var(--text-primary)', marginBottom:8 }}>Registration Process</h5>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', lineHeight:1.7, maxWidth:180, margin:'0 auto' }}>
                Sign up and schedule your first donation with ease
              </p>
            </div>

            {/* Step 2 – Health Screening */}
            <div style={{ flex:1, textAlign:'center', padding:'0 16px', position:'relative', zIndex:1 }}>
              <div style={{
                width:72, height:72, borderRadius:'50%',
                background:'white',
                border:'2px solid rgba(193,18,31,0.18)',
                boxShadow:'0 4px 18px rgba(193,18,31,0.10)',
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 20px',
              }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="3" width="20" height="26" rx="3" stroke="#C1121F" strokeWidth="2" fill="none"/>
                  <polyline points="10,17 13,14 16,20 19,12 22,17" stroke="#C1121F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <line x1="10" y1="23" x2="14" y2="23" stroke="#C1121F" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="24" cy="8" r="4" fill="#C1121F"/>
                  <line x1="22.5" y1="8" x2="25.5" y2="8" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                  <line x1="24" y1="6.5" x2="24" y2="9.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <h5 style={{ fontFamily:'Sora', fontWeight:700, fontSize:'1rem', color:'var(--text-primary)', marginBottom:8 }}>Health Screening</h5>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', lineHeight:1.7, maxWidth:180, margin:'0 auto' }}>
                A simple check-up to ensure you're ready to donate
              </p>
            </div>

            {/* Step 3 – Donation Day */}
            <div style={{ flex:1, textAlign:'center', padding:'0 16px', position:'relative', zIndex:1 }}>
              <div style={{
                width:72, height:72, borderRadius:'50%',
                background:'white',
                border:'2px solid rgba(193,18,31,0.18)',
                boxShadow:'0 4px 18px rgba(193,18,31,0.10)',
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 20px',
              }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Cupped hands */}
                  <path d="M6 22 C6 22 8 26 16 26 C24 26 26 22 26 22" stroke="#C1121F" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                  <path d="M8 22 C7 20 7 17 10 17 L22 17 C25 17 25 20 24 22" stroke="#C1121F" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                  {/* Blood drop */}
                  <path d="M16 6 C16 6 11 12 11 15.5 C11 18 13.2 20 16 20 C18.8 20 21 18 21 15.5 C21 12 16 6 16 6Z" fill="#C1121F" opacity="0.85"/>
                  <ellipse cx="14.5" cy="14.5" rx="1.2" ry="1.8" fill="white" opacity="0.5" transform="rotate(-20 14.5 14.5)"/>
                </svg>
              </div>
              <h5 style={{ fontFamily:'Sora', fontWeight:700, fontSize:'1rem', color:'var(--text-primary)', marginBottom:8 }}>Donation Day</h5>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', lineHeight:1.7, maxWidth:180, margin:'0 auto' }}>
                Relax as our professional staff guide you through
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section style={{ padding:'80px 0' }}>
        <Container>
          <div style={{ textAlign:'center',marginBottom:48 }}>
            <h2 style={{ fontFamily:'Sora',fontWeight:800,fontSize:'2rem' }}>Everything Your Blood Bank Needs</h2>
            <p style={{ color:'var(--text-muted)',maxWidth:500,margin:'12px auto 0' }}>A fully integrated platform built for modern healthcare workflows.</p>
          </div>
          <Row className="g-4">
            {features.map(f => (
              <Col key={f.title} md={4}>
                <div className="glass-card p-4 h-100" style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'3rem',marginBottom:16 }}>{f.icon}</div>
                  <h5 style={{ fontFamily:'Sora',fontWeight:700,marginBottom:10 }}>{f.title}</h5>
                  <p style={{ color:'var(--text-secondary)',fontSize:'0.875rem',lineHeight:1.7,marginBottom:0 }}>{f.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </>
  );
}
