// =============================================
// ADAPTIVE TEST PAGE
// CBT interface for chapter revision with timer
// =============================================

import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, ChevronLeft, ChevronRight, Send, Brain
} from 'lucide-react';
import { useAdaptiveStore } from '../stores/adaptiveStore';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// ─── KaTeX Renderer ──────────────────────────────────────
function renderMath(text: string): string {
  if (!text) return '';
  // Display math: $$...$$
  let rendered = text.replace(/\$\$(.*?)\$\$/gs, (_, math) => {
    try { return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false }); }
    catch { return `<span class="text-red-400">${math}</span>`; }
  });
  // Inline math: $...$
  rendered = rendered.replace(/\$([^$]+?)\$/g, (_, math) => {
    try { return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false }); }
    catch { return `<span class="text-red-400">${math}</span>`; }
  });
  // Newlines
  rendered = rendered.replace(/\n/g, '<br/>');
  return rendered;
}

function MathText({ text, className = '' }: { text: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: renderMath(text) }} />;
}

export function AdaptiveTest() {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    questions, currentQuestionIndex, answers, timeRemaining,
    isTestActive, isSubmitting, isRemediation,
    selectedChapter, selectedSubject, selectedExamType,
    difficulty,
    setAnswer, clearAnswer, goToQuestion, nextQuestion, prevQuestion,
    decrementTimer, submitTest
  } = useAdaptiveStore();

  const currentQ = questions[currentQuestionIndex];

  // ─── Timer ────────────────────────────────
  useEffect(() => {
    if (!isTestActive) return;
    timerRef.current = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTestActive]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining <= 0 && isTestActive) {
      handleSubmit();
    }
  }, [timeRemaining, isTestActive]);

  // Redirect if no test is active
  useEffect(() => {
    if (!isTestActive && questions.length === 0) {
      navigate('/adaptive-revision');
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const success = await submitTest();
    if (success) {
      navigate('/adaptive-diagnosis');
    }
  }, [submitTest, navigate]);

  const handleOptionClick = (index: number) => {
    const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
    const currentAnswer = answers[currentQ.id];
    if (currentAnswer === optionLabel) {
      clearAnswer(currentQ.id);
    } else {
      setAnswer(currentQ.id, optionLabel);
    }
  };

  // Format time
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const isTimeLow = timeRemaining < 120;

  const answeredCount = Object.keys(answers).length;

  if (!currentQ) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-[var(--gold)]/30 mx-auto mb-4" />
          <p className="text-[var(--ivory)]/40">Loading test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--ivory)] flex flex-col">
      {/* ─── Top Bar ─── */}
      <header className="sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[var(--gold)]" />
              <span className="font-bold text-sm">{selectedChapter?.name}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[var(--ivory)]/50">
              {selectedSubject} • {selectedExamType?.toUpperCase()} • {difficulty}
            </span>
            {isRemediation && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                🎯 Targeting Weak Concepts
              </span>
            )}
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono font-bold text-lg ${
            isTimeLow ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' : 'bg-white/5 text-[var(--ivory)]'
          }`}>
            <Clock className="w-4 h-4" />
            {timeStr}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--gold)] text-[var(--bg-deep)] font-bold text-sm hover:bg-[var(--gold)]/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-[var(--bg-deep)]/30 border-t-[var(--bg-deep)] rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit Test
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* ─── Question Panel ─── */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Question Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] font-bold text-sm">
                {currentQ.questionNumber}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-[var(--ivory)]/50">
                {currentQ.subTopic}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                currentQ.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                currentQ.difficulty === 'hard' ? 'bg-red-500/10 text-red-400' :
                'bg-[var(--gold)]/10 text-[var(--gold)]'
              }`}>
                {currentQ.difficulty}
              </span>
            </div>

            <div className="text-base leading-relaxed">
              <MathText text={currentQ.questionText} />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, i) => {
              const label = String.fromCharCode(65 + i);
              const isSelected = answers[currentQ.id] === label;

              return (
                <button
                  key={i}
                  onClick={() => handleOptionClick(i)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 group ${
                    isSelected
                      ? 'border-[var(--gold)]/50 bg-[var(--gold)]/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                    isSelected
                      ? 'bg-[var(--gold)] text-[var(--bg-deep)]'
                      : 'bg-white/5 text-[var(--ivory)]/50 group-hover:bg-white/10'
                  }`}>
                    {label}
                  </span>
                  <div className="flex-1 pt-1">
                    <MathText text={opt} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-[var(--ivory)]/70 font-semibold text-sm hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-xs text-[var(--ivory)]/40">
              {currentQuestionIndex + 1} of {questions.length}
            </span>

            <button
              onClick={nextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-[var(--ivory)]/70 font-semibold text-sm hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── Question Palette (Sidebar) ─── */}
        <aside className="w-64 border-l border-white/5 p-4 hidden lg:block overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ivory)]/40 mb-4">Question Palette</h3>

          <div className="grid grid-cols-5 gap-2 mb-6">
            {questions.map((q, i) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = i === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(i)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[var(--gold)] text-[var(--bg-deep)] ring-2 ring-[var(--gold)]/30 ring-offset-1 ring-offset-[var(--bg-deep)]'
                      : isAnswered
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-[var(--ivory)]/40 hover:bg-white/10'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="space-y-2 text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[var(--gold)]" />
              <span className="text-[var(--ivory)]/50">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/30" />
              <span className="text-[var(--ivory)]/50">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/5" />
              <span className="text-[var(--ivory)]/50">Not Visited</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--ivory)]/40">Answered</span>
              <span className="font-bold text-emerald-400">{answeredCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--ivory)]/40">Remaining</span>
              <span className="font-bold text-[var(--ivory)]/60">{questions.length - answeredCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--ivory)]/40">Total</span>
              <span className="font-bold">{questions.length}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AdaptiveTest;
