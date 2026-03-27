/**
 * UI 엔티티 타입 — 컴포넌트가 의존하는 안정 계약
 * Server 타입과 분리하여 백엔드 변경 시 영향 범위를 제한한다.
 */

export type StockLevel = "high" | "medium" | "low" | "critical" | "soldOut";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  originalPrice: number;
  isActive: boolean;
  createdAt: string;
}

export interface Stock {
  productId: string;
  quantity: number;
  initialQuantity: number;
  stockPercentage: number;
  level: StockLevel;
}

export interface ProductWithStock extends Product {
  stock: Stock;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  paymentId: string | null;
  createdAt: string;
}

export interface TimeSale {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  currentStock: number;
  initialStock: number;
  stockPercentage: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
}
