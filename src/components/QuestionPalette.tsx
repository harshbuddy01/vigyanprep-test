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

  // Filter questions strictly for active section if specified, sorted MCQs first then Numericals
  const filteredQuestions = (activeSection
    ? allQuestions.filter(q => q.section === activeSection || (!sections.includes(q.section) && activeSection === 'Physics'))
    : allQuestions).slice().sort((a, b) => {
      const aIsNum = a.type === 'Numerical';
      const bIsNum = b.type === 'Numerical';
      if (aIsNum !== bIsNum) return aIsNum ? 1 : -1;
      return (a.question_number || 0) - (b.question_number || 0);
    });

  const sectionAMcqs = filteredQuestions.filter(q => q.type !== 'Numerical');
  const sectionBNumericals = filteredQuestions.filter(q => q.type === 'Numerical');
  const hasSections = sectionBNumericals.length > 0;

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

  const visitedQuestions = store.visitedQuestions || [];

  const renderButton = (q: Question, fallbackNum: number) => {
    const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
    const isMarked = markedForReview.includes(q.id);
    const isCurrent = q.id === currentId;
    const isVisited = visitedQuestions.includes(q.id);
    const displayNum = q.question_number || fallbackNum;

    // Official NTA CBT 5-Color Question Status
    let bg = '#e9ecef'; // 1. Not Visited (Light Grey)
    let color = '#495057';
    let shapeClass = 'rounded-lg';

    if (isAnswered && isMarked) {
      bg = '#6f42c1'; color = '#fff'; shapeClass = 'rounded-full border-2 border-emerald-400'; // 5. Answered + Marked
    } else if (isMarked) {
      bg = '#6f42c1'; color = '#fff'; shapeClass = 'rounded-full'; // 4. Marked for Review (Purple)
    } else if (isAnswered) {
      bg = '#28a745'; color = '#fff'; shapeClass = 'rounded-tl-xl rounded-br-xl'; // 3. Answered (Green)
    } else if (isVisited) {
      bg = '#dc3545'; color = '#fff'; shapeClass = 'rounded-tr-xl rounded-bl-xl'; // 2. Not Answered but Visited (Red)
    }

    return (
      <button
        key={q.id}
        onClick={() => handleClick(q)}
        title={`Question ${displayNum} (${q.type === 'Numerical' ? 'Section B Numerical' : 'Section A MCQ'})`}
        className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-xs sm:text-sm font-extrabold transition-all active:scale-95 cursor-pointer shadow-sm ${shapeClass}`}
        style={{
          background: bg,
          color: color,
          border: isCurrent ? '2.5px solid #007bff' : '1px solid rgba(0,0,0,0.12)',
          boxShadow: isCurrent ? '0 0 10px rgba(0,123,255,0.6)' : 'none'
        }}
      >
        {displayNum}
      </button>
    );
  };

  if (hasSections) {
    return (
      <div className="space-y-4 p-1">
        {/* Section A: Multiple Choice Questions */}
        {sectionAMcqs.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1.5 py-1 border-b border-gray-200">
              <span className="text-[11px] font-black uppercase text-[#1b365d] tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-[#1b365d] text-white flex items-center justify-center text-[9px] font-bold">A</span>
                Section A: MCQs (Q1–Q{sectionAMcqs.length})
              </span>
              <span className="text-[10px] text-gray-500 font-bold">+4 / -1</span>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {sectionAMcqs.map((q, idx) => renderButton(q, idx + 1))}
            </div>
          </div>
        )}

        {/* Section B: Numerical Value Questions */}
        {sectionBNumericals.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between px-1.5 py-1 border-b border-purple-200 bg-purple-50/60 rounded-t-lg">
              <span className="text-[11px] font-black uppercase text-purple-900 tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-purple-700 text-white flex items-center justify-center text-[9px] font-bold">B</span>
                Section B: Numerical (Q21–Q{20 + sectionBNumericals.length})
              </span>
              <span className="text-[10px] text-emerald-700 font-bold font-mono">+4 / 0</span>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {sectionBNumericals.map((q, idx) => renderButton(q, 21 + idx))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 p-1">
      {filteredQuestions.map((q, idx) => renderButton(q, idx + 1))}
    </div>
  );
};
