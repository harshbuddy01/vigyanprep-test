// ============================================================================
// ADAPTIVE TEST PAGE — NTA Standard Clean White CBT Interface
// Matches official VigyanPrep Exam & PYQ testing environment
// ============================================================================

import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, ChevronLeft, ChevronRight, Send, CheckCircle2,
  X
} from 'lucide-react';
import { useAdaptiveStore } from '../stores/adaptiveStore';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// ─── KaTeX MathText Renderer ──────────────────────────────────────
function renderMath(text: string): string {
  if (!text) return '';
  // Display math: $$...$$
  let rendered = text.replace(/\$\$(.*?)\$\$/gs, (_, math) => {
    try { return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false }); }
    catch { return `<span class="text-red-500 font-mono">${math}</span>`; }
  });
  // Inline math: $...$
  rendered = rendered.replace(/\$([^$]+?)\$/g, (_, math) => {
    try { return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false }); }
    catch { return `<span class="text-red-500 font-mono">${math}</span>`; }
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
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    questions, currentQuestionIndex, answers, timeRemaining,
    isTestActive, isSubmitting, isRemediation,
    selectedChapter, selectedSubject, selectedExamType,
    difficulty,
    setAnswer, clearAnswer, goToQuestion, nextQuestion, prevQuestion,
    decrementTimer, submitTest
  } = useAdaptiveStore();

  const currentQ = questions[currentQuestionIndex];

  // ─── Timer Interval ────────────────────────────────
  useEffect(() => {
    if (!isTestActive) return;
    timerRef.current = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTestActive, decrementTimer]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining <= 0 && isTestActive && questions.length > 0) {
      handleSubmit();
    }
  }, [timeRemaining, isTestActive, questions.length]);

  // Redirect if store empty
  useEffect(() => {
    if (!isTestActive && questions.length === 0) {
      navigate('/adaptive-revision');
    }
  }, [isTestActive, questions.length, navigate]);

  const handleSubmit = useCallback(async () => {
    setShowSubmitConfirm(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const success = await submitTest();
    if (success) {
      navigate('/adaptive-diagnosis');
    }
  }, [submitTest, navigate]);

  const handleOptionClick = (index: number) => {
    if (!currentQ) return;
    const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
    const currentAnswer = answers[currentQ.id];
    if (currentAnswer === optionLabel) {
      clearAnswer(currentQ.id);
    } else {
      setAnswer(currentQ.id, optionLabel);
    }
  };

  const handleSaveAndNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion();
    } else {
      setShowSubmitConfirm(true);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#1b365d] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-semibold text-sm">Preparing question paper...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans select-none">
      
      {/* ─── NTA Standard Navy Top Bar ─── */}
      <header className="bg-[#1b365d] text-white px-3 sm:px-6 py-2.5 sm:py-3 shrink-0 flex items-center justify-between shadow border-b-4 border-amber-400 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white text-[#1b365d] font-black text-sm sm:text-base rounded-md flex items-center justify-center shadow shrink-0">
            VP
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm md:text-base font-bold tracking-wide uppercase truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {selectedChapter?.name || 'Chapter Revision'}
            </h1>
            <p className="text-[10px] sm:text-xs text-amber-300 font-semibold truncate flex items-center gap-1.5">
              <span>{selectedSubject}</span>
              <span>•</span>
              <span>{selectedExamType?.toUpperCase()}</span>
              <span>•</span>
              <span className="capitalize">{difficulty} Level</span>
              {isRemediation && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-neutral-950 rounded font-black text-[9px] uppercase ml-1">
                  Targeted Retest
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right Header Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Digital Timer */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
            isTimeLow
              ? 'bg-red-600/90 text-white border-red-400 animate-pulse'
              : 'bg-white/10 text-white border-white/15'
          }`}>
            <Clock className="text-amber-300 shrink-0" size={16} />
            <div className="text-right">
              <p className="text-[9px] text-amber-200 uppercase font-bold tracking-wider hidden sm:block">Time Left</p>
              <p className="text-sm sm:text-base font-mono font-bold tracking-wider">{timeStr}</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={isSubmitting}
            className="px-3 sm:px-5 py-1.5 sm:py-2 bg-[#dc3545] hover:bg-[#c82333] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={13} />
            )}
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* ─── Sub-Header Section & Q-Palette Toggle ─── */}
      <div className="bg-gray-100 border-b border-gray-300 px-3 sm:px-6 py-2 flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#1b365d] uppercase">Topic:</span>
          <span className="px-2.5 py-1 rounded-md bg-white border border-gray-300 text-xs font-bold text-[#1b365d] shadow-xs">
            {currentQ.subTopic || selectedChapter?.name}
          </span>
          <span className="text-[11px] text-gray-500 font-medium">
            (Question {currentQuestionIndex + 1} of {questions.length})
          </span>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-50 text-[#1b365d] border border-gray-300 text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
        >
          {sidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          <span>{sidebarOpen ? 'Hide Palette' : 'Question Palette'}</span>
        </button>
      </div>

      {/* ─── Main Question & Options Workspace ─── */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left / Center Question Canvas */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4 sm:p-8 bg-white border-r border-gray-200">
          <div className="space-y-6 max-w-4xl mx-auto w-full">
            
            {/* Question Info Bar */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#1b365d] text-white font-bold text-xs rounded-md shadow-xs">
                  Question No. {currentQuestionIndex + 1}
                </span>
                <span className="text-xs text-gray-600 font-semibold">
                  Sub-Topic: <strong className="text-gray-900">{currentQ.subTopic}</strong>
                </span>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-full">
                Marks: +4 | -1
              </span>
            </div>

            {/* Question Text */}
            <div className="text-base text-gray-900 leading-relaxed font-serif pt-2">
              <MathText text={currentQ.questionText} />
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-4">
              {currentQ.options.map((opt, i) => {
                const label = String.fromCharCode(65 + i);
                const isSelected = answers[currentQ.id] === label;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleOptionClick(i)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 cursor-pointer group ${
                      isSelected
                        ? 'border-[#1b365d] bg-blue-50/70 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition ${
                      isSelected
                        ? 'bg-[#1b365d] text-white shadow'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 group-hover:bg-gray-200'
                    }`}>
                      {label}
                    </span>
                    <div className="flex-1 pt-1 text-sm sm:text-base text-gray-900 font-sans leading-relaxed">
                      <MathText text={opt} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Bottom Navigation Actions ─── */}
          <div className="max-w-4xl mx-auto w-full pt-6 mt-8 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-lg border border-gray-300 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button
                type="button"
                onClick={() => clearAnswer(currentQ.id)}
                disabled={!answers[currentQ.id]}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg border border-gray-300 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear Response
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveAndNext}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#28a745] hover:bg-[#218838] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow transition cursor-pointer"
            >
              <span>{currentQuestionIndex === questions.length - 1 ? 'Save & Review' : 'Save & Next'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ─── Right Question Palette ─── */}
        {sidebarOpen && (
          <aside className="w-72 bg-gray-50 border-l border-gray-200 p-4 flex flex-col justify-between overflow-y-auto shrink-0 shadow-inner">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1b365d] border-b border-gray-300 pb-2">
                Question Palette
              </h3>

              {/* Grid of Question Numbers */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, i) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = i === currentQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(i)}
                      className={`h-9 rounded-md text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        isCurrent
                          ? 'bg-[#1b365d] text-white ring-2 ring-blue-400 font-black shadow'
                          : isAnswered
                            ? 'bg-[#28a745] text-white font-bold'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              {/* Palette Legend */}
              <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2 text-[11px] font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#28a745] text-white flex items-center justify-center text-[9px] font-bold">✓</div>
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#1b365d] text-white flex items-center justify-center text-[9px] font-bold">●</div>
                  <span>Current Question</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-white border border-gray-300" />
                  <span>Not Answered ({questions.length - answeredCount})</span>
                </div>
              </div>
            </div>

            {/* Quick Submit Card */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#dc3545] hover:bg-[#c82333] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send size={14} /> Submit Practice Test
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ─── Submit Confirmation Modal ─── */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1b365d] flex items-center gap-2">
                <Send size={18} className="text-[#dc3545]" />
                Submit Test Confirmation
              </h3>
              <button onClick={() => setShowSubmitConfirm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Total</p>
                  <p className="text-base font-black text-gray-900">{questions.length}</p>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 font-bold uppercase">Answered</p>
                  <p className="text-base font-black text-emerald-800">{answeredCount}</p>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-[10px] text-amber-700 font-bold uppercase">Remaining</p>
                  <p className="text-base font-black text-amber-800">{questions.length - answeredCount}</p>
                </div>
              </div>
              <p className="text-center text-gray-700 pt-2 font-medium">
                Are you sure you want to submit? You will receive an instant AI concept diagnosis and detailed KaTeX solutions.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-xs text-gray-700 border border-gray-300 transition cursor-pointer"
              >
                Back to Test
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#28a745] hover:bg-[#218838] font-bold text-xs text-white shadow transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                <span>Confirm &amp; Grade</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdaptiveTest;
