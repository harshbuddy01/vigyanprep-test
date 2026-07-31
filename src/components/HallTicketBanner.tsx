import React from 'react';
import { useExamStore } from '../stores/examStore';

export const HallTicketBanner: React.FC = () => {
  const { candidateName, rollNumber, testTitle, isOnline } = useExamStore();

  return (
    <div className="bg-[#0a0a0a] border-b border-gray-800 text-gray-300 py-1 px-4 flex justify-between items-center text-xs font-semibold uppercase tracking-wider sticky top-0 z-50 shadow-md">
      <div className="flex space-x-6">
        <span>Candidate: <span className="text-white">{candidateName || 'UNKNOWN'}</span></span>
        <span>Roll No: <span className="text-white">{rollNumber || 'N/A'}</span></span>
        <span>Exam: <span className="text-amber-400">{testTitle || 'Vigyan Prep Exam'}</span></span>
      </div>
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-green-500">Online</span></>
        ) : (
          <><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-red-500">Offline</span></>
        )}
      </div>
    </div>
  );
};
