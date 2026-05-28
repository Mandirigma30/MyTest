/**
 * ResponderProfilePage.jsx — RespondaCare
 * Route: /responder/profile
 * Role: responder (ProtectedRoute allowedRoles={['responder']})
 *
 * Fig 38: First Responder Profile Screen
 *
 * Features:
 *  - Premium Paramedic ID Badge — full credentials, rescue unit call sign
 *  - Active daily shift token with expiration countdown
 *  - Shift Status Badge — live indicator (active / expired)
 *  - Quick-access links to all responder screens
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, LogOut, ShieldCheck, ShieldAlert, Clock,
  QrCode, FileText, Map, History, Activity,
  Radio, Star, Award, AlertTriangle, Zap,
} from 'lucide-react';
import MobileNav from '../components/layout/MobileNav';
import Button from '../components/common/Button';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generates a deterministic daily shift token that rotates each calendar day.
 * In production this would be a real TOTP/rotating JWT — here it's a
 * reproducible 8-char hex derived from today's date string.
 */
function getDailyShiftToken() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0;
  }
  // Turn into an uppercase hex-like token
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `RC-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

/** Returns the seconds remaining until midnight (token expiry). */
function getSecondsUntilMidnight() {
  const now   = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((midnight - now) / 1000));
}

function formatCountdown(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Credential fields for this responder ────────────────────────────────────
// In production these come from the DB. Here we derive from session + sandbox.
function buildCredentials(session) {
  return {
    fullName:    session?.name  || 'Unknown Responder',
    email:       session?.email || 'responder@respondacare.ph',
    responderId: 'RESP-001',
    rank:        'Paramedic I',
    unitCallSign: 'ALPHA-04',
    barangay:    'Barangay 45, Pasay City',
    certLevel:   'EMT-P (Paramedic)',
    licenseNo:   'PRC-PM-2024-00147',
    certExpiry:  '2027-06-30',
    bloodType:   'O+',
    deployedSince: '2023-08-01',
  };
}

// ─── Pill-shaped stat widget ──────────────────────────────────────────────────
function StatPill({ label, value, color = '#b8c4ff' }) {
  return (
    <div
      className="flex-1 rounded-xl p-3 flex flex-col items-center gap-1 min-w-0"
      style={{ background: `${color}10`, border: `1px solid ${color}25` }}
    >
      <span className="text-base font-bold font-mono" style={{ color }}>{value}</span>
      <span className="text-[9px] font-mono text-[#444653] uppercase tracking-wider text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Quick-nav action button ──────────────────────────────────────────────────
function QuickNavButton({ icon: Icon, label, path, color, navigate }) {
  return (
    <button
      onClick={() => navigate(path)}
      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/[0.07] bg-[#161616] hover:bg-[#1e1e1e] hover:border-white/20 transition-all duration-150 group"
    >
      <div
        className="h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-150 group-hover:scale-105"
        style={{ background: `${color}20`, border: `1px solid ${color}40` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <span className="text-[9px] font-mono text-[#8e909f] group-hover:text-[#c5c5d5] transition-colors uppercase tracking-wider">{label}</span>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ResponderProfilePage() {
  const navigate = useNavigate();

  const sessionRaw = localStorage.getItem('respondaCare_session');
  const session    = sessionRaw ? JSON.parse(sessionRaw) : null;
  const creds      = buildCredentials(session);

  // Shift token state
  const shiftToken = getDailyShiftToken();
  const [secondsLeft, setSecondsLeft] = useState(getSecondsUntilMidnight());

  // Token expires if there are no seconds left (edge case for midnight exact)
  const isTokenActive = secondsLeft > 0;

  // Live countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(getSecondsUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Token health color: green > 4h, amber 1-4h, red < 1h
  const tokenColor =
    secondsLeft > 14400 ? '#43a047' :
    secondsLeft > 3600  ? '#fb8c00' :
    '#e53935';

  const handleLogout = () => {
    localStorage.removeItem('respondaCare_session');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#e5e2e1] font-['Hanken_Grotesk',sans-serif] flex justify-center">
      <div className="w-full max-w-md bg-[#111111] border-x border-white/10 min-h-screen flex flex-col shadow-2xl overflow-x-hidden">

        {/* ── Header ── */}
        <header className="px-4 py-3 bg-[#0e0e0e] border-b border-white/[0.07] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="text-[#8e909f] hover:text-[#e5e2e1] transition-colors p-1"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="font-bold text-sm tracking-wide block">RespondaCare</span>
              <span className="text-[9px] font-mono text-[#8e909f] tracking-widest uppercase block mt-0.5">
                PARAMEDIC PROFILE
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-xs text-[#8e909f] hover:text-[#ffdad6] p-1.5"
            leftIcon={<LogOut size={13} />}
          >
            Logout
          </Button>
        </header>

        {/* ── Scrollable content ── */}
        <main className="flex-1 overflow-y-auto pb-20 space-y-4">

          {/* ═══════════════════════════════════════════════
              PARAMEDIC ID BADGE — premium credential card
          ═══════════════════════════════════════════════ */}
          <div className="mx-4 mt-4">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0d1b5e 0%, #101428 40%, #0e0e1a 100%)',
                border: '1px solid rgba(30,63,174,0.5)',
                boxShadow: '0 8px 32px rgba(30,63,174,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              {/* Background grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Top accent bar */}
              <div
                className="h-1 w-full"
                style={{ background: 'linear-gradient(90deg, #1e3fae, #4a6cf7, #1e3fae)' }}
              />

              <div className="p-5 relative z-10">

                {/* Badge header row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-mono font-bold text-[#4a6cf7] tracking-widest uppercase">
                        RespondaCare
                      </span>
                    </div>
                    <p className="text-[9px] font-mono text-[#444653] tracking-widest uppercase">
                      Official Responder Credential
                    </p>
                  </div>

                  {/* Shield emblem */}
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(30,63,174,0.3)',
                      border: '1px solid rgba(74,108,247,0.5)',
                      boxShadow: '0 0 16px rgba(30,63,174,0.4)',
                    }}
                  >
                    <ShieldCheck size={20} className="text-[#b8c4ff]" />
                  </div>
                </div>

                {/* Avatar + name block */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Avatar */}
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
                    style={{
                      background: 'linear-gradient(135deg, rgba(30,63,174,0.6), rgba(74,108,247,0.3))',
                      border: '2px solid rgba(74,108,247,0.5)',
                      boxShadow: '0 0 20px rgba(30,63,174,0.3)',
                    }}
                  >
                    <span className="text-3xl select-none">🚑</span>
                    {/* Online indicator */}
                    <span
                      className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 flex items-center justify-center"
                      style={{
                        background: isTokenActive ? '#43a047' : '#e53935',
                        borderColor: '#0d1b5e',
                        boxShadow: isTokenActive
                          ? '0 0 8px rgba(67,160,71,0.6)'
                          : '0 0 8px rgba(229,57,53,0.6)',
                      }}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${isTokenActive ? 'animate-pulse' : ''}`}
                        style={{ background: isTokenActive ? '#a5d6a7' : '#ffb4ab' }}
                      />
                    </span>
                  </div>

                  {/* Name & rank */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white leading-tight truncate">
                      {creds.fullName}
                    </h2>
                    <p className="text-[11px] font-mono text-[#b8c4ff] mt-0.5">{creds.rank}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Radio size={10} className="text-[#4a6cf7]" />
                      <span className="text-[10px] font-mono font-bold text-[#4a6cf7]">
                        {creds.unitCallSign}
                      </span>
                      <span className="text-[10px] font-mono text-[#444653]">·</span>
                      <span className="text-[10px] font-mono text-[#444653]">{creds.barangay}</span>
                    </div>
                  </div>
                </div>

                {/* Credential fields */}
                <div
                  className="rounded-xl p-3 space-y-1.5 mb-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {[
                    { label: 'Responder ID',    value: creds.responderId  },
                    { label: 'Certification',   value: creds.certLevel    },
                    { label: 'PRC License No.', value: creds.licenseNo    },
                    { label: 'Cert. Expiry',    value: creds.certExpiry   },
                    { label: 'Blood Type',      value: creds.bloodType    },
                    { label: 'Email',           value: creds.email        },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-[#444653] w-28 flex-shrink-0 uppercase tracking-wider">{label}</span>
                      <span className="text-[11px] font-mono text-[#c5c5d5] font-semibold truncate">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom holographic strip */}
                <div
                  className="h-0.5 w-full rounded-full mb-3"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(74,108,247,0.6), rgba(184,196,255,0.8), rgba(74,108,247,0.6), transparent)',
                  }}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Award size={11} className="text-[#fdd835]" />
                    <span className="text-[9px] font-mono text-[#444653]">
                      Deployed since {creds.deployedSince}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={9} className="text-[#fdd835]" />
                    <Star size={9} className="text-[#fdd835]" />
                    <Star size={9} className="text-[#fdd835]" />
                  </div>
                </div>

              </div>

              {/* Bottom accent bar */}
              <div
                className="h-0.5 w-full"
                style={{ background: 'linear-gradient(90deg, #1e3fae, #4a6cf7, #1e3fae)' }}
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              SHIFT TOKEN PANEL
          ═══════════════════════════════════════════════ */}
          <div className="mx-4">
            <div
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: isTokenActive
                  ? `linear-gradient(135deg, ${tokenColor}18, #111111)`
                  : 'linear-gradient(135deg, rgba(229,57,53,0.12), #111111)',
                border: `1px solid ${tokenColor}35`,
                boxShadow: `0 0 24px ${tokenColor}12`,
              }}
            >
              {/* Glow blob */}
              <div
                className="absolute -top-6 -right-6 h-24 w-24 rounded-full blur-2xl opacity-20 pointer-events-none"
                style={{ background: tokenColor }}
              />

              <div className="relative z-10">
                {/* Panel header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${tokenColor}20`, border: `1px solid ${tokenColor}40` }}
                    >
                      <Clock size={14} style={{ color: tokenColor }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#e5e2e1]">Daily Shift Token</p>
                      <p className="text-[9px] font-mono text-[#444653]">Rotates at 00:00 PH Time</p>
                    </div>
                  </div>

                  {/* Shift Status Badge */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider"
                    style={{
                      background: `${tokenColor}20`,
                      border: `1px solid ${tokenColor}50`,
                      color: tokenColor,
                    }}
                  >
                    <span
                      className="relative flex h-1.5 w-1.5"
                    >
                      {isTokenActive && (
                        <span
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{ background: tokenColor }}
                        />
                      )}
                      <span
                        className="relative inline-flex h-1.5 w-1.5 rounded-full"
                        style={{ background: tokenColor }}
                      />
                    </span>
                    {isTokenActive ? 'ACTIVE' : 'EXPIRED'}
                  </div>
                </div>

                {/* Token value */}
                <div
                  className="rounded-xl p-3 mb-3 text-center"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-[9px] font-mono text-[#444653] mb-1.5 uppercase tracking-widest">
                    Shift Token
                  </p>
                  <p
                    className="text-xl font-bold font-mono tracking-[0.15em]"
                    style={{ color: tokenColor, textShadow: `0 0 12px ${tokenColor}60` }}
                  >
                    {shiftToken}
                  </p>
                </div>

                {/* Countdown */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Activity size={11} style={{ color: tokenColor }} />
                    <span className="text-[10px] font-mono text-[#8e909f]">Expires in</span>
                  </div>
                  <span
                    className="text-sm font-bold font-mono tabular-nums"
                    style={{ color: tokenColor }}
                  >
                    {formatCountdown(secondsLeft)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5 h-1.5 bg-[#0e0e0e] rounded-full overflow-hidden border border-white/[0.05]">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(secondsLeft / 86400) * 100}%`,
                      background: `linear-gradient(90deg, ${tokenColor}, ${tokenColor}aa)`,
                      boxShadow: `0 0 6px ${tokenColor}80`,
                    }}
                  />
                </div>

                {!isTokenActive && (
                  <div className="mt-3 flex items-center gap-1.5 p-2 rounded-lg bg-[#e53935]/10 border border-[#e53935]/30">
                    <AlertTriangle size={12} className="text-[#e53935] flex-shrink-0" />
                    <p className="text-[10px] font-mono text-[#ffdad6]">
                      Token expired. Please log out and log back in to refresh.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              QUICK STATS
          ═══════════════════════════════════════════════ */}
          <div className="mx-4">
            <p className="text-[9px] font-mono text-[#444653] uppercase tracking-widest mb-2.5">
              This Week · Shift Stats
            </p>
            <div className="flex gap-2">
              <StatPill label="Dispatches"  value="6"    color="#1e3fae" />
              <StatPill label="Resolved"    value="6"    color="#43a047" />
              <StatPill label="Critical"    value="3"    color="#e53935" />
              <StatPill label="Avg On-Scene" value="7.2m" color="#fb8c00" />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              QUICK NAVIGATION
          ═══════════════════════════════════════════════ */}
          <div className="mx-4">
            <p className="text-[9px] font-mono text-[#444653] uppercase tracking-widest mb-2.5">
              Quick Access
            </p>
            <div className="grid grid-cols-4 gap-2">
              <QuickNavButton
                icon={QrCode}
                label="Scanner"
                path="/responder/scanner"
                color="#b8c4ff"
                navigate={navigate}
              />
              <QuickNavButton
                icon={FileText}
                label="UIR Form"
                path="/responder/uir"
                color="#4a6cf7"
                navigate={navigate}
              />
              <QuickNavButton
                icon={History}
                label="History"
                path="/responder/history"
                color="#43a047"
                navigate={navigate}
              />
              <QuickNavButton
                icon={Map}
                label="Map"
                path="/responder/map"
                color="#fb8c00"
                navigate={navigate}
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              LOGOUT
          ═══════════════════════════════════════════════ */}
          <div className="mx-4 pb-2">
            <Button
              id="btn-responder-logout"
              variant="danger"
              size="sm"
              fullWidth
              onClick={handleLogout}
              leftIcon={<LogOut size={13} />}
              className="opacity-70 hover:opacity-100"
            >
              End Shift & Log Out
            </Button>
          </div>

          {/* RA 10173 footer */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-center gap-1.5 text-[#ffb4ab] text-[10px] font-mono">
              <ShieldAlert size={11} />
              <span>NPC RA 10173 MANDATED CREDENTIAL SECURITY</span>
            </div>
            <p className="text-[9px] text-[#333] text-center mt-1">
              Unauthorized disclosure of responder credentials violates Philippine Law.
            </p>
          </div>

        </main>

        <MobileNav />
      </div>
    </div>
  );
}
