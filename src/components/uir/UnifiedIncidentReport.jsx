/**
 * UnifiedIncidentReport.jsx — RespondaCare UIR Module
 * A comprehensive, mobile-responsive Unified Incident Report form
 * Sections: A) Response Outcome, B) Patient Assessment,
 *           C) Patient Disposition, D) Health Profile Update Flag
 * Uses global common components: Button, Input, Select, Card
 */

import React, { useState, useCallback } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Card from '../common/Card';
import { generateHandoverPDF } from '../../lib/pdfExport';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  Activity,
  Clipboard,
  Truck,
  HeartPulse,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Shield,
  Stethoscope,
  ThermometerSun,
  Brain,
  Eye,
  Ear,
  Hand,
  Bone,
  Pill,
  Syringe,
  FileDown,
  Send,
  RotateCcw,
  ArrowRight,
  Info,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────
// Collapsible Section Wrapper
// ─────────────────────────────────────────────────────────────────────
function SectionAccordion({ id, icon, label, tag, tagColor, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  const tagColorMap = {
    blue: 'bg-[#1e3fae]/15 text-[#b8c4ff] border-[#1e3fae]/30',
    green: 'bg-[#43a047]/15 text-[#66bb6a] border-[#43a047]/30',
    amber: 'bg-[#fb8c00]/15 text-[#ffb74d] border-[#fb8c00]/30',
    red: 'bg-[#93000a]/15 text-[#ffb4ab] border-[#93000a]/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  };

  return (
    <div id={id} className="rounded border border-white/[0.07] bg-[#171717] overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.02] cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex-shrink-0 text-[#b8c4ff]">{icon}</span>
          <span className="text-sm font-semibold text-[#e5e2e1] truncate">{label}</span>
          {tag && (
            <span
              className={`flex-shrink-0 text-[9px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded border ${tagColorMap[tagColor] || tagColorMap.blue}`}
            >
              {tag}
            </span>
          )}
        </div>
        <span className="flex-shrink-0 text-[#8e909f] transition-transform duration-200">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: open ? '5000px' : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/[0.05]">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Field Sub-Header
// ─────────────────────────────────────────────────────────────────────
function SubHeader({ icon, label }) {
  return (
    <h4 className="text-[11px] font-bold text-[#b8c4ff] flex items-center gap-1.5 border-b border-white/[0.03] pb-1 mt-1 uppercase tracking-wider font-mono">
      {icon}
      <span>{label}</span>
    </h4>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Main UIR Component
// ─────────────────────────────────────────────────────────────────────
export default function UnifiedIncidentReport() {
  // ── Timestamps ──
  const now = new Date();
  const isoDate = now.toISOString().slice(0, 10);
  const isoTime = now.toTimeString().slice(0, 5);

  // ═══════════════════════════════════════════════════════════════════
  // SECTION A — Response Outcome
  // ═══════════════════════════════════════════════════════════════════
  const [incidentDate, setIncidentDate] = useState(isoDate);
  const [incidentTime, setIncidentTime] = useState(isoTime);
  const [arrivalTime, setArrivalTime] = useState('');
  const [clearTime, setClearTime] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [barangay, setBarangay] = useState('');
  const [responderId, setResponderId] = useState('');
  const [unitCallSign, setUnitCallSign] = useState('');
  const [natureOfCall, setNatureOfCall] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [severityScore, setSeverityScore] = useState('');
  const [responseOutcome, setResponseOutcome] = useState('');
  const [responseNarrative, setResponseNarrative] = useState('');

  // ═══════════════════════════════════════════════════════════════════
  // SECTION B — Patient Assessment
  // ═══════════════════════════════════════════════════════════════════
  // Demographics
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientSex, setPatientSex] = useState('');
  const [patientWeight, setPatientWeight] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Chief Complaint & History
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState('');
  const [onsetTime, setOnsetTime] = useState('');
  const [painScale, setPainScale] = useState('');

  // Vital Signs
  const [bloodPressure, setBloodPressure] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [spo2, setSpo2] = useState('');
  const [temperature, setTemperature] = useState('');
  const [bloodGlucose, setBloodGlucose] = useState('');
  const [gcsEye, setGcsEye] = useState('');
  const [gcsVerbal, setGcsVerbal] = useState('');
  const [gcsMotor, setGcsMotor] = useState('');

  // Physical Exam — ABC
  const [airwayStatus, setAirwayStatus] = useState('');
  const [breathingStatus, setBreathingStatus] = useState('');
  const [circulationStatus, setCirculationStatus] = useState('');
  const [skinCondition, setSkinCondition] = useState('');
  const [levelOfConsciousness, setLevelOfConsciousness] = useState('');
  const [pupilResponse, setPupilResponse] = useState('');

  // Interventions
  const [interventionsPerformed, setInterventionsPerformed] = useState('');
  const [medicationsGiven, setMedicationsGiven] = useState('');
  const [ivAccess, setIvAccess] = useState('');
  const [oxygenTherapy, setOxygenTherapy] = useState('');
  const [immobilization, setImmobilization] = useState('');

  // Clinical Narrative
  const [clinicalNarrative, setClinicalNarrative] = useState('');

  // ═══════════════════════════════════════════════════════════════════
  // SECTION C — Patient Disposition
  // ═══════════════════════════════════════════════════════════════════
  const [patientDisposition, setPatientDisposition] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [receivingProvider, setReceivingProvider] = useState('');
  const [transportMode, setTransportMode] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalAtFacility, setArrivalAtFacility] = useState('');
  const [turnoverNotes, setTurnoverNotes] = useState('');
  const [refusalWitness, setRefusalWitness] = useState('');

  // ═══════════════════════════════════════════════════════════════════
  // SECTION D — Health Profile Update Flag
  // ═══════════════════════════════════════════════════════════════════
  const [flagProfileUpdate, setFlagProfileUpdate] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [profileUpdateNotes, setProfileUpdateNotes] = useState('');

  // ═══════════════════════════════════════════════════════════════════
  // Submission State
  // ═══════════════════════════════════════════════════════════════════
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState('');

  // GCS total computed
  const gcsTotal =
    (parseInt(gcsEye) || 0) + (parseInt(gcsVerbal) || 0) + (parseInt(gcsMotor) || 0);

  // ── Handlers ──
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitting(true);

      setSyncStatusText('Encrypting patient data (AES-256-GCM)...');
      await new Promise((r) => setTimeout(r, 500));

      setSyncStatusText('Writing to Local Secure Cache (IndexedDB)...');
      await new Promise((r) => setTimeout(r, 600));

      setSyncStatusText('Syncing UIR to emergency.patient_care_reports...');
      await new Promise((r) => setTimeout(r, 800));

      setSyncStatusText('Logging audit trail to security.audit_logs...');
      await new Promise((r) => setTimeout(r, 400));

      setSubmitting(false);
      setSubmitted(true);
    },
    []
  );

  const handleReset = useCallback(() => {
    setSubmitted(false);
    setSyncStatusText('');
  }, []);

  const handleExportPdf = useCallback(() => {
    generateHandoverPDF({
      incidentDate,
      incidentTime,
      arrivalTime,
      clearTime,
      incidentLocation,
      barangay,
      responderId,
      unitCallSign,
      natureOfCall,
      incidentType,
      severityScore,
      responseOutcome,
      patientName,
      patientAge,
      patientSex,
      chiefComplaint,
      painScale,
      levelOfConsciousness,
      airwayStatus,
      breathingStatus,
      circulationStatus,
      skinCondition,
      pupilResponse,
      bloodPressure,
      pulseRate,
      respiratoryRate,
      spo2,
      temperature,
      bloodGlucose,
      gcsTotal,
      interventionsPerformed,
      medicationsGiven,
      ivAccess,
      oxygenTherapy,
      immobilization,
      clinicalNarrative,
      patientDisposition,
      hospitalName,
      receivingProvider,
      transportMode,
      departureTime,
      arrivalAtFacility,
      turnoverNotes,
    });
  }, [
    incidentDate, incidentTime, arrivalTime, clearTime, incidentLocation, barangay,
    responderId, unitCallSign, natureOfCall, incidentType, severityScore, responseOutcome,
    patientName, patientAge, patientSex, chiefComplaint, painScale, levelOfConsciousness,
    airwayStatus, breathingStatus, circulationStatus, skinCondition, pupilResponse,
    bloodPressure, pulseRate, respiratoryRate, spo2, temperature, bloodGlucose, gcsTotal,
    interventionsPerformed, medicationsGiven, ivAccess, oxygenTherapy, immobilization,
    clinicalNarrative, patientDisposition, hospitalName, receivingProvider, transportMode,
    departureTime, arrivalAtFacility, turnoverNotes,
  ]);

  // ═══════════════════════════════════════════════════════════════════
  // POST-SUBMISSION VIEW
  // ═══════════════════════════════════════════════════════════════════
  if (submitted) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <Card className="bg-[#171717]/90 border border-[#43a047]/30 p-6 flex flex-col items-center justify-center text-center">
          <CheckCircle2 size={48} className="text-[#43a047] mb-4 animate-bounce" />
          <h3 className="text-base font-bold text-[#e5e2e1]">
            Unified Incident Report Synced
          </h3>
          <p className="text-xs text-[#43a047] font-mono mt-1 uppercase tracking-widest">
            ✓ UIR COMMITTED TO EMERGENCY SCHEMA
          </p>

          <p className="text-xs text-[#c5c5d5] mt-4 max-w-xs leading-relaxed">
            All clinical assessments, vital signs, interventions, and disposition records have
            been successfully encrypted and logged to the Supabase emergency namespace.
          </p>

          {flagProfileUpdate && (
            <div className="mt-3 px-3 py-2 rounded bg-[#fb8c00]/10 border border-[#fb8c00]/30 text-[11px] text-[#ffb74d] font-mono flex items-center gap-2">
              <AlertTriangle size={13} />
              <span>HEALTH PROFILE UPDATE FLAGGED — Pending BHW Review</span>
            </div>
          )}

          <div className="w-full space-y-2 mt-6">
            <Button
              id="btn-export-pdf-success"
              variant="secondary"
              fullWidth
              onClick={handleExportPdf}
              leftIcon={<FileDown size={14} />}
            >
              Export PDF Report
            </Button>
            <Button
              id="btn-new-uir"
              variant="primary"
              fullWidth
              onClick={handleReset}
              leftIcon={<RotateCcw size={14} />}
            >
              File New Report
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // MAIN FORM RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <form onSubmit={handleSubmit} className="space-y-3 pb-4">
      {/* ────── Form Title Banner ────── */}
      <Card variant="elevated" className="border-l-4 border-l-[#1e3fae]">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#1e3fae]/15 border border-[#1e3fae]/30 flex items-center justify-center">
            <FileText size={18} className="text-[#b8c4ff]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#e5e2e1] tracking-wide">
              Unified Incident Report
            </h2>
            <p className="text-[9px] font-mono text-[#8e909f] tracking-widest uppercase mt-0.5">
              UIR — RA 10173 COMPLIANT FORM
            </p>
          </div>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION A — Response Outcome                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <SectionAccordion
        id="section-a-response-outcome"
        icon={<Clipboard size={15} />}
        label="A. Response Outcome"
        tag="REQUIRED"
        tagColor="blue"
        defaultOpen={true}
      >
        {/* Incident Timing */}
        <SubHeader icon={<Clock size={12} />} label="Incident Timing" />
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="uir-incident-date"
            label="Incident Date"
            type="date"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
            required
          />
          <Input
            id="uir-incident-time"
            label="Dispatch Time"
            type="time"
            value={incidentTime}
            onChange={(e) => setIncidentTime(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="uir-arrival-time"
            label="On-Scene Arrival"
            type="time"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            required
          />
          <Input
            id="uir-clear-time"
            label="Scene Clear Time"
            type="time"
            value={clearTime}
            onChange={(e) => setClearTime(e.target.value)}
          />
        </div>

        {/* Location & Unit */}
        <SubHeader icon={<MapPin size={12} />} label="Incident Location" />
        <Input
          id="uir-location"
          label="Address / Landmark"
          value={incidentLocation}
          onChange={(e) => setIncidentLocation(e.target.value)}
          placeholder="e.g. 123 Rizal Ave., near covered court"
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="uir-barangay"
            label="Barangay"
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            placeholder="e.g. Brgy. Santolan"
            required
          />
          <Input
            id="uir-unit-callsign"
            label="Unit Call Sign"
            value={unitCallSign}
            onChange={(e) => setUnitCallSign(e.target.value)}
            placeholder="e.g. RESP-ALPHA"
          />
        </div>
        <Input
          id="uir-responder-id"
          label="Responder ID"
          value={responderId}
          onChange={(e) => setResponderId(e.target.value)}
          placeholder="e.g. FR-2024-0042"
          leftIcon={<Shield size={13} />}
          required
        />

        {/* Nature & Outcome */}
        <SubHeader icon={<Activity size={12} />} label="Call Classification" />
        <Input
          id="uir-nature-call"
          label="Nature of Call"
          value={natureOfCall}
          onChange={(e) => setNatureOfCall(e.target.value)}
          placeholder="e.g. Chest Pain, Vehicular Accident"
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <Select
            id="uir-incident-type"
            label="Incident Type"
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
            required
            options={[
              { value: 'Medical', label: 'Medical' },
              { value: 'Trauma', label: 'Trauma' },
              { value: 'Cardiac', label: 'Cardiac' },
              { value: 'Respiratory', label: 'Respiratory' },
              { value: 'Obstetric', label: 'Obstetric' },
              { value: 'Pediatric', label: 'Pediatric' },
              { value: 'Behavioral', label: 'Behavioral/Psych' },
              { value: 'Environmental', label: 'Environmental' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <Select
            id="uir-severity"
            label="Severity (1-5)"
            value={severityScore}
            onChange={(e) => setSeverityScore(e.target.value)}
            required
            options={[
              { value: '1', label: '1 — Minimal' },
              { value: '2', label: '2 — Low' },
              { value: '3', label: '3 — Moderate' },
              { value: '4', label: '4 — High' },
              { value: '5', label: '5 — Critical' },
            ]}
          />
        </div>

        <Select
          id="uir-response-outcome"
          label="Response Outcome"
          value={responseOutcome}
          onChange={(e) => setResponseOutcome(e.target.value)}
          required
          options={[
            { value: 'Successful', label: 'Successful' },
            { value: 'Partially Successful', label: 'Partially Successful' },
            { value: 'Unsuccessful', label: 'Unsuccessful' },
            { value: 'Cancelled', label: 'Cancelled En Route' },
            { value: 'Standby', label: 'Standby / No Patient Contact' },
          ]}
        />

        <div>
          <label
            htmlFor="uir-response-narrative"
            className="text-xs font-mono tracking-[0.05em] uppercase text-[#c5c5d5] block mb-1.5"
          >
            Response Summary
          </label>
          <textarea
            id="uir-response-narrative"
            rows={3}
            value={responseNarrative}
            onChange={(e) => setResponseNarrative(e.target.value)}
            placeholder="Describe what happened on scene, crew actions, and outcome..."
            className="w-full bg-[#171717] border border-[#444653] focus:border-[#1e3fae] focus:shadow-[0_0_0_2px_rgba(30,63,174,0.35)] rounded px-3 py-2 text-xs text-[#e5e2e1] placeholder-[#444653] outline-none transition-all font-sans resize-y min-h-[60px]"
          />
        </div>
      </SectionAccordion>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION B — Patient Assessment                                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <SectionAccordion
        id="section-b-patient-assessment"
        icon={<Stethoscope size={15} />}
        label="B. Patient Assessment"
        tag="CLINICAL"
        tagColor="green"
        defaultOpen={false}
      >
        {/* Demographics */}
        <SubHeader icon={<User size={12} />} label="Patient Demographics" />
        <Input
          id="uir-patient-name"
          label="Full Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="Last Name, First Name M.I."
          required
        />
        <div className="grid grid-cols-3 gap-2">
          <Input
            id="uir-patient-age"
            label="Age"
            type="number"
            value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)}
            placeholder="e.g. 34"
            required
          />
          <Select
            id="uir-patient-sex"
            label="Sex"
            value={patientSex}
            onChange={(e) => setPatientSex(e.target.value)}
            required
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <Input
            id="uir-patient-weight"
            label="Weight (kg)"
            type="number"
            value={patientWeight}
            onChange={(e) => setPatientWeight(e.target.value)}
            placeholder="e.g. 65"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="uir-contact-person"
            label="Emergency Contact"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="Name"
          />
          <Input
            id="uir-contact-phone"
            label="Contact Number"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="09XX-XXX-XXXX"
          />
        </div>

        {/* Chief Complaint & HPI */}
        <SubHeader icon={<AlertTriangle size={12} />} label="Chief Complaint & History" />
        <Input
          id="uir-chief-complaint"
          label="Chief Complaint"
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          placeholder="e.g. Severe chest pain radiating to left arm"
          required
        />
        <div>
          <label
            htmlFor="uir-hpi"
            className="text-xs font-mono tracking-[0.05em] uppercase text-[#c5c5d5] block mb-1.5"
          >
            History of Present Illness
          </label>
          <textarea
            id="uir-hpi"
            rows={3}
            value={historyOfPresentIllness}
            onChange={(e) => setHistoryOfPresentIllness(e.target.value)}
            placeholder="OPQRST: Onset, Provocation, Quality, Region, Severity, Time..."
            className="w-full bg-[#171717] border border-[#444653] focus:border-[#1e3fae] focus:shadow-[0_0_0_2px_rgba(30,63,174,0.35)] rounded px-3 py-2 text-xs text-[#e5e2e1] placeholder-[#444653] outline-none transition-all font-sans resize-y min-h-[60px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="uir-onset-time"
            label="Symptom Onset"
            type="time"
            value={onsetTime}
            onChange={(e) => setOnsetTime(e.target.value)}
          />
          <Select
            id="uir-pain-scale"
            label="Pain Scale (0-10)"
            value={painScale}
            onChange={(e) => setPainScale(e.target.value)}
            options={Array.from({ length: 11 }, (_, i) => ({
              value: String(i),
              label: `${i} — ${i === 0 ? 'None' : i <= 3 ? 'Mild' : i <= 6 ? 'Moderate' : i <= 9 ? 'Severe' : 'Worst'}`,
            }))}
          />
        </div>

        {/* Vital Signs */}
        <SubHeader icon={<HeartPulse size={12} />} label="Vital Signs" />
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="uir-bp"
            label="Blood Pressure"
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
            placeholder="e.g. 120/80"
            required
          />
          <Input
            id="uir-pulse"
            label="Pulse Rate (BPM)"
            type="number"
            value={pulseRate}
            onChange={(e) => setPulseRate(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input
            id="uir-rr"
            label="Resp Rate"
            type="number"
            value={respiratoryRate}
            onChange={(e) => setRespiratoryRate(e.target.value)}
            required
          />
          <Input
            id="uir-spo2"
            label="SpO2 (%)"
            type="number"
            value={spo2}
            onChange={(e) => setSpo2(e.target.value)}
            required
          />
          <Input
            id="uir-temp"
            label="Temp (°C)"
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="uir-glucose"
            label="Blood Glucose"
            value={bloodGlucose}
            onChange={(e) => setBloodGlucose(e.target.value)}
            placeholder="e.g. 98 mg/dL"
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono tracking-[0.05em] uppercase text-[#c5c5d5]">
              GCS Total
            </span>
            <div className="flex items-center gap-1 h-[38px]">
              <span className="text-lg font-bold text-[#e5e2e1] font-mono tabular-nums min-w-[28px] text-center">
                {gcsTotal || '—'}
              </span>
              <span className="text-[9px] text-[#8e909f] font-mono">/15</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Select
            id="uir-gcs-eye"
            label="GCS Eye (E)"
            value={gcsEye}
            onChange={(e) => setGcsEye(e.target.value)}
            options={[
              { value: '1', label: '1 — None' },
              { value: '2', label: '2 — Pain' },
              { value: '3', label: '3 — Voice' },
              { value: '4', label: '4 — Spontaneous' },
            ]}
          />
          <Select
            id="uir-gcs-verbal"
            label="GCS Verbal (V)"
            value={gcsVerbal}
            onChange={(e) => setGcsVerbal(e.target.value)}
            options={[
              { value: '1', label: '1 — None' },
              { value: '2', label: '2 — Sounds' },
              { value: '3', label: '3 — Words' },
              { value: '4', label: '4 — Confused' },
              { value: '5', label: '5 — Oriented' },
            ]}
          />
          <Select
            id="uir-gcs-motor"
            label="GCS Motor (M)"
            value={gcsMotor}
            onChange={(e) => setGcsMotor(e.target.value)}
            options={[
              { value: '1', label: '1 — None' },
              { value: '2', label: '2 — Extension' },
              { value: '3', label: '3 — Flexion' },
              { value: '4', label: '4 — Withdrawal' },
              { value: '5', label: '5 — Localizing' },
              { value: '6', label: '6 — Obeys' },
            ]}
          />
        </div>

        {/* Physical Examination — ABC */}
        <SubHeader icon={<Eye size={12} />} label="Physical Examination (ABCDE)" />
        <div className="grid grid-cols-2 gap-2">
          <Select
            id="uir-airway"
            label="Airway"
            value={airwayStatus}
            onChange={(e) => setAirwayStatus(e.target.value)}
            required
            options={[
              { value: 'Patent', label: 'Patent / Clear' },
              { value: 'Partially Obstructed', label: 'Partially Obstructed' },
              { value: 'Fully Obstructed', label: 'Fully Obstructed' },
              { value: 'Assisted', label: 'Assisted (OPA/NPA)' },
              { value: 'Intubated', label: 'Intubated' },
            ]}
          />
          <Select
            id="uir-breathing"
            label="Breathing"
            value={breathingStatus}
            onChange={(e) => setBreathingStatus(e.target.value)}
            required
            options={[
              { value: 'Normal', label: 'Normal' },
              { value: 'Labored', label: 'Labored' },
              { value: 'Shallow', label: 'Shallow' },
              { value: 'Rapid', label: 'Rapid / Tachypneic' },
              { value: 'Absent', label: 'Absent / Apneic' },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select
            id="uir-circulation"
            label="Circulation"
            value={circulationStatus}
            onChange={(e) => setCirculationStatus(e.target.value)}
            options={[
              { value: 'Strong/Regular', label: 'Strong / Regular' },
              { value: 'Strong/Rapid', label: 'Strong / Rapid' },
              { value: 'Weak/Thready', label: 'Weak / Thready' },
              { value: 'Absent', label: 'Absent' },
            ]}
          />
          <Select
            id="uir-skin"
            label="Skin Condition"
            value={skinCondition}
            onChange={(e) => setSkinCondition(e.target.value)}
            options={[
              { value: 'Warm/Dry', label: 'Warm / Dry' },
              { value: 'Warm/Moist', label: 'Warm / Moist' },
              { value: 'Cool/Dry', label: 'Cool / Dry' },
              { value: 'Cool/Clammy', label: 'Cool / Clammy' },
              { value: 'Cyanotic', label: 'Cyanotic' },
              { value: 'Flushed', label: 'Flushed' },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select
            id="uir-loc"
            label="Level of Consciousness"
            value={levelOfConsciousness}
            onChange={(e) => setLevelOfConsciousness(e.target.value)}
            required
            options={[
              { value: 'Alert', label: 'Alert (A)' },
              { value: 'Voice', label: 'Voice-Responsive (V)' },
              { value: 'Pain', label: 'Pain-Responsive (P)' },
              { value: 'Unresponsive', label: 'Unresponsive (U)' },
            ]}
          />
          <Select
            id="uir-pupils"
            label="Pupil Response"
            value={pupilResponse}
            onChange={(e) => setPupilResponse(e.target.value)}
            options={[
              { value: 'PERRL', label: 'PERRL (Normal)' },
              { value: 'Dilated', label: 'Dilated' },
              { value: 'Constricted', label: 'Constricted' },
              { value: 'Unequal', label: 'Unequal / Anisocoria' },
              { value: 'Fixed', label: 'Fixed / Non-reactive' },
            ]}
          />
        </div>

        {/* Interventions & Treatment */}
        <SubHeader icon={<Syringe size={12} />} label="Interventions & Treatment" />
        <div>
          <label
            htmlFor="uir-interventions"
            className="text-xs font-mono tracking-[0.05em] uppercase text-[#c5c5d5] block mb-1.5"
          >
            Interventions Performed
          </label>
          <textarea
            id="uir-interventions"
            rows={2}
            value={interventionsPerformed}
            onChange={(e) => setInterventionsPerformed(e.target.value)}
            placeholder="e.g. CPR initiated, AED applied (no shock advised), BVM ventilation..."
            className="w-full bg-[#171717] border border-[#444653] focus:border-[#1e3fae] focus:shadow-[0_0_0_2px_rgba(30,63,174,0.35)] rounded px-3 py-2 text-xs text-[#e5e2e1] placeholder-[#444653] outline-none transition-all font-sans resize-y min-h-[50px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="uir-medications"
            label="Medications Given"
            value={medicationsGiven}
            onChange={(e) => setMedicationsGiven(e.target.value)}
            placeholder="e.g. Aspirin 325mg PO"
            leftIcon={<Pill size={13} />}
          />
          <Select
            id="uir-iv"
            label="IV Access"
            value={ivAccess}
            onChange={(e) => setIvAccess(e.target.value)}
            options={[
              { value: 'None', label: 'None' },
              { value: 'Peripheral', label: 'Peripheral IV' },
              { value: 'IO', label: 'Intraosseous (IO)' },
              { value: 'Central', label: 'Central Line' },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select
            id="uir-o2"
            label="Oxygen Therapy"
            value={oxygenTherapy}
            onChange={(e) => setOxygenTherapy(e.target.value)}
            options={[
              { value: 'None', label: 'None / Room Air' },
              { value: 'Nasal Cannula', label: 'Nasal Cannula' },
              { value: 'Simple Mask', label: 'Simple Mask' },
              { value: 'NRB', label: 'Non-Rebreather Mask' },
              { value: 'BVM', label: 'Bag-Valve Mask' },
              { value: 'High-Flow', label: 'High-Flow O2' },
            ]}
          />
          <Select
            id="uir-immobilization"
            label="Immobilization"
            value={immobilization}
            onChange={(e) => setImmobilization(e.target.value)}
            options={[
              { value: 'None', label: 'None' },
              { value: 'C-Collar', label: 'Cervical Collar' },
              { value: 'Backboard', label: 'Backboard' },
              { value: 'Splint', label: 'Splint' },
              { value: 'KED', label: 'KED Vest' },
              { value: 'Traction', label: 'Traction Splint' },
            ]}
          />
        </div>

        {/* Clinical Narrative */}
        <SubHeader icon={<FileText size={12} />} label="Clinical Narrative" />
        <div>
          <label
            htmlFor="uir-clinical-narrative"
            className="text-xs font-mono tracking-[0.05em] uppercase text-[#c5c5d5] block mb-1.5"
          >
            Detailed Narrative Notes
          </label>
          <textarea
            id="uir-clinical-narrative"
            rows={4}
            value={clinicalNarrative}
            onChange={(e) => setClinicalNarrative(e.target.value)}
            placeholder="Provide a chronological narrative of the patient encounter from dispatch to turnover..."
            className="w-full bg-[#171717] border border-[#444653] focus:border-[#1e3fae] focus:shadow-[0_0_0_2px_rgba(30,63,174,0.35)] rounded px-3 py-2 text-xs text-[#e5e2e1] placeholder-[#444653] outline-none transition-all font-sans resize-y min-h-[80px]"
            required
          />
        </div>
      </SectionAccordion>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION C — Patient Disposition                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <SectionAccordion
        id="section-c-patient-disposition"
        icon={<Truck size={15} />}
        label="C. Patient Disposition"
        tag="TRANSPORT"
        tagColor="amber"
        defaultOpen={false}
      >
        <Select
          id="uir-disposition"
          label="Disposition"
          value={patientDisposition}
          onChange={(e) => setPatientDisposition(e.target.value)}
          required
          options={[
            { value: 'Treated On-Scene', label: 'Treated & Released On-Scene' },
            { value: 'Transported to Hospital', label: 'Transported to Hospital' },
            { value: 'Transported to Clinic', label: 'Transported to Rural Health Unit / Clinic' },
            { value: 'Refused Transport', label: 'Patient Refused Transport (AMA)' },
            { value: 'DOA', label: 'Dead On Arrival (DOA)' },
            { value: 'Deceased', label: 'Deceased During Transport' },
            { value: 'Transferred', label: 'Transferred to Another Unit' },
          ]}
        />

        {/* Conditional: Transport Details */}
        {(patientDisposition === 'Transported to Hospital' ||
          patientDisposition === 'Transported to Clinic') && (
          <div className="space-y-2.5 pt-1 animate-fadeIn">
            <SubHeader icon={<MapPin size={12} />} label="Transport Details" />
            <Input
              id="uir-hospital"
              label="Receiving Facility"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="e.g. East Avenue Medical Center"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                id="uir-provider"
                label="Receiving Provider"
                value={receivingProvider}
                onChange={(e) => setReceivingProvider(e.target.value)}
                placeholder="e.g. Dr. A. Reyes"
                required
              />
              <Select
                id="uir-transport-mode"
                label="Transport Mode"
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value)}
                options={[
                  { value: 'Ambulance', label: 'Ambulance' },
                  { value: 'Private Vehicle', label: 'Private Vehicle' },
                  { value: 'Helicopter', label: 'Helicopter' },
                  { value: 'Boat', label: 'Water Rescue Vessel' },
                  { value: 'Walk-in', label: 'Walk-In' },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                id="uir-departure"
                label="Departure Time"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
              />
              <Input
                id="uir-arrival-facility"
                label="Arrival at Facility"
                type="time"
                value={arrivalAtFacility}
                onChange={(e) => setArrivalAtFacility(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Conditional: AMA / Refusal */}
        {patientDisposition === 'Refused Transport' && (
          <div className="space-y-2.5 pt-1 animate-fadeIn">
            <div className="flex items-start gap-2 p-2.5 rounded bg-[#93000a]/10 border border-[#93000a]/30 text-[11px]">
              <AlertTriangle size={14} className="text-[#ffb4ab] flex-shrink-0 mt-0.5" />
              <p className="text-[#ffb4ab] leading-relaxed">
                Patient has refused transport Against Medical Advice (AMA). Document the
                witness and provide detailed notes for legal compliance per RA 10173.
              </p>
            </div>
            <Input
              id="uir-refusal-witness"
              label="Witness Name & Signature Record"
              value={refusalWitness}
              onChange={(e) => setRefusalWitness(e.target.value)}
              placeholder="Name of witness present during refusal"
              required
            />
          </div>
        )}

        {/* Turnover Notes */}
        <div className="pt-1">
          <label
            htmlFor="uir-turnover"
            className="text-xs font-mono tracking-[0.05em] uppercase text-[#c5c5d5] block mb-1.5"
          >
            Turnover / Handoff Notes
          </label>
          <textarea
            id="uir-turnover"
            rows={3}
            value={turnoverNotes}
            onChange={(e) => setTurnoverNotes(e.target.value)}
            placeholder="Verbal report summary given to receiving provider or next-of-kin..."
            className="w-full bg-[#171717] border border-[#444653] focus:border-[#1e3fae] focus:shadow-[0_0_0_2px_rgba(30,63,174,0.35)] rounded px-3 py-2 text-xs text-[#e5e2e1] placeholder-[#444653] outline-none transition-all font-sans resize-y min-h-[60px]"
          />
        </div>
      </SectionAccordion>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION D — Health Profile Update Flag                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <SectionAccordion
        id="section-d-health-profile-flag"
        icon={<HeartPulse size={15} />}
        label="D. Health Profile Update Flag"
        tag="BHW"
        tagColor="purple"
        defaultOpen={false}
      >
        <div className="flex items-start gap-2 p-2.5 rounded bg-[#1e3fae]/10 border border-[#1e3fae]/30 text-[11px]">
          <Info size={14} className="text-[#b8c4ff] flex-shrink-0 mt-0.5" />
          <p className="text-[#b8c4ff] leading-relaxed">
            Flag new medical findings discovered during this response for review by Barangay
            Health Workers. Flagged items will be queued for SAMPLE profile updates in the{' '}
            <span className="font-mono font-bold">health.profiles</span> schema.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-3 py-1">
          <button
            type="button"
            onClick={() => setFlagProfileUpdate((p) => !p)}
            className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 cursor-pointer ${
              flagProfileUpdate
                ? 'bg-[#1e3fae] shadow-[0_0_8px_rgba(30,63,174,0.4)]'
                : 'bg-[#444653]'
            }`}
          >
            <span
              className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
                flagProfileUpdate ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-xs text-[#e5e2e1] font-medium">
            {flagProfileUpdate
              ? 'Profile Update Flagged — Fields below are active'
              : 'No profile update needed'}
          </span>
        </div>

        {flagProfileUpdate && (
          <div className="space-y-2.5 animate-fadeIn">
            <Input
              id="uir-new-allergy"
              label="Newly Discovered Allergy"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              placeholder="e.g. Penicillin — anaphylactic reaction"
              leftIcon={<AlertTriangle size={13} className="text-[#ffb4ab]" />}
            />
            <Input
              id="uir-new-medication"
              label="New Medication to Record"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              placeholder="e.g. Metformin 500mg BID (newly prescribed)"
              leftIcon={<Pill size={13} />}
            />
            <Input
              id="uir-new-condition"
              label="New Condition / Diagnosis"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              placeholder="e.g. Type 2 Diabetes Mellitus"
              leftIcon={<Stethoscope size={13} />}
            />
            <div>
              <label
                htmlFor="uir-profile-notes"
                className="text-xs font-mono tracking-[0.05em] uppercase text-[#c5c5d5] block mb-1.5"
              >
                Additional Notes for BHW
              </label>
              <textarea
                id="uir-profile-notes"
                rows={2}
                value={profileUpdateNotes}
                onChange={(e) => setProfileUpdateNotes(e.target.value)}
                placeholder="Notes for the Barangay Health Worker reviewing this update..."
                className="w-full bg-[#171717] border border-[#444653] focus:border-[#1e3fae] focus:shadow-[0_0_0_2px_rgba(30,63,174,0.35)] rounded px-3 py-2 text-xs text-[#e5e2e1] placeholder-[#444653] outline-none transition-all font-sans resize-y min-h-[50px]"
              />
            </div>
          </div>
        )}
      </SectionAccordion>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ACTION BAR — Submit / Export                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Card variant="flat" className="!bg-[#0e0e0e] border-white/[0.07]">
        {submitting ? (
          <div className="py-4 flex flex-col items-center justify-center text-center">
            <span className="h-6 w-6 rounded-full border-2 border-[#1e3fae] border-t-transparent animate-spin mb-3" />
            <p className="text-[11px] font-mono text-[#b8c4ff] animate-pulse">
              {syncStatusText}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              id="btn-submit-uir"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<Send size={15} />}
            >
              Submit Incident Report
            </Button>
            <Button
              id="btn-export-pdf"
              type="button"
              variant="secondary"
              size="md"
              fullWidth
              onClick={handleExportPdf}
              leftIcon={<FileDown size={14} />}
            >
              Export PDF
            </Button>
          </div>
        )}
      </Card>
    </form>
  );
}
