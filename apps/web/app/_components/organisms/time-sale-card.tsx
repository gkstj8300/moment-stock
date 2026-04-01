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
      className="block rounded-lg border bg-white p-5 transition-shadow hover:shadow-md"
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
    <div className="mb-3 flex items-center justify-between">{children}</div>
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
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

function Price({
  original,
  sale,
}: {
  original: number;
  sale: number;
}) {
  return (
    <div className="mt-2 flex items-baseline gap-2">
      <span className="text-sm text-gray-400 line-through">
        {formatPrice(original)}
      </span>
      <span className="text-xl font-bold text-red-600">
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
    <div className="mt-3">
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
