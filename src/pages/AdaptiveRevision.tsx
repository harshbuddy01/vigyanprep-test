// ============================================================================
// ADAPTIVE REVISION LAUNCHER — Modern Clean Design
// Inspired by Khan Academy / Unacademy subject-wise chapter navigation
// ============================================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, BookOpen, ArrowRight, Target, Clock, Hash,
  ChevronRight, Sparkles, BarChart3, AlertTriangle,
  ArrowLeft, Flame, Shield, Lock, CheckCircle2, ExternalLink,
  Search, Atom, FlaskConical, Calculator, Dna
} from 'lucide-react';
import { useAdaptiveStore } from '../stores/adaptiveStore';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';

const EXAM_OPTIONS = [
  { value: 'iat', label: 'IISER IAT', desc: '60 Qs · 3 hrs · PCMB' },
  { value: 'nest', label: 'NISER NEST', desc: '80 Qs · 3.5 hrs · Best 3 of 4' },
  { value: 'isi', label: 'ISI Entrance', desc: '30 Qs · 2 hrs · Math Only' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Foundation', icon: Shield, color: '#16a34a', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Core concepts & basics' },
  { value: 'medium', label: 'Standard Exam', icon: Target, color: '#d97706', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'Real IAT / NEST level' },
  { value: 'hard', label: 'Advanced', icon: Flame, color: '#dc2626', bg: 'bg-red-50', border: 'border-red-200', desc: 'Multi-concept Olympiad' },
];

const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30];
const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

const SUBJECT_META: Record<string, { icon: typeof Atom; gradient: string; lightBg: string; accent: string; emoji: string }> = {
  'Physics': { icon: Atom, gradient: 'from-blue-600 to-indigo-700', lightBg: 'bg-blue-50', accent: 'text-blue-700', emoji: '⚛️' },
  'Chemistry': { icon: FlaskConical, gradient: 'from-emerald-600 to-teal-700', lightBg: 'bg-emerald-50', accent: 'text-emerald-700', emoji: '⚗️' },
  'Mathematics': { icon: Calculator, gradient: 'from-violet-600 to-purple-700', lightBg: 'bg-violet-50', accent: 'text-violet-700', emoji: '📐' },
  'Biology': { icon: Dna, gradient: 'from-rose-500 to-pink-700', lightBg: 'bg-rose-50', accent: 'text-rose-700', emoji: '🧬' },
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

  const getChapterMastery = (subject: string, chapterName: string) => {
    return mastery.find(m => m.subject === subject && m.chapterName === chapterName);
  };

  const filteredChapters = selectedSubject && chapters[selectedSubject]
    ? chapters[selectedSubject].filter(ch =>
        searchQuery.trim() === '' ||
        ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.subTopics.some(st => st.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const subjectMeta = (subj: string) => SUBJECT_META[subj] || SUBJECT_META['Physics'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 text-gray-900 font-sans">

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/80 px-4 sm:px-8 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { if (step === 'configure') setStep('select'); else navigate('/dashboard'); }}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Brain size={22} className="text-indigo-600" />
                <span>Smart Topic Revision</span>
              </h1>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
                AI-powered chapter-wise practice with step-by-step solutions
              </p>
            </div>
          </div>

          {/* Exam Selector — Clean Segmented Control */}
          <div className="flex items-center bg-gray-100 rounded-2xl p-1 gap-0.5">
            {EXAM_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setExamType(opt.value); setSearchQuery(''); }}
                className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedExamType === opt.value
                    ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="hidden sm:inline">{opt.label}</span>
                <span className="sm:hidden">{opt.value.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm font-medium">
            <AlertTriangle size={18} className="shrink-0 text-red-500" />
            <p>{error}</p>
          </div>
        )}

        {/* 🔒 Paid Lock Banner */}
        {!checkingAccess && isPaidUser === false && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border border-indigo-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Lock size={22} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>Unlock Smart AI Revision</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold uppercase">PRO</span>
                </h3>
                <p className="text-xs text-gray-600 max-w-lg leading-relaxed">
                  AI-generated chapter tests with step-by-step KaTeX solutions, mistake tracking, and adaptive remediation. Available with any test pass.
                </p>
                <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-gray-700 font-medium">
                  <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-600" /> Unlimited Practice</span>
                  <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-600" /> Mistake Tracking</span>
                  <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-600" /> KaTeX Solutions</span>
                </div>
              </div>
            </div>
            <a
              href="https://vigyanprep.com/tests"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition shadow-lg cursor-pointer"
            >
              <span>Get Test Pass</span>
              <ExternalLink size={14} />
            </a>
          </div>
        )}

        {step === 'select' ? (
          /* ═══════════ STEP 1: Subject & Chapter Selection ═══════════ */
          <div className="space-y-6">

            {/* Subject Tabs — Icon + Color */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {subjects.map(subj => {
                const meta = subjectMeta(subj);
                const isActive = selectedSubject === subj;
                const Icon = meta.icon;
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => { setSubject(subj); setSearchQuery(''); }}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? `bg-gradient-to-r ${meta.gradient} text-white shadow-lg shadow-${subj === 'Physics' ? 'blue' : subj === 'Chemistry' ? 'emerald' : subj === 'Mathematics' ? 'violet' : 'rose'}-500/20`
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white/90' : ''} />
                    <span>{subj}</span>
                    {chapters[subj] && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {chapters[subj].length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            {selectedSubject && (
              <div className="relative max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${selectedSubject} chapters...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition shadow-sm"
                />
              </div>
            )}

            {/* Chapter Cards */}
            {selectedSubject && filteredChapters.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChapters.map((ch, idx) => {
                  const cm = getChapterMastery(selectedSubject, ch.name);
                  const meta = subjectMeta(selectedSubject);
                  const masteryPct = cm?.overallMastery || 0;

                  return (
                    <div
                      key={ch.name}
                      onClick={() => { setChapter(ch); setStep('configure'); }}
                      className="group relative p-5 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                    >
                      {/* Top accent bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${meta.gradient} opacity-60 group-hover:opacity-100 transition`} />

                      <div className="space-y-3 pt-1">
                        {/* Chapter Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl ${meta.lightBg} ${meta.accent} flex items-center justify-center text-sm font-black shrink-0`}>
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-sm text-gray-900 group-hover:text-gray-950 leading-tight line-clamp-2">
                                {ch.name}
                              </h3>
                              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                                {ch.subTopics.length} sub-topics
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
                        </div>

                        {/* Sub-topic Chips (first 3) */}
                        <div className="flex flex-wrap gap-1.5">
                          {ch.subTopics.slice(0, 3).map(st => (
                            <span key={st} className="px-2 py-0.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-medium truncate max-w-[160px]">
                              {st.split('(')[0].trim()}
                            </span>
                          ))}
                          {ch.subTopics.length > 3 && (
                            <span className="px-2 py-0.5 rounded-lg bg-gray-50 text-gray-400 text-[10px] font-medium">
                              +{ch.subTopics.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Mastery — Mini Ring + Bar */}
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                          {/* Mini circular ring */}
                          <div className="relative w-10 h-10 shrink-0">
                            <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                              <circle cx="18" cy="18" r="15" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                              <circle
                                cx="18" cy="18" r="15" fill="none"
                                stroke={masteryPct >= 80 ? '#16a34a' : masteryPct >= 40 ? '#d97706' : '#e5e7eb'}
                                strokeWidth="3"
                                strokeDasharray={`${masteryPct * 0.9425} 94.25`}
                                strokeLinecap="round"
                                className="transition-all duration-700"
                              />
                            </svg>
                            <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-black ${
                              masteryPct > 0 ? (masteryPct >= 80 ? 'text-emerald-700' : 'text-amber-700') : 'text-gray-300'
                            }`}>
                              {masteryPct > 0 ? `${masteryPct}%` : '—'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Mastery</p>
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mt-1">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${masteryPct}%`,
                                  backgroundColor: masteryPct >= 80 ? '#16a34a' : masteryPct >= 40 ? '#d97706' : '#e5e7eb'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State — No Subject Selected */}
            {!selectedSubject && !loadingChapters && (
              <div className="text-center py-20 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                  <BookOpen size={36} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-700">Select a Subject</h3>
                  <p className="text-sm text-gray-400 mt-1">Choose Physics, Chemistry, Mathematics, or Biology to browse chapters</p>
                </div>
              </div>
            )}

            {/* Empty State — Search No Results */}
            {selectedSubject && filteredChapters.length === 0 && searchQuery && (
              <div className="text-center py-16 space-y-3">
                <Search size={36} className="text-gray-300 mx-auto" />
                <p className="text-gray-500 font-medium">No chapters match "{searchQuery}"</p>
                <button onClick={() => setSearchQuery('')} className="text-indigo-600 text-sm font-bold cursor-pointer hover:underline">Clear search</button>
              </div>
            )}

            {loadingChapters && (
              <div className="text-center py-20 space-y-3">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-medium text-gray-500">Loading syllabus...</p>
              </div>
            )}

            {/* Recent Sessions */}
            {history.length > 0 && (
              <div className="pt-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <BarChart3 size={16} className="text-gray-400" />
                  <span>Recent Practice Sessions</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {history.slice(0, 4).map(h => (
                    <div key={h.id} className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{h.chapter_name}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{h.subject} · {new Date(h.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-lg ${h.accuracy >= 80 ? 'text-emerald-600' : h.accuracy >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                          {h.accuracy}%
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">{h.correct_count}/{h.question_count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ═══════════ STEP 2: Configure Test ═══════════ */
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Chapter Header + Sub-Topic Selector */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subjectMeta(selectedSubject || 'Physics').gradient} text-white flex items-center justify-center shadow shrink-0`}>
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedChapter?.name}</h2>
                    <p className="text-xs text-gray-500 font-medium">{selectedSubject} · {selectedExamType.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={selectAllSubTopics}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition cursor-pointer"
                  >Select All</button>
                  <button type="button" onClick={clearAllSubTopics}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition cursor-pointer"
                  >Clear</button>
                </div>
              </div>

              {/* Sub-topic Pills */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Select Sub-Topics</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-mono text-[10px] font-bold">
                      {selectedSubTopics.length}/{selectedChapter?.subTopics.length || 0}
                    </span>
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedChapter?.subTopics.map(st => {
                    const isChecked = selectedSubTopics.includes(st);
                    return (
                      <button
                        key={st} type="button"
                        onClick={() => toggleSubTopic(st)}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition cursor-pointer text-xs font-semibold leading-tight ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300'
                        }`}
                      >
                        <span>{st}</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition text-[10px] font-black ${
                          isChecked ? 'bg-indigo-600 text-white' : 'border-2 border-gray-300'
                        }`}>
                          {isChecked ? '✓' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedSubTopics.length === 0 && (
                  <p className="text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-xl border border-red-100">
                    ⚠️ Select at least 1 topic or click "Select All"
                  </p>
                )}
              </div>
            </div>

            {/* Difficulty */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Difficulty Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DIFFICULTY_OPTIONS.map(d => {
                  const Icon = d.icon;
                  const isSelected = difficulty === d.value;
                  return (
                    <button
                      key={d.value} type="button"
                      onClick={() => setDifficulty(d.value)}
                      className={`p-4 rounded-2xl border text-center transition cursor-pointer ${
                        isSelected
                          ? `${d.bg} ${d.border} border-2 shadow-sm`
                          : 'bg-gray-50 border-gray-200 hover:bg-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: d.color }} />
                      <p className={`font-bold text-xs ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{d.label}</p>
                      <p className="text-[10px] mt-0.5 text-gray-400">{d.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Hash size={14} /> <span>Questions</span>
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {QUESTION_COUNTS.map(n => (
                    <button
                      key={n} type="button"
                      onClick={() => setQuestionCount(n)}
                      className={`px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs transition cursor-pointer ${
                        questionCount === n
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >{n}</button>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} /> <span>Duration (Mins)</span>
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {DURATION_OPTIONS.map(m => (
                    <button
                      key={m} type="button"
                      onClick={() => setDurationMinutes(m)}
                      className={`px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs transition cursor-pointer ${
                        durationMinutes === m
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center shadow-xl shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <div className="flex flex-col items-center justify-center gap-1 w-full py-0.5">
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span className="font-bold text-sm tracking-wide normal-case">
                      {countdown > 1
                        ? `Please wait... preparing ${questionCount} questions`
                        : 'Almost ready, launching your test...'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs font-black">
                      {countdown}s
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80 font-medium normal-case tracking-normal">
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
                  <Sparkles size={18} />
                  <span>Start Practice ({questionCount} Qs · {durationMinutes}m)</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdaptiveRevision;
