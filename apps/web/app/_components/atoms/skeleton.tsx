"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-r from-[#f4f4f5] via-[#e4e4e7] to-[#f4f4f5] bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] motion-reduce:animate-none motion-reduce:bg-[#f4f4f5] ${className}`}
      role="status"
      aria-label="로딩 중"
    />
  );
}
