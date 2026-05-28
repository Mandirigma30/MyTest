/**
 * ReportsPage.jsx — RespondaCare
 * Route: /admin/reports
 * Role: Admin only (ProtectedRoute allowedRoles={['admin']})
 *
 * Fig 14: Analytics & Operations Reports
 *
 * Widgets:
 *  - KPI summary bar (total dispatches, avg response time, resolved rate, active incidents)
 *  - Average response times: Dispatch → On-Scene → Hospital Handoff
 *  - Dispatch volume by incident type (horizontal bar chart)
 *  - Severity level distribution (SEV-5 → SEV-1 with pulse-red animation for critical)
 *  - Recent incidents table
 *
 * Filters: Date range selector + incident type search
 *
 * All charts are pure CSS/SVG — no external chart library required.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BarChart2, Clock, Activity, TrendingUp,
  Search, Filter, Calendar, Download, RefreshCw,
  AlertTriangle, CheckCircle2, Zap, Users,
} from 'lucide-react';
import Card from '../components/common/Card';

// ─── Severity metadata — matches CommandCenter exactly ───────────────────────
const SEVERITY_META = {
  5: { label: 'CRITICAL', color: '#e53935', bg: 'rgba(229,57,53,0.15)',   pulse: true  },
  4: { label: 'HIGH',     color: '#fb8c00', bg: 'rgba(251,140,0,0.15)',   pulse: false },
  3: { label: 'MODERATE', color: '#fdd835', bg: 'rgba(253,216,53,0.12)',  pulse: false },
  2: { label: 'LOW',      color: '#b8c4ff', bg: 'rgba(184,196,255,0.10)', pulse: false },
  1: { label: 'MINIMAL',  color: '#43a047', bg: 'rgba(67,160,71,0.12)',   pulse: false },
};

// ─── Mock dispatch records ────────────────────────────────────────────────────
const MOCK_DISPATCHES = [
  { id: 'RC-9921', date: '2026-05-28', type: 'Cardiac Arrest',       severity: 5, dispatchMin: 1.8, onSceneMin: 6.2, handoffMin: 22.5, status: 'Resolved',    unit: 'Unit 4-Alpha' },
  { id: 'RC-9920', date: '2026-05-28', type: 'Vehicular Accident',   severity: 4, dispatchMin: 2.1, onSceneMin: 8.4, handoffMin: 31.0, status: 'In Progress', unit: 'Unit 2-Bravo' },
  { id: 'RC-9919', date: '2026-05-27', type: 'Respiratory Distress', severity: 3, dispatchMin: 3.0, onSceneMin: 9.1, handoffMin: 27.3, status: 'Resolved',    unit: 'Unit 1-Delta' },
  { id: 'RC-9918', date: '2026-05-27', type: 'Cardiac Arrest',       severity: 5, dispatchMin: 1.5, onSceneMin: 5.8, handoffMin: 20.1, status: 'Resolved',    unit: 'Unit 4-Alpha' },
  { id: 'RC-9917', date: '2026-05-27', type: 'Obstetric Emergency',  severity: 4, dispatchMin: 2.5, onSceneMin: 7.0, handoffMin: 25.4, status: 'Resolved',    unit: 'Unit 3-Charlie' },
  { id: 'RC-9916', date: '2026-05-27', type: 'Minor Laceration',     severity: 2, dispatchMin: 4.2, onSceneMin: 11.3,handoffMin: 0,    status: 'On-Scene',    unit: 'Unit 1-Delta' },
  { id: 'RC-9915', date: '2026-05-26', type: 'Hypoglycemic Episode', severity: 3, dispatchMin: 3.5, onSceneMin: 9.8, handoffMin: 18.7, status: 'Resolved',    unit: 'Unit 2-Bravo' },
  { id: 'RC-9914', date: '2026-05-26', type: 'Allergic Reaction',    severity: 2, dispatchMin: 2.9, onSceneMin: 8.0, handoffMin: 16.2, status: 'Resolved',    unit: 'Unit 3-Charlie' },
  { id: 'RC-9913', date: '2026-05-26', type: 'Trauma / Fall',        severity: 3, dispatchMin: 3.1, onSceneMin: 7.5, handoffMin: 22.0, status: 'Resolved',    unit: 'Unit 4-Alpha' },
  { id: 'RC-9912', date: '2026-05-25', type: 'Cardiac Arrest',       severity: 5, dispatchMin: 1.6, onSceneMin: 5.5, handoffMin: 19.8, status: 'Resolved',    unit: 'Unit 4-Alpha' },
  { id: 'RC-9911', date: '2026-05-25', type: 'Poisoning',            severity: 4, dispatchMin: 2.3, onSceneMin: 7.8, handoffMin: 24.6, status: 'Resolved',    unit: 'Unit 2-Bravo' },
  { id: 'RC-9910', date: '2026-05-25', type: 'Respiratory Distress', severity: 4, dispatchMin: 2.7, onSceneMin: 8.9, handoffMin: 28.2, status: 'Resolved',    unit: 'Unit 1-Delta' },
  { id: 'RC-9909', date: '2026-05-24', type: 'Obstetric Emergency',  severity: 5, dispatchMin: 1.9, onSceneMin: 6.1, handoffMin: 21.5, status: 'Resolved',    unit: 'Unit 3-Charlie' },
  { id: 'RC-9908', date: '2026-05-24', type: 'Minor Laceration',     severity: 1, dispatchMin: 5.0, onSceneMin: 12.0,handoffMin: 0,    status: 'Resolved',    unit: 'Unit 1-Delta' },
  { id: 'RC-9907', date: '2026-05-24', type: 'Hypoglycemic Episode', severity: 2, dispatchMin: 3.8, onSceneMin: 10.2,handoffMin: 15.0, status: 'Resolved',    unit: 'Unit 2-Bravo' },
  { id: 'RC-9906', date: '2026-05-23', type: 'Trauma / Fall',        severity: 3, dispatchMin: 2.8, onSceneMin: 8.3, handoffMin: 19.5, status: 'Resolved',    unit: 'Unit 4-Alpha' },
  { id: 'RC-9905', date: '2026-05-23', type: 'Vehicular Accident',   severity: 5, dispatchMin: 1.7, onSceneMin: 5.9, handoffMin: 30.5, status: 'Resolved',    unit: 'Unit 2-Bravo' },
  { id: 'RC-9904', date: '2026-05-23', type: 'Allergic Reaction',    severity: 1, dispatchMin: 4.5, onSceneMin: 11.0,handoffMin: 14.8, status: 'Resolved',    unit: 'Unit 3-Charlie' },
];

const DATE_RANGES = [
  { id: '7d',  label: 'Last 7 Days'  },
  { id: '14d', label: 'Last 14 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'all', label: 'All Time'     },
];

// ─── Helper: mean of array ───────────────────────────────────────────────────
const mean = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const fmt  = n => n.toFixed(1);

// ─── Glassmorphic KPI widget ─────────────────────────────────────────────────
function KpiWidget({ icon: Icon, iconColor, label, value, unit, sub, glowColor }) {
  return (
    <div
      className="relative rounded-xl border bg-[#171717]/60 backdrop-blur-sm p-4 flex flex-col gap-1 overflow-hidden"
      style={{ borderColor: `${glowColor}30`, boxShadow: `0 0 20px ${glowColor}15` }}
    >
      {/* Background glow blob */}
      <div
        className="absolute -top-4 -right-4 h-16 w-16 rounded-full blur-xl opacity-30 pointer-events-none"
        style={{ background: glowColor }}
      />
      <div className="flex items-center gap-2 mb-1">
        <div
          className="h-7 w-7 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: `${glowColor}20`, border: `1px solid ${glowColor}40` }}
        >
          <Icon size={14} style={{ color: glowColor }} />
        </div>
        <span className="text-[10px] font-mono text-[#8e909f] uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-bold" style={{ color: iconColor || glowColor }}>{value}</span>
        {unit && <span className="text-xs font-mono text-[#444653] mb-0.5">{unit}</span>}
      </div>
      {sub && <p className="text-[10px] text-[#444653] font-mono mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Response time bar (3-phase) ─────────────────────────────────────────────
function ResponseTimeBars({ dispatches }) {
  const avgDispatch = mean(dispatches.map(d => d.dispatchMin));
  const avgOnScene  = mean(dispatches.map(d => d.onSceneMin));
  const avgHandoff  = mean(dispatches.filter(d => d.handoffMin > 0).map(d => d.handoffMin));
  const maxVal      = Math.max(avgDispatch, avgOnScene, avgHandoff, 1);

  const phases = [
    { label: 'Dispatch to Unit',   value: avgDispatch, color: '#1e3fae', glow: 'rgba(30,63,174,0.4)',   sub: 'Call received → Unit en route' },
    { label: 'Unit to On-Scene',   value: avgOnScene,  color: '#fb8c00', glow: 'rgba(251,140,0,0.4)',   sub: 'Departure → Patient contact'   },
    { label: 'Scene to Handoff',   value: avgHandoff,  color: '#43a047', glow: 'rgba(67,160,71,0.4)',   sub: 'On-scene → Hospital transfer'  },
  ];

  return (
    <div className="space-y-4">
      {phases.map(({ label, value, color, glow, sub }) => (
        <div key={label}>
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <p className="text-xs font-semibold text-[#e5e2e1]">{label}</p>
              <p className="text-[10px] font-mono text-[#444653]">{sub}</p>
            </div>
            <span className="text-base font-bold font-mono" style={{ color }}>
              {fmt(value)} <span className="text-xs text-[#444653]">min</span>
            </span>
          </div>
          <div className="h-2.5 bg-[#111111] rounded-full overflow-hidden border border-white/[0.05]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(value / maxVal) * 100}%`,
                background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                boxShadow: `0 0 8px ${glow}`,
              }}
            />
          </div>
        </div>
      ))}
      <p className="text-[9px] font-mono text-[#444653] text-right pt-1">
        Avg across {dispatches.length} dispatch{dispatches.length !== 1 ? 'es' : ''}
      </p>
    </div>
  );
}

// ─── Dispatch volume by type (horizontal bars) ───────────────────────────────
function VolumeByType({ dispatches }) {
  const counts = {};
  dispatches.forEach(d => { counts[d.type] = (counts[d.type] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const maxCount = sorted[0]?.[1] || 1;

  // Colour cycle
  const palette = [
    '#e53935', '#fb8c00', '#fdd835', '#b8c4ff',
    '#43a047', '#44e2cd', '#ab47bc', '#ef5350',
  ];

  return (
    <div className="space-y-3">
      {sorted.map(([type, count], i) => (
        <div key={type}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#c5c5d5]">{type}</span>
            <span className="text-xs font-mono font-bold" style={{ color: palette[i % palette.length] }}>
              {count}
            </span>
          </div>
          <div className="h-2 bg-[#111111] rounded-full overflow-hidden border border-white/[0.05]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(count / maxCount) * 100}%`,
                background: palette[i % palette.length],
                boxShadow: `0 0 6px ${palette[i % palette.length]}80`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Severity distribution donut (pure CSS with labels) ──────────────────────
function SeverityDistribution({ dispatches }) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  dispatches.forEach(d => { counts[d.severity] = (counts[d.severity] || 0) + 1; });
  const total = dispatches.length || 1;

  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map(sev => {
        const meta  = SEVERITY_META[sev];
        const count = counts[sev] || 0;
        const pct   = ((count / total) * 100).toFixed(0);

        return (
          <div key={sev} className="flex items-center gap-3">
            {/* Severity badge */}
            <span
              className="flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border w-20 justify-center"
              style={{ color: meta.color, background: meta.bg, borderColor: `${meta.color}40` }}
            >
              {meta.pulse && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: meta.color }} />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                </span>
              )}
              SEV-{sev}
            </span>

            {/* Bar */}
            <div className="flex-1 h-2.5 bg-[#111111] rounded-full overflow-hidden border border-white/[0.05]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: meta.color,
                  boxShadow: `0 0 8px ${meta.color}60`,
                }}
              />
            </div>

            {/* Stats */}
            <div className="flex-shrink-0 text-right w-16">
              <span className="text-xs font-mono font-bold" style={{ color: meta.color }}>{count}</span>
              <span className="text-[9px] font-mono text-[#444653] ml-1">{pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Status chip (matches CommandCenter) ─────────────────────────────────────
function StatusChip({ status }) {
  const map = {
    'Resolved':    'text-emerald-400 border-emerald-500/30 bg-emerald-900/10',
    'In Progress': 'text-amber-400 border-amber-500/30 bg-amber-900/10',
    'On-Scene':    'text-cyan-400 border-cyan-500/30 bg-cyan-900/10',
    'Pending':     'text-[#fdd835] border-[#fdd835]/40',
  };
  return (
    <span className={`text-[9px] font-mono tracking-widest border rounded px-1.5 py-0.5 ${map[status] || 'text-[#8e909f] border-[#444653]'}`}>
      {status}
    </span>
  );
}

// ─── Trend sparkline (mini SVG) ───────────────────────────────────────────────
function Sparkline({ data, color }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80, h = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const navigate  = useNavigate();
  const [dateRange, setDateRange] = useState('7d');
  const [typeSearch, setTypeSearch] = useState('');
  const [sevFilter, setSevFilter]   = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter dispatches by date range
  const now = new Date('2026-05-28');
  const cutoffs = { '7d': 7, '14d': 14, '30d': 30, 'all': 9999 };
  const cutoff  = cutoffs[dateRange];

  const filtered = useMemo(() => {
    return MOCK_DISPATCHES.filter(d => {
      const daysAgo = (now - new Date(d.date)) / 86400000;
      const inRange = daysAgo <= cutoff;
      const matchType = typeSearch === '' || d.type.toLowerCase().includes(typeSearch.toLowerCase());
      const matchSev  = sevFilter === '' || String(d.severity) === sevFilter;
      return inRange && matchType && matchSev;
    });
  }, [dateRange, typeSearch, sevFilter, refreshKey]);

  // ── Derived KPIs ─────────────────────────────────────────────────────────
  const totalDispatches  = filtered.length;
  const resolvedCount    = filtered.filter(d => d.status === 'Resolved').length;
  const resolvedRate     = totalDispatches ? Math.round((resolvedCount / totalDispatches) * 100) : 0;
  const avgTotalTime     = mean(filtered.filter(d => d.handoffMin > 0).map(d => d.dispatchMin + d.onSceneMin + d.handoffMin));
  const activeCount      = filtered.filter(d => d.status !== 'Resolved').length;
  const criticalCount    = filtered.filter(d => d.severity === 5).length;

  // Daily volume for sparkline (last 7 data points)
  const dailyVol = ['2026-05-22','2026-05-23','2026-05-24','2026-05-25','2026-05-26','2026-05-27','2026-05-28']
    .map(date => MOCK_DISPATCHES.filter(d => d.date === date).length);

  const NAV_ITEMS = [
    { icon: '⊞', label: 'Dashboard',    path: '/admin/dashboard'  },
    { icon: '👥', label: 'Residents',    path: '/admin/residents'  },
    { icon: '🗺️', label: 'Dispatch Map', path: '/admin/map'        },
    { icon: '📊', label: 'Reports',      path: '/admin/reports'    },
    { icon: '📋', label: 'Audit Logs',   path: '/admin/audit-logs' },
    { icon: '⚙',  label: 'Settings',    path: '/admin/settings'   },
  ];

  return (
    <div className="flex h-screen bg-[#131313] text-[#e5e2e1] font-['Hanken_Grotesk',sans-serif] overflow-hidden">

      {/* ── Sidebar (matches CommandCenter) ── */}
      <aside className="w-56 flex-shrink-0 bg-[#0e0e0e] border-r border-white/[0.07] flex flex-col">
        <div className="px-5 py-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <span className="text-[#1e3fae] text-xl">🚑</span>
            <span className="font-bold text-sm tracking-wide text-[#e5e2e1]">RespondaCare</span>
          </div>
          <p className="text-[10px] text-[#444653] font-mono mt-0.5 tracking-widest">DISPATCH HQ</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ icon, label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all ${
                label === 'Reports'
                  ? 'bg-[#1e3fae]/20 text-[#b8c4ff] border border-[#1e3fae]/40'
                  : 'text-[#8e909f] hover:bg-white/5 hover:text-[#e5e2e1]'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/[0.07]">
          <div className="text-[10px] font-mono text-[#444653] tracking-widest">OPERATOR</div>
          <div className="text-sm text-[#e5e2e1] mt-0.5">
            {(() => { try { return JSON.parse(localStorage.getItem('respondaCare_session'))?.name || 'Admin'; } catch { return 'Admin'; } })()}
          </div>
          <button
            onClick={() => { localStorage.removeItem('respondaCare_session'); navigate('/login'); }}
            className="mt-2 text-[10px] font-mono text-[#444653] hover:text-red-400 transition-colors"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] bg-[#0e0e0e]/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/dashboard')} className="text-[#8e909f] hover:text-[#e5e2e1] transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 size={18} className="text-[#b8c4ff]" />
                <h1 className="text-lg font-bold text-[#e5e2e1]">Analytics & Operations Reports</h1>
              </div>
              <p className="text-xs text-[#8e909f] font-mono mt-0.5">
                {totalDispatches} dispatch record{totalDispatches !== 1 ? 's' : ''} · {DATE_RANGES.find(r => r.id === dateRange)?.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
            </div>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="text-[#8e909f] hover:text-[#e5e2e1] transition-colors p-1.5 border border-[#444653] hover:border-[#8e909f] rounded"
              title="Refresh data"
            >
              <RefreshCw size={13} />
            </button>
            <button
              className="flex items-center gap-1.5 text-xs font-mono text-[#8e909f] hover:text-[#b8c4ff] border border-[#444653] hover:border-[#1e3fae]/60 px-3 py-1.5 rounded transition-colors"
            >
              <Download size={13} />
              Export
            </button>
          </div>
        </header>

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-white/[0.07] bg-[#131313] flex-shrink-0 flex-wrap">

          {/* Date range pill selector */}
          <div className="flex gap-1 bg-[#0e0e0e] border border-white/[0.07] rounded-lg p-1">
            {DATE_RANGES.map(({ id, label }) => (
              <button
                key={id}
                id={`date-range-${id}`}
                onClick={() => setDateRange(id)}
                className={`text-[10px] font-mono px-3 py-1.5 rounded transition-all ${
                  dateRange === id
                    ? 'bg-[#1e3fae] text-white shadow-[0_0_8px_rgba(30,63,174,0.4)]'
                    : 'text-[#8e909f] hover:text-[#e5e2e1]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Incident type search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444653]" />
            <input
              id="reports-type-search"
              type="text"
              value={typeSearch}
              onChange={e => setTypeSearch(e.target.value)}
              placeholder="Filter by incident type…"
              className="bg-[#171717] border border-[#444653] focus:border-[#1e3fae] rounded pl-8 pr-3 py-1.5 text-xs text-[#e5e2e1] placeholder-[#444653] outline-none w-52 transition-colors"
            />
          </div>

          {/* Severity filter */}
          <div className="relative">
            <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444653]" />
            <select
              id="reports-sev-filter"
              value={sevFilter}
              onChange={e => setSevFilter(e.target.value)}
              className="bg-[#171717] border border-[#444653] rounded pl-8 pr-3 py-1.5 text-xs text-[#e5e2e1] outline-none appearance-none"
            >
              <option value="">All Severities</option>
              {[5,4,3,2,1].map(s => (
                <option key={s} value={String(s)}>SEV-{s} — {SEVERITY_META[s].label}</option>
              ))}
            </select>
          </div>

          {(typeSearch || sevFilter) && (
            <button
              className="text-[10px] font-mono text-[#8e909f] hover:text-[#e5e2e1]"
              onClick={() => { setTypeSearch(''); setSevFilter(''); }}
            >
              Clear filters
            </button>
          )}

          {/* Daily volume sparkline */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[9px] font-mono text-[#444653]">7-DAY TREND</span>
            <Sparkline data={dailyVol} color="#1e3fae" />
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── KPI Summary Bar ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiWidget
              icon={Zap}
              label="Total Dispatches"
              value={totalDispatches}
              sub={`${dateRange === 'all' ? 'All time' : DATE_RANGES.find(r => r.id === dateRange)?.label}`}
              glowColor="#1e3fae"
            />
            <KpiWidget
              icon={Clock}
              label="Avg Total Response"
              value={avgTotalTime > 0 ? fmt(avgTotalTime) : '—'}
              unit="min"
              sub="Dispatch + On-Scene + Handoff"
              glowColor="#fb8c00"
            />
            <KpiWidget
              icon={CheckCircle2}
              label="Resolution Rate"
              value={`${resolvedRate}%`}
              sub={`${resolvedCount} of ${totalDispatches} resolved`}
              glowColor="#43a047"
            />
            <KpiWidget
              icon={AlertTriangle}
              label="Critical (SEV-5)"
              value={criticalCount}
              sub={`${activeCount} still active`}
              glowColor="#e53935"
            />
          </div>

          {/* ── Row 2: Response Times + Severity Distribution ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Response Times */}
            <Card variant="default" className="space-y-4">
              <Card.Header className="border-b border-white/[0.05] pb-3">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#b8c4ff]" />
                  <div>
                    <p className="text-sm font-bold text-[#e5e2e1]">Average Response Times</p>
                    <p className="text-[10px] font-mono text-[#444653]">Dispatch → On-Scene → Hospital Handoff</p>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                {filtered.length > 0
                  ? <ResponseTimeBars dispatches={filtered} />
                  : <p className="text-xs text-[#444653] font-mono text-center py-6">No data for selected range</p>
                }
              </Card.Body>
            </Card>

            {/* Severity Distribution */}
            <Card variant="default" className="space-y-4">
              <Card.Header className="border-b border-white/[0.05] pb-3">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-[#b8c4ff]" />
                  <div>
                    <p className="text-sm font-bold text-[#e5e2e1]">Severity Level Distribution</p>
                    <p className="text-[10px] font-mono text-[#444653]">SEV-5 Critical → SEV-1 Minimal</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#444653]">n = {filtered.length}</span>
              </Card.Header>
              <Card.Body>
                {filtered.length > 0
                  ? <SeverityDistribution dispatches={filtered} />
                  : <p className="text-xs text-[#444653] font-mono text-center py-6">No data for selected range</p>
                }
              </Card.Body>
            </Card>

          </div>

          {/* ── Row 3: Volume by Incident Type ── */}
          <Card variant="default" className="space-y-4">
            <Card.Header className="border-b border-white/[0.05] pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-[#b8c4ff]" />
                <div>
                  <p className="text-sm font-bold text-[#e5e2e1]">Dispatch Volume by Incident Type</p>
                  <p className="text-[10px] font-mono text-[#444653]">Categorized call frequency within selected range</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#444653]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1e3fae]" />
                <span>{[...new Set(filtered.map(d => d.type))].length} types</span>
              </div>
            </Card.Header>
            <Card.Body>
              {filtered.length > 0
                ? <VolumeByType dispatches={filtered} />
                : <p className="text-xs text-[#444653] font-mono text-center py-6">No data for selected range</p>
              }
            </Card.Body>
          </Card>

          {/* ── Row 4: Incident Log Table ── */}
          <Card variant="default" padding={false}>
            <div className="p-4 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-[#b8c4ff]" />
                <div>
                  <p className="text-sm font-bold text-[#e5e2e1]">Dispatch Log</p>
                  <p className="text-[10px] font-mono text-[#444653]">Detailed incident records for selected range</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#444653] border border-white/[0.07] px-2 py-0.5 rounded">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05] text-[9px] font-mono text-[#444653] uppercase tracking-widest">
                    <th className="text-left px-4 py-3">Incident ID</th>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Type</th>
                    <th className="text-left px-4 py-3">Severity</th>
                    <th className="text-right px-4 py-3">Dispatch</th>
                    <th className="text-right px-4 py-3">On-Scene</th>
                    <th className="text-right px-4 py-3">Handoff</th>
                    <th className="text-left px-4 py-3">Unit</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-[#444653] text-xs font-mono">
                        No records match the selected filters
                      </td>
                    </tr>
                  ) : (
                    filtered.map(d => {
                      const meta = SEVERITY_META[d.severity];
                      return (
                        <tr key={d.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-[#b8c4ff]">{d.id}</span>
                          </td>
                          <td className="px-4 py-3 text-[10px] font-mono text-[#8e909f]">{d.date}</td>
                          <td className="px-4 py-3 text-xs text-[#c5c5d5]">{d.type}</td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
                              style={{ color: meta.color, background: meta.bg, borderColor: `${meta.color}40` }}
                            >
                              {meta.pulse && (
                                <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: meta.color }} />
                                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                                </span>
                              )}
                              SEV-{d.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-[10px] font-mono text-[#1e3fae] font-bold">
                            {fmt(d.dispatchMin)}m
                          </td>
                          <td className="px-4 py-3 text-right text-[10px] font-mono text-amber-400 font-bold">
                            {fmt(d.onSceneMin)}m
                          </td>
                          <td className="px-4 py-3 text-right text-[10px] font-mono text-emerald-400 font-bold">
                            {d.handoffMin > 0 ? `${fmt(d.handoffMin)}m` : '—'}
                          </td>
                          <td className="px-4 py-3 text-[10px] text-[#8e909f] font-mono">{d.unit}</td>
                          <td className="px-4 py-3">
                            <StatusChip status={d.status} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* RA 10173 footer */}
          <p className="text-[9px] font-mono text-[#444653] text-center pb-4 leading-relaxed">
            RespondaCare Analytics Engine · RA 10173 Compliant · Data access is audit-logged · Barangay 45 Command Jurisdiction
          </p>

        </div>
      </main>
    </div>
  );
}
