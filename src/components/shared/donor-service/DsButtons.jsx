/**
 * DsButtons — Bootstrap 5 button primitives.
 * All custom CSS replaced with Bootstrap btn classes.
 */

function Spinner() {
  return <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
}

export function DsBtnPrimary({ children, loading, loadingText, disabled, onClick, type = 'button' }) {
  return (
    <button type={type} className="btn btn-danger btn-sm px-3" disabled={disabled || loading} onClick={onClick}>
      {loading ? <><Spinner />{loadingText || 'Saving…'}</> : children}
    </button>
  )
}

export function DsBtnGhost({ children, disabled, onClick, type = 'button' }) {
  return (
    <button type={type} className="btn btn-outline-secondary btn-sm px-3" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}

export function DsBtnSecondary({ children, disabled, onClick }) {
  return (
    <button type="button" className="btn btn-secondary btn-sm px-3" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}

export function DsBtnDanger({ children, loading, loadingText, disabled, onClick }) {
  return (
    <button type="button" className="btn btn-danger btn-sm px-3" disabled={disabled || loading} onClick={onClick}>
      {loading ? <><Spinner />{loadingText || 'Processing…'}</> : children}
    </button>
  )
}

export function DsBtnLift({ children, loading, disabled, onClick }) {
  return (
    <button type="button" className="btn btn-primary btn-sm px-3" disabled={disabled || loading} onClick={onClick}>
      {loading ? <><Spinner />Lifting…</> : children}
    </button>
  )
}

/**
 * DsBtnInline — compact Bootstrap btn for DataTable action cells.
 * variant: 'default' | 'green' | 'orange' | 'blue' | 'red'
 */
const VARIANT_CLASS = {
  default: 'btn-outline-secondary',
  green:   'btn-outline-success',
  orange:  'btn-outline-warning',
  blue:    'btn-outline-primary',
  red:     'btn-outline-danger',
}

export function DsBtnInline({ children, loading, disabled, onClick, variant = 'default' }) {
  return (
    <button type="button"
      className={`btn btn-sm py-0 px-2 ${VARIANT_CLASS[variant] || VARIANT_CLASS.default}`}
      style={{ fontSize: '0.72rem' }}
      disabled={disabled || loading}
      onClick={onClick}>
      {loading
        ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        : children}
    </button>
  )
}