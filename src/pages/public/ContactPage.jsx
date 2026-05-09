import { Container, Row, Col } from 'react-bootstrap';
export default function ContactPage() {
  return (
    <div style={{ padding: '60px 0' }}>
      <Container style={{ maxWidth: 700 }}>
        <div className="glass-card p-5 mb-4" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800 }}>Contact Us</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Reach out to the DonorConnect team</p>
        </div>
        <Row className="g-4">
          {[['📍 Address','123 Medical Centre Road, Healthcare District, Chennai - 600001, Tamil Nadu, India'],['📞 Phone','+91 44 1234 5678\n+91 44 9876 5432'],['📧 Email','support@donorconnect.in\nadmin@donorconnect.in'],['⏰ Hours','Monday – Friday: 8:00 AM – 8:00 PM\nSaturday: 9:00 AM – 5:00 PM\nEmergency: 24/7']].map(([t,d]) => (
            <Col key={t} sm={6}>
              <div className="glass-card p-4">
                <div style={{ fontFamily: 'Sora', fontWeight: 700, marginBottom: 8, color: 'var(--crimson)' }}>{t}</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: 0 }}>{d}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}
