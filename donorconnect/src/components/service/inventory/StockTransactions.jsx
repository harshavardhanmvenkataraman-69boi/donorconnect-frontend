import { Modal, Row, Col } from 'react-bootstrap'
import PageHeader from '../../shared/ui/PageHeader'
import DataTable from '../../shared/ui/DataTable'
import StatusBadge from '../../shared/ui/StatusBadge'

const TXN_TYPES = ['RECEIPT', 'ISSUE', 'RETURN', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUST', 'QUARANTINE', 'RELEASE']

const OUTFLOW_TYPES = new Set(['ISSUE', 'TRANSFER_OUT', 'QUARANTINE'])

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d) ? '—' : d.toLocaleDateString()
}

const formatDateTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d) ? '—' : d.toLocaleString()
}

export default function StockTransactions({
  txns,
  loading,
  typeFilter,
  page,
  pageSize,
  hasMore,
  showModal,
  form,
  saving,
  componentBalance,
  balanceLoading,
  onTypeFilterChange,
  onPrevPage,
  onNextPage,
  onOpenModal,
  onCloseModal,
  onFormChange,
  onSubmit,
  onView,
}) {
  // Determine if there's a stock-availability warning to show
  const requestedQty = Number(form.quantity) || 0
  const isOutflow = OUTFLOW_TYPES.has(form.txnType)
  const hasInsufficientStock =
    componentBalance &&
    isOutflow &&
    requestedQty > 0 &&
    requestedQty > (componentBalance.quantity ?? 0)
  return (
    <div className="animate-fadein">
      <PageHeader title="Stock Transactions" subtitle="Audit log of all inventory movements">
        <button className="btn-crimson" onClick={onOpenModal}>+ Record Transaction</button>
      </PageHeader>

      <div className="filter-row mb-3">
        <select
          className="form-select"
          style={{ width: 220 }}
          value={typeFilter}
          onChange={e => onTypeFilterChange(e.target.value)}
        >
          <option value="">All Transaction Types</option>
          {TXN_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
        {typeFilter && (
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onTypeFilterChange('')}>
            ✕ Clear
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <DataTable
          columns={[
            { key: 'txnId', label: 'Txn ID' },
            { key: 'componentId', label: 'Component ID' },
            {
              key: 'txnType',
              label: 'Type',
              render: v => v ? <StatusBadge status={v.replace(/_/g, ' ')} /> : '—',
            },
            { key: 'quantity', label: 'Qty', render: v => <strong>{v ?? 0}</strong> },
            { key: 'txnDate', label: 'Txn Date', render: formatDate },
            { key: 'referenceId', label: 'Reference', render: v => v || '—' },
            { key: 'notes', label: 'Notes', render: v => v || '—' },
            { key: 'createdAt', label: 'Recorded At', render: formatDateTime },
          ]}
          data={txns}
          loading={loading}
          actions={(row) => (
            <button
              className="btn-glass"
              style={{ fontSize: '0.75rem' }}
              onClick={() => onView?.(row)}
            >
              View
            </button>
          )}
        />
      </div>

      {/* Pagination — only shown when no type filter (server returns all matching for type filters) */}
      {!typeFilter && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            Page {page + 1} · Showing up to {pageSize} per page
          </small>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={onPrevPage}
              disabled={page === 0 || loading}
            >
              ← Previous
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={onNextPage}
              disabled={!hasMore || loading}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      <Modal show={showModal} onHide={onCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Record Stock Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <label className="form-label">Component ID <span className="text-danger">*</span></label>
              <input
                type="number"
                className="form-control"
                value={form.componentId}
                onChange={e => onFormChange('componentId', e.target.value)}
                placeholder="e.g. 42"
                min={1}
              />
            </Col>
            <Col xs={12} md={6}>
              <label className="form-label">Transaction Type <span className="text-danger">*</span></label>
              <select
                className="form-select"
                value={form.txnType}
                onChange={e => onFormChange('txnType', e.target.value)}
              >
                {TXN_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </Col>

            {/* Live availability panel — appears once a component ID is entered */}
            {form.componentId && (
              <Col xs={12}>
                {balanceLoading && (
                  <div className="alert-glass mb-0" style={{ fontSize: '0.85rem' }}>
                    Looking up component {form.componentId}…
                  </div>
                )}
                {!balanceLoading && componentBalance && (
                  <div
                    className={`alert-glass mb-0 ${hasInsufficientStock ? 'error' : ''}`}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <strong>Component {componentBalance.componentId}</strong>
                    {componentBalance.bagNumber && ` · Bag ${componentBalance.bagNumber}`}
                    {componentBalance.bloodGroup && ` · ${componentBalance.bloodGroup}${componentBalance.rhFactor === 'POSITIVE' ? '+' : componentBalance.rhFactor === 'NEGATIVE' ? '−' : ''}`}
                    {componentBalance.componentType && ` · ${componentBalance.componentType.replace(/_/g, ' ')}`}
                    {' · '}
                    <strong>Available: {componentBalance.quantity ?? 0} unit(s)</strong>
                    {' · Status: '}{componentBalance.status ?? '—'}
                    {hasInsufficientStock && (
                      <div className="mt-1">
                        ⚠️ Insufficient stock — requesting {requestedQty} but only {componentBalance.quantity ?? 0} available.
                      </div>
                    )}
                  </div>
                )}
                {!balanceLoading && !componentBalance && form.componentId && (
                  <div className="alert-glass error mb-0" style={{ fontSize: '0.85rem' }}>
                    ⚠️ Component {form.componentId} not found in inventory.
                  </div>
                )}
              </Col>
            )}
            <Col xs={12} md={6}>
              <label className="form-label">Quantity <span className="text-danger">*</span></label>
              <input
                type="number"
                className="form-control"
                value={form.quantity}
                onChange={e => onFormChange('quantity', e.target.value)}
                placeholder="Units"
                min={1}
              />
            </Col>
            <Col xs={12} md={6}>
              <label className="form-label">Transaction Date</label>
              <input
                type="date"
                className="form-control"
                value={form.txnDate}
                onChange={e => onFormChange('txnDate', e.target.value)}
              />
            </Col>
            <Col xs={12}>
              <label className="form-label">Reference ID</label>
              <input
                type="text"
                className="form-control"
                value={form.referenceId}
                onChange={e => onFormChange('referenceId', e.target.value)}
                placeholder="External reference (PO #, request #, etc.)"
              />
            </Col>
            <Col xs={12}>
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.notes}
                onChange={e => onFormChange('notes', e.target.value)}
                placeholder="Optional notes about this transaction"
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={onCloseModal} disabled={saving}>Cancel</button>
          <button className="btn-crimson" onClick={onSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Record Transaction'}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
