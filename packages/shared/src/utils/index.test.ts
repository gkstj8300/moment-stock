import { describe, it, expect } from "vitest";
import {
  getStockLevel,
  formatPrice,
  calcDiscountedPrice,
  getRemainingTime,
} from "./index";

describe("getStockLevel", () => {
  it("returns soldOut when stock is 0", () => {
    expect(getStockLevel(0, 100)).toBe("soldOut");
  });

  it("returns soldOut when stock is negative", () => {
    expect(getStockLevel(-1, 100)).toBe("soldOut");
  });

  it("returns high when ratio > 0.5", () => {
    expect(getStockLevel(51, 100)).toBe("high");
  });

  it("returns medium when ratio > 0.2 and <= 0.5", () => {
    expect(getStockLevel(30, 100)).toBe("medium");
    expect(getStockLevel(50, 100)).toBe("medium");
  });

  it("returns low when ratio > 0.05 and <= 0.2", () => {
    expect(getStockLevel(10, 100)).toBe("low");
    expect(getStockLevel(20, 100)).toBe("low");
  });

  it("returns critical when ratio <= 0.05", () => {
    expect(getStockLevel(5, 100)).toBe("critical");
    expect(getStockLevel(1, 100)).toBe("critical");
  });
});

describe("formatPrice", () => {
  it("formats price with Korean won", () => {
    expect(formatPrice(29900)).toBe("29,900원");
  });

  it("formats zero price", () => {
    expect(formatPrice(0)).toBe("0원");
  });

  it("formats large price", () => {
    expect(formatPrice(1000000)).toBe("1,000,000원");
  });
});

describe("calcDiscountedPrice", () => {
  it("calculates 30% discount", () => {
    expect(calcDiscountedPrice(10000, 30)).toBe(7000);
  });

  it("calculates 50% discount", () => {
    expect(calcDiscountedPrice(89000, 50)).toBe(44500);
  });

  it("rounds to nearest integer", () => {
    expect(calcDiscountedPrice(100, 33)).toBe(67);
  });
});

describe("getRemainingTime", () => {
  it("returns isExpired true for past date", () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const result = getRemainingTime(past);
    expect(result.isExpired).toBe(true);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
  });

  it("returns correct time for future date", () => {
    const future = new Date(Date.now() + 3661000).toISOString(); // 1h 1m 1s
    const result = getRemainingTime(future);
    expect(result.isExpired).toBe(false);
    expect(result.hours).toBe(1);
    expect(result.minutes).toBe(1);
    expect(result.seconds).toBeGreaterThanOrEqual(0);
  });
});
