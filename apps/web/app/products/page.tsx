"use client";

import { useProducts } from "@repo/shared";
import { useSupabase } from "../_providers/supabase-provider";
import { ProductCard } from "../_components/organisms";
import { Skeleton } from "../_components/atoms";

export default function ProductsPage() {
  const supabase = useSupabase();
  const { data: products, isLoading, error } = useProducts(supabase);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">상품 목록</h1>
        <span className="text-sm text-gray-500">
          {products ? `${products.length}개 상품` : ""}
        </span>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600" role="alert">
          상품을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </div>
      )}

      {products && products.length === 0 && (
        <p className="py-12 text-center text-base text-gray-500">
          등록된 상품이 없어요
        </p>
      )}

      {products && products.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} href={`/products/${product.id}`}>
              <ProductCard.Image src={product.imageUrl} alt={product.name} />
              <ProductCard.Info>
                <ProductCard.Name>{product.name}</ProductCard.Name>
                <ProductCard.Price original={product.originalPrice} />
                <ProductCard.Stock
                  quantity={product.stock.quantity}
                  initialQuantity={product.stock.initialQuantity}
                  percentage={product.stock.stockPercentage}
                  level={product.stock.level}
                />
              </ProductCard.Info>
            </ProductCard>
          ))}
        </div>
      )}
    </div>
  );
}
