import React, { useState } from 'react';
import { useExamStore } from '../stores/examStore';
import { MathText } from '../components/MathText';
import { CheckCircle2, XCircle, Download, Home, BookOpen } from 'lucide-react';

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
  const { questions, answers, testTitle, candidateName, rollNumber, examType } = useExamStore();
  const [activeTab, setActiveTab] = useState('Physics');

  // Calculate Scores & Breakdown
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let totalScore = 0;

  const sectionScores: Record<string, { correct: number; incorrect: number; score: number }> = {
    Physics: { correct: 0, incorrect: 0, score: 0 },
    Chemistry: { correct: 0, incorrect: 0, score: 0 },
    Mathematics: { correct: 0, incorrect: 0, score: 0 },
    Biology: { correct: 0, incorrect: 0, score: 0 },
  };

  questions.forEach(q => {
    const studentAns = answers[q.id];
    const sec = q.section || 'Physics';
    if (!sectionScores[sec]) sectionScores[sec] = { correct: 0, incorrect: 0, score: 0 };

    const correctKey = q.correct_answer || q.correctAnswer;

    if (!studentAns) {
      unattemptedCount++;
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

  const sections = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
  const filteredQuestions = questions.filter(q => q.section === activeTab || (!sections.includes(q.section) && activeTab === 'Physics'));

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-gray-800 font-sans pb-16">

      {/* Header */}
      <header className="bg-[#1b365d] text-white py-4 px-6 shadow-md border-b-4 border-amber-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-wide">OFFICIAL CANDIDATE RESPONSE SHEET & MARKSHEET</h1>
              <p className="text-xs text-amber-300 font-semibold">{testTitle || 'IISER / NEST Examination 2024'}</p>
            </div>
          </div>

          {/* Navigation & Print Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="https://vigyanprep.com"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg flex items-center gap-2 border border-white/20 transition"
            >
              <Home size={15} /> Home Page
            </a>
            <a
              href="https://vigyanprep.com/pyq/iiser"
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-2 transition shadow"
            >
              <BookOpen size={15} /> Back to PYQ Section
            </a>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#28a745] hover:bg-[#218838] text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow transition"
            >
              <Download size={15} /> Print / Save PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Candidate & Total Score Summary Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Column 1: Candidate Meta */}
          <div className="space-y-2 border-r border-gray-100 pr-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1b365d]">Candidate Profile</span>
            <h2 className="text-xl font-extrabold text-gray-900">{candidateName || 'Student Name'}</h2>
            <p className="text-xs text-gray-500">Roll No: <strong>{rollNumber || 'VP-2024-890'}</strong></p>
            <p className="text-xs text-gray-500">Exam Category: <strong>{examType || 'IAT'}</strong></p>
          </div>

          {/* Column 2: Total Score */}
          <div className="space-y-1 text-center border-r border-gray-100 pr-4 flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Marks Secured</span>
            <div className="text-4xl font-extrabold text-[#1b365d]">
              {totalScore} <span className="text-base text-gray-400 font-normal">/ {totalMaxScore}</span>
            </div>
            <p className="text-xs font-semibold text-emerald-600">Accuracy: {accuracy}%</p>
          </div>

          {/* Column 3: Attempt Breakdown */}
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

          {/* Column 4: Sectional Score Chips */}
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

        {/* Subject Filter Tabs */}
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

        {/* Detailed Question-by-Question Response Sheet */}
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const studentAns = answers[q.id];
            const correctKey = q.correct_answer || q.correctAnswer;
            const isCorrect = studentAns === correctKey;
            const isUnattempted = !studentAns;

            return (
              <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#1b365d] uppercase tracking-wider">
                      Question No. {q.question_number || idx + 1} ({q.section})
                    </span>
                  </div>

                  {/* Result Status Badge */}
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

                {/* Question Text with KaTeX Rendering */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm leading-relaxed text-gray-900 space-y-3">
                  <div className="font-medium text-base">
                    <MathText text={(q as any).question_text || q.text} />
                  </div>

                  {/* Question Diagram Image */}
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

                {/* Options List with Selection Highlights and KaTeX Rendering */}
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
                        <span className="font-medium">
                          <MathText text={opt} />
                        </span>
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
    </div>
  );
};
