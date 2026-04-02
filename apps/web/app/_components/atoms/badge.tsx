"use client";

import { memo } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  pulse?: boolean;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-[#f4f4f5] text-[#52525b]",
  success: "bg-[#dcfce7] text-[#16a34a]",
  warning: "bg-[#fef9c3] text-[#a16207]",
  error: "bg-[#fde8ec] text-[#fa2454]",
  info: "bg-[#dbeafe] text-[#2563eb]",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export const Badge = memo(function Badge({
  variant = "default",
  size = "sm",
  pulse = false,
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold tracking-tight ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${pulse ? "animate-pulse motion-reduce:animate-none" : ""}`}
    >
      {children}
    </span>
  );
});
