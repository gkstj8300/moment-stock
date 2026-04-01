/**
 * 디자인 토큰 — Tailwind·Tamagui 양쪽의 단일 소스
 * 시멘틱 컬러 레이어 + 라이트/다크 모드 1:1 대응
 */

// ─────────────────────────────────────────
// Primitive Colors (원시 팔레트)
// ─────────────────────────────────────────

export const palette = {
  blue: {
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
  green: {
    50: "#f0fdf4",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
  },
  yellow: {
    50: "#fefce8",
    400: "#facc15",
    500: "#eab308",
    600: "#ca8a04",
  },
  orange: {
    50: "#fff7ed",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
  },
  red: {
    50: "#fef2f2",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },
  coolGray: {
    900: "#171B1C",
    800: "#1E2324",
    700: "#2A3033",
    600: "#3A4245",
  },
  white: "#ffffff",
  black: "#000000",
} as const;

// ─────────────────────────────────────────
// Semantic Colors — Light Mode
// ─────────────────────────────────────────

export const lightColors = {
  background: {
    primary: palette.white,
    secondary: palette.gray[50],
    tertiary: palette.gray[100],
    inverse: palette.gray[900],
  },
  text: {
    primary: palette.gray[900],
    secondary: palette.gray[600],
    tertiary: palette.gray[400],
    disabled: palette.gray[300],
    inverse: palette.white,
  },
  border: {
    default: palette.gray[200],
    strong: palette.gray[300],
    subtle: palette.gray[100],
  },
  surface: {
    default: palette.white,
    raised: palette.white,
    overlay: "rgba(0, 0, 0, 0.5)",
  },
  interactive: {
    default: palette.blue[600],
    hover: palette.blue[700],
    pressed: palette.blue[800],
    disabled: palette.gray[300],
  },
  stock: {
    high: palette.green[500],
    medium: palette.yellow[500],
    low: palette.orange[500],
    critical: palette.red[500],
    soldOut: palette.gray[400],
  },
  semantic: {
    success: palette.green[500],
    successBg: palette.green[50],
    warning: palette.yellow[500],
    warningBg: palette.yellow[50],
    error: palette.red[500],
    errorBg: palette.red[50],
    info: palette.blue[500],
    infoBg: palette.blue[50],
  },
} as const;

// ─────────────────────────────────────────
// Semantic Colors — Dark Mode (1:1 대응)
// 배경: 순수 블랙 대신 쿨그레이 사용
// 그림자: 명도 차이(Elevated)로 대체
// ─────────────────────────────────────────

export const darkColors = {
  background: {
    primary: palette.coolGray[900],
    secondary: palette.coolGray[800],
    tertiary: palette.coolGray[700],
    inverse: palette.gray[100],
  },
  text: {
    primary: palette.gray[50],
    secondary: palette.gray[400],
    tertiary: palette.gray[500],
    disabled: palette.gray[600],
    inverse: palette.gray[900],
  },
  border: {
    default: palette.coolGray[600],
    strong: palette.gray[500],
    subtle: palette.coolGray[700],
  },
  surface: {
    default: palette.coolGray[900],
    raised: palette.coolGray[800],
    overlay: "rgba(0, 0, 0, 0.7)",
  },
  interactive: {
    default: palette.blue[400],
    hover: palette.blue[300],
    pressed: palette.blue[500],
    disabled: palette.gray[600],
  },
  stock: {
    high: palette.green[400],
    medium: palette.yellow[400],
    low: palette.orange[400],
    critical: palette.red[400],
    soldOut: palette.gray[500],
  },
  semantic: {
    success: palette.green[400],
    successBg: "rgba(34, 197, 94, 0.15)",
    warning: palette.yellow[400],
    warningBg: "rgba(234, 179, 8, 0.15)",
    error: palette.red[400],
    errorBg: "rgba(239, 68, 68, 0.15)",
    info: palette.blue[400],
    infoBg: "rgba(59, 130, 246, 0.15)",
  },
} as const;

// 하위 호환: 기존 colors export 유지
export const colors = lightColors;

// ─────────────────────────────────────────
// Spacing
// ─────────────────────────────────────────

export const spacing = {
  0: "0px",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  3.5: "14px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
} as const;

// ─────────────────────────────────────────
// Typography
// ─────────────────────────────────────────

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

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const lineHeight = {
  tight: "1.25",
  normal: "1.5",
  relaxed: "1.75",
} as const;

// ─────────────────────────────────────────
// Shadow (다크모드에서는 명도 차이로 대체)
// ─────────────────────────────────────────

export const shadow = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  md: "0 4px 8px rgba(0, 0, 0, 0.08)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.12)",
} as const;

// ─────────────────────────────────────────
// Border Radius
// ─────────────────────────────────────────

export const borderRadius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

// ─────────────────────────────────────────
// Animation (prefers-reduced-motion 대응 포함)
// ─────────────────────────────────────────

export const animation = {
  duration: {
    fast: "150ms",
    normal: "250ms",
    slow: "350ms",
  },
  easing: {
    easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
    easeInOut: "cubic-bezier(0.45, 0, 0.55, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
} as const;

// ─────────────────────────────────────────
// Breakpoints
// ─────────────────────────────────────────

export const breakpoints = {
  mobile: "360px",
  tablet: "768px",
  desktop: "1280px",
} as const;
