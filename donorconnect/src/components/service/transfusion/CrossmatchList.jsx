import { useState } from 'react'
import { Modal, Row, Col } from 'react-bootstrap'
import DataTable from '../../shared/ui/DataTable'
import StatusBadge from '../../shared/ui/StatusBadge'
import PageHeader from '../../shared/ui/PageHeader'
import Pagination from '../../shared/ui/Pagination'

const BloodGroupBadge = ({ bloodGroup, rhFactor }) => {
  const bgColorMap  = { 'O': 'rgba(239, 68, 68, 0.1)', 'A': 'rgba(59, 130, 246, 0.1)', 'B': 'rgba(34, 197, 94, 0.1)', 'AB': 'rgba(168, 85, 247, 0.1)' }
  const textColorMap = { 'O': 'rgb(220, 38, 38)', 'A': 'rgb(37, 99, 235)', 'B': 'rgb(22, 163, 74)', 'AB': 'rgb(147, 51, 234)' }
  const bg        = bgColorMap[bloodGroup]  || bgColorMap['O']
  const textColor = textColorMap[bloodGroup] || textColorMap['O']
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:bg, border:`1.5px solid ${textColor}`, borderRadius:20, padding:'4px 12px', fontWeight:600, fontSize:'0.85rem', color:textColor, whiteSpace:'nowrap' }}>
      <span>{bloodGroup}</span>
      <span style={{ fontSize:'0.75rem', opacity:0.8 }}>{rhFactor === 'POSITIVE' ? '+' : '−'}</span>
    </div>
  )
}

const getActionLabel = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING': return { label: '1️⃣ Record Result', type: 'button' }
    case 'MATCHED': return { label: '2️⃣ Ready to Issue', type: 'badge', bg: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', color: 'rgb(22, 163, 74)' }
    case 'ISSUED':  return { label: '3️⃣ Issued',         type: 'badge', bg: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', color: 'rgb(134, 239, 172)' }
    default:        return null
  }
}

export default function CrossmatchList({
  tab, requests, loading, showNew, showResult, form, resultForm,
  patientIdFilter, patientError,
  page, totalPages, totalElements, pageSize, onPageChange,
  onPatientIdFilterChange, onSearchByPatient, onClearPatientSearch,
  onTabChange, onNewClick, onNewClose, onFormChange, onCreate,
  onResultClose, onResultFormChange, onSubmitResult, onRecordResult,
}) {
  const [viewRow, setViewRow] = useState(null)

  const columns = [
    { key: 'requestId',     label: 'ID' },
    { key: 'patientId',     label: 'Patient ID' },
    { key: 'bloodGroup',    label: 'Blood Group', render: (v, row) => <BloodGroupBadge bloodGroup={v} rhFactor={row.rhFactor} /> },
    { key: 'requiredUnits', label: 'Units' },
    { key: 'priority',      label: 'Priority', render: v => <StatusBadge status={v} /> },
    { key: 'status',        label: 'Status',   render: v => <StatusBadge status={v} />, width: '120px' },
    { key: 'requestDate',   label: 'Date',     render: v => v ?? '—' },
  ]

  return (
    <div className="animate-fadein">
      <PageHeader title="Crossmatch Requests">
        <button className="btn-crimson" onClick={onNewClick}>+ New Request</button>
      </PageHeader>

      {/* Search bar */}
      <div className="mb-3" style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-start' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <label className="form-label" style={{ marginBottom:0, minWidth:90 }}>Patient search</label>
            <input type="number" className={`form-control${patientError?' is-invalid':''}`} style={{ width:180 }}
              placeholder="Patient ID" value={patientIdFilter}
              onChange={e => onPatientIdFilterChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSearchByPatient()} />
          </div>
          {patientError && (
            <div style={{ marginLeft:98, fontSize:'0.78rem', color:'rgb(220,38,38)', display:'flex', alignItems:'center', gap:4 }}>
              ⚠️ {patientError}
            </div>
          )}
        </div>
        <button className="btn-glass" onClick={onSearchByPatient}>Search</button>
        <button className="btn-glass" onClick={onClearPatientSearch}>Clear</button>
      </div>

      <div className="nav-tabs-glass mb-4">
        {['pending', 'all'].map(t => (
          <button key={t} className={`nav-link${tab === t ? ' active' : ''}`} onClick={() => onTabChange(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <DataTable
          columns={columns}
          data={requests}
          loading={loading}
          actions={row => {
            const action = getActionLabel(row.status)
            return (
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <button className="btn-glass" style={{ fontSize:'0.75rem' }} onClick={() => setViewRow(row)}>View</button>
                {action?.type === 'button' && (
                  <button className="btn-glass" style={{ fontSize:'0.85rem' }} onClick={() => onRecordResult(row)}>{action.label}</button>
                )}
                {action?.type === 'badge' && (
                  <div style={{ display:'flex', alignItems:'center', padding:'6px 12px', background:action.bg, border:action.border, borderRadius:6, fontSize:'0.85rem', fontWeight:500, color:action.color }}>{action.label}</div>
                )}
              </div>
            )
          }}
        />
      </div>

      {/* Pagination — only shows on "all" tab with server pagination */}
      {tab === 'all' && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}

      {/* ── View Detail Modal ── */}
      <Modal show={!!viewRow} onHide={() => setViewRow(null)} centered>
        <Modal.Header closeButton><Modal.Title>Request #{viewRow?.requestId}</Modal.Title></Modal.Header>
        <Modal.Body>
          {viewRow && (
            <div style={{ display:'flex', flexDirection:'column' }}>
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <BloodGroupBadge bloodGroup={viewRow.bloodGroup} rhFactor={viewRow.rhFactor} />
              </div>
              {[
                ['Request ID',     viewRow.requestId],
                ['Patient ID',     viewRow.patientId],
                ['Blood Group',    `${viewRow.bloodGroup} ${viewRow.rhFactor === 'POSITIVE' ? 'Positive' : 'Negative'}`],
                ['Required Units', viewRow.requiredUnits],
                ['Component Type', viewRow.componentType || '—'],
                ['Ordered By',     viewRow.orderBy || '—'],
                ['Request Date',   viewRow.requestDate ?? '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border-light)' }}>
                  <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</span>
                  <span style={{ fontSize:'0.88rem', color:'var(--text-primary)', fontWeight:500 }}>{value}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border-light)' }}>
                <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>Priority</span>
                <StatusBadge status={viewRow.priority} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border-light)' }}>
                <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>Status</span>
                <StatusBadge status={viewRow.status} />
              </div>
              {viewRow.availableComponentIds && (
                <div style={{ padding:'10px 0', borderBottom:'1px solid var(--border-light)' }}>
                  <div style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:8 }}>Available Components</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {viewRow.availableComponentIds.split(',').filter(Boolean).map(id => (
                      <span key={id.trim()} style={{ background:'var(--crimson-pale)', border:'1px solid var(--border-light)', borderRadius:6, padding:'2px 10px', fontWeight:600, color:'var(--text-primary)', fontSize:'0.82rem' }}>{id.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              {viewRow.notes && (
                <div style={{ padding:'10px 0' }}>
                  <div style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:6 }}>Notes</div>
                  <div style={{ fontSize:'0.85rem', color:'var(--text-primary)', lineHeight:1.6 }}>{viewRow.notes}</div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {viewRow?.status?.toUpperCase() === 'PENDING' && (
            <button className="btn-crimson" onClick={() => { onRecordResult(viewRow); setViewRow(null) }}>📝 Record Result</button>
          )}
          <button className="btn-glass" onClick={() => setViewRow(null)}>Close</button>
        </Modal.Footer>
      </Modal>

      {/* ── New Crossmatch Request Modal ── */}
      <Modal show={showNew} onHide={onNewClose} centered>
        <Modal.Header closeButton><Modal.Title>New Crossmatch Request</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}><label className="form-label">Patient ID *</label><input type="number" className="form-control" required value={form.patientId} onChange={e => onFormChange({...form,patientId:e.target.value})} /></Col>
            <Col md={6}><label className="form-label">Required Units *</label><input type="number" className="form-control" min={1} value={form.requiredUnits} onChange={e => onFormChange({...form,requiredUnits:e.target.value})} /></Col>
            <Col md={4}><label className="form-label">Blood Group</label><select className="form-select" value={form.bloodGroup} onChange={e => onFormChange({...form,bloodGroup:e.target.value})}>{['A','B','AB','O'].map(g=><option key={g}>{g}</option>)}</select></Col>
            <Col md={4}><label className="form-label">Rh Factor</label><select className="form-select" value={form.rhFactor} onChange={e => onFormChange({...form,rhFactor:e.target.value})}><option>POSITIVE</option><option>NEGATIVE</option></select></Col>
            <Col md={4}><label className="form-label">Priority</label><select className="form-select" value={form.priority} onChange={e => onFormChange({...form,priority:e.target.value})}><option value="ROUTINE">ROUTINE</option><option value="STAT">STAT</option></select></Col>
            <Col md={6}><label className="form-label">Component Type</label><select className="form-select" value={form.componentType} onChange={e => onFormChange({...form,componentType:e.target.value})}><option value="PRBC">PRBC</option><option value="PLATELET">PLATELETS</option><option value="CRYO">CRYO</option><option value="PLASMA">PLASMA</option></select></Col>
            <Col md={6}><label className="form-label">Ordered By</label><input className="form-control" value={form.orderBy} onChange={e => onFormChange({...form,orderBy:e.target.value})} placeholder="Doctor / department name" /></Col>
            <Col xs={12}><label className="form-label">Notes</label><textarea className="form-control" rows={2} value={form.notes} onChange={e => onFormChange({...form,notes:e.target.value})} /></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={onNewClose}>Cancel</button>
          <button className="btn-crimson" onClick={onCreate} disabled={!form.patientId||!form.requiredUnits}>Submit Request</button>
        </Modal.Footer>
      </Modal>

      {/* ── Record Crossmatch Result Modal ── */}
      <Modal show={!!showResult} onHide={onResultClose} centered>
        <Modal.Header closeButton><Modal.Title>Record Crossmatch Result — Request #{resultForm.requestId}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <label className="form-label">Available Component IDs</label>
              <div style={{ background:'var(--surface-glass)', border:'1px solid var(--border-light)', borderRadius:8, padding:'10px 14px' }}>
                {showResult?.availableComponentIds
                  ? showResult.availableComponentIds.split(',').filter(Boolean).map(id => (
                      <span key={id.trim()} style={{ display:'inline-block', background:'var(--crimson-pale)', border:'1px solid var(--border-light)', borderRadius:6, padding:'2px 10px', marginRight:6, marginBottom:4, fontWeight:600, color:'var(--text-primary)', fontSize:'0.85rem' }}>{id.trim()}</span>
                    ))
                  : <span style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>No components listed</span>}
              </div>
            </Col>
            <Col md={6}><label className="form-label">Request ID</label><input className="form-control" value={resultForm.requestId} readOnly /></Col>
            <Col md={6}>
              <label className="form-label">Select Component ID *</label>
              {showResult?.availableComponentIds ? (
                <select className="form-select" value={resultForm.componentId} onChange={e => onResultFormChange({...resultForm,componentId:e.target.value})}>
                  <option value="">-- Select Component --</option>
                  {showResult.availableComponentIds.split(',').filter(Boolean).map(id => <option key={id.trim()} value={id.trim()}>{id.trim()}</option>)}
                </select>
              ) : (
                <input type="number" className="form-control" value={resultForm.componentId} onChange={e => onResultFormChange({...resultForm,componentId:e.target.value})} placeholder="Enter component ID" />
              )}
            </Col>
            <Col xs={12}><label className="form-label">Compatibility</label><select className="form-select" value={resultForm.compatibility} onChange={e => onResultFormChange({...resultForm,compatibility:e.target.value})}><option value="COMPATIBLE">COMPATIBLE</option><option value="INCOMPATIBLE">INCOMPATIBLE</option></select></Col>
            <Col xs={12}>
              <label className="form-label">Tested By *</label>
              <input className={`form-control${!resultForm.testedBy.trim()?' is-invalid':''}`} value={resultForm.testedBy} onChange={e => onResultFormChange({...resultForm,testedBy:e.target.value})} placeholder="Lab technician name (required)" />
              {!resultForm.testedBy.trim() && <div className="invalid-feedback">Lab technician name is required</div>}
            </Col>
          </Row>
          {resultForm.compatibility === 'COMPATIBLE' && resultForm.componentId && (
            <div className="alert-glass warning mt-3" style={{ fontSize:'0.85rem' }}>✅ Component <strong>{resultForm.componentId}</strong> will be <strong>RESERVED</strong>.</div>
          )}
          {resultForm.compatibility === 'INCOMPATIBLE' && (
            <div className="alert-glass danger mt-3" style={{ fontSize:'0.85rem' }}>❌ Component {resultForm.componentId} is <strong>INCOMPATIBLE</strong>.</div>
          )}
          <div className="alert-glass info mt-3" style={{ fontSize:'0.85rem' }}>💡 After recording the result, the transfusion officer can proceed to <strong>Issue Blood Component</strong> for this patient.</div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={onResultClose}>Cancel</button>
          <button className="btn-crimson" onClick={onSubmitResult} disabled={!resultForm.componentId||!resultForm.testedBy.trim()}>Submit Result</button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}