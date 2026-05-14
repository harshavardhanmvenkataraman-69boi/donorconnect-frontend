import { useState } from 'react'
import PageHeader from '../../shared/ui/PageHeader'
import api from '../../../api/axiosInstance'
import { showError } from '../../shared/ui/AlertBanner'

const INIT_FORM = { componentId: '', patientId: '', issuedBy: '', indication: '' }

export default function IssueBloodForm({ onSubmit, loading }) {
  const [form, setForm]                             = useState(INIT_FORM)
  const [confirmed, setConfirmed]                   = useState(false)
  const [patientIdInput, setPatientIdInput]         = useState('')
  const [reservedComponents, setReservedComponents] = useState([])
  const [fetchingComponents, setFetchingComponents] = useState(false)
  const [allIssued, setAllIssued]                   = useState(false)
  const [searched, setSearched]                     = useState(false)

  // Resets entire form to initial state — called by parent after successful issue
  const resetForm = () => {
    setForm(INIT_FORM)
    setConfirmed(false)
    setPatientIdInput('')
    setReservedComponents([])
    setAllIssued(false)
    setSearched(false)
  }

  const fetchReservedComponents = async (patientId) => {
    if (!patientId) return
    setFetchingComponents(true)
    setReservedComponents([])
    setAllIssued(false)
    setSearched(false)
    setForm(prev => ({ ...prev, componentId: '', patientId, indication: '' }))

    try {
      const reqRes = await api.get(`/api/transfusion/crossmatch/requests/patient/${patientId}`)
      const requests = reqRes.data?.data ?? reqRes.data ?? []
      const matchedRequests = Array.isArray(requests) ? requests.filter(r => r.status === 'MATCHED') : []

      if (matchedRequests.length === 0) {
        showError(`No matched crossmatch requests for Patient ${patientId}. Complete crossmatch first.`)
        setSearched(true)
        setFetchingComponents(false)
        return
      }

      const issueRes = await api.get(`/api/transfusion/issue/patient/${patientId}`)
      const issueRecords = issueRes.data?.data ?? issueRes.data ?? []
      const alreadyIssuedIds = new Set(
        Array.isArray(issueRecords)
          ? issueRecords
              .filter(r => r.status === 'ISSUED' || r.status === 'RETURNED')
              .map(r => String(r.componentId))
          : []
      )

      const availableComponents = []
      await Promise.all(
        matchedRequests.map(async (req) => {
          try {
            const res = await api.get(`/api/transfusion/crossmatch/results/request/${req.requestId}`)
            const results = res.data?.data ?? res.data ?? []
            const compatibleResults = Array.isArray(results) ? results.filter(r => r.compatibility === 'COMPATIBLE') : []
            compatibleResults.forEach(result => {
              if (!alreadyIssuedIds.has(String(result.componentId))) {
                availableComponents.push({
                  componentId:   result.componentId,
                  requestId:     req.requestId,
                  bloodGroup:    req.bloodGroup,
                  rhFactor:      req.rhFactor,
                  componentType: req.componentType || 'PRBC',
                })
              }
            })
          } catch { /* skip */ }
        })
      )

      setSearched(true)
      if (availableComponents.length === 0) {
        setAllIssued(true)
      } else {
        setReservedComponents(availableComponents)
        setForm(prev => ({
          ...prev,
          componentId: String(availableComponents[0].componentId),
          indication:  '',
        }))
      }
    } catch {
      showError('Failed to fetch data for this patient.')
    } finally {
      setFetchingComponents(false)
    }
  }

  const selectedComponent = reservedComponents.find(
    c => String(c.componentId) === String(form.componentId)
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form, resetForm)  // ← pass resetForm as second arg
  }

  return (
    <div className="animate-fadein">
      <PageHeader title="Issue Blood Component" subtitle="Complete crossmatch before issuing" />
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <div className="glass-card p-4">
          <form onSubmit={handleSubmit}>

            {/* Patient ID search */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Patient ID *</label>
              <div className="d-flex gap-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter Patient ID"
                  value={patientIdInput}
                  onChange={e => {
                    setPatientIdInput(e.target.value)
                    setReservedComponents([])
                    setAllIssued(false)
                    setSearched(false)
                    setForm(INIT_FORM)
                    setConfirmed(false)
                  }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), fetchReservedComponents(patientIdInput))}
                />
                <button
                  type="button"
                  className="btn-glass"
                  style={{ whiteSpace: 'nowrap', minWidth: 150 }}
                  disabled={!patientIdInput || fetchingComponents}
                  onClick={() => fetchReservedComponents(patientIdInput)}
                >
                  {fetchingComponents ? 'Searching...' : '🔍 Find Components'}
                </button>
              </div>
            </div>

            {/* All components already issued */}
            {allIssued && (
              <div style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 12, padding: '20px 18px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>✅</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>All Components Issued</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  All reserved components for Patient {patientIdInput} have been issued. No further action required.
                </div>
              </div>
            )}

            {/* Reserved components found */}
            {reservedComponents.length > 0 && (
              <>
                <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0 20px' }} />

                {/* Component dropdown */}
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">
                    Reserved Component *
                    <span style={{ marginLeft: 8, fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                      {reservedComponents.length} unit{reservedComponents.length > 1 ? 's' : ''} pending
                    </span>
                  </label>
                  <select
                    className="form-select"
                    value={form.componentId}
                    onChange={e => setForm({ ...form, componentId: e.target.value })}
                    required
                  >
                    {reservedComponents.map(c => (
                      <option key={c.componentId} value={c.componentId}>
                        Component {c.componentId} — {c.componentType} | {c.bloodGroup} {c.rhFactor} | Request {c.requestId}
                      </option>
                    ))}
                  </select>

                  {selectedComponent && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                      {[
                        ['Type',        selectedComponent.componentType],
                        ['Blood Group', `${selectedComponent.bloodGroup} ${selectedComponent.rhFactor}`],
                        ['Request',     `${selectedComponent.requestId}`],
                      ].map(([label, value]) => (
                        <div key={label} style={{
                          background: 'var(--crimson-pale)',
                          border: '1px solid var(--border-light)',
                          borderRadius: 20, padding: '3px 12px',
                          fontSize: '0.78rem', color: 'var(--text-primary)',
                        }}>
                          <span style={{ color: 'var(--text-muted)' }}>{label}: </span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Issued By + Indication */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label className="form-label">Issued By *</label>
                    <input required className="form-control"
                      placeholder="Transfusion officer name"
                      value={form.issuedBy}
                      onChange={e => setForm({ ...form, issuedBy: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Indication *</label>
                    <input required className="form-control"
                      placeholder="e.g. Anaemia, Surgery"
                      value={form.indication}
                      onChange={e => setForm({ ...form, indication: e.target.value })} />
                  </div>
                </div>

                {/* Warning */}
                {form.componentId && (
                  <div style={{
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: 10, padding: '12px 14px',
                    fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: 16,
                  }}>
                    ⚠️ Issuing <strong>Component {form.componentId}</strong> to{' '}
                    <strong>Patient {patientIdInput}</strong>. This action cannot be undone.
                  </div>
                )}

                {/* Confirmation checkbox */}
                <div style={{
                  background: 'var(--crimson-pale)', padding: '14px 16px',
                  borderRadius: 10, border: '1px solid var(--border-light)', marginBottom: 20,
                }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" style={{ marginTop: 3 }}
                      checked={confirmed}
                      onChange={e => setConfirmed(e.target.checked)} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      I confirm this component is crossmatch-compatible and authorized for transfusion.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-crimson"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={!confirmed || loading || !form.componentId || !form.issuedBy || !form.indication}
                >
                  {loading ? 'Processing...' : '💉 Issue Blood Component'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}