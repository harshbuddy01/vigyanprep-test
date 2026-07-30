import React from 'react';
import { useExamStore } from '../stores/examStore';
import type { Question } from '../stores/examStore';

export const QuestionPanel: React.FC = () => {
  const { questions, currentQuestionIndex, answers, setAnswer } = useExamStore();
  const question = questions[currentQuestionIndex];

  if (!question) return <div className="text-white p-8 text-center">Loading question...</div>;

  const currentAnswer = answers[question.id];

  const handleOptionChange = (option: string) => {
    if (question.type === 'MCQ') {
      setAnswer(question.id, option);
    } else if (question.type === 'MSQ') {
      const prev = Array.isArray(currentAnswer) ? currentAnswer : [];
      if (prev.includes(option)) {
        setAnswer(question.id, prev.filter(o => o !== option));
      } else {
        setAnswer(question.id, [...prev, option]);
      }
    }
  };

  const handleNumericalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(question.id, e.target.value);
  };

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 h-full flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
        <h2 className="text-xl font-bold text-white">Question {currentQuestionIndex + 1}</h2>
        <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
          {question.type}
        </span>
      </div>
      
      <div className="text-lg text-neutral-200">
        {question.text}
      </div>

      <div className="flex-1 flex flex-col gap-3 mt-4">
        {question.type === 'Numerical' ? (
          <input
            type="number"
            value={currentAnswer || ''}
            onChange={handleNumericalChange}
            placeholder="Enter numerical answer"
            className="bg-neutral-800 border border-neutral-700 text-white p-4 rounded-lg w-full max-w-md focus:border-amber-400 focus:outline-none"
          />
        ) : (
          question.options?.map((opt, i) => {
            const isChecked = question.type === 'MCQ' 
              ? currentAnswer === opt 
              : Array.isArray(currentAnswer) && currentAnswer.includes(opt);
              
            return (
              <label 
                key={i} 
                className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                  isChecked 
                    ? 'bg-amber-400/10 border-amber-400 text-white' 
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                }`}
              >
                <input
                  type={question.type === 'MCQ' ? 'radio' : 'checkbox'}
                  name={question.id}
                  checked={isChecked}
                  onChange={() => handleOptionChange(opt)}
                  className="w-5 h-5 accent-amber-400"
                />
                <span className="text-lg">{opt}</span>
              </label>
            )
          })
        )}
      </div>
    </div>
  );
};
