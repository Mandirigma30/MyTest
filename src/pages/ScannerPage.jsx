import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/scanner/QRScanner';
import SAMPLEViewer from '../components/scanner/SAMPLEViewer';
import Button from '../components/common/Button';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export default function ScannerPage() {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);

  const handleScanComplete = (data) => {
    setPatientData(data);
  };

  const handleReset = () => {
    setPatientData(null);
  };

  const handleLogout = () => {
    // Clear credentials locally
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#e5e2e1] font-['Hanken_Grotesk',sans-serif] flex justify-center">
      {/* Mobile viewport constraint container */}
      <div className="w-full max-w-md bg-[#111111] border-x border-white/10 min-h-screen flex flex-col shadow-2xl overflow-x-hidden">
        
        {/* Header */}
        <header className="px-4 py-3 bg-[#0e0e0e] border-b border-white/[0.07] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            {patientData ? (
              <button 
                onClick={handleReset}
                className="text-[#8e909f] hover:text-[#e5e2e1] transition-colors p-1"
              >
                <ArrowLeft size={16} />
              </button>
            ) : (
              <span className="text-lg">🚑</span>
            )}
            <div>
              <span className="font-bold text-sm tracking-wide block">RespondaCare</span>
              <span className="text-[9px] font-mono text-[#8e909f] tracking-widest uppercase block mt-0.5">
                {patientData ? 'SAMPLE VIEWPORT' : 'PARAMEDIC PORTAL'}
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

        {/* Active Content Area */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4">
          
          {!patientData ? (
            <div className="space-y-4">
              {/* Informative Dashboard Title */}
              <div className="pb-1 border-b border-white/[0.05]">
                <h1 className="text-base font-bold text-[#e5e2e1]">Offline Assessment Scanner</h1>
                <p className="text-xs text-[#8e909f] font-mono mt-0.5">
                  Unit Assignment: <span className="text-[#b8c4ff] font-semibold">RESP-UNIT-ALPHA</span>
                </p>
              </div>

              {/* QR Scanner viewport */}
              <QRScanner onScanComplete={handleScanComplete} />
            </div>
          ) : (
            /* Scanned patient assessment & UIR forms */
            <SAMPLEViewer patient={patientData} onReset={handleReset} />
          )}

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
