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
        <div className="glass-card p-5 mb-5" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚖️</div>
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800 }}>Regulatory Policies</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.7 }}>Government acts and guidelines governing blood donation and banking in India.</p>
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
