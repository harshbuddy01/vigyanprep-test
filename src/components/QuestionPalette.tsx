import React from 'react';
import { useExamStore } from '../stores/examStore';
import clsx from 'clsx';

export const QuestionPalette: React.FC = () => {
  const { questions, currentQuestionIndex, answers, markedForReview, goToQuestion } = useExamStore();

  return (
    <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col gap-4 h-full">
      <h3 className="font-bold text-white text-lg">Question Palette</h3>
      
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 overflow-y-auto">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id] !== undefined;
          const isMarked = markedForReview.includes(q.id);
          const isCurrent = currentQuestionIndex === idx;

          return (
            <button
              key={q.id}
              onClick={() => goToQuestion(idx)}
              className={clsx(
                "w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors border",
                isCurrent ? "border-white ring-2 ring-white/20" : "border-transparent",
                isAnswered && isMarked ? "bg-amber-500 text-white" : // Answered & Marked
                isMarked ? "bg-orange-500 text-white" : // Marked
                isAnswered ? "bg-green-500 text-white" : // Answered
                "bg-neutral-800 text-neutral-400 hover:bg-neutral-700" // Unanswered
              )}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-2 text-sm text-neutral-400">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded" /> Answered</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded" /> Marked for Review</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-500 rounded" /> Answered & Marked</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-neutral-800 rounded" /> Unanswered</div>
      </div>
    </div>
  );
};
