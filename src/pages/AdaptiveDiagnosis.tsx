// ============================================================================
// ADAPTIVE DIAGNOSIS REPORT — Warm Parchment / Cream Editorial Theme
// Post-test concept analysis, KaTeX solutions & "Check Yourself" drills
// ============================================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Target, CheckCircle2, XCircle,
  BookOpen, Sparkles, Minus, ChevronDown,
  RotateCcw, ShieldCheck, AlertCircle
} from 'lucide-react';
import { useAdaptiveStore, type QuestionResult } from '../stores/adaptiveStore';
import { MathText } from '../components/MathText';

export function AdaptiveDiagnosis() {
  const navigate = useNavigate();
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [checkingSubTopic, setCheckingSubTopic] = useState<string | null>(null);

  const {
    summary, diagnosis, results,
    selectedChapter, selectedSubject, selectedExamType,
    generateCheckYourselfTest, generating,
    resetTest
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

  // Group results by sub-topic
  const subTopicGroups: Record<string, { correct: number; wrong: number; total: number }> = {};
  for (const r of results) {
    if (!r.subTopic) continue;
    if (!subTopicGroups[r.subTopic]) {
      subTopicGroups[r.subTopic] = { correct: 0, wrong: 0, total: 0 };
    }
    subTopicGroups[r.subTopic].total++;
    if (r.isCorrect) subTopicGroups[r.subTopic].correct++;
    else if (r.status === 'wrong') subTopicGroups[r.subTopic].wrong++;
  }

  const handleRetestWeak = () => {
    resetTest();
    navigate('/adaptive-revision');
  };

  const handleNewChapter = () => {
    resetTest();
    navigate('/adaptive-revision');
  };

  const getScoreColor = () => {
    if (accuracy >= 80) return 'text-emerald-700';
    if (accuracy >= 50) return 'text-amber-800';
    return 'text-red-700';
  };

  const getGrade = () => {
    if (accuracy >= 90) return { label: 'Outstanding Mastery', emoji: '🏆' };
    if (accuracy >= 80) return { label: 'Excellent Conceptual Clarity', emoji: '⭐' };
    if (accuracy >= 60) return { label: 'Good — Needs Targeted Practice', emoji: '👍' };
    if (accuracy >= 40) return { label: 'Needs Remediation', emoji: '📚' };
    return { label: 'Keep Practicing', emoji: '💪' };
  };

  const grade = getGrade();

  return (
    <div className="min-h-screen bg-[#f4ecd8] text-[#1c1815] font-sans relative overflow-x-hidden selection:bg-amber-950 selection:text-amber-200">
      
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-[#f4ecd8]/90 backdrop-blur-xl border-b-2 border-amber-950/20 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 text-amber-300 flex items-center justify-center shadow shrink-0">
              <Brain size={20} />
            </div>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-[#1c1815]">Concept Diagnosis Report</h1>
              <p className="text-[11px] text-amber-950/70 font-semibold">
                {selectedChapter?.name || 'Chapter Revision'} • {selectedSubject} • {selectedExamType?.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRetestWeak}
              className="px-4 py-2 rounded-xl bg-[#1c1815] hover:bg-black text-amber-300 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition cursor-pointer border border-amber-500/30"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Practice Weak Topics</span>
            </button>
            <button
              onClick={handleNewChapter}
              className="px-4 py-2 rounded-xl bg-white/50 hover:bg-white text-[#1c1815] font-bold text-xs border border-amber-950/25 transition cursor-pointer shadow-xs"
            >
              <BookOpen size={14} />
              <span className="hidden sm:inline">New Chapter</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* ─── Score Overview Card ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Main Grade Box */}
          <div className="p-6 rounded-3xl bg-white/60 backdrop-blur-xl border-2 border-amber-950/25 text-center flex flex-col justify-center items-center space-y-2 shadow-sm">
            <span className="text-4xl">{grade.emoji}</span>
            <p className={`text-4xl font-black font-serif ${getScoreColor()}`}>{accuracy}%</p>
            <p className="text-xs font-black uppercase tracking-wider text-amber-950">{grade.label}</p>
            <p className="text-[11px] text-amber-950/60 font-semibold pt-1">
              Score: <strong>{score} marks</strong> • Time: <strong>{minsUsed}m {secsUsed}s</strong>
            </p>
          </div>

          {/* Breakdown Stats */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white/40 border-2 border-amber-950/20 text-center flex flex-col justify-center space-y-1">
              <p className="text-[10px] text-amber-950/60 uppercase font-black tracking-wider">Total Questions</p>
              <p className="text-2xl font-black text-[#1c1815]">{totalQuestions}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-100/70 border-2 border-emerald-300 text-center flex flex-col justify-center space-y-1">
              <p className="text-[10px] text-emerald-800 uppercase font-black tracking-wider">Correct (+4)</p>
              <p className="text-2xl font-black text-emerald-800">{correct}</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-100/70 border-2 border-red-300 text-center flex flex-col justify-center space-y-1">
              <p className="text-[10px] text-red-800 uppercase font-black tracking-wider">Wrong (-1)</p>
              <p className="text-2xl font-black text-red-800">{wrong}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-100/70 border-2 border-amber-300 text-center flex flex-col justify-center space-y-1">
              <p className="text-[10px] text-amber-800 uppercase font-black tracking-wider">Unattempted (0)</p>
              <p className="text-2xl font-black text-amber-800">{skipped}</p>
            </div>
          </div>
        </div>

        {/* ─── Mastered & Weak Concept Breakdown ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Mastered Concepts */}
          <div className="p-6 rounded-3xl bg-emerald-50/60 border-2 border-emerald-300/80 space-y-3 shadow-xs">
            <h3 className="font-serif font-bold text-base text-emerald-950 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-700" />
              <span>Mastered Concepts ({diagnosis.strongSubTopics.length})</span>
            </h3>
            {diagnosis.strongSubTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {diagnosis.strongSubTopics.map(st => (
                  <span key={st} className="px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-700" />
                    <span>{st}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-900/60 italic">Practice more to establish strong concept mastery.</p>
            )}
          </div>

          {/* Weak Areas Needing Remediation */}
          <div className="p-6 rounded-3xl bg-amber-50/60 border-2 border-amber-300/80 space-y-3 shadow-xs">
            <h3 className="font-serif font-bold text-base text-amber-950 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-800" />
              <span>Weak Areas for Remediation ({diagnosis.weakSubTopics.length})</span>
            </h3>
            {diagnosis.weakSubTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {diagnosis.weakSubTopics.map(st => (
                  <span key={st} className="px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold flex items-center gap-1.5">
                    <Target size={13} className="text-amber-800" />
                    <span>{st}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-900/60 italic">All concepts in this test were solved accurately!</p>
            )}
          </div>
        </div>

        {/* ─── Question-Wise Detailed Review & KaTeX Solutions ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#1c1815] flex items-center gap-2">
              <Sparkles size={18} className="text-amber-900" />
              <span>Question-Wise Detailed Solutions</span>
            </h3>
            <span className="text-xs text-amber-950/60 font-semibold">Click on any question to view step-by-step math</span>
          </div>

          <div className="space-y-3">
            {results.map((r: QuestionResult, idx: number) => {
              const isExpanded = expandedQ === r.questionId || (expandedQ === null && idx === 0);
              const isCheckingThis = checkingSubTopic === r.subTopic && generating;

              return (
                <div
                  key={r.questionId}
                  className={`rounded-3xl border-2 transition-all overflow-hidden ${
                    r.status === 'correct'
                      ? 'bg-emerald-50/40 border-emerald-300/70 shadow-xs'
                      : r.status === 'wrong'
                        ? 'bg-red-50/40 border-red-300/70 shadow-xs'
                        : 'bg-white/50 border-amber-950/20'
                  }`}
                >
                  {/* Header Row (Click to toggle) */}
                  <button
                    type="button"
                    onClick={() => setExpandedQ(isExpanded ? '__none__' : r.questionId)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition hover:bg-white/40 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        r.status === 'correct'
                          ? 'bg-emerald-700 text-white'
                          : r.status === 'wrong'
                            ? 'bg-red-700 text-white'
                            : 'bg-amber-950/20 text-amber-950'
                      }`}>
                        {r.questionNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-serif font-bold text-[#1c1815] line-clamp-1">
                          <MathText text={r.questionText?.substring(0, 100) + (r.questionText?.length > 100 ? '...' : '')} />
                        </p>
                        <p className="text-[11px] text-amber-950/60 font-semibold">{r.subTopic}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {r.status === 'correct' && <CheckCircle2 className="text-emerald-700" size={18} />}
                      {r.status === 'wrong' && <XCircle className="text-red-700" size={18} />}
                      {r.status === 'skipped' && <Minus className="text-amber-700" size={18} />}
                      <ChevronDown className={`text-amber-950/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} size={18} />
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 border-t border-amber-950/10 space-y-4 bg-white/30">
                      
                      {/* Full Question Text */}
                      <div className="text-sm sm:text-base font-serif text-[#1c1815] leading-relaxed pt-2">
                        <MathText text={r.questionText} />
                      </div>

                      {/* Options with Highlighted User Answer & Correct Answer */}
                      <div className="space-y-2 pt-2">
                        {r.options?.map((opt: string, i: number) => {
                          const label = String.fromCharCode(65 + i);
                          const isUserAnswer = r.userAnswer === label;
                          const isCorrectAnswer = r.correctAnswer === label;

                          return (
                            <div
                              key={i}
                              className={`p-3.5 rounded-2xl border-2 flex items-start justify-between gap-3 text-xs sm:text-sm ${
                                isCorrectAnswer
                                  ? 'bg-emerald-100/90 border-emerald-400 text-emerald-950 font-bold shadow-xs'
                                  : isUserAnswer && !isCorrectAnswer
                                    ? 'bg-red-100/90 border-red-400 text-red-950 font-bold shadow-xs'
                                    : 'bg-white/60 border-amber-950/15 text-[#1c1815]'
                              }`}
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                  isCorrectAnswer
                                    ? 'bg-emerald-700 text-white'
                                    : isUserAnswer
                                      ? 'bg-red-700 text-white'
                                      : 'bg-amber-950/10 text-amber-950'
                                }`}>
                                  {label}
                                </span>
                                <div className="pt-0.5 leading-relaxed">
                                  <MathText text={opt} />
                                </div>
                              </div>

                              {isCorrectAnswer && (
                                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-700 text-white shrink-0">
                                  Correct Key
                                </span>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-red-700 text-white shrink-0">
                                  Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Step-by-Step KaTeX Explanation */}
                      {r.explanation && (
                        <div className="p-4 rounded-2xl bg-amber-100/80 border-2 border-amber-300/80 space-y-2">
                          <p className="text-[11px] font-black uppercase tracking-wider text-amber-950">
                            💡 Step-by-Step Solution &amp; Mathematical Derivation
                          </p>
                          <div className="text-xs sm:text-sm text-amber-950 leading-relaxed font-serif">
                            <MathText text={r.explanation} />
                          </div>
                        </div>
                      )}

                      {/* Bottom Concept Action: Check Yourself Drill */}
                      <div className="pt-3 border-t border-amber-950/10 flex items-center justify-between flex-wrap gap-3">
                        <div className="text-xs text-amber-950/80 font-bold">
                          <span>Concept Area: <strong className="text-[#1c1815]">{r.subTopic}</strong></span>
                        </div>

                        {r.subTopic && (
                          <button
                            type="button"
                            onClick={() => handleCheckYourself(r.subTopic)}
                            disabled={generating}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-amber-950/10 transition cursor-pointer disabled:opacity-50"
                          >
                            {isCheckingThis ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                                <span>Launching 3 Qs...</span>
                              </>
                            ) : (
                              <>
                                <Target size={14} />
                                <span>Check Yourself (2-3 Similar Qs)</span>
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

        {/* ─── Bottom Actions ─── */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t-2 border-amber-950/20">
          <button
            onClick={handleRetestWeak}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-950/15 transition cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Practice Another Topic</span>
          </button>
          <button
            onClick={handleNewChapter}
            className="flex-1 py-4 rounded-2xl bg-white/70 hover:bg-white text-[#1c1815] font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-amber-950/25 shadow-sm transition cursor-pointer"
          >
            <BookOpen size={16} />
            <span>Choose Another Chapter</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default AdaptiveDiagnosis;
