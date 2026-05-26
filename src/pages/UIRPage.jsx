/**
 * UIRPage.jsx — Unified Incident Report Page Container
 * Mobile-responsive page wrapper for the standalone UIR form
 * Follows the ScannerPage.jsx layout pattern (mobile viewport constraint)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedIncidentReport from '../components/uir/UnifiedIncidentReport';
import Button from '../components/common/Button';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export default function UIRPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#090909] text-[#e5e2e1] font-['Hanken_Grotesk',sans-serif] flex justify-center">
      {/* Mobile viewport constraint container */}
      <div className="w-full max-w-md bg-[#111111] border-x border-white/10 min-h-screen flex flex-col shadow-2xl overflow-x-hidden">

        {/* Header */}
        <header className="px-4 py-3 bg-[#0e0e0e] border-b border-white/[0.07] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="text-[#8e909f] hover:text-[#e5e2e1] transition-colors p-1 cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="font-bold text-sm tracking-wide block">RespondaCare</span>
              <span className="text-[9px] font-mono text-[#8e909f] tracking-widest uppercase block mt-0.5">
                UNIFIED INCIDENT REPORT
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className="text-xs text-[#8e909f] hover:text-[#ffdad6] p-1.5"
            leftIcon={<LogOut size={13} />}
          >
            Logout
          </Button>
        </header>

        {/* Active Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          <UnifiedIncidentReport />
        </main>

        {/* Footer legal constraints info */}
        <footer className="px-4 py-3.5 bg-[#0e0e0e] border-t border-white/[0.07] text-center">
          <div className="flex items-center justify-center gap-1.5 text-[#ffb4ab] text-[10px] font-mono">
            <ShieldAlert size={12} />
            <span>NPC RA 10173 MANDATED PATIENT ENCRYPTION</span>
          </div>
          <p className="text-[9px] text-[#444653] mt-1">
            Unauthorized decryption or leaking of health records is punishable by Philippine Law.
          </p>
        </footer>

      </div>
    </div>
  );
}
