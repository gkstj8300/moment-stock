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
    <div className={`group overflow-hidden rounded-lg border border-[#f0f0f0] bg-white transition-all hover:shadow-lg hover:border-transparent motion-reduce:transition-none ${className}`}>
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
    <div className="aspect-[4/3] overflow-hidden rounded-t-lg bg-gray-100">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform group-hover:scale-105 motion-reduce:transition-none"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-400">
          No Image
        </div>
      )}
    </div>
  );
}

function Info({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2.5 p-4 pt-3">{children}</div>;
}

function Name({ children }: { children: React.ReactNode }) {
  return <h3 className="truncate text-sm font-medium">{children}</h3>;
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
        <span className="text-lg font-bold text-[#fa2454]">
          {formatPrice(discounted)}
        </span>
        <span className="text-xs text-gray-400 line-through">
          {formatPrice(original)}
        </span>
      </div>
    );
  }

  return <p className="text-lg font-bold">{formatPrice(original)}</p>;
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
