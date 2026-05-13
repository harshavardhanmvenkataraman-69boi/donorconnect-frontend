import { Row, Col } from 'react-bootstrap';
import ReportSectionCard from './ReportSectionCard';
import ReportMetricRow from './ReportMetricRow';
import ReportLegend from './ReportLegend';
import { BarChart, DonutChart, ProgressRow } from './ReportCharts';
import ReportKpiCards from './ReportKpiCards';
import StatusBadge from '../../shared/ui/StatusBadge';

const UTIL_COLORS = {
  available:  '#2ECC71',
  issued:     '#3498DB',
  reserved:   '#F39C12',
  expired:    '#E74C3C',
  quarantine: '#9B59B6',
  disposed:   '#95A5A6',
};

const REACT_COLORS = ['#E74C3C', '#E67E22', '#F39C12', '#C0392B', '#922B21', '#7B241C'];

export default function ReportAnalyticsDashboard({
  loading,
  donorActivity,
  donationFrequency,
  inventorySnapshot,
  utilization,
  deferrals,
  componentWastage,
  reactiveCount,
  tat,
  expiryRisk,
  adverseReactions,
  onRefreshSection,
}) {
  // ── Derived chart data ──────────────────────────────────────────────────

  // Inventory: by component type
  const invByType = Object.entries(inventorySnapshot?.availableByComponentType || {})
    .map(([k, v]) => ({ label: k.replace(/_/g, ' ').slice(0, 6), value: Number(v) }));

  // Inventory: by blood group
  const invByBg = Object.entries(inventorySnapshot?.availableByBloodGroup || {})
    .map(([k, v]) => ({ label: k, value: Number(v) }));

  // Utilization donut
  const utilTotal = Object.values(utilization || {}).reduce((s, v) => s + Number(v), 0) || 1;
  const utilSegments = Object.entries(utilization || {}).map(([k, v]) => ({
    label: k.charAt(0).toUpperCase() + k.slice(1),
    value: Number(v),
    color: UTIL_COLORS[k] || '#BDC3C7',
    pct: utilTotal ? Math.round((Number(v) / utilTotal) * 100) : 0,
  }));

  // Reactive count bars
  const reactBars = Object.entries(reactiveCount || {}).map(([k, v], i) => ({
    label: k.slice(0, 5),
    value: Number(v),
    color: Number(v) > 0 ? REACT_COLORS[i % REACT_COLORS.length] : 'rgba(193,18,31,0.15)',
  }));

  // Adverse reactions by severity
  const rxnBySev = Object.entries(adverseReactions?.bySeverity || {}).map(([k, v], i) => ({
    label: k,
    value: Number(v),
    color: k === 'MILD' ? '#F39C12' : k === 'MODERATE' ? '#E67E22' : '#E74C3C',
  }));

  const deferTotal = Number(deferrals?.activeDeferrals) || 0;

  return (
    <div className="animate-fadein">
      {/* ── KPI row ── */}
      <ReportKpiCards
        donorActivity={donorActivity}
        donationFrequency={donationFrequency}
      />

      {/* ── Row 1: Inventory + Utilization ── */}
      <Row className="g-3 mb-3">
        <Col md={7}>
          <ReportSectionCard
            title="Inventory Snapshot"
            subtitle={`Total available: ${inventorySnapshot?.totalAvailableUnits ?? 0} units`}
            loading={loading.inv}
          >
            <BarChart data={invByType} height={110} label="Available by Component Type" />
            {invByBg.length > 0 && (
              <>
                <hr style={{ borderColor: 'var(--border-light)', margin: '12px 0' }} />
                <BarChart data={invByBg} height={90} label="Available by Blood Group" />
              </>
            )}
          </ReportSectionCard>
        </Col>
        <Col md={5}>
          <ReportSectionCard
            title="Blood Utilization"
            subtitle="All component statuses"
            loading={loading.util}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12 }}>
              <DonutChart segments={utilSegments} size={110} centerLabel={utilTotal} />
              <div style={{ flex: 1 }}>
                {utilSegments.map(s => (
                  <ReportLegend key={s.label} color={s.color} label={s.label} value={s.value} pct={s.pct} />
                ))}
              </div>
            </div>
          </ReportSectionCard>
        </Col>
      </Row>

      {/* ── Row 2: Donor Activity + Deferrals + Wastage ── */}
      <Row className="g-3 mb-3">
        <Col md={4}>
          <ReportSectionCard
            title="Donor Activity"
            subtitle="Current registration status breakdown"
            loading={loading.donor}
          >
            {[
              { label: 'Active',      key: 'ACTIVE',      color: 'var(--success)' },
              { label: 'Deferred',    key: 'DEFERRED',    color: 'var(--warning)' },
              { label: 'Inactive',    key: 'INACTIVE',    color: 'var(--text-muted)' },
              { label: 'Blacklisted', key: 'BLACKLISTED', color: 'var(--danger)' },
              { label: 'Total',       key: 'TOTAL',       color: 'var(--info)' },
            ].map(({ label, key, color }, i, arr) => (
              <ReportMetricRow key={key} label={label} value={donorActivity?.[key] ?? 0}
                color={color} last={i === arr.length - 1} />
            ))}
          </ReportSectionCard>
        </Col>
        <Col md={4}>
          <ReportSectionCard
            title="Deferral Trends"
            subtitle="Active deferral breakdown"
            loading={loading.defer}
          >
            <ReportMetricRow label="Active Deferrals" value={deferrals?.activeDeferrals ?? 0} color="var(--crimson)" />
            <div style={{ margin: '12px 0' }}>
              <ProgressRow label="Temporary" value={Number(deferrals?.temporary ?? 0)}
                total={deferTotal} color="var(--warning)" />
              <ProgressRow label="Permanent" value={Number(deferrals?.permanent ?? 0)}
                total={deferTotal} color="var(--danger)" />
            </div>
          </ReportSectionCard>
        </Col>
        <Col md={4}>
          <ReportSectionCard
            title="Component Wastage"
            subtitle="Expired and disposed units"
            loading={loading.waste}
          >
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              {[
                ['Expired',     componentWastage?.expired,     '#E74C3C'],
                ['Disposed',    componentWastage?.disposed,    '#F39C12'],
                ['Quarantined', componentWastage?.quarantined, '#9B59B6'],
              ].map(([label, val, color]) => (
                <div key={label} style={{
                  flex: 1, textAlign: 'center', padding: '12px 8px',
                  background: `${color}0D`, borderRadius: 10,
                  border: `1px solid ${color}22`,
                }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                    {val ?? 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <ReportMetricRow label="Total Wastage" last
              value={Number(componentWastage?.expired || 0) + Number(componentWastage?.disposed || 0) + Number(componentWastage?.quarantined || 0)}
              color="var(--danger)" />
          </ReportSectionCard>
        </Col>
      </Row>

      {/* ── Row 3: Reactive + TAT + Expiry ── */}
      <Row className="g-3 mb-3">
        <Col md={5}>
          <ReportSectionCard
            title="Reactive Test Results"
            subtitle="Count by test type"
            loading={loading.react}
          >
            <BarChart data={reactBars} height={110} />
            <div style={{ marginTop: 8 }}>
              {Object.entries(reactiveCount || {}).map(([k, v], i, arr) => (
                <ReportMetricRow key={k} label={k} value={Number(v)}
                  color={Number(v) > 0 ? 'var(--danger)' : 'var(--text-muted)'}
                  last={i === arr.length - 1} />
              ))}
            </div>
          </ReportSectionCard>
        </Col>
        <Col md={3}>
          <ReportSectionCard
            title="TAT Overview"
            subtitle="Collection to release"
            loading={loading.tat}
          >
            <ReportMetricRow label="Total Donations" value={tat?.totalDonations} color="var(--info)" />
            <ReportMetricRow label="Pending Tests"   value={tat?.pendingTests}   color="var(--warning)" />
            <ReportMetricRow label="Reactive Tests"  value={tat?.reactiveTests}  color="var(--danger)" last />
            <div className="alert-glass warning" style={{ fontSize: '0.75rem', marginTop: 12, marginBottom: 0 }}>
              {tat?.note || 'TAT tracking in Phase 2'}
            </div>
          </ReportSectionCard>
        </Col>
        <Col md={4}>
          <ReportSectionCard
            title="Expiry Risk"
            subtitle="Components expiring within 7 days"
            loading={loading.exp}
          >
            {Array.isArray(expiryRisk) && expiryRisk.length > 0 ? (
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                <table className="table-glass w-100">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Blood</th>
                      <th>Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiryRisk.map((c, i) => (
                      <tr key={i}>
                        <td style={{ fontSize: '0.78rem' }}>{c.componentType || '—'}</td>
                        <td>
                          {c.bloodGroup && (
                            <span className="status-badge warning" style={{ fontSize: '0.68rem' }}>
                              {c.bloodGroup}{c.rhFactor === 'POSITIVE' ? '+' : c.rhFactor === 'NEGATIVE' ? '−' : ''}
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--warning)', fontWeight: 600 }}>
                          {c.expiryDate
                            ? new Date(c.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert-glass success" style={{ marginBottom: 0, textAlign: 'center' }}>
                ✓ No components expiring in the next 7 days
              </div>
            )}
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '8px 0 0', textAlign: 'right' }}>
              {Array.isArray(expiryRisk) ? `${expiryRisk.length} component(s) at risk` : ''}
            </p>
          </ReportSectionCard>
        </Col>
      </Row>

      {/* ── Row 4: Adverse Reactions + Download Panel ── */}
      <Row className="g-3 mb-3">
        <Col md={6}>
          <ReportSectionCard
            title="Adverse Reactions"
            subtitle="Safety event summary"
            loading={loading.rxn}
          >
            <ReportMetricRow label="Total Reactions" value={adverseReactions?.total ?? 0} color="var(--crimson)" />
            {rxnBySev.length > 0 && (
              <>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: '12px 0 6px' }}>
                  By Severity
                </p>
                <BarChart data={rxnBySev} height={80} />
              </>
            )}
            {adverseReactions?.byStatus && Object.keys(adverseReactions.byStatus).length > 0 && (
              <>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: '10px 0 4px' }}>
                  By Status
                </p>
                {Object.entries(adverseReactions.byStatus).map(([k, v], i, arr) => (
                  <ReportMetricRow key={k} label={k.replace(/_/g, ' ')} value={Number(v)}
                    last={i === arr.length - 1} />
                ))}
              </>
            )}
          </ReportSectionCard>
        </Col>
        <Col md={6}>
          <ReportSectionCard title="Download Reports" subtitle="Export to CSV or Excel">
            <div>
              {[
                ['inventory-snapshot', 'Inventory Snapshot'],
                ['donor-activity',     'Donor Activity'],
                ['component-wastage',  'Component Wastage'],
                ['utilization',        'Blood Utilization'],
                ['deferrals',          'Deferral Trends'],
                ['reactive-count',     'Reactive Test Counts'],
                ['expiry-risk',        'Expiry Risk (7 days)'],
              ].map(([type, label], i, arr) => (
                <div key={type} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none',
                }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</span>
                  <button className="btn-glass" style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                    onClick={() => onRefreshSection?.('download', type)}>
                    ↓ CSV
                  </button>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Full Report</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-glass" style={{ fontSize: '0.75rem', padding: '4px 12px', }}
                    onClick={() => onRefreshSection?.('download', 'full-report')}>
                    ↓ CSV
                  </button>
                  <button className="btn-crimson" style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                    onClick={() => onRefreshSection?.('downloadExcel')}>
                    ↓ Excel
                  </button>
                </div>
              </div>
            </div>
          </ReportSectionCard>
        </Col>
      </Row>
    </div>
  );
}
