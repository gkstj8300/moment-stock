"use client";

import { useActiveTimeSales, getStockLevel } from "@repo/shared";
import { useSupabase } from "../_providers/supabase-provider";
import { TimeSaleCard } from "../_components/organisms";
import { Skeleton } from "../_components/atoms";
import { useScrollRevealAll } from "../_hooks/use-scroll-reveal";

export default function TimeSalePage() {
  const supabase = useSupabase();
  const { data: sales, isLoading, error } = useActiveTimeSales(supabase);
  const containerRef = useScrollRevealAll();

  return (
    <div ref={containerRef} className="space-y-10">
      {/* 히어로 배너 */}
      <section
        className="reveal relative overflow-hidden rounded-3xl bg-[#09090b] p-8 text-white sm:p-12"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(250,36,84,0.35) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(255,107,129,0.2) 0%, transparent 50%)",
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <span className="inline-block rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 backdrop-blur-sm">
            Limited Time
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">타임 세일</h1>
          <p className="mt-3 text-base text-white/50 sm:text-lg">
            한정 시간, 한정 수량 특가
          </p>
        </div>
      </section>

      {/* 세일 카드 */}
      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-2xl border border-black/[0.06] bg-white p-6">
              <div className="flex justify-between">
                <Skeleton className="h-7 w-20 rounded-md" />
                <Skeleton className="h-7 w-24 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-8 w-1/2 rounded" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-[#fde8ec] p-5 text-sm font-medium text-[#fa2454]" role="alert">
          타임 세일을 불러오지 못했어요
        </div>
      )}

      {sales && sales.length === 0 && (
        <p className="py-20 text-center text-base text-[#a1a1aa]">
          지금은 진행 중인 세일이 없어요
        </p>
      )}

      {sales && sales.length > 0 && (
        <div className="stagger-children grid gap-5 sm:grid-cols-2">
          {sales.map((sale) => {
            const level = getStockLevel(sale.currentStock, sale.initialStock);
            return (
              <TimeSaleCard key={sale.id} href={`/products/${sale.productId}`}>
                <TimeSaleCard.Header>
                  <TimeSaleCard.DiscountBadge rate={sale.discountRate} />
                  <TimeSaleCard.Timer endsAt={sale.endsAt} />
                </TimeSaleCard.Header>
                <TimeSaleCard.Title>{sale.productName}</TimeSaleCard.Title>
                <TimeSaleCard.Price
                  original={sale.originalPrice}
                  sale={sale.salePrice}
                />
                <TimeSaleCard.Stock
                  quantity={sale.currentStock}
                  initialQuantity={sale.initialStock}
                  percentage={sale.stockPercentage}
                  level={level}
                />
              </TimeSaleCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
