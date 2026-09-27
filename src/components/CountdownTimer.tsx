"use client";

import { useEffect, useState } from "react";
import { getTimeRemaining } from "@/lib/utils";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface CountdownTimerProps {
  deadline: Date | string;
  onExpire?: () => void;
  compact?: boolean;
}

export function CountdownTimer({ deadline, onExpire, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(deadline);
      setTimeLeft(remaining);
      if (remaining.isExpired && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs font-semibold ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Submissions Closed</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-500/20">
        <Clock className="w-3.5 h-3.5 text-cyan-400" />
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, "0")}h:
          {String(timeLeft.minutes).padStart(2, "0")}m:
          {String(timeLeft.seconds).padStart(2, "0")}s left
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur shadow-glow">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-indigo-400 mb-3">
        <Clock className="w-4 h-4 animate-pulse text-indigo-400" />
        <span>Submission Deadline Countdown</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
        <div className="bg-slate-950/90 border border-white/10 rounded-xl p-2.5 sm:p-3 min-w-[58px] sm:min-w-[68px]">
          <span className="text-xl sm:text-2xl font-bold font-mono text-white block">
            {String(timeLeft.days).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Days
          </span>
        </div>

        <div className="bg-slate-950/90 border border-white/10 rounded-xl p-2.5 sm:p-3 min-w-[58px] sm:min-w-[68px]">
          <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 block">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Hours
          </span>
        </div>

        <div className="bg-slate-950/90 border border-white/10 rounded-xl p-2.5 sm:p-3 min-w-[58px] sm:min-w-[68px]">
          <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-400 block">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Mins
          </span>
        </div>

        <div className="bg-slate-950/90 border border-white/10 rounded-xl p-2.5 sm:p-3 min-w-[58px] sm:min-w-[68px]">
          <span className="text-xl sm:text-2xl font-bold font-mono text-rose-400 block">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Secs
          </span>
        </div>
      </div>
    </div>
  );
}
