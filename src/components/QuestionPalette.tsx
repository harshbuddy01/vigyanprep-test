import React from 'react';
import { useExamStore } from '../stores/examStore';
import type { Question } from '../stores/examStore';

interface Props {
  questions?: Question[];
  answers?: Record<string, any>;
  markedForReview?: string[];
  currentId?: string;
  onSelect?: (q: Question) => void;
}

export const QuestionPalette: React.FC<Props> = (props) => {
  const store = useExamStore();

  const questions = props.questions ?? store.questions;
  const answers = props.answers ?? store.answers;
  const markedForReview = props.markedForReview ?? store.markedForReview;
  const currentId = props.currentId ?? store.questions[store.currentQuestionIndex]?.id;

  const handleClick = (q: Question, idx: number) => {
    if (props.onSelect) {
      props.onSelect(q);
    } else {
      store.goToQuestion(idx);
    }
  };

  return (
    <div className="grid grid-cols-5 gap-2 p-1">
      {questions.map((q, idx) => {
        const isAnswered = answers[q.id] !== undefined;
        const isMarked = markedForReview.includes(q.id);
        const isCurrent = q.id === currentId;

        // Official NTA CBT Question Status Colors
        let bg = '#e9ecef'; // Not Visited (Light Grey)
        let color = '#495057';
        let shapeClass = 'rounded';

        if (isAnswered && isMarked) {
          bg = '#6f42c1'; color = '#fff'; shapeClass = 'rounded-full border-2 border-emerald-400';
        } else if (isMarked) {
          bg = '#6f42c1'; color = '#fff'; shapeClass = 'rounded-full'; // Purple Circle
        } else if (isAnswered) {
          bg = '#28a745'; color = '#fff'; shapeClass = 'rounded-tl-lg rounded-br-lg'; // NTA Polygon Green
        } else {
          bg = '#dc3545'; color = '#fff'; shapeClass = 'rounded-tr-lg rounded-bl-lg'; // NTA Polygon Red (Not Answered)
        }

        return (
          <button
            key={q.id}
            onClick={() => handleClick(q, idx)}
            title={`Question ${idx + 1}`}
            className={`w-9 h-9 flex items-center justify-center text-xs font-bold transition-all shadow-sm ${shapeClass}`}
            style={{
              background: bg,
              color: color,
              border: isCurrent ? '2.5px solid #007bff' : '1px solid rgba(0,0,0,0.1)',
              boxShadow: isCurrent ? '0 0 8px rgba(0,123,255,0.4)' : 'none'
            }}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
};
