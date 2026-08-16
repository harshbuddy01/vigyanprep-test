import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useExamStore } from '../stores/examStore';
import { QuestionPalette } from '../components/QuestionPalette';
import { ScientificCalculator } from '../components/ScientificCalculator';
import { MathText } from '../components/MathText';
import { submitExam as apiSubmitExam } from '../lib/api';
import { User, Clock, ShieldAlert, Award, Calculator, ChevronRight, ChevronLeft, Flag, X, Send, CheckCircle } from 'lucide-react';

function formatImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
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
    setAnswer, clearAnswer, markForReview,
    goToQuestion, submitExam, isSubmitted, attemptId, timeRemaining, warningCount,
    incrementWarning, token, setQuestions, setTestMeta, candidateName, rollNumber, testTitle, examType,
    decrementTimer, markVisited, resetExamState, testId
  } = useExamStore();

  const [activeSection, setActiveSection] = useState('Physics');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);

  // 🚩 Report Question state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportType, setReportType] = useState('wrong_answer');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const submittingRef = useRef(false);

  // Auto-fetch questions if state is empty OR if starting a new test session
  useEffect(() => {
    const autoFetchQuestions = async () => {
      if (!testIdParam) return;

      // Only reset if switching to a DIFFERENT test paper entirely
      if (testId && testIdParam !== testId) {
        resetExamState(testIdParam);
      }

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
    };

    autoFetchQuestions();
  }, [testIdParam, testId, resetExamState, setQuestions, setTestMeta]);

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

    // Persist backup snapshot in localStorage so ResponseSheet NEVER loses student answers
    try {
      if (testIdParam) {
        localStorage.setItem(`vigyan_response_${testIdParam}`, JSON.stringify(answers));
      }
    } catch (e) {}

    submitExam();

    try {
      if (attemptId && token) {
        await apiSubmitExam(attemptId, answers, token);
      }
    } catch (e) {
      console.error('API submission error:', e);
    }

    navigate('/response-sheet' + window.location.search, { replace: true });
  }, [submitExam, attemptId, answers, token, navigate, testIdParam]);

  useEffect(() => {
    let hideTimer: any = null;

    const isTouchOrTablet = () => {
      if (typeof window === 'undefined') return false;
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroidTablet = /Android/i.test(ua) && !/Mobile/i.test(ua);
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      return isIOS || isAndroidTablet || (hasTouch && window.innerWidth <= 1024);
    };

    const handleVisibilityChange = () => {
      const isTablet = isTouchOrTablet();
      const delay = isTablet ? 5000 : 3500; // 5s grace period on tablets, 3.5s on desktop

      if (document.hidden && !isSubmitted) {
        hideTimer = setTimeout(() => {
          if (document.hidden && document.visibilityState === 'hidden' && !useExamStore.getState().isSubmitted) {
            incrementWarning();
            setShowTabWarning(true);
            if (useExamStore.getState().warningCount >= 3) {
              doSubmit();
            }
            setTimeout(() => setShowTabWarning(false), 4000);
          }
        }, delay);
      } else {
        if (hideTimer) clearTimeout(hideTimer);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isSubmitted, incrementWarning, doSubmit]);

  useEffect(() => {
    const isTouchOrTablet = () => {
      if (typeof window === 'undefined') return false;
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroidTablet = /Android/i.test(ua) && !/Mobile/i.test(ua);
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      return isIOS || isAndroidTablet || (hasTouch && window.innerWidth <= 1024);
    };

    const preventDefault = (e: any) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(e.key)) || (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
      }
    };

    const handleFullscreenChange = () => {
      // NEVER trigger fullscreen warnings on iPad, iPhone, Android tablets, or touch devices
      if (isTouchOrTablet()) return;

      const doc = document as any;
      const fsElement = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement;
      if (!fsElement && !useExamStore.getState().isSubmitted) {
        useExamStore.getState().incrementWarning?.();
        setShowTabWarning(true);
        setTimeout(() => setShowTabWarning(false), 4000);
        const docEl = document.documentElement as any;
        const reqFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen;
        if (reqFs) reqFs.call(docEl).catch(() => {});
      }
    };

    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('copy', preventDefault);
    document.addEventListener('paste', preventDefault);
    document.addEventListener('keydown', preventKeys);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('paste', preventDefault);
      document.removeEventListener('keydown', preventKeys);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const heartbeatInterval = setInterval(async () => {
      try {
        const state = useExamStore.getState();
        const t = state.token || localStorage.getItem('exam_token');
        const aId = state.attemptId;
        if (!aId || !t || state.isSubmitted) return;

        const apiBase = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';
        await fetch(`${apiBase}/api/exam/heartbeat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${t}`
          },
          body: JSON.stringify({
            attempt_id: aId,
            time_remaining: state.timeRemaining,
            answers_count: Object.keys(state.answers).length
          })
        });
      } catch (err) {
      }
    }, 15000);

    return () => clearInterval(heartbeatInterval);
  }, []);

  useEffect(() => {
    if (timeRemaining <= 0 && !isSubmitted && questions.length > 0) {
      doSubmit();
    }
  }, [timeRemaining, isSubmitted, questions.length, doSubmit]);

  const currentQ = questions[currentQuestionIndex];
  const sections = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];

  const sectionQuestions = questions.filter(q =>
    q.section === activeSection || (!sections.includes(q.section) && activeSection === 'Physics')
  );

  const currentSectionQIndex = sectionQuestions.findIndex(q => q.id === currentQ?.id);

  const handleOptionSelect = (optionKey: string) => {
    if (!currentQ) return;
    setAnswer(currentQ.id, optionKey);
  };

  const handleSaveAndNext = () => {
    if (currentSectionQIndex !== -1 && currentSectionQIndex < sectionQuestions.length - 1) {
      const nextQ = sectionQuestions[currentSectionQIndex + 1];
      const globalNextIdx = questions.findIndex(q => q.id === nextQ.id);
      if (globalNextIdx !== -1) {
        goToQuestion(globalNextIdx);
        return;
      }
    }
    const curSecIdx = sections.indexOf(activeSection);
    if (curSecIdx !== -1 && curSecIdx < sections.length - 1) {
      const nextSec = sections[curSecIdx + 1];
      setActiveSection(nextSec);
      const firstQOfNextSec = questions.findIndex(q => q.section === nextSec);
      if (firstQOfNextSec !== -1) {
        goToQuestion(firstQOfNextSec);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSectionQIndex > 0) {
      const prevQ = sectionQuestions[currentSectionQIndex - 1];
      const globalPrevIdx = questions.findIndex(q => q.id === prevQ.id);
      if (globalPrevIdx !== -1) {
        goToQuestion(globalPrevIdx);
        return;
      }
    }
    const curSecIdx = sections.indexOf(activeSection);
    if (curSecIdx > 0) {
      const prevSec = sections[curSecIdx - 1];
      setActiveSection(prevSec);
      const prevSecQuestions = questions.filter(q => q.section === prevSec);
      if (prevSecQuestions.length > 0) {
        const lastQOfPrevSec = prevSecQuestions[prevSecQuestions.length - 1];
        const globalIdx = questions.findIndex(q => q.id === lastQOfPrevSec.id);
        if (globalIdx !== -1) {
          goToQuestion(globalIdx);
        }
      }
    }
  };

  const handleSubmitReport = async () => {
    if (!currentQ || !reportReason.trim() || reportReason.trim().length < 20) return;
    setReportSubmitting(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';
      const t = token || localStorage.getItem('exam_token');
      const res = await fetch(`${apiBase}/api/student/report-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(t ? { 'Authorization': `Bearer ${t}` } : {})
        },
        body: JSON.stringify({
          question_id: currentQ.id,
          test_id: (currentQ as any).test_id || testTitle,
          issue_type: reportType,
          reason: reportReason.trim(),
          candidate_name: candidateName,
          roll_number: rollNumber
        })
      });
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportReason('');
          setReportType('wrong_answer');
          setReportSuccess(false);
        }, 2000);
      } else {
        alert('Failed to submit report. Please try again.');
      }
    } catch {
      alert('Network error submitting report.');
    } finally {
      setReportSubmitting(false);
    }
  };

  useEffect(() => {
    if (currentQ?.id && markVisited) {
      markVisited(currentQ.id);
    }
  }, [currentQ?.id, markVisited]);

  // Auto-submit on timer expiration
  useEffect(() => {
    if (timeRemaining <= 0 && questions.length > 0 && !submittingRef.current) {
      doSubmit();
    }
  }, [timeRemaining, questions.length, doSubmit]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-[#f4f6f9] font-sans text-gray-800 relative select-none">
      {showCalculator && <ScientificCalculator onClose={() => setShowCalculator(false)} />}
      {showTabWarning && (
        <div className="fixed top-0 inset-x-0 z-50 bg-red-600 text-white text-center py-2 font-bold text-xs shadow-lg animate-pulse flex items-center justify-center gap-2 px-2">
          <ShieldAlert size={16} /> ⚠️ Tab switch detected! ({warningCount}/3). 3 violations will auto-submit exam.
        </div>
      )}

      <header className="bg-[#1b365d] text-white px-3 sm:px-6 py-2.5 sm:py-3 shrink-0 flex items-center justify-between shadow border-b-4 border-amber-400 z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white text-[#1b365d] font-black text-sm sm:text-lg rounded flex items-center justify-center shadow shrink-0">
            VP
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-bold tracking-wide uppercase truncate max-w-[140px] sm:max-w-xs md:max-w-md lg:max-w-xl">
              {testTitle || 'IISER IAT Official Question Paper'}
            </h1>
            <p className="text-[10px] sm:text-xs text-amber-300 font-semibold truncate">
              {examType || 'IAT'} • NTA Standard CBT Mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg shadow transition cursor-pointer"
          >
            <Calculator size={15} /> <span className="hidden md:inline">Calculator</span>
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg border border-white/10">
            <Clock className="text-amber-300 animate-pulse shrink-0" size={16} />
            <div className="text-right">
              <p className="text-[9px] sm:text-[10px] text-amber-200 uppercase font-bold tracking-wider hidden sm:block">Time Left</p>
              <p className="text-sm sm:text-lg font-mono font-bold text-white tracking-wider">{formatTimer(timeRemaining)}</p>
            </div>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-3 sm:px-5 py-1.5 sm:py-2 bg-[#dc3545] hover:bg-[#c82333] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition cursor-pointer"
          >
            Submit
          </button>
        </div>
      </header>

      <div className="bg-white border-b px-3 sm:px-6 py-2 flex items-center justify-between shrink-0 shadow-sm z-20 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5 scrollbar-none flex-1">
          <span className="text-xs font-bold text-[#1b365d] uppercase mr-1 hidden sm:inline shrink-0">Sections:</span>
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
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#1b365d] text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <span>{sec}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {secAnswered}/{secQuestions.length}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#1b365d] border border-gray-300 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer shadow-sm"
          title={sidebarOpen ? "Minimize Question Palette" : "Expand Question Palette"}
        >
          {sidebarOpen ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          <span className="hidden sm:inline">{sidebarOpen ? "Full View" : "Palette"}</span>
          <span className="sm:hidden font-bold">Q-Palette</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none opacity-[0.05] flex flex-wrap content-start justify-center gap-20 p-8 transform -rotate-12 scale-125">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="text-xl font-serif font-black tracking-widest text-[#1b365d] uppercase whitespace-nowrap">
              VIGYAN PREP · {candidateName || 'CANDIDATE'} ({rollNumber || 'ID'})
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col justify-between overflow-y-auto p-3 sm:p-6 bg-white border-r relative z-10">
          {loadingQuestions ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3 text-gray-500">
              <div className="w-8 h-8 border-4 border-[#1b365d] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold">Loading Question Paper...</p>
            </div>
          ) : currentQ ? (
            <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto w-full">
              <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#1b365d] uppercase tracking-wider">
                  Question No. {currentSectionQIndex !== -1 ? currentSectionQIndex + 1 : 1} of {sectionQuestions.length} ({activeSection})
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[11px] sm:text-xs rounded-full">
                    Marks: +4 | -1
                  </span>
                  <button
                    onClick={() => { setShowReportModal(true); setReportSuccess(false); }}
                    title="Report an issue with this question"
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-[11px] sm:text-xs rounded-lg transition cursor-pointer"
                  >
                    <Flag size={12} /> Report
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-200 text-sm leading-relaxed text-gray-900 min-h-[120px] space-y-4">
                <div className="font-medium text-sm sm:text-base">
                  <MathText text={(currentQ as any).question_text || currentQ.text || 'Question text will appear here.'} />
                </div>
                {((currentQ as any).image_url || (currentQ as any).diagram_url) && (
                  <div className="my-3 text-center">
                    <img
                      src={formatImageUrl((currentQ as any).image_url || (currentQ as any).diagram_url)}
                      alt="Question Diagram"
                      className="max-h-64 sm:max-h-80 mx-auto object-contain rounded-xl border border-gray-200 shadow-sm bg-white p-1"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                {(currentQ.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, optIndex) => {
                  const optKey = String.fromCharCode(65 + optIndex);
                  const isSelected = answers[currentQ.id] === optKey;

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleOptionSelect(optKey)}
                      className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all flex items-center gap-3 active:scale-[0.99] cursor-pointer ${
                        isSelected
                          ? 'border-[#007bff] bg-blue-50/70 text-[#1b365d] shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition ${
                        isSelected ? 'bg-[#007bff] text-white shadow' : 'bg-gray-100 border border-gray-300 text-gray-700'
                      }`}>
                        {optKey}
                      </span>
                      <span className="text-xs sm:text-sm font-medium flex-1">
                        <MathText text={opt} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">No questions loaded.</div>
          )}

          <div className="border-t pt-3 sm:pt-4 mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (currentQ) markForReview(currentQ.id);
                  handleSaveAndNext();
                }}
                className="flex-1 sm:flex-none px-3 sm:px-5 py-2.5 bg-[#6f42c1] hover:bg-[#5a32a3] text-white font-bold text-xs rounded-xl shadow transition active:scale-95 cursor-pointer"
              >
                Mark & Next
              </button>
              <button
                onClick={() => {
                  if (currentQ) clearAnswer(currentQ.id);
                }}
                className="px-3 sm:px-5 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrevious}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer"
              >
                ← Prev
              </button>
              <button
                onClick={handleSaveAndNext}
                className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 bg-[#28a745] hover:bg-[#218838] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition active:scale-95 cursor-pointer"
              >
                Save & Next →
              </button>
            </div>
            {showReportModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 space-y-4">
                  {reportSuccess ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <CheckCircle className="text-green-500" size={40} />
                      <p className="text-base font-bold text-gray-800">Report Submitted!</p>
                      <p className="text-xs text-gray-500 text-center">Thank you.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flag className="text-red-500" size={18} />
                          <h3 className="font-bold text-gray-900">Report This Question</h3>
                        </div>
                        <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={20} /></button>
                      </div>
                      <p className="text-xs text-gray-500">Question #{currentSectionQIndex + 1} — {activeSection}</p>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">Type of Issue</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'wrong_answer', label: '❌ Wrong Answer Key' },
                            { value: 'typo_error', label: '✏️ Typo / Error' },
                            { value: 'image_missing', label: '🖼️ Image Broken' },
                            { value: 'ambiguous', label: '🤔 Ambiguous' },
                            { value: 'wrong_language', label: '🔤 Formula Error' },
                            { value: 'other', label: '📝 Other' },
                          ].map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setReportType(opt.value)}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold text-left transition cursor-pointer ${
                                reportType === opt.value
                                  ? 'border-red-400 bg-red-50 text-red-700'
                                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Describe the issue <span className="text-red-500">*</span></label>
                        <textarea
                          value={reportReason}
                          onChange={e => setReportReason(e.target.value)}
                          placeholder="Please describe the issue in detail (minimum 20 characters)..."
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => setShowReportModal(false)}
                          className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitReport}
                          disabled={reportReason.trim().length < 20 || reportSubmitting}
                          className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          {reportSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <><Send size={13} /> Submit Report</>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {sidebarOpen && (
          <>
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
            />
            <div className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-gray-50 flex flex-col justify-between p-4 overflow-y-auto shrink-0 border-l shadow-2xl lg:static lg:shadow-none lg:z-10 transition-transform">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 lg:hidden mb-3">
                <span className="text-xs font-bold text-[#1b365d] uppercase tracking-wider">Question Navigation</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                  <User size={24} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[#1b365d] truncate">{candidateName || 'Student Candidate'}</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold truncate">Roll: {rollNumber || 'VP-2026-STUDENT'}</p>
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Online
                  </p>
                </div>
              </div>
              <div className="my-3 sm:my-4 flex-1 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{activeSection} Palette</h3>
                  <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600 font-bold">{sectionQuestions.length} Questions</span>
                </div>
                <QuestionPalette
                  activeSection={activeSection}
                  onSelect={(q) => {
                    const gIdx = questions.findIndex(item => item.id === q.id);
                    if (gIdx !== -1) goToQuestion(gIdx);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                />
              </div>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-3 bg-[#dc3545] hover:bg-[#c82333] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition mt-2 cursor-pointer"
              >
                Submit Examination
              </button>
            </div>
          </>
        )}
      </div>

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
