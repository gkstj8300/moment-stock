"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 motion-reduce:animate-none ${className}`}
      role="status"
      aria-label="로딩 중"
    />
  );
}
