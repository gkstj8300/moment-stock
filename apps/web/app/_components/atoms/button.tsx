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
  sm: "min-h-[36px] px-4 py-1.5 text-sm",
  md: "min-h-[44px] px-5 py-2.5 text-base",
  lg: "min-h-[52px] px-8 py-3.5 text-lg",
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[#fa2454] text-white shadow-[0_2px_12px_rgba(250,36,84,0.3)] hover:bg-[#e01e4a] hover:shadow-[0_4px_20px_rgba(250,36,84,0.4)] active:scale-[0.98] disabled:bg-[#d4d4d8] disabled:text-[#a1a1aa] disabled:shadow-none",
  secondary:
    "border border-black/[0.08] bg-white text-[#0a0a0a] shadow-sm hover:bg-[#f4f4f5] hover:shadow-md active:scale-[0.98] disabled:bg-[#f4f4f5] disabled:text-[#a1a1aa]",
  ghost:
    "bg-transparent text-[#71717a] hover:bg-black/[0.04] hover:text-[#0a0a0a] active:scale-[0.98] disabled:text-[#d4d4d8]",
  danger:
    "bg-[#ef4444] text-white shadow-[0_2px_12px_rgba(239,68,68,0.3)] hover:bg-[#dc2626] active:scale-[0.98] disabled:bg-[#d4d4d8] disabled:text-[#a1a1aa] disabled:shadow-none",
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
        className={`inline-flex items-center justify-center rounded-xl font-semibold spring-transition ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            처리 중...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
