/**
 * @repo/shared — 플랫폼 무관 비즈니스 로직 및 데이터 계층
 */

export function getStockLevel(
  currentStock: number,
  initialStock: number
): "high" | "medium" | "low" | "critical" | "soldOut" {
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
