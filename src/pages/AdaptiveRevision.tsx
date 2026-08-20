// ============================================================================
// VIGYANPREP CHAPTER REVISION & MASTERY DRILLS
// EdTech Curriculum & Practice Navigation (Khan Academy / Allen inspired)
// ============================================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, ArrowRight, Target, Clock,
  ChevronRight, BarChart3,
  ArrowLeft, Flame, Shield, Lock, ExternalLink,
  Search, Atom, FlaskConical, Calculator, Dna,
  Play, Layers
} from 'lucide-react';
import { useAdaptiveStore, type ChapterDef } from '../stores/adaptiveStore';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';

const EXAM_OPTIONS = [
  { value: 'iat', label: 'IISER IAT', desc: '60 Qs · 3 hrs · PCMB' },
  { value: 'nest', label: 'NISER NEST', desc: '80 Qs · 3.5 hrs · PCMB' },
  { value: 'isi', label: 'ISI Entrance', desc: '30 Qs · 2 hrs · Math Only' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Foundation', icon: Shield, color: '#16a34a', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Core concepts & fundamental laws' },
  { value: 'medium', label: 'Standard Exam', icon: Target, color: '#d97706', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'Real IAT / NEST examination level' },
  { value: 'hard', label: 'Advanced', icon: Flame, color: '#dc2626', bg: 'bg-red-50', border: 'border-red-200', desc: 'Multi-concept Olympiad & JEE Adv' },
];

const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30];
const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

const SUBJECT_META: Record<string, { icon: typeof Atom; gradient: string; lightBg: string; accent: string; emoji: string; border: string }> = {
  'Physics': { icon: Atom, gradient: 'from-blue-600 to-indigo-700', lightBg: 'bg-blue-50/70', accent: 'text-blue-700', emoji: '⚛️', border: 'border-blue-200' },
  'Chemistry': { icon: FlaskConical, gradient: 'from-emerald-600 to-teal-700', lightBg: 'bg-emerald-50/70', accent: 'text-emerald-700', emoji: '⚗️', border: 'border-emerald-200' },
  'Mathematics': { icon: Calculator, gradient: 'from-violet-600 to-purple-700', lightBg: 'bg-violet-50/70', accent: 'text-violet-700', emoji: '📐', border: 'border-violet-200' },
  'Biology': { icon: Dna, gradient: 'from-rose-500 to-pink-700', lightBg: 'bg-rose-50/70', accent: 'text-rose-700', emoji: '🧬', border: 'border-rose-200' },
};

function resolveToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(^| )student_token=([^;]+)/) ||
                document.cookie.match(/(^| )auth_token=([^;]+)/);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [countdown, setCountdown] = useState<number>(10);
  const [loadingPhase, setLoadingPhase] = useState<number>(0);
  const [loadingAttemptId, setLoadingAttemptId] = useState<string | null>(null);

  const {
    selectedExamType, selectedSubject, selectedChapter,
    selectedSubTopics, toggleSubTopic, selectAllSubTopics, clearAllSubTopics,
    questionCount, durationMinutes, difficulty,
    chapters, subjects, loadingChapters, generating, error,
    mastery, history,
    setExamType, setSubject, setChapter,
    setQuestionCount, setDurationMinutes, setDifficulty,
    fetchChapters, generateTest, fetchMastery, resetTest,
    loadAttemptDetails
  } = useAdaptiveStore();

  useEffect(() => {
    fetchChapters(selectedExamType);
    fetchMastery();
    resetTest();

    const checkAccess = async () => {
      setCheckingAccess(true);
      const token = resolveToken();
      if (!token) { setIsPaidUser(false); setCheckingAccess(false); return; }
      try {
        const res = await fetch(`${API_URL}/api/adaptive/check-access`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setIsPaidUser(data.isPaid === true);
      } catch { setIsPaidUser(true); }
      finally { setCheckingAccess(false); }
    };
    checkAccess();
  }, [selectedExamType]);

  useEffect(() => {
    let timer: any = null;
    if (generating) {
      setCountdown(10);
      setLoadingPhase(0);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) return 1;
          const next = prev - 1;
          if (next <= 3) setLoadingPhase(2);
          else if (next <= 7) setLoadingPhase(1);
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [generating]);

  const handleStart = async () => {
    if (isPaidUser === false) { window.open('https://vigyanprep.com/tests', '_blank'); return; }
    const success = await generateTest();
    if (success) navigate('/adaptive-test');
  };

  const handleViewAttempt = async (attemptId: string) => {
    setLoadingAttemptId(attemptId);
    const success = await loadAttemptDetails(attemptId);
    setLoadingAttemptId(null);
    if (success) navigate('/adaptive-diagnosis');
  };

  const handleSelectChapter = (ch: ChapterDef) => {
    setChapter(ch);
    setStep('configure');
  };

  const getChapterMastery = (subject: string, chapterName: string) => {
    return mastery.find(m => m.subject === subject && m.chapterName === chapterName);
  };

  const activeSubjectMeta = selectedSubject && SUBJECT_META[selectedSubject]
    ? SUBJECT_META[selectedSubject]
    : SUBJECT_META['Physics'];

  const filteredChapters = selectedSubject && chapters[selectedSubject]
    ? chapters[selectedSubject].filter(ch =>
        searchQuery.trim() === '' ||
        ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.subTopics.some(st => st.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col">

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (step === 'configure') {
                  setStep('select');
                } else {
                  navigate('/dashboard');
                }
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                <span>VigyanPrep Revision Drill</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Official syllabus practice, concept mastery & diagnostic analysis
              </p>
            </div>
          </div>

          {/* Exam Selector Switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {EXAM_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  setExamType(opt.value);
                  setStep('select');
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedExamType === opt.value
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Two-Column Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ═══════════ LEFT SIDEBAR (Sticky Navigation & History) ═══════════ */}
        <aside className="lg:col-span-4 xl:col-span-4 space-y-5">

          {/* 1. Subjects Navigation */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Select Subject</span>
              <span className="text-[10px] font-mono text-slate-400">{subjects.length} Subjects</span>
            </h2>

            <div className="space-y-1.5">
              {subjects.map(subj => {
                const meta = SUBJECT_META[subj] || SUBJECT_META['Physics'];
                const count = chapters[subj]?.length || 0;
                const isSelected = selectedSubject === subj;
                const IconComponent = meta.icon;

                return (
                  <button
                    key={subj}
                    onClick={() => {
                      setSubject(subj);
                      if (step === 'configure') setStep('select');
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between gap-3 transition text-left cursor-pointer border ${
                      isSelected
                        ? `bg-slate-900 text-white border-slate-900 shadow-sm`
                        : `bg-slate-50/70 text-slate-700 border-slate-200/60 hover:bg-slate-100/80 hover:border-slate-300`
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/15 text-white' : `${meta.lightBg} ${meta.accent}`
                      }`}>
                        <IconComponent size={18} />
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="text-sm font-bold truncate">{subj}</p>
                        <p className={`text-[11px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                          {count} Chapters
                        </p>
                      </div>
                    </div>

                    <ChevronRight size={16} className={`shrink-0 transition ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Recent Practice Sessions (Always Visible in Left Sidebar) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 size={14} className="text-slate-400" />
                <span>Recent Practice</span>
              </h2>
              {history.length > 0 && (
                <span className="text-[10px] font-mono text-slate-400">{history.length} Attempted</span>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs text-slate-400 font-medium">No practice attempts yet</p>
                <p className="text-[11px] text-slate-400">Complete chapter drills to track your accuracy and review concepts here.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {history.slice(0, 8).map(h => {
                  const isLoading = loadingAttemptId === h.id;
                  const isGreat = h.accuracy >= 80;
                  const isModerate = h.accuracy >= 50;

                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleViewAttempt(h.id)}
                      disabled={isLoading}
                      className="w-full p-3 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-indigo-300 hover:bg-white hover:shadow-xs transition text-left cursor-pointer group disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                          {h.chapter_name}
                        </p>
                        <span className={`text-xs font-black shrink-0 ${
                          isGreat ? 'text-emerald-600' : isModerate ? 'text-amber-600' : 'text-rose-500'
                        }`}>
                          {h.accuracy}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                        <span>{h.subject} · {new Date(h.created_at).toLocaleDateString()}</span>
                        <span>{h.correct_count}/{h.question_count} Correct</span>
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-slate-200/50 text-[10px] font-bold text-indigo-600">
                        <span>View Concept Solutions</span>
                        {isLoading ? (
                          <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ChevronRight size={12} className="group-hover:translate-x-0.5 transition" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ═══════════ MAIN CONTENT AREA (Chapters or Configuration) ═══════════ */}
        <main className="lg:col-span-8 xl:col-span-8 space-y-5">

          {/* Paid / Gate Banner if needed */}
          {isPaidUser === false && !checkingAccess && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950 uppercase tracking-wide">Test Series Feature</p>
                  <p className="text-xs text-amber-900/80 font-medium">Unlock unlimited syllabus revision drills with any VigyanPrep test pack.</p>
                </div>
              </div>
              <a
                href="https://vigyanprep.com/tests" target="_blank" rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-xs transition flex items-center gap-1.5"
              >
                <span>Unlock Pass</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <Shield size={16} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {step === 'select' ? (
            /* ─────────────────────────────────────────────────────────────
               STEP 1: CHAPTERS CURRICULUM (Khan Academy Style)
               ───────────────────────────────────────────────────────────── */
            <div className="space-y-4">

              {/* Subject Curriculum Header & Search */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <span>{activeSubjectMeta.emoji}</span>
                      <span>{selectedSubject} Syllabus</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {selectedExamType.toUpperCase()} Examination · {filteredChapters.length} Chapters Available
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-72">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search chapters or topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Loading Syllabus */}
              {loadingChapters && (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-500">Loading syllabus curriculum...</p>
                </div>
              )}

              {/* No Chapters Filter Result */}
              {!loadingChapters && filteredChapters.length === 0 && (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-2">
                  <BookOpen size={32} className="text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No chapters match your search</p>
                  <button onClick={() => setSearchQuery('')} className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">
                    Clear search filter
                  </button>
                </div>
              )}

              {/* Chapters List */}
              <div className="space-y-3">
                {filteredChapters.map((ch, idx) => {
                  const chMastery = selectedSubject ? getChapterMastery(selectedSubject, ch.name) : null;
                  const masteryPct = chMastery ? Math.round(chMastery.overallMastery) : 0;

                  return (
                    <div
                      key={ch.name}
                      className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px] font-bold shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                            {ch.name}
                          </h3>
                        </div>

                        {/* Subtopics Preview */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {ch.subTopics.slice(0, 3).map(st => (
                            <span key={st} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-medium truncate max-w-[220px]">
                              {st}
                            </span>
                          ))}
                          {ch.subTopics.length > 3 && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                              +{ch.subTopics.length - 3} more topics
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Action & Mastery */}
                      <div className="flex items-center gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-between sm:justify-end">
                        {masteryPct > 0 ? (
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-600 font-mono">{masteryPct}%</span>
                            <p className="text-[10px] text-slate-400 font-medium">Mastered</p>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-[11px] font-bold text-slate-400">Ready</span>
                            <p className="text-[10px] text-slate-400 font-medium">{ch.subTopics.length} Topics</p>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSelectChapter(ch)}
                          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                        >
                          <Play size={13} fill="currentColor" />
                          <span>Practice Drill</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
               STEP 2: CONFIGURE DRILL (EdTech Clean Setup Panel)
               ───────────────────────────────────────────────────────────── */
            <div className="space-y-5">

              {/* Breadcrumb & Chapter Title */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <button
                      onClick={() => setStep('select')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition cursor-pointer mb-2"
                    >
                      <ArrowLeft size={13} />
                      <span>Back to {selectedSubject} Chapters</span>
                    </button>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{selectedChapter?.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {selectedSubject} · {selectedExamType.toUpperCase()} Examination
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" onClick={selectAllSubTopics}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition cursor-pointer"
                    >Select All</button>
                    <button type="button" onClick={clearAllSubTopics}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
                    >Clear</button>
                  </div>
                </div>

                {/* Sub-topic Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Choose Concept Areas</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-mono text-[10px] font-bold">
                        {selectedSubTopics.length}/{selectedChapter?.subTopics.length || 0}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedChapter?.subTopics.map(st => {
                      const isChecked = selectedSubTopics.includes(st);
                      return (
                        <button
                          key={st} type="button"
                          onClick={() => toggleSubTopic(st)}
                          className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer text-xs font-semibold leading-relaxed ${
                            isChecked
                              ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs'
                              : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <span>{st}</span>
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition text-[10px] font-black ${
                            isChecked ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300'
                          }`}>
                            {isChecked ? '✓' : ''}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedSubTopics.length === 0 && (
                    <p className="text-xs text-rose-600 font-medium bg-rose-50 p-3 rounded-2xl border border-rose-100">
                      ⚠️ Please select at least 1 sub-topic or click "Select All" to proceed.
                    </p>
                  )}
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Difficulty Level</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DIFFICULTY_OPTIONS.map(d => {
                    const isSelected = difficulty === d.value;
                    const IconComp = d.icon;
                    return (
                      <button
                        key={d.value} type="button"
                        onClick={() => setDifficulty(d.value)}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                          isSelected
                            ? `${d.bg} ${d.border} ring-2 ring-indigo-500/20 shadow-xs`
                            : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <IconComp size={16} style={{ color: d.color }} />
                          <span className="font-bold text-xs text-slate-900">{d.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{d.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Count & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Questions */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} />
                    <span>Number of Questions</span>
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {QUESTION_COUNTS.map(cnt => (
                      <button
                        key={cnt} type="button"
                        onClick={() => setQuestionCount(cnt)}
                        className={`px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs transition cursor-pointer ${
                          questionCount === cnt
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >{cnt}</button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>Timer Limit</span>
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {DURATION_OPTIONS.map(m => (
                      <button
                        key={m} type="button"
                        onClick={() => setDurationMinutes(m)}
                        className={`px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs transition cursor-pointer ${
                          durationMinutes === m
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >{m}m</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStart}
                disabled={generating || selectedSubTopics.length === 0}
                className="w-full py-4.5 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm tracking-wide flex items-center justify-center shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <div className="flex flex-col items-center justify-center gap-1 w-full py-0.5">
                    <div className="flex items-center justify-center gap-2.5">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      <span className="font-bold text-sm tracking-wide">
                        {countdown > 1
                          ? `Please wait... preparing ${questionCount} questions`
                          : 'Almost ready, launching your test...'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs font-black">
                        {countdown}s
                      </span>
                    </div>
                    <p className="text-[11px] text-white/80 font-normal">
                      {loadingPhase === 0
                        ? 'Fetching concepts & syllabus parameters...'
                        : loadingPhase === 1
                        ? 'Compiling questions, options & scientific notations...'
                        : 'Finalizing KaTeX equations and step-by-step solutions...'}
                    </p>
                  </div>
                ) : isPaidUser === false ? (
                  <div className="flex items-center justify-center gap-2">
                    <Lock size={18} />
                    <span>Unlock with Test Pass</span>
                    <ExternalLink size={16} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Play size={16} fill="currentColor" />
                    <span>Start Revision Drill ({questionCount} Qs · {durationMinutes}m)</span>
                    <ArrowRight size={18} />
                  </div>
                )}
              </button>

            </div>
          )}

        </main>

      </div>

    </div>
  );
}

export default AdaptiveRevision;
