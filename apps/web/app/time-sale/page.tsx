"use client";

import { useActiveTimeSales, getStockLevel } from "@repo/shared";
import { useSupabase } from "../_providers/supabase-provider";
import { TimeSaleCard } from "../_components/organisms";
import { Skeleton } from "../_components/atoms";

export default function TimeSalePage() {
  const supabase = useSupabase();
  const { data: sales, isLoading, error } = useActiveTimeSales(supabase);

  return (
    <div className="space-y-6">
      {/* 히어로 배너 */}
      <section className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white sm:p-8">
        <h1 className="text-2xl font-bold sm:text-4xl">타임 세일</h1>
        <p className="mt-1 text-base opacity-90">한정 시간, 한정 수량 특가</p>
      </section>

      {/* 세일 카드 */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600" role="alert">
          타임 세일을 불러오지 못했어요
        </div>
      )}

      {sales && sales.length === 0 && (
        <p className="py-16 text-center text-base text-gray-500">
          지금은 진행 중인 세일이 없어요
        </p>
      )}

      {sales && sales.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
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
