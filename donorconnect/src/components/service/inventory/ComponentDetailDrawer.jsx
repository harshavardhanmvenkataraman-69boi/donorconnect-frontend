import { useEffect, useState } from 'react'
import { Offcanvas } from 'react-bootstrap'
import api from '../../../api/axiosInstance'
import LoadingSpinner from '../../shared/ui/LoadingSpinner'
import StatusBadge from '../../shared/ui/StatusBadge'

const rhSign = (rh) => (rh === 'POSITIVE' ? '+' : rh === 'NEGATIVE' ? '−' : '')

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

const daysUntil = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d)) return null
  const ms = d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.floor(ms / 86400000)
}

const TXN_TYPE_DELTA = {
  RECEIPT: '+',     RETURN: '+',     TRANSFER_IN: '+',  RELEASE: '+',
  ISSUE:   '−',     TRANSFER_OUT: '−', QUARANTINE: '−',
  ADJUST:  '±',
}

export default function ComponentDetailDrawer({ componentId, show, onClose }) {
  const [balance, setBalance] = useState(null)
  const [txns, setTxns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!show || !componentId) return

    setLoading(true)
    setError(null)
    setBalance(null)
    setTxns([])

    Promise.allSettled([
      api.get(`/api/inventory/component/${componentId}`),
      api.get(`/api/stock-transactions/component/${componentId}`),
    ])
      .then(([balRes, txnRes]) => {
        if (balRes.status === 'fulfilled') {
          setBalance(balRes.value?.data?.data ?? balRes.value?.data ?? null)
        } else {
          setError(`Component ${componentId} not found in inventory.`)
        }
        if (txnRes.status === 'fulfilled') {
          const data = txnRes.value?.data?.data ?? txnRes.value?.data ?? []
          setTxns(Array.isArray(data) ? data : [])
        }
      })
      .finally(() => setLoading(false))
  }, [show, componentId])

  const days = balance ? daysUntil(balance.expiryDate) : null
  const isExpiringSoon = days !== null && days >= 0 && days <= 7
  const isExpired = days !== null && days < 0

  return (
    <Offcanvas show={show} onHide={onClose} placement="end" style={{ width: 500 }}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          {componentId ? `Component #${componentId}` : 'Component Detail'}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {loading && <LoadingSpinner />}

        {!loading && error && (
          <div className="alert-glass error">⚠️ {error}</div>
        )}

        {!loading && !error && balance && (
          <>
            {/* === Balance summary === */}
            <section className="mb-4">
              <h6 className="text-uppercase mb-3" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Current Balance
              </h6>
              <div className="alert-glass mb-0">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                      {balance.bloodGroup}{rhSign(balance.rhFactor)}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {balance.componentType?.replace(/_/g, ' ') || '—'}
                    </div>
                  </div>
                  <StatusBadge status={balance.status} />
                </div>
                <hr className="my-2" />
                <div className="row g-2" style={{ fontSize: '0.85rem' }}>
                  <div className="col-6">
                    <span style={{ color: 'var(--text-muted)' }}>Bag #</span><br />
                    <strong>{balance.bagNumber || '—'}</strong>
                  </div>
                  <div className="col-6">
                    <span style={{ color: 'var(--text-muted)' }}>Quantity</span><br />
                    <strong>{balance.quantity ?? 0} unit(s)</strong>
                  </div>
                  <div className="col-6">
                    <span style={{ color: 'var(--text-muted)' }}>Expiry Date</span><br />
                    <strong>{formatDate(balance.expiryDate)}</strong>
                  </div>
                  <div className="col-6">
                    <span style={{ color: 'var(--text-muted)' }}>Days Left</span><br />
                    <strong style={{
                      color: isExpired ? 'var(--danger)' :
                             isExpiringSoon ? 'var(--warning)' : 'inherit'
                    }}>
                      {days === null ? '—' :
                       days < 0 ? `EXPIRED (${Math.abs(days)}d ago)` :
                       days === 0 ? 'Today' :
                       `${days} day(s)`}
                    </strong>
                  </div>
                  <div className="col-12 mt-2">
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      Created {formatDateTime(balance.createdAt)}
                      {balance.updatedAt && balance.updatedAt !== balance.createdAt && (
                        <> · Updated {formatDateTime(balance.updatedAt)}</>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {(isExpired || isExpiringSoon) && balance.status === 'AVAILABLE' && (
                <div className={`alert-glass ${isExpired ? 'error' : 'warning'} mt-2`} style={{ fontSize: '0.85rem' }}>
                  {isExpired
                    ? `⚠️ This component expired ${Math.abs(days)} day(s) ago and is still marked AVAILABLE.`
                    : `⚠️ Expires in ${days} day(s). Action soon.`}
                </div>
              )}
            </section>

            {/* === Transaction history === */}
            <section>
              <h6 className="text-uppercase mb-3" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Transaction History
                {txns.length > 0 && <span className="ms-2 text-muted">({txns.length})</span>}
              </h6>
              {txns.length === 0 ? (
                <div className="text-center py-3" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No transactions recorded for this component.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {txns.map(t => {
                    const sign = TXN_TYPE_DELTA[t.txnType] || '·'
                    const isOutflow = sign === '−'
                    const isInflow = sign === '+'
                    return (
                      <div key={t.txnId} className="alert-glass mb-0" style={{ fontSize: '0.85rem' }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong style={{
                              color: isOutflow ? 'var(--danger)' :
                                     isInflow ? 'var(--success)' : 'inherit'
                            }}>
                              {sign}{t.quantity} · {t.txnType?.replace(/_/g, ' ')}
                            </strong>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {formatDate(t.txnDate)} · Txn #{t.txnId}
                              {t.referenceId && <> · Ref: {t.referenceId}</>}
                            </div>
                          </div>
                        </div>
                        {t.notes && (
                          <div className="mt-1" style={{ fontSize: '0.8rem' }}>
                            {t.notes}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  )
}
