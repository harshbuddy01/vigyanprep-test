// =============================================
// ADAPTIVE DIAGNOSIS PAGE
// Post-test analysis: concept mastery & weak areas
// =============================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Target, AlertTriangle, CheckCircle2, XCircle,
  BookOpen, Sparkles, Award, BarChart3,
  ChevronDown, Minus
} from 'lucide-react';
import { useAdaptiveStore, type QuestionResult } from '../stores/adaptiveStore';
import { MathText } from '../components/MathText';
import { useState } from 'react';

export function AdaptiveDiagnosis() {
  const navigate = useNavigate();
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  const {
    summary, diagnosis, results,
    selectedChapter, selectedSubject, selectedExamType,
    generateCheckYourselfTest, generating,
    resetTest
  } = useAdaptiveStore();

  const handleCheckYourself = async (subTopic: string) => {
    if (!selectedSubject || !selectedChapter) return;
    const success = await generateCheckYourselfTest(selectedSubject, selectedChapter.name, subTopic);
    if (success) {
      navigate('/adaptive-test');
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
    if (accuracy >= 80) return '#4ade80';
    if (accuracy >= 50) return '#d4a520';
    return '#f87171';
  };

  const getGrade = () => {
    if (accuracy >= 90) return { label: 'Outstanding', emoji: '🏆' };
    if (accuracy >= 80) return { label: 'Excellent', emoji: '⭐' };
    if (accuracy >= 60) return { label: 'Good', emoji: '👍' };
    if (accuracy >= 40) return { label: 'Needs Improvement', emoji: '📚' };
    return { label: 'Keep Practicing', emoji: '💪' };
  };

  const grade = getGrade();

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--ivory)]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg-deep)]/80 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-[var(--gold)]" />
            <div>
              <h1 className="font-bold text-lg">Concept Diagnosis Report</h1>
              <p className="text-xs text-[var(--ivory)]/50">
                {selectedChapter?.name} • {selectedSubject} • {selectedExamType?.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetestWeak}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--saffron)] text-[var(--bg-deep)] font-bold text-sm hover:bg-[var(--saffron)]/90 transition-colors"
            >
              <Target className="w-4 h-4" /> Retest Weak Concepts
            </button>
            <button
              onClick={handleNewChapter}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> New Chapter
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* ─── Score Card ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Score */}
          <div className="md:col-span-1 p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 text-center">
            <p className="text-5xl mb-1">{grade.emoji}</p>
            <p className="text-4xl font-bold mb-1" style={{ color: getScoreColor() }}>{accuracy}%</p>
            <p className="text-sm font-semibold" style={{ color: getScoreColor() }}>{grade.label}</p>
            <p className="text-xs text-[var(--ivory)]/40 mt-2">Score: {score} • Time: {minsUsed}m {secsUsed}s</p>
          </div>

          {/* Stats Grid */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-2xl font-bold text-emerald-400">{correct}</p>
              <p className="text-[10px] text-[var(--ivory)]/40 uppercase font-bold tracking-wider mt-1">Correct</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-2xl font-bold text-red-400">{wrong}</p>
              <p className="text-[10px] text-[var(--ivory)]/40 uppercase font-bold tracking-wider mt-1">Wrong</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-2xl font-bold text-[var(--ivory)]/40">{skipped}</p>
              <p className="text-[10px] text-[var(--ivory)]/40 uppercase font-bold tracking-wider mt-1">Skipped</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-2xl font-bold text-[var(--gold)]">{totalQuestions}</p>
              <p className="text-[10px] text-[var(--ivory)]/40 uppercase font-bold tracking-wider mt-1">Total</p>
            </div>
          </div>
        </div>

        {/* ─── AI Recommendation ─── */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[var(--gold)]/5 to-transparent border border-[var(--gold)]/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[var(--gold)] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-[var(--gold)] mb-1">AI Recommendation</h3>
              <p className="text-sm text-[var(--ivory)]/70">{diagnosis.recommendation}</p>
            </div>
          </div>
        </div>

        {/* ─── Sub-Topic Mastery Breakdown ─── */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--gold)]" />
            Concept-Wise Breakdown
          </h2>

          <div className="space-y-3">
            {Object.entries(subTopicGroups).map(([topic, stats]) => {
              const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
              const isWeak = diagnosis.weakSubTopics.includes(topic);
              const isStrong = diagnosis.strongSubTopics.includes(topic);

              return (
                <div key={topic} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isWeak && <AlertTriangle className="w-4 h-4 text-red-400" />}
                      {isStrong && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {!isWeak && !isStrong && <Minus className="w-4 h-4 text-[var(--ivory)]/30" />}
                      <span className="font-semibold text-sm">{topic}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-400">{stats.correct} ✓</span>
                      <span className="text-red-400">{stats.wrong} ✗</span>
                      <span className={`font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-[var(--gold)]' : 'text-red-400'}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 80 ? '#4ade80' : pct >= 50 ? '#d4a520' : '#f87171'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Weak vs Strong Summary ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diagnosis.weakSubTopics.length > 0 && (
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
              <h3 className="font-bold text-sm text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Needs More Practice
              </h3>
              <div className="space-y-2">
                {diagnosis.weakSubTopics.map(t => (
                  <div key={t} className="flex items-center gap-2 text-sm text-[var(--ivory)]/70">
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}

          {diagnosis.strongSubTopics.length > 0 && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <h3 className="font-bold text-sm text-emerald-400 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" /> Mastered Concepts
              </h3>
              <div className="space-y-2">
                {diagnosis.strongSubTopics.map(t => (
                  <div key={t} className="flex items-center gap-2 text-sm text-[var(--ivory)]/70">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Detailed Question Review ─── */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--gold)]" />
            Question-Wise Review
          </h2>

          <div className="space-y-3">
            {results.map((r: QuestionResult) => {
              const isExpanded = expandedQ === r.questionId;

              return (
                <div
                  key={r.questionId}
                  className={`rounded-xl border transition-colors ${
                    r.status === 'correct' ? 'border-emerald-500/10 bg-emerald-500/[0.02]' :
                    r.status === 'wrong' ? 'border-red-500/10 bg-red-500/[0.02]' :
                    'border-white/5 bg-white/[0.01]'
                  }`}
                >
                  {/* Question Header (clickable) */}
                  <button
                    onClick={() => setExpandedQ(isExpanded ? null : r.questionId)}
                    className="w-full p-4 flex items-center gap-4 text-left"
                  >
                    <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      r.status === 'correct' ? 'bg-emerald-500/20 text-emerald-400' :
                      r.status === 'wrong' ? 'bg-red-500/20 text-red-400' :
                      'bg-white/5 text-[var(--ivory)]/40'
                    }`}>
                      {r.questionNumber}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">
                        <MathText text={r.questionText?.substring(0, 120) + (r.questionText?.length > 120 ? '...' : '')} />
                      </div>
                      <p className="text-[10px] text-[var(--ivory)]/40 mt-1">{r.subTopic}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {r.status === 'correct' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      {r.status === 'wrong' && <XCircle className="w-5 h-5 text-red-400" />}
                      {r.status === 'skipped' && <Minus className="w-5 h-5 text-[var(--ivory)]/30" />}
                      <ChevronDown className={`w-4 h-4 text-[var(--ivory)]/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-white/5">
                      {/* Full Question */}
                      <div className="mb-4 mt-4 text-sm leading-relaxed">
                        <MathText text={r.questionText} />
                      </div>

                      {/* Options with answer marking */}
                      <div className="space-y-2 mb-4">
                        {r.options?.map((opt, i) => {
                          const label = String.fromCharCode(65 + i);
                          const isUserAnswer = r.userAnswer === label;
                          const isCorrectAnswer = r.correctAnswer === label;

                          return (
                            <div
                              key={i}
                              className={`p-3 rounded-lg flex items-start gap-3 text-sm ${
                                isCorrectAnswer
                                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                                  : isUserAnswer && !isCorrectAnswer
                                    ? 'bg-red-500/10 border border-red-500/20'
                                    : 'bg-white/[0.02] border border-white/5'
                              }`}
                            >
                              <span className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                isCorrectAnswer
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : isUserAnswer
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-white/5 text-[var(--ivory)]/40'
                              }`}>
                                {label}
                              </span>
                              <div className="flex-1">
                                <MathText text={opt} />
                              </div>
                              {isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                              {isUserAnswer && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {r.explanation && (
                        <div className="p-4 rounded-xl bg-[var(--gold)]/5 border border-[var(--gold)]/10">
                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] mb-2">Explanation</p>
                          <div className="text-sm text-[var(--ivory)]/70 leading-relaxed">
                            <MathText text={r.explanation} />
                          </div>
                        </div>
                      )}

                      {/* User's answer summary & Check Yourself Action */}
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4 text-xs text-[var(--ivory)]/50">
                          <span>Your answer: <strong className={r.status === 'correct' ? 'text-emerald-400 font-bold' : r.status === 'wrong' ? 'text-red-400 font-bold' : ''}>{r.userAnswer || '—'}</strong></span>
                          <span>Correct: <strong className="text-emerald-400 font-bold">{r.correctAnswer}</strong></span>
                        </div>

                        {r.subTopic && (
                          <button
                            type="button"
                            onClick={() => handleCheckYourself(r.subTopic)}
                            disabled={generating}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                          >
                            <Target size={14} />
                            <span>Check Yourself (2-3 Similar Qs)</span>
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
        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button
            onClick={handleRetestWeak}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[var(--saffron)] to-[var(--gold)] text-[var(--bg-deep)] font-bold text-base flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all"
          >
            <Target className="w-5 h-5" />
            {diagnosis.weakSubTopics.length > 0 ? 'Retest My Weak Concepts' : 'Practice Again'}
          </button>
          <button
            onClick={handleNewChapter}
            className="flex-1 py-4 rounded-2xl bg-white/5 font-bold text-base flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Choose Another Chapter
          </button>
        </div>
      </main>
    </div>
  );
}

export default AdaptiveDiagnosis;
