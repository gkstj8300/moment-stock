"use client";

import Link from "next/link";
import { useProducts } from "@repo/shared";
import { useSupabase } from "./_providers/supabase-provider";
import { ProductCard } from "./_components/organisms";
import { CountdownTimer } from "./_components/molecules";
import { Skeleton } from "./_components/atoms";

export default function HomePage() {
  const supabase = useSupabase();
  const { data: products, isLoading, error } = useProducts(supabase);

  return (
    <div className="space-y-10">
      {/* 타임세일 프로모션 배너 */}
      <section
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#fa2454] to-[#ff6b81] p-8 text-white sm:p-10"
        aria-label="타임 세일 배너"
      >
        <div className="relative z-10">
          <h2 className="text-3xl font-bold sm:text-4xl">타임 세일 진행 중</h2>
          <p className="mt-2 text-base opacity-90">
            지금 바로 특가 상품을 만나보세요
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div>
              <span className="text-xs opacity-75">세일 종료까지</span>
              <div className="mt-1">
                <CountdownTimer
                  endsAt={new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()}
                />
              </div>
            </div>
            <Link
              href="/time-sale"
              className="ml-auto rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[#fa2454] transition-opacity hover:opacity-90 motion-reduce:transition-none"
            >
              지금 보러가기 →
            </Link>
          </div>
        </div>
        {/* 배경 장식 */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/5" />
      </section>

      {/* 오늘의 추천 */}
      <section aria-label="상품 목록">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">오늘의 추천</h2>
          <Link
            href="/products"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            전체보기 &gt;
          </Link>
        </div>

        {isLoading && (
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
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
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600" role="alert">
            상품을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </div>
        )}

        {products && products.length === 0 && (
          <p className="py-16 text-center text-base text-gray-500">
            등록된 상품이 없어요
          </p>
        )}

        {products && products.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
      </section>
    </div>
  );
}
