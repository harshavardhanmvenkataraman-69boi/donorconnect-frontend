import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axiosInstance'
import StockOverview from '../../components/service/inventory/StockOverview'
import ComponentDetailDrawer from '../../components/service/inventory/ComponentDetailDrawer'

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
  const [inventory, setInventory] = useState([])
  const [summary, setSummary] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [bgFilter, setBgFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Drawer state
  const [drawerComponentId, setDrawerComponentId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.allSettled([
      api.get('/api/inventory'),
      api.get('/api/inventory/summary'),
      api.get('/api/inventory/low-stock'),
    ])
      .then(([invRes, sumRes, lsRes]) => {
        const unwrap = (res) => {
          if (res.status !== 'fulfilled') return []
          const d = res.value?.data?.data ?? res.value?.data ?? []
          return Array.isArray(d) ? d : []
        }
        setInventory(unwrap(invRes))
        setSummary(unwrap(sumRes))
        setLowStock(unwrap(lsRes))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <>
      <StockOverview
        inventory={inventory}
        summary={summary}
        lowStock={lowStock}
        loading={loading}
        bgFilter={bgFilter}
        typeFilter={typeFilter}
        onBgFilterChange={setBgFilter}
        onTypeFilterChange={setTypeFilter}
        onClearFilters={() => { setBgFilter(''); setTypeFilter('') }}
        onView={(row) => setDrawerComponentId(row.componentId)}
      />
      <ComponentDetailDrawer
        componentId={drawerComponentId}
        show={drawerComponentId !== null}
        onClose={() => setDrawerComponentId(null)}
      />
    </>
  )
}
