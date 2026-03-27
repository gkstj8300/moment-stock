/**
 * 디자인 토큰 — Tailwind·Tamagui 양쪽의 단일 소스
 * Phase 3에서 본격 확장 예정
 */

export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  stock: {
    high: "#22c55e",
    medium: "#eab308",
    low: "#f97316",
    critical: "#ef4444",
    soldOut: "#9ca3af",
  },
  semantic: {
    success: "#22c55e",
    warning: "#eab308",
    error: "#ef4444",
    info: "#3b82f6",
  },
} as const;

export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
} as const;

export const fontSize = {
  xs: "12px",
  sm: "14px",
  base: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "30px",
  "4xl": "36px",
} as const;

export const breakpoints = {
  mobile: "360px",
  tablet: "768px",
  desktop: "1280px",
} as const;
