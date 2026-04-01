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
      <span className="text-sm font-medium text-gray-500" aria-live="polite">
        세일 종료
      </span>
    );
  }

  const isUrgent = time.hours === 0 && time.minutes < 10;

  return (
    <time
      className={`font-mono text-lg font-bold tabular-nums ${isUrgent ? "text-red-500" : "text-gray-900"}`}
      aria-live="polite"
      aria-label={`남은 시간 ${time.hours}시간 ${time.minutes}분 ${time.seconds}초`}
    >
      {String(time.hours).padStart(2, "0")}:
      {String(time.minutes).padStart(2, "0")}:
      {String(time.seconds).padStart(2, "0")}
    </time>
  );
});
