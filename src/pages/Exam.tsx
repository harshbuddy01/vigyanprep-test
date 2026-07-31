import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useExamStore } from '../stores/examStore';
import { QuestionPalette } from '../components/QuestionPalette';
import { ScientificCalculator } from '../components/ScientificCalculator';
import { submitExam as apiSubmitExam } from '../lib/api';
import { User, Clock, ShieldAlert, Award, Calculator, ChevronRight, ChevronLeft } from 'lucide-react';

function formatImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return trimmed;
}

export default function Exam() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testIdParam = searchParams.get('testId');
  const {
    questions, currentQuestionIndex, answers,
    setAnswer, clearAnswer, markForReview, nextQuestion, prevQuestion,
    goToQuestion, submitExam, isSubmitted, attemptId, timeRemaining, warningCount,
    incrementWarning, token, setQuestions, setTestMeta, candidateName, rollNumber, testTitle, examType,
    decrementTimer
  } = useExamStore();

  const [activeSection, setActiveSection] = useState('Physics');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);

  const sections = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
  const submittingRef = useRef(false);

  // Auto-fetch questions if state is empty and testId is present in URL
  useEffect(() => {
    const autoFetchQuestions = async () => {
      if (questions.length === 0 && testIdParam) {
        setLoadingQuestions(true);
        try {
          const apiBase = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';
          const res = await fetch(`${apiBase}/api/public/tests/${testIdParam}`);
          const data = await res.json();
          if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
            setQuestions(data.questions);
            if (data.test) {
              setTestMeta({
                testTitle: data.test.title,
                examType: data.test.exam_type || data.test.test_type || 'IAT',
                testId: testIdParam
              });
            }
          }
        } catch (e) {
          console.error('Failed to auto-fetch test questions:', e);
        } finally {
          setLoadingQuestions(false);
        }
      }
    };
    autoFetchQuestions();
  }, [questions.length, testIdParam, setQuestions, setTestMeta]);

  // Working Live 1-Second Timer Interval
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, decrementTimer]);

  const doSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    submitExam();
    try {
      if (attemptId && token) await apiSubmitExam(attemptId, answers, token);
    } catch (e) {
      console.error(e);
    }
    navigate('/response-sheet' + window.location.search);
  }, [submitExam, attemptId, answers, token, navigate]);

  // Tab switch proctoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        incrementWarning();
        setShowTabWarning(true);
        if (warningCount + 1 >= 3) {
          doSubmit();
        }
        setTimeout(() => setShowTabWarning(false), 4000);
      }
    };

    const handleWindowBlur = () => {
      if (!document.hidden && !isSubmitted) {
        incrementWarning();
        setShowTabWarning(true);
        if (warningCount + 1 >= 3) {
          doSubmit();
        }
        setTimeout(() => setShowTabWarning(false), 4000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isSubmitted, warningCount, incrementWarning, doSubmit]);

  // Anti-cheating & Fullscreen
  useEffect(() => {
    const preventDefault = (e: any) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(e.key)) || (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('copy', preventDefault);
    document.addEventListener('paste', preventDefault);
    document.addEventListener('keydown', preventKeys);

    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    return () => {
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('paste', preventDefault);
      document.removeEventListener('keydown', preventKeys);
    };
  }, []);

  const currentQ = questions[currentQuestionIndex];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;

  // Sync active section when question changes via next/prev
  useEffect(() => {
    if (currentQ && currentQ.section && currentQ.section !== activeSection) {
      if (sections.includes(currentQ.section)) {
        setActiveSection(currentQ.section);
      }
    }
  }, [currentQuestionIndex]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Section specific question numbers
  const sectionQuestions = questions.filter(q => q.section === activeSection || (!sections.includes(q.section) && activeSection === 'Physics'));
  const currentSectionQIndex = sectionQuestions.findIndex(q => q.id === currentQ?.id);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f4f6f9] font-sans text-gray-800 relative select-none">

      {/* Scientific Calculator Modal */}
      {showCalculator && <ScientificCalculator onClose={() => setShowCalculator(false)} />}

      {/* Warning Banner */}
      {showTabWarning && (
        <div className="fixed top-0 inset-x-0 z-50 bg-red-600 text-white text-center py-2 font-bold text-xs shadow-lg animate-pulse flex items-center justify-center gap-2">
          <ShieldAlert size={16} /> ⚠️ SECURITY WARNING: Tab switch detected! ({warningCount}/3). 3 violations will auto-submit exam.
        </div>
      )}

      {/* NTA Official Header */}
      <header className="bg-[#1b365d] text-white px-6 py-3 shrink-0 flex items-center justify-between shadow border-b-4 border-amber-400 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white text-[#1b365d] font-bold text-lg rounded flex items-center justify-center shadow">
            VP
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide uppercase">{testTitle || 'IISER IAT Official Question Paper'}</h1>
            <p className="text-xs text-amber-300 font-semibold">Category: {examType || 'IAT'} • NTA Standard CBT Mode</p>
          </div>
        </div>

        {/* Scientific Calculator, Timer & Submit Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg shadow transition"
          >
            <Calculator size={16} /> Calculator
          </button>

          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/10">
            <Clock className="text-amber-300 animate-pulse" size={18} />
            <div className="text-right">
              <p className="text-[10px] text-amber-200 uppercase font-bold tracking-wider">Time Remaining</p>
              <p className="text-lg font-mono font-bold text-white tracking-widest">{formatTimer(timeRemaining)}</p>
            </div>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-5 py-2.5 bg-[#dc3545] hover:bg-[#c82333] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* NTA Subject Tabs Bar */}
      <div className="bg-white border-b px-6 py-2 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#1b365d] uppercase mr-3">Sections:</span>
          {sections.map(sec => {
            const secQuestions = questions.filter(q => q.section === sec || (!sections.includes(q.section) && sec === 'Physics'));
            const secAnswered = secQuestions.filter(q => answers[q.id] !== undefined).length;
            const isActive = activeSection === sec;
            return (
              <button
                key={sec}
                onClick={() => {
                  setActiveSection(sec);
                  const firstQIndex = questions.findIndex(q => q.section === sec || (!sections.includes(q.section) && sec === 'Physics'));
                  if (firstQIndex !== -1) goToQuestion(firstQIndex);
                }}
                className={`px-4 py-2 rounded text-xs font-bold transition flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#1b365d] text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {sec}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {secAnswered}/{secQuestions.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Toggle Minimize/Maximize Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#1b365d] border border-gray-300 text-xs font-bold rounded transition"
          title={sidebarOpen ? "Minimize Question Palette" : "Expand Question Palette"}
        >
          {sidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {sidebarOpen ? "Full View" : "Show Palette"}
        </button>
      </div>

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Left Side: Question Panel */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto p-6 bg-white border-r">
          {loadingQuestions ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3 text-gray-500">
              <div className="w-8 h-8 border-4 border-[#1b365d] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold">Loading Question Paper...</p>
            </div>
          ) : currentQ ? (
            <div className="space-y-6 max-w-4xl mx-auto w-full">

              {/* Question Number & Type Header */}
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm font-bold text-[#1b365d] uppercase tracking-wider">
                  Question No. {currentSectionQIndex + 1} of {sectionQuestions.length} ({activeSection})
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 font-bold text-xs rounded-full">
                  Marks: +4 | -1
                </span>
              </div>

              {/* Question Body */}
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-sm leading-relaxed text-gray-900 min-h-[140px] space-y-4">
                <div className="font-medium text-base">
                  {(currentQ as any).question_text || currentQ.text || 'Question text will appear here.'}
                </div>

                {/* Question Diagram Image */}
                {(currentQ.image_url || (currentQ as any).imageUrl) && (
                  <div className="p-3 bg-white border border-gray-300 rounded-lg text-center shadow-sm">
                    <img
                      src={formatImageUrl(currentQ.image_url || (currentQ as any).imageUrl || '')}
                      alt="Question Diagram"
                      className="max-h-80 mx-auto object-contain rounded"
                    />
                  </div>
                )}
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-3 pt-2">
                {((currentQ.options && currentQ.options.length === 4) ? currentQ.options : ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, idx) => {
                  const optKey = ['A', 'B', 'C', 'D'][idx];
                  const isSelected = currentAnswer === optKey;
                  return (
                    <button
                      key={idx}
                      onClick={() => setAnswer(currentQ.id, optKey)}
                      className={`flex items-center gap-4 p-4 rounded-xl border w-full text-left transition ${
                        isSelected
                          ? 'border-[#007bff] bg-blue-50/80 text-blue-900 shadow-sm'
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                        isSelected ? 'bg-[#007bff] text-white shadow' : 'bg-gray-100 border border-gray-300 text-gray-700'
                      }`}>
                        {optKey}
                      </span>
                      <span className="text-sm font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">No questions loaded.</div>
          )}

          {/* Bottom Control Bar */}
          <div className="border-t pt-4 mt-6 flex items-center justify-between bg-white max-w-4xl mx-auto w-full">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  markForReview(currentQ.id);
                  nextQuestion();
                }}
                className="px-5 py-2.5 bg-[#6f42c1] hover:bg-[#5a32a3] text-white font-bold text-xs rounded-lg shadow transition"
              >
                Mark for Review & Next
              </button>
              <button
                onClick={() => clearAnswer(currentQ.id)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-lg transition"
              >
                Clear Response
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-bold text-xs rounded-lg disabled:opacity-40 transition"
              >
                ← Previous
              </button>
              <button
                onClick={nextQuestion}
                className="px-6 py-2.5 bg-[#28a745] hover:bg-[#218838] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition"
              >
                Save & Next →
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Candidate Panel & NTA Question Palette (Collapsible) */}
        {sidebarOpen && (
          <div className="w-80 bg-gray-50 flex flex-col justify-between p-4 overflow-y-auto shrink-0 border-l transition-all">

            {/* Candidate Profile Box */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                <User size={28} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#1b365d] truncate">{candidateName || 'Candidate Name'}</p>
                <p className="text-[11px] text-gray-500 truncate">Roll: {rollNumber || 'VP-2024-890'}</p>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Online
                </p>
              </div>
            </div>

            {/* Question Palette Section (Isolated to Active Section) */}
            <div className="my-4 flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{activeSection} Palette</h3>
                <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600 font-bold">{sectionQuestions.length} Questions</span>
              </div>
              <QuestionPalette activeSection={activeSection} />
            </div>

            {/* Submit Test Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-3 bg-[#dc3545] hover:bg-[#c82333] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition mt-2"
            >
              Submit Examination
            </button>
          </div>
        )}

      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-2xl space-y-4 text-center">
            <Award size={48} className="mx-auto text-amber-500" />
            <h2 className="text-xl font-bold text-[#1b365d]">Submit Examination?</h2>
            <p className="text-xs text-gray-600">
              Are you sure you want to submit your exam? You have answered <strong>{Object.keys(answers).length}</strong> out of <strong>{questions.length}</strong> questions.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                Return to Test
              </button>
              <button
                onClick={doSubmit}
                className="py-2.5 bg-[#28a745] hover:bg-[#218838] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
