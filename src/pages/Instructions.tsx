import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, ShieldAlert, Award, FileText } from 'lucide-react';
import { useExamStore } from '../stores/examStore';
import { getTestMeta } from '../lib/api';

export const Instructions: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId');
  const code = searchParams.get('code');
  const { setTestMeta, testTitle, examType, candidateName, rollNumber, setQuestions } = useExamStore();

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeta = async () => {
      if (testId && code) {
        try {
          const exchangeRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com'}/api/exam-access/exchange`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          const exchangeData = await exchangeRes.json();
          if (!exchangeRes.ok) throw new Error(exchangeData.message || 'Failed to exchange exam access code');
          const examToken = exchangeData.examToken;

          const meta = await getTestMeta(testId, examToken);

          setTestMeta({
            testTitle: meta.title || 'Official Entrance Examination',
            examType: meta.examType || 'IAT',
            testId,
            candidateName: exchangeData.student.name,
            rollNumber: exchangeData.student.rollNumber,
            token: examToken
          });

          if (meta.questions && Array.isArray(meta.questions)) {
            setQuestions(meta.questions);
          }
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Unable to load test instructions');
        }
      }
      setLoading(false);
    };
    fetchMeta();
  }, [testId, code, setTestMeta, setQuestions]);

  const handleStartExam = () => {
    // Attempt fullscreen mode for proctored security
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    navigate('/exam' + window.location.search);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wider text-neutral-400">Loading Official Exam Instructions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 flex flex-col items-center py-10 px-4">
      <div className="max-w-4xl w-full bg-[#111] rounded-2xl border border-neutral-800 p-8 space-y-8 shadow-2xl">

        {/* Candidate Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-neutral-900/80 rounded-xl border border-amber-500/20 gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Official Exam Center</span>
            <h1 className="text-2xl font-extrabold text-white mt-1">{testTitle || 'IISER / NEST Entrance Examination'}</h1>
            <p className="text-xs text-neutral-400 mt-1">Category: {examType || 'IAT'} • Duration: 180 Minutes • Total Questions: 60</p>
          </div>
          <div className="text-left md:text-right bg-neutral-950 px-4 py-3 rounded-lg border border-white/5 shrink-0">
            <p className="text-xs text-neutral-400">Candidate Name: <strong className="text-white ml-1">{candidateName || 'Student'}</strong></p>
            <p className="text-xs text-neutral-400">Roll Number: <strong className="text-amber-400 ml-1">{rollNumber || 'VP-2024'}</strong></p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Section 1: General Timing & Instructions */}
        <div className="space-y-6 text-sm text-neutral-300">
          <section className="bg-neutral-900/50 p-6 rounded-xl border border-white/5 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="text-amber-400" size={20} /> 1. General Exam Guidelines
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-neutral-300">
              <li>The clock will be set at the server. The countdown timer at the top right of the screen will display the remaining time available for you to complete the examination.</li>
              <li>When the timer reaches zero, the examination will end by default. You are not required to end or submit your examination.</li>
              <li>The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</li>
            </ul>

            {/* Question Status Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 p-2 bg-neutral-950 rounded border border-white/5">
                <span className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-xs font-bold text-neutral-400">1</span>
                <span className="text-xs text-neutral-400">Not Visited</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-neutral-950 rounded border border-white/5">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                <span className="text-xs text-neutral-400">Not Answered</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-neutral-950 rounded border border-white/5">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold">3</span>
                <span className="text-xs text-neutral-400">Answered</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-neutral-950 rounded border border-white/5">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                <span className="text-xs text-neutral-400">Marked for Review</span>
              </div>
            </div>
          </section>

          {/* Section 2: Marking Scheme */}
          <section className="bg-neutral-900/50 p-6 rounded-xl border border-white/5 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="text-emerald-400" size={20} /> 2. Marking Scheme
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-neutral-300">
              <li><strong>Correct Answer:</strong> +4 Marks will be awarded for each correct option selected.</li>
              <li><strong>Incorrect Answer:</strong> -1 Mark will be deducted for each incorrect attempt in MCQ section.</li>
              <li><strong>Unanswered:</strong> 0 Marks will be awarded for questions left unattempted.</li>
            </ul>
          </section>

          {/* Section 3: Anti-Cheating & Security Proctoring */}
          <section className="bg-red-500/10 p-6 rounded-xl border border-red-500/20 space-y-3">
            <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
              <ShieldAlert className="text-red-400" size={20} /> 3. Anti-Cheating & Security Rules
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-neutral-300">
              <li><strong>Fullscreen Requirement:</strong> The exam must be taken in Fullscreen Mode. Exiting fullscreen is monitored.</li>
              <li><strong>Tab Switching Penalty:</strong> Switching browser tabs or windows triggers an automatic security violation warning. 3 tab switch violations will automatically submit your exam.</li>
              <li><strong>Copy / Paste Blocking:</strong> Copying question text, right-clicking, or opening developer console tools is strictly prohibited and logged.</li>
            </ul>
          </section>
        </div>

        {/* Declaration & Start Button */}
        <div className="pt-6 border-t border-neutral-800 space-y-6">
          <label className="flex items-start gap-3 cursor-pointer p-4 bg-neutral-900 rounded-xl border border-white/5 hover:border-amber-400/40 transition">
            <input
              type="checkbox"
              className="w-5 h-5 accent-amber-400 rounded mt-0.5"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="text-xs text-neutral-300 leading-relaxed">
              I have read and understood all the instructions. I declare that I am not in possession of any prohibited material and agree to follow all proctoring guidelines. I am ready to begin the examination.
            </span>
          </label>

          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Official Computer Based Test (CBT) Portal</span>
            <button
              onClick={handleStartExam}
              disabled={!agreed}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold rounded-xl transition-all shadow-lg text-sm flex items-center gap-2"
            >
              <FileText size={18} /> Start Exam Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
