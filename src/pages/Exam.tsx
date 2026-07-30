import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamStore } from '../stores/examStore';
import { Timer } from '../components/Timer';
import { QuestionPalette } from '../components/QuestionPalette';

export default function Exam() {
  const navigate = useNavigate();
  const {
    questions, currentQuestionIndex, answers, markedForReview,
    setAnswer, clearAnswer, markForReview, nextQuestion, prevQuestion,
    goToQuestion, submitExam, isSubmitted
  } = useExamStore();

  const [activeSection, setActiveSection] = useState('Physics');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const warningRef = useRef(0);

  const sections = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];

  // Tab switch proctoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        warningRef.current += 1;
        setTabWarnings(warningRef.current);
        setShowTabWarning(true);
        if (warningRef.current >= 3) {
          submitExam();
          navigate('/results');
        }
        setTimeout(() => setShowTabWarning(false), 4000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSubmitted, submitExam, navigate]);

  useEffect(() => {
    if (isSubmitted) navigate('/results');
  }, [isSubmitted, navigate]);

  const currentQ = questions[currentQuestionIndex];
  const currentAnswer = currentQ ? answers[currentQ.id] : null;
  const sectionQuestions = questions.filter(q => q.section === activeSection);

  const stats = {
    answered: Object.keys(answers).length,
    markedForReview: markedForReview.length,
    notAnswered: questions.length - Object.keys(answers).length,
  };

  const handleConfirmSubmit = () => {
    setShowSubmitModal(false);
    submitExam();
    navigate('/results');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0a0a0a', color: '#e2e2e2', fontFamily: 'Inter, sans-serif' }}>

      {/* Tab Warning Banner */}
      {showTabWarning && (
        <div className="fixed top-0 inset-x-0 z-50 bg-red-600 text-white text-center py-3 font-bold text-sm animate-pulse">
          ⚠️ WARNING: Tab switch detected! ({tabWarnings}/3). Auto-submit triggers at 3 violations.
        </div>
      )}

      {/* Top Header Bar */}
      <header style={{ background: '#111', borderBottom: '1px solid #222' }} className="flex items-center justify-between px-6 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <span style={{ color: '#d4a520', fontWeight: 700, fontSize: '1rem', letterSpacing: 2 }}>VIGYAN.prep</span>
          <span style={{ color: '#aaa', fontSize: '0.8rem' }}>|</span>
          <span style={{ color: '#ccc', fontSize: '0.85rem' }}>IISER Aptitude Test 2024</span>
        </div>
        <Timer />
        <button
          onClick={() => setShowSubmitModal(true)}
          style={{ background: 'linear-gradient(135deg, #d4a520, #e8720a)', color: '#111', fontWeight: 700, border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Submit Exam
        </button>
      </header>

      {/* Section Tabs */}
      <div style={{ background: '#111', borderBottom: '1px solid #222' }} className="flex items-center px-6 gap-2 py-2 shrink-0">
        {sections.map(sec => {
          const secAnswered = questions.filter(q => q.section === sec && answers[q.id]).length;
          const secTotal = questions.filter(q => q.section === sec).length;
          return (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              style={{
                background: activeSection === sec ? '#d4a520' : 'transparent',
                color: activeSection === sec ? '#111' : '#aaa',
                border: activeSection === sec ? 'none' : '1px solid #333',
                borderRadius: 6,
                padding: '5px 16px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {sec} <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>({secAnswered}/{secTotal})</span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-4 text-xs" style={{ color: '#888' }}>
          <span style={{ color: '#4ade80' }}>● {stats.answered} Answered</span>
          <span style={{ color: '#f97316' }}>● {stats.markedForReview} Marked</span>
          <span style={{ color: '#888' }}>● {stats.notAnswered} Remaining</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Question Area */}
        <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: '#0d0d0d' }}>
          {currentQ ? (
            <div className="p-8 space-y-6 max-w-3xl mx-auto w-full">
              {/* Question Number */}
              <div className="flex items-center justify-between">
                <span style={{ color: '#d4a520', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                  Question {currentQuestionIndex + 1} of {questions.length} • {currentQ.section}
                </span>
                <span style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  color: '#888',
                  fontSize: '0.7rem',
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontWeight: 500
                }}>
                  {currentQ.type}
                </span>
              </div>

              {/* Question Text */}
              <div style={{
                background: '#111',
                border: '1px solid #222',
                borderRadius: 12,
                padding: '28px 32px',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: '#e2e2e2',
                minHeight: 120
              }}>
                {currentQ.text || 'Question text will appear here.'}
              </div>

              {/* Options */}
              {currentQ.type !== 'Numerical' && (
                <div className="space-y-3">
                  {(currentQ.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, idx) => {
                    const optKey = ['A', 'B', 'C', 'D'][idx];
                    const isSelected = currentAnswer === optKey;
                    return (
                      <button
                        key={idx}
                        onClick={() => setAnswer(currentQ.id, optKey)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 16,
                          width: '100%',
                          background: isSelected ? 'rgba(212,165,32,0.12)' : '#111',
                          border: isSelected ? '1.5px solid #d4a520' : '1px solid #222',
                          borderRadius: 10,
                          padding: '14px 18px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                          color: isSelected ? '#f2ead8' : '#ccc'
                        }}
                      >
                        <span style={{
                          minWidth: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: isSelected ? '#d4a520' : '#1a1a1a',
                          border: isSelected ? 'none' : '1px solid #444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? '#111' : '#888',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          flexShrink: 0
                        }}>
                          {optKey}
                        </span>
                        <span style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Numerical Input */}
              {currentQ.type === 'Numerical' && (
                <div>
                  <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: 8 }}>Enter Numerical Answer:</label>
                  <input
                    type="number"
                    value={currentAnswer || ''}
                    onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                    style={{
                      background: '#111',
                      border: '1px solid #333',
                      borderRadius: 8,
                      padding: '12px 16px',
                      color: '#fff',
                      fontSize: '1rem',
                      width: 200,
                      outline: 'none'
                    }}
                    placeholder="Type answer..."
                  />
                </div>
              )}

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #1e1e1e' }}>
                <div className="flex gap-3">
                  <button
                    onClick={() => { markForReview(currentQ.id); nextQuestion(); }}
                    style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    Mark for Review & Next
                  </button>
                  <button
                    onClick={() => clearAnswer(currentQ.id)}
                    style={{ background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: 8, padding: '9px 18px', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    Clear Response
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    style={{ background: '#1a1a1a', color: '#ccc', border: '1px solid #333', borderRadius: 8, padding: '9px 18px', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem', opacity: currentQuestionIndex === 0 ? 0.4 : 1 }}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    style={{ background: '#d4a520', color: '#111', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', opacity: currentQuestionIndex === questions.length - 1 ? 0.4 : 1 }}
                  >
                    Save & Next →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1">
              <p style={{ color: '#666' }}>No questions loaded. Please start from the Instructions page.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Question Palette */}
        <div style={{ width: 260, background: '#111', borderLeft: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column' }} className="shrink-0 overflow-y-auto">
          {/* Student Info */}
          <div style={{ padding: '16px', borderBottom: '1px solid #1e1e1e' }}>
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 4 }}>Candidate</div>
            <div style={{ fontSize: '0.85rem', color: '#e2e2e2', fontWeight: 600 }}>Student</div>
          </div>

          {/* Legend */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e1e1e' }} className="grid grid-cols-2 gap-2">
            {[
              { color: '#4ade80', label: 'Answered', count: stats.answered },
              { color: '#f87171', label: 'Not Answered', count: stats.notAnswered },
              { color: '#f97316', label: 'Marked', count: stats.markedForReview },
              { color: '#555', label: 'Not Visited', count: questions.length - stats.answered - stats.notAnswered },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: item.color, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: '0.68rem', color: '#888' }}>{item.count} {item.label}</span>
              </div>
            ))}
          </div>

          {/* Section Tab in Palette */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #1e1e1e' }}>
            <div style={{ fontSize: '0.7rem', color: '#d4a520', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{activeSection}</div>
            <QuestionPalette
              questions={sectionQuestions}
              answers={answers}
              markedForReview={markedForReview}
              currentId={currentQ?.id}
              onSelect={(q) => {
                const idx = questions.findIndex(x => x.id === q.id);
                if (idx !== -1) goToQuestion(idx);
              }}
            />
          </div>

          {/* Submit Button in Palette */}
          <div style={{ padding: 16, marginTop: 'auto' }}>
            <button
              onClick={() => setShowSubmitModal(true)}
              style={{ width: '100%', background: 'linear-gradient(135deg, #d4a520, #e8720a)', color: '#111', fontWeight: 700, border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: 16, padding: 36, maxWidth: 440, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Confirm Submission</h2>
            <div style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: 24, lineHeight: 1.7 }}>
              <div style={{ color: '#4ade80' }}>✓ Answered: {stats.answered}</div>
              <div style={{ color: '#f87171' }}>✗ Not Answered: {stats.notAnswered}</div>
              <div style={{ color: '#f97316' }}>⊙ Marked for Review: {stats.markedForReview}</div>
              <div style={{ marginTop: 12, color: '#f87171' }}>Once submitted, you cannot change your answers!</div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{ background: '#1a1a1a', color: '#ccc', border: '1px solid #333', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                style={{ background: 'linear-gradient(135deg, #d4a520, #e8720a)', color: '#111', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
