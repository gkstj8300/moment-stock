"use client";

import { memo } from "react";
import Link from "next/link";
import { formatPrice } from "@repo/shared";
import type { StockLevel } from "@repo/shared";
import { CountdownTimer, StockDisplay } from "../molecules";
import { Badge } from "../atoms";

// ─────────────────────────────────────────
// Root
// ─────────────────────────────────────────

interface TimeSaleCardRootProps {
  href: string;
  children: React.ReactNode;
}

function TimeSaleCardRoot({ href, children }: TimeSaleCardRootProps) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] spring-transition hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-transparent hover:-translate-y-1"
    >
      {children}
    </Link>
  );
}

// ─────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────

function Header({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">{children}</div>
  );
}

function DiscountBadge({ rate }: { rate: number }) {
  return (
    <Badge variant="error" size="md">
      {rate}% OFF
    </Badge>
  );
}

function Timer({ endsAt }: { endsAt: string }) {
  return <CountdownTimer endsAt={endsAt} />;
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-bold tracking-tight text-[#0a0a0a]">
      {children}
    </h3>
  );
}

function Price({
  original,
  sale,
}: {
  original: number;
  sale: number;
}) {
  return (
    <div className="mt-3 flex items-baseline gap-2.5">
      <span className="text-sm text-[#a1a1aa] line-through tabular-nums">
        {formatPrice(original)}
      </span>
      <span className="text-2xl font-bold tracking-tight text-[#fa2454] tabular-nums">
        {formatPrice(sale)}
      </span>
    </div>
  );
}

function Stock({
  quantity,
  initialQuantity,
  percentage,
  level,
}: {
  quantity: number;
  initialQuantity: number;
  percentage: number;
  level: StockLevel;
}) {
  return (
    <div className="mt-4">
      <StockDisplay
        quantity={quantity}
        initialQuantity={initialQuantity}
        percentage={percentage}
        level={level}
      />
    </div>
  );
}

// ─────────────────────────────────────────
// Compound Export
// ─────────────────────────────────────────

export const TimeSaleCard = Object.assign(memo(TimeSaleCardRoot), {
  Header,
  DiscountBadge: memo(DiscountBadge),
  Timer: memo(Timer),
  Title,
  Price: memo(Price),
  Stock: memo(Stock),
});
