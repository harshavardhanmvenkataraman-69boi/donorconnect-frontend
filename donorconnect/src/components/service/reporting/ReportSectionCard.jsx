// Section card that matches the project's glass card style from index.css
import LoadingSpinner from '../../shared/ui/LoadingSpinner';

export default function ReportSectionCard({
  title,
  subtitle,
  loading,
  children,
  action,       // optional button/element top-right
  accentColor = 'var(--crimson)',
}) {
  return (
    <div className="glass-card" style={{ padding: '20px 22px', height: '100%' }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: loading ? 16 : 14, gap: 8,
      }}>
        <div>
          <h6 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem',
            color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px',
          }}>
            {title}
          </h6>
          {subtitle && (
            <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', margin: '2px 0 0', fontWeight: 400 }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>

      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 16, bottom: 16,
        width: 3, borderRadius: '0 3px 3px 0',
        background: accentColor, opacity: 0.5,
      }} />

      {/* Content */}
      {loading ? <LoadingSpinner /> : children}
    </div>
  );
}
