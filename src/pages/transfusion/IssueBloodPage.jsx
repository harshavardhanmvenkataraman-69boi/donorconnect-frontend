import { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

const INIT_FORM = {
  componentId: '',
  patientId: '',
  issuedBy: '',       
  indication: '',     
};

export default function IssueBloodPage() {
  const [form, setForm] = useState(INIT_FORM);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/transfusion/issue', {
        componentId: Number(form.componentId),
        patientId:   Number(form.patientId),
        issuedBy:    form.issuedBy,
        indication:  form.indication,
      });
      showSuccess('Blood component issued successfully');
      setForm(INIT_FORM);
      setConfirmed(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Issue failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadein">
      <PageHeader title="Issue Blood Component" subtitle="Complete crossmatch before issuing" />
      <div className="glass-card p-4" style={{ maxWidth: 600, margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <label className="form-label">Component ID *</label>
              <input
                type="number"
                required
                className="form-control"
                value={form.componentId}
                onChange={e => setForm({ ...form, componentId: e.target.value })}
              />
            </Col>
            <Col md={6}>
              <label className="form-label">Patient ID *</label>
              <input
                type="number"
                required
                className="form-control"
                value={form.patientId}
                onChange={e => setForm({ ...form, patientId: e.target.value })}
              />
            </Col>
            <Col md={6}>
              <label className="form-label">Issued By *</label>
              <input
                required
                className="form-control"
                placeholder="Doctor / Transfusion officer name"
                value={form.issuedBy}
                onChange={e => setForm({ ...form, issuedBy: e.target.value })}
              />
            </Col>
            <Col md={6}>
              <label className="form-label">Indication *</label>
              <input
                required
                className="form-control"
                placeholder="e.g. Anaemia, Surgery, Von Willebrand"
                value={form.indication}
                onChange={e => setForm({ ...form, indication: e.target.value })}
              />
            </Col>
          </Row>

          {form.componentId && form.patientId && (
            <div className="alert-glass warning mt-3">
              ⚠️ Ensure crossmatch is completed and component is marked{' '}
              <strong>COMPATIBLE</strong> and status is <strong>RESERVED</strong> before issuing.
            </div>
          )}

          <div className="mt-3" style={{
            background: 'var(--crimson-pale)',
            padding: '14px 16px',
            borderRadius: 10,
            border: '1px solid var(--border-light)',
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ marginTop: 3 }}
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
              />
              <span style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                lineHeight: 1.5,
              }}>
                I confirm this component is crossmatch-compatible and authorized for transfusion.
              </span>
            </label>
          </div>

          <div className="d-flex gap-3 mt-4">
            <button
              type="submit"
              className="btn-crimson"
              disabled={!confirmed || loading || !form.issuedBy || !form.indication}
            >
              {loading ? 'Processing...' : '💉 Issue Blood Component'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}