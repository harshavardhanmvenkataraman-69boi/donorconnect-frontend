import { Link } from 'react-router-dom'
import { useState } from 'react'

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-section">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(192,21,42,0.1)', border: '1px solid rgba(192,21,42,0.25)', borderRadius: 20, padding: '5px 14px', marginBottom: 24, fontSize: 12, color: 'var(--crimson-light)', fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, background: 'var(--crimson-light)', borderRadius: '50%', display: 'inline-block' }} /> Live System Active
          </div>
          <h1>Saving Lives<br />Through <span className="hero-accent">Every Drop</span></h1>
          <p>A comprehensive blood bank management system ensuring safe donation, storage, testing, and transfusion — from the donor's arm to the patient's vein.</p>
          <div className="hero-btns">
            <Link to="/login" className="btn-dc-primary" style={{ textDecoration: 'none', padding: '13px 28px', fontSize: 15 }}>
              <i className="bi bi-calendar-heart" /> Book Appointment
            </Link>
            <Link to="/awareness" className="btn-dc-ghost" style={{ textDecoration: 'none', padding: '13px 28px', fontSize: 15 }}>
              <i className="bi bi-book" /> Learn About Donating
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <div className="feature-grid" style={{ marginBottom: 80 }}>
        {[
          { icon: 'bi-people-fill', title: 'Donor Management', desc: 'Register and manage donors with complete health screening, deferral tracking, and appointment scheduling across all blood drive events.', color: '#ff6b7a' },
          { icon: 'bi-shield-check', title: 'Safe Transfusions', desc: 'End-to-end crossmatch compatibility testing, issue tracking, and adverse reaction monitoring to ensure every transfusion is safe.', color: '#2ec27e' },
          { icon: 'bi-box-seam-fill', title: 'Real-time Inventory', desc: 'Live blood component stock tracking with expiry alerts, low-stock warnings, and full transaction history across all blood groups.', color: '#4a9eff' },
          { icon: 'bi-droplet-fill', title: 'Lab Integration', desc: 'Automated test result processing with Kafka-driven quarantine triggers for HIV, HBV, HCV, syphilis, malaria, and more.', color: '#f0a500' },
          { icon: 'bi-graph-up-arrow', title: 'Analytics & Reports', desc: 'Scheduled system reports, audit logs, and billing summaries provide complete operational visibility for administrators.', color: '#a78bfa' },
          { icon: 'bi-person-heart', title: 'Donor Portal', desc: 'Donors can view their history, upcoming appointments, and receive notifications about donation eligibility and drives.', color: '#ff6b7a' },
        ].map(f => (
          <div key={f.title} className="glass-card" style={{ padding: '28px 24px' }}>
            <div style={{ width: 44, height: 44, background: `${f.color}18`, border: `1px solid ${f.color}30`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <i className={`bi ${f.icon}`} style={{ fontSize: 20, color: f.color }} />
            </div>
            <h5 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h5>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats strip */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="stats-strip">
          {[['1,000+', 'Registered Donors'], ['50+', 'Blood Drives Held'], ['10,000+', 'Lives Saved'], ['7', 'Blood Group Types']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div className="stat-num">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, marginBottom: 14 }}>Ready to Make a Difference?</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.7 }}>One donation can save up to three lives. Join thousands of donors in your community.</p>
        <Link to="/login" className="btn-dc-primary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: 15 }}>
          <i className="bi bi-heart-pulse" /> Get Started Today
        </Link>
      </section>
    </div>
  )
}

export function AboutPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, marginBottom: 8 }}>About DonorConnect</h1>
      <p style={{ color: 'var(--crimson-light)', fontSize: 15, marginBottom: 40 }}>Built to bridge the gap between donors and patients</p>
      {[
        { title: 'Our Mission', content: 'DonorConnect is a comprehensive blood bank management system designed to modernize the entire blood donation and transfusion workflow — from donor registration and health screening to laboratory testing, inventory management, and safe transfusion. We believe technology should serve life-saving healthcare, not complicate it.' },
        { title: 'The System', content: 'Built on a Spring Boot microservices architecture with Kafka event streaming, DonorConnect ensures every blood component is tracked from donation through testing, storage, crossmatch, and issue — with full traceability and adverse reaction monitoring. The system serves seven distinct roles across the blood bank.' },
        { title: 'Compliance', content: 'DonorConnect is designed in alignment with NACO (National AIDS Control Organisation) guidelines, Drugs and Cosmetics Act provisions for blood banks, and WHO blood safety standards. All processes include mandatory documentation and audit trails.' },
      ].map(s => (
        <div key={s.title} className="glass-card" style={{ padding: 28, marginBottom: 16 }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.title}</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: 14.5 }}>{s.content}</p>
        </div>
      ))}
    </div>
  )
}

export function ContactPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, marginBottom: 8 }}>Contact Us</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 40, fontSize: 15 }}>Reach out to your nearest blood bank facility</p>
      <div className="grid-2" style={{ gap: 20, marginBottom: 32 }}>
        {[
          { icon: 'bi-telephone-fill', label: 'Emergency Hotline', value: '1910 (National)', color: '#ff6b7a' },
          { icon: 'bi-envelope-fill', label: 'Email', value: 'info@donorconnect.in', color: '#4a9eff' },
          { icon: 'bi-geo-alt-fill', label: 'Address', value: '12 Medical Campus, Chennai - 600003', color: '#2ec27e' },
          { icon: 'bi-clock-fill', label: 'Hours', value: 'Mon–Sat: 8 AM – 8 PM', color: '#f0a500' },
        ].map(c => (
          <div key={c.label} className="glass-card" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, background: `${c.color}18`, border: `1px solid ${c.color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`bi ${c.icon}`} style={{ color: c.color }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-muted)', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AwarenessPage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '60px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, marginBottom: 8 }}>Blood Donation Awareness</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 48, fontSize: 15 }}>Everything you need to know about donating blood safely</p>

      <section style={{ marginBottom: 48 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 20, color: 'var(--crimson-light)' }}>What is Blood Donation?</h3>
        <div className="glass-card" style={{ padding: 28 }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 14.5, margin: 0 }}>Blood donation is a voluntary procedure where a healthy individual donates blood for transfusion to patients who need it. A single donation (approximately 450ml) can save up to 3 lives. Blood cannot be manufactured — it can only come from generous donors like you.</p>
        </div>
      </section>

      <section style={{ marginBottom: 48 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 20, color: 'var(--crimson-light)' }}>Who Can Donate?</h3>
        <div className="grid-2">
          {[
            ['✓ Age 18–65 years', 'success'],
            ['✓ Weight ≥ 45 kg', 'success'],
            ['✓ Hemoglobin ≥ 12.5 g/dL', 'success'],
            ['✓ BP: 100–180 / 60–100 mmHg', 'success'],
            ['✗ Recent illness/surgery', 'danger'],
            ['✗ Pregnancy or lactation', 'danger'],
            ['✗ Recent tattoo/piercing (6mo)', 'danger'],
            ['✗ On certain medications', 'danger'],
          ].map(([item, type]) => (
            <div key={item} className={`dc-alert ${type}`} style={{ margin: 0 }}>
              <i className={`bi ${type === 'success' ? 'bi-check-circle' : 'bi-x-circle'}`} /> {item}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 48 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 20, color: 'var(--crimson-light)' }}>Blood Types Explained</h3>
        <div className="dc-table-wrapper">
          <table className="dc-table">
            <thead><tr><th>Blood Group</th><th>Can Donate To</th><th>Can Receive From</th><th>Population %</th></tr></thead>
            <tbody>
              {[['A+', 'A+, AB+', 'A+, A-, O+, O-', '27%'],['A-', 'A+, A-, AB+, AB-', 'A-, O-', '6%'],['B+', 'B+, AB+', 'B+, B-, O+, O-', '22%'],['B-', 'B+, B-, AB+, AB-', 'B-, O-', '9%'],['AB+', 'AB+', 'All types', '7%'],['AB-', 'AB+, AB-', 'AB-, A-, B-, O-', '1%'],['O+', 'A+, B+, O+, AB+', 'O+, O-', '24%'],['O-', 'All types', 'O-', '4%']].map(r => (
                <tr key={r[0]}><td style={{ fontWeight: 700, color: 'var(--crimson-light)' }}>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export function PoliciesPage() {
  const [open, setOpen] = useState(null)
  const policies = [
    { title: 'Drugs and Cosmetics Act, 1940 — Schedule F (Part XII-B)', body: 'Blood banks in India are regulated under Schedule F Part XII-B of the Drugs and Cosmetics Act, 1940. This schedule specifies the standards for blood banking, including requirements for premises, equipment, personnel qualifications, testing protocols, and record maintenance. All blood banks must obtain a license from the State Licensing Authority.' },
    { title: 'NACO Blood Safety Programme', body: 'The National AIDS Control Organisation mandates 100% voluntary blood donation, mandatory testing of all donated blood for HIV, Hepatitis B, Hepatitis C, Syphilis, and Malaria. NACO guidelines also require the replacement of professional blood donation with voluntary non-remunerated donation.' },
    { title: 'WHO Blood Safety Standards', body: 'The World Health Organization recommends that all donated blood be screened for transfusion-transmissible infections before use. WHO standards cover quality management systems, blood collection, component preparation, storage and transportation, and clinical use of blood.' },
    { title: 'Donor Deferral Policy', body: 'Donors may be temporarily or permanently deferred based on medical history, travel history, medication use, recent procedures, or screening results. Temporary deferrals may last from 6 months to 2 years. Permanent deferrals apply in cases of certain chronic illnesses or high-risk behaviors.' },
    { title: 'Component Therapy & Quarantine Policy', body: 'All blood components must undergo mandatory testing. Any component that fails testing is immediately quarantined and cannot be issued for transfusion. The lookback program ensures traceability if a previously issued component is later found to be from an infected donor.' },
    { title: 'Patient Consent & Privacy', body: 'All transfusion procedures require written informed consent from the patient or their guardian. Donor identity is confidential and not disclosed to recipients. All data is maintained with strict confidentiality in accordance with applicable medical privacy standards.' },
  ]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, marginBottom: 8 }}>Policies & Regulations</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 40, fontSize: 15 }}>Governing laws and guidelines for blood banking in India</p>
      {policies.map((p, i) => (
        <div key={i} className="dc-accordion" >
          <div className="dc-accordion-header" onClick={() => setOpen(open === i ? null : i)}>
            {p.title}
            <i className={`bi bi-chevron-${open === i ? 'up' : 'down'}`} style={{ fontSize: 12 }} />
          </div>
          {open === i && <div className="dc-accordion-body">{p.body}</div>}
        </div>
      ))}
    </div>
  )
}
