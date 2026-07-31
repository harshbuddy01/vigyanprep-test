import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamStore } from '../stores/examStore';
import { Timer } from '../components/Timer';
import { QuestionPalette } from '../components/QuestionPalette';
import { HallTicketBanner } from '../components/HallTicketBanner';
import { submitExam as apiSubmitExam, sendHeartbeat } from '../lib/api';

export default function Exam() {
  const navigate = useNavigate();
  const {
    questions, currentQuestionIndex, answers, markedForReview,
    setAnswer, clearAnswer, markForReview, nextQuestion, prevQuestion,
    goToQuestion, submitExam, isSubmitted, attemptId, timeRemaining, warningCount,
    incrementWarning, setOnline, token
  } = useExamStore();

  const [activeSection, setActiveSection] = useState('Physics');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);

  const sections = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];

  const submittingRef = useRef(false);

  const doSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    submitExam();
    try {
      if (attemptId && token) await apiSubmitExam(attemptId, answers, token);
    } catch (e) {
      console.error(e);
    }
    navigate('/feedback');
  }, [submitExam, attemptId, answers, token, navigate]);

  // Offline detection
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

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

  // Heartbeat
  const attemptIdRef = useRef(attemptId);
  const tokenRef = useRef(token);
  const timeRemainingRef = useRef(timeRemaining);
  const answersRef = useRef(answers);
  const warningCountRef = useRef(warningCount);

  useEffect(() => {
    attemptIdRef.current = attemptId;
    tokenRef.current = token;
    timeRemainingRef.current = timeRemaining;
    answersRef.current = answers;
    warningCountRef.current = warningCount;
  }, [attemptId, token, timeRemaining, answers, warningCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      const aId = attemptIdRef.current;
      const tk = tokenRef.current;
      if (aId && tk) {
        sendHeartbeat(aId, timeRemainingRef.current, answersRef.current, warningCountRef.current, tk).catch(console.error);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

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

  // Auto-submit on timer=0
  useEffect(() => {
    if (timeRemaining <= 0 && !isSubmitted) {
      doSubmit();
    }
  }, [timeRemaining, isSubmitted, doSubmit]);

  const currentQ = questions[currentQuestionIndex];
  const currentAnswer = currentQ ? answers[currentQ.id] : null;
  const sectionQuestions = questions.filter(q => q.section === activeSection);

  const _answered = Object.keys(answers).length;
  const _markedForReview = markedForReview.length;
  const _notAnswered = questions.length - _answered;
  void _markedForReview; void _notAnswered;

  const handleMSQToggle = (optKey: string) => {
    let selected = currentAnswer ? currentAnswer.split(',') : [];
    if (selected.includes(optKey)) {
      selected = selected.filter((k: string) => k !== optKey);
    } else {
      selected.push(optKey);
    }
    selected.sort();
    setAnswer(currentQ.id, selected.length > 0 ? selected.join(',') : undefined);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0a0a0a', color: '#e2e2e2', fontFamily: 'Inter, sans-serif' }}>
      <HallTicketBanner />

      {showTabWarning && (
        <div className="fixed top-0 inset-x-0 z-50 bg-red-600 text-white text-center py-3 font-bold text-sm animate-pulse">
          ⚠️ WARNING: Tab switch detected! ({warningCount}/3). Auto-submit triggers at 3 violations.
        </div>
      )}

      <header style={{ background: '#111', borderBottom: '1px solid #222' }} className="flex items-center justify-between px-6 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <span style={{ color: '#d4a520', fontWeight: 700, fontSize: '1rem', letterSpacing: 2 }}>VIGYAN.prep</span>
        </div>
        <Timer />
        <button
          onClick={() => setShowSubmitModal(true)}
          style={{ background: 'linear-gradient(135deg, #d4a520, #e8720a)', color: '#111', fontWeight: 700, border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Submit Exam
        </button>
      </header>

      <div style={{ background: '#111', borderBottom: '1px solid #222' }} className="flex items-center px-6 gap-2 py-2 shrink-0">
        {sections.map(sec => {
          const secAnswered = questions.filter(q => q.section === sec && answers[q.id]).length;
          const secTotal = questions.filter(q => q.section === sec).length;
          return (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              style={{
                background: activeSection === sec ? '#d4a520' : 'transparent',
                color: activeSection === sec ? '#111' : '#aaa',
                border: activeSection === sec ? 'none' : '1px solid #333',
                borderRadius: 6,
                padding: '5px 16px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {sec} ({secAnswered}/{secTotal})
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 flex flex-col overflow-y-auto ${isSubmitted ? 'pointer-events-none opacity-50' : ''}`} style={{ background: '#0d0d0d' }}>
          {isSubmitted && (
            <div className="bg-amber-500 text-black text-center py-2 font-bold z-10 sticky top-0">
              Exam submitted. Redirecting to feedback...
            </div>
          )}
          {currentQ ? (
            <div className="p-8 space-y-6 max-w-3xl mx-auto w-full">
              <div className="flex items-center justify-between">
                <span style={{ color: '#d4a520', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                  Question {currentQuestionIndex + 1} of {questions.length} • {currentQ.section}
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">{currentQ.type}</span>
              </div>
              <div className="bg-[#111] border border-[#222] rounded-xl p-6 text-[0.95rem] leading-relaxed text-[#e2e2e2] min-h-[120px] space-y-4">
                <div>{currentQ.text || 'Question text will appear here.'}</div>
                {(currentQ.image_url || (currentQ as any).imageUrl) && (
                  <div className="p-3 bg-[#000] border border-gray-800 rounded-lg text-center">
                    <img
                      src={currentQ.image_url || (currentQ as any).imageUrl}
                      alt="Question Diagram"
                      className="max-h-80 mx-auto object-contain rounded-md"
                    />
                  </div>
                )}
              </div>

              {currentQ.type === 'MSQ' && (
                <div className="space-y-3">
                  {(currentQ.options || ['A', 'B', 'C', 'D']).map((opt, idx) => {
                    const optKey = ['A', 'B', 'C', 'D'][idx];
                    const isSelected = currentAnswer && currentAnswer.split(',').includes(optKey);
                    return (
                      <label key={idx} className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer border ${isSelected ? 'border-amber-500 bg-amber-500/10' : 'border-gray-800 bg-[#111]'}`}>
                        <input type="checkbox" checked={isSelected} onChange={() => handleMSQToggle(optKey)} className="w-5 h-5 accent-amber-500" />
                        <span className="text-sm">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {currentQ.type === 'MCQ' && (
                <div className="space-y-3">
                  {(currentQ.options || ['A', 'B', 'C', 'D']).map((opt, idx) => {
                    const optKey = ['A', 'B', 'C', 'D'][idx];
                    const isSelected = currentAnswer === optKey;
                    return (
                      <button key={idx} onClick={() => setAnswer(currentQ.id, optKey)} className={`flex items-start gap-4 p-4 rounded-lg text-left border w-full ${isSelected ? 'border-amber-500 bg-amber-500/10 text-amber-50' : 'border-gray-800 bg-[#111] text-gray-400'}`}>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-500'}`}>{optKey}</span>
                        <span className="text-sm">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ.type === 'Numerical' && (
                <div>
                  <label className="text-gray-500 text-sm block mb-2">Enter Numerical Answer:</label>
                  <input
                    type="number"
                    value={currentAnswer || ''}
                    onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                    className="bg-[#111] border border-gray-800 rounded p-3 text-white outline-none focus:border-amber-500 w-64"
                    placeholder="Type answer..."
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-[#1e1e1e]">
                <div className="flex gap-3">
                  <button onClick={() => { markForReview(currentQ.id); nextQuestion(); }} className="bg-orange-500 text-white rounded px-4 py-2 font-semibold text-sm">Mark for Review & Next</button>
                  <button onClick={() => clearAnswer(currentQ.id)} className="border border-gray-800 text-gray-400 rounded px-4 py-2 font-semibold text-sm">Clear Response</button>
                </div>
                <div className="flex gap-3">
                  <button onClick={prevQuestion} disabled={currentQuestionIndex === 0} className="border border-gray-800 bg-[#1a1a1a] text-gray-400 rounded px-4 py-2 font-semibold text-sm disabled:opacity-50">← Previous</button>
                  <button onClick={nextQuestion} disabled={currentQuestionIndex === questions.length - 1} className="bg-amber-500 text-black rounded px-5 py-2 font-bold text-sm disabled:opacity-50">Save & Next →</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 text-gray-500">No questions loaded.</div>
          )}
        </div>

        <div className="w-64 bg-[#111] border-l border-[#1e1e1e] flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-[#1e1e1e]">
            <QuestionPalette
              questions={sectionQuestions}
              answers={answers}
              markedForReview={markedForReview}
              currentId={currentQ?.id}
              onSelect={(q) => goToQuestion(questions.findIndex(x => x.id === q.id))}
            />
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-8 max-w-sm w-full text-center">
            <h2 className="text-white text-xl font-bold mb-4">Confirm Submission</h2>
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={() => setShowSubmitModal(false)} className="px-6 py-2 rounded bg-[#1a1a1a] text-gray-400 border border-gray-800">Cancel</button>
              <button onClick={() => { setShowSubmitModal(false); doSubmit(); }} className="px-6 py-2 rounded bg-amber-500 text-black font-bold">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
