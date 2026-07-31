import React, { useState } from 'react';
import { useExamStore } from '../stores/examStore';

export const ChallengeModal: React.FC<{ question: any, onClose: () => void }> = ({ question, onClose }) => {
  const [reason, setReason] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const { token, testId } = useExamStore.getState();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com'}/api/challenges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // get token from examStore or prop
        },
        body: JSON.stringify({ test_id: testId, question_id: question.id, reason, proof_image_url: proofUrl })
      });
      if (!res.ok) throw new Error('Failed to submit challenge');
      setSubmitted(true);
      setTimeout(() => onClose(), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        {submitted ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold text-green-600 mb-2">Challenge submitted!</h3>
            <p className="text-gray-600">Admin will review within 24 hours.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Challenge Question</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="bg-gray-100 p-3 rounded mb-4 text-sm text-gray-700">
              {question?.text}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Reason for challenge</label>
                <textarea
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-24"
                  placeholder="Explain why the answer key is wrong..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Proof Image URL</label>
                <input
                  required
                  type="url"
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Submit Challenge</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
