/**
 * RegisterResponderPage.jsx — RespondaCare
 * Route: /register/responder  (PUBLIC — no auth required)
 *
 * Fig 4 & Fig 19: First Responder / Paramedic Self-Registration
 *
 * Fields: Full Name, Email ID, EMT License Number, Rescue Unit designation.
 *
 * Admin Gate: The account is written with is_active = false.
 * It surfaces immediately in the Admin → Settings → Personnel Account Management
 * panel where an admin can toggle it to Active after credential verification.
 *
 * Supabase write: attempted against security.users (role_id = 2 / responder).
 * Offline-first fallback: written to localStorage key
 *   'respondaCare_pendingResponders' so the Settings panel can always read it.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import { supabase } from '../lib/supabase';
import {
  Stethoscope, ShieldAlert, ClipboardCheck, ArrowRight,
  ArrowLeft, CheckCircle2, Clock, Eye, EyeOff, Lock,
  BadgeCheck, AlertCircle, Building2, FileText,
} from 'lucide-react';

// ─── Rescue unit options (mirrored from blueprint jurisdiction table) ─────────
const RESCUE_UNITS = [
  { value: 'BFP-Pasay-45',      label: 'BFP Pasay City — Station 45' },
  { value: 'NDRRMC-Metro',      label: 'NDRRMC Metro Manila Response' },
  { value: 'PNRC-Brgy45',       label: 'Philippine Red Cross — Barangay 45' },
  { value: 'PNP-MPD-Pasay',     label: 'PNP Mobile Patrol Division — Pasay' },
  { value: 'DOH-EMS-Region4',   label: 'DOH EMS Region IV-A' },
  { value: 'Brgy-ERF-45',       label: 'Barangay Emergency Response Force 45' },
  { value: 'Private-EMS',       label: 'Private EMS Provider' },
  { value: 'Other',             label: 'Other (specify in notes)' },
];

// ─── EMT certification levels ─────────────────────────────────────────────────
const EMT_LEVELS = [
  { value: 'EMT-Basic',          label: 'EMT-Basic' },
  { value: 'EMT-Intermediate',   label: 'EMT-Intermediate' },
  { value: 'EMT-Paramedic',      label: 'EMT-Paramedic' },
  { value: 'RN-EMT',             label: 'Registered Nurse — EMT' },
  { value: 'MD-PHEM',            label: 'Physician — PHEM Certified' },
  { value: 'BLS-Provider',       label: 'BLS Provider (In-Training)' },
];

// ─── Admin approval notice banner ─────────────────────────────────────────────
function PendingApprovalBanner({ name }) {
  return (
    <div className="w-full max-w-sm text-center space-y-6">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
            <Clock size={40} className="text-amber-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#171717] border border-white/10 flex items-center justify-center">
            <ShieldAlert size={14} className="text-amber-400" />
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[#e5e2e1]">Application Submitted</h1>
        <p className="text-sm text-[#8e909f] mt-1.5 font-mono">
          Welcome, <span className="text-[#b8c4ff]">{name}</span>
        </p>
      </div>

      {/* Status card */}
      <Card variant="flat" className="text-left space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.05]">
          <Clock size={13} className="text-amber-400" />
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
            Pending Admin Approval
          </span>
        </div>
        <p className="text-xs text-[#c5c5d5] leading-relaxed">
          Your responder account has been registered with <span className="text-amber-300 font-semibold">is_active = false</span>. A Dispatch Admin must verify your EMT license and activate your account before you can log in.
        </p>
        <div className="space-y-2">
          {[
            { label: 'Account Status',    value: 'Pending Verification',   color: 'text-amber-400' },
            { label: 'Role Assigned',     value: 'First Responder',         color: 'text-[#b8c4ff]' },
            { label: 'Activation',        value: 'Admin → Settings → Personnel', color: 'text-[#8e909f]' },
            { label: 'Estimated Time',    value: '1–2 business days',       color: 'text-[#8e909f]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between text-[10px]">
              <span className="text-[#444653] font-mono uppercase tracking-wider">{label}</span>
              <span className={`font-mono ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* What happens next */}
      <Card variant="flat" className="text-left space-y-2">
        <p className="text-[10px] font-mono text-[#b8c4ff] uppercase tracking-widest pb-1 border-b border-white/[0.05]">
          What happens next
        </p>
        {[
          'Admin receives your registration in the Personnel Management panel.',
          'Your EMT license number is verified against the registry.',
          'Admin toggles your account to Active.',
          'You receive confirmation and can log in at /login.',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-2 text-[10px] text-[#8e909f]">
            <span className="flex-shrink-0 h-4 w-4 rounded-full bg-[#1e3fae]/20 border border-[#1e3fae]/30 text-[#b8c4ff] font-mono font-bold flex items-center justify-center text-[8px]">
              {i + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </Card>

      <Button
        id="btn-back-to-login"
        variant="ghost"
        fullWidth
        onClick={() => window.location.assign('/login')}
        leftIcon={<ArrowLeft size={14} />}
      >
        Back to Login
      </Button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
export default function RegisterResponderPage() {
  const navigate = useNavigate();

  // ── Form fields ──
  const [fullName, setFullName]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [emtLevel, setEmtLevel]         = useState('EMT-Paramedic');
  const [rescueUnit, setRescueUnit]     = useState('BFP-Pasay-45');
  const [unitNotes, setUnitNotes]       = useState('');
  const [yearsExp, setYearsExp]         = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  // ── UI state ──
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (!fullName.trim())       { setError('Full name is required.');                    return false; }
    if (!email.trim())          { setError('Email address is required.');                return false; }
    if (!password)              { setError('A login password is required.');             return false; }
    if (password.length < 8)   { setError('Password must be at least 8 characters.');   return false; }
    if (!licenseNumber.trim())  { setError('EMT License Number is required.');           return false; }
    if (!consentGiven)          { setError('You must acknowledge the terms before submitting.'); return false; }
    return true;
  };

  // ── Submission ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);

    try {
      const newId = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      // Build the pending responder record
      const pendingRecord = {
        id:             newId,
        name:           fullName.trim(),
        email:          email.trim(),
        role:           'responder',
        emtLevel,
        licenseNumber:  licenseNumber.trim().toUpperCase(),
        rescueUnit,
        unitNotes:      unitNotes.trim(),
        yearsExp:       yearsExp.trim(),
        // ── ADMIN GATE: is_active defaults to false ──────────────────────────
        active:         false,
        is_active:      false,
        status:         'pending_approval',
        registeredAt:   timestamp,
      };

      // ── 1. Attempt Supabase write (security.users schema) ────────────────
      if (!supabase.supabaseUrl.includes('placeholder-project-url')) {
        try {
          const { error: dbErr } = await supabase
            .schema('security')
            .from('users')
            .insert([{
              user_id:       newId,
              full_name:     fullName.trim(),
              email:         email.trim(),
              role_id:       2, // role_id 2 = responder
              password_hash: 'PENDING-HASH',   // hashed server-side in production
              is_active:     false,             // ← admin gate
            }]);
          if (dbErr) throw dbErr;
        } catch (dbError) {
          // Offline-first: gracefully continue to localStorage fallback
          console.warn('[RegisterResponderPage] Supabase write failed, using localStorage fallback:', dbError);
        }
      }

      // ── 2. Offline-first: persist to localStorage ────────────────────────
      // Key: 'respondaCare_pendingResponders' — read by SettingsPage for admin review
      const existing = JSON.parse(localStorage.getItem('respondaCare_pendingResponders') || '[]');
      // Deduplicate by email
      const deduped = existing.filter(r => r.email !== email.trim());
      deduped.push(pendingRecord);
      localStorage.setItem('respondaCare_pendingResponders', JSON.stringify(deduped));

      setSuccess(true);
    } catch (err) {
      console.error('[RegisterResponderPage] Error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Success: show pending approval screen ────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#111111] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,191,36,0.08),rgba(255,255,255,0))] flex flex-col">
        <header className="w-full bg-[#171717] border-b border-white/[0.05] px-6 py-3.5 flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-[#1e3fae] flex items-center justify-center font-bold text-white text-sm shadow-[0_0_8px_rgba(30,63,174,0.5)]">
            RC
          </div>
          <span className="font-bold text-[#e5e2e1] tracking-wide text-base">RespondaCare</span>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <PendingApprovalBanner name={fullName} />
        </div>
      </div>
    );
  }

  // ─── Registration form ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111111] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,63,174,0.18),rgba(255,255,255,0))] flex flex-col relative overflow-x-hidden">

      {/* Ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(30,63,174,0.10)_0%,transparent_75%)] pointer-events-none rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_center,rgba(30,63,174,0.06)_0%,transparent_75%)] pointer-events-none rounded-full blur-3xl" />

      {/* Header */}
      <header className="w-full bg-[#171717]/90 backdrop-blur border-b border-white/[0.05] sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-[#1e3fae] flex items-center justify-center font-bold text-white text-sm shadow-[0_0_8px_rgba(30,63,174,0.5)]">
            RC
          </div>
          <div>
            <span className="font-bold text-[#e5e2e1] tracking-wide text-sm block">RespondaCare</span>
            <span className="text-[9px] font-mono text-[#444653] uppercase tracking-widest">
              First Responder Credentialing
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-xs font-mono text-[#8e909f] hover:text-[#e5e2e1] transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Login
        </button>
      </header>

      {/* Body */}
      <main className="flex-1 flex justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl space-y-5">

          {/* Page heading */}
          <div className="pt-2 pb-4 border-b border-white/[0.07]">
            <span className="text-[10px] font-mono text-[#b8c4ff] tracking-widest uppercase block mb-1">
              Paramedic / EMT Personnel Registration
            </span>
            <h1 className="text-2xl font-bold text-[#e5e2e1] flex items-center gap-2">
              <Stethoscope size={22} className="text-[#1e3fae]" />
              First Responder Registration
            </h1>
            <p className="text-xs text-[#8e909f] mt-1.5 leading-relaxed">
              Register your credentials to request access to the RespondaCare Emergency Response Network. Your account will be reviewed by a Dispatch Admin before activation.
            </p>
          </div>

          {/* Admin gate notice */}
          <div className="flex items-start gap-2.5 p-3 bg-amber-500/8 border border-amber-500/25 rounded-lg">
            <Clock size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-mono text-amber-300 font-semibold">Account pending admin approval</p>
              <p className="text-[10px] text-amber-400/70 mt-0.5 leading-relaxed">
                Submitted accounts default to <code className="bg-amber-500/10 px-1 rounded">is_active = false</code>. A Dispatch Admin must verify your EMT license and toggle your account to Active in the Settings panel before you can log in.
              </p>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-[#93000a]/10 border border-[#93000a]/40 rounded-lg">
              <AlertCircle size={14} className="text-[#ffb4ab] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#ffb4ab] font-mono leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── CARD 1: IDENTITY ── */}
            <Card variant="default" className="space-y-4">
              <Card.Header className="border-b border-white/[0.05] pb-2">
                <div className="flex items-center gap-2">
                  <ClipboardCheck size={16} className="text-[#1e3fae]" />
                  <span className="text-xs font-mono text-[#b8c4ff] tracking-wider uppercase font-bold">
                    1. Personal Identity
                  </span>
                </div>
              </Card.Header>
              <Card.Body className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="resp-fullname"
                    label="Full Name"
                    placeholder="e.g. Maria Santos"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                  <Input
                    id="resp-email"
                    label="Email Address"
                    type="email"
                    placeholder="e.g. msantos@bfp.gov.ph"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Input
                  id="resp-password"
                  label="Login Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  leftIcon={<Lock size={15} />}
                  rightIcon={
                    <span className="text-[10px] font-bold select-none">
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </span>
                  }
                  onRightIconClick={() => setShowPassword(v => !v)}
                  autoComplete="new-password"
                  hint="Used to log in once your account is approved."
                  required
                />

              </Card.Body>
            </Card>

            {/* ── CARD 2: EMT CREDENTIALS ── */}
            <Card variant="default" className="space-y-4">
              <Card.Header className="border-b border-white/[0.05] pb-2">
                <div className="flex items-center gap-2">
                  <BadgeCheck size={16} className="text-[#1e3fae]" />
                  <span className="text-xs font-mono text-[#b8c4ff] tracking-wider uppercase font-bold">
                    2. EMT License & Certification
                  </span>
                </div>
              </Card.Header>
              <Card.Body className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="resp-license"
                    label="EMT License Number"
                    placeholder="e.g. PRC-EMT-2024-00123"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    leftIcon={<FileText size={15} />}
                    hint="As printed on your PRC / DOH license card."
                    required
                  />
                  <Select
                    id="resp-emt-level"
                    label="EMT Certification Level"
                    value={emtLevel}
                    onChange={e => setEmtLevel(e.target.value)}
                    options={EMT_LEVELS}
                  />
                </div>

                <Input
                  id="resp-years-exp"
                  label="Years of Field Experience"
                  type="number"
                  placeholder="e.g. 3"
                  value={yearsExp}
                  onChange={e => setYearsExp(e.target.value)}
                  hint="Optional — helps with shift assignment prioritization."
                />

                {/* License verification note */}
                <div className="flex items-start gap-2 p-2.5 bg-[#1e3fae]/8 border border-[#1e3fae]/20 rounded-lg">
                  <BadgeCheck size={12} className="text-[#b8c4ff] mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] font-mono text-[#b8c4ff] leading-relaxed">
                    Your license number will be cross-verified by the Dispatch Admin against the PRC/DOH registry before your account is activated.
                  </p>
                </div>

              </Card.Body>
            </Card>

            {/* ── CARD 3: RESCUE UNIT ── */}
            <Card variant="default" className="space-y-4">
              <Card.Header className="border-b border-white/[0.05] pb-2">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-[#1e3fae]" />
                  <span className="text-xs font-mono text-[#b8c4ff] tracking-wider uppercase font-bold">
                    3. Rescue Unit Designation
                  </span>
                </div>
              </Card.Header>
              <Card.Body className="space-y-4">

                <Select
                  id="resp-rescue-unit"
                  label="Primary Rescue Unit / Agency"
                  value={rescueUnit}
                  onChange={e => setRescueUnit(e.target.value)}
                  options={RESCUE_UNITS}
                />

                <Input
                  id="resp-unit-notes"
                  label="Unit / Station Notes"
                  placeholder="e.g. Station Commander: Lt. Reyes, Unit call sign: Alpha-7"
                  value={unitNotes}
                  onChange={e => setUnitNotes(e.target.value)}
                  hint="Optional — additional details about your unit or station."
                />

              </Card.Body>
            </Card>

            {/* ── CARD 4: TERMS & SUBMISSION ── */}
            <Card variant="default" className="space-y-4">
              <Card.Header className="border-b border-white/[0.05] pb-2">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <ShieldAlert size={14} />
                  <span className="text-xs font-mono tracking-wider uppercase font-bold">
                    4. Declaration & Terms of Access
                  </span>
                </div>
              </Card.Header>
              <Card.Body className="space-y-4">

                {/* Scrollable declaration */}
                <div className="h-28 overflow-y-auto p-3 bg-[#111111] border border-white/[0.05] rounded-lg text-[10px] text-[#8e909f] font-mono leading-relaxed space-y-2">
                  <p className="text-[#c5c5d5] font-semibold">First Responder Access Declaration</p>
                  <p>
                    By submitting this registration, I declare that all information provided — including my EMT License Number, assigned Rescue Unit, and personal credentials — is accurate, complete, and verifiable.
                  </p>
                  <p>
                    I understand that: (1) my account will remain inactive until verified by a Dispatch Admin; (2) providing false credentials constitutes a violation subject to administrative and legal action; (3) access to resident health data through this system is governed by RA 10173 (Philippine Data Privacy Act) and is strictly limited to active emergency response contexts.
                  </p>
                  <p>
                    I agree to use this system solely for its intended emergency response purpose and to maintain strict confidentiality of all patient information accessed during my duty.
                  </p>
                  <p className="text-[#444653]">
                    RespondaCare — Barangay Emergency Health Network. All access is logged and audited.
                  </p>
                </div>

                {/* Consent toggle */}
                <label
                  id="resp-consent-label"
                  className={`flex items-start gap-3 cursor-pointer select-none p-3 rounded-lg border transition-all duration-200 ${
                    consentGiven
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-[#171717] border-[#444653] hover:border-amber-500/40'
                  }`}
                >
                  <input
                    id="check-resp-consent"
                    type="checkbox"
                    checked={consentGiven}
                    onChange={e => setConsentGiven(e.target.checked)}
                    className="mt-1 accent-[#1e3fae] h-4 w-4 rounded border-[#444653] flex-shrink-0"
                  />
                  <span className={`text-xs leading-relaxed transition-colors ${consentGiven ? 'text-emerald-300' : 'text-[#c5c5d5]'}`}>
                    I declare the above information is true and accurate. I acknowledge my account will remain <strong>pending admin approval</strong> and agree to the RespondaCare First Responder terms of access.
                    {!consentGiven && (
                      <span className="block mt-1 text-amber-400 font-mono text-[10px]">
                        ⚠ Declaration required to submit registration.
                      </span>
                    )}
                  </span>
                </label>

                {/* Submit */}
                <Button
                  id="btn-submit-responder-registration"
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={!consentGiven}
                  rightIcon={<CheckCircle2 size={15} />}
                >
                  {loading ? 'Submitting Application…' : 'Submit for Admin Approval'}
                </Button>

                <p className="text-[9px] font-mono text-[#444653] text-center leading-relaxed">
                  Accounts default to inactive until verified · RA 10173 Compliant · All access is audit-logged
                </p>

              </Card.Body>
            </Card>

          </form>

          <p className="text-[9px] font-mono text-[#444653] text-center pb-6 leading-relaxed">
            RespondaCare Emergency Health Network · Barangay 45 Command Jurisdiction · AES-256-GCM Protected
          </p>

        </div>
      </main>
    </div>
  );
}
