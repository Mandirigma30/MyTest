/**
 * ResponseHistoryPage.jsx — RespondaCare
 * Route: /responder/history
 * Role: responder (ProtectedRoute allowedRoles={['responder']})
 *
 * Fig 29: Response History Ledger
 *
 * Features:
 *  - Chronologically sorted, collapsible incident cards
 *  - Quick-action "Export Handover PDF" per card via pdfExport.js
 *  - Filter controls: date range + call type search
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, LogOut, Clock, ChevronDown, ChevronUp,
  Download, Calendar, Search, Filter, ShieldAlert,
  CheckCircle2, AlertTriangle, Zap, FileText, History,
} from 'lucide-react';
import MobileNav from '../components/layout/MobileNav';
import Button from '../components/common/Button';
import { generateHandoverPDF } from '../lib/pdfExport';

// ─── Severity metadata ────────────────────────────────────────────────────────
const SEVERITY_META = {
  5: { label: 'CRITICAL', color: '#e53935', bg: 'rgba(229,57,53,0.15)',   pulse: true  },
  4: { label: 'HIGH',     color: '#fb8c00', bg: 'rgba(251,140,0,0.15)',   pulse: false },
  3: { label: 'MODERATE', color: '#fdd835', bg: 'rgba(253,216,53,0.12)',  pulse: false },
  2: { label: 'LOW',      color: '#b8c4ff', bg: 'rgba(184,196,255,0.10)', pulse: false },
  1: { label: 'MINIMAL',  color: '#43a047', bg: 'rgba(67,160,71,0.12)',   pulse: false },
};

// ─── Mock resolved incident records for this responder ───────────────────────
const MOCK_HISTORY = [
  {
    id: 'RC-9921',
    date: '2026-05-28',
    time: '08:14',
    type: 'Cardiac Arrest',
    severity: 5,
    patientName: 'Roberto Sanchez',
    patientAge: 67,
    patientSex: 'Male',
    unitCallSign: 'ALPHA-04',
    incidentLocation: '123 Mabini St, Pasay',
    barangay: 'Barangay 45',
    incidentDate: '2026-05-28',
    incidentTime: '08:14',
    arrivalTime: '08:20',
    clearTime: '09:10',
    incidentType: 'Cardiac Arrest',
    severityScore: 'SEV-5',
    responseOutcome: 'Transported to Hospital',
    natureOfCall: 'AED — CPR Protocol',
    chiefComplaint: 'Sudden cardiac arrest, unresponsive',
    painScale: 'N/A',
    levelOfConsciousness: 'Unresponsive',
    airwayStatus: 'Compromised',
    breathingStatus: 'Absent (resuscitated)',
    circulationStatus: 'No pulse (ROSC achieved)',
    skinCondition: 'Pale, diaphoretic',
    pupilResponse: 'Fixed and dilated',
    bloodPressure: '80/50',
    pulseRate: '42',
    respiratoryRate: '4',
    spo2: '72',
    temperature: '36.1',
    bloodGlucose: '5.1',
    gcsTotal: '3',
    interventionsPerformed: 'CPR initiated, AED x2 shock, airway managed.',
    medicationsGiven: 'Epinephrine 1mg IV x2',
    ivAccess: '18G right antecubital',
    oxygenTherapy: 'BVM ventilation',
    immobilization: 'Spinal board',
    patientDisposition: 'Transported',
    hospitalName: 'Pasay General Hospital',
    receivingProvider: 'Dr. Maria Santos',
    transportMode: 'Ambulance',
    departureTime: '08:52',
    arrivalAtFacility: '09:10',
    turnoverNotes: 'ROSC achieved after 4 cycles CPR. Patient intubated en route.',
    clinicalNarrative: 'Patient found unresponsive on arrival. Bystander CPR in progress. AED applied, VF identified. Two shocks delivered. ROSC achieved. Transported critical but stable.',
    dispatchMin: 1.8,
    onSceneMin: 6.2,
    handoffMin: 22.5,
    responderId: 'RESP-001',
  },
  {
    id: 'RC-9918',
    date: '2026-05-27',
    time: '14:33',
    type: 'Cardiac Arrest',
    severity: 5,
    patientName: 'Elena Reyes',
    patientAge: 74,
    patientSex: 'Female',
    unitCallSign: 'ALPHA-04',
    incidentLocation: '78 Rizal Ave, Pasay',
    barangay: 'Barangay 45',
    incidentDate: '2026-05-27',
    incidentTime: '14:33',
    arrivalTime: '14:39',
    clearTime: '15:28',
    incidentType: 'Cardiac Arrest',
    severityScore: 'SEV-5',
    responseOutcome: 'Transported to Hospital',
    natureOfCall: 'Medical — Cardiac',
    chiefComplaint: 'Witnessed collapse, no pulse',
    painScale: 'N/A',
    levelOfConsciousness: 'Unresponsive',
    airwayStatus: 'Managed',
    breathingStatus: 'Assisted',
    circulationStatus: 'ROSC after 3 cycles',
    skinCondition: 'Cyanotic',
    pupilResponse: 'Sluggish bilateral',
    bloodPressure: '90/60',
    pulseRate: '55',
    respiratoryRate: '10',
    spo2: '88',
    temperature: '36.3',
    bloodGlucose: '6.2',
    gcsTotal: '6',
    interventionsPerformed: 'CPR x3 cycles, AED x1 shock, IV access, O2 therapy.',
    medicationsGiven: 'Epinephrine 1mg IV',
    ivAccess: '20G left antecubital',
    oxygenTherapy: 'NRB mask 15L/min',
    immobilization: 'None',
    patientDisposition: 'Transported',
    hospitalName: 'Pasay General Hospital',
    receivingProvider: 'Dr. Juan Ramos',
    transportMode: 'Ambulance',
    departureTime: '15:05',
    arrivalAtFacility: '15:28',
    turnoverNotes: 'Stable ROSC, BP improving. GCS 6 on arrival at ED.',
    clinicalNarrative: 'Called to witnessed cardiac arrest. Family performing bystander CPR. Three CPR cycles with single defibrillation achieved ROSC. Transported with continuous monitoring.',
    dispatchMin: 1.5,
    onSceneMin: 5.8,
    handoffMin: 20.1,
    responderId: 'RESP-001',
  },
  {
    id: 'RC-9919',
    date: '2026-05-27',
    time: '09:05',
    type: 'Respiratory Distress',
    severity: 3,
    patientName: 'Andres Bautista',
    patientAge: 52,
    patientSex: 'Male',
    unitCallSign: 'ALPHA-04',
    incidentLocation: '22 Del Pilar St, Pasay',
    barangay: 'Barangay 45',
    incidentDate: '2026-05-27',
    incidentTime: '09:05',
    arrivalTime: '09:14',
    clearTime: '10:22',
    incidentType: 'Respiratory Distress',
    severityScore: 'SEV-3',
    responseOutcome: 'Transported to Hospital',
    natureOfCall: 'Medical — Respiratory',
    chiefComplaint: 'Acute dyspnea, wheezing, history of asthma',
    painScale: '6/10 chest tightness',
    levelOfConsciousness: 'Alert',
    airwayStatus: 'Patent',
    breathingStatus: 'Labored, bilateral wheezing',
    circulationStatus: 'Adequate, HR elevated',
    skinCondition: 'Diaphoretic',
    pupilResponse: 'Equal and reactive',
    bloodPressure: '138/88',
    pulseRate: '112',
    respiratoryRate: '28',
    spo2: '89',
    temperature: '36.8',
    bloodGlucose: '5.8',
    gcsTotal: '15',
    interventionsPerformed: 'Nebulized salbutamol x2 rounds, O2 supplementation.',
    medicationsGiven: 'Salbutamol 2.5mg nebulized x2',
    ivAccess: 'None',
    oxygenTherapy: 'Nasal cannula 4L/min → NRB 10L/min',
    immobilization: 'None',
    patientDisposition: 'Transported',
    hospitalName: 'Pasay City General Hospital',
    receivingProvider: 'Nurse Reyes (ER triage)',
    transportMode: 'Ambulance',
    departureTime: '09:45',
    arrivalAtFacility: '10:22',
    turnoverNotes: 'SpO2 improved to 94% post-neb. Patient ambulatory at hospital.',
    clinicalNarrative: 'Patient in acute asthma exacerbation. Two nebulizer treatments with good response. SpO2 recovered from 89% to 94%. Transported stable and alert.',
    dispatchMin: 3.0,
    onSceneMin: 9.1,
    handoffMin: 27.3,
    responderId: 'RESP-001',
  },
  {
    id: 'RC-9913',
    date: '2026-05-26',
    time: '17:48',
    type: 'Trauma / Fall',
    severity: 3,
    patientName: 'Corazon Villanueva',
    patientAge: 81,
    patientSex: 'Female',
    unitCallSign: 'ALPHA-04',
    incidentLocation: '55 Aurora Blvd, Pasay',
    barangay: 'Barangay 45',
    incidentDate: '2026-05-26',
    incidentTime: '17:48',
    arrivalTime: '17:55',
    clearTime: '18:50',
    incidentType: 'Trauma / Fall',
    severityScore: 'SEV-3',
    responseOutcome: 'Transported to Hospital',
    natureOfCall: 'Trauma — Fall from standing height',
    chiefComplaint: 'Right hip pain, unable to bear weight',
    painScale: '8/10',
    levelOfConsciousness: 'Alert and oriented x3',
    airwayStatus: 'Patent',
    breathingStatus: 'Normal',
    circulationStatus: 'Adequate',
    skinCondition: 'Normal, minor abrasion right knee',
    pupilResponse: 'Equal and reactive',
    bloodPressure: '145/90',
    pulseRate: '88',
    respiratoryRate: '16',
    spo2: '97',
    temperature: '36.5',
    bloodGlucose: '5.4',
    gcsTotal: '15',
    interventionsPerformed: 'Spinal precautions, right hip immobilized, pain management.',
    medicationsGiven: 'None (contraindicated pre-hospital)',
    ivAccess: '18G right antecubital (precautionary)',
    oxygenTherapy: 'None required',
    immobilization: 'Spinal board, hip splint',
    patientDisposition: 'Transported',
    hospitalName: 'Pasay City General Hospital',
    receivingProvider: 'Dr. Flores, Orthopedics',
    transportMode: 'Ambulance',
    departureTime: '18:25',
    arrivalAtFacility: '18:50',
    turnoverNotes: 'Suspected right femoral neck fracture. X-ray ordered. Patient alert throughout.',
    clinicalNarrative: 'Elderly female found on floor after unwitnessed fall at home. Right hip deformity noted, pain 8/10. Immobilized and transported with spinal precautions.',
    dispatchMin: 3.1,
    onSceneMin: 7.5,
    handoffMin: 22.0,
    responderId: 'RESP-001',
  },
  {
    id: 'RC-9915',
    date: '2026-05-26',
    time: '11:20',
    type: 'Hypoglycemic Episode',
    severity: 3,
    patientName: 'Dario Mendoza',
    patientAge: 63,
    patientSex: 'Male',
    unitCallSign: 'ALPHA-04',
    incidentLocation: '9 Leveriza St, Pasay',
    barangay: 'Barangay 45',
    incidentDate: '2026-05-26',
    incidentTime: '11:20',
    arrivalTime: '11:29',
    clearTime: '12:05',
    incidentType: 'Hypoglycemic Episode',
    severityScore: 'SEV-3',
    responseOutcome: 'Transported to Hospital',
    natureOfCall: 'Medical — Diabetic Emergency',
    chiefComplaint: 'Altered LOC, diaphoresis, known T2DM',
    painScale: 'N/A',
    levelOfConsciousness: 'Confused, GCS 12',
    airwayStatus: 'Patent',
    breathingStatus: 'Normal',
    circulationStatus: 'Adequate',
    skinCondition: 'Pale and diaphoretic',
    pupilResponse: 'Equal and reactive',
    bloodPressure: '110/70',
    pulseRate: '102',
    respiratoryRate: '18',
    spo2: '98',
    temperature: '36.6',
    bloodGlucose: '2.1',
    gcsTotal: '12',
    interventionsPerformed: 'Dextrose 50% IV push, blood glucose monitoring x3.',
    medicationsGiven: 'D50W 50mL IV',
    ivAccess: '18G left antecubital',
    oxygenTherapy: 'None required',
    immobilization: 'None',
    patientDisposition: 'Transported',
    hospitalName: 'Pasay General Hospital',
    receivingProvider: 'Nurse Delos Reyes',
    transportMode: 'Ambulance',
    departureTime: '11:45',
    arrivalAtFacility: '12:05',
    turnoverNotes: 'BG corrected to 6.8 mmol/L after D50W. GCS improved to 15. Transported for monitoring.',
    clinicalNarrative: 'Diabetic male found confused and diaphoretic by family. BG 2.1 mmol/L. IV dextrose given with rapid recovery of consciousness. Transported for observation.',
    dispatchMin: 3.5,
    onSceneMin: 9.8,
    handoffMin: 18.7,
    responderId: 'RESP-001',
  },
  {
    id: 'RC-9912',
    date: '2026-05-25',
    time: '23:02',
    type: 'Cardiac Arrest',
    severity: 5,
    patientName: 'Florencia Ocampo',
    patientAge: 79,
    patientSex: 'Female',
    unitCallSign: 'ALPHA-04',
    incidentLocation: '101 Buendia Ave, Pasay',
    barangay: 'Barangay 45',
    incidentDate: '2026-05-25',
    incidentTime: '23:02',
    arrivalTime: '23:08',
    clearTime: '23:55',
    incidentType: 'Cardiac Arrest',
    severityScore: 'SEV-5',
    responseOutcome: 'Transported to Hospital',
    natureOfCall: 'Medical — Cardiac',
    chiefComplaint: 'Pulseless, apneic, found by family',
    painScale: 'N/A',
    levelOfConsciousness: 'Unresponsive',
    airwayStatus: 'Managed — LMA placed',
    breathingStatus: 'Assisted via BVM',
    circulationStatus: 'ROSC after 5 cycles',
    skinCondition: 'Mottled, cyanotic',
    pupilResponse: 'Fixed and dilated initially, improving',
    bloodPressure: '75/40 post-ROSC',
    pulseRate: '38 initially',
    respiratoryRate: 'Assisted',
    spo2: '68 on arrival',
    temperature: '35.8',
    bloodGlucose: '8.3',
    gcsTotal: '4',
    interventionsPerformed: 'CPR x5 cycles, AED x3 shocks, LMA, IV access, vasopressors.',
    medicationsGiven: 'Epinephrine 1mg IV x3, Amiodarone 300mg IV',
    ivAccess: '18G right EJ',
    oxygenTherapy: 'LMA BVM 15L/min',
    immobilization: 'Scoop stretcher',
    patientDisposition: 'Transported',
    hospitalName: 'Pasay General Hospital',
    receivingProvider: 'Dr. Antonio Cruz, ER',
    transportMode: 'Ambulance',
    departureTime: '23:35',
    arrivalAtFacility: '23:55',
    turnoverNotes: 'Prolonged downtime ~12min prior to arrival. ROSC with pressors. Poor prognosis discussed with family.',
    clinicalNarrative: 'Elderly female in prolonged cardiac arrest. Aggressive resuscitation with ROSC achieved. Persistent hemodynamic instability requiring vasopressors. Transported with continuous BVM.',
    dispatchMin: 1.6,
    onSceneMin: 5.5,
    handoffMin: 19.8,
    responderId: 'RESP-001',
  },
];

const DATE_RANGES = [
  { id: '3d',  label: '3 Days'  },
  { id: '7d',  label: '7 Days'  },
  { id: '14d', label: '14 Days' },
  { id: 'all', label: 'All'     },
];

const CALL_TYPES = ['All Types', 'Cardiac Arrest', 'Respiratory Distress', 'Trauma / Fall', 'Hypoglycemic Episode', 'Vehicular Accident', 'Obstetric Emergency'];

// ─── Severity badge ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }) {
  const meta = SEVERITY_META[severity];
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
      style={{ color: meta.color, background: meta.bg, borderColor: `${meta.color}40` }}
    >
      {meta.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: meta.color }} />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
        </span>
      )}
      SEV-{severity}
    </span>
  );
}

// ─── Incident history card ────────────────────────────────────────────────────
function HistoryCard({ record, defaultOpen = false }) {
  const [expanded, setExpanded]   = useState(defaultOpen);
  const [exporting, setExporting] = useState(false);

  const meta = SEVERITY_META[record.severity];

  const handleExport = async () => {
    setExporting(true);
    // Small delay for UX feedback
    await new Promise(r => setTimeout(r, 300));
    try {
      generateHandoverPDF(record);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-200"
      style={{
        borderColor: expanded ? `${meta.color}40` : 'rgba(255,255,255,0.07)',
        background: expanded ? `linear-gradient(135deg, #171717, #1a1a1a)` : '#161616',
        boxShadow: expanded ? `0 0 20px ${meta.color}10` : 'none',
      }}
    >
      {/* Card header — always visible */}
      <button
        className="w-full text-left px-4 py-3.5 flex items-start gap-3"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        {/* Left accent line */}
        <div
          className="w-0.5 self-stretch rounded-full flex-shrink-0 mt-0.5"
          style={{ background: meta.color, opacity: 0.7 }}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold text-[#b8c4ff]">{record.id}</span>
              <SeverityBadge severity={record.severity} />
            </div>
            <div className="flex items-center gap-1.5 text-[#444653]">
              <Clock size={10} />
              <span className="text-[10px] font-mono">{record.date} {record.time}</span>
            </div>
          </div>

          <p className="text-sm font-semibold text-[#e5e2e1] mt-1">{record.type}</p>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-[10px] font-mono text-[#8e909f]">{record.patientName}</span>
            <span className="text-[10px] font-mono text-[#444653]">·</span>
            <span className="text-[10px] font-mono text-[#8e909f]">{record.incidentLocation}</span>
          </div>
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0 mt-1 text-[#444653]">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/[0.06]">

          {/* Quick vitals row */}
          <div className="grid grid-cols-3 gap-2 pt-3">
            {[
              { label: 'Dispatch', value: `${record.dispatchMin.toFixed(1)}m`, color: '#1e3fae' },
              { label: 'On-Scene', value: `${record.onSceneMin.toFixed(1)}m`,  color: '#fb8c00' },
              { label: 'Handoff',  value: record.handoffMin > 0 ? `${record.handoffMin.toFixed(1)}m` : '—', color: '#43a047' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-lg p-2 text-center"
                style={{ background: `${color}12`, border: `1px solid ${color}25` }}
              >
                <p className="text-[9px] font-mono text-[#8e909f] uppercase tracking-wider">{label}</p>
                <p className="text-sm font-bold font-mono mt-0.5" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Patient + incident summary */}
          <div className="space-y-1.5">
            {[
              { label: 'Patient',    value: `${record.patientName}, ${record.patientAge}y ${record.patientSex}` },
              { label: 'Complaint',  value: record.chiefComplaint },
              { label: 'Location',   value: record.incidentLocation },
              { label: 'Unit',       value: record.unitCallSign },
              { label: 'Outcome',    value: record.responseOutcome },
              { label: 'Hospital',   value: record.hospitalName },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-2">
                <span className="text-[10px] font-mono text-[#444653] w-20 flex-shrink-0 pt-0.5">{label}</span>
                <span className="text-[11px] text-[#c5c5d5] leading-relaxed">{value}</span>
              </div>
            ))}
          </div>

          {/* Clinical narrative */}
          {record.clinicalNarrative && (
            <div className="bg-[#0e0e0e] rounded-lg p-3 border border-white/[0.05]">
              <p className="text-[9px] font-mono text-[#444653] uppercase tracking-widest mb-1.5">Clinical Narrative</p>
              <p className="text-[11px] text-[#8e909f] leading-relaxed">{record.clinicalNarrative}</p>
            </div>
          )}

          {/* Export button */}
          <Button
            id={`btn-export-pdf-${record.id}`}
            variant="secondary"
            size="sm"
            fullWidth
            loading={exporting}
            leftIcon={<Download size={13} />}
            onClick={handleExport}
            className="mt-1"
          >
            {exporting ? 'Generating PDF…' : 'Export Handover PDF'}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ResponseHistoryPage() {
  const navigate = useNavigate();

  const sessionRaw = localStorage.getItem('respondaCare_session');
  const session    = sessionRaw ? JSON.parse(sessionRaw) : null;

  const [dateRange,  setDateRange]  = useState('7d');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [search,     setSearch]     = useState('');

  const handleLogout = () => {
    localStorage.removeItem('respondaCare_session');
    navigate('/login');
  };

  // ── Filter logic ────────────────────────────────────────────────────────────
  const now    = new Date('2026-05-28');
  const cutoff = { '3d': 3, '7d': 7, '14d': 14, 'all': 9999 }[dateRange];

  const filtered = useMemo(() => {
    return MOCK_HISTORY
      .filter(r => {
        const daysAgo   = (now - new Date(r.date)) / 86400000;
        const inRange   = daysAgo <= cutoff;
        const matchType = typeFilter === 'All Types' || r.type === typeFilter;
        const matchSearch =
          search === '' ||
          r.id.toLowerCase().includes(search.toLowerCase()) ||
          r.type.toLowerCase().includes(search.toLowerCase()) ||
          r.patientName.toLowerCase().includes(search.toLowerCase());
        return inRange && matchType && matchSearch;
      })
      .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
  }, [dateRange, typeFilter, search]);

  const resolvedCount  = filtered.length;
  const criticalCount  = filtered.filter(r => r.severity === 5).length;

  return (
    <div className="min-h-screen bg-[#090909] text-[#e5e2e1] font-['Hanken_Grotesk',sans-serif] flex justify-center">
      <div className="w-full max-w-md bg-[#111111] border-x border-white/10 min-h-screen flex flex-col shadow-2xl overflow-x-hidden">

        {/* ── Header ── */}
        <header className="px-4 py-3 bg-[#0e0e0e] border-b border-white/[0.07] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="text-[#8e909f] hover:text-[#e5e2e1] transition-colors p-1"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="font-bold text-sm tracking-wide block">RespondaCare</span>
              <span className="text-[9px] font-mono text-[#8e909f] tracking-widest uppercase block mt-0.5">
                RESPONSE HISTORY LEDGER
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

        {/* ── Scrollable content ── */}
        <main className="flex-1 overflow-y-auto pb-20">

          {/* Page title + mini KPI strip */}
          <div className="px-4 pt-4 pb-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-[#1e3fae]/20 border border-[#1e3fae]/40 flex items-center justify-center flex-shrink-0">
                <History size={15} className="text-[#b8c4ff]" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#e5e2e1]">Response History</h1>
                <p className="text-[10px] font-mono text-[#8e909f]">
                  {session?.name || 'Responder'} · {session?.unitCallSign || 'ALPHA-04'}
                </p>
              </div>
            </div>

            {/* KPI bar */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: FileText,      label: 'Resolved',  value: resolvedCount, color: '#43a047' },
                { icon: AlertTriangle, label: 'Critical',  value: criticalCount, color: '#e53935' },
                { icon: CheckCircle2,  label: 'Rate',
                  value: resolvedCount > 0 ? '100%' : '—',
                  color: '#b8c4ff' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="rounded-lg p-2.5 text-center"
                  style={{ background: `${color}10`, border: `1px solid ${color}25` }}
                >
                  <Icon size={13} style={{ color }} className="mx-auto mb-1" />
                  <p className="text-base font-bold font-mono" style={{ color }}>{value}</p>
                  <p className="text-[9px] font-mono text-[#444653] uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Filter controls ── */}
          <div className="px-4 py-3 space-y-2.5 border-b border-white/[0.05]">

            {/* Search */}
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444653]" />
              <input
                id="history-search"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ID, type, patient…"
                className="w-full bg-[#0e0e0e] border border-[#444653] focus:border-[#1e3fae] rounded-lg pl-8 pr-3 py-2 text-xs text-[#e5e2e1] placeholder-[#444653] outline-none transition-colors"
              />
            </div>

            {/* Date range pills */}
            <div className="flex gap-1.5">
              <Calendar size={12} className="text-[#444653] flex-shrink-0 mt-1.5" />
              <div className="flex gap-1 flex-wrap">
                {DATE_RANGES.map(({ id, label }) => (
                  <button
                    key={id}
                    id={`history-date-${id}`}
                    onClick={() => setDateRange(id)}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                      dateRange === id
                        ? 'bg-[#1e3fae] border-[#1e3fae] text-white shadow-[0_0_8px_rgba(30,63,174,0.35)]'
                        : 'border-[#444653] text-[#8e909f] hover:text-[#e5e2e1] hover:border-[#8e909f]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Call type filter */}
            <div className="relative">
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444653]" />
              <select
                id="history-type-filter"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full bg-[#0e0e0e] border border-[#444653] rounded-lg pl-8 pr-3 py-2 text-xs text-[#e5e2e1] outline-none appearance-none focus:border-[#1e3fae] transition-colors"
              >
                {CALL_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {(search || typeFilter !== 'All Types') && (
              <button
                className="text-[10px] font-mono text-[#8e909f] hover:text-[#b8c4ff] transition-colors"
                onClick={() => { setSearch(''); setTypeFilter('All Types'); }}
              >
                ✕ Clear filters
              </button>
            )}
          </div>

          {/* ── Incident cards ── */}
          <div className="px-4 py-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Zap size={28} className="mx-auto text-[#444653]" />
                <p className="text-sm text-[#444653] font-mono">No resolved incidents found</p>
                <p className="text-[10px] text-[#333] font-mono">Try adjusting your date range or filters</p>
              </div>
            ) : (
              <>
                <p className="text-[10px] font-mono text-[#444653] mb-2">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''} · sorted newest first
                </p>
                {filtered.map((record, i) => (
                  <HistoryCard key={record.id} record={record} defaultOpen={i === 0} />
                ))}
              </>
            )}
          </div>

          {/* RA 10173 compliance footer */}
          <div className="px-4 pb-4 pt-2">
            <div className="flex items-center justify-center gap-1.5 text-[#ffb4ab] text-[10px] font-mono">
              <ShieldAlert size={11} />
              <span>NPC RA 10173 — EXPORTED PDFs ARE CONFIDENTIAL RECORDS</span>
            </div>
            <p className="text-[9px] text-[#333] text-center mt-1">
              Unauthorized sharing of handover documents is punishable under Philippine Law.
            </p>
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
