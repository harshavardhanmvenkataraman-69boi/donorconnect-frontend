import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

const features = [
  { icon: '🫀', title: 'Donor Management', desc: 'Comprehensive donor registry with full lifecycle tracking from registration through scheduling and deferral management.' },
  { icon: '💉', title: 'Safe Transfusions', desc: 'End-to-end crossmatch workflows, compatibility checks, and adverse reaction monitoring for maximum patient safety.' },
  { icon: '📦', title: 'Real-time Inventory', desc: 'Live blood stock monitoring with expiry alerts, low-stock notifications, and complete transaction traceability.' },
];
const stats = [{ n: '1,000+', l: 'Registered Donors' }, { n: '50+', l: 'Blood Drives' }, { n: '10,000+', l: 'Lives Saved' }, { n: '99.9%', l: 'System Uptime' }];

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
            <Col lg={6} className="mt-5 mt-lg-0">
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
            </Col>
          </Row>
        </Container>
      </section>

      <section style={{ padding:'60px 0', background:'linear-gradient(135deg, var(--crimson), var(--blood-dark))' }}>
        <Container>
          <Row className="text-center">
            {stats.map(s => (
              <Col key={s.n} xs={6} md={3}>
                <div style={{ color:'white',padding:'20px 0' }}>
                  <div style={{ fontFamily:'Sora',fontSize:'2.5rem',fontWeight:800 }}>{s.n}</div>
                  <div style={{ opacity:0.75,fontSize:'0.875rem',marginTop:4 }}>{s.l}</div>
                </div>
              </Col>
            ))}
          </Row>
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
