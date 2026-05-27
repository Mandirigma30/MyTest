import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QrCode, FileText, Map, Bell, User, ShieldCheck, BookOpen, Siren } from 'lucide-react';

/**
 * MobileNav.jsx — Sticky bottom navigation bar for mobile views
 * Adapts its tabs based on the current user's role from localStorage session.
 */
export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionRaw = localStorage.getItem('respondaCare_session');
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;
  const role = session?.role;

  const responderTabs = [
    { icon: QrCode, label: 'Scanner', path: '/responder/scanner' },
    { icon: FileText, label: 'UIR Form', path: '/responder/uir' },
    { icon: Map, label: 'Map', path: '/responder/map' },
    { icon: User, label: 'Profile', path: '/responder/profile' },
  ];

  const residentTabs = [
    { icon: Siren, label: 'SOS', path: '/resident/sos' },
    { icon: QrCode, label: 'My QR', path: '/resident/portal' },
    { icon: BookOpen, label: 'First Aid', path: '/resident/education' },
    { icon: Bell, label: 'Alerts', path: '/resident/notifications' },
  ];

  const tabs = role === 'responder' ? responderTabs : residentTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0e0e0e] border-t border-white/[0.07] flex items-center h-16 px-2 safe-area-pb">
      {tabs.map(({ icon: Icon, label, path }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
              isActive
                ? 'text-[#b8c4ff]'
                : 'text-[#8e909f] hover:text-[#c5c5d5]'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-[#1e3fae]/20' : ''}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            </div>
            <span className={`text-[9px] font-mono tracking-widest uppercase ${isActive ? 'text-[#b8c4ff] font-bold' : ''}`}>
              {label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-[#1e3fae] rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
