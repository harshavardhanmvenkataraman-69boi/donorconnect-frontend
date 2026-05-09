export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
        <div>
          <h4>{title}</h4>
          {subtitle && <p className="page-header-sub mb-0">{subtitle}</p>}
        </div>
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
