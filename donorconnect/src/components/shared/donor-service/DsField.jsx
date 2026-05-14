/**
 * DsField — Bootstrap 5 form field components.
 * All custom classes replaced with Bootstrap form utilities.
 */

export function DsField({ label, hint, required, children }) {
  return (
    <div className="mb-0">
      <label className="form-label small fw-semibold text-uppercase text-secondary mb-1" style={{ letterSpacing: '0.5px', fontSize: '0.72rem' }}>
        {label}{required && <span className="text-danger ms-1">*</span>}
      </label>
      {hint && <div className="text-muted mb-1" style={{ fontSize: '0.68rem' }}>{hint}</div>}
      {children}
    </div>
  )
}

export function DsInput({ className = '', ...props }) {
  return <input className={`form-control form-control-sm ${className}`} {...props} />
}

export function DsTextarea({ rows = 3, className = '', ...props }) {
  return <textarea className={`form-control form-control-sm ${className}`} rows={rows} {...props} />
}

export function DsSelect({ value, onChange, children, disabled, className = '' }) {
  return (
    <select className={`form-select form-select-sm ${className}`} value={value} onChange={onChange} disabled={disabled}>
      {children}
    </select>
  )
}