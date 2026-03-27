"use client";

import Link from "next/link";
import { formatPrice } from "@repo/shared";
import type { ProductWithStock } from "@repo/shared";
import { StockDisplay } from "./urgency";

interface ProductCardProps {
  product: ProductWithStock;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md"
      aria-label={`${product.name}, ${formatPrice(product.originalPrice)}`}
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105 motion-reduce:transition-none"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <h3 className="truncate text-sm font-medium">{product.name}</h3>
        <p className="text-lg font-bold">{formatPrice(product.originalPrice)}</p>
        <StockDisplay
          quantity={product.stock.quantity}
          initialQuantity={product.stock.initialQuantity}
          percentage={product.stock.stockPercentage}
          level={product.stock.level}
        />
      </div>
    </Link>
  );
}
