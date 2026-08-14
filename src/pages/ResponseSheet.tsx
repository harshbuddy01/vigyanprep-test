import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExamStore } from "../stores/examStore";
import { MathText } from "../components/MathText";
import {
  CheckCircle2, XCircle, Download, Home, RotateCcw,
  Clock, Trophy, BarChart3, Minus, Loader2, AlertTriangle,
  ChevronDown, ChevronUp
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
  const {
    questions: localQuestions,
    answers: localAnswers,
    testTitle, candidateName, rollNumber, examType, testId,
    attemptId, token, isLiveTest, resetExamState, markedForReview
  } = useExamStore();

  const [activeTab, setActiveTab] = useState("Physics");
  const [serverResult, setServerResult] = useState<AttemptResult | null>(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  const sections = ["Physics", "Chemistry", "Mathematics", "Biology"];

  useEffect(() => {
    if (!attemptId) return;
    const authToken = token || localStorage.getItem("auth_token") || localStorage.getItem("token") || "";
    if (!authToken) return;
    const fetchResult = async () => {
      setResultLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_URL || "https://api.vigyanprep.com";
        const res = await fetch(`${apiBase}/api/exam/lifecycle/result/${attemptId}`, {
          headers: { "Authorization": `Bearer ${authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.resultReleased) setServerResult(data as AttemptResult);
        }
      } catch (err) {
        console.warn("Could not fetch server result:", err);
      } finally {
        setResultLoading(false);
      }
    };
    fetchResult();
  }, [attemptId, token]);

  const localScoring = React.useMemo(() => {
    let correctCount = 0, incorrectCount = 0, unattemptedCount = 0, totalScore = 0;
    const sectionScores: Record<string, any> = {
      Physics: { correct: 0, incorrect: 0, unattempted: 0, score: 0 },
      Chemistry: { correct: 0, incorrect: 0, unattempted: 0, score: 0 },
      Mathematics: { correct: 0, incorrect: 0, unattempted: 0, score: 0 },
      Biology: { correct: 0, incorrect: 0, unattempted: 0, score: 0 },
    };
    localQuestions.forEach(q => {
      const studentAns = localAnswers[q.id];
      const sec = q.section && sections.includes(q.section) ? q.section : "Physics";
      if (!sectionScores[sec]) sectionScores[sec] = { correct: 0, incorrect: 0, unattempted: 0, score: 0 };
      const correctKey = q.correct_answer || q.correctAnswer;
      if (!studentAns) { unattemptedCount++; sectionScores[sec].unattempted++; }
      else if (correctKey && studentAns === correctKey) { correctCount++; totalScore += 4; sectionScores[sec].correct++; sectionScores[sec].score += 4; }
      else if (!correctKey) { sectionScores[sec].unattempted++; }
      else { incorrectCount++; totalScore -= 1; sectionScores[sec].incorrect++; sectionScores[sec].score -= 1; }
    });
    const accuracy = (correctCount + incorrectCount) > 0 ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) : 0;
    return { correctCount, incorrectCount, unattemptedCount, totalScore, sectionScores, accuracy };
  }, [localQuestions, localAnswers]);

  const hasServerResult = !!(serverResult && serverResult.resultReleased);
  const answeredCount = Object.keys(localAnswers).length;
  const totalMaxScore = localQuestions.length * 4;

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
            <h1 className="text-lg font-bold tracking-wide">OFFICIAL CANDIDATE RESPONSE SHEET</h1>
            <p className="text-xs text-amber-300 font-semibold">{testTitle || "IISER / NEST Examination"}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {!isLiveTest && (
              <button onClick={handleReattempt} className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition">
                <RotateCcw size={15} /> Re-Attempt Test
              </button>
            )}
            <button onClick={() => window.print()} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition">
              <Download size={15} /> Download Response Sheet
            </button>
            <a href="https://vigyanprep.com" className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 border border-white/20 transition">
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

        {/* SUMMARY CARDS */}
        <div className="no-print bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100"><p className="text-2xl font-black text-[#1b365d]">{localQuestions.length}</p><p className="text-xs text-gray-500 font-semibold mt-1">Total Questions</p></div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100"><p className="text-2xl font-black text-emerald-700">{answeredCount}</p><p className="text-xs text-gray-500 font-semibold mt-1">Answered</p></div>
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100"><p className="text-2xl font-black text-red-600">{localQuestions.length - answeredCount}</p><p className="text-xs text-gray-500 font-semibold mt-1">Unattempted</p></div>
            <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100"><p className="text-2xl font-black text-amber-700">{(markedForReview || []).length}</p><p className="text-xs text-gray-500 font-semibold mt-1">Marked for Review</p></div>
          </div>

          {isLiveTest && !hasServerResult && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-amber-800 text-sm">✅ Exam Submitted Successfully</p>
                <p className="text-xs text-amber-700 mt-1">Your responses have been recorded. Results including your <strong>All-India Rank, score, and correct answers</strong> will be declared by the administrator after the test window closes. You will be notified via email.</p>
              </div>
            </div>
          )}

          {!isLiveTest && localScoring.correctCount + localScoring.incorrectCount > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100"><p className="text-xl font-black text-green-700">{localScoring.correctCount}</p><p className="text-xs text-gray-500 font-semibold">Correct</p></div>
              <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100"><p className="text-xl font-black text-red-600">{localScoring.incorrectCount}</p><p className="text-xs text-gray-500 font-semibold">Incorrect</p></div>
              <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100"><p className="text-xl font-black text-gray-600">{localScoring.unattemptedCount}</p><p className="text-xs text-gray-500 font-semibold">Unattempted</p></div>
              <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100"><p className="text-xl font-black text-[#1b365d]">{localScoring.totalScore} / {totalMaxScore}</p><p className="text-xs text-gray-500 font-semibold">Your Score</p></div>
            </div>
          )}
        </div>

        {/* RESPONSE TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="no-print px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#1b365d] text-base">Your Response Sheet</h2>
            <p className="text-xs text-gray-500">Shows your selected answers only • Correct answers not shown here</p>
          </div>

          <div className="no-print flex overflow-x-auto border-b bg-gray-50">
            {sections.map(sec => {
              const secQs = localQuestions.filter(q => q.section === sec || (!sections.includes(q.section) && sec === "Physics"));
              const secAns = secQs.filter(q => localAnswers[q.id]).length;
              return (
                <button key={sec} onClick={() => setActiveTab(sec)} className={`px-5 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition ${activeTab === sec ? "border-[#1b365d] text-[#1b365d] bg-white" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  {sec} ({secAns}/{secQs.length})
                </button>
              );
            })}
          </div>

          <div className="no-print divide-y divide-gray-50">
            {localQuestions
              .filter(q => q.section === activeTab || (!sections.includes(q.section) && activeTab === "Physics"))
              .map((q, idx) => {
                const studentAns = localAnswers[q.id];
                const opts = q.options && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"];
                const optLabels = ["A", "B", "C", "D"];
                return (
                  <div key={q.id} className="p-5 hover:bg-gray-50 transition">
                    <div className="flex items-start gap-4">
                      <span className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 mt-0.5">{idx + 1}</span>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800 font-medium mb-3 leading-relaxed"><MathText text={(q as any).question_text || q.text || ""} /></div>
                        {(q.image_url || (q as any).imageUrl) && (
                          <div className="mb-3"><img src={formatImageUrl(q.image_url || (q as any).imageUrl || "")} alt="diagram" className="max-h-40 object-contain rounded border" /></div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {opts.map((opt, oi) => {
                            const label = optLabels[oi];
                            const isSelected = studentAns === label;
                            return (
                              <div key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${isSelected ? "border-[#1b365d] bg-blue-50 text-[#1b365d] font-bold" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isSelected ? "bg-[#1b365d] text-white" : "bg-gray-200 text-gray-600"}`}>{label}</span>
                                <MathText text={opt} />
                              </div>
                            );
                          })}
                        </div>
                        {!studentAns && <p className="mt-2 text-xs text-gray-400 italic flex items-center gap-1"><Minus size={12} /> Not attempted</p>}
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
                {localQuestions.map((q, idx) => {
                  const ans = localAnswers[q.id];
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
              <strong>Summary:</strong> Total: {localQuestions.length} | Answered: {Object.keys(localAnswers).length} | Not Attempted: {localQuestions.length - Object.keys(localAnswers).length}
            </div>
          </div>
        </div>

        {/* DARK RESULTS SECTION — not printable */}
        <div className="results-dark no-print">
          {resultLoading ? (
            <div className="bg-gray-900 rounded-2xl p-8 flex items-center justify-center gap-3 text-white">
              <Loader2 size={20} className="animate-spin" /><span className="text-sm font-semibold">Loading your results...</span>
            </div>
          ) : hasServerResult && serverResult ? (
            <div className="bg-gray-950 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-3 mb-1"><Trophy className="text-amber-400" size={24} /><h2 className="text-xl font-black text-white tracking-wide">OFFICIAL RESULTS & ANALYSIS</h2></div>
                <p className="text-xs text-gray-400">Results declared by administrator • {testTitle}</p>
              </div>

              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700"><p className="text-3xl font-black text-amber-400">{serverResult.totalScore ?? "—"}</p><p className="text-xs text-gray-400 mt-1 font-semibold">Total Score</p><p className="text-[10px] text-gray-600">out of {totalMaxScore}</p></div>
                <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700"><p className="text-3xl font-black text-emerald-400">{serverResult.rank ? `#${serverResult.rank}` : "—"}</p><p className="text-xs text-gray-400 mt-1 font-semibold">All-India Rank</p>{serverResult.percentile && <p className="text-[10px] text-gray-500">{serverResult.percentile.toFixed(1)}th percentile</p>}</div>
                <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700"><p className="text-3xl font-black text-green-400">{serverResult.questions.filter(q => q.status === "correct").length}</p><p className="text-xs text-gray-400 mt-1 font-semibold">Correct</p></div>
                <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700"><p className="text-3xl font-black text-red-400">{serverResult.questions.filter(q => q.status === "incorrect").length}</p><p className="text-xs text-gray-400 mt-1 font-semibold">Incorrect</p></div>
              </div>

              {serverResult.sectionScores && (
                <div className="px-6 pb-4">
                  <div className="flex items-center gap-2 mb-3"><BarChart3 className="text-blue-400" size={16} /><h3 className="text-sm font-bold text-white">Section-wise Analysis</h3></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {sections.map(sec => {
                      const s = serverResult.sectionScores![sec];
                      if (!s) return null;
                      const acc = (s.correct + s.incorrect) > 0 ? Math.round((s.correct / (s.correct + s.incorrect)) * 100) : 0;
                      return (
                        <div key={sec} className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                          <p className="text-xs font-bold text-white mb-2">{sec}</p>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between text-green-400"><span>✓ Correct</span><span className="font-bold">{s.correct}</span></div>
                            <div className="flex justify-between text-red-400"><span>✗ Wrong</span><span className="font-bold">{s.incorrect}</span></div>
                            <div className="flex justify-between text-gray-500"><span>— Skipped</span><span className="font-bold">{s.unattempted}</span></div>
                            <div className="flex justify-between text-amber-400 border-t border-gray-700 pt-1 mt-1"><span>Score</span><span className="font-bold">{s.score}</span></div>
                          </div>
                          <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width:`${acc}%`}} /></div>
                          <p className="text-[9px] text-gray-500 mt-1 text-right">{acc}% accuracy</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-800">
                <div className="flex border-b border-gray-800 overflow-x-auto bg-gray-900">
                  {sections.map(sec => {
                    const cnt = serverResult!.questions.filter(q => q.section === sec || (!sections.includes(q.section || "") && sec === "Physics")).length;
                    return (
                      <button key={sec} onClick={() => setActiveTab(sec)} className={`px-5 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition ${activeTab === sec ? "border-amber-400 text-amber-400 bg-gray-800" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
                        {sec} ({cnt})
                      </button>
                    );
                  })}
                </div>

                <div className="divide-y divide-gray-800">
                  {serverResult!.questions
                    .filter(q => q.section === activeTab || (!sections.includes(q.section || "") && activeTab === "Physics"))
                    .map((q, idx) => {
                      const opts = q.options && q.options.length >= 2 ? q.options : ["Option A","Option B","Option C","Option D"];
                      const optLabels = ["A","B","C","D"];
                      const isExpanded = expandedSolutions[q.id];
                      const statusBorder = q.status === "correct" ? "border-l-4 border-emerald-600" : q.status === "incorrect" ? "border-l-4 border-red-600" : "border-l-4 border-gray-700";
                      return (
                        <div key={q.id} className={`p-5 ${statusBorder} bg-gray-900 hover:bg-gray-800 transition`}>
                          <div className="flex items-start gap-3">
                            {q.status === "correct" ? <CheckCircle2 className="text-emerald-400 shrink-0" size={18} /> : q.status === "incorrect" ? <XCircle className="text-red-400 shrink-0" size={18} /> : <Minus className="text-gray-500 shrink-0" size={18} />}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400 font-bold">Q{idx + 1}</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${q.status === "correct" ? "bg-emerald-900 text-emerald-300" : q.status === "incorrect" ? "bg-red-900 text-red-300" : "bg-gray-800 text-gray-500"}`}>
                                  {q.status === "correct" ? `+${q.marksEarned ?? 4}` : q.status === "incorrect" ? `${q.marksEarned ?? -1}` : "0"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-200 mb-3 leading-relaxed"><MathText text={(q as any).question_text || q.text || ""} /></div>
                              {q.image_url && <img src={formatImageUrl(q.image_url)} alt="diagram" className="max-h-40 object-contain rounded border border-gray-700 mb-3" />}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                {opts.map((opt, oi) => {
                                  const label = optLabels[oi];
                                  const isStudentChoice = q.studentAnswer === label;
                                  const isCorrect = (q.correct_answer || q.correctAnswer) === label;
                                  let cls = "border-gray-700 bg-gray-800 text-gray-400";
                                  if (isCorrect) cls = "border-emerald-500 bg-emerald-950 text-emerald-300 font-bold";
                                  if (isStudentChoice && !isCorrect) cls = "border-red-500 bg-red-950 text-red-300 font-bold";
                                  if (isStudentChoice && isCorrect) cls = "border-emerald-500 bg-emerald-900 text-emerald-200 font-black";
                                  return (
                                    <div key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${cls}`}>
                                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-gray-700">{label}</span>
                                      <MathText text={opt} />
                                      {isCorrect && <CheckCircle2 size={12} className="ml-auto text-emerald-400 shrink-0" />}
                                      {isStudentChoice && !isCorrect && <XCircle size={12} className="ml-auto text-red-400 shrink-0" />}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                {q.studentAnswer ? <span className="text-gray-400">Your answer: <strong className={q.status === "correct" ? "text-emerald-400" : "text-red-400"}>{q.studentAnswer}</strong></span> : <span className="text-gray-600 italic">Not attempted</span>}
                                {(q.correct_answer || q.correctAnswer) && <span className="text-gray-400">Correct: <strong className="text-emerald-400">{q.correct_answer || q.correctAnswer}</strong></span>}
                                {q.solution_explanation && (
                                  <button onClick={() => toggleSolution(q.id)} className="ml-auto flex items-center gap-1 text-blue-400 hover:text-blue-300 transition font-semibold">
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Solution
                                  </button>
                                )}
                              </div>
                              {isExpanded && q.solution_explanation && (
                                <div className="mt-3 p-3 bg-blue-950 border border-blue-800 rounded-lg text-xs text-blue-200 leading-relaxed"><MathText text={q.solution_explanation} /></div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : isLiveTest ? (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-900/30 rounded-full flex items-center justify-center mx-auto"><Clock className="text-amber-400" size={32} /></div>
              <h3 className="text-xl font-bold text-white">Results Pending</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">Your exam has been submitted successfully. The administrator will declare results including your <strong className="text-white">All-India Rank, score, and answer key</strong> after the test window closes.</p>
              <p className="text-xs text-gray-600">You will be notified via email when results are declared.</p>
              <a href="https://vigyanprep.com" className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition">Go to Dashboard</a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
