"use client";

import { useState } from "react";
import { useProducts } from "@repo/shared";
import { useSupabase } from "../_providers/supabase-provider";
import { ProductCard } from "../_components/organisms";
import { Skeleton } from "../_components/atoms";

const SORT_OPTIONS = ["추천순", "가격낮은순", "가격높은순", "신상품순"] as const;

export default function ProductsPage() {
  const supabase = useSupabase();
  const { data: products, isLoading, error } = useProducts(supabase);
  const [activeSort, setActiveSort] = useState<string>("추천순");

  const sortedProducts = products ? [...products].sort((a, b) => {
    if (activeSort === "가격낮은순") return a.originalPrice - b.originalPrice;
    if (activeSort === "가격높은순") return b.originalPrice - a.originalPrice;
    return 0;
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">전체 상품</h1>
        <span className="text-sm text-gray-500">
          {products ? `${products.length}개 상품` : ""}
        </span>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-1 border-b border-[#f0f0f0]">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setActiveSort(option)}
            className={`min-h-[44px] px-4 text-sm font-medium transition-colors motion-reduce:transition-none ${
              activeSort === option
                ? "border-b-2 border-[#fa2454] text-[#fa2454]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-lg bg-white p-3 shadow-sm">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600" role="alert">
          상품을 불러오지 못했어요
        </div>
      )}

      {products && products.length === 0 && (
        <p className="py-16 text-center text-base text-gray-500">
          등록된 상품이 없어요
        </p>
      )}

      {sortedProducts.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} href={`/products/${product.id}`}>
              <ProductCard.Image src={product.imageUrl} alt={product.name} />
              <ProductCard.Info>
                <ProductCard.Name>{product.name}</ProductCard.Name>
                <ProductCard.Price original={product.originalPrice} />
                {product.stock.quantity <= 5 && product.stock.quantity > 0 && (
                  <span className="inline-block rounded bg-[#fde8ec] px-2 py-0.5 text-xs font-semibold text-[#fa2454]">
                    {product.stock.quantity}개 남음
                  </span>
                )}
                {product.stock.quantity === 0 && (
                  <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
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
