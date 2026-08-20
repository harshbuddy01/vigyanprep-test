// =============================================
// ADAPTIVE REVISION LAUNCHER PAGE
// Chapter selection → Configure → Start test
// =============================================

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
  { value: 'iat', label: 'IISER IAT', color: '#d4a520' },
  { value: 'nest', label: 'NISER NEST', color: '#e8720a' },
  { value: 'isi', label: 'ISI Entrance', color: '#4ade80' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Foundation', icon: Shield, color: '#4ade80', desc: 'Build conceptual clarity' },
  { value: 'medium', label: 'Standard', icon: Target, color: '#d4a520', desc: 'Exam-level difficulty' },
  { value: 'hard', label: 'Advanced', icon: Flame, color: '#f87171', desc: 'Olympiad-level challenge' },
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
        // Fallback: assume paid if check fails
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

  // Find mastery data for a given chapter
  const getChapterMastery = (subject: string, chapterName: string) => {
    return mastery.find(m => m.subject === subject && m.chapterName === chapterName);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--ivory)]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg-deep)]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 'configure' ? (
              <button onClick={() => setStep('select')} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="font-[var(--font-display)] text-2xl font-bold flex items-center gap-2">
                <Brain className="w-6 h-6 text-[var(--gold)]" />
                Smart Chapter Revision
              </h1>
              <p className="text-xs text-[var(--ivory)]/50 mt-0.5">AI-powered adaptive practice with weakness tracking</p>
            </div>
          </div>

          {/* Exam Type Selector */}
          <div className="flex gap-2">
            {EXAM_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setExamType(opt.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedExamType === opt.value
                    ? 'text-[var(--bg-deep)]'
                    : 'bg-white/5 text-[var(--ivory)]/60 hover:bg-white/10'
                }`}
                style={selectedExamType === opt.value ? { backgroundColor: opt.color } : {}}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* 🔒 PAID STUDENT UNLOCK GATE BANNER */}
        {!checkingAccess && isPaidUser === false && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-amber-500/5 border-2 border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-950/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-amber-200 flex items-center gap-2">
                  <span>Exclusive Feature for Enrolled Test Series Students</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold uppercase">PRO</span>
                </h3>
                <p className="text-xs text-[var(--ivory)]/70 max-w-xl leading-relaxed">
                  Smart Daily AI Chapter Revision analyzes your concept errors in real-time and generates targeted practice sets. Buy any test pass or full test series to unlock unlimited AI revisions.
                </p>
                <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-amber-300/80 font-medium">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Unlimited AI Practice</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sub-Topic Weakness Tracking</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant KaTeX Derivations</span>
                </div>
              </div>
            </div>
            <a
              href="https://vigyanprep.com/tests"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-extrabold text-sm flex items-center gap-2 shrink-0 transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              <span>Unlock with Test Pass</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {step === 'select' ? (
          /* ─── STEP 1: Select Subject & Chapter ─── */
          <div className="space-y-8">
            {/* Subject Tabs */}
            <div className="flex gap-3 flex-wrap">
              {subjects.map(subj => (
                <button
                  key={subj}
                  onClick={() => setSubject(subj)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    selectedSubject === subj
                      ? 'bg-[var(--gold)] text-[var(--bg-deep)]'
                      : 'bg-white/5 text-[var(--ivory)]/70 hover:bg-white/10 hover:text-[var(--ivory)]'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>

            {/* Chapter Grid */}
            {selectedSubject && chapters[selectedSubject] && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chapters[selectedSubject].map((ch) => {
                  const cm = getChapterMastery(selectedSubject, ch.name);
                  const isSelected = selectedChapter?.name === ch.name;

                  return (
                    <button
                      key={ch.name}
                      onClick={() => { setChapter(ch); setStep('configure'); }}
                      className={`group relative p-5 rounded-2xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-[var(--gold)]/50 bg-[var(--gold)]/5'
                          : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-[var(--gold)]/70" />
                          <h3 className="font-bold text-sm text-[var(--ivory)]">{ch.name}</h3>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--ivory)]/30 group-hover:text-[var(--gold)] transition-colors" />
                      </div>

                      {/* Sub-topics preview */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {ch.subTopics.slice(0, 3).map(st => (
                          <span key={st} className="px-2 py-0.5 text-[10px] rounded-full bg-white/5 text-[var(--ivory)]/50">
                            {st}
                          </span>
                        ))}
                        {ch.subTopics.length > 3 && (
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/5 text-[var(--ivory)]/40">
                            +{ch.subTopics.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Mastery bar */}
                      {cm ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-[var(--ivory)]/40">Mastery</span>
                            <span className={`font-bold ${cm.overallMastery >= 80 ? 'text-emerald-400' : cm.overallMastery >= 50 ? 'text-[var(--gold)]' : 'text-red-400'}`}>
                              {cm.overallMastery}%
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${cm.overallMastery}%`,
                                backgroundColor: cm.overallMastery >= 80 ? '#4ade80' : cm.overallMastery >= 50 ? '#d4a520' : '#f87171'
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-[var(--ivory)]/30 italic">Not practiced yet</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {!selectedSubject && (
              <div className="text-center py-20">
                <Brain className="w-16 h-16 text-[var(--gold)]/20 mx-auto mb-4" />
                <p className="text-[var(--ivory)]/40 text-lg">Select a subject above to view chapters</p>
              </div>
            )}

            {loadingChapters && (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-2 border-[var(--gold)]/30 border-t-[var(--gold)] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[var(--ivory)]/40">Loading chapters...</p>
              </div>
            )}

            {/* Recent History */}
            {history.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[var(--gold)]" />
                  Recent Practice Sessions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {history.slice(0, 6).map(h => (
                    <div key={h.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{h.chapter_name}</p>
                        <p className="text-xs text-[var(--ivory)]/40">{h.subject} • {new Date(h.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${h.accuracy >= 80 ? 'text-emerald-400' : h.accuracy >= 50 ? 'text-[var(--gold)]' : 'text-red-400'}`}>
                          {h.accuracy}%
                        </p>
                        <p className="text-[10px] text-[var(--ivory)]/40">{h.correct_count}/{h.question_count} correct</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ─── STEP 2: Configure Test ─── */
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Selected Chapter Card & Interactive Topic Selector */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--gold)]/10 via-[var(--gold)]/5 to-transparent border-2 border-[var(--gold)]/30 space-y-5 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/20 flex items-center justify-center border border-[var(--gold)]/30">
                    <BookOpen className="w-6 h-6 text-[var(--gold)]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedChapter?.name}</h2>
                    <p className="text-xs text-[var(--ivory)]/60">{selectedSubject} • {selectedExamType.toUpperCase()}</p>
                  </div>
                </div>

                {/* Select All / Clear All Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllSubTopics}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-[var(--ivory)] transition"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllSubTopics}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-[var(--ivory)]/50 transition"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Sub-topics Interactive Checkbox Grid */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--gold)] flex items-center gap-1.5">
                    <span>Select Specific Topics to Practice</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-[var(--gold)]/20 text-[var(--gold)]">
                      {selectedSubTopics.length} of {selectedChapter?.subTopics.length || 0}
                    </span>
                  </p>
                  <span className="text-[10px] text-[var(--ivory)]/40 italic">Click to select/unselect</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedChapter?.subTopics.map(st => {
                    const isChecked = selectedSubTopics.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => toggleSubTopic(st)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                          isChecked
                            ? 'bg-[var(--gold)]/15 border-[var(--gold)]/60 text-[var(--ivory)] shadow-sm'
                            : 'bg-white/[0.03] border-white/10 text-[var(--ivory)]/50 hover:bg-white/[0.06] hover:text-[var(--ivory)]/80'
                        }`}
                      >
                        <span className="text-xs font-semibold">{st}</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0 transition ${
                          isChecked
                            ? 'bg-[var(--gold)] text-[var(--bg-deep)] font-black'
                            : 'border border-white/20'
                        }`}>
                          {isChecked ? '✓' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedSubTopics.length === 0 && (
                  <p className="text-[11px] text-amber-400 font-semibold mt-2 flex items-center gap-1">
                    ⚠️ Please select at least 1 topic above or click &quot;Select All&quot;
                  </p>
                )}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ivory)]/50 mb-3 block">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTY_OPTIONS.map(d => {
                  const Icon = d.icon;
                  return (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        difficulty === d.value
                          ? 'border-opacity-50 bg-opacity-5'
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                      style={difficulty === d.value ? { borderColor: d.color + '80', backgroundColor: d.color + '0D' } : {}}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: d.color }} />
                      <p className="font-bold text-sm" style={difficulty === d.value ? { color: d.color } : {}}>{d.label}</p>
                      <p className="text-[10px] text-[var(--ivory)]/40 mt-1">{d.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ivory)]/50 mb-3 flex items-center gap-2">
                <Hash className="w-3.5 h-3.5" /> Number of Questions
              </label>
              <div className="flex gap-2 flex-wrap">
                {QUESTION_COUNTS.map(n => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      questionCount === n
                        ? 'bg-[var(--gold)] text-[var(--bg-deep)]'
                        : 'bg-white/5 text-[var(--ivory)]/60 hover:bg-white/10'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ivory)]/50 mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Time Limit (minutes)
              </label>
              <div className="flex gap-2 flex-wrap">
                {DURATION_OPTIONS.map(m => (
                  <button
                    key={m}
                    onClick={() => setDurationMinutes(m)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      durationMinutes === m
                        ? 'bg-[var(--saffron)] text-[var(--bg-deep)]'
                        : 'bg-white/5 text-[var(--ivory)]/60 hover:bg-white/10'
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={generating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--gold)] to-[var(--saffron)] text-[var(--bg-deep)] font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--bg-deep)]/30 border-t-[var(--bg-deep)] rounded-full animate-spin" />
                  Generating Questions with AI...
                </>
              ) : isPaidUser === false ? (
                <>
                  <Lock className="w-5 h-5" />
                  Unlock Full Access with Test Pass
                  <ExternalLink className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Start Adaptive Test
                  <ArrowRight className="w-5 h-5" />
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
