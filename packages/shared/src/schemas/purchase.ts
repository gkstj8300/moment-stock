import { z } from "zod";

export const purchaseSchema = z.object({
  productId: z.string().uuid("유효한 상품 ID가 아닙니다."),
  quantity: z.number().int().min(1, "최소 1개 이상 구매해야 합니다."),
  unitPrice: z.number().int().positive("가격은 양수여야 합니다."),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;

export const cancelOrderSchema = z.object({
  orderId: z.string().uuid("유효한 주문 ID가 아닙니다."),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
