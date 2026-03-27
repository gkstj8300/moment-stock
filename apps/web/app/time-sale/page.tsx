"use client";

import Link from "next/link";
import { useActiveTimeSales, formatPrice } from "@repo/shared";
import { useSupabase } from "../_providers/supabase-provider";
import { CountdownTimer, StockDisplay } from "../_components/urgency";

export default function TimeSalePage() {
  const supabase = useSupabase();
  const { data: sales, isLoading, error } = useActiveTimeSales(supabase);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
        <h1 className="text-2xl font-bold">타임 세일</h1>
        <p className="mt-1 text-sm opacity-90">한정 시간, 한정 수량 특가</p>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-gray-500" role="status">
          타임 세일을 불러오는 중...
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">
          타임 세일을 불러오지 못했습니다.
        </div>
      )}

      {sales && sales.length === 0 && (
        <p className="py-12 text-center text-gray-500">
          현재 진행 중인 타임 세일이 없습니다.
        </p>
      )}

      {sales && sales.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {sales.map((sale) => (
            <Link
              key={sale.id}
              href={`/products/${sale.productId}`}
              className="block rounded-lg border bg-white p-5 transition-shadow hover:shadow-md"
              aria-label={`${sale.productName}, ${sale.discountRate}% 할인`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
                  {sale.discountRate}% OFF
                </span>
                <CountdownTimer endsAt={sale.endsAt} />
              </div>

              <h3 className="text-lg font-semibold">{sale.productName}</h3>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(sale.originalPrice)}
                </span>
                <span className="text-xl font-bold text-red-600">
                  {formatPrice(sale.salePrice)}
                </span>
              </div>

              <div className="mt-3">
                <StockDisplay
                  quantity={sale.currentStock}
                  initialQuantity={sale.initialStock}
                  percentage={sale.stockPercentage}
                  level={
                    sale.currentStock <= 0
                      ? "soldOut"
                      : sale.stockPercentage > 50
                        ? "high"
                        : sale.stockPercentage > 20
                          ? "medium"
                          : sale.stockPercentage > 5
                            ? "low"
                            : "critical"
                  }
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
