import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import MobileNav from '../components/layout/MobileNav';
import { QrCode, Siren, BookOpen, Bell, LogOut, ShieldCheck, ChevronRight, Activity } from 'lucide-react';

export default function ResidentPortalPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const raw = localStorage.getItem('respondaCare_session');
    if (raw) setSession(JSON.parse(raw));
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('respondaCare_session');
    navigate('/login');
  };

  const actions = [
    {
      id: 'action-sos',
      icon: Siren,
      label: 'Emergency SOS',
      desc: 'Send your GPS location to dispatch instantly',
      path: '/resident/sos',
      color: 'from-red-900/40 to-red-950/40 border-red-500/30',
      iconColor: 'text-red-400',
      badge: null,
      urgent: true,
    },
    {
      id: 'action-qr',
      icon: QrCode,
      label: 'My Health QR Card',
      desc: 'View & share your encrypted health profile',
      path: '/resident/qr',
      color: 'from-[#1e3fae]/20 to-[#1e3fae]/10 border-[#1e3fae]/30',
      iconColor: 'text-[#b8c4ff]',
      badge: null,
      urgent: false,
    },
    {
      id: 'action-education',
      icon: BookOpen,
      label: 'First Aid Hub',
      desc: 'Learn life-saving first aid techniques',
      path: '/resident/education',
      color: 'from-emerald-900/30 to-emerald-950/30 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      badge: null,
      urgent: false,
    },
    {
      id: 'action-notifications',
      icon: Bell,
      label: 'Notifications',
      desc: 'Health alerts and barangay announcements',
      path: '/resident/notifications',
      color: 'from-amber-900/30 to-amber-950/30 border-amber-500/30',
      iconColor: 'text-amber-400',
      badge: '2',
      urgent: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] pb-20">
      {/* Header */}
      <header className="bg-[#0e0e0e] border-b border-white/[0.07] px-4 pt-safe-top">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#1e3fae]/20 border border-[#1e3fae]/40 flex items-center justify-center">
              <ShieldCheck size={18} className="text-[#b8c4ff]" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-[#8e909f] tracking-widest uppercase">Resident Portal</p>
              <h1 className="text-base font-bold text-[#e5e2e1]">
                {session?.name || 'Resident'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-mono text-[#8e909f]">{time.toLocaleTimeString('en-PH', { hour12: false })}</p>
              <p className="text-[9px] font-mono text-[#444653]">Brgy. 45, Pasay</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#8e909f] hover:text-[#e5e2e1] transition-colors p-1"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="flex items-center gap-2 pb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400 tracking-wider">BARANGAY 45 ERU — ACTIVE</span>
        </div>
      </header>

      {/* Hero SOS Banner */}
      <div className="mx-4 mt-4">
        <button
          id="btn-sos-hero"
          onClick={() => navigate('/resident/sos')}
          className="w-full bg-gradient-to-r from-red-900/50 to-red-950/60 border border-red-500/40 rounded-xl p-5 flex items-center justify-between group hover:border-red-500/70 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500/30" />
              <div className="relative h-14 w-14 rounded-full bg-red-500/20 border-2 border-red-500/60 flex items-center justify-center">
                <Siren size={24} className="text-red-400" />
              </div>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-mono text-red-400/70 tracking-widest uppercase">Emergency</p>
              <h2 className="text-lg font-bold text-red-300">SOS Panic</h2>
              <p className="text-xs text-red-400/60">Hold 3 seconds to dispatch</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-red-500/60 group-hover:text-red-400 transition-colors" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mx-4 mt-4">
        {[
          { label: 'Your Profile', value: 'Active', color: 'text-emerald-400' },
          { label: 'QR Status', value: 'Ready', color: 'text-[#b8c4ff]' },
          { label: 'Alerts', value: '2 New', color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#171717] border border-white/[0.05] rounded-lg p-3 text-center">
            <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
            <p className="text-[9px] text-[#444653] font-mono uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Action Grid */}
      <div className="mx-4 mt-4 space-y-3">
        <h2 className="text-[10px] font-mono text-[#8e909f] tracking-widest uppercase px-1">Services</h2>
        {actions.slice(1).map(({ id, icon: Icon, label, desc, path, color, iconColor, badge }) => (
          <button
            key={id}
            id={id}
            onClick={() => navigate(path)}
            className={`w-full bg-gradient-to-r ${color} border rounded-xl p-4 flex items-center gap-4 group hover:scale-[1.01] transition-all active:scale-[0.99]`}
          >
            <div className={`h-11 w-11 rounded-xl bg-black/20 flex items-center justify-center flex-shrink-0 ${iconColor}`}>
              <Icon size={22} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-[#e5e2e1]">{label}</h3>
              <p className="text-xs text-[#8e909f] mt-0.5">{desc}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {badge && (
                <span className="bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                  {badge}
                </span>
              )}
              <ChevronRight size={16} className="text-[#444653] group-hover:text-[#8e909f] transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {/* Compliance footer */}
      <div className="mx-4 mt-6 p-3 bg-[#171717] border border-white/[0.05] rounded-lg flex items-center gap-2">
        <Activity size={12} className="text-[#444653] flex-shrink-0" />
        <p className="text-[9px] font-mono text-[#444653] leading-relaxed">
          All health data is encrypted client-side per RA 10173 Philippine Data Privacy Act.
        </p>
      </div>

      <MobileNav />
    </div>
  );
}
