// ============================================================================
// VIGYANPREP CONCEPT DIAGNOSIS & DETAILED SOLUTIONS
// Production-grade scorecard, concept remediation & step-by-step KaTeX review
// ============================================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target, CheckCircle2, XCircle,
  Minus, ChevronDown,
  RotateCcw, ShieldCheck, AlertCircle, Bookmark,
  ArrowLeft, LayoutDashboard, Sparkles
} from 'lucide-react';
import { useAdaptiveStore, type QuestionResult } from '../stores/adaptiveStore';
import { MathText } from '../components/MathText';

export function AdaptiveDiagnosis() {
  const navigate = useNavigate();
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [checkingSubTopic, setCheckingSubTopic] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'wrong' | 'correct' | 'skipped'>('all');

  const {
    summary, diagnosis, results,
    selectedChapter, selectedSubject, selectedExamType,
    generateCheckYourselfTest, generating,
    resetTest,
    toggleBookmark, isBookmarked
  } = useAdaptiveStore();

  const handleCheckYourself = async (subTopic: string) => {
    const subject = selectedSubject || 'Physics';
    const chapterName = selectedChapter?.name || 'Mechanics & Kinematics';
    setCheckingSubTopic(subTopic);
    try {
      const success = await generateCheckYourselfTest(subject, chapterName, subTopic);
      if (success) {
        navigate('/adaptive-test');
      }
    } finally {
      setCheckingSubTopic(null);
    }
  };

  useEffect(() => {
    if (!summary) {
      navigate('/adaptive-revision');
    }
  }, [summary, navigate]);

  if (!summary || !diagnosis) return null;

  const { totalQuestions, correct, wrong, skipped, score, accuracy, timeTaken } = summary;
  const minsUsed = Math.floor(timeTaken / 60);
  const secsUsed = timeTaken % 60;

  const handleBackToRevision = () => {
    resetTest();
    navigate('/adaptive-revision');
  };

  const getScoreColor = () => {
    if (accuracy >= 80) return 'text-emerald-600';
    if (accuracy >= 50) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getGrade = () => {
    if (accuracy >= 90) return { label: 'Outstanding Mastery', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    if (accuracy >= 80) return { label: 'Excellent Clarity', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    if (accuracy >= 60) return { label: 'Good — Needs Targeted Drills', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    if (accuracy >= 40) return { label: 'Needs Remediation', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
    return { label: 'Keep Practicing', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
  };

  const grade = getGrade();

  // Filtered questions based on active tab
  const filteredResults = results.filter((r: QuestionResult) => {
    if (filterTab === 'wrong') return r.status === 'wrong';
    if (filterTab === 'correct') return r.status === 'correct';
    if (filterTab === 'skipped') return r.status === 'skipped';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col">
      
      {/* ─── Top Header Navigation ─── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToRevision}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Back to Revision"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Syllabus</span>
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <span>Concept Diagnosis &amp; Solutions</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                {selectedChapter?.name || 'Chapter Revision'} · {selectedSubject} · {selectedExamType?.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={handleBackToRevision}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Practice Another Topic</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content Container ─── */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6 flex-1">
        
        {/* ─── 1. Unified Scorecard Hero ─── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: Overall Accuracy & Grade */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-5 lg:pb-0 lg:pr-6">
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                <circle
                  cx="50" cy="50" r="42"
                  stroke={accuracy >= 80 ? '#059669' : accuracy >= 50 ? '#d97706' : '#e11d48'}
                  strokeWidth="10" strokeDasharray="264"
                  strokeDashoffset={264 - (264 * accuracy) / 100}
                  strokeLinecap="round" fill="none"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-black font-mono leading-none ${getScoreColor()}`}>
                  {accuracy}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Accuracy</span>
              </div>
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${grade.bg}`}>
                {grade.label}
              </span>
              <p className="text-xs text-slate-600 font-medium">
                Score: <strong className="text-slate-900">{score} Marks</strong> · Time: <strong className="text-slate-900">{minsUsed}m {secsUsed}s</strong>
              </p>
              <p className="text-[11px] text-slate-400 font-normal">
                {selectedChapter?.name}
              </p>
            </div>
          </div>

          {/* Right: 4 Metric Stat Cards */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Questions</p>
              <p className="text-2xl font-black text-slate-900">{totalQuestions}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Correct (+4)</p>
              <p className="text-2xl font-black text-emerald-700">{correct}</p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-1">
              <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Incorrect (-1)</p>
              <p className="text-2xl font-black text-rose-600">{wrong}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unattempted (0)</p>
              <p className="text-2xl font-black text-slate-600">{skipped}</p>
            </div>
          </div>
        </div>

        {/* ─── 2. Concept Diagnosis & Remediation Breakdown ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Weak Areas Needing Remediation */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={15} className="text-rose-600" />
                <span>Weak Areas for Remediation ({diagnosis.weakSubTopics.length})</span>
              </h3>
            </div>

            {diagnosis.weakSubTopics.length > 0 ? (
              <div className="space-y-2 pt-1">
                {diagnosis.weakSubTopics.map(st => {
                  const isCheckingThis = checkingSubTopic === st && generating;
                  return (
                    <div key={st} className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/70 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Target size={15} className="text-rose-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-900 truncate">{st}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCheckYourself(st)}
                        disabled={generating}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shrink-0 shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {isCheckingThis ? 'Preparing...' : 'Practice 3 Qs →'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium py-3">All tested concepts were answered with high accuracy! 🎉</p>
            )}
          </div>

          {/* Mastered Concepts */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-600" />
              <span>Mastered Concepts ({diagnosis.strongSubTopics.length})</span>
            </h3>

            {diagnosis.strongSubTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {diagnosis.strongSubTopics.map(st => (
                  <span key={st} className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>{st}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium py-3">Practice more chapter drills to build strong concept mastery.</p>
            )}
          </div>
        </div>

        {/* ─── 3. Question-Wise Solutions & KaTeX Derivations ─── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600" />
                <span>Question-Wise Step-by-Step Solutions</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Click any question to view the core scientific concept and derivation</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({results.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('wrong')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterTab === 'wrong' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ❌ Incorrect ({wrong})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('correct')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterTab === 'correct' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✅ Correct ({correct})
              </button>
              {skipped > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterTab('skipped')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterTab === 'skipped' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚪ Skipped ({skipped})
                </button>
              )}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {filteredResults.map((r: QuestionResult, idx: number) => {
              const isExpanded = expandedQ === r.questionId || (expandedQ === null && idx === 0);
              const isCheckingThis = checkingSubTopic === r.subTopic && generating;

              return (
                <div
                  key={r.questionId}
                  className={`rounded-3xl border transition-all overflow-hidden bg-white ${
                    r.status === 'correct'
                      ? 'border-emerald-200'
                      : r.status === 'wrong'
                        ? 'border-rose-200'
                        : 'border-slate-200'
                  }`}
                >
                  {/* Header Row (Click to toggle) */}
                  <button
                    type="button"
                    onClick={() => setExpandedQ(isExpanded ? '__none__' : r.questionId)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition hover:bg-slate-50/80 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        r.status === 'correct'
                          ? 'bg-emerald-600 text-white'
                          : r.status === 'wrong'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                      }`}>
                        {r.questionNumber}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                          <MathText text={r.questionText?.substring(0, 110) + (r.questionText?.length > 110 ? '...' : '')} />
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{r.subTopic}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {r.status === 'correct' && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 size={13} />
                          <span className="hidden sm:inline">+4 Correct</span>
                        </span>
                      )}
                      {r.status === 'wrong' && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1 border border-rose-200">
                          <XCircle size={13} />
                          <span className="hidden sm:inline">-1 Incorrect</span>
                        </span>
                      )}
                      {r.status === 'skipped' && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1 border border-slate-200">
                          <Minus size={13} />
                          <span className="hidden sm:inline">0 Skipped</span>
                        </span>
                      )}
                      <ChevronDown className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} size={18} />
                    </div>
                  </button>

                  {/* Expanded Solution Drawer */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/40">
                      
                      {/* Full Question Statement */}
                      <div className="text-sm sm:text-base text-slate-900 leading-relaxed pt-2">
                        <MathText text={r.questionText} />
                      </div>

                      {/* Options Grid */}
                      <div className="space-y-2 pt-2">
                        {r.options?.map((opt: string, i: number) => {
                          const label = String.fromCharCode(65 + i);
                          const isUserAnswer = r.userAnswer === label;
                          const isCorrectAnswer = r.correctAnswer === label;

                          return (
                            <div
                              key={i}
                              className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-xs sm:text-sm ${
                                isCorrectAnswer
                                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                                  : isUserAnswer && !isCorrectAnswer
                                    ? 'bg-rose-50/90 border-rose-300 text-rose-950 font-bold shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                  isCorrectAnswer
                                    ? 'bg-emerald-600 text-white'
                                    : isUserAnswer
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {label}
                                </span>
                                <div className="pt-0.5 leading-relaxed">
                                  <MathText text={opt} />
                                </div>
                              </div>

                              {isCorrectAnswer && (
                                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white shrink-0">
                                  Correct Key
                                </span>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-rose-600 text-white shrink-0">
                                  Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Step-by-Step KaTeX Explanation */}
                      {r.explanation && (
                        <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2.5">
                          <p className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                            <Sparkles size={14} />
                            <span>Step-by-Step Solution &amp; Conceptual Derivation</span>
                          </p>
                          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
                            <MathText text={r.explanation} />
                          </div>
                        </div>
                      )}

                      {/* Bottom Bar: Bookmark Question + Check Yourself Drill */}
                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-slate-600 font-medium">
                            <span>Concept: <strong className="text-slate-900">{r.subTopic}</strong></span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleBookmark({
                              questionId: r.questionId,
                              questionText: r.questionText,
                              options: r.options,
                              correctAnswer: r.correctAnswer,
                              explanation: r.explanation,
                              subTopic: r.subTopic,
                            })}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                              isBookmarked(r.questionId)
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title={isBookmarked(r.questionId) ? 'Remove bookmark' : 'Bookmark question for later'}
                          >
                            <Bookmark size={14} fill={isBookmarked(r.questionId) ? 'currentColor' : 'none'} />
                            <span>{isBookmarked(r.questionId) ? 'Bookmarked' : 'Bookmark'}</span>
                          </button>
                        </div>

                        {r.subTopic && (
                          <button
                            type="button"
                            onClick={() => handleCheckYourself(r.subTopic)}
                            disabled={generating}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                          >
                            {isCheckingThis ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Generating 3 Qs...</span>
                              </>
                            ) : (
                              <>
                                <Target size={14} />
                                <span>Check Yourself (2-3 Similar Qs) →</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 4. Bottom Action Footer ─── */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
          <button
            onClick={handleBackToRevision}
            className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Practice Another Topic</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200 shadow-xs transition cursor-pointer"
          >
            <LayoutDashboard size={16} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default AdaptiveDiagnosis;
