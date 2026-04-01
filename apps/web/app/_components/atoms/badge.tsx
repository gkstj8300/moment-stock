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
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-sm",
};

export const Badge = memo(function Badge({
  variant = "default",
  size = "sm",
  pulse = false,
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${pulse ? "animate-pulse motion-reduce:animate-none" : ""}`}
    >
      {children}
    </span>
  );
});
