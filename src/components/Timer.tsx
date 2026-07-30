import React, { useEffect } from 'react';
import { useExamStore } from '../stores/examStore';
import clsx from 'clsx';
import { Clock } from 'lucide-react';

export const Timer: React.FC = () => {
  const { timeRemaining, decrementTimer, isSubmitted } = useExamStore();

  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(decrementTimer, 1000);
    return () => clearInterval(interval);
  }, [decrementTimer, isSubmitted]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isDanger = timeRemaining < 300; // < 5 mins

  return (
    <div className={clsx("flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg", 
      isDanger ? "text-red-500 bg-red-500/10" : "text-amber-400 bg-amber-400/10"
    )}>
      <Clock size={20} />
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};
