import type { StockLevel } from "../types/entities";

export function getStockLevel(
  currentStock: number,
  initialStock: number
): StockLevel {
  if (currentStock <= 0) return "soldOut";
  const ratio = currentStock / initialStock;
  if (ratio > 0.5) return "high";
  if (ratio > 0.2) return "medium";
  if (ratio > 0.05) return "low";
  return "critical";
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR").format(price) + "원";
}

export function calcDiscountedPrice(
  originalPrice: number,
  discountRate: number
): number {
  return Math.round(originalPrice * (1 - discountRate / 100));
}

export function getRemainingTime(endsAt: string): {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, isExpired: true };

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isExpired: false,
  };
}
