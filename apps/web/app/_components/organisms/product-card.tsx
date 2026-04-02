"use client";

import { createContext, memo } from "react";
import Link from "next/link";
import { formatPrice } from "@repo/shared";
import type { StockLevel } from "@repo/shared";
import { StockDisplay } from "../molecules";
import { Badge } from "../atoms";

// ─────────────────────────────────────────
// Context
// ─────────────────────────────────────────

interface ProductCardContext {
  href?: string;
}

const CardContext = createContext<ProductCardContext>({});

// ─────────────────────────────────────────
// Root
// ─────────────────────────────────────────

interface ProductCardRootProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
}

function ProductCardRoot({ href, children, className = "" }: ProductCardRootProps) {
  const content = (
    <div
      className={`group overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] spring-transition hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-transparent hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );

  if (href) {
    return (
      <CardContext.Provider value={{ href }}>
        <Link href={href} className="block">
          {content}
        </Link>
      </CardContext.Provider>
    );
  }

  return <CardContext.Provider value={{}}>{content}</CardContext.Provider>;
}

// ─────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────

function Image({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="relative aspect-square overflow-hidden bg-[#f4f4f5]">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover spring-transition group-hover:scale-[1.04]"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-[#a1a1aa]">
          No Image
        </div>
      )}
    </div>
  );
}

function Info({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2 p-4">{children}</div>;
}

function Name({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[#0a0a0a]">
      {children}
    </h3>
  );
}

function Price({
  original,
  discounted,
  discountRate,
}: {
  original: number;
  discounted?: number;
  discountRate?: number;
}) {
  if (discounted && discounted < original) {
    return (
      <div className="flex items-baseline gap-2">
        {discountRate && (
          <Badge variant="error" size="sm">
            {discountRate}%
          </Badge>
        )}
        <span className="text-lg font-bold tracking-tight text-[#fa2454] tabular-nums">
          {formatPrice(discounted)}
        </span>
        <span className="text-xs text-[#a1a1aa] line-through tabular-nums">
          {formatPrice(original)}
        </span>
      </div>
    );
  }

  return (
    <p className="text-lg font-bold tracking-tight tabular-nums">
      {formatPrice(original)}
    </p>
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
    <StockDisplay
      quantity={quantity}
      initialQuantity={initialQuantity}
      percentage={percentage}
      level={level}
    />
  );
}

// ─────────────────────────────────────────
// Compound Export
// ─────────────────────────────────────────

export const ProductCard = Object.assign(memo(ProductCardRoot), {
  Image: memo(Image),
  Info,
  Name,
  Price: memo(Price),
  Stock: memo(Stock),
});
