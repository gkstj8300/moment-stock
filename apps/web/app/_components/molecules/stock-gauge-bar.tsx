"use client";

import { memo } from "react";
import type { StockLevel } from "@repo/shared";

interface StockGaugeBarProps {
  percentage: number;
  level: StockLevel;
}

const LEVEL_COLORS: Record<StockLevel, string> = {
  high: "bg-[#22c55e]",
  medium: "bg-[#eab308]",
  low: "bg-[#f97316]",
  critical: "bg-[#fa2454]",
  soldOut: "bg-[#a1a1aa]",
};

const LEVEL_SHADOWS: Record<StockLevel, string> = {
  high: "shadow-[0_0_8px_rgba(34,197,94,0.4)]",
  medium: "shadow-[0_0_8px_rgba(234,179,8,0.4)]",
  low: "shadow-[0_0_8px_rgba(249,115,22,0.4)]",
  critical: "shadow-[0_0_8px_rgba(250,36,84,0.4)]",
  soldOut: "",
};

export const StockGaugeBar = memo(function StockGaugeBar({
  percentage,
  level,
}: StockGaugeBarProps) {
  const colorClass = LEVEL_COLORS[level];
  const shadowClass = LEVEL_SHADOWS[level];
  const clampedPct = Math.max(0, Math.min(100, percentage));

  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]"
      role="progressbar"
      aria-valuenow={clampedPct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`재고 ${clampedPct}% 남음`}
    >
      <div
        className={`h-full rounded-full spring-transition ${colorClass} ${shadowClass}`}
        style={{ width: `${clampedPct}%` }}
      />
    </div>
  );
});
