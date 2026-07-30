import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamStore } from '../stores/examStore';
import { Timer } from '../components/Timer';
import { QuestionPalette } from '../components/QuestionPalette';
import { QuestionPanel } from '../components/QuestionPanel';

const MOCK_QUESTIONS = [
  { id: 'q1', type: 'MCQ', section: 'Physics', text: 'What is the unit of Force?', options: ['Newton', 'Joule', 'Watt', 'Pascal'] },
  { id: 'q2', type: 'MSQ', section: 'Physics', text: 'Which of the following are vectors?', options: ['Velocity', 'Speed', 'Force', 'Mass'] },
  { id: 'q3', type: 'Numerical', section: 'Chemistry', text: 'What is the atomic number of Carbon?' },
  { id: 'q4', type: 'MCQ', section: 'Math', text: 'Value of sin(90°)?', options: ['0', '1', '-1', 'Infinity'] },
  { id: 'q5', type: 'MCQ', section: 'Biology', text: 'Powerhouse of cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi'] }
] as any;

export const Exam: React.FC = () => {
  const navigate = useNavigate();
  const { 
    questions, 
    setQuestions, 
    currentQuestionIndex,
    nextQuestion,
    prevQuestion,
    markForReview,
    clearAnswer,
    isSubmitted,
    submitExam
  } = useExamStore();

  const [activeSection, setActiveSection] = useState('Physics');

  useEffect(() => {
    if (questions.length === 0) {
      setQuestions(MOCK_QUESTIONS);
    }
  }, [setQuestions, questions.length]);

  useEffect(() => {
    if (isSubmitted) {
      navigate('/results');
    }
  }, [isSubmitted, navigate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert("Warning: Tab switching is not allowed during the exam!");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  
  // Sync active section with current question
  useEffect(() => {
    if (currentQuestion) {
      setActiveSection(currentQuestion.section);
    }
  }, [currentQuestionIndex, currentQuestion]);

  if (questions.length === 0) return <div className="text-white p-8">Loading...</div>;

  const sections = Array.from(new Set(questions.map(q => q.section)));

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col h-screen overflow-hidden">
      {/* Topbar */}
      <header className="bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-white tracking-wider">VIGYAN PREP</h1>
        
        <div className="flex items-center gap-2">
          {sections.map(sec => (
            <div 
              key={sec}
              className={`px-4 py-2 rounded-md font-medium ${activeSection === sec ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-neutral-300'}`}
            >
              {sec}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Timer />
          <button 
            onClick={() => { if(window.confirm('Submit Exam?')) submitExam(); }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition-colors"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left: Question Area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 overflow-y-auto">
            <QuestionPanel />
          </div>
          
          {/* Bottom Bar Actions */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between shrink-0">
            <div className="flex gap-2">
              <button 
                onClick={() => markForReview(currentQuestion.id)}
                className="px-4 py-2 border border-orange-500 text-orange-500 hover:bg-orange-500/10 rounded-lg font-medium transition-colors"
              >
                Mark for Review
              </button>
              <button 
                onClick={() => clearAnswer(currentQuestion.id)}
                className="px-4 py-2 border border-neutral-600 text-neutral-300 hover:bg-neutral-800 rounded-lg font-medium transition-colors"
              >
                Clear Response
              </button>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-neutral-800 text-white disabled:opacity-50 rounded-lg font-medium hover:bg-neutral-700 transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={nextQuestion}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Save' : 'Save & Next'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Palette */}
        <div className="w-80 shrink-0">
          <QuestionPalette />
        </div>
      </main>
    </div>
  );
};
