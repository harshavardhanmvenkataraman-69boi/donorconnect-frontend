import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';
import StatusBadge from '../../components/shared/ui/StatusBadge';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

const INIT_FORM = {
  patientId: '',
  bloodGroup: 'O',
  rhFactor: 'POSITIVE',
  requiredUnits: 1,
  priority: 'ROUTINE',
  orderBy: '',
  componentType: 'PRBC',
  notes: '',
};

const INIT_RESULT = {
  requestId: '',
  componentId: '',
  compatibility: 'COMPATIBLE',
  testedBy: '',
};

export default function CrossmatchPage() {
  const [tab, setTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showResult, setShowResult] = useState(null);
  const [form, setForm] = useState(INIT_FORM);
  const [resultForm, setResultForm] = useState(INIT_RESULT);

  const load = () => {
    setLoading(true);
    const url =
      tab === 'pending'
        ? '/api/transfusion/crossmatch/requests/pending'
        : '/api/transfusion/crossmatch/requests?page=0&size=50';
    api
      .get(url)
      .then(r => {
        const data = r.data?.data;
        setRequests(data?.content ?? (Array.isArray(data) ? data : []));
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  const create = async () => {
    try {
      await api.post('/api/transfusion/crossmatch/requests', {
        ...form,
        patientId: Number(form.patientId),
        requiredUnits: Number(form.requiredUnits),
      });
      showSuccess('Crossmatch request created');
      setShowNew(false);
      setForm(INIT_FORM);
      load();
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to create request');
    }
  };

  const submitResult = async () => {
    if (!resultForm.testedBy.trim()) {
      showError('Tested By (lab technician name) is required');
      return;
    }
    try {
      await api.post('/api/transfusion/crossmatch/results', {
        ...resultForm,
        requestId: Number(resultForm.requestId),
        componentId: Number(resultForm.componentId),
      });
      showSuccess(
        resultForm.compatibility === 'COMPATIBLE'
          ? `Component #${resultForm.componentId} reserved — compatible result recorded`
          : 'Result recorded — component incompatible'
      );
      setShowResult(null);
      setResultForm(INIT_RESULT);
      load();
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to record result');
    }
  };

  const columns = [
    { key: 'requestId',     label: 'ID' },
    { key: 'patientId',     label: 'Patient ID' },
    { key: 'bloodGroup',    label: 'Blood Group' },
    { key: 'rhFactor',      label: 'Rh' },
    { key: 'requiredUnits', label: 'Units' },
    { key: 'priority',      label: 'Priority', render: v => <StatusBadge status={v} /> },
    { key: 'status',        label: 'Status',   render: v => <StatusBadge status={v} /> },
    { key: 'requestDate',   label: 'Date',     render: v => v ?? '—' },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Crossmatch Requests">
        <button className="btn-crimson" onClick={() => setShowNew(true)}>+ New Request</button>
      </PageHeader>

      <div className="nav-tabs-glass mb-4">
        {['pending', 'all'].map(t => (
          <button
            key={t}
            className={`nav-link${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <DataTable
          columns={columns}
          data={requests}
          loading={loading}
          actions={row =>
            // Backend controls this now:
            // PENDING  → not all requiredUnits matched yet → show button
            // MATCHED  → all requiredUnits compatible → button hidden automatically
            row.status === 'PENDING' && (
              <button
                className="btn-glass"
                onClick={() => {
                  const ids = row.availableComponentIds
                    ? row.availableComponentIds.split(',').filter(Boolean)
                    : [];
                  setShowResult(row);
                  setResultForm({
                    requestId: row.requestId,
                    componentId: ids[0]?.trim() || '',
                    compatibility: 'COMPATIBLE',
                    testedBy: '',
                  });
                }}
              >
                Record Result
              </button>
            )
          }
        />
      </div>

      {/* ── New Crossmatch Request Modal ── */}
      <Modal show={showNew} onHide={() => setShowNew(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Crossmatch Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <label className="form-label">Patient ID *</label>
              <input type="number" className="form-control" required
                value={form.patientId}
                onChange={e => setForm({ ...form, patientId: e.target.value })} />
            </Col>
            <Col md={6}>
              <label className="form-label">Required Units *</label>
              <input type="number" className="form-control" min={1}
                value={form.requiredUnits}
                onChange={e => setForm({ ...form, requiredUnits: e.target.value })} />
            </Col>
            <Col md={4}>
              <label className="form-label">Blood Group</label>
              <select className="form-select" value={form.bloodGroup}
                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                {['A', 'B', 'AB', 'O'].map(g => <option key={g}>{g}</option>)}
              </select>
            </Col>
            <Col md={4}>
              <label className="form-label">Rh Factor</label>
              <select className="form-select" value={form.rhFactor}
                onChange={e => setForm({ ...form, rhFactor: e.target.value })}>
                <option>POSITIVE</option>
                <option>NEGATIVE</option>
              </select>
            </Col>
            <Col md={4}>
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="ROUTINE">ROUTINE</option>
                <option value="STAT">STAT</option>
              </select>
            </Col>
            <Col md={6}>
              <label className="form-label">Component Type</label>
              <select className="form-select" value={form.componentType}
                onChange={e => setForm({ ...form, componentType: e.target.value })}>
                <option value="PRBC">PRBC</option>
                <option value="PLATELET">PLATELETS</option>
                <option value="CRYO">CRYO</option>
                <option value="PLASMA">PLASMA</option>
              </select>
            </Col>
            <Col md={6}>
              <label className="form-label">Ordered By</label>
              <input className="form-control" value={form.orderBy}
                onChange={e => setForm({ ...form, orderBy: e.target.value })}
                placeholder="Doctor / department name" />
            </Col>
            <Col xs={12}>
              <label className="form-label">Notes</label>
              <textarea className="form-control" rows={2} value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={() => setShowNew(false)}>Cancel</button>
          <button className="btn-crimson" onClick={create}
            disabled={!form.patientId || !form.requiredUnits}>
            Submit Request
          </button>
        </Modal.Footer>
      </Modal>

      {/* ── Record Crossmatch Result Modal ── */}
      <Modal show={!!showResult}
        onHide={() => { setShowResult(null); setResultForm(INIT_RESULT); }}
        centered>
        <Modal.Header closeButton>
          <Modal.Title>Record Crossmatch Result — Request #{resultForm.requestId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">

            <Col xs={12}>
              <label className="form-label">Available Component IDs</label>
              <div style={{
                background: 'var(--surface-glass)',
                border: '1px solid var(--border-light)',
                borderRadius: 8,
                padding: '10px 14px',
              }}>
                {showResult?.availableComponentIds
                  ? showResult.availableComponentIds.split(',').filter(Boolean).map(id => (
                      <span key={id.trim()} style={{
                        display: 'inline-block',
                        background: 'var(--crimson-pale)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 6,
                        padding: '2px 10px',
                        marginRight: 6,
                        marginBottom: 4,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                      }}>
                        #{id.trim()}
                      </span>
                    ))
                  : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No components listed</span>
                }
              </div>
            </Col>

            <Col md={6}>
              <label className="form-label">Request ID</label>
              <input className="form-control" value={resultForm.requestId} readOnly />
            </Col>

            <Col md={6}>
              <label className="form-label">Select Component ID *</label>
              {showResult?.availableComponentIds ? (
                <select className="form-select" value={resultForm.componentId}
                  onChange={e => setResultForm({ ...resultForm, componentId: e.target.value })}>
                  <option value="">-- Select Component --</option>
                  {showResult.availableComponentIds.split(',').filter(Boolean).map(id => (
                    <option key={id.trim()} value={id.trim()}>Component #{id.trim()}</option>
                  ))}
                </select>
              ) : (
                <input type="number" className="form-control"
                  value={resultForm.componentId}
                  onChange={e => setResultForm({ ...resultForm, componentId: e.target.value })}
                  placeholder="Enter component ID" />
              )}
            </Col>

            <Col xs={12}>
              <label className="form-label">Compatibility</label>
              <select className="form-select" value={resultForm.compatibility}
                onChange={e => setResultForm({ ...resultForm, compatibility: e.target.value })}>
                <option value="COMPATIBLE">COMPATIBLE</option>
                <option value="INCOMPATIBLE">INCOMPATIBLE</option>
              </select>
            </Col>

            <Col xs={12}>
              <label className="form-label">Tested By *</label>
              <input
                className={`form-control${!resultForm.testedBy.trim() ? ' is-invalid' : ''}`}
                value={resultForm.testedBy}
                onChange={e => setResultForm({ ...resultForm, testedBy: e.target.value })}
                placeholder="Lab technician name (required)" />
              {!resultForm.testedBy.trim() && (
                <div className="invalid-feedback">Lab technician name is required</div>
              )}
            </Col>
          </Row>

          {resultForm.compatibility === 'COMPATIBLE' && resultForm.componentId && (
            <div className="alert-glass warning mt-3" style={{ fontSize: '0.85rem' }}>
              ✅ Component <strong>#{resultForm.componentId}</strong> will be{' '}
              <strong>RESERVED</strong>. Request moves to <strong>MATCHED</strong> only
              when all <strong>{showResult?.requiredUnits}</strong> unit
              {showResult?.requiredUnits > 1 ? 's are' : ' is'} compatible.
            </div>
          )}
          {resultForm.compatibility === 'INCOMPATIBLE' && (
            <div className="alert-glass danger mt-3" style={{ fontSize: '0.85rem' }}>
              ❌ Component #{resultForm.componentId} is <strong>INCOMPATIBLE</strong>. Select another component.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass"
            onClick={() => { setShowResult(null); setResultForm(INIT_RESULT); }}>
            Cancel
          </button>
          <button className="btn-crimson" onClick={submitResult}
            disabled={!resultForm.componentId || !resultForm.testedBy.trim()}>
            Submit Result
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}