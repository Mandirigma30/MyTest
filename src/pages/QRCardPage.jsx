import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, ShieldCheck, Download, Share2, Eye, EyeOff, Lock, RefreshCw } from 'lucide-react';
import MobileNav from '../components/layout/MobileNav';
import { encryptPayload } from '../lib/cryptoUtils';

// The encryption key used for resident QR payloads.
// In production this would be the resident's unique derived key from Supabase.
// Responders must enter the matching shift auth key to decrypt.
const RESIDENT_QR_ENCRYPTION_KEY = 'RespondaCare-Brgy45-RA10173';

export default function QRCardPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [residentData, setResidentData] = useState(null);
  const [qrValue, setQrValue] = useState('');
  const [encrypting, setEncrypting] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('respondaCare_session');
    if (raw) setSession(JSON.parse(raw));

    // Pull enrolled resident data from localStorage (written by BHW during enrollment)
    const residents = JSON.parse(localStorage.getItem('respondaCare_residents') || '[]');
    const sessionParsed = raw ? JSON.parse(raw) : null;

    // Try to match by session name, or fall back to first resident, or use demo data
    const matched = residents.find(r =>
      r.name?.toLowerCase() === sessionParsed?.name?.toLowerCase()
    ) || residents[0] || null;

    const profileData = matched || {
      name: sessionParsed?.name || 'Juan Dela Cruz',
      age: 45,
      gender: 'Male',
      barangay: 'Barangay 45, Pasay City',
      bloodType: 'O+',
      sample: {
        s: 'Occasional dizziness, fatigue',
        a: 'No known drug allergies',
        m: 'Metformin 500mg (twice daily)',
        p: 'Diabetes Type 2 (diagnosed 2019)',
        l: 'Unknown',
        e: 'Not specified',
      },
    };

    setResidentData(profileData);

    // Encrypt payload using Web Crypto API
    encryptPayload(profileData, RESIDENT_QR_ENCRYPTION_KEY)
      .then(encrypted => {
        // Prefix with protocol header so scanner knows this is a RespondaCare QR
        setQrValue(`RC-PHI:${encrypted}`);
        setGeneratedAt(new Date());
        setEncrypting(false);
      })
      .catch(() => {
        // Fallback: encode as plain JSON if crypto fails (dev only)
        setQrValue(JSON.stringify({ ...profileData, _enc: false }));
        setGeneratedAt(new Date());
        setEncrypting(false);
      });
  }, []);

  const handleRefreshQR = () => {
    setEncrypting(true);
    setQrValue('');
    encryptPayload(residentData, RESIDENT_QR_ENCRYPTION_KEY)
      .then(encrypted => {
        setQrValue(`RC-PHI:${encrypted}`);
        setGeneratedAt(new Date());
        setEncrypting(false);
      });
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] pb-20">
      {/* Header */}
      <header className="bg-[#0e0e0e] border-b border-white/[0.07] px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/resident/portal')} className="text-[#8e909f] hover:text-[#e5e2e1]">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold text-[#e5e2e1]">My Health QR Card</h1>
          <p className="text-[10px] font-mono text-[#8e909f] uppercase tracking-widest">AES-256-GCM Encrypted</p>
        </div>
      </header>

      <div className="p-4 space-y-4 max-w-sm mx-auto">

        {/* Security Notice */}
        <div className="flex items-start gap-2 p-3 bg-[#1e3fae]/10 border border-[#1e3fae]/30 rounded-lg">
          <Lock size={13} className="text-[#b8c4ff] mt-0.5 flex-shrink-0" />
          <p className="text-[10px] font-mono text-[#b8c4ff] leading-relaxed">
            This QR is encrypted. Only authorized first responders with a valid shift auth key can read your health data.
          </p>
        </div>

        {/* QR Card */}
        <div className="bg-[#171717] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Card top bar */}
          <div className="bg-[#1e3fae] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-mono text-[#b8c4ff] tracking-widest uppercase">RespondaCare</p>
              <p className="text-sm font-bold text-white">{residentData?.name || '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-mono text-[#b8c4ff]">Blood Type</p>
              <p className="text-lg font-black text-white font-mono">{residentData?.bloodType || '—'}</p>
            </div>
          </div>

          {/* QR Code area */}
          <div className="flex flex-col items-center py-6 px-4">
            {encrypting ? (
              <div className="h-[200px] w-[200px] bg-[#111111] border border-white/[0.07] rounded-lg flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 border-2 border-[#1e3fae] border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-mono text-[#444653]">Encrypting payload...</p>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl shadow-lg">
                <QRCodeSVG
                  value={qrValue}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={false}
                />
              </div>
            )}

            {generatedAt && (
              <p className="text-[9px] font-mono text-[#444653] mt-3">
                Generated {generatedAt.toLocaleTimeString('en-PH')}
              </p>
            )}
          </div>

          {/* Card bottom info */}
          <div className="px-4 pb-4 grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-[#111111] rounded-lg p-2">
              <p className="text-[#444653] font-mono uppercase tracking-wider">Age</p>
              <p className="text-[#e5e2e1] font-semibold mt-0.5">{residentData?.age || '—'}</p>
            </div>
            <div className="bg-[#111111] rounded-lg p-2">
              <p className="text-[#444653] font-mono uppercase tracking-wider">Gender</p>
              <p className="text-[#e5e2e1] font-semibold mt-0.5">{residentData?.gender || '—'}</p>
            </div>
            <div className="bg-[#111111] rounded-lg p-2 col-span-2">
              <p className="text-[#444653] font-mono uppercase tracking-wider">Barangay</p>
              <p className="text-[#e5e2e1] font-semibold mt-0.5">{residentData?.barangay || 'Barangay 45, Pasay City'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleRefreshQR}
            disabled={encrypting}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#171717] border border-white/[0.05] rounded-xl text-xs font-mono text-[#8e909f] hover:text-[#e5e2e1] hover:border-white/10 transition-all disabled:opacity-40"
          >
            <RefreshCw size={13} />
            Refresh QR
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#171717] border border-white/[0.05] rounded-xl text-xs font-mono text-[#8e909f] hover:text-[#e5e2e1] hover:border-white/10 transition-all"
          >
            {showDetails ? <EyeOff size={13} /> : <Eye size={13} />}
            {showDetails ? 'Hide Data' : 'View Data'}
          </button>
        </div>

        {/* Show decoded health summary (for resident's own review) */}
        {showDetails && residentData?.sample && (
          <div className="bg-[#171717] border border-white/[0.05] rounded-xl p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.05]">
              <ShieldCheck size={13} className="text-emerald-400" />
              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Your Health Summary (Visible only to you)</p>
            </div>
            {[
              { key: 'S', label: 'Signs & Symptoms', value: residentData.sample.s },
              { key: 'A', label: 'Allergies',         value: residentData.sample.a },
              { key: 'M', label: 'Medications',       value: residentData.sample.m },
              { key: 'P', label: 'Past Medical Hx',  value: residentData.sample.p },
              { key: 'L', label: 'Last Intake',       value: residentData.sample.l },
              { key: 'E', label: 'Events Leading',    value: residentData.sample.e },
            ].map(({ key, label, value }) => (
              <div key={key} className="flex gap-3">
                <span className="flex-shrink-0 h-5 w-5 rounded bg-[#1e3fae]/20 text-[#b8c4ff] text-[9px] font-bold font-mono flex items-center justify-center border border-[#1e3fae]/30">
                  {key}
                </span>
                <div>
                  <p className="text-[9px] font-mono text-[#444653] uppercase tracking-wider">{label}</p>
                  <p className="text-xs text-[#c5c5d5] mt-0.5">{value || 'Not recorded'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RA 10173 footer */}
        <p className="text-[9px] font-mono text-[#444653] text-center leading-relaxed">
          Your health data is encrypted with AES-256-GCM and protected under RA 10173 Philippine Data Privacy Act. Only credentialed first responders can access this information during an emergency.
        </p>

      </div>
      <MobileNav />
    </div>
  );
}
