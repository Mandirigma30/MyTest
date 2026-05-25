import React from 'react';
import { useNavigate } from 'react-router-dom';
import BhwEnrollment from '../components/bhw/BhwEnrollment';
import Button from '../components/common/Button';
import { ArrowLeft, LayoutDashboard, Scan } from 'lucide-react';

export default function EnrollPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(30,63,174,0.12)_0%,transparent_75%)] pointer-events-none rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(30,63,174,0.08)_0%,transparent_75%)] pointer-events-none rounded-full blur-3xl" />

      {/* Global Navigation header */}
      <header className="w-full bg-[#171717] border-b border-white/[0.05] sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-[#1e3fae] flex items-center justify-center font-bold text-white shadow-[0_0_8px_rgba(30,63,174,0.5)]">
            RC
          </div>
          <span className="font-bold text-[#e5e2e1] tracking-wide text-base">
            RespondaCare
          </span>
        </div>

        {/* Access shortcuts */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            leftIcon={<LayoutDashboard size={14} className="text-[#b8c4ff]" />}
          >
            Dispatch HQ
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/scanner')}
            leftIcon={<Scan size={14} className="text-[#b8c4ff]" />}
          >
            Paramedic Field Portal
          </Button>
        </div>
      </header>

      {/* Main Workspace Scroll Body */}
      <main className="flex-1 overflow-y-auto">
        <BhwEnrollment />
      </main>

      {/* Footer bar */}
      <footer className="w-full bg-[#171717] border-t border-white/[0.05] py-3 text-center text-[10px] text-[#8e909f] font-mono tracking-widest uppercase">
        © 2026 RespondaCare. Philippine Health Security Accreditation System.
      </footer>
    </div>
  );
}
