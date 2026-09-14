import React, { useState, useEffect } from 'react';
import { Clock, Flame, ShieldAlert, Sparkles } from 'lucide-react';

interface ModernExamCountdownProps {
  targetDate: string | Date;
  mode: 'closing' | 'opening';
  variant?: 'hero' | 'compact' | 'badge';
  onExpire?: () => void;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
}

function calculateTimeRemaining(target: Date): TimeRemaining {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, totalMs: diff, isExpired: false };
}

export const ModernExamCountdown: React.FC<ModernExamCountdownProps> = ({
  targetDate,
  mode,
  variant = 'hero',
  onExpire,
  className = ''
}) => {
  const target = React.useMemo(() => new Date(targetDate), [targetDate]);
  const [time, setTime] = useState<TimeRemaining>(() => calculateTimeRemaining(target));

  useEffect(() => {
    const initial = calculateTimeRemaining(target);
    setTime(initial);
    if (initial.isExpired) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      const updated = calculateTimeRemaining(target);
      setTime(updated);
      if (updated.isExpired) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [target, onExpire]);

  const targetTimeIST = React.useMemo(() => {
    return target.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }, [target]);

  const isClosing = mode === 'closing';
  const isUrgent = isClosing && time.totalMs <= 10 * 60 * 1000;
  const isWarning = isClosing && time.totalMs <= 30 * 60 * 1000;

  if (time.isExpired) {
    if (variant === 'badge' || variant === 'compact') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-700 border border-neutral-300">
          <Clock size={10} /> {isClosing ? 'Window Closed' : 'Live Now'}
        </span>
      );
    }
    return (
      <div className={`p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-700 text-center text-white ${className}`}>
        <p className="text-xs font-bold text-neutral-300">
          {isClosing ? '⏳ Entry Window Has Closed' : '🟢 Exam Is Now Live!'}
        </p>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-tight shadow-xs ${
          isUrgent
            ? 'bg-rose-500/20 text-rose-900 border border-rose-500/50 animate-pulse'
            : isWarning
            ? 'bg-amber-500/20 text-amber-900 border border-amber-500/40'
            : isClosing
            ? 'bg-emerald-500/15 text-emerald-900 border border-emerald-500/30'
            : 'bg-amber-500/15 text-amber-900 border border-amber-500/30'
        } ${className}`}
        title={`${isClosing ? 'Closes at' : 'Opens at'} ${targetTimeIST}`}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isUrgent ? 'bg-rose-500' : isClosing ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
              isUrgent ? 'bg-rose-600' : isClosing ? 'bg-emerald-600' : 'bg-amber-600'
            }`}
          />
        </span>
        <span>
          {isClosing ? 'Closes in ' : 'Opens in '}
          {time.days > 0 && `${time.days}d `}
          {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
        </span>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`p-2.5 rounded-xl border transition-all ${
          isUrgent
            ? 'bg-rose-500/10 border-rose-500/40 text-rose-950'
            : isWarning
            ? 'bg-amber-500/10 border-amber-500/40 text-amber-950'
            : isClosing
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-950'
        } ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider">
            {isUrgent ? (
              <Flame size={13} className="text-rose-600 animate-bounce" />
            ) : (
              <Clock size={13} className={isClosing ? 'text-emerald-700' : 'text-amber-800'} />
            )}
            <span>{isClosing ? (isUrgent ? 'Closing Fast' : 'Window Closes') : 'Opens In'}</span>
          </div>

          <div className="font-mono text-xs font-black tracking-widest px-2 py-0.5 rounded-md bg-[#181512] text-amber-300 shadow-inner">
            {time.days > 0 && `${time.days}d `}
            {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-4 sm:p-4.5 border-2 transition-all duration-300 shadow-lg relative overflow-hidden backdrop-blur-md ${
        isUrgent
          ? 'bg-gradient-to-br from-rose-950/90 via-red-900/90 to-zinc-950 border-rose-500 shadow-rose-950/30 text-white animate-pulse'
          : isWarning
          ? 'bg-gradient-to-br from-[#1c1815] via-[#241e1a] to-[#120f0d] border-amber-500/70 shadow-amber-950/20 text-white'
          : isClosing
          ? 'bg-gradient-to-br from-[#121b16] via-[#16231c] to-[#0c130f] border-emerald-500/60 shadow-emerald-950/20 text-white'
          : 'bg-gradient-to-br from-[#1c1815] via-[#231e19] to-[#120f0d] border-amber-500/50 shadow-amber-950/20 text-white'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          {isUrgent ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm animate-pulse">
              <ShieldAlert size={12} /> FINAL CALL — WINDOW CLOSING!
            </span>
          ) : isClosing ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ⚡ ENTRY WINDOW CLOSING IN
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles size={11} /> ⏳ TEST WINDOW OPENS IN
            </span>
          )}
        </div>

        <span className="text-[11px] font-mono font-bold text-neutral-300 flex items-center gap-1">
          <Clock size={12} className="text-amber-400" />
          <span>{isClosing ? 'Closes' : 'Starts'}: {targetTimeIST} IST</span>
        </span>
      </div>

      <div className="py-3 flex items-center justify-center gap-2 sm:gap-3">
        {time.days > 0 && (
          <>
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-16 h-13 sm:h-14 rounded-xl bg-black/70 border border-white/15 flex items-center justify-center shadow-inner">
                <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-amber-400">
                  {String(time.days).padStart(2, '0')}
                </span>
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400 mt-1">Days</span>
            </div>
            <span className="font-mono text-2xl font-black text-amber-400/80 -mt-3">:</span>
          </>
        )}

        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 h-13 sm:h-14 rounded-xl bg-black/70 border border-white/15 flex items-center justify-center shadow-inner">
            <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-amber-300">
              {String(time.hours).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400 mt-1">Hours</span>
        </div>

        <span className="font-mono text-2xl font-black text-amber-400/80 -mt-3 animate-pulse">:</span>

        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 h-13 sm:h-14 rounded-xl bg-black/70 border border-white/15 flex items-center justify-center shadow-inner">
            <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-amber-300">
              {String(time.minutes).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400 mt-1">Mins</span>
        </div>

        <span className="font-mono text-2xl font-black text-emerald-400/80 -mt-3 animate-pulse">:</span>

        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 h-13 sm:h-14 rounded-xl bg-black/70 border border-emerald-500/40 flex items-center justify-center shadow-inner">
            <span className={`font-mono text-2xl sm:text-3xl font-black tracking-tight ${isUrgent ? 'text-rose-400' : 'text-emerald-400'}`}>
              {String(time.seconds).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400 mt-1">Secs</span>
        </div>
      </div>

      <div className="pt-2 border-t border-white/10 text-center">
        {isClosing ? (
          <p className="text-[11px] text-neutral-300 font-medium leading-relaxed">
            ⚠️ <span className="font-bold text-amber-300">Important:</span> You must click <span className="underline decoration-emerald-400 font-bold text-white">Start CBT Exam</span> before this timer hits zero. Once entered, you receive your <span className="font-bold text-white">full 3-hour exam duration</span>!
          </p>
        ) : (
          <p className="text-[11px] text-neutral-300 font-medium leading-relaxed">
            The exam will unlock automatically at <span className="font-bold text-amber-300">{targetTimeIST} IST</span>. Be prepared with your rough sheets and calculator.
          </p>
        )}
      </div>
    </div>
  );
};
