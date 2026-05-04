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
            <Link to="/login">
              <button className="btn-crimson">Login →</button>
            </Link>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
      <footer className="public-footer">
        <Container>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="nav-brand-icon">🩸</div>
            <div>
              <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '1.1rem' }}>DonorConnect</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Blood Bank Management System</div>
            </div>
          </div>
          <p style={{ opacity: 0.6, fontSize: '0.8rem' }}>Saving Lives Through Every Drop. Built for modern blood bank management.</p>
          <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          <p style={{ opacity: 0.4, fontSize: '0.75rem', marginBottom: 0 }}>© 2024 DonorConnect. All rights reserved.</p>
        </Container>
      </footer>
    </>
  );
}
