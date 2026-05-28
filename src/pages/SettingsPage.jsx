import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Users, Database, Shield, Copy, CheckCircle2, Clock, ToggleLeft, ToggleRight, UserPlus } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { generateAuthKey } from '../lib/cryptoUtils';

const MOCK_USERS = [
  { id: 'USR-001', name: 'Medic Unit Alpha',  email: 'responder@respondacare.ph', role: 'responder', active: true  },
  { id: 'USR-002', name: 'BHW Maria Reyes',   email: 'bhw@respondacare.ph',       role: 'bhw',       active: true  },
  { id: 'USR-003', name: 'Paramedic Beta',    email: 'beta@respondacare.ph',       role: 'responder', active: false },
  { id: 'USR-004', name: 'BHW Jose Santos',   email: 'bhw2@respondacare.ph',      role: 'bhw',       active: true  },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [generatedKey, setGeneratedKey] = useState('');
  const [keyExpiry, setKeyExpiry] = useState('8');
  const [responderTarget, setResponderTarget] = useState('');
  const [copied, setCopied] = useState(false);
  const [users, setUsers] = useState(() => {
    // Merge seeded mock users with any self-registered pending responders
    const pending = JSON.parse(localStorage.getItem('respondaCare_pendingResponders') || '[]');
    const pendingMapped = pending.map(p => ({
      id:     p.id,
      name:   p.name,
      email:  p.email,
      role:   'responder',
      active: p.active ?? false,
      // Extra fields carried for display
      licenseNumber: p.licenseNumber,
      emtLevel:      p.emtLevel,
      rescueUnit:    p.rescueUnit,
      selfRegistered: true,
    }));
    // Avoid duplicates by email
    const existingEmails = new Set(MOCK_USERS.map(u => u.email));
    const newPending = pendingMapped.filter(p => !existingEmails.has(p.email));
    return [...MOCK_USERS, ...newPending];
  });

  const handleGenerateKey = () => {
    const key = generateAuthKey();
    setGeneratedKey(key);
    setCopied(false);
  };

  const handleCopyKey = async () => {
    if (!generatedKey) return;
    await navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleUserStatus = (id) => {
    setUsers(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, active: !u.active } : u);
      // Sync back to localStorage for self-registered responders
      const pending = JSON.parse(localStorage.getItem('respondaCare_pendingResponders') || '[]');
      const syncedPending = pending.map(p => {
        const match = updated.find(u => u.id === p.id);
        return match ? { ...p, active: match.active, is_active: match.active, status: match.active ? 'active' : 'pending_approval' } : p;
      });
      localStorage.setItem('respondaCare_pendingResponders', JSON.stringify(syncedPending));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <header className="bg-[#0e0e0e] border-b border-white/[0.07] px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/admin/dashboard')} className="text-[#8e909f] hover:text-[#e5e2e1]">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#e5e2e1]">System Settings</h1>
          <p className="text-xs font-mono text-[#8e909f]">Admin configuration panel</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Auth Key Generator */}
        <Card>
          <Card.Header className="border-b border-white/[0.05] pb-3">
            <div className="flex items-center gap-2">
              <Key size={16} className="text-[#b8c4ff]" />
              <span className="text-sm font-bold text-[#e5e2e1]">Rotating Shift Auth Key Generator</span>
            </div>
            <p className="text-xs text-[#8e909f] mt-1">
              Generate cryptographic shift keys for first responders. Keys expire based on selected duration.
            </p>
          </Card.Header>
          <Card.Body className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="settings-responder-id"
                label="Responder ID / Name"
                placeholder="e.g. Medic Unit Alpha"
                value={responderTarget}
                onChange={e => setResponderTarget(e.target.value)}
              />
              <div>
                <label className="text-xs font-mono tracking-[0.05em] uppercase text-[#c5c5d5] block mb-1.5">Key Expiry</label>
                <div className="flex gap-2">
                  {[
                    { val: '1', label: '1 Hour' },
                    { val: '4', label: '4 Hours' },
                    { val: '8', label: '8 Hours' },
                    { val: '24', label: '24 Hours' },
                  ].map(({ val, label }) => (
                    <button
                      key={val}
                      onClick={() => setKeyExpiry(val)}
                      className={`flex-1 py-2 text-xs font-mono rounded border transition-colors ${
                        keyExpiry === val
                          ? 'bg-[#1e3fae] text-white border-[#1e3fae]'
                          : 'text-[#8e909f] border-[#444653] hover:border-[#8e909f]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="primary" onClick={handleGenerateKey} leftIcon={<Key size={14} />}>
              Generate Auth Key
            </Button>

            {generatedKey && (
              <div className="p-4 bg-[#111111] border border-[#1e3fae]/30 rounded-lg space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#444653] uppercase tracking-widest">Generated Key</span>
                  <div className="flex items-center gap-1 ml-auto text-[10px] font-mono text-amber-400">
                    <Clock size={11} />
                    <span>Expires in {keyExpiry}h</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-lg font-bold text-[#b8c4ff] font-mono tracking-widest">
                    {generatedKey}
                  </code>
                  <button
                    onClick={handleCopyKey}
                    className={`flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded border transition-colors ${
                      copied
                        ? 'text-emerald-400 border-emerald-500/40'
                        : 'text-[#8e909f] border-[#444653] hover:border-[#8e909f]'
                    }`}
                  >
                    {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                {responderTarget && (
                  <p className="text-[10px] font-mono text-[#444653]">
                    Bound to: {responderTarget}
                  </p>
                )}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* User Account Management */}
        <Card>
          <Card.Header className="border-b border-white/[0.05] pb-3">
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#b8c4ff]" />
                <span className="text-sm font-bold text-[#e5e2e1]">Personnel Account Management</span>
              </div>
              <button
                onClick={() => navigate('/register/responder')}
                className="flex items-center gap-1.5 text-[10px] font-mono text-[#8e909f] hover:text-[#b8c4ff] border border-[#444653] hover:border-[#1e3fae]/60 px-2 py-1 rounded transition-colors"
              >
                <UserPlus size={11} />
                Register Responder
              </button>
            </div>
          </Card.Header>
          <Card.Body className="pt-4">
            <div className="space-y-3">
              {users.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-[#111111] border border-white/[0.05] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      user.active ? 'bg-[#1e3fae]/20 text-[#b8c4ff]' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#e5e2e1]">{user.name}</p>
                        {user.selfRegistered && !user.active && (
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase tracking-wider">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-[#444653]">{user.email}</p>
                      {user.licenseNumber && (
                        <p className="text-[9px] font-mono text-[#444653] mt-0.5">License: {user.licenseNumber} · {user.emtLevel}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                      user.role === 'responder'
                        ? 'text-[#b8c4ff] border-[#1e3fae]/40'
                        : 'text-cyan-400 border-cyan-500/40'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${
                        user.active ? 'text-emerald-400 hover:text-red-400' : 'text-[#444653] hover:text-emerald-400'
                      }`}
                    >
                      {user.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      {user.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* System Info */}
        <Card>
          <Card.Header className="border-b border-white/[0.05] pb-3">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-[#b8c4ff]" />
              <span className="text-sm font-bold text-[#e5e2e1]">System Configuration</span>
            </div>
          </Card.Header>
          <Card.Body className="pt-4 grid grid-cols-2 gap-4 text-xs">
            {[
              { label: 'App Version', value: '1.0.0' },
              { label: 'Jurisdiction', value: 'Barangay 45, Pasay City' },
              { label: 'Encryption', value: 'AES-256-GCM' },
              { label: 'Compliance', value: 'RA 10173 Compliant' },
              { label: 'Auth Method', value: 'Supabase Auth + TOTP MFA' },
              { label: 'Database', value: 'Supabase (PostgreSQL)' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-[#111111] border border-white/[0.05] rounded-lg">
                <p className="text-[9px] font-mono text-[#444653] uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm text-[#e5e2e1] font-mono">{value}</p>
              </div>
            ))}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
