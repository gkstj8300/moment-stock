"use client";

import { useProducts } from "@repo/shared";
import { useSupabase } from "../_providers/supabase-provider";
import { ProductCard } from "../_components/product-card";

export default function ProductsPage() {
  const supabase = useSupabase();
  const { data: products, isLoading, error } = useProducts(supabase);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">상품 목록</h1>
        <span className="text-sm text-gray-500">
          {products ? `${products.length}개 상품` : ""}
        </span>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-gray-500" role="status">
          잠시만요...
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">
          상품을 불러오지 못했습니다.
        </div>
      )}

      {products && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
