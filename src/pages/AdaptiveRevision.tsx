// ============================================================================
// ADAPTIVE REVISION LAUNCHER — Warm Parchment / Cream Theme
// Matches official VigyanPrep Dashboard & Scientific Editorial Design
// ============================================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, BookOpen, ArrowRight, Target, Clock, Hash,
  ChevronRight, Sparkles, BarChart3, AlertTriangle,
  ArrowLeft, Flame, Shield, Lock, CheckCircle2, ExternalLink
} from 'lucide-react';
import { useAdaptiveStore } from '../stores/adaptiveStore';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';

const EXAM_OPTIONS = [
  { value: 'iat', label: 'IISER IAT', badge: '60 Qs • 180m' },
  { value: 'nest', label: 'NISER NEST', badge: '80 Qs • 210m' },
  { value: 'isi', label: 'ISI Entrance', badge: '30 Qs • 120m' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Foundation', icon: Shield, color: '#15803d', desc: 'Core concept clarity & basics' },
  { value: 'medium', label: 'Standard Exam', icon: Target, color: '#b45309', desc: 'Real IAT / NEST level rigor' },
  { value: 'hard', label: 'Advanced Challenge', icon: Flame, color: '#b91c1c', desc: 'Multi-concept Olympiad level' },
];

const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30];
const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

function resolveToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(^| )student_token=([^;]+)/);
  if (match) return decodeURIComponent(match[2]);
  return localStorage.getItem('student_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token') || '';
}

export function AdaptiveRevision() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [isPaidUser, setIsPaidUser] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState<boolean>(true);

  const {
    selectedExamType, selectedSubject, selectedChapter,
    selectedSubTopics, toggleSubTopic, selectAllSubTopics, clearAllSubTopics,
    questionCount, durationMinutes, difficulty,
    chapters, subjects, loadingChapters, generating, error,
    mastery, history,
    setExamType, setSubject, setChapter,
    setQuestionCount, setDurationMinutes, setDifficulty,
    fetchChapters, generateTest, fetchMastery, resetTest
  } = useAdaptiveStore();

  useEffect(() => {
    fetchChapters(selectedExamType);
    fetchMastery();
    resetTest();

    // Check paid access status
    const checkAccess = async () => {
      setCheckingAccess(true);
      const token = resolveToken();
      if (!token) {
        setIsPaidUser(false);
        setCheckingAccess(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/adaptive/check-access`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setIsPaidUser(data.isPaid === true);
      } catch {
        setIsPaidUser(true);
      } finally {
        setCheckingAccess(false);
      }
    };
    checkAccess();
  }, [selectedExamType]);

  const handleStart = async () => {
    if (isPaidUser === false) {
      window.open('https://vigyanprep.com/tests', '_blank');
      return;
    }
    const success = await generateTest();
    if (success) {
      navigate('/adaptive-test');
    }
  };

  const getChapterMastery = (subject: string, chapterName: string) => {
    return mastery.find(m => m.subject === subject && m.chapterName === chapterName);
  };

  return (
    <div className="min-h-screen bg-[#f4ecd8] text-[#1c1815] font-sans relative overflow-x-hidden selection:bg-amber-950 selection:text-amber-200">
      
      {/* Background Graphic Accent Watermark */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 flex items-center justify-center font-serif text-[18vw] font-black text-amber-950 uppercase select-none">
        VIGYAN
      </div>

      {/* ─── Top Header ─── */}
      <header className="sticky top-0 z-40 bg-[#f4ecd8]/90 backdrop-blur-xl border-b-2 border-amber-950/20 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (step === 'configure') setStep('select');
                else navigate('/dashboard');
              }}
              className="p-2 rounded-xl bg-white/40 hover:bg-white/80 border-2 border-amber-950/25 text-amber-950 transition cursor-pointer shadow-xs"
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Brain size={20} className="text-amber-900" />
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1c1815]">Smart Topic Revision</h1>
              </div>
              <p className="text-[11px] text-amber-950/70 font-semibold hidden sm:block">
                Daily adaptive chapter-wise practice &amp; mistake remediation
              </p>
            </div>
          </div>

          {/* Exam Type Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-white/40 border-2 border-amber-950/20 rounded-2xl">
            {EXAM_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setExamType(opt.value)}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  selectedExamType === opt.value
                    ? 'bg-[#1c1815] text-amber-300 shadow-md border border-amber-500/30'
                    : 'text-[#1c1815] hover:bg-white/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 relative z-10 space-y-8">
        
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-100 border-2 border-red-300 text-red-900 flex items-center gap-3 text-xs font-bold shadow-xs">
            <AlertTriangle size={18} className="shrink-0 text-red-600" />
            <p>{error}</p>
          </div>
        )}

        {/* 🔒 Paid Student Lock Banner */}
        {!checkingAccess && isPaidUser === false && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-200/90 via-amber-300/80 to-amber-200/90 border-2 border-amber-600/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-950/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-300 flex items-center justify-center shrink-0 shadow-md">
                <Lock size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-amber-950 flex items-center gap-2">
                  <span>Exclusive Feature for Enrolled Test Series Students</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-950 text-amber-200 font-mono font-bold uppercase">PRO</span>
                </h3>
                <p className="text-xs text-amber-950/80 max-w-xl font-medium leading-relaxed">
                  Smart AI Chapter Revision analyzes your mistakes in real-time, generates tailored question sets, and gives step-by-step KaTeX solutions. Unlock with any test pass.
                </p>
                <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-amber-950 font-bold">
                  <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-700" /> Unlimited Chapter Practice</span>
                  <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-700" /> Mistake Tracking &amp; Retests</span>
                  <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-700" /> KaTeX Step-by-Step Derivations</span>
                </div>
              </div>
            </div>
            <a
              href="https://vigyanprep.com/tests"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-[#1c1815] hover:bg-black text-amber-300 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all shadow-lg border border-amber-500/30 cursor-pointer"
            >
              <span>Unlock with Test Pass</span>
              <ExternalLink size={14} />
            </a>
          </div>
        )}

        {step === 'select' ? (
          /* ─── STEP 1: Select Subject & Chapter ─── */
          <div className="space-y-8">
            
            {/* Subject Filter Pills */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {subjects.map(subj => {
                const isActive = selectedSubject === subj;
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => setSubject(subj)}
                    className={`px-5 py-2.5 rounded-2xl font-serif text-sm font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
                      isActive
                        ? 'bg-[#1c1815] text-amber-300 shadow-xl shadow-amber-950/20 border-2 border-amber-500/40'
                        : 'bg-white/40 hover:bg-white/80 border-2 border-amber-950/25 text-[#1c1815] shadow-xs'
                    }`}
                  >
                    <span>{subj}</span>
                    {chapters[subj] && (
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-amber-500/30 text-amber-200' : 'bg-amber-950/10 text-amber-950'}`}>
                        {chapters[subj].length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Chapter Cards Grid */}
            {selectedSubject && chapters[selectedSubject] && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {chapters[selectedSubject].map((ch) => {
                  const cm = getChapterMastery(selectedSubject, ch.name);

                  return (
                    <div
                      key={ch.name}
                      onClick={() => { setChapter(ch); setStep('configure'); }}
                      className="p-6 rounded-3xl bg-white/40 hover:bg-white/80 backdrop-blur-xl border-2 border-amber-950/25 hover:border-amber-950/60 transition-all duration-200 text-left flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl group cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-950/10 text-amber-950 flex items-center justify-center group-hover:bg-amber-950 group-hover:text-amber-300 transition shrink-0">
                              <BookOpen size={16} />
                            </div>
                            <h3 className="font-serif font-bold text-base text-[#1c1815] group-hover:text-amber-950 transition-colors line-clamp-1">
                              {ch.name}
                            </h3>
                          </div>
                          <ChevronRight size={18} className="text-amber-950/40 group-hover:text-amber-950 group-hover:translate-x-1 transition shrink-0" />
                        </div>

                        {/* Subtopics Preview */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {ch.subTopics.slice(0, 3).map(st => (
                            <span key={st} className="px-2.5 py-0.5 rounded-lg bg-amber-950/10 text-amber-950 text-[10px] font-bold">
                              {st}
                            </span>
                          ))}
                          {ch.subTopics.length > 3 && (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-950/5 text-amber-950/60 text-[10px] font-bold">
                              +{ch.subTopics.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mastery Progress Bar */}
                      <div className="pt-3 border-t border-amber-950/15 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-amber-950/60 uppercase text-[9px] tracking-wider">Concept Mastery</span>
                          <span className={cm && cm.overallMastery >= 80 ? 'text-emerald-700' : cm && cm.overallMastery >= 50 ? 'text-amber-800' : 'text-neutral-500'}>
                            {cm ? `${cm.overallMastery}%` : 'Not Practiced'}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-amber-950/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: cm ? `${cm.overallMastery}%` : '0%',
                              backgroundColor: cm && cm.overallMastery >= 80 ? '#15803d' : cm && cm.overallMastery >= 50 ? '#d97706' : '#b91c1c'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!selectedSubject && (
              <div className="text-center py-24 space-y-3 bg-white/20 rounded-3xl border-2 border-dashed border-amber-950/20">
                <Brain size={48} className="text-amber-950/30 mx-auto" />
                <p className="font-serif text-lg text-amber-950/70 font-bold">Select a subject above to view chapters</p>
              </div>
            )}

            {loadingChapters && (
              <div className="text-center py-24 space-y-3">
                <div className="w-10 h-10 border-4 border-amber-950 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-amber-950/70 uppercase tracking-wider">Loading syllabus matrix...</p>
              </div>
            )}

            {/* Recent History */}
            {history.length > 0 && (
              <div className="pt-6 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1c1815] flex items-center gap-2">
                  <BarChart3 size={18} className="text-amber-900" />
                  <span>Recent Topic Practice Sessions</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.slice(0, 4).map(h => (
                    <div key={h.id} className="p-4 rounded-2xl bg-white/40 border-2 border-amber-950/20 flex items-center justify-between shadow-xs">
                      <div>
                        <p className="font-serif font-bold text-sm text-[#1c1815]">{h.chapter_name}</p>
                        <p className="text-[11px] text-amber-950/60 font-semibold">{h.subject} • {new Date(h.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-lg ${h.accuracy >= 80 ? 'text-emerald-700' : h.accuracy >= 50 ? 'text-amber-800' : 'text-red-700'}`}>
                          {h.accuracy}%
                        </p>
                        <p className="text-[10px] text-amber-950/60 font-bold">{h.correct_count}/{h.question_count} Correct</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ─── STEP 2: Configure Test & Granular Sub-Topics ─── */
          <div className="max-w-2xl mx-auto space-y-8">
            
            {/* Selected Chapter & Interactive Sub-Topic Selector */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-2xl border-2 border-amber-950/30 space-y-6 shadow-xl shadow-amber-950/10">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-amber-950/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-300 flex items-center justify-center shadow-md shrink-0">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1c1815]">{selectedChapter?.name}</h2>
                    <p className="text-xs text-amber-950/70 font-semibold">{selectedSubject} • {selectedExamType.toUpperCase()}</p>
                  </div>
                </div>

                {/* Select All / Clear All Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllSubTopics}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-950 text-amber-200 text-xs font-bold hover:bg-black transition cursor-pointer shadow-xs"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllSubTopics}
                    className="px-3.5 py-1.5 rounded-xl bg-white/60 hover:bg-white text-xs font-bold text-amber-950 border border-amber-950/30 transition cursor-pointer shadow-xs"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Sub-topics Checkbox Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <span>Select Specific Sub-Topics to Practice</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/10 text-amber-950 font-mono">
                      {selectedSubTopics.length} of {selectedChapter?.subTopics.length || 0}
                    </span>
                  </p>
                  <span className="text-[11px] text-amber-950/60 italic font-medium">Click to select/unselect</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedChapter?.subTopics.map(st => {
                    const isChecked = selectedSubTopics.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => toggleSubTopic(st)}
                        className={`p-3.5 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                          isChecked
                            ? 'bg-amber-200/70 border-amber-600/70 text-amber-950 font-bold shadow-xs'
                            : 'bg-white/40 border-amber-950/20 text-[#1c1815] hover:bg-white/80'
                        }`}
                      >
                        <span className="text-xs font-bold leading-tight">{st}</span>
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs shrink-0 transition ${
                          isChecked
                            ? 'bg-amber-950 text-amber-200 font-black'
                            : 'border-2 border-amber-950/30 bg-white/60'
                        }`}>
                          {isChecked ? '✓' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedSubTopics.length === 0 && (
                  <p className="text-xs text-red-700 font-bold mt-2 bg-red-100 p-2.5 rounded-xl border border-red-200">
                    ⚠️ Please select at least 1 topic above or click &quot;Select All&quot;
                  </p>
                )}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-2xl border-2 border-amber-950/30 space-y-3 shadow-sm">
              <label className="text-xs font-extrabold uppercase tracking-wider text-amber-950 block">Difficulty Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DIFFICULTY_OPTIONS.map(d => {
                  const Icon = d.icon;
                  const isSelected = difficulty === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDifficulty(d.value)}
                      className={`p-4 rounded-2xl border-2 text-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#1c1815] text-white border-amber-500 shadow-md'
                          : 'bg-white/40 hover:bg-white border-amber-950/20 text-[#1c1815]'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: isSelected ? '#fbbf24' : d.color }} />
                      <p className="font-bold text-xs">{d.label}</p>
                      <p className={`text-[10px] mt-1 ${isSelected ? 'text-amber-200/80' : 'text-neutral-600'}`}>{d.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions & Duration Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Question Count */}
              <div className="p-5 rounded-3xl bg-white/70 border-2 border-amber-950/30 space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <Hash size={15} /> <span>Questions</span>
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {QUESTION_COUNTS.map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQuestionCount(n)}
                      className={`px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs transition cursor-pointer ${
                        questionCount === n
                          ? 'bg-[#1c1815] text-amber-300 shadow-md border border-amber-500/30'
                          : 'bg-white/50 border border-amber-950/20 text-[#1c1815] hover:bg-white'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="p-5 rounded-3xl bg-white/70 border-2 border-amber-950/30 space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <Clock size={15} /> <span>Duration (Mins)</span>
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {DURATION_OPTIONS.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMinutes(m)}
                      className={`px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs transition cursor-pointer ${
                        durationMinutes === m
                          ? 'bg-[#1c1815] text-amber-300 shadow-md border border-amber-500/30'
                          : 'bg-white/50 border border-amber-950/20 text-[#1c1815] hover:bg-white'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={generating || selectedSubTopics.length === 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-amber-950/15 border-2 border-amber-600/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                  <span>Generating {questionCount} Exam Questions with AI...</span>
                </>
              ) : isPaidUser === false ? (
                <>
                  <Lock size={18} />
                  <span>Unlock Full Access with Test Pass</span>
                  <ExternalLink size={16} />
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Start Practice Test ({questionCount} Qs • {durationMinutes}m)</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdaptiveRevision;
