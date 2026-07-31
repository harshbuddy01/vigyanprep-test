import React, { useState } from 'react';

export const Feedback: React.FC = () => {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd call submitFeedback API here
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#120e08] flex flex-col items-center justify-center p-4">
        <div className="bg-[#1a150c] p-8 rounded-lg border border-amber-900/30 text-center max-w-md">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Your feedback recorded!</h2>
          <p className="text-amber-100 mb-8">Response sheet releasing in 3-4 hours via email.</p>
          <a
            href="https://auth.vigyanprep.com"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-6 rounded transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#120e08] flex items-center justify-center p-4">
      <div className="bg-[#1a150c] p-8 rounded-lg border border-amber-900/30 w-full max-w-md">
        <h2 className="text-2xl font-bold text-amber-400 mb-6 text-center">Post-Exam Feedback</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-amber-200 mb-2 font-semibold">Overall Rating (1-5)</label>
            <input 
              type="range" 
              min="1" max="5" 
              value={rating} 
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="text-center text-amber-400 font-bold mt-2">{rating} Stars</div>
          </div>
          <div>
            <label className="block text-amber-200 mb-2 font-semibold">Comments</label>
            <textarea 
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full bg-[#111] border border-amber-900/50 rounded p-3 text-amber-100 focus:outline-none focus:border-amber-500 h-32 resize-none"
              placeholder="How was your experience?"
            ></textarea>
          </div>
          <button 
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-4 rounded transition-colors"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};
