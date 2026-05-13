import { Modal, Row, Col } from 'react-bootstrap'
import DataTable from '../../shared/ui/DataTable'
import StatusBadge from '../../shared/ui/StatusBadge'
import PageHeader from '../../shared/ui/PageHeader'
import { getRole } from '../../../api/authUtils'

const SEARCH_LABELS = {
  donation:  'Donation ID',
  patient:   'Patient ID',
  component: 'Component ID',
}

const DetailRow = ({ label, value }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', borderBottom: '1px solid var(--border-light)',
  }}>
    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {label}
    </span>
    <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 500 }}>
      {value ?? '—'}
    </span>
  </div>
)

export default function LookbackSearch({
  searchType, searchId, traces, searchLoading,
  showNew, form,
  investigateData, investigateLoading,
  onSearchTypeChange, onSearchIdChange, onSearch,
  onInitiateClick, onNewClose, onFormChange, onInitiate,
  onInvestigate, onInvestigateClose,
}) {
  const isPrefilled = !!(form.componentId && form.patientId)
  const isAdmin     = getRole() === 'ROLE_ADMIN'

  const traceColumns = [
    { key: 'traceId',     label: 'Trace ID' },
    { key: 'donationId',  label: 'Donation' },
    { key: 'componentId', label: 'Component' },
    { key: 'patientId',   label: 'Patient' },
    { key: 'traceDate',   label: 'Date',   render: v => v ?? '—' },
    { key: 'status',      label: 'Status', render: v => <StatusBadge status={v} /> },
  ]

  const componentColumns = [
    { key: 'componentId',   label: 'Component ID' },
    { key: 'componentType', label: 'Type' },
    { key: 'bloodGroup',    label: 'Blood Group', render: (v, row) => `${v} ${row.rhFactor === 'POSITIVE' ? '+' : '−'}` },
    { key: 'status',        label: 'Status',      render: v => <StatusBadge status={v} /> },
    { key: 'expiryDate',    label: 'Expiry',      render: v => v ?? '—' },
  ]

  const donor      = investigateData?.donor
  const donation   = investigateData?.donation
  const components = Array.isArray(investigateData?.components)
    ? investigateData.components
    : investigateData?.components?.content ?? []

  return (
    <div className="animate-fadein">
      <PageHeader title="Lookback Traceability">
        {/* + Initiate Lookback — Admin only */}
        {isAdmin && (
          <button className="btn-crimson" onClick={onInitiateClick}>
            + Initiate Lookback
          </button>
        )}
      </PageHeader>

      {/* Search panel — both roles can search */}
      <div className="glass-card p-4 mb-4">
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Search By</label>
          <div className="d-flex gap-2">
            {['donation', 'patient', 'component'].map(t => (
              <button key={t} type="button"
                className={searchType === t ? 'btn-crimson' : 'btn-glass'}
                style={{ fontSize: '0.82rem', textTransform: 'capitalize' }}
                onClick={() => onSearchTypeChange(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="d-flex gap-2" style={{ maxWidth: 420 }}>
          <input type="number" className="form-control"
            placeholder={`Enter ${SEARCH_LABELS[searchType]}`}
            value={searchId}
            onChange={e => onSearchIdChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()} />
          <button className="btn-crimson" style={{ whiteSpace: 'nowrap' }}
            disabled={!searchId || searchLoading} onClick={onSearch}>
            {searchLoading ? 'Searching...' : '🔍 Trace'}
          </button>
        </div>
      </div>

      {/* Trace results */}
      {traces.length > 0 && (
        <div className="table-wrapper">
          <DataTable
            columns={traceColumns}
            data={traces}
            loading={false}
            // 🔬 Investigate — Admin only
            actions={isAdmin ? row => (
              <button className="btn-glass" style={{ fontSize: '0.75rem' }}
                disabled={investigateLoading}
                onClick={() => onInvestigate(row.donationId)}>
                {investigateLoading ? '...' : '🔬 Investigate'}
              </button>
            ) : null}
          />
        </div>
      )}

      {!searchLoading && searchId && traces.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No traces found for {SEARCH_LABELS[searchType]} {searchId}
        </div>
      )}

      {/* ── Investigation Details Modal — Admin only ── */}
      {isAdmin && (
        <Modal show={!!investigateData} onHide={onInvestigateClose} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>🔬 Lookback Investigation — Donation #{donation?.donationId}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {investigateData && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--crimson)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Donor Details
                  </div>
                  <div style={{ background: 'var(--crimson-pale)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px 16px' }}>
                    {donor ? (
                      <>
                        <DetailRow label="Donor ID"    value={donor.donorId} />
                        <DetailRow label="Name"        value={donor.name} />
                        <DetailRow label="Blood Group" value={`${donor.bloodGroup} ${donor.rhFactor === 'POSITIVE' ? '+' : '−'}`} />
                        <DetailRow label="Contact"     value={donor.contactInfo} />
                        <DetailRow label="Donor Type"  value={donor.donorType} />
                        <DetailRow label="Status"      value={donor.status} />
                      </>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Donor details unavailable.</p>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--crimson)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Donation Details
                  </div>
                  <div style={{ background: 'var(--surface-glass)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px 16px' }}>
                    <DetailRow label="Donation ID"     value={donation?.donationId} />
                    <DetailRow label="Collection Date" value={donation?.collectionDate} />
                    <DetailRow label="Bag ID"          value={donation?.bagId} />
                    <DetailRow label="Volume (ml)"     value={donation?.volumeMl} />
                    <DetailRow label="Collected By"    value={donation?.collectedBy} />
                    <DetailRow label="Status"          value={donation?.collectionStatus} />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--crimson)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    All Components from this Donation
                    <span style={{ marginLeft: 8, fontWeight: 400, color: 'var(--text-muted)' }}>
                      ({components.length} component{components.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  {components.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No components found.</p>
                  ) : (
                    <DataTable columns={componentColumns} data={components} loading={false} />
                  )}
                  {components.some(c => c.status === 'ISSUED' || c.status === 'RESERVED') && (
                    <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, fontSize: '0.83rem', color: 'rgb(220,38,38)' }}>
                      ⚠️ <strong>Action Required:</strong> One or more components from this donation
                      have been issued or reserved. Affected patients should be notified immediately.
                    </div>
                  )}
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button className="btn-glass" onClick={onInvestigateClose}>Close</button>
          </Modal.Footer>
        </Modal>
      )}

      {/* ── Initiate Lookback Modal — Admin only ── */}
      {isAdmin && (
        <Modal show={showNew} onHide={onNewClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Initiate Lookback Trace</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isPrefilled && (
              <div style={{ background: 'var(--crimson-pale)', border: '1px solid var(--border-light)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                ℹ️ Component ID and Patient ID are pre-filled from the reaction record.
                {!form.donationId && (
                  <span style={{ display: 'block', marginTop: 4, color: 'rgb(220,38,38)' }}>
                    ⚠️ Donation ID could not be fetched automatically — please enter it manually.
                  </span>
                )}
              </div>
            )}
            <Row className="g-3">
              <Col xs={12}>
                <label className="form-label">Donation ID *</label>
                <input type="number" className="form-control" placeholder="Enter Donation ID"
                  value={form.donationId}
                  onChange={e => onFormChange({ ...form, donationId: e.target.value })} />
              </Col>
              <Col xs={12}>
                <label className="form-label">Component ID *</label>
                <input type="number" className="form-control"
                  value={form.componentId}
                  readOnly={isPrefilled && !!form.componentId}
                  style={isPrefilled && form.componentId ? { background: 'var(--surface-glass)', cursor: 'not-allowed' } : {}}
                  onChange={e => onFormChange({ ...form, componentId: e.target.value })} />
              </Col>
              <Col xs={12}>
                <label className="form-label">Patient ID *</label>
                <input type="number" className="form-control"
                  value={form.patientId}
                  readOnly={isPrefilled && !!form.patientId}
                  style={isPrefilled && form.patientId ? { background: 'var(--surface-glass)', cursor: 'not-allowed' } : {}}
                  onChange={e => onFormChange({ ...form, patientId: e.target.value })} />
              </Col>
            </Row>
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--crimson-pale)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              ℹ️ A lookback trace links a donation to the component it produced and the patient
              who received it. The system verifies the donation and component exist before creating the trace.
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn-glass" onClick={onNewClose}>Cancel</button>
            <button className="btn-crimson" onClick={onInitiate}
              disabled={!form.donationId || !form.componentId || !form.patientId}>
              Initiate Trace
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}