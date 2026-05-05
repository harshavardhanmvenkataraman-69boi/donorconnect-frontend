import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';

// ─── Constants ────────────────────────────────────────────────────────────────
const BLOOD_COLOR = {
  'A+':'#e53935','A−':'#ef9a9a','B+':'#e65100','B−':'#ffb74d',
  'AB+':'#6a1b9a','AB−':'#ba68c8','O+':'#1565c0','O−':'#64b5f6',
};

const DONOR_TYPE_LABELS = {
  VOLUNTARY: 'Voluntary', REPLACEMENT: 'Replacement',
  STUDENT: 'Student', CORPORATE: 'Corporate',
};

const STATUS_CONFIG = {
  ACTIVE:      { color: '#1b5e20', bg: '#e8f5e9', dot: '#43a047' },
  DEFERRED:    { color: '#e65100', bg: '#fff3e0', dot: '#fb8c00' },
  BLACKLISTED: { color: '#b71c1c', bg: '#ffebee', dot: '#e53935' },
  INACTIVE:    { color: '#555',    bg: '#f5f5f5', dot: '#9e9e9e' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseAddress = (raw) => {
  try {
    const a = JSON.parse(raw);
    return [a.street, a.city, a.state, a.pincode].filter(Boolean).join(', ') || null;
  } catch { return null; }
};

// ─── Shared UI pieces ─────────────────────────────────────────────────────────
function BloodCircle({ group, rh, size = 36 }) {
  if (!group) return <span style={{ color: '#bbb' }}>—</span>;
  const label = group + (rh === 'POSITIVE' ? '+' : '−');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%',
      background: BLOOD_COLOR[label] || '#c62828',
      color: 'white', fontWeight: 700,
      fontSize: size > 40 ? '1.05rem' : '0.75rem',
      fontFamily: "'Syne', sans-serif",
      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
      flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.INACTIVE;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '0.72rem', fontWeight: 600,
      padding: '3px 10px', borderRadius: 20,
      color: cfg.color, background: cfg.bg,
      textTransform: 'uppercase', letterSpacing: '0.5px',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="dl-row">
      <span className="dl-label">{label}</span>
      <span className="dl-value">{value}</span>
    </div>
  );
}

// ─── Donor Detail Modal ───────────────────────────────────────────────────────
function DonorModal({ donor, onClose, onEdit }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const address    = parseAddress(donor.addressJson);
  const typeLabel  = DONOR_TYPE_LABELS[donor.donorType] || donor.donorType;

  return (
    <>
      {/* Backdrop */}
      <div className="dl-backdrop" onClick={onClose} />

      {/* Modal panel */}
      <div className="dl-modal" role="dialog" aria-modal="true">

        {/* ── Header ── */}
        <div className="dl-modal-header">
          <div className="dl-modal-hero">
            <div className="dl-avatar">
              {donor.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="dl-hero-text">
              <h2 className="dl-modal-name">{donor.name}</h2>
              <div className="dl-chips">
                <span className="dl-id-chip">ID #{donor.donorId}</span>
                <StatusPill status={donor.status} />
                <span className="dl-type-chip">{typeLabel}</span>
              </div>
            </div>
          </div>
          <div className="dl-header-right">
            <BloodCircle group={donor.bloodGroup} rh={donor.rhFactor} size={52} />
            <button className="dl-close-btn" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className="dl-divider" />

        {/* ── Body ── */}
        <div className="dl-modal-body">

          <div className="dl-section">
            <p className="dl-section-title">👤 Personal</p>
            <DetailRow label="Full Name"     value={donor.name} />
            <DetailRow label="Date of Birth" value={donor.dob || '—'} />
            <DetailRow label="Gender"        value={donor.gender} />
            <DetailRow label="Contact"       value={donor.contactInfo || '—'} />
          </div>

          <div className="dl-section">
            <p className="dl-section-title">🩸 Blood Info</p>
            <DetailRow label="Blood Group" value={donor.bloodGroup} />
            <DetailRow label="Rh Factor"   value={donor.rhFactor} />
            <DetailRow label="Donor Type"  value={typeLabel} />
            <DetailRow
              label="Status"
              value={<StatusPill status={donor.status} />}
            />
          </div>

          {address && (
            <div className="dl-section dl-full">
              <p className="dl-section-title">📍 Address</p>
              <DetailRow label="Full Address" value={address} />
            </div>
          )}

        </div>

        <div className="dl-divider" />

        {/* ── Footer ── */}
        <div className="dl-modal-footer">
          <button className="dl-btn-ghost" onClick={onClose}>Close</button>
          <button className="dl-btn-primary" onClick={onEdit}>✏ Edit Donor</button>
        </div>

      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DonorListPage() {
  const [donors, setDonors]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [bg, setBg]             = useState('');
  const [selected, setSelected] = useState(null);   // donor shown in modal
  const debounceRef             = useRef(null);
  const navigate                = useNavigate();

  const load = useCallback((s, b) => {
    setLoading(true);
    let url;
    if (s?.trim()) {
      url = `/api/donors/search?name=${encodeURIComponent(s.trim())}`;
    } else if (b) {
      url = `/api/donors/blood-group/${b}`;
    } else {
      url = '/api/donors?page=0&size=20';
    }
    api.get(url)
      .then(r => {
        const data = r.data?.data?.content ?? r.data?.content ?? r.data?.data ?? r.data ?? [];
        setDonors(Array.isArray(data) ? data : []);
      })
      .catch(() => setDonors([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load('', ''); }, [load]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(val, bg), 350);
  };

  const handleBgChange = (e) => {
    const val = e.target.value;
    setBg(val);
    load(search, val);
  };

  const columns = [
    {
      key: 'donorId', label: 'ID',
      render: v => (
        <span style={{ fontFamily: 'Courier New', fontSize: '0.8rem', color: '#888' }}>#{v}</span>
      ),
    },
    { key: 'name', label: 'Name' },
    {
      key: 'bloodGroup', label: 'Blood Type',
      render: (v, row) => <BloodCircle group={v} rh={row.rhFactor} />,
    },
    {
      key: 'donorType', label: 'Type',
      render: v => DONOR_TYPE_LABELS[v] || v || '—',
    },
    {
      key: 'status', label: 'Status',
      render: v => <StatusBadge status={v} />,
    },
  ];

  return (
    <>
      <Style />
      <div className="animate-fadein">
        <PageHeader title="Donor Registry">
          <button className="btn-crimson" onClick={() => navigate('/dashboard/donors/register')}>
            + Register Donor
          </button>
        </PageHeader>

        {/* ── Filters ── */}
        <div className="filter-row mb-4">
          <div className="search-glass flex-grow-1" style={{ maxWidth: 300 }}>
            <span className="search-icon">🔍</span>
            <input
              className="form-control"
              placeholder="Search by name…"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <select
            className="form-select"
            style={{ width: 160 }}
            value={bg}
            onChange={handleBgChange}
          >
            <option value="">All Blood Groups</option>
            {['A', 'B', 'AB', 'O'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {(search || bg) && (
            <button
              className="btn-glass"
              onClick={() => { setSearch(''); setBg(''); load('', ''); }}
              style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div className="table-wrapper">
          <DataTable
            columns={columns}
            data={donors}
            loading={loading}
            actions={row => (
              <div className="d-flex gap-2">
                <button className="btn-glass" onClick={() => setSelected(row)}>
                  View
                </button>
                <button
                  className="btn-glass"
                  onClick={() => navigate(`/dashboard/donors/edit/${row.donorId}`)}
                >
                  Edit
                </button>
              </div>
            )}
          />
        </div>
      </div>

      {/* ── Modal (portal-style, rendered at bottom of tree) ── */}
      {selected && (
        <DonorModal
          donor={selected}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setSelected(null);
            navigate(`/dashboard/donors/edit/${selected.donorId}`);
          }}
        />
      )}
    </>
  );
}

// ─── Scoped Styles ────────────────────────────────────────────────────────────
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

      /* Backdrop */
      .dl-backdrop {
        position: fixed; inset: 0;
        background: rgba(15, 15, 30, 0.5);
        backdrop-filter: blur(4px);
        z-index: 1000;
        animation: dl-fade 0.18s ease;
      }

      /* Modal */
      .dl-modal {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: min(560px, calc(100vw - 2rem));
        max-height: calc(100vh - 4rem);
        background: #fff;
        border-radius: 20px;
        box-shadow: 0 28px 72px rgba(0,0,0,0.24);
        z-index: 1001;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: 'DM Sans', sans-serif;
        animation: dl-pop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Header */
      .dl-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.4rem 1.1rem;
        gap: 1rem;
        flex-shrink: 0;
      }
      .dl-modal-hero  { display: flex; align-items: center; gap: 0.9rem; flex: 1; min-width: 0; }
      .dl-header-right { display: flex; align-items: center; gap: 0.7rem; flex-shrink: 0; }
      .dl-hero-text   { min-width: 0; }

      .dl-avatar {
        width: 46px; height: 46px; border-radius: 50%;
        background: linear-gradient(135deg, #c62828, #1a1a2e);
        color: #fff;
        font-family: 'Syne', sans-serif;
        font-size: 1.2rem; font-weight: 800;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }

      .dl-modal-name {
        font-family: 'Syne', sans-serif;
        font-size: 1.15rem; font-weight: 800;
        margin: 0 0 0.35rem;
        color: #1a1a2e; letter-spacing: -0.3px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .dl-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 0.35rem; }

      .dl-id-chip {
        background: #f0f0f8; color: #666;
        font-size: 0.68rem; font-weight: 600;
        padding: 2px 8px; border-radius: 20px;
        font-family: 'Courier New', monospace;
      }
      .dl-type-chip {
        background: #e8f0fe; color: #1a73e8;
        font-size: 0.68rem; font-weight: 600;
        padding: 2px 8px; border-radius: 20px;
      }

      .dl-close-btn {
        width: 28px; height: 28px; border-radius: 50%;
        border: 1.5px solid #e0e0e8;
        background: #fafafa; color: #888;
        font-size: 0.72rem; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.15s;
      }
      .dl-close-btn:hover { background: #fff0f0; border-color: #c62828; color: #c62828; }

      .dl-divider { height: 1px; background: #f0f0f8; flex-shrink: 0; }

      /* Body */
      .dl-modal-body {
        padding: 1.2rem 1.4rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem 2rem;
        overflow-y: auto;
      }
      .dl-section { display: flex; flex-direction: column; gap: 0.6rem; }
      .dl-full    { grid-column: 1 / -1; }

      .dl-section-title {
        font-family: 'Syne', sans-serif;
        font-size: 0.7rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.8px;
        color: #bbb; margin: 0 0 0.1rem;
      }
      .dl-row   { display: flex; flex-direction: column; gap: 1px; }
      .dl-label {
        font-size: 0.67rem; font-weight: 500;
        text-transform: uppercase; letter-spacing: 0.5px; color: #ccc;
      }
      .dl-value { font-size: 0.9rem; color: #1a1a2e; }

      /* Footer */
      .dl-modal-footer {
        display: flex; justify-content: flex-end; gap: 0.6rem;
        padding: 0.9rem 1.4rem;
        flex-shrink: 0;
      }
      .dl-btn-ghost {
        padding: 8px 18px;
        background: none; color: #666;
        border: 1.5px solid #ddd; border-radius: 8px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
      }
      .dl-btn-ghost:hover { background: #f5f5f5; }
      .dl-btn-primary {
        padding: 8px 20px;
        background: #c62828; color: white;
        border: none; border-radius: 8px;
        font-family: 'Syne', sans-serif;
        font-size: 0.85rem; font-weight: 700;
        cursor: pointer; transition: background 0.15s, transform 0.1s;
      }
      .dl-btn-primary:hover { background: #b71c1c; transform: translateY(-1px); }

      /* Animations */
      @keyframes dl-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes dl-pop  {
        from { opacity: 0; transform: translate(-50%, -47%) scale(0.94); }
        to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }

      @media (max-width: 460px) {
        .dl-modal-body { grid-template-columns: 1fr; }
        .dl-full       { grid-column: 1; }
        .dl-modal-name { font-size: 1rem; }
      }
    `}</style>
  );
}