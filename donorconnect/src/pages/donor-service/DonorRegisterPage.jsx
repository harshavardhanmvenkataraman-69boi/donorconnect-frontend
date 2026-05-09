import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

const INIT = {
  name: '', dateOfBirth: '', gender: 'MALE',
  bloodGroup: 'O', rhFactor: 'POSITIVE',
  contactInfo: '', address: '{"street":"","city":"","state":"","pincode":""}',
  donorType: 'WALK_IN',
};

// Colors match the donor registry blood group circle badges
const BG_COLORS = {
  'A+':  '#E8622A', 'A-':  '#C44A18',
  'B+':  '#E67E22', 'B-':  '#CA6A12',
  'AB+': '#9B2335', 'AB-': '#6B0F1A',
  'O+':  '#C1121F', 'O-':  '#8B0000',
};

// Blood drop SVG — same style as the awareness page
function BloodDrop({ color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2 C12 2 5 10 5 15 C5 18.866 8.134 22 12 22 C15.866 22 19 18.866 19 15 C19 10 12 2 12 2Z"
        fill={color}
        opacity="0.9"
      />
      <ellipse cx="9.5" cy="13.5" rx="1.4" ry="2.2" fill="white" opacity="0.35" transform="rotate(-20 9.5 13.5)" />
    </svg>
  );
}

// Visual blood group selector grid — replaces the two plain selects
function BloodGroupPicker({ bloodGroup, rhFactor, onChange }) {
  const groups  = ['A', 'B', 'AB', 'O'];
  const factors = [{ value: 'POSITIVE', symbol: '+' }, { value: 'NEGATIVE', symbol: '-' }];

  return (
    <div>
      <label className="form-label" style={{ display: 'block', marginBottom: 10 }}>
        Blood Group &amp; Rh Factor
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {groups.map(g => factors.map(f => {
          const key      = `${g}${f.symbol}`;
          const color    = BG_COLORS[key];
          const selected = bloodGroup === g && rhFactor === f.value;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(g, f.value)}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            7,
                padding:        '8px 14px',
                borderRadius:   10,
                border:         selected ? `2px solid ${color}` : '2px solid rgba(0,0,0,0.08)',
                background:     selected ? `${color}15` : 'rgba(255,255,255,0.7)',
                cursor:         'pointer',
                transition:     'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                boxShadow:      selected ? `0 4px 14px ${color}30` : 'none',
                transform:      selected ? 'translateY(-1px)' : 'translateY(0)',
              }}
              onMouseEnter={e => {
                if (!selected) {
                  e.currentTarget.style.borderColor = `${color}60`;
                  e.currentTarget.style.background  = `${color}0d`;
                }
              }}
              onMouseLeave={e => {
                if (!selected) {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                  e.currentTarget.style.background  = 'rgba(255,255,255,0.7)';
                }
              }}
            >
              <BloodDrop color={color} size={18} />
              <span style={{
                fontFamily:  'Sora',
                fontWeight:  selected ? 800 : 600,
                fontSize:    '0.9rem',
                color:       selected ? color : 'var(--text-secondary)',
                lineHeight:  1,
              }}>
                {key}
              </span>
            </button>
          );
        }))}
      </div>

      {/* Selected preview */}
      {bloodGroup && rhFactor && (() => {
        const key   = `${bloodGroup}${rhFactor === 'POSITIVE' ? '+' : '-'}`;
        const color = BG_COLORS[key];
        return (
          <div style={{
            display:      'inline-flex',
            alignItems:   'center',
            gap:          8,
            marginTop:    12,
            padding:      '6px 14px',
            borderRadius: 50,
            background:   `${color}15`,
            border:       `1.5px solid ${color}40`,
          }}>
            <BloodDrop color={color} size={16} />
            <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '0.82rem', color }}>
              {key} selected
            </span>
          </div>
        );
      })()}
    </div>
  );
}

export default function DonorRegisterPage() {
  const [form, setForm] = useState(INIT);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) api.get(`/api/donors/${id}`)
      .then(r => setForm(r.data?.data || r.data))
      .catch(() => {});
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) await api.put(`/api/donors/${id}`, form);
      else        await api.post('/api/donors', form);
      showSuccess(`Donor ${isEdit ? 'updated' : 'registered'} successfully`);
      navigate('/dashboard/donors');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="animate-fadein">
      <PageHeader title={isEdit ? 'Edit Donor' : 'Register New Donor'} />
      <div className="glass-card p-4" style={{ maxWidth: 700 }}>
        <form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <label className="form-label">Full Name *</label>
              <input className="form-control" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </Col>
            <Col md={6}>
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-control" value={form.dateOfBirth}
                onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
            </Col>
            <Col md={6}>
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option>MALE</option><option>FEMALE</option><option>OTHER</option>
              </select>
            </Col>
            <Col md={6}>
              <label className="form-label">Donor Type</label>
              <select className="form-select" value={form.donorType}
                onChange={e => setForm({ ...form, donorType: e.target.value })}>
                {['WALK_IN', 'REGULAR', 'DIRECTED', 'AUTOLOGOUS'].map(t => <option key={t}>{t}</option>)}
              </select>
            </Col>

            {/* Visual blood group picker — full row */}
            <Col xs={12}>
              <BloodGroupPicker
                bloodGroup={form.bloodGroup}
                rhFactor={form.rhFactor}
                onChange={(g, rh) => setForm({ ...form, bloodGroup: g, rhFactor: rh })}
              />
            </Col>

            <Col md={6}>
              <label className="form-label">Contact Info</label>
              <input className="form-control" value={form.contactInfo}
                onChange={e => setForm({ ...form, contactInfo: e.target.value })} />
            </Col>
            <Col xs={12}>
              <label className="form-label">Address (JSON)</label>
              <textarea className="form-control" rows={3} value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder='{"street":"","city":"","state":"","pincode":""}' />
            </Col>
            <Col xs={12} className="d-flex gap-3 pt-2">
              <button type="submit" className="btn-crimson">
                {isEdit ? '✓ Save Changes' : '+ Register Donor'}
              </button>
              <button type="button" className="btn-glass"
                onClick={() => navigate('/dashboard/donors')}>Cancel</button>
            </Col>
          </Row>
        </form>
      </div>
    </div>
  );
}
