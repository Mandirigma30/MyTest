import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Card from '../common/Card';

function generateKey(responderId, expiry) {
  const prefix = 'RESP';
  const part1 = responderId.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, 'X').padEnd(4, 'X');
  const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const part3 = expiry.replace('h', 'H') + Date.now().toString(36).slice(-2).toUpperCase();
  return `${prefix}-${part1}-${part2}-${part3}`;
}

export default function AuthKeyModal({ onClose }) {
  const [responderId, setResponderId] = useState('');
  const [expiry, setExpiry] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setError('');
    if (!responderId.trim()) return setError('Responder ID is required.');
    if (!expiry) return setError('Please select an expiry duration.');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setGeneratedKey(generateKey(responderId.trim(), expiry));
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed top-0 right-0 h-full w-80 bg-[#1c1b1b] border-l border-white/10 z-50 flex flex-col shadow-[−8px_0_40px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div>
            <h2 className="text-sm font-bold text-[#e5e2e1]">Generate Auth Key</h2>
            <p className="text-[10px] font-mono text-[#444653] tracking-widest mt-0.5">RESPONDER ACCESS CONTROL</p>
          </div>
          <button
            onClick={onClose}
            id="close-auth-modal"
            className="text-[#8e909f] hover:text-[#e5e2e1] transition-colors p-1 rounded hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          <Card variant="flat" className="border-[#1e3fae]/30">
            <p className="text-xs text-[#8e909f] leading-relaxed">
              Auth Keys grant temporary access to the RespondaCare portal for field responders.
              Keys are single-use and expire after the selected duration.
            </p>
          </Card>

          <Input
            id="auth-responder-id"
            label="Responder ID"
            placeholder="e.g. RSP-0042"
            value={responderId}
            onChange={(e) => setResponderId(e.target.value)}
            error={error && !responderId.trim() ? error : ''}
            required
            leftIcon={<span className="text-sm">👤</span>}
          />

          <Select
            id="auth-expiry"
            label="Key Expiry"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            placeholder="Select duration"
            error={error && !expiry ? error : ''}
            required
            options={[
              { value: '1h',  label: '1 Hour  — Short shift' },
              { value: '4h',  label: '4 Hours — Half shift'  },
              { value: '8h',  label: '8 Hours — Full shift'  },
              { value: '24h', label: '24 Hours — Extended'   },
            ]}
          />

          {error && responderId.trim() && expiry && (
            <p className="text-xs text-[#ffb4ab] font-mono">{error}</p>
          )}

          <Button
            id="generate-key-btn"
            fullWidth
            loading={loading}
            onClick={handleGenerate}
            leftIcon={<span>⚡</span>}
          >
            Generate Key
          </Button>

          {generatedKey && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-mono text-[#c5c5d5] tracking-widest uppercase">Generated Key</p>
              <div className="relative rounded border border-[#1e3fae]/50 bg-[#0e0e0e] p-3">
                <p
                  id="generated-key-display"
                  className="font-mono text-sm text-[#44e2cd] tracking-wider break-all select-all"
                >
                  {generatedKey}
                </p>
                <button
                  id="copy-key-btn"
                  onClick={handleCopy}
                  className="absolute top-2 right-2 text-[#8e909f] hover:text-[#b8c4ff] text-xs font-mono transition-colors"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-[10px] text-[#444653] font-mono">
                Expires in {expiry} · Single-use · RA 10173 Compliant
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.07]">
          <Button variant="secondary" fullWidth onClick={onClose} id="cancel-auth-modal">
            Close
          </Button>
        </div>
      </aside>
    </>
  );
}
