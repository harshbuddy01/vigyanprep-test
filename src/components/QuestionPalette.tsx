import React from 'react';
import { useExamStore } from '../stores/examStore';
import type { Question } from '../stores/examStore';

interface Props {
  questions?: Question[];
  answers?: Record<string, any>;
  markedForReview?: string[];
  currentId?: string;
  activeSection?: string;
  onSelect?: (q: Question) => void;
}

export const QuestionPalette: React.FC<Props> = (props) => {
  const store = useExamStore();

  const allQuestions = props.questions ?? store.questions;
  const answers = props.answers ?? store.answers;
  const markedForReview = props.markedForReview ?? store.markedForReview;
  const currentId = props.currentId ?? store.questions[store.currentQuestionIndex]?.id;
  const activeSection = props.activeSection;

  const sections = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];

  // Filter questions strictly for active section if specified
  const filteredQuestions = activeSection
    ? allQuestions.filter(q => q.section === activeSection || (!sections.includes(q.section) && activeSection === 'Physics'))
    : allQuestions;

  const handleClick = (q: Question) => {
    if (props.onSelect) {
      props.onSelect(q);
    } else {
      const globalIndex = allQuestions.findIndex(item => item.id === q.id);
      if (globalIndex !== -1) {
        store.goToQuestion(globalIndex);
      }
    }
  };

  return (
    <div className="grid grid-cols-5 gap-2 p-1">
      {filteredQuestions.map((q, idx) => {
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
          bg = '#dc3545'; color = '#fff'; shapeClass = 'rounded-tr-lg rounded-bl-lg'; // NTA Polygon Red
        }

        return (
          <button
            key={q.id}
            onClick={() => handleClick(q)}
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
