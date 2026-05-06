import { useEffect } from 'react'

/**
 * DsModal — Fixed modal with proper backdrop blur, high z-index, and smooth animation.
 * Sits above sidebar/navbar by using z-index 9999.
 */
export default function DsModal({
  show, onClose, title, subtitle,
  size = 'md', headerRight, footer, children,
  zIndex,
}) {
  useEffect(() => {
    if (!show) return
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [show, onClose])

  if (!show) return null

  const maxWidths = { sm: '420px', md: '540px', lg: '700px', xl: '900px' }
  const backdropZ = zIndex ? zIndex - 1 : 9998
  const modalZ    = zIndex ?? 9999

  return (
    <>
      <style>{`
        @keyframes ds-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ds-modal-in {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .ds-backdrop {
          position: fixed; inset: 0;
          background: rgba(10, 10, 20, 0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          animation: ds-backdrop-in 0.2s ease forwards;
        }
        .ds-modal-wrap {
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100vw - 2rem);
          max-height: calc(100vh - 3rem);
          display: flex; flex-direction: column;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06);
          animation: ds-modal-in 0.25s cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
          overflow: hidden;
        }
        .ds-modal-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 1.25rem 1.5rem 1rem;
          border-bottom: 1px solid #f0f0f0;
          flex-shrink: 0;
        }
        .ds-modal-title {
          font-size: 1.05rem; font-weight: 700;
          color: #1a1a2e; margin: 0 0 0.2rem;
          letter-spacing: -0.2px;
        }
        .ds-modal-subtitle {
          font-size: 0.78rem; color: #999; margin: 0;
        }
        .ds-modal-close {
          width: 30px; height: 30px; border-radius: 50%;
          border: 1.5px solid #e8e8e8;
          background: #fafafa; color: #888;
          font-size: 0.8rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; flex-shrink: 0; margin-left: 0.75rem;
          line-height: 1;
        }
        .ds-modal-close:hover { background: #fff0f0; border-color: #c62828; color: #c62828; }
        .ds-modal-body { overflow-y: auto; flex: 1; }
        .ds-modal-footer {
          display: flex; justify-content: flex-end; align-items: center; gap: 0.6rem;
          padding: 0.9rem 1.5rem;
          border-top: 1px solid #f0f0f0;
          flex-shrink: 0;
          background: #fafafa;
        }
      `}</style>

      {/* Backdrop */}
      <div className="ds-backdrop" style={{ zIndex: backdropZ }} onClick={onClose} />

      {/* Modal */}
      <div
        className="ds-modal-wrap"
        style={{ maxWidth: maxWidths[size] || maxWidths.md, zIndex: modalZ }}
        role="dialog"
        aria-modal="true"
      >
        <div className="ds-modal-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="ds-modal-title">{title}</p>
            {subtitle && <p className="ds-modal-subtitle">{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {headerRight}
            <button className="ds-modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className="ds-modal-body">{children}</div>

        {footer && <div className="ds-modal-footer">{footer}</div>}
      </div>
    </>
  )
}