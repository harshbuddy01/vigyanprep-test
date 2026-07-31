import React, { useState, useEffect } from 'react';
import { ChallengeModal } from '../components/ChallengeModal';
import { useExamStore } from '../stores/examStore';

export const ResponseSheet: React.FC = () => {
  const [showChallenge, setShowChallenge] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { token, attemptId } = useExamStore();
  
  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com'}/api/exam/results?attempt_id=${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch results');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (attemptId && token) {
      fetchResults();
    }
  }, [attemptId, token]);

  const handleChallenge = (q: any) => {
    setSelectedQuestion(q);
    setShowChallenge(true);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">Loading results...</div>;
  if (error) return <div className="min-h-screen bg-gray-50 p-8 flex flex-col justify-center items-center">Error: {error} <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={fetchResults}>Retry</button></div>;
  if (!data) return <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">No results data.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-2">Score Summary</h1>
          <div className="flex space-x-8 text-gray-700">
            <div>Score: <span className="font-bold">{data.score} / {data.totalMarks}</span></div>
            <div>Rank: <span className="font-bold">{data.rank || 'N/A'}</span></div>
            <div>Percentile: <span className="font-bold">{data.percentile || 'N/A'}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          {(data.questions || []).map((q: any, i: number) => (
            <div key={q.id} className="bg-white p-6 rounded shadow relative">
              <h3 className="font-bold mb-2">Q{i + 1}. {q.text}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>Selected: <span className="font-semibold text-blue-600">{q.selected || 'None'}</span></div>
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
