"use client";

import { memo } from "react";
import type { StockLevel } from "@repo/shared";
import { StockGaugeBar } from "./stock-gauge-bar";
import { ScarcityBadge } from "./scarcity-badge";

interface StockDisplayProps {
  quantity: number;
  initialQuantity: number;
  percentage: number;
  level: StockLevel;
}

const LEVEL_TEXT_COLORS: Record<StockLevel, string> = {
  high: "text-[#16a34a]",
  medium: "text-[#ca8a04]",
  low: "text-[#ea580c]",
  critical: "text-[#fa2454]",
  soldOut: "text-[#a1a1aa]",
};

export const StockDisplay = memo(function StockDisplay({
  quantity,
  initialQuantity,
  percentage,
  level,
}: StockDisplayProps) {
  return (
    <div className="space-y-2" aria-label={`재고 ${quantity}개 / ${initialQuantity}개`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold tabular-nums ${LEVEL_TEXT_COLORS[level]}`}>
          {quantity}개 남음
        </span>
        <ScarcityBadge quantity={quantity} />
      </div>
      <StockGaugeBar percentage={percentage} level={level} />
    </div>
  );
});
