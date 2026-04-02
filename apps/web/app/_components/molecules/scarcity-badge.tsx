"use client";

import { memo } from "react";

interface ScarcityBadgeProps {
  quantity: number;
}

export const ScarcityBadge = memo(function ScarcityBadge({
  quantity,
}: ScarcityBadgeProps) {
  if (quantity <= 0) {
    return (
      <span
        className="inline-block rounded-md bg-[#71717a] px-2.5 py-0.5 text-xs font-semibold text-white"
        aria-label="품절"
      >
        품절
      </span>
    );
  }

  if (quantity <= 3) {
    return (
      <span
        className="inline-block animate-pulse rounded-md bg-[#fa2454] px-2.5 py-0.5 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(250,36,84,0.4)] motion-reduce:animate-none"
        aria-label={`마지막 ${quantity}개`}
      >
        마지막 {quantity}개!
      </span>
    );
  }

  if (quantity <= 5) {
    return (
      <span
        className="inline-block rounded-md bg-[#f97316] px-2.5 py-0.5 text-xs font-semibold text-white"
        aria-label={`${quantity}개 남음, 곧 품절`}
      >
        곧 품절
      </span>
    );
  }

  return null;
});
