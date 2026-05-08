import { Outlet, NavLink, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

export default function PublicLayout() {
  return (
    <>
      <div className="app-background"></div>
      <Navbar expand="lg" className="public-nav sticky-top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="nav-brand">
            <div className="nav-brand-icon">🩸</div>
            DonorConnect
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="mx-auto gap-1">
              {[['/', 'Home'], ['/about', 'About'], ['/policies', 'Policies'], ['/awareness', 'Awareness'], ['/contact', 'Contact']].map(([to, label]) => (
                <NavLink key={to} to={to} end className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded-3 fw-500 ${isActive ? 'text-crimson' : 'text-secondary'}`
                } style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</NavLink>
              ))}
            </Nav>
            <Link to="/dashboard/donors/register">
              <button className="btn-crimson">Register →</button>
            </Link>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
      <footer style={{
        background: 'linear-gradient(160deg, #1a0408 0%, #2d0810 40%, #1a0005 100%)',
        color: 'white',
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-60, left:-60, width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle, rgba(193,18,31,0.10) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,0,0,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />

        <Container style={{ position:'relative', zIndex:1 }}>

          {/* Main row */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:40, paddingBottom:28, borderBottom:'1px solid rgba(255,255,255,0.08)', alignItems:'start' }}>

            {/* Brand */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:38, height:38, background:'linear-gradient(135deg,#E63946,#8B0000)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>🩸</div>
                <div>
                  <div style={{ fontFamily:'Sora', fontWeight:800, fontSize:'1.1rem', lineHeight:1 }}>DonorConnect</div>
                  <div style={{ fontSize:'0.68rem', opacity:0.45, marginTop:3, letterSpacing:'0.05em', textTransform:'uppercase' }}>Blood Bank System</div>
                </div>
              </div>
              <p style={{ opacity:0.5, fontSize:'0.82rem', lineHeight:1.7, maxWidth:260, margin:0 }}>
                Connecting donors, staff, and life-saving resources in real-time.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <div style={{ fontFamily:'Sora', fontWeight:700, fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.1em', opacity:0.4, marginBottom:14 }}>Navigation</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[['/', 'Home'], ['/about', 'About Us'], ['/awareness', 'Awareness'], ['/policies', 'Policies']].map(([to, label]) => (
                  <Link key={to} to={to} style={{ color:'rgba(255,255,255,0.55)', textDecoration:'none', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:7, transition:'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color='white'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.55)'}>
                    <span style={{ width:3, height:3, borderRadius:'50%', background:'rgba(193,18,31,0.8)', flexShrink:0 }} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ paddingTop:18, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <p style={{ opacity:0.3, fontSize:'0.75rem', margin:0 }}>
              © {new Date().getFullYear()} DonorConnect. All rights reserved.
            </p>
            <div style={{ display:'flex', gap:18 }}>
              {[['Privacy Policy','/policies'],['Terms of Use','/policies']].map(([l, to]) => (
                <Link key={l} to={to} style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none', fontSize:'0.73rem', transition:'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.65)'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
                  {l}
                </Link>
              ))}
            </div>
          </div>

        </Container>
      </footer>
    </>
  );
}
