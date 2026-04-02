"use client";

import { useState } from "react";
import { useProducts } from "@repo/shared";
import { useSupabase } from "../_providers/supabase-provider";
import { ProductCard } from "../_components/organisms";
import { Skeleton } from "../_components/atoms";
import { useScrollRevealAll } from "../_hooks/use-scroll-reveal";

const SORT_OPTIONS = ["추천순", "가격낮은순", "가격높은순", "신상품순"] as const;

export default function ProductsPage() {
  const supabase = useSupabase();
  const { data: products, isLoading, error } = useProducts(supabase);
  const [activeSort, setActiveSort] = useState<string>("추천순");
  const containerRef = useScrollRevealAll();

  const sortedProducts = products
    ? [...products].sort((a, b) => {
        if (activeSort === "가격낮은순") return a.originalPrice - b.originalPrice;
        if (activeSort === "가격높은순") return b.originalPrice - a.originalPrice;
        return 0;
      })
    : [];

  return (
    <div ref={containerRef} className="space-y-8">
      {/* 페이지 헤더 */}
      <div className="reveal flex items-end justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#fa2454]">
            Products
          </span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0a0a0a]">
            전체 상품
          </h1>
        </div>
        <span className="text-sm font-medium tabular-nums text-[#a1a1aa]">
          {products ? `${products.length}개` : ""}
        </span>
      </div>

      {/* 필터 탭 */}
      <div className="reveal flex gap-1.5">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setActiveSort(option)}
            className={`min-h-[40px] rounded-xl px-4 text-sm font-semibold spring-transition ${
              activeSort === option
                ? "bg-[#0a0a0a] text-white shadow-sm"
                : "bg-transparent text-[#a1a1aa] hover:bg-black/[0.04] hover:text-[#52525b]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-2.5 p-4">
                <Skeleton className="h-4 w-4/5 rounded" />
                <Skeleton className="h-5 w-2/5 rounded" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-[#fde8ec] p-5 text-sm font-medium text-[#fa2454]" role="alert">
          상품을 불러오지 못했어요
        </div>
      )}

      {products && products.length === 0 && (
        <p className="py-20 text-center text-base text-[#a1a1aa]">
          등록된 상품이 없어요
        </p>
      )}

      {sortedProducts.length > 0 && (
        <div className="stagger-children grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} href={`/products/${product.id}`}>
              <ProductCard.Image src={product.imageUrl} alt={product.name} />
              <ProductCard.Info>
                <ProductCard.Name>{product.name}</ProductCard.Name>
                <ProductCard.Price original={product.originalPrice} />
                {product.stock.quantity <= 5 && product.stock.quantity > 0 && (
                  <span className="inline-block rounded-md bg-[#fde8ec] px-2 py-0.5 text-xs font-semibold text-[#fa2454]">
                    {product.stock.quantity}개 남음
                  </span>
                )}
                {product.stock.quantity === 0 && (
                  <span className="inline-block rounded-md bg-[#f4f4f5] px-2 py-0.5 text-xs font-semibold text-[#a1a1aa]">
                    품절
                  </span>
                )}
              </ProductCard.Info>
            </ProductCard>
          ))}
        </div>
      )}
    </div>
  );
}
