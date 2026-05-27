import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Card from '../common/Card';
import AuthKeyModal from './AuthKeyModal';

const SEVERITY_META = {
  5: { label: 'CRITICAL', color: '#e53935', bg: 'rgba(229,57,53,0.15)', pulse: true },
  4: { label: 'HIGH',     color: '#fb8c00', bg: 'rgba(251,140,0,0.15)',  pulse: false },
  3: { label: 'MODERATE', color: '#fdd835', bg: 'rgba(253,216,53,0.12)', pulse: false },
  2: { label: 'LOW',      color: '#b8c4ff', bg: 'rgba(184,196,255,0.10)',pulse: false },
  1: { label: 'MINIMAL',  color: '#43a047', bg: 'rgba(67,160,71,0.12)',  pulse: false },
};

const MOCK_EMERGENCIES = [
  { id: 'RC-9921', location: '123 Rizal Ave, Brgy. Sto. Niño', type: 'Cardiac Arrest',       severity: 5, responder: 'Unit 4-Alpha', elapsed: '00:04:12', status: 'DISPATCHED' },
  { id: 'RC-8812', location: 'Taft Ave cor. Pedro Gil',        type: 'Vehicular Accident',    severity: 4, responder: 'Unit 2-Bravo', elapsed: '00:09:45', status: 'IN ROUTE'  },
  { id: 'RC-7705', location: 'Zone 4, Purok 3',                type: 'Respiratory Distress',  severity: 3, responder: 'Unassigned',    elapsed: '00:02:30', status: 'PENDING'   },
  { id: 'RC-6540', location: 'Purok 1, Barangay Hall',         type: 'Minor Laceration',      severity: 2, responder: 'Unit 1-Delta', elapsed: '00:15:10', status: 'ON-SCENE'  },
  { id: 'RC-5310', location: 'Magsaysay Blvd, Block 7',        type: 'Hypoglycemic Episode',  severity: 3, responder: 'Unassigned',    elapsed: '00:06:55', status: 'PENDING'   },
  { id: 'RC-4201', location: 'Barangay Health Center',         type: 'Allergic Reaction',     severity: 2, responder: 'Unit 3-Charlie',elapsed: '00:20:00', status: 'RESOLVED'  },
];

function SeverityBadge({ score }) {
  const meta = SEVERITY_META[score];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-mono font-semibold tracking-widest"
      style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.color}40` }}
    >
      {meta.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: meta.color }} />
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: meta.color }} />
        </span>
      )}
      {score} — {meta.label}
    </span>
  );
}

function StatusChip({ status }) {
  const map = {
    DISPATCHED: 'text-[#b8c4ff] border-[#1e3fae]/60',
    'IN ROUTE':  'text-[#fb8c00] border-[#fb8c00]/50',
    PENDING:     'text-[#fdd835] border-[#fdd835]/50',
    'ON-SCENE':  'text-[#44e2cd] border-[#44e2cd]/50',
    RESOLVED:    'text-[#43a047] border-[#43a047]/50',
  };
  return (
    <span className={`text-[10px] font-mono tracking-widest border rounded px-1.5 py-0.5 ${map[status] || 'text-[#8e909f] border-[#444653]'}`}>
      {status}
    </span>
  );
}

function EmergencyCard({ incident, onDispatch, onView }) {
  const meta = SEVERITY_META[incident.severity];
  return (
    <Card severity={incident.severity} hoverable className="flex flex-col gap-3">
      <Card.Header>
        <div>
          <p className="text-xs font-mono text-[#8e909f] tracking-widest mb-0.5">PATIENT ID</p>
          <p className="text-base font-semibold text-[#e5e2e1] font-mono">{incident.id}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <SeverityBadge score={incident.severity} />
          <StatusChip status={incident.status} />
        </div>
      </Card.Header>

      <Card.Body>
        <div className="grid grid-cols-2 gap-y-2 gap-x-3">
          <div>
            <p className="text-[10px] font-mono text-[#444653] uppercase tracking-wider">Type</p>
            <p className="text-sm text-[#e5e2e1]">{incident.type}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#444653] uppercase tracking-wider">Elapsed</p>
            <p className="text-sm font-mono" style={{ color: meta.color }}>{incident.elapsed}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] font-mono text-[#444653] uppercase tracking-wider">Location</p>
            <p className="text-sm text-[#c5c5d5]">{incident.location}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] font-mono text-[#444653] uppercase tracking-wider">Responder</p>
            <p className="text-sm text-[#c5c5d5]">{incident.responder}</p>
          </div>
        </div>
      </Card.Body>

      <Card.Footer>
        <Button variant="ghost" size="sm" onClick={() => onView(incident)} id={`view-${incident.id}`}>View Details</Button>
        <Button
          variant={incident.severity >= 4 ? 'danger' : 'primary'}
          size="sm"
          onClick={() => onDispatch(incident)}
          id={`dispatch-${incident.id}`}
          disabled={incident.status === 'RESOLVED'}
        >
          Dispatch
        </Button>
      </Card.Footer>
    </Card>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-sm text-[#8e909f]">
      {time.toLocaleTimeString('en-PH', { hour12: false })}
    </span>
  );
}

export default function CommandCenter() {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [activePage, setActivePage] = useState('Command Center');

  const sessionRaw = localStorage.getItem('respondaCare_session');
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;

  const handleLogout = () => {
    localStorage.removeItem('respondaCare_session');
    navigate('/login');
  };

  const NAV_ITEMS = [
    { icon: '⊞', label: 'Dashboard',        path: '/admin/dashboard'  },
    { icon: '⚡', label: 'Command Center',    path: '/admin/dashboard'  },
    { icon: '👥', label: 'Residents',         path: '/admin/residents'  },
    { icon: '🗺️', label: 'Dispatch Map',      path: '/admin/map'        },
    { icon: '📋', label: 'Audit Logs',        path: '/admin/audit-logs' },
    { icon: '⚙',  label: 'Settings',          path: '/admin/settings'   },
  ];

  const filtered = MOCK_EMERGENCIES.filter((e) => {
    const matchText =
      filter === '' ||
      e.id.toLowerCase().includes(filter.toLowerCase()) ||
      e.type.toLowerCase().includes(filter.toLowerCase()) ||
      e.location.toLowerCase().includes(filter.toLowerCase());
    const matchSeverity = severityFilter === '' || String(e.severity) === severityFilter;
    return matchText && matchSeverity;
  });

  const handleDispatch = (incident) => alert(`Dispatching unit to ${incident.id} — ${incident.location}`);
  const handleView = (incident) => alert(`Viewing details for ${incident.id}`);

  return (
    <div className="flex h-screen bg-[#131313] text-[#e5e2e1] font-['Hanken_Grotesk',sans-serif] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#0e0e0e] border-r border-white/[0.07] flex flex-col">
        <div className="px-5 py-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <span className="text-[#1e3fae] text-xl">🚑</span>
            <span className="font-bold text-sm tracking-wide text-[#e5e2e1]">RespondaCare</span>
          </div>
          <p className="text-[10px] text-[#444653] font-mono mt-0.5 tracking-widest">DISPATCH HQ</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ icon, label, path }) => {
            const isActive = label === 'Command Center';
            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all ${
                  isActive
                    ? 'bg-[#1e3fae]/20 text-[#b8c4ff] border border-[#1e3fae]/40'
                    : 'text-[#8e909f] hover:bg-white/5 hover:text-[#e5e2e1]'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
                {label === 'Command Center' && (
                  <span className="ml-auto bg-[#e53935] text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full">
                    {MOCK_EMERGENCIES.filter(e => e.status === 'PENDING').length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/[0.07]">
          <div className="text-[10px] font-mono text-[#444653] tracking-widest">OPERATOR</div>
          <div className="text-sm text-[#e5e2e1] mt-0.5">{session?.name || 'Admin'}</div>
          <button
            onClick={handleLogout}
            className="mt-2 text-[10px] font-mono text-[#444653] hover:text-red-400 transition-colors"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] bg-[#0e0e0e]/50 backdrop-blur-sm flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-[#e5e2e1]">Command Center</h1>
            <p className="text-xs text-[#8e909f] font-mono mt-0.5">
              {filtered.length} active incident{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LiveClock />
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#43a047] animate-pulse" />
              <span className="text-xs font-mono text-[#8e909f]">LIVE</span>
            </div>
            <Button
              id="generate-auth-key-btn"
              variant="primary"
              size="sm"
              onClick={() => setAuthModalOpen(true)}
              leftIcon={<span>🔑</span>}
            >
              Generate Auth Key
            </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-white/[0.07] bg-[#131313] flex-shrink-0">
          <Input
            id="search-incidents"
            placeholder="Search by ID, type, or location…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-72"
            leftIcon={<span className="text-sm">🔍</span>}
          />
          <Select
            id="filter-severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            placeholder="All Severities"
            options={[
              { value: '5', label: '5 — Critical' },
              { value: '4', label: '4 — High' },
              { value: '3', label: '3 — Moderate' },
              { value: '2', label: '2 — Low' },
              { value: '1', label: '1 — Minimal' },
            ]}
            className="w-44"
          />
          {(filter || severityFilter) && (
            <Button variant="ghost" size="sm" onClick={() => { setFilter(''); setSeverityFilter(''); }}>
              Clear
            </Button>
          )}
          {/* Summary chips */}
          <div className="ml-auto flex gap-2">
            {[5,4,3,2,1].map(s => {
              const count = MOCK_EMERGENCIES.filter(e => e.severity === s).length;
              const meta = SEVERITY_META[s];
              return count > 0 ? (
                <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded border"
                  style={{ color: meta.color, borderColor: `${meta.color}50`, background: meta.bg }}>
                  {count} SEV-{s}
                </span>
              ) : null;
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#444653]">
              <span className="text-4xl mb-3">🔍</span>
              <p className="font-mono text-sm">No incidents match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered
                .sort((a, b) => b.severity - a.severity)
                .map((incident) => (
                  <EmergencyCard
                    key={incident.id}
                    incident={incident}
                    onDispatch={handleDispatch}
                    onView={handleView}
                  />
                ))}
            </div>
          )}
        </div>
      </main>

      {/* Auth Key Modal */}
      {authModalOpen && <AuthKeyModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
}
