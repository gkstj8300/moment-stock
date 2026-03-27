import { describe, it, expect } from "vitest";
import { purchaseSchema, cancelOrderSchema } from "./purchase";

describe("purchaseSchema", () => {
  it("accepts valid purchase input", () => {
    const result = purchaseSchema.safeParse({
      productId: "550e8400-e29b-41d4-a716-446655440000",
      quantity: 2,
      unitPrice: 29900,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid UUID", () => {
    const result = purchaseSchema.safeParse({
      productId: "not-a-uuid",
      quantity: 1,
      unitPrice: 1000,
    });
    expect(result.success).toBe(false);
  });

  it("rejects quantity of 0", () => {
    const result = purchaseSchema.safeParse({
      productId: "550e8400-e29b-41d4-a716-446655440000",
      quantity: 0,
      unitPrice: 1000,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = purchaseSchema.safeParse({
      productId: "550e8400-e29b-41d4-a716-446655440000",
      quantity: 1,
      unitPrice: -100,
    });
    expect(result.success).toBe(false);
  });
});

describe("cancelOrderSchema", () => {
  it("accepts valid order ID", () => {
    const result = cancelOrderSchema.safeParse({
      orderId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid order ID", () => {
    const result = cancelOrderSchema.safeParse({
      orderId: "invalid",
    });
    expect(result.success).toBe(false);
  });
});
