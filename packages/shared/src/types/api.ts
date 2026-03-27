/**
 * API Request/Response 타입
 */

export interface PurchaseRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseResponse {
  success: boolean;
  orderId?: string;
  remainingStock?: number;
  error?: string;
  message?: string;
}

export interface CancelOrderRequest {
  orderId: string;
}

export interface CancelOrderResponse {
  success: boolean;
  orderId?: string;
  error?: string;
  message?: string;
}

export type ApiError = {
  code: string;
  message: string;
};
