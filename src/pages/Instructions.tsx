import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, User, Loader2 } from 'lucide-react';
import { useExamStore, generateRollNumber } from '../stores/examStore';
import { getCookie } from '../lib/cookies';

export const Instructions: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId');
  const code = searchParams.get('code');
  const {
    setTestMeta, testTitle, durationMinutes, questionsCount, totalMarks,
    candidateName, rollNumber, setQuestions, questions, setAttemptId,
    setTimeRemaining, setIsLiveTest
  } = useExamStore();

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [windowClosed, setWindowClosed] = useState(false);

  const [meta, setMeta] = useState<{
    title?: string;
    examType?: string;
    durationMinutes?: number;
    questionsCount?: number;
    totalMarks?: number;
    pyqYear?: number | string;
    isLiveTest?: boolean;
  } | null>(null);

  const studentName = (typeof window !== 'undefined'
    ? (getCookie('student_name') || localStorage.getItem('student_name'))
    : null) || candidateName || 'Student';
  const studentEmail = (typeof window !== 'undefined'
    ? (getCookie('student_email') || localStorage.getItem('student_email'))
    : null) || '';
  const studentRoll = rollNumber || generateRollNumber(studentEmail, studentName);
  const studentToken = (typeof window !== 'undefined'
    ? (getCookie('student_token') || localStorage.getItem('student_token') || getCookie('auth_token') || localStorage.getItem('auth_token') || localStorage.getItem('token'))
    : null) || '';

  useEffect(() => {
    const fetchMeta = async () => {
      if (testId) {
        try {
          const apiBase = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';

          let examToken = '';
          if (code) {
            const exchangeRes = await fetch(`${apiBase}/api/exam-access/exchange`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code })
            });
            const exchangeData = await exchangeRes.json();
            if (exchangeRes.ok && exchangeData.examToken) {
              examToken = exchangeData.examToken;
            }
          }

          const res = await fetch(`${apiBase}/api/public/tests/${testId}`);
          const data = await res.json();

          if (data.success && data.test) {
            const qCount = data.questions && Array.isArray(data.questions)
              ? data.questions.length
              : (data.test.questions_count || 60);
            const totalMks = data.test.total_marks || (qCount * 4);
            const durMins = data.test.duration_minutes || 180;
            const pYear = data.test.pyq_year || data.test.year || new Date().getFullYear();
            const pTitle = data.test.title || 'IISER IAT Official Question Paper';
            const eType = data.test.exam_type || data.test.examType || 'IAT';
            const isLive = data.test.content_type === 'test_series';

            setMeta({ title: pTitle, examType: eType, durationMinutes: durMins, questionsCount: qCount, totalMarks: totalMks, pyqYear: pYear, isLiveTest: isLive });

            setTestMeta({
              testTitle: pTitle, examType: eType, durationMinutes: durMins,
              questionsCount: qCount, totalMarks: totalMks, pyqYear: pYear,
              testId, candidateName: studentName, rollNumber: studentRoll,
              token: examToken || studentToken
            });

            setIsLiveTest(isLive);

            if (data.questions && Array.isArray(data.questions)) {
              setQuestions(data.questions);
            }
          }
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Unable to load test instructions');
        }
      }
      setLoading(false);
    };
    fetchMeta();
  }, [testId, code]);

  const handleStartExam = async () => {
    setStarting(true);
    setError(null);

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';
      const authToken = studentToken || useExamStore.getState().token;
      let resumedAnswers: Record<string, string> = {};

      if (authToken && testId) {
        try {
          const startRes = await fetch(`${apiBase}/api/exam/lifecycle/start/${testId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (startRes.ok) {
            const startData = await startRes.json();

            if (startData.isExpired) {
              setWindowClosed(true);
              setStarting(false);
              return;
            }

            if (startData.attempt?.id) {
              setAttemptId(startData.attempt.id);
            }

            // Use server-authoritative remaining time (fixes timer bug)
            if (typeof startData.remaining_seconds === 'number' && startData.remaining_seconds > 0) {
              setTimeRemaining(startData.remaining_seconds);
            }

            // If exam was resumed, restore server answers and localStorage answers!
            if (startData.resumed && startData.answers && Object.keys(startData.answers).length > 0) {
              resumedAnswers = startData.answers;
            }
          }
        } catch (lifecycleErr) {
          // Non-fatal: continue with local timer if lifecycle call fails
          console.warn('Lifecycle start failed (continuing):', lifecycleErr);
        }
      }

      // Check local storage backup if not already found
      if (!resumedAnswers || Object.keys(resumedAnswers).length === 0) {
        try {
          const localStored = localStorage.getItem(`vigyan_response_${testId}`) || localStorage.getItem('vigyan_last_answers');
          if (localStored) {
            const parsed = JSON.parse(localStored);
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
              resumedAnswers = parsed;
            }
          }
        } catch {}
      }

      // 🔄 Initialize session state (preserving candidate answers if resumed)
      useExamStore.setState({
        answers: resumedAnswers || {},
        markedForReview: [],
        visitedQuestions: [],
        currentQuestionIndex: 0,
        isSubmitted: false,
        warningCount: 0
      });

      // Cross-browser & iPad fullscreen attempt with vendor prefixes
      try {
        const docEl = document.documentElement as any;
        const reqFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
        if (reqFs) {
          reqFs.call(docEl).catch(() => {});
        }
      } catch {}

      navigate('/exam' + window.location.search);
    } catch (err: any) {
      setError(err.message || 'Failed to start exam. Please try again.');
      setStarting(false);
    }
  };

  const displayTitle = meta?.title || testTitle || 'IISER IAT Official Question Paper';
  const displayDuration = meta?.durationMinutes || durationMinutes || 180;
  const displayQuestionsCount = meta?.questionsCount || questionsCount || (questions ? questions.length : 60);
  const displayTotalMarks = meta?.totalMarks || totalMarks || (displayQuestionsCount * 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] text-gray-800 flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-10 h-10 border-4 border-[#1b365d] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wider text-[#1b365d]">Loading Official Examination Instructions...</p>
      </div>
    );
  }

  if (windowClosed) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex flex-col items-center justify-center font-sans p-8">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-10 text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="text-red-500" size={36} />
          </div>
          <h2 className="text-xl font-bold text-red-700">Test Window Closed</h2>
          <p className="text-sm text-gray-600">
            The examination window for this test has expired. You cannot start or resume this test.
            Please contact your administrator if you believe this is an error.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 bg-[#1b365d] text-white font-bold text-sm rounded-lg hover:bg-[#2a4a7f] transition"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-gray-800 font-sans flex flex-col justify-between">
      <header className="bg-[#1b365d] text-white py-4 px-6 shadow-md border-b-4 border-amber-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-[#1b365d] text-xl shadow">VP</div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">VIGYAN.PREP CBT TEST PORTAL</h1>
              <p className="text-xs text-amber-300 uppercase tracking-widest font-semibold">National Testing Agency (NTA) Standard Interface</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs bg-white/10 px-3 py-1 rounded text-white font-medium">Default Language: English</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-6 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6 text-sm text-gray-700">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-[#1b365d]">GENERAL INSTRUCTIONS</h2>
            <p className="text-xs text-gray-500 mt-1">Please read the instructions carefully before starting the examination.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <section className="space-y-3">
            <h3 className="font-bold text-gray-900 text-base">1. General Guidelines & Timing</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 leading-relaxed">
              <li>The total duration of the examination is <strong>{displayDuration} minutes ({(displayDuration / 60).toFixed(1)} Hours)</strong>.</li>
              <li>The clock will be set at the server. The countdown timer in the top right corner will display the remaining time available for you to complete the exam.</li>
              <li>When the timer reaches zero, the examination will end automatically. You do not need to click submit.</li>
              <li>The Question Palette displayed on the right side of screen shows the status of each question using one of the following symbols:</li>
            </ul>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <span className="w-8 h-8 rounded bg-gray-200 border border-gray-400 flex items-center justify-center font-bold text-xs text-gray-700">1</span>
                <span className="text-xs text-gray-700 font-medium">You have not visited the question yet.</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <span className="w-8 h-8 rounded bg-[#dc3545] text-white flex items-center justify-center font-bold text-xs shadow">2</span>
                <span className="text-xs text-gray-700 font-medium">You have not answered the question.</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <span className="w-8 h-8 rounded bg-[#28a745] text-white flex items-center justify-center font-bold text-xs shadow">3</span>
                <span className="text-xs text-gray-700 font-medium">You have answered the question.</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <span className="w-8 h-8 rounded-full bg-[#6f42c1] text-white flex items-center justify-center font-bold text-xs shadow">4</span>
                <span className="text-xs text-gray-700 font-medium">You have NOT answered, but marked for review.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-2">
            <h3 className="font-bold text-gray-900 text-base">2. Navigating & Answering Questions</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 leading-relaxed">
              <li>To select an option, click on the button of one of the options (A, B, C, D).</li>
              <li>To deselect your chosen answer, click on the <strong>Clear Response</strong> button.</li>
              <li>To save your answer, you MUST click on the <strong>Save & Next</strong> button.</li>
              <li>To mark a question for review, click on the <strong>Mark for Review & Next</strong> button.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-2">
            <h3 className="font-bold text-gray-900 text-base">3. Section & Marking Scheme</h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 space-y-1 text-xs">
              <p className="font-bold">IISER IAT / NISER NEST Marking Scheme:</p>
              <p>• Correct Answer: <strong>+4 Marks</strong></p>
              <p>• Incorrect Answer: <strong>-1 Mark</strong></p>
              <p>• Unattempted: <strong>0 Marks</strong></p>
            </div>
          </section>

          <section className="space-y-3 pt-2">
            <h3 className="font-bold text-red-600 text-base">4. Proctored Security Notice</h3>
            <p className="text-xs text-red-700 bg-red-50 p-3 rounded border border-red-200">
              ⚠️ <strong>Strict Proctoring Enabled:</strong> Fullscreen mode is compulsory. Switching tabs or windows will trigger a security violation warning. 3 tab violations will automatically submit your exam.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-200 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer p-4 bg-amber-50 rounded-lg border border-amber-300">
              <input type="checkbox" className="w-5 h-5 accent-[#1b365d] rounded mt-0.5" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span className="text-xs font-semibold text-gray-800 leading-relaxed">
                I have read and understood all the instructions. All computer hardware allotted to me is in proper working condition. I agree to follow all proctoring guidelines.
              </span>
            </label>
            <div className="flex justify-end">
              <button
                onClick={handleStartExam}
                disabled={!agreed || starting}
                className="px-8 py-3.5 bg-[#28a745] hover:bg-[#218838] disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold rounded-lg shadow-md transition-all text-sm uppercase tracking-wider flex items-center gap-2"
              >
                {starting ? (<><Loader2 size={16} className="animate-spin" /> Starting Exam...</>) : 'I am ready to begin →'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 h-fit">
          <div className="text-center space-y-3 pb-4 border-b">
            <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-300 mx-auto flex items-center justify-center text-gray-400">
              <User size={48} />
            </div>
            <div>
              <h3 className="font-bold text-[#1b365d] text-base">{studentName}</h3>
              <p className="text-xs text-gray-500 font-bold">Roll No: {studentRoll}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b text-gray-600">
              <span>Exam Paper:</span>
              <strong className="text-gray-900 text-right ml-2 truncate max-w-[120px]">{displayTitle}</strong>
            </div>
            <div className="flex justify-between py-1 border-b text-gray-600">
              <span>Duration:</span>
              <strong className="text-gray-900">{displayDuration} Minutes</strong>
            </div>
            <div className="flex justify-between py-1 border-b text-gray-600">
              <span>Total Questions:</span>
              <strong className="text-gray-900">{displayQuestionsCount} Questions</strong>
            </div>
            <div className="flex justify-between py-1 text-gray-600">
              <span>Maximum Marks:</span>
              <strong className="text-gray-900">{displayTotalMarks} Marks</strong>
            </div>
            {meta?.isLiveTest && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-center">
                <p className="text-[10px] font-bold text-red-700">🔴 LIVE PROCTORED EXAM</p>
                <p className="text-[9px] text-red-600">Single attempt only. Re-attempt not allowed.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-3 text-center text-xs text-gray-500">
        © 2026 Vigyan.prep NTA Standard Examination System • All Rights Reserved
      </footer>
    </div>
  );
};
