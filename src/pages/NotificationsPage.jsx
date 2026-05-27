import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, AlertTriangle, CheckCircle2, Info, Megaphone } from 'lucide-react';
import MobileNav from '../components/layout/MobileNav';

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'alert',
    icon: AlertTriangle,
    iconColor: 'text-red-400',
    bg: 'bg-red-900/20 border-red-500/30',
    title: 'COVID-19 Vaccination Drive',
    body: 'Free booster shots available at Barangay 45 Health Center, May 30, 8AM–5PM.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'dispatch',
    icon: Bell,
    iconColor: 'text-amber-400',
    bg: 'bg-amber-900/20 border-amber-500/30',
    title: 'Incident Alert Nearby',
    body: 'Emergency response was dispatched near Rizal Ave. Area is now secured.',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'info',
    icon: Info,
    iconColor: 'text-[#b8c4ff]',
    bg: 'bg-[#1e3fae]/10 border-[#1e3fae]/30',
    title: 'Your QR Health Card is Ready',
    body: 'Your encrypted health ID has been generated. Visit "My Health QR Card" to view.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'info',
    icon: Megaphone,
    iconColor: 'text-emerald-400',
    bg: 'bg-emerald-900/20 border-emerald-500/30',
    title: 'Barangay Assembly — June 1',
    body: 'Barangay 45 Assembly meeting this Sunday. Residents encouraged to attend.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'info',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    bg: 'bg-[#171717] border-white/[0.05]',
    title: 'Profile Enrollment Complete',
    body: 'Your health profile has been securely enrolled. Your data is encrypted and protected.',
    time: '3 days ago',
    read: true,
  },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] pb-20">
      <header className="bg-[#0e0e0e] border-b border-white/[0.07] px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/resident/portal')} className="text-[#8e909f] hover:text-[#e5e2e1]">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-base font-bold text-[#e5e2e1]">Notifications</h1>
              <p className="text-[10px] font-mono text-[#8e909f] uppercase tracking-widest">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] font-mono text-[#b8c4ff] hover:text-[#e5e2e1] transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </header>

      <div className="p-4 space-y-3">
        {notifications.map(({ id, icon: Icon, iconColor, bg, title, body, time, read }) => (
          <button
            key={id}
            id={`notif-${id}`}
            onClick={() => markRead(id)}
            className={`w-full border rounded-xl p-4 flex items-start gap-3 text-left transition-all hover:scale-[1.01] ${bg} ${!read ? 'ring-1 ring-white/10' : 'opacity-70'}`}
          >
            <div className={`h-9 w-9 rounded-full bg-black/20 flex items-center justify-center flex-shrink-0 ${iconColor}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-semibold text-[#e5e2e1] truncate">{title}</h3>
                {!read && <span className="h-1.5 w-1.5 rounded-full bg-[#1e3fae] flex-shrink-0" />}
              </div>
              <p className="text-xs text-[#8e909f] leading-relaxed">{body}</p>
              <p className="text-[9px] font-mono text-[#444653] mt-1.5">{time}</p>
            </div>
          </button>
        ))}
      </div>
      <MobileNav />
    </div>
  );
}
