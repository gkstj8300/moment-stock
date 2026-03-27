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
  high: "text-green-600",
  medium: "text-yellow-600",
  low: "text-orange-600",
  critical: "text-red-600",
  soldOut: "text-gray-500",
};

export const StockDisplay = memo(function StockDisplay({
  quantity,
  initialQuantity,
  percentage,
  level,
}: StockDisplayProps) {
  return (
    <div className="space-y-1.5" aria-label={`재고 ${quantity}개 / ${initialQuantity}개`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${LEVEL_TEXT_COLORS[level]}`}>
          {quantity}개 남음
        </span>
        <ScarcityBadge quantity={quantity} />
      </div>
      <StockGaugeBar percentage={percentage} level={level} />
    </div>
  );
});
