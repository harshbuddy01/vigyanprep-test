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
    <div className="grid grid-cols-5 gap-1.5">
      {questions.map((q, idx) => {
        const isAnswered = answers[q.id] !== undefined;
        const isMarked = markedForReview.includes(q.id);
        const isCurrent = q.id === currentId;

        let bg = '#2a2a2a';
        let color = '#888';
        if (isAnswered && isMarked) { bg = '#d97706'; color = '#fff'; }
        else if (isMarked) { bg = '#f97316'; color = '#fff'; }
        else if (isAnswered) { bg = '#22c55e'; color = '#fff'; }

        return (
          <button
            key={q.id}
            onClick={() => handleClick(q, idx)}
            title={`Question ${idx + 1}`}
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: bg,
              color: color,
              border: isCurrent ? '2px solid #d4a520' : '1px solid #333',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
};
