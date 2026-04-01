"use client";

import { memo } from "react";
import { formatPrice } from "@repo/shared";
import { Badge } from "../atoms";

interface PriceTagProps {
  originalPrice: number;
  discountedPrice?: number;
  discountRate?: number;
}

export const PriceTag = memo(function PriceTag({
  originalPrice,
  discountedPrice,
  discountRate,
}: PriceTagProps) {
  const hasDiscount = discountedPrice && discountedPrice < originalPrice;

  if (!hasDiscount) {
    return <p className="text-lg font-bold">{formatPrice(originalPrice)}</p>;
  }

  return (
    <div className="flex items-baseline gap-2">
      {discountRate && (
        <Badge variant="error" size="sm">
          {discountRate}%
        </Badge>
      )}
      <span className="text-xl font-bold text-red-600">
        {formatPrice(discountedPrice)}
      </span>
      <span className="text-sm text-gray-400 line-through">
        {formatPrice(originalPrice)}
      </span>
    </div>
  );
});
