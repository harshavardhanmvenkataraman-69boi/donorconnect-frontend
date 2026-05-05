import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

// ─── Enums matching backend exactly ──────────────────────────────────────────
const BLOOD_GROUPS  = ['A', 'B', 'AB', 'O'];
const RH_FACTORS    = ['POSITIVE', 'NEGATIVE'];
const GENDERS       = ['MALE', 'FEMALE', 'OTHER'];
const DONOR_TYPES   = ['VOLUNTARY', 'REPLACEMENT', 'STUDENT', 'CORPORATE'];

const DONOR_TYPE_LABELS = {
  VOLUNTARY:   'Voluntary',
  REPLACEMENT: 'Replacement',
  STUDENT:     'Student',
  CORPORATE:   'Corporate',
};

const EMPTY_ADDRESS = { street: '', city: '', state: '', pincode: '' };

const INIT_FORM = {
  name:        '',
  dob:         '',
  gender:      'MALE',
  bloodGroup:  'O',
  rhFactor:    'POSITIVE',
  contactInfo: '',
  donorType:   'VOLUNTARY',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseAddress = (raw) => {
  if (!raw) return { ...EMPTY_ADDRESS };
  try { return { ...EMPTY_ADDRESS, ...JSON.parse(raw) }; }
  catch { return { ...EMPTY_ADDRESS }; }
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div className="dc-field">
      <label className="dc-label">
        {label}{required && <span className="dc-required"> *</span>}
      </label>
      {children}
    </div>
  );
}

function SelectField({ label, required, value, onChange, options, labelMap }) {
  return (
    <Field label={label} required={required}>
      <div className="dc-select-wrap">
        <select className="dc-select" value={value} onChange={onChange}>
          {options.map(o => (
            <option key={o} value={o}>{labelMap ? labelMap[o] : o}</option>
          ))}
        </select>
        <span className="dc-chevron">▾</span>
      </div>
    </Field>
  );
}

function BloodTypeBadge({ group, rh }) {
  const label = group + (rh === 'POSITIVE' ? '+' : '−');
  const colorMap = {
    'A+':'#e53935','A−':'#ef9a9a','B+':'#e65100','B−':'#ffb74d',
    'AB+':'#6a1b9a','AB−':'#ba68c8','O+':'#1565c0','O−':'#64b5f6',
  };
  const bg = colorMap[label] || '#c62828';
  return (
    <span className="dc-blood-badge" style={{ background: bg }}>
      {label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DonorRegisterPage() {
  const [form, setForm]       = useState(INIT_FORM);
  const [address, setAddress] = useState({ ...EMPTY_ADDRESS });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // ── Load donor for edit ──
  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    api.get(`/api/donors/${id}`)
      .then(r => {
        const d = r.data?.data || r.data;
        setForm({
          name:        d.name        ?? '',
          dob:         d.dob         ?? '',
          gender:      d.gender      ?? 'MALE',
          bloodGroup:  d.bloodGroup  ?? 'O',
          rhFactor:    d.rhFactor    ?? 'POSITIVE',
          contactInfo: d.contactInfo ?? '',
          donorType:   d.donorType   ?? 'VOLUNTARY',
        });
        setAddress(parseAddress(d.addressJson));
      })
      .catch(() => showError('Failed to load donor details'))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  // ── Generic form field handler ──
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setAddr = (key) => (e) => setAddress(a => ({ ...a, [key]: e.target.value }));

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate contact (must be digits if provided)
    if (form.contactInfo && !/^\+?[\d\s\-()]{7,15}$/.test(form.contactInfo)) {
      showError('Contact info must be a valid phone number');
      setLoading(false);
      return;
    }

    const payload = {
      ...form,
      addressJson: JSON.stringify(address),
    };

    try {
      if (isEdit) {
        await api.put(`/api/donors/${id}`, payload);
      } else {
        await api.post('/api/donors', payload);
      }
      showSuccess(`Donor ${isEdit ? 'updated' : 'registered'} successfully`);
      navigate('/dashboard/donors');
    } catch (err) {
      showError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'register'} donor`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <>
        <Style />
        <div className="dc-root">
          <div className="dc-loader-wrap">
            <div className="dc-spinner" />
            <p className="dc-loader-text">Loading donor profile…</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Style />
      <div className="dc-root animate-fadein">

        {/* ── Header ── */}
        <header className="dc-header">
          <div className="dc-header-left">
            <button className="dc-back-btn" onClick={() => navigate('/dashboard/donors')} type="button">
              ← Back
            </button>
            <div>
              <h1 className="dc-title">
                {isEdit ? 'Edit Donor Profile' : 'Register New Donor'}
              </h1>
              <p className="dc-subtitle">
                {isEdit
                  ? 'Update donor information below'
                  : 'Complete all required fields to register a new donor'}
              </p>
            </div>
          </div>
          {(form.bloodGroup && form.rhFactor) && (
            <BloodTypeBadge group={form.bloodGroup} rh={form.rhFactor} />
          )}
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="dc-sections">

            {/* ── Section 1: Personal Info ── */}
            <section className="dc-section">
              <h2 className="dc-section-title">
                <span className="dc-section-icon">👤</span> Personal Information
              </h2>
              <div className="dc-grid dc-grid-2">
                <Field label="Full Name" required>
                  <input
                    className="dc-input"
                    type="text"
                    placeholder="e.g. Arjun Sharma"
                    required
                    value={form.name}
                    onChange={set('name')}
                  />
                </Field>

                <Field label="Date of Birth">
                  <input
                    className="dc-input"
                    type="date"
                    value={form.dob}
                    onChange={set('dob')}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </Field>

                <SelectField
                  label="Gender"
                  value={form.gender}
                  onChange={set('gender')}
                  options={GENDERS}
                />

                <Field label="Contact Number">
                  <input
                    className="dc-input"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.contactInfo}
                    onChange={set('contactInfo')}
                  />
                </Field>
              </div>
            </section>

            {/* ── Section 2: Blood Info ── */}
            <section className="dc-section">
              <h2 className="dc-section-title">
                <span className="dc-section-icon">🩸</span> Blood Information
              </h2>
              <div className="dc-grid dc-grid-3">
                <SelectField
                  label="Blood Group"
                  required
                  value={form.bloodGroup}
                  onChange={set('bloodGroup')}
                  options={BLOOD_GROUPS}
                />

                <SelectField
                  label="Rh Factor"
                  required
                  value={form.rhFactor}
                  onChange={set('rhFactor')}
                  options={RH_FACTORS}
                />

                <SelectField
                  label="Donor Type"
                  value={form.donorType}
                  onChange={set('donorType')}
                  options={DONOR_TYPES}
                  labelMap={DONOR_TYPE_LABELS}
                />
              </div>

              {/* Blood type visual indicator */}
              <div className="dc-blood-preview">
                <span className="dc-blood-label">Blood Type Preview</span>
                <div className="dc-blood-chips">
                  {BLOOD_GROUPS.map(g => (
                    ['POSITIVE', 'NEGATIVE'].map(rh => {
                      const active = form.bloodGroup === g && form.rhFactor === rh;
                      return (
                        <button
                          key={g+rh}
                          type="button"
                          className={`dc-chip ${active ? 'dc-chip-active' : ''}`}
                          onClick={() => setForm(f => ({ ...f, bloodGroup: g, rhFactor: rh }))}
                        >
                          {g}{rh === 'POSITIVE' ? '+' : '−'}
                        </button>
                      );
                    })
                  ))}
                </div>
              </div>
            </section>

            {/* ── Section 3: Address ── */}
            <section className="dc-section">
              <h2 className="dc-section-title">
                <span className="dc-section-icon">📍</span> Address Details
              </h2>
              <div className="dc-grid dc-grid-2">
                <div className="dc-span-2">
                  <Field label="Street Address">
                    <input
                      className="dc-input"
                      type="text"
                      placeholder="123, Main Street, Apartment 4B"
                      value={address.street}
                      onChange={setAddr('street')}
                    />
                  </Field>
                </div>

                <Field label="City">
                  <input
                    className="dc-input"
                    type="text"
                    placeholder="Chennai"
                    value={address.city}
                    onChange={setAddr('city')}
                  />
                </Field>

                <Field label="State">
                  <input
                    className="dc-input"
                    type="text"
                    placeholder="Tamil Nadu"
                    value={address.state}
                    onChange={setAddr('state')}
                  />
                </Field>

                <Field label="Pincode">
                  <input
                    className="dc-input"
                    type="text"
                    placeholder="600001"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={address.pincode}
                    onChange={setAddr('pincode')}
                  />
                </Field>
              </div>

              {/* JSON preview for transparency */}
              <details className="dc-json-preview">
                <summary className="dc-json-summary">View raw addressJson payload</summary>
                <pre className="dc-json-code">{JSON.stringify(address, null, 2)}</pre>
              </details>
            </section>
          </div>

          {/* ── Actions ── */}
          <div className="dc-actions">
            <button
              type="button"
              className="dc-btn-ghost"
              onClick={() => navigate('/dashboard/donors')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dc-btn-primary"
              disabled={loading || !form.name.trim()}
            >
              {loading ? (
                <><span className="dc-btn-spinner" /> {isEdit ? 'Saving…' : 'Registering…'}</>
              ) : (
                isEdit ? '✓ Save Changes' : '＋ Register Donor'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Scoped Styles ────────────────────────────────────────────────────────────
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

      .dc-root {
        font-family: 'DM Sans', sans-serif;
        max-width: 820px;
        padding: 2rem 1.5rem 4rem;
        color: #1a1a2e;
      }

      /* Header */
      .dc-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 2rem;
      }
      .dc-header-left { display: flex; align-items: flex-start; gap: 1rem; }
      .dc-back-btn {
        margin-top: 4px;
        background: none;
        border: 1.5px solid #ddd;
        border-radius: 8px;
        padding: 6px 12px;
        font-size: 0.8rem;
        cursor: pointer;
        color: #555;
        transition: all 0.15s;
        white-space: nowrap;
      }
      .dc-back-btn:hover { background: #f5f5f5; border-color: #bbb; }
      .dc-title {
        font-family: 'Syne', sans-serif;
        font-size: 1.7rem;
        font-weight: 800;
        margin: 0 0 0.2rem;
        color: #1a1a2e;
        letter-spacing: -0.5px;
      }
      .dc-subtitle { margin: 0; font-size: 0.88rem; color: #666; font-weight: 300; }

      /* Blood badge */
      .dc-blood-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        color: white;
        font-family: 'Syne', sans-serif;
        font-size: 1rem;
        font-weight: 700;
        flex-shrink: 0;
        box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        transition: background 0.3s;
      }

      /* Sections */
      .dc-sections { display: flex; flex-direction: column; gap: 1.5rem; }
      .dc-section {
        background: #fff;
        border: 1px solid #e8e8f0;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      }
      .dc-section-title {
        font-family: 'Syne', sans-serif;
        font-size: 1rem;
        font-weight: 700;
        color: #1a1a2e;
        margin: 0 0 1.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        letter-spacing: 0.2px;
      }
      .dc-section-icon { font-size: 1.1rem; }

      /* Grid */
      .dc-grid { display: grid; gap: 1rem; }
      .dc-grid-2 { grid-template-columns: 1fr 1fr; }
      .dc-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
      .dc-span-2 { grid-column: 1 / -1; }

      @media (max-width: 560px) {
        .dc-grid-2, .dc-grid-3 { grid-template-columns: 1fr; }
        .dc-span-2 { grid-column: 1; }
        .dc-title { font-size: 1.35rem; }
        .dc-header { flex-direction: column; gap: 1rem; }
      }

      /* Fields */
      .dc-field { display: flex; flex-direction: column; gap: 0.35rem; }
      .dc-label {
        font-size: 0.78rem;
        font-weight: 500;
        color: #444;
        text-transform: uppercase;
        letter-spacing: 0.6px;
      }
      .dc-required { color: #c62828; }

      .dc-input, .dc-select {
        width: 100%;
        padding: 10px 14px;
        border: 1.5px solid #e0e0ec;
        border-radius: 10px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.93rem;
        color: #1a1a2e;
        background: #fafafa;
        transition: border-color 0.15s, box-shadow 0.15s;
        outline: none;
        box-sizing: border-box;
      }
      .dc-input:focus, .dc-select:focus {
        border-color: #c62828;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(198,40,40,0.08);
      }

      .dc-select-wrap { position: relative; }
      .dc-select { appearance: none; padding-right: 32px; cursor: pointer; }
      .dc-chevron {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        font-size: 0.75rem;
        color: #888;
      }

      /* Blood type chips */
      .dc-blood-preview {
        margin-top: 1.25rem;
        padding-top: 1.25rem;
        border-top: 1px solid #f0f0f8;
      }
      .dc-blood-label {
        display: block;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: #888;
        font-weight: 500;
        margin-bottom: 0.6rem;
      }
      .dc-blood-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .dc-chip {
        padding: 5px 12px;
        border-radius: 20px;
        border: 1.5px solid #e0e0ec;
        background: #fafafa;
        font-size: 0.83rem;
        font-weight: 600;
        font-family: 'Syne', sans-serif;
        cursor: pointer;
        color: #555;
        transition: all 0.15s;
      }
      .dc-chip:hover { border-color: #c62828; color: #c62828; background: #fff5f5; }
      .dc-chip-active {
        background: #c62828 !important;
        color: white !important;
        border-color: #c62828 !important;
      }

      /* JSON preview */
      .dc-json-preview { margin-top: 1rem; }
      .dc-json-summary {
        font-size: 0.75rem;
        color: #888;
        cursor: pointer;
        user-select: none;
        list-style: none;
      }
      .dc-json-summary::-webkit-details-marker { display: none; }
      .dc-json-summary::before { content: '▶ '; font-size: 0.6rem; }
      details[open] .dc-json-summary::before { content: '▼ '; }
      .dc-json-code {
        margin-top: 0.5rem;
        background: #1a1a2e;
        color: #7ecfff;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 0.78rem;
        font-family: 'Courier New', monospace;
        overflow-x: auto;
      }

      /* Actions */
      .dc-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.75rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e8e8f0;
      }
      .dc-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 11px 28px;
        background: #c62828;
        color: white;
        border: none;
        border-radius: 10px;
        font-family: 'Syne', sans-serif;
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s;
        letter-spacing: 0.3px;
      }
      .dc-btn-primary:hover:not(:disabled) { background: #b71c1c; transform: translateY(-1px); }
      .dc-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

      .dc-btn-ghost {
        padding: 11px 22px;
        background: none;
        color: #555;
        border: 1.5px solid #ddd;
        border-radius: 10px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.15s;
      }
      .dc-btn-ghost:hover:not(:disabled) { background: #f5f5f5; border-color: #bbb; }
      .dc-btn-ghost:disabled { opacity: 0.5; }

      /* Spinners */
      .dc-btn-spinner {
        width: 14px; height: 14px;
        border: 2px solid rgba(255,255,255,0.4);
        border-top-color: white;
        border-radius: 50%;
        animation: dc-spin 0.7s linear infinite;
        display: inline-block;
      }
      .dc-loader-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 260px;
        gap: 1rem;
      }
      .dc-spinner {
        width: 36px; height: 36px;
        border: 3px solid #f0e0e0;
        border-top-color: #c62828;
        border-radius: 50%;
        animation: dc-spin 0.8s linear infinite;
      }
      .dc-loader-text { color: #888; font-size: 0.9rem; }

      @keyframes dc-spin { to { transform: rotate(360deg); } }

      /* Fade-in */
      .animate-fadein { animation: dc-fadein 0.35s ease both; }
      @keyframes dc-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
    `}</style>
  );
}