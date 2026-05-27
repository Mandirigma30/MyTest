import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, Star, Heart, Wind, Activity, Droplets, AlertTriangle, Brain, Baby, Pill } from 'lucide-react';
import MobileNav from '../components/layout/MobileNav';

// ─── Full Health Education Content Library ────────────────────────────────────
// Each article has `conditions` — keywords matched against the resident's
// enrolled SAMPLE data to show personalized content first.
const HEALTH_LIBRARY = [
  {
    id: 'diabetes-hypo',
    conditions: ['diabetes', 'metformin', 'insulin', 'blood sugar', 'hyperglycemia', 'hypoglycemia'],
    icon: Droplets,
    iconColor: 'text-amber-400',
    tagColor: 'text-amber-400 border-amber-500/30 bg-amber-900/20',
    category: 'Diabetes',
    tag: 'PERSONALIZED',
    title: 'Managing a Hypoglycemic Episode',
    summary: 'What to do when your blood sugar drops dangerously low',
    steps: [
      'Recognize the signs: shaking, sweating, confusion, pale skin, rapid heartbeat.',
      'If conscious: immediately consume 15g of fast-acting sugar — 4 glucose tablets, 150ml fruit juice, or 3 teaspoons of sugar in water.',
      'Rest for 15 minutes. Re-check blood sugar if possible.',
      'If no improvement after 15 min, consume another 15g of sugar.',
      'Eat a small meal or snack once blood sugar is stable (rice, bread, biscuits).',
      'If unconscious or unable to swallow: DO NOT give anything by mouth. Call ERU immediately.',
      'Inform your first responder of your Metformin / insulin medications — they are in your QR health card.',
    ],
  },
  {
    id: 'diabetes-management',
    conditions: ['diabetes', 'metformin', 'insulin', 'blood sugar'],
    icon: Activity,
    iconColor: 'text-amber-400',
    tagColor: 'text-amber-400 border-amber-500/30 bg-amber-900/20',
    category: 'Diabetes',
    tag: 'PERSONALIZED',
    title: 'Diabetic Emergency — When to Call ERU',
    summary: 'Warning signs that require immediate emergency response',
    steps: [
      'Call ERU immediately if: person is unconscious, having seizures, or cannot be roused.',
      'Very high blood sugar warning signs: extreme thirst, frequent urination, fruity breath, blurred vision.',
      'Very low blood sugar danger signs: loss of consciousness, seizures, unable to swallow.',
      'Tell the first responder: "I have Type 2 Diabetes. My medications are [name them]."',
      'Your QR health card already contains your full medication list — allow the responder to scan it.',
      'Do not skip meals or medication doses — this is the most common cause of diabetic emergencies.',
    ],
  },
  {
    id: 'asthma-attack',
    conditions: ['asthma', 'albuterol', 'salbutamol', 'inhaler', 'bronchospasm', 'wheezing', 'respiratory'],
    icon: Wind,
    iconColor: 'text-blue-400',
    tagColor: 'text-blue-400 border-blue-500/30 bg-blue-900/20',
    category: 'Respiratory',
    tag: 'PERSONALIZED',
    title: 'Managing an Asthma Attack',
    summary: 'Step-by-step guide for when your breathing becomes difficult',
    steps: [
      'Stay calm. Sit upright — do not lie down.',
      'Take 1 puff of your reliever inhaler (blue/gray — Salbutamol/Albuterol). Use a spacer if available.',
      'Breathe in slowly and hold for 10 seconds. Wait 1 minute between puffs.',
      'Take up to 4 puffs in the first 5 minutes.',
      'If no improvement in 5 minutes or symptoms worsen: call ERU immediately.',
      'Warning signs for severe attack: lips turning blue, difficulty speaking full sentences, exhausted from breathing.',
      'Tell the responder your inhaler name and dose — your QR health card already has this recorded.',
    ],
  },
  {
    id: 'hypertension',
    conditions: ['hypertension', 'high blood pressure', 'amlodipine', 'losartan', 'blood pressure', 'stroke'],
    icon: Heart,
    iconColor: 'text-red-400',
    tagColor: 'text-red-400 border-red-500/30 bg-red-900/20',
    category: 'Cardiovascular',
    tag: 'PERSONALIZED',
    title: 'Hypertensive Crisis — Warning Signs',
    summary: 'Recognizing when high blood pressure becomes a medical emergency',
    steps: [
      'Normal blood pressure: below 120/80 mmHg. Emergency threshold: above 180/120 mmHg.',
      'Warning signs of hypertensive crisis: severe headache, blurred vision, chest pain, shortness of breath, confusion.',
      'Sit or lie down in a calm, quiet position immediately.',
      'Do NOT skip your prescribed medications (Amlodipine, Losartan, etc.).',
      'Call ERU immediately for BP above 180/120 or if you feel: facial drooping, arm weakness, or slurred speech (these are stroke signs).',
      'Your QR health card records your blood pressure medications — share it with the responder.',
    ],
  },
  {
    id: 'stroke-fast',
    conditions: ['stroke', 'hypertension', 'blood pressure', 'heart', 'brain', 'tia'],
    icon: Brain,
    iconColor: 'text-pink-400',
    tagColor: 'text-pink-400 border-pink-500/30 bg-pink-900/20',
    category: 'Neurological',
    tag: 'CRITICAL',
    title: 'Stroke — FAST Recognition Guide',
    summary: 'Act within the first hour. Time = Brain cells.',
    steps: [
      'F — FACE: Ask them to smile. Does one side of their face droop?',
      'A — ARMS: Ask them to raise both arms. Does one drift downward?',
      'S — SPEECH: Ask them to repeat a simple phrase. Is speech slurred or strange?',
      'T — TIME: If ANY of these signs are present — call ERU immediately. Note the exact time symptoms started.',
      'Do NOT give food, water, or any medication by mouth.',
      'Keep the person still, calm, and comfortable until help arrives.',
      'Patients with hypertension history have higher stroke risk — your QR card will inform the responder.',
    ],
  },
  {
    id: 'cardiac-chest-pain',
    conditions: ['heart', 'chest pain', 'cardiac', 'angina', 'coronary', 'amlodipine'],
    icon: Heart,
    iconColor: 'text-red-400',
    tagColor: 'text-red-400 border-red-500/30 bg-red-900/20',
    category: 'Cardiac',
    tag: 'CRITICAL',
    title: 'Chest Pain — Cardiac Emergency Protocol',
    summary: 'Distinguishing heart attacks from other chest pain',
    steps: [
      'Heart attack warning signs: crushing/squeezing chest pain, pain radiating to left arm/jaw, sweating, nausea, shortness of breath.',
      'Call ERU immediately. Do not wait to see if it gets better.',
      'Have the person sit or lie down in a comfortable position. Loosen tight clothing.',
      'If prescribed Nitroglycerin: give 1 tablet under the tongue as directed.',
      'If trained and available: be prepared to start CPR if person loses consciousness.',
      'Do NOT let the person exert themselves in any way — no walking to the hospital.',
    ],
  },
  {
    id: 'medication-management',
    conditions: ['metformin', 'amlodipine', 'losartan', 'albuterol', 'salbutamol', 'insulin', 'medication', 'prescription'],
    icon: Pill,
    iconColor: 'text-purple-400',
    tagColor: 'text-purple-400 border-purple-500/30 bg-purple-900/20',
    category: 'Medications',
    tag: 'PERSONALIZED',
    title: 'Your Medications in an Emergency',
    summary: 'What your first responder needs to know about your prescriptions',
    steps: [
      'Your QR health card already contains your full medication list — always carry your phone.',
      'Inform the responder of all medications before any treatment, including supplements.',
      'Certain medications interact with emergency drugs — your responder is trained to check.',
      'Never stop prescribed medications without a doctor\'s approval, even during an emergency.',
      'Keep a physical list of your medications as a backup in your wallet.',
      'If you\'ve missed doses recently, tell the responder immediately — this can affect treatment.',
    ],
  },
  {
    id: 'allergy-anaphylaxis',
    conditions: ['allergy', 'anaphylaxis', 'penicillin', 'latex', 'seafood', 'bee', 'allergic'],
    icon: AlertTriangle,
    iconColor: 'text-orange-400',
    tagColor: 'text-orange-400 border-orange-500/30 bg-orange-900/20',
    category: 'Allergy',
    tag: 'PERSONALIZED',
    title: 'Severe Allergic Reaction (Anaphylaxis)',
    summary: 'Life-threatening allergic emergency response',
    steps: [
      'Signs of anaphylaxis: hives, swelling of face/throat, difficulty breathing, drop in blood pressure, rapid pulse.',
      'Call ERU IMMEDIATELY — anaphylaxis can be fatal within minutes.',
      'If an Epinephrine auto-injector (EpiPen) is prescribed: use it on the outer thigh now.',
      'Help the person lie down with legs elevated (unless breathing is difficult — then sit them upright).',
      'Loosen tight clothing. Keep them warm.',
      'Be prepared to administer CPR if they lose consciousness.',
      'Your QR card records your known allergies — always show it to medical staff. NEVER accept a drug you\'re allergic to.',
    ],
  },
  {
    id: 'general-cpr',
    conditions: [],
    icon: Heart,
    iconColor: 'text-[#b8c4ff]',
    tagColor: 'text-[#b8c4ff] border-[#1e3fae]/40 bg-[#1e3fae]/10',
    category: 'General',
    tag: 'GENERAL',
    title: 'Basic CPR for Bystanders',
    summary: 'What anyone can do when someone collapses',
    steps: [
      'Check for responsiveness: tap shoulders firmly. "Are you okay?"',
      'Call ERU or have someone call. Start CPR while waiting.',
      'Place person on a firm, flat surface. Kneel beside their chest.',
      'Push hard and fast: center of chest, 100–120 times per minute. At least 2 inches deep.',
      'Let the chest fully rise between compressions.',
      'If trained: give 2 rescue breaths after every 30 compressions.',
      'Do not stop until help arrives, the person wakes up, or an AED is ready.',
    ],
  },
  {
    id: 'general-calling-eru',
    conditions: [],
    icon: BookOpen,
    iconColor: 'text-emerald-400',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-900/20',
    category: 'General',
    tag: 'GENERAL',
    title: 'How to Call for Emergency Help',
    summary: 'What to say and do when calling Barangay 45 ERU',
    steps: [
      'Use the SOS button in this app — it sends your GPS location automatically.',
      'When calling verbally: state your name, location, and nature of emergency clearly.',
      'Stay on the line — do not hang up until instructed by the dispatcher.',
      'Have someone flag down the ambulance at your street or building entrance.',
      'Unlock your front door so responders can enter without delay.',
      'Gather: your medication list, a government ID, and your PhilHealth card if available.',
      'Show your RespondaCare QR card to the first responder immediately on arrival.',
    ],
  },
];

export default function EducationPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [personalizedArticles, setPersonalizedArticles] = useState([]);
  const [generalArticles, setGeneralArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeTab, setActiveTab] = useState('personalized');

  useEffect(() => {
    // Pull resident's health profile from localStorage
    const residents = JSON.parse(localStorage.getItem('respondaCare_residents') || '[]');
    const sessionRaw = localStorage.getItem('respondaCare_session');
    const session = sessionRaw ? JSON.parse(sessionRaw) : null;

    const matched = residents.find(r =>
      r.name?.toLowerCase() === session?.name?.toLowerCase()
    ) || residents[0] || null;

    // Demo fallback profile if no enrollment data exists yet
    const resolvedProfile = matched || {
      name: session?.name || 'Resident',
      sample: {
        s: 'Occasional dizziness, fatigue',
        a: 'No known drug allergies',
        m: 'Metformin 500mg, Amlodipine 5mg',
        p: 'Diabetes Type 2, Hypertension Stage 1',
        l: 'Unknown',
        e: 'Not specified',
      },
    };

    setProfile(resolvedProfile);

    // Build a searchable string from the resident's full SAMPLE data
    const sampleText = Object.values(resolvedProfile.sample || {}).join(' ').toLowerCase();

    // Score each article by how many of its condition keywords appear in the profile
    const scored = HEALTH_LIBRARY.map(article => {
      if (article.conditions.length === 0) return { ...article, score: 0, isPersonalized: false };
      const matches = article.conditions.filter(keyword =>
        sampleText.includes(keyword.toLowerCase())
      ).length;
      return { ...article, score: matches, isPersonalized: matches > 0 };
    });

    const personalized = scored.filter(a => a.isPersonalized).sort((a, b) => b.score - a.score);
    const general = scored.filter(a => !a.isPersonalized);

    setPersonalizedArticles(personalized);
    setGeneralArticles(general);

    // Default to 'general' tab if no personalized content matched
    if (personalized.length === 0) setActiveTab('general');
  }, []);

  if (selectedArticle) {
    const Icon = selectedArticle.icon;
    return (
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1] pb-20">
        <header className="bg-[#0e0e0e] border-b border-white/[0.07] px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSelectedArticle(null)} className="text-[#8e909f] hover:text-[#e5e2e1]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[9px] font-mono text-[#8e909f] uppercase tracking-widest">{selectedArticle.category}</p>
            <h1 className="text-sm font-bold text-[#e5e2e1]">{selectedArticle.title}</h1>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <div className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-1 rounded border ${selectedArticle.tagColor}`}>
            {selectedArticle.isPersonalized && <Star size={10} />}
            {selectedArticle.tag}
          </div>

          {selectedArticle.isPersonalized && (
            <div className="p-3 bg-[#1e3fae]/10 border border-[#1e3fae]/30 rounded-lg text-[11px] text-[#b8c4ff] font-mono">
              📋 This guide was selected based on your health profile — {profile?.sample?.p || 'your recorded conditions'}.
            </div>
          )}

          <p className="text-sm text-[#c5c5d5] leading-relaxed">{selectedArticle.summary}</p>

          <div className="space-y-2">
            {selectedArticle.steps.map((step, i) => (
              <div key={i} className="flex gap-3 p-3 bg-[#171717] border border-white/[0.05] rounded-lg">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#1e3fae]/20 border border-[#1e3fae]/40 flex items-center justify-center text-[10px] font-bold text-[#b8c4ff] font-mono">
                  {i + 1}
                </span>
                <p className="text-sm text-[#e5e2e1] leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg text-xs text-amber-300 leading-relaxed">
            ⚠️ This guide is for awareness and emergency assistance. Always consult your doctor and call professional medical responders.
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  const displayedArticles = activeTab === 'personalized' ? personalizedArticles : generalArticles;

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] pb-20">
      <header className="bg-[#0e0e0e] border-b border-white/[0.07] px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/resident/portal')} className="text-[#8e909f] hover:text-[#e5e2e1]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-bold text-[#e5e2e1]">My Health Guide</h1>
            <p className="text-[10px] font-mono text-[#8e909f] uppercase tracking-widest">
              Personalized to your health profile
            </p>
          </div>
        </div>

        {/* Personalized vs General Tab */}
        <div className="flex gap-1 bg-[#111111] border border-white/[0.07] rounded p-1">
          <button
            onClick={() => setActiveTab('personalized')}
            disabled={personalizedArticles.length === 0}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-mono font-bold transition-colors ${
              activeTab === 'personalized'
                ? 'bg-[#1e3fae] text-white'
                : 'text-[#8e909f] hover:text-[#c5c5d5] disabled:opacity-30'
            }`}
          >
            <Star size={11} />
            My Conditions ({personalizedArticles.length})
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-mono font-bold transition-colors ${
              activeTab === 'general'
                ? 'bg-[#1e3fae] text-white'
                : 'text-[#8e909f] hover:text-[#c5c5d5]'
            }`}
          >
            <BookOpen size={11} />
            General
          </button>
        </div>
      </header>

      {/* Personalized context banner */}
      {activeTab === 'personalized' && profile?.sample?.p && (
        <div className="mx-4 mt-4 p-3 bg-[#1e3fae]/10 border border-[#1e3fae]/30 rounded-lg">
          <p className="text-[10px] font-mono text-[#b8c4ff] uppercase tracking-widest mb-1">Based on your health profile</p>
          <p className="text-xs text-[#c5c5d5]">{profile.sample.p}</p>
          {profile?.sample?.m && (
            <p className="text-[10px] text-[#8e909f] mt-1">Medications: {profile.sample.m}</p>
          )}
        </div>
      )}

      <div className="p-4 space-y-3">
        {displayedArticles.length === 0 ? (
          <div className="text-center py-12 text-[#444653] space-y-3">
            <BookOpen size={32} className="mx-auto opacity-40" />
            <p className="font-mono text-sm">
              {activeTab === 'personalized'
                ? 'No personalized guides yet. Get enrolled by a BHW first.'
                : 'No general guides available.'}
            </p>
          </div>
        ) : (
          displayedArticles.map(article => {
            const Icon = article.icon;
            return (
              <button
                key={article.id}
                id={`article-${article.id}`}
                onClick={() => setSelectedArticle(article)}
                className="w-full bg-[#171717] border border-white/[0.05] rounded-xl p-4 flex items-center gap-4 text-left hover:border-white/10 hover:bg-white/[0.02] transition-all group"
              >
                <div className={`h-11 w-11 rounded-xl bg-black/20 border border-white/[0.05] flex items-center justify-center flex-shrink-0 ${article.iconColor}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${article.tagColor}`}>
                      {article.isPersonalized && <Star size={8} className="inline mr-0.5" />}
                      {article.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#e5e2e1] truncate">{article.title}</h3>
                  <p className="text-xs text-[#8e909f] truncate mt-0.5">{article.summary}</p>
                </div>
                <ChevronRight size={16} className="text-[#444653] group-hover:text-[#8e909f] transition-colors flex-shrink-0" />
              </button>
            );
          })
        )}
      </div>
      <MobileNav />
    </div>
  );
}
