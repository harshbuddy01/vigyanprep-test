import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamStore } from '../stores/examStore';
import { MathText } from '../components/MathText';
import { CheckCircle2, XCircle, Download, Home, BookOpen, RotateCcw } from 'lucide-react';

function formatImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return trimmed;
}

export const ResponseSheet: React.FC = () => {
  const navigate = useNavigate();
  const { questions, answers, testTitle, candidateName, rollNumber, examType, testId, resetExamState } = useExamStore();
  const [activeTab, setActiveTab] = useState('Physics');

  // Calculate Scores & Breakdown
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let totalScore = 0;

  const sections = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
  const sectionScores: Record<string, { correct: number; incorrect: number; unattempted: number; score: number }> = {
    Physics: { correct: 0, incorrect: 0, unattempted: 0, score: 0 },
    Chemistry: { correct: 0, incorrect: 0, unattempted: 0, score: 0 },
    Mathematics: { correct: 0, incorrect: 0, unattempted: 0, score: 0 },
    Biology: { correct: 0, incorrect: 0, unattempted: 0, score: 0 },
  };

  questions.forEach(q => {
    const studentAns = answers[q.id];
    const sec = q.section && sections.includes(q.section) ? q.section : 'Physics';
    if (!sectionScores[sec]) sectionScores[sec] = { correct: 0, incorrect: 0, unattempted: 0, score: 0 };

    const correctKey = q.correct_answer || q.correctAnswer;

    if (!studentAns) {
      unattemptedCount++;
      sectionScores[sec].unattempted++;
    } else if (studentAns === correctKey) {
      correctCount++;
      totalScore += 4;
      sectionScores[sec].correct++;
      sectionScores[sec].score += 4;
    } else {
      incorrectCount++;
      totalScore -= 1;
      sectionScores[sec].incorrect++;
      sectionScores[sec].score -= 1;
    }
  });

  const totalMaxScore = questions.length * 4;
  const accuracy = (correctCount + incorrectCount) > 0
    ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
    : 0;

  const filteredQuestions = questions.filter(q => q.section === activeTab || (!sections.includes(q.section) && activeTab === 'Physics'));

  const handleReattempt = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetTestId = urlParams.get('testId') || testId;
    if (targetTestId) {
      resetExamState(targetTestId);
      navigate(`/exam?testId=${targetTestId}`);
    } else {
      navigate('/pyq');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-gray-800 font-sans pb-16">
      {/* Print CSS Rules */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body, page, div { background: white !important; color: black !important; }
          .print-card { break-inside: avoid !important; page-break-inside: avoid !important; border: 1px solid #ccc !important; margin-bottom: 16px !important; padding: 12px !important; }
          @page { size: A4 portrait; margin: 12mm; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>

      {/* Screen Header */}
      <header className="no-print bg-[#1b365d] text-white py-4 px-6 shadow-md border-b-4 border-amber-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-wide">OFFICIAL CANDIDATE RESPONSE SHEET & MARKSHEET</h1>
            <p className="text-xs text-amber-300 font-semibold">{testTitle || 'IISER / NEST Examination'}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleReattempt}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition"
            >
              <RotateCcw size={15} /> 🔄 Re-Attempt Test (Fresh Session)
            </button>
            <a
              href="https://vigyanprep.com"
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 border border-white/20 transition"
            >
              <Home size={15} /> Home
            </a>
            <a
              href="https://vigyanprep.com/pyq/iiser"
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition shadow"
            >
              <BookOpen size={15} /> PYQ Section
            </a>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#28a745] hover:bg-[#218838] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition"
            >
              <Download size={15} /> Print / Save Full PDF (All Sections)
            </button>
          </div>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="no-print max-w-7xl mx-auto p-6 space-y-6">
        {/* Candidate & Total Score Summary Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2 border-r border-gray-100 pr-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1b365d]">Candidate Profile</span>
            <h2 className="text-xl font-extrabold text-gray-900">{candidateName || 'Student Name'}</h2>
            <p className="text-xs text-gray-500">Roll No: <strong>{rollNumber || 'VP-2026-STUDENT'}</strong></p>
            <p className="text-xs text-gray-500">Exam Category: <strong>{examType || 'IAT'}</strong></p>
          </div>

          <div className="space-y-1 text-center border-r border-gray-100 pr-4 flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Marks Secured</span>
            <div className="text-4xl font-extrabold text-[#1b365d]">
              {totalScore} <span className="text-base text-gray-400 font-normal">/ {totalMaxScore}</span>
            </div>
            <p className="text-xs font-semibold text-emerald-600">Accuracy: {accuracy}%</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center border-r border-gray-100 pr-4 items-center">
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="block text-xl font-bold text-emerald-700">{correctCount}</span>
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Correct</span>
            </div>
            <div className="p-2 bg-red-50 rounded-lg border border-red-200">
              <span className="block text-xl font-bold text-red-700">{incorrectCount}</span>
              <span className="text-[10px] font-bold text-red-800 uppercase">Wrong</span>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg border border-gray-300">
              <span className="block text-xl font-bold text-gray-700">{unattemptedCount}</span>
              <span className="text-[10px] font-bold text-gray-700 uppercase">Left</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Sectional Scores</span>
            {sections.map(sec => (
              <div key={sec} className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded border border-gray-200">
                <span className="text-gray-600 font-medium">{sec}:</span>
                <strong className="text-[#1b365d]">{sectionScores[sec]?.score || 0} Marks</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Filter Tabs for On-Screen Interactive Review */}
        <div className="flex gap-2 border-b border-gray-300 pb-2">
          {sections.map(sec => {
            const count = questions.filter(q => q.section === sec || (!sections.includes(q.section) && sec === 'Physics')).length;
            const isActive = activeTab === sec;
            return (
              <button
                key={sec}
                onClick={() => setActiveTab(sec)}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1b365d] text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {sec} ({count})
              </button>
            );
          })}
        </div>

        {/* Question Cards (Screen View) */}
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const studentAns = answers[q.id];
            const correctKey = q.correct_answer || q.correctAnswer;
            const isCorrect = studentAns === correctKey;
            const isUnattempted = !studentAns;

            return (
              <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-xs font-bold text-[#1b365d] uppercase tracking-wider">
                    Question No. {q.question_number || idx + 1} ({q.section || activeTab})
                  </span>

                  {isUnattempted ? (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 font-bold text-xs rounded-full border border-gray-300">
                      Unattempted (0 Marks)
                    </span>
                  ) : isCorrect ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Correct (+4 Marks)
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 font-bold text-xs rounded-full border border-red-300 flex items-center gap-1">
                      <XCircle size={14} /> Incorrect (-1 Mark)
                    </span>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm leading-relaxed text-gray-900 space-y-3">
                  <div className="font-medium text-base">
                    <MathText text={(q as any).question_text || q.text} />
                  </div>

                  {(q.image_url || (q as any).imageUrl) && (
                    <div className="p-3 bg-white border border-gray-300 rounded-lg text-center">
                      <img
                        src={formatImageUrl(q.image_url || (q as any).imageUrl || '')}
                        alt="Question Diagram"
                        className="max-h-80 mx-auto object-contain rounded"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {((q.options && q.options.length === 4) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, optIdx) => {
                    const optKey = ['A', 'B', 'C', 'D'][optIdx];
                    const isChosen = studentAns === optKey;
                    const isKey = correctKey === optKey;

                    let bgClass = 'bg-white border-gray-200 text-gray-800';
                    let keyBadge = null;

                    if (isKey) {
                      bgClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold';
                      keyBadge = <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded ml-auto">Official Key</span>;
                    } else if (isChosen && !isCorrect) {
                      bgClass = 'bg-red-50 border-red-400 text-red-950';
                      keyBadge = <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded ml-auto">Your Answer (Wrong)</span>;
                    }

                    return (
                      <div
                        key={optKey}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs transition ${bgClass}`}
                      >
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isKey ? 'bg-emerald-600 text-white' : isChosen ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}>
                          {optKey}
                        </span>
                        <div className="flex-1 text-xs">
                          <MathText text={opt} />
                        </div>
                        {keyBadge}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ================= PRINT-ONLY VIEW (INCLUDES ALL SECTIONS FOR FULL PDF PRINTING) ================= */}
      <div className="print-only p-6 space-y-6">
        <div className="border-b-2 border-black pb-4 text-center">
          <h1 className="text-xl font-bold uppercase tracking-wider text-black">VIGYANPREP OFFICIAL MARKSHEET & RESPONSE SHEET</h1>
          <p className="text-sm font-bold text-black">{testTitle || 'IISER IAT / NEST Examination'}</p>
          <div className="mt-3 flex justify-between text-xs font-semibold border-t pt-2">
            <span>Candidate: <strong>{candidateName || 'Student Name'}</strong> ({rollNumber || 'VP-2026'})</span>
            <span>Marks: <strong>{totalScore} / {totalMaxScore}</strong> (Accuracy: {accuracy}%)</span>
          </div>
        </div>

        {/* Loop through ALL sections (Physics, Chemistry, Mathematics, Biology) for Print */}
        {sections.map(sec => {
          const secQuestions = questions.filter(q => q.section === sec || (!sections.includes(q.section) && sec === 'Physics'));
          if (secQuestions.length === 0) return null;

          return (
            <div key={sec} className="space-y-4">
              <h2 className="text-base font-bold uppercase border-b-2 border-black pt-4 pb-1 text-black">
                SECTION: {sec} ({secQuestions.length} Questions — Score: {sectionScores[sec]?.score || 0} Marks)
              </h2>

              {secQuestions.map((q, idx) => {
                const studentAns = answers[q.id];
                const correctKey = q.correct_answer || q.correctAnswer;
                const isCorrect = studentAns === correctKey;
                const isUnattempted = !studentAns;

                return (
                  <div key={q.id} className="print-card space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold border-b pb-1">
                      <span>Q{q.question_number || idx + 1} ({sec})</span>
                      <span>
                        {isUnattempted ? '[ Unattempted (0) ]' : isCorrect ? '[ ✓ Correct (+4) ]' : '[ ✗ Incorrect (-1) ]'}
                      </span>
                    </div>

                    <div className="text-xs">
                      <MathText text={(q as any).question_text || q.text} />
                    </div>

                    {(q.image_url || (q as any).imageUrl) && (
                      <div className="my-2 text-center">
                        <img
                          src={formatImageUrl(q.image_url || (q as any).imageUrl || '')}
                          alt="Diagram"
                          className="max-h-48 mx-auto object-contain"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      {((q.options && q.options.length === 4) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, optIdx) => {
                        const optKey = ['A', 'B', 'C', 'D'][optIdx];
                        const isChosen = studentAns === optKey;
                        const isKey = correctKey === optKey;

                        let styleClass = 'border-gray-300';
                        let label = '';
                        if (isKey) {
                          styleClass = 'border-green-600 font-bold bg-green-50';
                          label = ' [OFFICIAL KEY]';
                        } else if (isChosen && !isCorrect) {
                          styleClass = 'border-red-600 font-bold bg-red-50';
                          label = ' [YOUR ANSWER - WRONG]';
                        }

                        return (
                          <div key={optKey} className={`p-1.5 border rounded ${styleClass}`}>
                            <strong>({optKey})</strong> <MathText text={opt} /> <em>{label}</em>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
