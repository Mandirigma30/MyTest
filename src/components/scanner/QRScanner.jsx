import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { Camera, QrCode, WifiOff, ShieldCheck, HeartPulse } from 'lucide-react';

// Pre-encrypted mock payloads representing raw patient QR code data
const PATIENT_PAYLOADS = {
  JUAN: {
    name: 'Juan Dela Cruz',
    age: 45,
    gender: 'Male',
    barangay: 'Brgy. San Lorenzo, Makati City',
    sample: {
      s: 'Sudden cold sweat, confusion, severe weakness, trembling',
      a: 'Sulfa drugs, Shellfish, Latex',
      m: 'Metformin 500mg (BID), Atorvastatin 20mg (OD)',
      p: 'Type 2 Diabetes mellitus, Stage 1 Hypertension (diagnosed 2021)',
      l: 'White Rice, Chicken Adobo, and soft drink at 12:30 PM',
      e: 'Collapsd near the barangay court due to heat exhaustion & hypoglycemia',
    }
  },
  MARIA: {
    name: 'Maria Santos',
    age: 28,
    gender: 'Female',
    barangay: 'Brgy. Plainview, Mandaluyong City',
    sample: {
      s: 'High wheezing, acute dyspnea, rapid shallow breathing',
      a: 'Penicillin, Dust Mites, Pollen',
      m: 'Albuterol Inhaler (PRN), Fluticasone Diskus (Daily)',
      p: 'Severe bronchial asthma (chronic since childhood)',
      l: 'Iced tea and Skyflakes crackers at 3:15 PM',
      e: 'Exposed to active construction dust while walking home',
    }
  }
};

export default function QRScanner({ onScanComplete }) {
  const [activeScanner, setActiveScanner] = useState(true);
  const [pulse, setPulse] = useState(true);
  const [localResidents, setLocalResidents] = useState([]);

  // Pulse effect for the scanner viewfinder
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Fetch dynamically enrolled residents from localStorage
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('respondaCare_residents') || '[]');
    setLocalResidents(list);
  }, []);

  const handleSimulateScan = (key) => {
    setActiveScanner(false);
    // Transmit selected patient payload
    onScanComplete(PATIENT_PAYLOADS[key]);
  };

  return (
    <div className="w-full space-y-4">
      {/* Offline capability bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <WifiOff size={14} />
          <span>OFFLINE SCANNING ACTIVE</span>
        </div>
        <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">RA 10173 SECURE</span>
      </div>

      {/* Simulated Camera Viewfinder */}
      <Card className="bg-[#171717] border-white/10 relative overflow-hidden">
        <div className="aspect-[4/3] bg-black relative flex items-center justify-center">
          {/* Pulse laser animation */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,63,174,0.08)_0%,transparent_70%)]" />
          
          {/* Laser scanning bar */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#1e3fae] shadow-[0_0_8px_#2a52d4] animate-[bounce_3s_infinite]" />
 
          {/* Target Reticle brackets */}
          <div className="absolute h-36 w-36 border-2 border-dashed border-[#1e3fae]/40 rounded-lg flex items-center justify-center">
            <QrCode size={48} className="text-[#8e909f]/40 animate-pulse" />
          </div>

          {/* Frame corners */}
          <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-[#b8c4ff]" />
          <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-[#b8c4ff]" />
          <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-[#b8c4ff]" />
          <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-[#b8c4ff]" />

          <p className="absolute bottom-3 text-[10px] font-mono text-[#8e909f] tracking-widest uppercase">
            Align patient QR code within frame
          </p>
        </div>
      </Card>

      {/* Simulator Actions */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-mono text-[#8e909f] tracking-widest uppercase text-center">
          Simulate Field Patient Scans
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            id="scan-juan-btn"
            variant="secondary"
            size="sm"
            onClick={() => handleSimulateScan('JUAN')}
            className="flex flex-col items-center py-3 gap-1"
          >
            <HeartPulse size={16} className="text-red-400" />
            <span className="text-xs">Juan Dela Cruz</span>
            <span className="text-[9px] text-[#8e909f] font-mono font-normal">Diabetic Shock</span>
          </Button>

          <Button
            id="scan-maria-btn"
            variant="secondary"
            size="sm"
            onClick={() => handleSimulateScan('MARIA')}
            className="flex flex-col items-center py-3 gap-1"
          >
            <HeartPulse size={16} className="text-blue-400" />
            <span className="text-xs">Maria Santos</span>
            <span className="text-[9px] text-[#8e909f] font-mono font-normal">Severe Asthma</span>
          </Button>

          {localResidents.map((res, index) => (
            <Button
              key={index}
              variant="secondary"
              size="sm"
              onClick={() => {
                setActiveScanner(false);
                onScanComplete(res);
              }}
              className="flex flex-col items-center py-3 gap-1 animate-fadeIn col-span-2 md:col-span-1"
            >
              <HeartPulse size={16} className="text-purple-400 animate-pulse" />
              <span className="text-xs truncate max-w-full font-bold">{res.name}</span>
              <span className="text-[9px] text-[#8e909f] font-mono font-normal">Enrolled Resident</span>
            </Button>
          ))}
        </div>
      </div>
      
      <div className="p-3 bg-[#171717] rounded border border-white/[0.05] text-[10px] text-[#8e909f] font-mono space-y-1">
        <div className="flex items-center gap-1.5 text-[#b8c4ff] font-semibold">
          <ShieldCheck size={12} />
          <span>LOCAL DECRYPTION PROTOCOL</span>
        </div>
        <p className="leading-relaxed">
          Decryption keys are generated dynamically per active first responder session and never committed to local persistent storage in plaintext.
        </p>
      </div>
    </div>
  );
}
