import React, { useState } from 'react';
import { ChallengeModal } from '../components/ChallengeModal';

export const ResponseSheet: React.FC = () => {
  const [showChallenge, setShowChallenge] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  const mockQuestions = [
    { id: '1', text: 'Sample Question 1', selected: 'A', correct: 'A', marks: 4, solution: 'Because A is right.' },
    { id: '2', text: 'Sample Question 2', selected: 'B', correct: 'C', marks: -1, solution: 'Because C is right.' },
  ];

  const handleChallenge = (q: any) => {
    setSelectedQuestion(q);
    setShowChallenge(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-2">Score Summary</h1>
          <div className="flex space-x-8 text-gray-700">
            <div>Score: <span className="font-bold">3 / 8</span></div>
            <div>Rank: <span className="font-bold">42</span></div>
            <div>Percentile: <span className="font-bold">98.5</span></div>
          </div>
        </div>

        <div className="space-y-4">
          {mockQuestions.map((q, i) => (
            <div key={q.id} className="bg-white p-6 rounded shadow relative">
              <h3 className="font-bold mb-2">Q{i + 1}. {q.text}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>Selected: <span className="font-semibold text-blue-600">{q.selected}</span></div>
                <div>Correct: <span className="font-semibold text-green-600">{q.correct}</span></div>
                <div>Marks: <span className={`font-semibold ${q.marks > 0 ? 'text-green-600' : 'text-red-600'}`}>{q.marks}</span></div>
              </div>
              <div className="bg-gray-100 p-4 rounded text-sm mb-4">
                <strong>Solution:</strong> {q.solution}
              </div>
              <button 
                onClick={() => handleChallenge(q)}
                className="bg-orange-100 text-orange-700 px-4 py-2 rounded text-sm font-semibold hover:bg-orange-200"
              >
                Challenge Question
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {showChallenge && (
        <ChallengeModal 
          question={selectedQuestion} 
          onClose={() => setShowChallenge(false)} 
        />
      )}
    </div>
  );
};
