import React from 'react';
import { useExamStore } from '../stores/examStore';

export const Results: React.FC = () => {
  const { questions, answers, timeRemaining } = useExamStore();

  const totalQuestions = questions.length;
  const attempted = Object.keys(answers).length;
  
  // Very rough mock scoring
  let correct = 0;
  let score = 0;
  
  questions.forEach(q => {
    const ans = answers[q.id];
    if (ans === undefined) return;
    
    // Just random mock logic for demo
    if (q.type === 'MCQ' || q.type === 'Numerical') {
      correct++;
      score += 4;
    } else if (q.type === 'MSQ') {
      correct++;
      score += 4;
    }
  });

  const percentage = totalQuestions > 0 ? (score / (totalQuestions * 4)) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-neutral-200 flex flex-col items-center py-12 px-4">
      <div className="max-w-2xl w-full bg-neutral-900 rounded-2xl border border-neutral-800 p-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Exam Completed</h1>
        <p className="text-neutral-400 mb-8">Your responses have been recorded successfully.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
            <div className="text-3xl font-bold text-amber-400">{score}</div>
            <div className="text-sm text-neutral-400">Total Score</div>
          </div>
          <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
            <div className="text-3xl font-bold text-blue-400">{percentage.toFixed(1)}%</div>
            <div className="text-sm text-neutral-400">Percentage</div>
          </div>
          <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
            <div className="text-3xl font-bold text-white">{attempted} / {totalQuestions}</div>
            <div className="text-sm text-neutral-400">Attempted</div>
          </div>
          <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
            <div className="text-3xl font-bold text-white">{3600 - timeRemaining}s</div>
            <div className="text-sm text-neutral-400">Time Taken</div>
          </div>
        </div>

        <a 
          href="https://auth.vigyanprep.com" 
          className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};
