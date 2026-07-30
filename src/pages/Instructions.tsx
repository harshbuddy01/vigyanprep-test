import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const Instructions: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testType = searchParams.get('testType') || 'general';
  
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-neutral-200 flex flex-col items-center py-12 px-4">
      <div className="max-w-3xl w-full bg-neutral-900 rounded-2xl border border-neutral-800 p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Instructions for {testType.toUpperCase()} Exam</h1>
        
        <div className="space-y-6 text-neutral-300">
          <section>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-3">
              <Clock className="text-amber-400" /> General Rules
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The exam duration is strictly timed. The timer will be visible on the top right.</li>
              <li>Auto-submission will occur when the timer hits zero.</li>
              <li>Do not refresh the page or switch tabs. Doing so will issue a warning and may lead to auto-submission.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-3">
              <CheckCircle className="text-green-400" /> Marking Scheme
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>MCQ: +4 for correct, -1 for incorrect.</li>
              <li>MSQ: +4 for all correct, no partial marking, 0 for incorrect.</li>
              <li>Numerical: +4 for correct, 0 for incorrect.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-3">
              <AlertCircle className="text-blue-400" /> Navigation
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Question Palette on the right to jump directly to questions.</li>
              <li>You can "Mark for Review" if you are unsure of your answer.</li>
              <li>Clear your response using the "Clear Response" button.</li>
            </ul>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-800">
          <label className="flex items-center gap-3 cursor-pointer mb-6">
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-amber-400 rounded"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>I have read and understood all the instructions. I agree not to use any unfair means.</span>
          </label>

          <div className="flex justify-end">
            <button
              onClick={() => navigate('/exam')}
              disabled={!agreed}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-bold rounded-lg transition-colors"
            >
              Start Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
