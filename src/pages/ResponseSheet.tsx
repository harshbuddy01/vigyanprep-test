import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useExamStore } from "../stores/examStore";
import { getCookie } from "../lib/cookies";
import { MathText } from "../components/MathText";
import {
  CheckCircle2, XCircle, Download, Home, RotateCcw,
  Trophy, BarChart3, Minus, AlertTriangle,
  ChevronDown, ChevronUp, Flag, X, Send, CheckCircle, BookOpen
} from "lucide-react";

function formatImageUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  return trimmed;
}

interface QuestionResult {
  id: string;
  question_text?: string;
  text?: string;
  options?: string[];
  section?: string;
  image_url?: string;
  correct_answer?: string;
  correctAnswer?: string;
  studentAnswer?: string | null;
  status?: "correct" | "incorrect" | "unattempted" | "attempted";
  marksEarned?: number | null;
  solution_explanation?: string;
}

interface AttemptResult {
  totalScore: number | null;
  sectionScores: Record<string, { correct: number; incorrect: number; unattempted: number; score: number }> | null;
  rank: number | null;
  percentile: number | null;
  resultReleased: boolean;
  questions: QuestionResult[];
  totalQuestions: number;
  attempted: number;
}

export const ResponseSheet: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testIdFromUrl = searchParams.get('testId');
  const isSolutionsOnly = searchParams.get('viewSolutions') === 'true';

  const {
    questions: localQuestions,
    answers: localAnswers,
    testTitle, candidateName, rollNumber, examType, testId,
    attemptId, token, resetExamState, markedForReview
  } = useExamStore();

  const activeTestId = testIdFromUrl || testId;

  const [activeTab, setActiveTab] = useState("Physics");
  const [serverResult, setServerResult] = useState<AttemptResult | null>(null);
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // 🚩 Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingQuestionId, setReportingQuestionId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportType, setReportType] = useState('wrong_answer');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const sections = ["Physics", "Chemistry", "Mathematics", "Biology"];

  const [fetchedQuestions, setFetchedQuestions] = useState<any[]>([]);
  const [testData, setTestData] = useState<any>(null);

  useEffect(() => {
    const authToken = token || getCookie('student_token') || localStorage.getItem('student_token') || getCookie('auth_token') || localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
    const apiBase = import.meta.env.VITE_API_URL || "https://api.vigyanprep.com";

    const fetchResult = async () => {
      try {
        // 1. If attempt exists, load their personal attempt result
        if (attemptId && !isSolutionsOnly && authToken) {
          const res = await fetch(`${apiBase}/api/exam/lifecycle/result/${attemptId}`, {
            headers: { "Authorization": `Bearer ${authToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setServerResult(data as AttemptResult);
              if (data.test) setTestData(data.test);
              return;
            }
          }
        }

        // 2. If no attemptId in state, look up user's latest submitted attempt for this test
        if (activeTestId && !isSolutionsOnly && authToken) {
          try {
            const attRes = await fetch(`${apiBase}/api/student/attempts?cb=${Date.now()}`, {
              headers: { "Authorization": `Bearer ${authToken}` }
            });
            if (attRes.ok) {
              const attData = await attRes.json();
              const match = (attData.attempts || []).find((a: any) => (a.test_id === activeTestId || a.testId === activeTestId) && a.status === 'submitted')
                || (attData.attempts || []).find((a: any) => a.test_id === activeTestId || a.testId === activeTestId);
              if (match?.id) {
                const res = await fetch(`${apiBase}/api/exam/lifecycle/result/${match.id}`, {
                  headers: { "Authorization": `Bearer ${authToken}` }
                });
                if (res.ok) {
                  const data = await res.json();
                  if (data.success) {
                    setServerResult(data as AttemptResult);
                    if (data.test) setTestData(data.test);
                    return;
                  }
                }
              }
            }
          } catch (e) {
            console.warn("Attempt lookup notice:", e);
          }
        }

        // 2.5 Try fetching paper solutions if released
        if (activeTestId) {
          try {
            const solRes = await fetch(`${apiBase}/api/exam/lifecycle/solutions/${activeTestId}`, {
              headers: authToken ? { "Authorization": `Bearer ${authToken}` } : {}
            });
            if (solRes.ok) {
              const solData = await solRes.json();
              if (solData.success && solData.questions) {
                setFetchedQuestions(solData.questions);
                if (solData.testTitle) {
                  setTestData((prev: any) => ({ ...prev, title: solData.testTitle, response_released_at: new Date().toISOString() }));
                }
              }
            }
          } catch (e) {}
        }

        // 3. Fallback: Fetch public questions / solutions and test metadata
        if (activeTestId) {
          const pubRes = await fetch(`${apiBase}/api/public/tests/${activeTestId}`);
          if (pubRes.ok) {
            const pubData = await pubRes.json();
            if (pubData.test) {
              setTestData((prev: any) => ({ ...pubData.test, ...(prev || {}) }));
            }
            if (pubData.questions && Array.isArray(pubData.questions)) {
              setFetchedQuestions(prev => prev.length > 0 ? prev : pubData.questions);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch server result or solutions:", err);
      }
    };
    fetchResult();
  }, [attemptId, token, activeTestId, isSolutionsOnly]);

  // 🚩 Report handler
  const handleSubmitReport = async () => {
    if (!reportingQuestionId || reportReason.trim().length < 20) return;
    setReportSubmitting(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';
      const authToken = token || localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const res = await fetch(`${apiBase}/api/admin/question-reports/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({
          testId,
          questionId: reportingQuestionId,
          reason: `[${reportType.toUpperCase()}] ${reportReason.trim()}`
        })
      });
      if (res.ok) {
        setReportSuccess(true);
        setReportReason('');
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
          setReportType('wrong_answer');
          setReportingQuestionId(null);
        }, 2000);
      }
    } catch (err) { console.error('Report failed:', err); }
    finally { setReportSubmitting(false); }
  };

  const displayQuestions = React.useMemo(() => {
    if (serverResult?.questions && serverResult.questions.length > 0) return serverResult.questions;
    if (localQuestions && localQuestions.length > 0) return localQuestions;
    if (fetchedQuestions && fetchedQuestions.length > 0) return fetchedQuestions;
    return [];
  }, [serverResult, localQuestions, fetchedQuestions]);

  const displayAnswers = React.useMemo(() => {
    let merged: Record<string, string> = {};
    try {
      const rawLast = localStorage.getItem('vigyan_last_answers');
      if (rawLast) merged = { ...merged, ...JSON.parse(rawLast) };
      if (activeTestId) {
        const raw = localStorage.getItem(`vigyan_response_${activeTestId}`);
        if (raw) merged = { ...merged, ...JSON.parse(raw) };
      }
    } catch (e) {}
    if (serverResult?.questions) {
      serverResult.questions.forEach(q => {
        if (q.studentAnswer) merged[q.id] = q.studentAnswer;
      });
    }
    return { ...merged, ...(localAnswers || {}) };
  }, [localAnswers, activeTestId, serverResult]);

  const answeredCount = Object.keys(displayAnswers).filter(k => !!displayAnswers[k]).length;
  const totalMaxScore = displayQuestions.length * 4;

  // 🛡️ STRICT DISTINCTION: Paid Test Series vs Free PYQs
  // Free PYQ mode ONLY applies if the test is explicitly a PYQ (content_type === 'pyq' or title contains 'PYQ' / 'Previous Year')
  // ALL regular test series (IAT 01, IAT 02, NEST 01, CMI 01, live mocks, scheduled test series) are strictly PAID TEST SERIES (hidden answers & secret scoring until admin release!)
  const activeTitle = (testData?.title || testTitle || (serverResult as any)?.test?.title || '').toUpperCase();
  const contentType = (testData?.content_type || (serverResult as any)?.test?.content_type || '').toLowerCase();

  const isExplicitPyq = Boolean(
    contentType === 'pyq' ||
    (activeTitle.includes('PYQ') && !activeTitle.includes('TEST SERIES') && !activeTitle.includes('MOCK') && !activeTitle.startsWith('IAT 0') && !activeTitle.startsWith('NEST 0')) ||
    (activeTitle.includes('PREVIOUS YEAR') && !activeTitle.includes('TEST SERIES') && !activeTitle.includes('MOCK'))
  );

  const isPaidSeries = !isExplicitPyq;
  const hasServerResult = Boolean(serverResult && (serverResult.resultReleased || serverResult.totalScore !== null));
  const isResultDeclared = Boolean(
    !isPaidSeries ||
    hasServerResult ||
    testData?.status === 'completed' ||
    Boolean(testData?.response_released_at && new Date(testData.response_released_at) <= new Date())
  );

  const localScoring = React.useMemo(() => {
    let correctCount = 0, incorrectCount = 0, unattemptedCount = 0, totalScore = 0;
    const sectionScores: Record<string, any> = {
      Physics: { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: 0 },
      Chemistry: { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: 0 },
      Mathematics: { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: 0 },
      Biology: { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: 0 },
    };
    displayQuestions.forEach(q => {
      const studentAns = displayAnswers[q.id];
      const sec = q.section && sections.includes(q.section) ? q.section : "Physics";
      if (!sectionScores[sec]) sectionScores[sec] = { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: 0 };
      sectionScores[sec].total++;

      const correctKey = (q.correct_answer || (q as any).correctAnswer || '').trim().toUpperCase();
      const studentKey = (studentAns || '').trim().toUpperCase();

      if (!studentKey) {
        unattemptedCount++;
        sectionScores[sec].unattempted++;
      } else if (correctKey && studentKey === correctKey) {
        correctCount++;
        totalScore += 4;
        sectionScores[sec].correct++;
        sectionScores[sec].score += 4;
      } else if (!correctKey) {
        unattemptedCount++;
        sectionScores[sec].unattempted++;
      } else {
        incorrectCount++;
        totalScore -= 1;
        sectionScores[sec].incorrect++;
        sectionScores[sec].score -= 1;
      }
    });

    const attemptedCount = correctCount + incorrectCount;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const percentage = totalMaxScore > 0 ? Math.max(0, Math.round((totalScore / totalMaxScore) * 100)) : 0;

    return {
      correctCount,
      incorrectCount,
      unattemptedCount,
      attemptedCount,
      totalScore,
      sectionScores,
      accuracy,
      percentage
    };
  }, [displayQuestions, displayAnswers, totalMaxScore]);

  const handleReattempt = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetTestId = urlParams.get("testId") || testId;
    if (targetTestId) { resetExamState(targetTestId); navigate(`/exam?testId=${targetTestId}`); }
    else navigate("/");
  };

  const toggleSolution = (id: string) => setExpandedSolutions(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-gray-800 font-sans">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .results-dark { display: none !important; }
          body, div { background: white !important; color: black !important; }
          .print-card { break-inside: avoid !important; page-break-inside: avoid !important; }
          @page { size: A4 portrait; margin: 12mm; }
        }
        @media screen { .print-only { display: none !important; } }
      `}</style>

      {/* SCREEN HEADER */}
      <header className="no-print bg-[#1b365d] text-white py-4 px-6 shadow-md border-b-4 border-amber-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-wide">
              {isResultDeclared ? "OFFICIAL EXAMINATION SCORECARD & PERFORMANCE ANALYSIS" : "OFFICIAL CANDIDATE RESPONSE SHEET"}
            </h1>
            <p className="text-xs text-amber-300 font-semibold">
              {testData?.title || testTitle || "IISER / NEST Examination"} • {isResultDeclared ? "Official Merit, Marks Breakdown & Verified Solutions" : "Recorded Responses"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {!isPaidSeries && (
              <button onClick={handleReattempt} className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer">
                <RotateCcw size={15} /> Re-Attempt Test
              </button>
            )}
            <button onClick={() => window.print()} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer">
              <Download size={15} /> Download {isResultDeclared ? "Scorecard" : "Response Sheet"}
            </button>
            <a href="https://vigyanprep.com" className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 border border-white/20 transition cursor-pointer">
              <Home size={15} /> Home
            </a>
          </div>
        </div>
      </header>

      {/* PRINT HEADER */}
      <div className="print-only" style={{display:"none"}}>
        <div style={{background:"#1b365d",color:"white",padding:"14px 24px",borderBottom:"4px solid #f59e0b",marginBottom:"12px"}}>
          <div style={{fontSize:"15px",fontWeight:"bold"}}>VIGYAN.PREP — OFFICIAL CANDIDATE RESPONSE SHEET</div>
          <div style={{fontSize:"11px",color:"#fcd34d",marginTop:"3px"}}>{testTitle || "IISER / NEST Examination"} • NTA CBT Standard</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"6px 24px",background:"#f9fafb",borderBottom:"1px solid #e5e7eb",fontSize:"11px"}}>
          <span><strong>Candidate:</strong> {candidateName || "Student"}</span>
          <span><strong>Roll No:</strong> {rollNumber || "N/A"}</span>
          <span><strong>Exam:</strong> {examType || "IAT"}</span>
          <span><strong>Downloaded:</strong> {new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
        </div>
        <div style={{padding:"6px 24px",background:"#fef3c7",borderBottom:"1px solid #fde68a",fontSize:"10px",color:"#92400e",fontWeight:"bold"}}>
          ⚠ This document shows only your selected responses. Correct answers are NOT included. Results will be declared by the administrator.
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

        {/* SUMMARY CARDS & PERFORMANCE SCORECARD */}
        {displayQuestions.length > 0 && (
          <div className="no-print space-y-4">
            
            {/* 🌟 Result Declared: Show Comprehensive Scorecard & AIR Rank */}
            {isResultDeclared ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Trophy className="text-amber-500" size={24} />
                      <h2 className="text-lg sm:text-xl font-black text-[#1b365d] tracking-wide">
                        {isPaidSeries ? "Official Examination Scorecard & AIR Rank" : "Instant Practice Exam Scorecard"}
                      </h2>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        isPaidSeries ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {isPaidSeries ? "Official Result" : "PYQ Mode"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isPaidSeries 
                        ? `Official merit analysis declared by academic board • ${testTitle || 'Live Test Series'}`
                        : "Detailed accuracy, section-wise marks breakdown, and verified question solutions"}
                    </p>
                  </div>
                  {!isPaidSeries && (
                    <button
                      onClick={handleReattempt}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer self-start sm:self-auto"
                    >
                      <RotateCcw size={14} /> Re-Attempt Practice
                    </button>
                  )}
                </div>

                {/* Score & KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <p className="text-3xl font-black text-[#1b365d]">
                      {serverResult?.totalScore !== null && serverResult?.totalScore !== undefined ? serverResult.totalScore : localScoring.totalScore}
                      <span className="text-sm font-semibold text-gray-400"> / {totalMaxScore}</span>
                    </p>
                    <p className="text-xs text-gray-500 font-bold mt-1">Score Obtained</p>
                    <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">{localScoring.percentage}% Marks</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                    <p className="text-3xl font-black text-emerald-700">
                      {serverResult?.rank ? `#${serverResult.rank}` : `${localScoring.accuracy}%`}
                    </p>
                    <p className="text-xs text-gray-500 font-bold mt-1">
                      {serverResult?.rank ? "All-India Rank" : "Accuracy Rate"}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      {serverResult?.percentile ? `${serverResult.percentile.toFixed(1)}th percentile` : `${localScoring.correctCount} of ${localScoring.attemptedCount} Correct`}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                    <p className="text-3xl font-black text-amber-700">{localScoring.attemptedCount} <span className="text-sm font-semibold text-gray-400">/ {displayQuestions.length}</span></p>
                    <p className="text-xs text-gray-500 font-bold mt-1">Questions Attempted</p>
                    <p className="text-[10px] text-amber-600 font-semibold mt-0.5">{localScoring.unattemptedCount} Skipped</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100">
                    <p className="text-3xl font-black text-rose-700">{localScoring.incorrectCount}</p>
                    <p className="text-xs text-gray-500 font-bold mt-1">Incorrect Answers</p>
                    <p className="text-[10px] text-rose-600 font-semibold mt-0.5">-{localScoring.incorrectCount} Negative Marks</p>
                  </div>
                </div>

                {/* Subject-Wise Analysis Cards */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <BarChart3 size={15} className="text-indigo-600" /> Subject-wise Performance
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {sections.map(sec => {
                      const s = (serverResult?.sectionScores && serverResult.sectionScores[sec]) || localScoring.sectionScores[sec] || { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: 0 };
                      const secAttempted = s.correct + s.incorrect;
                      const secAcc = secAttempted > 0 ? Math.round((s.correct / secAttempted) * 100) : 0;
                      return (
                        <div key={sec} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-[#1b365d]">{sec}</span>
                              <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${s.score >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                {s.score > 0 ? `+${s.score}` : s.score} Marks
                              </span>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex justify-between"><span className="text-emerald-700">✓ Correct</span><span className="font-bold">{s.correct}</span></div>
                              <div className="flex justify-between"><span className="text-rose-700">✗ Incorrect</span><span className="font-bold">{s.incorrect}</span></div>
                              <div className="flex justify-between"><span className="text-gray-400">— Skipped</span><span>{s.unattempted}</span></div>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between text-[11px]">
                            <span className="text-gray-500 font-medium">Accuracy</span>
                            <span className="font-bold text-indigo-700">{secAcc}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 📢 Official Answer Key Challenge & Grievance Policy Notice */}
                <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-start gap-3.5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
                    <Flag size={18} />
                  </div>
                  <div className="space-y-1 text-xs text-amber-950 flex-1 leading-relaxed">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm">Question & Answer Key Discrepancy Reporting</h4>
                      <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded uppercase tracking-wider">
                        Important
                      </span>
                    </div>
                    <p className="text-amber-900">
                      If you feel that any question statement, diagram, or answer option key is incorrect, please click the <strong className="text-amber-950">"Report"</strong> button located on that question card below to file an academic challenge.
                    </p>
                    <p className="font-bold text-red-700 pt-0.5 text-[11px]">
                      ⚠️ <strong>Note:</strong> All question and answer key challenges must be submitted before the final merit rank declaration. No modifications will be entertained after the All-India Rank list is officially disclosed.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* 🔒 Paid Live Test Series - Unreleased Response Sheet Card */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100"><p className="text-2xl font-black text-[#1b365d]">{displayQuestions.length}</p><p className="text-xs text-gray-500 font-semibold mt-1">Total Questions</p></div>
                  <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100"><p className="text-2xl font-black text-emerald-700">{answeredCount}</p><p className="text-xs text-gray-500 font-semibold mt-1">Answered</p></div>
                  <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100"><p className="text-2xl font-black text-red-600">{displayQuestions.length - answeredCount}</p><p className="text-xs text-gray-500 font-semibold mt-1">Unattempted</p></div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100"><p className="text-2xl font-black text-amber-700">{(markedForReview || []).length}</p><p className="text-xs text-gray-500 font-semibold mt-1">Marked for Review</p></div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-bold text-amber-800 text-sm">✅ Live Exam Submitted Successfully</p>
                    <p className="text-xs text-amber-700 mt-1">Your responses have been recorded securely. Official Results, All-India Ranks, and Verified Answer Keys will be declared by the examination administrator after the test window closes.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESPONSE TABLE & SOLUTIONS */}
        {displayQuestions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="no-print px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[#1b365d] text-base">
                  {isResultDeclared ? "Official Question Paper Solutions & Answer Key" : "Your Official Response Sheet"}
                </h2>
                <p className="text-xs text-gray-500">
                  {isResultDeclared
                    ? "Review candidate responses against official answer keys and step-by-step academic explanations"
                    : "Shows your recorded candidate selections • Correct answers are released upon official declaration"
                  }
                </p>
              </div>
            </div>

            <div className="no-print flex overflow-x-auto border-b bg-gray-50">
              {sections.map(sec => {
                const secQs = displayQuestions.filter(q => q.section === sec || (!sections.includes(q.section) && sec === "Physics"));
                const secAns = secQs.filter(q => displayAnswers[q.id]).length;
                return (
                  <button
                    key={sec}
                    onClick={() => setActiveTab(sec)}
                    className={`px-5 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-2 cursor-pointer ${
                      activeTab === sec
                        ? "border-[#1b365d] text-[#1b365d] bg-white"
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    <span>{sec}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === sec ? "bg-blue-100 text-[#1b365d]" : "bg-gray-200 text-gray-600"
                    }`}>
                      {secAns}/{secQs.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Questions List */}
            <div className="divide-y divide-gray-100">
              {displayQuestions
                .filter(q => q.section === activeTab || (!sections.includes(q.section) && activeTab === "Physics"))
                .map((q, idx) => {
                  const studentAns = (displayAnswers[q.id] || '').trim().toUpperCase();
                  const correctKey = ((q.correct_answer || (q as any).correctAnswer) || '').trim().toUpperCase();
                  const isCorrect = studentAns && correctKey && studentAns === correctKey;
                  const isWrong = studentAns && correctKey && studentAns !== correctKey;
                  const isUnattempted = !studentAns;
                  const opts = q.options && q.options.length >= 2 ? q.options : ["Option A", "Option B", "Option C", "Option D"];
                  const optLabels = ["A", "B", "C", "D"];
                  const isExpanded = expandedSolutions[q.id];

                  return (
                    <div key={q.id} className="p-5 hover:bg-gray-50/50 transition">
                      <div className="flex items-start gap-4">
                        <span className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-700 shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          
                          {/* Question Top Status Pill when Result is Declared */}
                          {isResultDeclared && (
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-gray-400">Question {idx + 1} ({q.section || activeTab})</span>
                              {isCorrect && (
                                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold rounded-full flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Correct (+4)
                                </span>
                              )}
                              {isWrong && (
                                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 text-xs font-extrabold rounded-full flex items-center gap-1">
                                  <XCircle size={12} /> Incorrect (-1)
                                </span>
                              )}
                              {isUnattempted && (
                                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold rounded-full flex items-center gap-1">
                                  <Minus size={12} /> Unattempted (0)
                                </span>
                              )}
                            </div>
                          )}

                          <div className="text-sm text-gray-900 font-medium mb-3 leading-relaxed">
                            <MathText text={(q as any).question_text || q.text || ""} />
                          </div>

                          {(q.image_url || (q as any).imageUrl) && (
                            <div className="mb-3">
                              <img src={formatImageUrl(q.image_url || (q as any).imageUrl || "")} alt="diagram" className="max-h-48 object-contain rounded-xl border border-gray-200 bg-white p-1" />
                            </div>
                          )}

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                            {opts.map((opt: string, oi: number) => {
                              const label = optLabels[oi];
                              const isStudentChoice = studentAns === label;
                              const isOfficialCorrect = correctKey === label;

                              let optStyle = "border-gray-200 bg-gray-50 text-gray-700";
                              let badgeStyle = "bg-gray-200 text-gray-700";

                              if (isResultDeclared) {
                                // 🌟 Result Declared: Show official answer in emerald and wrong student answer in rose
                                if (isOfficialCorrect) {
                                  optStyle = "border-emerald-500 bg-emerald-50/80 text-emerald-900 font-bold shadow-sm ring-1 ring-emerald-400";
                                  badgeStyle = "bg-emerald-600 text-white";
                                } else if (isStudentChoice && !isOfficialCorrect) {
                                  optStyle = "border-rose-400 bg-rose-50 text-rose-900 font-bold";
                                  badgeStyle = "bg-rose-600 text-white";
                                }
                              } else {
                                // 🔒 Unreleased Live Mode: Only show what candidate picked in neutral blue
                                if (isStudentChoice) {
                                  optStyle = "border-[#1b365d] bg-blue-50 text-[#1b365d] font-bold";
                                  badgeStyle = "bg-[#1b365d] text-white";
                                }
                              }

                              return (
                                <div key={oi} className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs transition ${optStyle}`}>
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${badgeStyle}`}>
                                    {label}
                                  </span>
                                  <div className="flex-1"><MathText text={opt} /></div>
                                  {isResultDeclared && isOfficialCorrect && (
                                    <span className="text-[10px] font-extrabold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                                      {isStudentChoice ? "✓ Your Choice (Correct +4)" : "✓ Official Correct Key"}
                                    </span>
                                  )}
                                  {isResultDeclared && isStudentChoice && !isOfficialCorrect && (
                                    <span className="text-[10px] font-extrabold text-rose-900 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                                      ✗ Your Choice (-1 Mark)
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Action Footer */}
                          <div className="flex items-center justify-between text-xs pt-1">
                            <div>
                              {isUnattempted && <span className="text-gray-400 italic flex items-center gap-1"><Minus size={12} /> Not attempted</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              {isResultDeclared && ((q as any).solution_explanation || (q as any).model_answer) && (
                                <button
                                  onClick={() => toggleSolution(q.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition cursor-pointer"
                                >
                                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                  {isExpanded ? "Hide Solution" : "View Explanation"}
                                </button>
                              )}
                              <button
                                onClick={() => { setReportingQuestionId(q.id); setShowReportModal(true); setReportSuccess(false); }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg text-xs font-medium transition cursor-pointer"
                                title="Report an issue with this question"
                              >
                                <Flag size={11} /> Report
                              </button>
                            </div>
                          </div>

                          {/* Expandable Model Solution */}
                          {isResultDeclared && isExpanded && ((q as any).solution_explanation || (q as any).model_answer) && (
                            <div className="mt-3 p-4 bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-950 space-y-2 leading-relaxed animate-fade-in">
                              <p className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                                <BookOpen size={14} className="text-indigo-600" /> Academic Model Solution &amp; Explanation:
                              </p>
                              <div className="text-gray-800"><MathText text={(q as any).solution_explanation || (q as any).model_answer || ""} /></div>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* PRINT TABLE */}
            <div className="print-only" style={{display:"none"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"10px"}}>
                <thead>
                  <tr style={{background:"#1b365d",color:"white"}}>
                    <th style={{padding:"5px 8px",border:"1px solid #ccc",textAlign:"left"}}>Q#</th>
                    <th style={{padding:"5px 8px",border:"1px solid #ccc",textAlign:"left"}}>Section</th>
                    <th style={{padding:"5px 8px",border:"1px solid #ccc",textAlign:"center"}}>Your Answer</th>
                    <th style={{padding:"5px 8px",border:"1px solid #ccc",textAlign:"center"}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayQuestions.map((q, idx) => {
                    const ans = displayAnswers[q.id];
                    return (
                      <tr key={q.id} style={{background: idx % 2 === 0 ? "#fff" : "#f9fafb"}}>
                        <td style={{padding:"4px 8px",border:"1px solid #e5e7eb",fontWeight:"bold"}}>{idx + 1}</td>
                        <td style={{padding:"4px 8px",border:"1px solid #e5e7eb"}}>{q.section || "General"}</td>
                        <td style={{padding:"4px 8px",border:"1px solid #e5e7eb",textAlign:"center",fontWeight:"bold",color: ans ? "#1b365d" : "#9ca3af"}}>{ans || "—"}</td>
                        <td style={{padding:"4px 8px",border:"1px solid #e5e7eb",textAlign:"center",fontSize:"9px",color: ans ? "#065f46" : "#6b7280"}}>{ans ? "Attempted" : "Not Attempted"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{marginTop:"12px",padding:"8px",background:"#f3f4f6",borderRadius:"6px",fontSize:"10px"}}>
                <strong>Summary:</strong> Total: {displayQuestions.length} | Answered: {answeredCount} | Not Attempted: {displayQuestions.length - answeredCount}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 🚩 REPORT QUESTION MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 space-y-4">
            {reportSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle className="text-green-500" size={44} />
                <p className="text-base font-bold text-gray-800">Report Submitted!</p>
                <p className="text-xs text-gray-500 text-center">Thank you. Our team will review this question within 24 hours.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flag className="text-red-500" size={18} />
                    <h3 className="font-bold text-gray-900">Report This Question</h3>
                  </div>
                  <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Type of Issue</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'wrong_answer', label: '❌ Wrong Answer Key' },
                      { value: 'typo_error', label: '✏️ Typo / Error in Question' },
                      { value: 'image_missing', label: '🖼️ Image Missing/Broken' },
                      { value: 'ambiguous', label: '🤔 Ambiguous / Unclear' },
                      { value: 'wrong_language', label: '🔤 Wrong Formula/Language' },
                      { value: 'other', label: '📝 Other Issue' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setReportType(opt.value)}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold text-left transition ${
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
                  <p className={`text-[10px] mt-1 ${reportReason.trim().length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
                    {reportReason.trim().length}/20 characters minimum
                  </p>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    disabled={reportReason.trim().length < 20 || reportSubmitting}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-400 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    {reportSubmitting
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><Send size={13} /> Submit Report</>
                    }
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
