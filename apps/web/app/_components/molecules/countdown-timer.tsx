"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { getRemainingTime } from "@repo/shared";

interface CountdownTimerProps {
  endsAt: string;
  onExpire?: () => void;
}

export const CountdownTimer = memo(function CountdownTimer({
  endsAt,
  onExpire,
}: CountdownTimerProps) {
  const [time, setTime] = useState(() => getRemainingTime(endsAt));

  const tick = useCallback(() => {
    const next = getRemainingTime(endsAt);
    setTime(next);
    if (next.isExpired) {
      onExpire?.();
    }
  }, [endsAt, onExpire]);

  useEffect(() => {
    if (time.isExpired) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick, time.isExpired]);

  if (time.isExpired) {
    return (
      <span className="text-sm font-medium text-[#a1a1aa]" aria-live="polite">
        세일 종료
      </span>
    );
  }

  const isUrgent = time.hours === 0 && time.minutes < 10;

  return (
    <time
      className={`inline-flex items-center gap-1 font-mono text-lg font-bold tabular-nums tracking-tight ${
        isUrgent ? "text-[#fa2454]" : "text-[#0a0a0a]"
      }`}
      aria-live="polite"
      aria-label={`남은 시간 ${time.hours}시간 ${time.minutes}분 ${time.seconds}초`}
    >
      <span className={`rounded-lg px-2 py-1 ${isUrgent ? "bg-[#fa2454]/10" : "bg-black/[0.04]"}`}>
        {String(time.hours).padStart(2, "0")}
      </span>
      <span className={`text-sm ${isUrgent ? "text-[#fa2454]/60" : "text-[#a1a1aa]"}`}>:</span>
      <span className={`rounded-lg px-2 py-1 ${isUrgent ? "bg-[#fa2454]/10" : "bg-black/[0.04]"}`}>
        {String(time.minutes).padStart(2, "0")}
      </span>
      <span className={`text-sm ${isUrgent ? "text-[#fa2454]/60" : "text-[#a1a1aa]"}`}>:</span>
      <span className={`rounded-lg px-2 py-1 ${isUrgent ? "bg-[#fa2454]/10" : "bg-black/[0.04]"}`}>
        {String(time.seconds).padStart(2, "0")}
      </span>
    </time>
  );
});
