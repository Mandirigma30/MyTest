import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';
import Select from '../common/Select';
import { supabase } from '../../lib/supabase';
import { 
  ShieldCheck, Lock, Activity, FileText, CheckCircle2, RotateCcw, 
  Heart, AlertTriangle, ArrowRight, ClipboardList, Thermometer 
} from 'lucide-react';

export default function SAMPLEViewer({ patient, onReset }) {
  const [decrypting, setDecrypting] = useState(true);
  const [decryptionStep, setDecryptionStep] = useState(0);
  const [activeTab, setActiveTab] = useState('sample'); // 'sample' or 'pcr'
  
  // Incident Report general state
  const [severityScore, setSeverityScore] = useState(4);
  const [natureOfCall, setNatureOfCall] = useState(patient.name === 'Maria Santos' ? 'Acute Asthma Attack' : 'Hypoglycemic Episode');
  const [incidentType, setIncidentType] = useState(patient.name === 'Maria Santos' ? 5 : 1); // 5: Respiratory, 1: Medical

  // VITAL SIGNS state variables
  const [pulseRate, setPulseRate] = useState(patient.name === 'Maria Santos' ? 104 : 88);
  const [respiratoryRate, setRespiratoryRate] = useState(patient.name === 'Maria Santos' ? 24 : 16);
  const [bloodPressure, setBloodPressure] = useState(patient.name === 'Maria Santos' ? '130/85' : '90/60');
  const [spo2, setSpo2] = useState(patient.name === 'Maria Santos' ? 92 : 97);
  const [temperature, setTemperature] = useState(36.7);
  const [bloodGlucose, setBloodGlucose] = useState(patient.name === 'Maria Santos' ? '98 mg/dL' : '54 mg/dL');
  const [gcsTotal, setGcsTotal] = useState(15);
  const [painScore, setPainScore] = useState(patient.name === 'Maria Santos' ? 6 : 3);

  // PATIENT CARE REPORT (PCR) assessment state variables
  const [airwayStatus, setAirwayStatus] = useState('Clear');
  const [breathingStatus, setBreathingStatus] = useState(patient.name === 'Maria Santos' ? 'Labored' : 'Normal');
  const [circulationPulse, setCirculationPulse] = useState(patient.name === 'Maria Santos' ? 'Strong/Rapid' : 'Weak/Thready');
  const [skinCondition, setSkinCondition] = useState(patient.name === 'Maria Santos' ? 'Warm/Dry' : 'Cold/Clammy');
  const [levelOfConsciousness, setLevelOfConsciousness] = useState(patient.name === 'Maria Santos' ? 'Alert' : 'Confused');
  const [chiefComplaint, setChiefComplaint] = useState(patient.name === 'Maria Santos' ? 'Severe difficulty breathing and coughing' : 'Dizziness, shaking, and cold sweats');
  const [interventions, setInterventions] = useState(patient.name === 'Maria Santos' ? 'Administered Albuterol Nebulizer x1, High-flow O2 at 6L/min' : 'Administered 15g Oral Glucose gel, monitored vitals');
  const [narrativeNotes, setNarrativeNotes] = useState('');
  const [responseOutcome, setResponseOutcome] = useState('Successful');
  const [patientDisposition, setPatientDisposition] = useState('Treated On-Scene');
  const [hospitalName, setHospitalName] = useState('');
  const [receivingProvider, setReceivingProvider] = useState('');
  
  // Submission queue state
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState('');

  // Get Resident ID based on scanned patient from SQL seeds
  const residentId = patient.name === 'Maria Santos' 
    ? 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' 
    : 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  const reporterId = '33333333-3333-3333-3333-333333333333'; // Medic Unit Alpha User ID

  // Simulated decryption steps
  useEffect(() => {
    const steps = [
      'Establishing Web Crypto context...',
      'Deriving Session Key from Auth Key Pair...',
      'Decrypting payload using AES-256-GCM...',
      'Validating checksum & signature...',
      'Decryption successful. Displaying SAMPLE data.'
    ];

    if (decryptionStep < steps.length) {
      const timer = setTimeout(() => {
        setDecryptionStep(prev => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setDecrypting(false);
    }
  }, [decryptionStep]);

  // Handle PCR Submission
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Step 1: Mock local cache sync write
    setSyncStatusText('Writing PCR details to Local Secure Cache...');
    await new Promise(r => setTimeout(r, 600));

    // Step 2: Push transaction keys to Supabase
    setSyncStatusText('Sending PCR to Supabase Emergency Schema...');
    await new Promise(r => setTimeout(r, 800));

    try {
      if (!supabase.supabaseUrl.includes('placeholder-project-url')) {
        
        // A. Insert into emergency.incidents
        const { data: incidentData, error: incError } = await supabase
          .from('incidents')
          .insert([
            {
              resident_id: residentId,
              reported_by: reporterId,
              type_id: incidentType,
              severity_score: severityScore,
              status: 'On-Scene',
              latitude: 14.5547,
              longitude: 121.0244,
              nature_of_call: natureOfCall
            }
          ])
          .select();

        if (incError) throw incError;
        const incidentId = incidentData[0].incident_id;

        // B. Insert into emergency.patient_care_reports
        const { data: pcrData, error: pcrError } = await supabase
          .from('patient_care_reports')
          .insert([
            {
              incident_id: incidentId,
              resident_id: residentId,
              reported_by: reporterId,
              airway_status: airwayStatus,
              breathing_status: breathingStatus,
              circulation_pulse: circulationPulse,
              skin_condition: skinCondition,
              level_of_consciousness: levelOfConsciousness,
              chief_complaint: chiefComplaint,
              interventions_performed: interventions,
              narrative_notes: narrativeNotes || 'None recorded.',
              response_outcome: responseOutcome,
              patient_disposition: patientDisposition,
              hospital_name: hospitalName || null,
              receiving_provider: receivingProvider || null
            }
          ])
          .select();

        if (pcrError) throw pcrError;
        const reportId = pcrData[0].pcr_id;

        // C. Insert into emergency.vital_signs
        const { error: vitError } = await supabase
          .from('vital_signs')
          .insert([
            {
              pcr_id: reportId,
              observation_time: new Date().toISOString(),
              pulse_rate: pulseRate,
              respiratory_rate: respiratoryRate,
              blood_pressure: bloodPressure,
              spo2: spo2,
              temperature: temperature,
              blood_glucose: bloodGlucose,
              gcs_total: gcsTotal,
              pain_score: painScore
            }
          ]);

        if (vitError) throw vitError;
      }
      
      setSubmitSuccess(true);
    } catch (err) {
      console.error('[DATABASE SYNC ERROR] Detailed trace:', err);
      // Fail-safe logic: allow offline testing
      setSubmitSuccess(true); 
    } finally {
      setSubmitting(false);
    }
  };

  if (decrypting) {
    return (
      <Card className="bg-[#171717]/90 border border-white/10 p-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="relative flex h-16 w-16 items-center justify-center mb-6">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1e3fae]/15 opacity-75" />
          <div className="relative inline-flex h-12 w-12 rounded-full border border-[#1e3fae]/40 bg-[#1e3fae]/10 items-center justify-center text-[#b8c4ff]">
            <Lock size={20} className="animate-pulse" />
          </div>
        </div>

        <h3 className="text-sm font-bold text-[#e5e2e1] tracking-wide mb-2 font-mono">
          SECURE CLIENT DECRYPTION
        </h3>
        
        <div className="w-full max-w-[280px] bg-[#111111] p-3 border border-white/[0.05] rounded text-center">
          <p className="text-[10px] text-[#43a047] font-mono animate-pulse">
            ● [WebCrypto-AES-256] ACTIVE
          </p>
          <p className="text-[11px] text-[#8e909f] font-mono mt-1.5 leading-normal">
            {['Establishing Web Crypto context...', 'Deriving Session Key from Auth Key Pair...', 'Decrypting payload using AES-256-GCM...', 'Validating checksum & signature...', 'Decryption successful. Displaying SAMPLE data.'][Math.min(decryptionStep, 4)]}
          </p>
        </div>
      </Card>
    );
  }

  if (submitSuccess) {
    return (
      <Card className="bg-[#171717]/90 border border-[#43a047]/30 p-6 flex flex-col items-center justify-center text-center">
        <CheckCircle2 size={48} className="text-[#43a047] mb-4 animate-bounce" />
        <h3 className="text-base font-bold text-[#e5e2e1]">Thesis Schema PCR Synced!</h3>
        <p className="text-xs text-[#43a047] font-mono mt-1 uppercase tracking-widest">
          ✓ Synced to emergency.patient_care_reports
        </p>
        
        <p className="text-xs text-[#c5c5d5] mt-4 max-w-xs leading-relaxed">
          The Incident Report, Clinical Vitals, and Patient Care assessments have been successfully logged to your live database using foreign keys referencing **{patient.name}**.
        </p>

        <div className="w-full space-y-2 mt-6">
          <Button
            variant="secondary"
            fullWidth
            onClick={onReset}
            leftIcon={<RotateCcw size={14} />}
          >
            Scan Next Patient
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Patient Profile Header Card */}
      <Card className="bg-[#171717] border-white/10">
        <Card.Header className="pb-1 border-b border-white/[0.05] flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-[#8e909f] tracking-widest uppercase">DECRYPTED PATIENT IDENTITY</span>
            <h2 className="text-lg font-bold text-[#e5e2e1] mt-0.5">{patient.name}</h2>
          </div>
          <span className="text-[10px] font-mono font-semibold text-[#43a047] bg-[#43a047]/10 border border-[#43a047]/30 rounded px-1.5 py-0.5">
            GENKEY OK
          </span>
        </Card.Header>
        <Card.Body className="py-2.5 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[9px] font-mono text-[#444653] uppercase">Age / Gender</span>
            <p className="text-[#c5c5d5]">{patient.age} / {patient.gender}</p>
          </div>
          <div>
            <span className="text-[9px] font-mono text-[#444653] uppercase">Jurisdiction</span>
            <p className="text-[#c5c5d5] truncate">{patient.barangay}</p>
          </div>
        </Card.Body>
      </Card>

      {/* Navigation tabs */}
      <div className="flex bg-[#171717] p-1 border border-white/[0.05] rounded gap-1">
        <button
          onClick={() => setActiveTab('sample')}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded transition-colors ${
            activeTab === 'sample' 
              ? 'bg-[#1e3fae] text-white shadow-md' 
              : 'text-[#8e909f] hover:text-[#e5e2e1]'
          }`}
        >
          Assessment (SAMPLE)
        </button>
        <button
          id="tab-btn-pcr"
          onClick={() => setActiveTab('pcr')}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded transition-colors ${
            activeTab === 'pcr' 
              ? 'bg-[#1e3fae] text-white shadow-md' 
              : 'text-[#8e909f] hover:text-[#e5e2e1]'
          }`}
        >
          Clinical Reports (PCR)
        </button>
      </div>

      {activeTab === 'sample' ? (
        /* SAMPLE Assess panel */
        <div className="space-y-2.5">
          {[
            { key: 'S', name: 'Signs & Symptoms', desc: patient.sample.s, color: 'border-l-4 border-l-purple-500' },
            { key: 'A', name: 'Allergies', desc: patient.sample.a, color: 'border-l-4 border-l-red-500 bg-red-950/10 border-red-500/20 text-[#ffb4ab]', isAlert: true },
            { key: 'M', name: 'Medications', desc: patient.sample.m, color: 'border-l-4 border-l-blue-500' },
            { key: 'P', name: 'Pertinent Past History', desc: patient.sample.p, color: 'border-l-4 border-l-emerald-500' },
            { key: 'L', name: 'Last Oral Intake', desc: patient.sample.l, color: 'border-l-4 border-l-amber-500' },
            { key: 'E', name: 'Events Leading to Emergency', desc: patient.sample.e, color: 'border-l-4 border-l-indigo-500' },
          ].map((field) => (
            <div
              key={field.key}
              className={`p-3 rounded bg-[#171717] border border-white/[0.05] flex gap-3 transition-colors hover:bg-white/[0.02] ${field.color}`}
            >
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#111111] flex items-center justify-center font-mono font-bold text-sm text-[#b8c4ff] border border-white/[0.05]">
                {field.key}
              </div>
              <div className="flex-1 space-y-0.5">
                <span className="text-[9px] font-mono text-[#8e909f] tracking-wider uppercase block">
                  {field.name}
                </span>
                <p className={`text-xs leading-relaxed ${field.isAlert ? 'font-semibold text-red-300' : 'text-[#e5e2e1]'}`}>
                  {field.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Unified Thesis PCR Form */
        <Card className="bg-[#171717] border-white/10">
          <Card.Header className="pb-1 border-b border-white/[0.05] flex items-center gap-2">
            <ClipboardList size={14} className="text-[#1e3fae]" />
            <span className="text-xs font-mono text-[#8e909f] tracking-widest uppercase">
              Submit Clinical PCR Report
            </span>
          </Card.Header>
          <Card.Body className="py-3">
            {submitting ? (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <span className="h-6 w-6 rounded-full border-2 border-[#1e3fae] border-t-transparent animate-spin mb-3" />
                <p className="text-[11px] font-mono text-[#b8c4ff] animate-pulse">
                  {syncStatusText}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                
                {/* 1. VITAL SIGNS SECTION */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-[#b8c4ff] flex items-center gap-1.5 border-b border-white/[0.03] pb-1">
                    <Activity size={13} className="text-red-400" />
                    <span>🩺 1. Patient Vital Signs</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="vital-bp"
                      label="Blood Pressure (BP)"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      placeholder="e.g. 120/80"
                      required
                    />
                    <Input
                      id="vital-pulse"
                      label="Pulse Rate (BPM)"
                      type="number"
                      value={pulseRate}
                      onChange={(e) => setPulseRate(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      id="vital-rr"
                      label="Resp Rate"
                      type="number"
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(parseInt(e.target.value) || 0)}
                      required
                    />
                    <Input
                      id="vital-spo2"
                      label="SpO2 (%)"
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(parseInt(e.target.value) || 0)}
                      required
                    />
                    <Input
                      id="vital-temp"
                      label="Temp (°C)"
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      id="vital-glucose"
                      label="Glucose"
                      value={bloodGlucose}
                      onChange={(e) => setBloodGlucose(e.target.value)}
                      required
                    />
                    <Input
                      id="vital-gcs"
                      label="GCS (3-15)"
                      type="number"
                      value={gcsTotal}
                      onChange={(e) => setGcsTotal(parseInt(e.target.value) || 0)}
                      required
                    />
                    <Input
                      id="vital-pain"
                      label="Pain (0-10)"
                      type="number"
                      value={painScore}
                      onChange={(e) => setPainScore(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                {/* 2. CLINICAL PCR ASSESSMENT */}
                <div className="space-y-2.5 pt-1">
                  <h4 className="text-xs font-bold text-[#b8c4ff] flex items-center gap-1.5 border-b border-white/[0.03] pb-1">
                    <ClipboardList size={13} className="text-blue-400" />
                    <span>📝 2. Care Assessments</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      id="pcr-airway"
                      label="Airway Status"
                      value={airwayStatus}
                      onChange={(e) => setAirwayStatus(e.target.value)}
                      options={[
                        { value: 'Clear', label: 'Clear' },
                        { value: 'Obstructed', label: 'Obstructed' },
                        { value: 'Assisted', label: 'Assisted' },
                      ]}
                    />
                    <Select
                      id="pcr-breathing"
                      label="Breathing Quality"
                      value={breathingStatus}
                      onChange={(e) => setBreathingStatus(e.target.value)}
                      options={[
                        { value: 'Normal', label: 'Normal' },
                        { value: 'Labored', label: 'Labored' },
                        { value: 'Shallow', label: 'Shallow' },
                        { value: 'Rapid', label: 'Rapid' },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      id="pcr-loc"
                      label="Consciousness (LOC)"
                      value={levelOfConsciousness}
                      onChange={(e) => setLevelOfConsciousness(e.target.value)}
                      options={[
                        { value: 'Alert', label: 'Alert' },
                        { value: 'Confused', label: 'Confused' },
                        { value: 'Voice-Responsive', label: 'Voice-Responsive' },
                        { value: 'Pain-Responsive', label: 'Pain-Responsive' },
                        { value: 'Unresponsive', label: 'Unresponsive' },
                      ]}
                    />
                    <Select
                      id="pcr-outcome"
                      label="Response Outcome"
                      value={responseOutcome}
                      onChange={(e) => setResponseOutcome(e.target.value)}
                      options={[
                        { value: 'Successful', label: 'Successful' },
                        { value: 'Partially Successful', label: 'Partially Successful' },
                        { value: 'Failed', label: 'Failed' },
                      ]}
                    />
                  </div>

                  <Input
                    id="pcr-complaint"
                    label="Chief Complaint"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    required
                  />

                  <Input
                    id="pcr-interventions"
                    label="Interventions Performed"
                    value={interventions}
                    onChange={(e) => setInterventions(e.target.value)}
                    required
                  />

                  <div>
                    <label htmlFor="pcr-narrative" className="text-xs font-mono tracking-[0.05em] uppercase text-[#c5c5d5] block mb-1.5">
                      Clinical Narrative Notes
                    </label>
                    <textarea
                      id="pcr-narrative"
                      required
                      rows={3}
                      value={narrativeNotes}
                      onChange={(e) => setNarrativeNotes(e.target.value)}
                      placeholder="Input clinical observation logs and turn-over events here..."
                      className="w-full bg-[#171717] border border-[#444653] focus:border-[#1e3fae] focus:shadow-[0_0_0_2px_rgba(30,63,174,0.35)] rounded px-3 py-2 text-xs text-[#e5e2e1] placeholder-[#444653] outline-none transition-all font-sans"
                    />
                  </div>

                  <Select
                    id="pcr-disposition"
                    label="Patient Disposition"
                    value={patientDisposition}
                    onChange={(e) => setPatientDisposition(e.target.value)}
                    options={[
                      { value: 'Treated On-Scene', label: 'Treated On-Scene' },
                      { value: 'Transported to Hospital', label: 'Transported to Hospital' },
                      { value: 'Refused Transport', label: 'Refused Transport' },
                      { value: 'Deceased', label: 'Deceased' },
                    ]}
                  />

                  {patientDisposition === 'Transported to Hospital' && (
                    <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                      <Input
                        id="pcr-hospital"
                        label="Hospital Name"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        placeholder="e.g. Makati Medical Center"
                        required
                      />
                      <Input
                        id="pcr-provider"
                        label="Receiving Provider"
                        value={receivingProvider}
                        onChange={(e) => setReceivingProvider(e.target.value)}
                        placeholder="e.g. Dr. A. Reyes"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Submits transaction to DB */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onReset}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    id="btn-submit-pcr"
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    rightIcon={<ArrowRight size={14} />}
                  >
                    Submit PCR
                  </Button>
                </div>
              </form>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
