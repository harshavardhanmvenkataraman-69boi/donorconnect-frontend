import { Container, Row, Col, Accordion } from 'react-bootstrap';
const bloodTypes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const faqs = [
  ['How often can I donate?', 'Whole blood donors can donate every 56 days. Platelet donors can donate every 7 days.'],
  ['Does donating blood hurt?', 'You may feel a brief pinch when the needle is inserted, but the process is generally painless.'],
  ['How long does donation take?', 'The entire process takes about an hour, with the actual donation taking only 8–10 minutes.'],
  ['What should I eat before donating?', 'Eat a healthy meal and drink extra fluids before donating. Avoid fatty foods.'],
  ['Are there any side effects?', 'Some donors feel light-headed briefly. Serious reactions are very rare.'],
];

export default function AwarenessPage() {
  return (
    <div style={{ padding: '60px 0' }}>
      <Container>
        <div className="glass-card p-5 mb-5" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🩸</div>
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800 }}>Blood Donation Awareness</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '12px auto 0', lineHeight: 1.7 }}>Every two seconds, someone needs blood. Learn how your donation saves lives.</p>
        </div>

        <Row className="g-4 mb-5">
          {[
            ['What is Blood Donation?', 'Blood donation is a voluntary procedure where you allow blood to be drawn from your body for use in transfusions or manufactured into biopharmaceutical medications. A healthy adult can donate without any significant risk.'],
            ['Who Can Donate?', 'Generally, donors must be 18–65 years old, weigh at least 45kg, and be in good health. You must not have donated in the last 56 days, and must not have certain medical conditions or recent illnesses.'],
            ['Benefits of Donating', 'Donating blood offers health benefits including reduced risk of heart disease, free health screening, and the profound satisfaction of knowing you have saved lives. Each donation can save up to 3 lives.'],
          ].map(([t,d]) => (
            <Col key={t} md={4}>
              <div className="glass-card p-4 h-100">
                <h5 style={{ fontFamily: 'Sora', fontWeight: 700, color: 'var(--crimson)', marginBottom: 12 }}>{t}</h5>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.875rem', marginBottom: 0 }}>{d}</p>
              </div>
            </Col>
          ))}
        </Row>

        <div className="glass-card p-4 mb-5">
          <h4 style={{ fontFamily: 'Sora', fontWeight: 700, marginBottom: 20 }}>Blood Types Explained</h4>
          <Row className="g-3">
            {bloodTypes.map(t => (
              <Col key={t} xs={6} sm={3} md={3}>
                <div style={{ background: 'var(--crimson-pale)', borderRadius: 12, padding: '20px 12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Sora', fontSize: '1.8rem', fontWeight: 800, color: 'var(--crimson)' }}>{t}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Blood Group</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

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
    </div>
  );
}
