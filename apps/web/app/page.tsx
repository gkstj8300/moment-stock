"use client";

import { useProducts } from "@repo/shared";
import { useSupabase } from "./_providers/supabase-provider";
import { ProductCard } from "./_components/product-card";
import { CountdownTimer } from "./_components/urgency";

export default function HomePage() {
  const supabase = useSupabase();
  const { data: products, isLoading, error } = useProducts(supabase);

  return (
    <div className="space-y-8">
      {/* 타임세일 배너 */}
      <section
        className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white sm:p-8"
        aria-label="타임 세일 배너"
      >
        <h2 className="text-2xl font-bold sm:text-3xl">타임 세일 진행 중</h2>
        <p className="mt-1 text-sm opacity-90">지금 바로 특가 상품을 만나보세요</p>
        <div className="mt-4">
          <span className="text-sm opacity-75">세일 종료까지</span>
          <div className="mt-1">
            <CountdownTimer
              endsAt={new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()}
            />
          </div>
        </div>
      </section>

      {/* 상품 목록 */}
      <section aria-label="상품 목록">
        <h2 className="mb-4 text-xl font-bold">전체 상품</h2>

        {isLoading && (
          <div className="py-12 text-center text-gray-500" role="status">
            잠시만요...
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">
            상품을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </div>
        )}

        {products && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
