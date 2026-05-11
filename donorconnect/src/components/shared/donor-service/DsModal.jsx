import { useEffect } from 'react'

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
    // Force sidebar and navbar below modal backdrop
    const sidebar = document.querySelector('.sidebar, [class*="sidebar"], nav.side, .side-nav, .sidenav')
    const navbar  = document.querySelector('.navbar, .topbar, header, [class*="navbar"], [class*="topbar"]')
    if (sidebar) sidebar.style.zIndex = '1'
    if (navbar)  navbar.style.zIndex  = '1'
    return () => {
      document.removeEventListener('keydown', h)
      document.body.style.overflow = ''
      if (sidebar) sidebar.style.zIndex = ''
      if (navbar)  navbar.style.zIndex  = ''
    }
  }, [show, onClose])

  if (!show) return null

  const maxWidths = { sm: '420px', md: '560px', lg: '720px', xl: '920px' }
  const backdropZ = zIndex ? zIndex - 1 : 9998
  const modalZ    = zIndex ?? 9999

  return (
    <>
      <style>{`
        @keyframes ds-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ds-modal-in {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .ds-backdrop {
          position: fixed; inset: 0;
          background: rgba(8, 8, 18, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: ds-backdrop-in 0.22s ease forwards;
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
          box-shadow:
            0 40px 100px rgba(0,0,0,0.3),
            0 0 0 1px rgba(0,0,0,0.06);
          animation: ds-modal-in 0.28s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
          overflow: hidden;
        }
        .ds-modal-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 1.35rem 1.6rem 1.1rem;
          border-bottom: 1px solid #f0f0f6;
          flex-shrink: 0;
          background: #fff;
        }
        .ds-modal-title {
          font-size: 1.08rem; font-weight: 700;
          color: #1a1a2e; margin: 0 0 0.25rem;
          letter-spacing: -0.2px;
        }
        .ds-modal-subtitle {
          font-size: 0.78rem; color: #aaa; margin: 0;
        }
        .ds-modal-close {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1.5px solid #ececf0;
          background: #f8f8fb; color: #999;
          font-size: 0.78rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; flex-shrink: 0; margin-left: 0.75rem;
          line-height: 1;
        }
        .ds-modal-close:hover {
          background: #fff0f0; border-color: #c62828; color: #c62828;
          transform: scale(1.05);
        }
        .ds-modal-body {
          overflow-y: auto; flex: 1;
          /* Custom scrollbar */
          scrollbar-width: thin;
          scrollbar-color: #e0e0ec transparent;
        }
        .ds-modal-body::-webkit-scrollbar { width: 5px; }
        .ds-modal-body::-webkit-scrollbar-track { background: transparent; }
        .ds-modal-body::-webkit-scrollbar-thumb { background: #e0e0ec; border-radius: 10px; }
        .ds-modal-footer {
          display: flex; justify-content: flex-end; align-items: center; gap: 0.6rem;
          padding: 1rem 1.6rem;
          border-top: 1px solid #f0f0f6;
          flex-shrink: 0;
          background: #fafafa;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="ds-backdrop"
        style={{ zIndex: backdropZ }}
        onClick={onClose}
      />

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