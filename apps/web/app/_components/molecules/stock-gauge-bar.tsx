"use client";

import { memo } from "react";
import type { StockLevel } from "@repo/shared";

interface StockGaugeBarProps {
  percentage: number;
  level: StockLevel;
}

const LEVEL_COLORS: Record<StockLevel, string> = {
  high: "bg-green-500",
  medium: "bg-yellow-500",
  low: "bg-orange-500",
  critical: "bg-red-500",
  soldOut: "bg-gray-400",
};

export const StockGaugeBar = memo(function StockGaugeBar({
  percentage,
  level,
}: StockGaugeBarProps) {
  const colorClass = LEVEL_COLORS[level];
  const clampedPct = Math.max(0, Math.min(100, percentage));

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
      role="progressbar"
      aria-valuenow={clampedPct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`재고 ${clampedPct}% 남음`}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 motion-reduce:transition-none ${colorClass}`}
        style={{ width: `${clampedPct}%` }}
      />
    </div>
  );
});
