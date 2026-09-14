import React, { useState, useEffect } from 'react';
import { Clock, Flame, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

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
  const isUrgent = isClosing && time.totalMs <= 10 * 60 * 1000; // <= 10 min
  const isWarning = isClosing && time.totalMs <= 30 * 60 * 1000; // <= 30 min

  if (time.isExpired) {
    if (variant === 'badge' || variant === 'compact') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-700 border border-neutral-300">
          <Clock size={10} /> {isClosing ? 'Window Closed' : 'Live Now'}
        </span>
      );
    }
    return (
      <div className={`p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-neutral-300 text-center text-zinc-800 ${className}`}>
        <p className="text-xs font-bold text-zinc-700">
          {isClosing ? '⏳ Entry Window Has Closed' : '🟢 Exam Is Now Live!'}
        </p>
      </div>
    );
  }

  // 1. BADGE VARIANT (for Table Cells or Status Tags)
  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight shadow-2xs ${
          isUrgent
            ? 'bg-rose-500/15 text-rose-900 border border-rose-500/40 animate-pulse'
            : isWarning
            ? 'bg-amber-500/15 text-amber-900 border border-amber-500/35'
            : isClosing
            ? 'bg-emerald-500/15 text-emerald-950 border border-emerald-500/30'
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

  // 2. COMPACT VARIANT (for Bento Grid Cards)
  if (variant === 'compact') {
    return (
      <div
        className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
          isUrgent
            ? 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-xs'
            : isWarning
            ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-xs'
            : isClosing
            ? 'bg-white/80 border-emerald-500/30 text-emerald-950 shadow-2xs'
            : 'bg-white/80 border-amber-500/30 text-amber-950 shadow-2xs'
        } ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide">
            {isUrgent ? (
              <Flame size={13} className="text-rose-600 animate-bounce" />
            ) : (
              <Clock size={13} className={isClosing ? 'text-emerald-700' : 'text-amber-800'} />
            )}
            <span>{isClosing ? (isUrgent ? 'Closing Soon' : 'Window Closes') : 'Opens In'}</span>
          </div>

          <div className="font-mono text-xs font-black tracking-wider px-2 py-0.5 rounded-lg bg-emerald-950/5 border border-emerald-950/10 text-[#1c1815]">
            {time.days > 0 && `${time.days}d `}
            {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
          </div>
        </div>
      </div>
    );
  }

  // 3. HERO VARIANT (Refined, Modern Editorial Design)
  return (
    <div
      className={`rounded-2xl p-3.5 sm:p-4 border-2 transition-all duration-300 shadow-sm backdrop-blur-xl ${
        isUrgent
          ? 'bg-rose-50/90 border-rose-400/80 shadow-rose-900/5 text-rose-950'
          : isWarning
          ? 'bg-amber-50/80 border-amber-400/80 shadow-amber-900/5 text-amber-950'
          : isClosing
          ? 'bg-white/85 border-emerald-500/35 shadow-emerald-950/5 text-[#1c1815]'
          : 'bg-white/85 border-amber-500/35 shadow-amber-950/5 text-[#1c1815]'
      } ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-950/10">
        <div className="flex items-center gap-2">
          {isUrgent ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-2xs animate-pulse">
              <ShieldAlert size={12} /> Closing Soon • Final Call
            </span>
          ) : isClosing ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-950 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Entry Window Closes In
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-950 border border-amber-500/30">
              <Sparkles size={11} /> Test Window Opens In
            </span>
          )}
        </div>

        <span className="text-[11px] font-mono font-bold text-zinc-600 flex items-center gap-1">
          <Clock size={12} className="text-amber-800" />
          <span>{isClosing ? 'Closes' : 'Opens'}: {targetTimeIST} IST</span>
        </span>
      </div>

      {/* Modern Minimalist Segmented Digital Digits */}
      <div className="py-2.5 flex items-center justify-center gap-2 sm:gap-2.5">
        {time.days > 0 && (
          <>
            <div className="flex flex-col items-center">
              <div className="w-13 sm:w-14 h-11 sm:h-12 rounded-xl bg-amber-950/[0.04] border border-amber-950/15 flex items-center justify-center shadow-2xs">
                <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-[#1c1815]">
                  {String(time.days).padStart(2, '0')}
                </span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-1">Days</span>
            </div>
            <span className="font-mono text-lg font-bold text-amber-950/40 -mt-2">:</span>
          </>
        )}

        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="w-13 sm:w-14 h-11 sm:h-12 rounded-xl bg-amber-950/[0.04] border border-amber-950/15 flex items-center justify-center shadow-2xs">
            <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-[#1c1815]">
              {String(time.hours).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-1">Hours</span>
        </div>

        <span className="font-mono text-lg font-bold text-amber-950/40 -mt-2 animate-pulse">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="w-13 sm:w-14 h-11 sm:h-12 rounded-xl bg-amber-950/[0.04] border border-amber-950/15 flex items-center justify-center shadow-2xs">
            <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-[#1c1815]">
              {String(time.minutes).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-1">Mins</span>
        </div>

        <span className="font-mono text-lg font-bold text-emerald-800/50 -mt-2 animate-pulse">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="w-13 sm:w-14 h-11 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-2xs">
            <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-emerald-800">
              {String(time.seconds).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-800 mt-1">Secs</span>
        </div>
      </div>

      {/* Clean Reassuring Note */}
      <div className="pt-2 border-t border-amber-950/10 flex items-center justify-center gap-1.5 text-center">
        {isClosing ? (
          <p className="text-[11px] text-zinc-700 font-medium leading-snug flex items-center justify-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
            <span>Guaranteed full 3-hour exam duration from your entry time.</span>
          </p>
        ) : (
          <p className="text-[11px] text-zinc-700 font-medium leading-snug">
            The exam will unlock automatically at <span className="font-bold text-amber-950">{targetTimeIST} IST</span>.
          </p>
        )}
      </div>
    </div>
  );
};
