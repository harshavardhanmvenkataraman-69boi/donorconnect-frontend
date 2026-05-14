import PageHeader from '../../shared/ui/PageHeader'
import DataTable from '../../shared/ui/DataTable'
import StatusBadge from '../../shared/ui/StatusBadge'
import { DsBtnInline } from '../../shared/donor-service/DsButtons'

const fmtDT = (v) => v ? new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const TABS = [
  { key: 'ALL',    label: 'All'    },
  { key: 'Unread', label: 'Unread' },
]

export default function DonorNotifications({
  notifications, loading, tab, unreadCount,
  onTabChange, onMarkRead,
}) {
  const filtered = tab === 'Unread'
    ? notifications.filter(n => n.status === 'UNREAD')
    : notifications

  const columns = [
    { key: 'id', label: 'ID',
      render: v => <code className="text-muted small">#{v}</code> },
    { key: 'category', label: 'Category', render: v => <StatusBadge status={v} /> },
    { key: 'message', label: 'Message',
      render: v => <span className="small">{v}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'sentAt', label: 'Sent At',
      render: v => <span className="small text-muted">{fmtDT(v)}</span> },
  ]

  return (
    <div className="animate-fadein">
      <PageHeader title="My Notifications" />

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {TABS.map(t => (
          <li key={t.key} className="nav-item">
            <button
              className={`nav-link${tab === t.key ? ' active' : ''}`}
              onClick={() => onTabChange(t.key)}
            >
              {t.label}
              {t.key === 'Unread' && unreadCount > 0 && (
                <span className="badge bg-danger rounded-pill ms-2" style={{ fontSize: '0.65rem' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="table-wrapper">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          actions={row =>
            row.status === 'UNREAD' ? (
              <DsBtnInline variant="blue" onClick={() => onMarkRead(row.id)}>
                ✓ Mark Read
              </DsBtnInline>
            ) : null
          }
        />
      </div>
    </div>
  )
}