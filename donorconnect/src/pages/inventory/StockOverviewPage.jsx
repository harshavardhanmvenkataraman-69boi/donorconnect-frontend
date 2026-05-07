import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import LoadingSpinner from '../../components/shared/ui/LoadingSpinner';
import EmptyState from '../../components/shared/ui/EmptyState';

const PER_PAGE = 15;

/* ── Blood group circle badge ─────────────────────────────────────── */
const BG_COLORS = {
  'A+':'#E8622A','A-':'#C44A18',
  'B+':'#E67E22','B-':'#CA6A12',
  'AB+':'#9B2335','AB-':'#6B0F1A',
  'O+':'#C1121F','O-':'#8B0000',
};

function BloodBadge({ bloodGroup, rhFactor }) {
  const symbol = rhFactor === 'POSITIVE' ? '+' : rhFactor === 'NEGATIVE' ? '-' : '';
  const key    = `${bloodGroup}${symbol}`;
  const color  = BG_COLORS[key] || '#C1121F';
  if (!bloodGroup) return <span style={{ color:'var(--text-muted)' }}>—</span>;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      width:42, height:42, borderRadius:'50%',
      background:`linear-gradient(135deg,${color},${color}bb)`,
      color:'white', fontFamily:'Sora,sans-serif', fontWeight:800,
      fontSize: key.length > 2 ? '0.68rem' : '0.8rem',
      boxShadow:`0 3px 12px ${color}45`, flexShrink:0,
    }}>{key}</span>
  );
}

/* ── Component type pill ──────────────────────────────────────────── */
const TYPE_META = {
  PRBC:       { color:'#C1121F', bg:'rgba(193,18,31,0.10)',  icon:'🩸', label:'PRBC' },
  PLASMA:     { color:'#E67E22', bg:'rgba(230,126,34,0.10)', icon:'🧪', label:'Plasma' },
  PLATELETS:  { color:'#3498DB', bg:'rgba(52,152,219,0.10)', icon:'🔬', label:'Platelets' },
  CRYO:       { color:'#9B59B6', bg:'rgba(155,89,182,0.10)', icon:'❄️', label:'Cryo' },
  WHOLE_BLOOD:{ color:'#8B0000', bg:'rgba(139,0,0,0.10)',    icon:'💉', label:'Whole Blood' },
};

function TypePill({ type }) {
  const m = TYPE_META[type] || { color:'#7F8C8D', bg:'rgba(127,140,141,0.12)', icon:'📋', label: type };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'4px 10px', borderRadius:50,
      fontSize:'0.72rem', fontWeight:700,
      color:m.color, background:m.bg, whiteSpace:'nowrap',
    }}>
      <span>{m.icon}</span>{m.label}
    </span>
  );
}

/* ── Stock level bar + units ──────────────────────────────────────── */
function StockBar({ qty, threshold = 5 }) {
  const pct   = Math.min((qty / Math.max(threshold * 3, 1)) * 100, 100);
  const color = qty === 0 ? '#E74C3C' : qty <= threshold ? '#F39C12' : '#27AE60';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ flex:1, height:6, borderRadius:50, background:'rgba(0,0,0,0.06)', overflow:'hidden', minWidth:60 }}>
        <div style={{ width:`${pct}%`, height:'100%', borderRadius:50, background:color, transition:'width 0.4s ease' }} />
      </div>
      <span style={{ fontFamily:'Sora', fontWeight:700, fontSize:'0.88rem', color, minWidth:28, textAlign:'right' }}>
        {qty}
      </span>
    </div>
  );
}

/* ── Status pill ──────────────────────────────────────────────────── */
function StockStatusPill({ qty, threshold = 5 }) {
  if (qty === 0)          return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:50, fontSize:'0.72rem', fontWeight:700, color:'#E74C3C', background:'rgba(231,76,60,0.12)' }}>⛔ Out of Stock</span>;
  if (qty <= threshold)   return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:50, fontSize:'0.72rem', fontWeight:700, color:'#F39C12', background:'rgba(243,156,18,0.12)' }}>⚠️ Low Stock</span>;
  return                         <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:50, fontSize:'0.72rem', fontWeight:700, color:'#27AE60', background:'rgba(39,174,96,0.12)' }}>✅ Adequate</span>;
}

/* ── Main page ────────────────────────────────────────────────────── */
export default function StockOverviewPage() {
  const [summary,  setSummary]  = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [bgFilter, setBgFilter] = useState('ALL');
  const [typeFilter,setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.allSettled([
      api.get('/api/inventory/summary'),
      api.get('/api/inventory/low-stock'),
    ]).then(([sum, ls]) => {
      setSummary(sum.value?.data?.data || sum.value?.data || []);
      setLowStock(ls.value?.data?.data  || ls.value?.data  || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => setPage(1), [search, bgFilter, typeFilter, statusFilter]);

  const bloodGroups  = useMemo(() => ['ALL', ...new Set(summary.map(s => s.bloodGroup).filter(Boolean))], [summary]);
  const componentTypes = useMemo(() => ['ALL', ...new Set(summary.map(s => s.componentType).filter(Boolean))], [summary]);

  const totalUnits     = summary.reduce((a, s) => a + (s.availableUnits ?? s.quantity ?? 0), 0);
  const outOfStock     = summary.filter(s => (s.availableUnits ?? s.quantity ?? 0) === 0).length;
  const lowStockCount  = lowStock.length;
  const adequateCount  = summary.filter(s => (s.availableUnits ?? s.quantity ?? 0) > 5).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return summary.filter(s => {
      const qty = s.availableUnits ?? s.quantity ?? 0;
      if (bgFilter   !== 'ALL' && s.bloodGroup    !== bgFilter)   return false;
      if (typeFilter !== 'ALL' && s.componentType !== typeFilter) return false;
      if (statusFilter === 'LOW'  && qty > 5)  return false;
      if (statusFilter === 'OUT'  && qty !== 0) return false;
      if (statusFilter === 'OK'   && qty <= 5)  return false;
      if (q && ![s.bloodGroup, s.rhFactor, s.componentType]
        .some(v => String(v ?? '').toLowerCase().includes(q))) return false;
      return true;
    });
  }, [summary, search, bgFilter, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="animate-fadein">
      <PageHeader title="Blood Stock Overview" subtitle="Live inventory levels across all blood groups and components" />

      {/* ── Low stock alert banner ── */}
      {lowStockCount > 0 && (
        <div style={{
          display:'flex', alignItems:'flex-start', gap:14,
          background:'rgba(231,76,60,0.08)', border:'1.5px solid rgba(231,76,60,0.25)',
          borderRadius:14, padding:'14px 18px', marginBottom:20,
        }}>
          <span style={{ fontSize:'1.3rem', flexShrink:0 }}>🚨</span>
          <div>
            <div style={{ fontFamily:'Sora', fontWeight:700, fontSize:'0.9rem', color:'#E74C3C', marginBottom:4 }}>
              {lowStockCount} blood type{lowStockCount > 1 ? 's' : ''} critically low — immediate restocking required
            </div>
            <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', display:'flex', flexWrap:'wrap', gap:6 }}>
              {lowStock.slice(0, 8).map((l, i) => {
                const sym   = l.rhFactor === 'POSITIVE' ? '+' : '-';
                const key   = `${l.bloodGroup}${sym}`;
                const color = BG_COLORS[key] || '#C1121F';
                return (
                  <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:5, background:`${color}18`, border:`1px solid ${color}40`, borderRadius:50, padding:'3px 10px', fontWeight:600, color, fontSize:'0.75rem' }}>
                    {key} · {l.componentType}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Summary chips ── */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        {[
          { label:'Total Units',   value:totalUnits,    color:'var(--text-primary)', filter:null },
          { label:'Adequate',      value:adequateCount, color:'#27AE60',             filter:'OK' },
          { label:'Low Stock',     value:lowStockCount, color:'#F39C12',             filter:'LOW' },
          { label:'Out of Stock',  value:outOfStock,    color:'#E74C3C',             filter:'OUT' },
        ].map(s => (
          <div key={s.label}
            onClick={() => s.filter && setStatusFilter(prev => prev === s.filter ? 'ALL' : s.filter)}
            style={{
              background:'var(--glass-bg)', border:`1px solid ${statusFilter === s.filter ? s.color+'60' : 'var(--glass-border)'}`,
              borderRadius:12, padding:'10px 18px',
              boxShadow: statusFilter === s.filter ? `0 4px 16px ${s.color}20` : 'var(--glass-shadow)',
              backdropFilter:'blur(16px)', cursor: s.filter ? 'pointer' : 'default',
              transition:'all 0.2s',
            }}>
            <div style={{ fontFamily:'Sora', fontWeight:800, fontSize:'1.3rem', color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <div className="search-glass" style={{ flex:'1 1 200px', minWidth:160 }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Search blood group, component…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ flex:'0 0 150px' }} value={bgFilter} onChange={e => setBgFilter(e.target.value)}>
          {bloodGroups.map(g => <option key={g} value={g}>{g === 'ALL' ? '🩸 All Groups' : g}</option>)}
        </select>
        <select className="form-select" style={{ flex:'0 0 160px' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          {componentTypes.map(t => <option key={t} value={t}>{t === 'ALL' ? '🧪 All Types' : t}</option>)}
        </select>
        {(search || bgFilter !== 'ALL' || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <button className="btn-glass" onClick={() => { setSearch(''); setBgFilter('ALL'); setTypeFilter('ALL'); setStatusFilter('ALL'); }}>✕ Clear</button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        {loading ? <LoadingSpinner /> : paginated.length === 0 ? <EmptyState /> : (
          <div className="table-scroll">
            <table className="table-glass w-100" style={{ minWidth:680 }}>
              <thead>
                <tr>
                  {['Blood Type','Rh Factor','Component','Available Units','Stock Level','Status'].map(h => (
                    <th key={h} style={{ whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((s, i) => {
                  const qty = s.availableUnits ?? s.quantity ?? 0;
                  return (
                    <tr key={i}>
                      {/* Blood Type */}
                      <td><BloodBadge bloodGroup={s.bloodGroup} rhFactor={s.rhFactor} /></td>
                      {/* Rh Factor */}
                      <td>
                        {s.rhFactor ? (
                          <span style={{
                            display:'inline-flex', alignItems:'center', gap:4,
                            padding:'3px 10px', borderRadius:50, fontSize:'0.75rem', fontWeight:700,
                            color: s.rhFactor === 'POSITIVE' ? '#27AE60' : '#E74C3C',
                            background: s.rhFactor === 'POSITIVE' ? 'rgba(39,174,96,0.12)' : 'rgba(231,76,60,0.10)',
                          }}>
                            {s.rhFactor === 'POSITIVE' ? '＋ Positive' : '－ Negative'}
                          </span>
                        ) : <span style={{ color:'var(--text-muted)' }}>—</span>}
                      </td>
                      {/* Component */}
                      <td><TypePill type={s.componentType} /></td>
                      {/* Available Units — number */}
                      <td>
                        <span style={{ fontFamily:'Sora', fontWeight:800, fontSize:'1.1rem',
                          color: qty === 0 ? '#E74C3C' : qty <= 5 ? '#F39C12' : 'var(--text-primary)' }}>
                          {qty}
                          <span style={{ fontFamily:'inherit', fontWeight:400, fontSize:'0.72rem', color:'var(--text-muted)', marginLeft:4 }}>units</span>
                        </span>
                      </td>
                      {/* Stock bar */}
                      <td style={{ minWidth:120 }}><StockBar qty={qty} /></td>
                      {/* Status pill */}
                      <td><StockStatusPill qty={qty} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && filtered.length > PER_PAGE && (
          <div style={{
            padding:'14px 20px', borderTop:'1px solid var(--border-light)',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap',
          }}>
            <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
              Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn-glass" disabled={page===1} onClick={() => setPage(p=>p-1)}
                style={{ padding:'5px 14px', opacity:page===1?0.4:1 }}>← Prev</button>
              {Array.from({ length: Math.min(totalPages,5) }, (_,i) => {
                const n = Math.max(1, Math.min(page-2, totalPages-4)) + i;
                return <button key={n} className={n===page?'btn-crimson':'btn-glass'}
                  onClick={() => setPage(n)} style={{ padding:'5px 12px', minWidth:36 }}>{n}</button>;
              })}
              <button className="btn-glass" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}
                style={{ padding:'5px 14px', opacity:page===totalPages?0.4:1 }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
