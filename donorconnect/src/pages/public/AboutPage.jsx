import { Container, Row, Col } from 'react-bootstrap';
export default function AboutPage() {
  return (
    <div style={{ padding: '60px 0' }}>
      <Container style={{ maxWidth: 900 }}>
        <div className="glass-card p-5 mb-4" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800, marginBottom: 12 }}>About DonorConnect</h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>DonorConnect is a comprehensive Blood Bank Management System built to modernize and digitize blood banking operations — from donor registration to transfusion safety.</p>
        </div>
        <div className="glass-card p-4">
          <h4 style={{ fontFamily: 'Sora', fontWeight: 700, marginBottom: 16 }}>Our Mission</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>To build technology that bridges the gap between blood donors and patients in need, ensuring safe, efficient, and traceable blood supply management for hospitals and blood banks across India.</p>
          <hr className="divider" />
          <h4 style={{ fontFamily: 'Sora', fontWeight: 700, marginBottom: 16 }}>Technology Stack</h4>
          <Row className="g-3">
            {['React + Bootstrap (Frontend)', 'Spring Boot Microservices (Backend)', 'Apache Kafka (Event Streaming)', 'Spring Security + JWT (Auth)', 'Spring Cloud Gateway (API Gateway)', 'MySQL (Data Storage)'].map(t => (
              <Col key={t} sm={6}>
                <div style={{ background: 'var(--crimson-pale)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--crimson)' }}>✓ {t}</div>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </div>
  );
}
