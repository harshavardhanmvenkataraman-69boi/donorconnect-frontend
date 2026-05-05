import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { showError } from '../../components/shared/ui/AlertBanner';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseAddress = (raw) => {
  if (!raw) return null;
  try {
    const a = JSON.parse(raw);
    if (!a.street && !a.city && !a.state && !a.pincode) return null;
    return a;
  } catch { return null; }
};

const BLOOD_COLOR = {
  'A+':'#e53935','A−':'#ef9a9a','B+':'#e65100','B−':'#ffb74d',
  'AB+':'#6a1b9a','AB−':'#ba68c8','O+':'#1565c0','O−':'#64b5f6',
};

const STATUS_CONFIG = {
  ACTIVE:      { color: '#1b5e20', bg: '#e8f5e9', dot: '#43a047' },
  DEFERRED:    { color: '#e65100', bg: '#fff3e0', dot: '#fb8c00' },
  BLACKLISTED: { color: '#b71c1c', bg: '#ffebee', dot: '#e53935' },
  INACTIVE:    { color: '#555',    bg: '#f5f5f5', dot: '#9e9e9e' },
};

function BloodBadge({ group, rh }) {
  if (!group) return null;
  const label = group + (rh === 'POSITIVE' ? '+' : '−');
  const bg = BLOOD_COLOR[label] || '#c62828';
  return (
    <div className="dv-blood-circle" style={{ background: bg }}>
      {label}
    </div>
  );
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.INACTIVE;
  return (
    <span className="dv-status-pill" style={{ color: cfg.color, background: cfg.bg }}>
      <span className="dv-status-dot" style={{ background: cfg.dot }} />
      {status}
    </span>
  );
}

function InfoRow({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div className="dv-info-row">
      <span className="dv-info-label">{label}</span>
      <span className={`dv-info-value ${mono ? 'dv-mono' : ''}`}>{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DonorViewPage() {
  const [donor, setDonor]     = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/api/donors/${id}`)
      .then(r => setDonor(r.data?.data || r.data))
      .catch(() => {
        showError('Failed to load donor details');
        navigate('/dashboard/donors');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const address = donor ? parseAddress(donor.addressJson) : null;
  const fullAddress = address
    ? [address.street, address.city, address.state, address.pincode].filter(Boolean).join(', ')
    : null;

  const donorTypeLabel = {
    VOLUNTARY: 'Voluntary', REPLACEMENT: 'Replacement',
    STUDENT: 'Student', CORPORATE: 'Corporate',
  }[donor?.donorType] || donor?.donorType;

  return (
    <>
      <Style />
      <div className="dv-root animate-fadein">

        {loading ? (
          <div className="dv-loader-wrap">
            <div className="dv-spinner" />
            <p className="dv-loader-text">Loading donor profile…</p>
          </div>
        ) : donor ? (
          <>
            {/* ── Top bar ── */}
            <div className="dv-topbar">
              <button className="dv-back-btn" onClick={() => navigate('/dashboard/donors')} type="button">
                ← Back to Registry
              </button>
              <button
                className="dv-edit-btn"
                onClick={() => navigate(`/dashboard/donors/edit/${donor.donorId}`)}
                type="button"
              >
                ✏ Edit Donor
              </button>
            </div>

            {/* ── Hero card ── */}
            <div className="dv-hero">
              <div className="dv-hero-left">
                <div className="dv-avatar">
                  {donor.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="dv-hero-info">
                  <h1 className="dv-name">{donor.name}</h1>
                  <div className="dv-hero-meta">
                    <span className="dv-id-chip">ID #{donor.donorId}</span>
                    <StatusPill status={donor.status} />
                    <span className="dv-type-chip">{donorTypeLabel}</span>
                  </div>
                </div>
              </div>
              <BloodBadge group={donor.bloodGroup} rh={donor.rhFactor} />
            </div>

            {/* ── Detail sections ── */}
            <div className="dv-sections">

              <section className="dv-card">
                <h2 className="dv-card-title">
                  <span>👤</span> Personal Information
                </h2>
                <div className="dv-info-grid">
                  <InfoRow label="Full Name"     value={donor.name} />
                  <InfoRow label="Date of Birth" value={donor.dob} />
                  <InfoRow label="Gender"        value={donor.gender} />
                  <InfoRow label="Contact"       value={donor.contactInfo} />
                </div>
              </section>

              <section className="dv-card">
                <h2 className="dv-card-title">
                  <span>🩸</span> Blood Information
                </h2>
                <div className="dv-info-grid">
                  <InfoRow label="Blood Group" value={donor.bloodGroup} />
                  <InfoRow label="Rh Factor"   value={donor.rhFactor} />
                  <InfoRow label="Donor Type"  value={donorTypeLabel} />
                  <InfoRow label="Status"      value={<StatusPill status={donor.status} />} />
                </div>
              </section>

              {address && (
                <section className="dv-card">
                  <h2 className="dv-card-title">
                    <span>📍</span> Address
                  </h2>
                  <div className="dv-info-grid">
                    {address.street  && <InfoRow label="Street"  value={address.street} />}
                    {address.city    && <InfoRow label="City"    value={address.city} />}
                    {address.state   && <InfoRow label="State"   value={address.state} />}
                    {address.pincode && <InfoRow label="Pincode" value={address.pincode} mono />}
                  </div>
                  {fullAddress && (
                    <div className="dv-full-address">
                      <span className="dv-map-icon">🗺</span>
                      {fullAddress}
                    </div>
                  )}
                </section>
              )}

            </div>

            {/* ── Footer action ── */}
            <div className="dv-footer">
              <button
                className="dv-edit-btn-lg"
                onClick={() => navigate(`/dashboard/donors/edit/${donor.donorId}`)}
                type="button"
              >
                ✏ Edit This Donor
              </button>
            </div>
          </>
        ) : (
          <div className="dv-loader-wrap">
            <p className="dv-loader-text">Donor not found.</p>
            <button className="dv-back-btn" onClick={() => navigate('/dashboard/donors')}>
              ← Back to Registry
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

      .dv-root {
        font-family: 'DM Sans', sans-serif;
        max-width: 820px;
        padding: 2rem 1.5rem 4rem;
        color: #1a1a2e;
      }

      /* Top bar */
      .dv-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.75rem;
      }
      .dv-back-btn {
        background: none;
        border: 1.5px solid #ddd;
        border-radius: 8px;
        padding: 7px 14px;
        font-size: 0.82rem;
        cursor: pointer;
        color: #555;
        font-family: 'DM Sans', sans-serif;
        transition: all 0.15s;
      }
      .dv-back-btn:hover { background: #f5f5f5; border-color: #bbb; }

      .dv-edit-btn {
        background: #1a1a2e;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 8px 18px;
        font-size: 0.83rem;
        font-family: 'Syne', sans-serif;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s;
        letter-spacing: 0.3px;
      }
      .dv-edit-btn:hover { background: #2d2d4e; transform: translateY(-1px); }

      /* Hero */
      .dv-hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff;
        border: 1px solid #e8e8f0;
        border-radius: 20px;
        padding: 1.5rem 1.75rem;
        margin-bottom: 1.25rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.05);
      }
      .dv-hero-left { display: flex; align-items: center; gap: 1.25rem; }

      .dv-avatar {
        width: 60px; height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #c62828, #1a1a2e);
        color: white;
        font-family: 'Syne', sans-serif;
        font-size: 1.5rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .dv-name {
        font-family: 'Syne', sans-serif;
        font-size: 1.5rem;
        font-weight: 800;
        margin: 0 0 0.5rem;
        color: #1a1a2e;
        letter-spacing: -0.4px;
      }
      .dv-hero-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; }

      .dv-id-chip {
        background: #f0f0f8;
        color: #555;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 20px;
        font-family: 'Courier New', monospace;
      }
      .dv-type-chip {
        background: #e8f0fe;
        color: #1a73e8;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 20px;
      }
      .dv-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .dv-status-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      /* Blood circle */
      .dv-blood-circle {
        width: 64px; height: 64px;
        border-radius: 50%;
        color: white;
        font-family: 'Syne', sans-serif;
        font-size: 1rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      }

      /* Detail cards */
      .dv-sections { display: flex; flex-direction: column; gap: 1rem; }
      .dv-card {
        background: #fff;
        border: 1px solid #e8e8f0;
        border-radius: 16px;
        padding: 1.4rem 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      }
      .dv-card-title {
        font-family: 'Syne', sans-serif;
        font-size: 0.92rem;
        font-weight: 700;
        color: #1a1a2e;
        margin: 0 0 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.45rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* Info grid */
      .dv-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem 1.5rem;
      }
      @media (max-width: 500px) { .dv-info-grid { grid-template-columns: 1fr; } }

      .dv-info-row { display: flex; flex-direction: column; gap: 2px; }
      .dv-info-label {
        font-size: 0.7rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: #999;
      }
      .dv-info-value {
        font-size: 0.95rem;
        color: #1a1a2e;
        font-weight: 400;
      }
      .dv-mono { font-family: 'Courier New', monospace; font-size: 0.9rem; }

      /* Full address line */
      .dv-full-address {
        margin-top: 0.9rem;
        padding-top: 0.9rem;
        border-top: 1px solid #f0f0f8;
        font-size: 0.85rem;
        color: #666;
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .dv-map-icon { font-size: 1rem; flex-shrink: 0; }

      /* Footer */
      .dv-footer {
        margin-top: 1.75rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e8e8f0;
        display: flex;
        justify-content: flex-end;
      }
      .dv-edit-btn-lg {
        background: #c62828;
        color: white;
        border: none;
        border-radius: 10px;
        padding: 11px 28px;
        font-family: 'Syne', sans-serif;
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s;
        letter-spacing: 0.3px;
      }
      .dv-edit-btn-lg:hover { background: #b71c1c; transform: translateY(-1px); }

      /* Loader */
      .dv-loader-wrap {
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        min-height: 300px; gap: 1rem;
      }
      .dv-spinner {
        width: 36px; height: 36px;
        border: 3px solid #f0e0e0;
        border-top-color: #c62828;
        border-radius: 50%;
        animation: dv-spin 0.8s linear infinite;
      }
      .dv-loader-text { color: #888; font-size: 0.9rem; }

      @keyframes dv-spin { to { transform: rotate(360deg); } }
      .animate-fadein { animation: dv-fadein 0.35s ease both; }
      @keyframes dv-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; } }
    `}</style>
  );
}