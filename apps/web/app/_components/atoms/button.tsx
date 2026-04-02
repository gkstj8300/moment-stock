"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  loading?: boolean;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-[36px] px-3 py-1.5 text-sm",
  md: "min-h-[44px] px-4 py-2.5 text-base",
  lg: "min-h-[48px] px-6 py-3 text-lg",
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[#fa2454] text-white hover:bg-[#e01e4a] active:bg-[#c91a40] disabled:bg-gray-300 disabled:text-gray-500",
  secondary:
    "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-300",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      size = "md",
      variant = "primary",
      loading = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center rounded-lg font-semibold transition-colors motion-reduce:transition-none ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
        {...props}
      >
        {loading ? "처리 중..." : children}
      </button>
    );
  }
);
