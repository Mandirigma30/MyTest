import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShieldCheck, Filter } from 'lucide-react';

const MOCK_LOGS = [
  { id: 'LOG-0091', actor: 'responder@respondacare.ph', action: 'QR_DECRYPT',      target: 'RES-001 (Juan Dela Cruz)',   timestamp: '2026-05-27 22:04:13', hash: 'a3f9e1c8', verified: true  },
  { id: 'LOG-0090', actor: 'admin@respondacare.ph',     action: 'AUTH_KEY_GEN',     target: 'Responder Unit Alpha',       timestamp: '2026-05-27 21:58:00', hash: 'b7d2a4f1', verified: true  },
  { id: 'LOG-0089', actor: 'responder@respondacare.ph', action: 'PCR_SUBMIT',       target: 'PCR-RC9921 — Juan Dela Cruz',timestamp: '2026-05-27 21:55:37', hash: 'c4e8b9d3', verified: true  },
  { id: 'LOG-0088', actor: 'bhw@respondacare.ph',       action: 'RESIDENT_ENROLL',  target: 'RES-008 (Lourdes Aquino)',   timestamp: '2026-05-27 20:30:05', hash: 'd1a7c5f9', verified: true  },
  { id: 'LOG-0087', actor: 'responder@respondacare.ph', action: 'QR_DECRYPT',       target: 'RES-002 (Maria Santos)',     timestamp: '2026-05-27 19:15:44', hash: 'e8f3d2b6', verified: true  },
  { id: 'LOG-0086', actor: 'admin@respondacare.ph',     action: 'USER_STATUS_CHANGE',target: 'responder@respondacare.ph', timestamp: '2026-05-27 18:00:00', hash: 'f5c1e7a4', verified: true  },
  { id: 'LOG-0085', actor: 'resident@respondacare.ph',  action: 'SOS_TRIGGER',      target: 'Incident RC-9921',          timestamp: '2026-05-27 17:44:12', hash: '2a9d6b8e', verified: true  },
  { id: 'LOG-0084', actor: 'admin@respondacare.ph',     action: 'AUDIT_VIEW',       target: 'audit_logs table',          timestamp: '2026-05-26 09:12:30', hash: '7c4f1e3a', verified: true  },
  { id: 'LOG-0083', actor: 'bhw@respondacare.ph',       action: 'HEALTH_PROFILE_UPDATE', target: 'RES-003 (Pedro Reyes)', timestamp: '2026-05-26 08:55:00', hash: '9b2d5f7c', verified: false },
];

const ACTION_META = {
  QR_DECRYPT:           { color: 'text-purple-400 border-purple-500/30 bg-purple-900/15', label: 'QR Decrypt'        },
  AUTH_KEY_GEN:         { color: 'text-[#b8c4ff] border-[#1e3fae]/40 bg-[#1e3fae]/10',   label: 'Auth Key Gen'      },
  PCR_SUBMIT:           { color: 'text-emerald-400 border-emerald-500/30 bg-emerald-900/15', label: 'PCR Submit'     },
  RESIDENT_ENROLL:      { color: 'text-cyan-400 border-cyan-500/30 bg-cyan-900/15',        label: 'Enrollment'       },
  USER_STATUS_CHANGE:   { color: 'text-amber-400 border-amber-500/30 bg-amber-900/15',     label: 'Status Change'    },
  SOS_TRIGGER:          { color: 'text-red-400 border-red-500/30 bg-red-900/15',           label: 'SOS Trigger'      },
  AUDIT_VIEW:           { color: 'text-[#8e909f] border-[#444653] bg-[#171717]',          label: 'Audit View'       },
  HEALTH_PROFILE_UPDATE:{ color: 'text-indigo-400 border-indigo-500/30 bg-indigo-900/15', label: 'Profile Update'   },
};

export default function AuditLogsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filtered = MOCK_LOGS.filter(log => {
    const matchSearch =
      search === '' ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.id.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === '' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <header className="bg-[#0e0e0e] border-b border-white/[0.07] px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/admin/dashboard')} className="text-[#8e909f] hover:text-[#e5e2e1]">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#b8c4ff]" />
          <div>
            <h1 className="text-lg font-bold text-[#e5e2e1]">Security Audit Logs</h1>
            <p className="text-xs font-mono text-[#8e909f]">Immutable compliance ledger — {MOCK_LOGS.length} events</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444653]" />
          <input
            id="audit-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by actor, target, or log ID..."
            className="w-full bg-[#171717] border border-[#444653] focus:border-[#1e3fae] rounded pl-9 pr-3 py-2 text-sm text-[#e5e2e1] placeholder-[#444653] outline-none"
          />
        </div>

        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444653]" />
          <select
            id="audit-action-filter"
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="bg-[#171717] border border-[#444653] rounded pl-8 pr-3 py-2 text-sm text-[#e5e2e1] outline-none appearance-none"
          >
            <option value="">All Actions</option>
            {Object.keys(ACTION_META).map(action => (
              <option key={action} value={action}>{ACTION_META[action].label}</option>
            ))}
          </select>
        </div>

        {(search || actionFilter) && (
          <button
            className="text-xs font-mono text-[#8e909f] hover:text-[#e5e2e1]"
            onClick={() => { setSearch(''); setActionFilter(''); }}
          >
            Clear
          </button>
        )}
      </div>

      {/* RA 10173 Notice */}
      <div className="mx-6 mt-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg flex items-center gap-2 text-xs font-mono text-amber-300">
        <ShieldCheck size={13} />
        <span>These records are immutable. No human user may UPDATE or DELETE entries. RA 10173 Compliant.</span>
      </div>

      {/* Log Table */}
      <div className="mx-6 mt-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.07] text-[10px] font-mono text-[#444653] uppercase tracking-widest">
              <th className="text-left px-0 py-3 pr-4">Log ID</th>
              <th className="text-left px-4 py-3">Action</th>
              <th className="text-left px-4 py-3">Actor</th>
              <th className="text-left px-4 py-3">Target</th>
              <th className="text-left px-4 py-3">Timestamp</th>
              <th className="text-left px-4 py-3">Hash</th>
              <th className="text-left px-4 py-3">Verified</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => {
              const meta = ACTION_META[log.action] || { color: 'text-[#8e909f] border-[#444653]', label: log.action };
              return (
                <tr key={log.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-3 pr-4">
                    <span className="text-[10px] font-mono text-[#444653]">{log.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${meta.color}`}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#b8c4ff] font-mono">{log.actor}</td>
                  <td className="px-4 py-3 text-xs text-[#c5c5d5] max-w-[200px] truncate">{log.target}</td>
                  <td className="px-4 py-3 text-[10px] text-[#8e909f] font-mono whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono text-[#444653] bg-[#171717] border border-white/[0.05] px-1.5 py-0.5 rounded">
                      {log.hash}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {log.verified ? (
                      <span className="text-[9px] font-mono text-emerald-400">✓ OK</span>
                    ) : (
                      <span className="text-[9px] font-mono text-amber-400">⚠ Review</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
