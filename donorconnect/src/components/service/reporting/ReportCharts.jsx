// Pure SVG charts — crisp, visible, matching project light theme
// Uses project CSS variables: --crimson, --text-primary, --text-muted, --glass-border

export function BarChart({ data = [], height = 120, label }) {
  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
        No data available
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.value), 1);
  const W = 320;
  const H = height;
  const PAD = 10;
  const LABEL_H = 22;
  const slot = (W - PAD * 2) / data.length;
  const bw = Math.max(14, slot - 8);

  return (
    <div>
      {label && (
        <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 }}>
          {label}
        </p>
      )}
      <svg viewBox={`0 0 ${W} ${H + LABEL_H}`} style={{ width: '100%', height: H + LABEL_H, display: 'block' }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((frac) => {
          const y = H - frac * H;
          return (
            <line key={frac} x1={PAD} y1={y} x2={W - PAD} y2={y}
              stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="3 3" />
          );
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const bh = Math.max(3, (d.value / max) * H);
          const x = PAD + i * slot + (slot - bw) / 2;
          const y = H - bh;
          return (
            <g key={i}>
              {/* Bar shadow */}
              <rect x={x + 2} y={y + 2} width={bw} height={bh} rx={4}
                fill="rgba(193,18,31,0.08)" />
              {/* Bar */}
              <rect x={x} y={y} width={bw} height={bh} rx={4}
                fill={d.color || 'url(#barGrad)'} />
              {/* Value label on bar */}
              {d.value > 0 && (
                <text x={x + bw / 2} y={y - 4} textAnchor="middle"
                  fontSize="9" fontWeight="600" fill="var(--crimson)" fontFamily="Sora, sans-serif">
                  {d.value}
                </text>
              )}
              {/* Bottom label */}
              <text x={x + bw / 2} y={H + LABEL_H - 4} textAnchor="middle"
                fontSize="9" fill="var(--text-muted)" fontFamily="DM Sans, sans-serif">
                {d.label}
              </text>
            </g>
          );
        })}
        {/* Gradient def */}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(193,18,31,0.85)" />
            <stop offset="100%" stopColor="rgba(139,0,0,0.65)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function DonutChart({ segments = [], size = 110, centerLabel }) {
  const r = 38;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, d) => s + Number(d.value), 0) || 1;
  let offset = 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, display: 'block', flexShrink: 0 }}>
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="rgba(193,18,31,0.08)" strokeWidth="14" />
      {segments.map((seg, i) => {
        const val = Number(seg.value) || 0;
        const dash = (val / total) * circ;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="round"
          />
        );
        offset += dash;
        return el;
      })}
      {/* Center text */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="15" fontWeight="800"
        fill="var(--crimson-deep)" fontFamily="Sora, sans-serif">
        {centerLabel ?? total}
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle" fontSize="8" fontWeight="500"
        fill="var(--text-muted)" fontFamily="DM Sans, sans-serif">
        total
      </text>
    </svg>
  );
}

// Horizontal progress bar row — used for breakdowns
export function ProgressRow({ label, value, total, color = 'var(--crimson)' }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
          {value ?? 0}
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: 'rgba(193,18,31,0.08)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4,
          width: `${pct}%`,
          background: color,
          transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}
