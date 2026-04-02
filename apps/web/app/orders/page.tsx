"use client";

import { useOrders, formatPrice } from "@repo/shared";
import { useSupabase } from "../_providers/supabase-provider";
import { useEffect, useState } from "react";
import { Badge, Skeleton } from "../_components/atoms";
import { useScrollRevealAll } from "../_hooks/use-scroll-reveal";

const STATUS_LABELS: Record<string, string> = {
  pending: "결제 대기",
  confirmed: "결제 완료",
  cancelled: "취소됨",
  refunded: "환불됨",
};

const STATUS_VARIANTS: Record<string, "default" | "success" | "warning" | "error"> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "default",
  refunded: "error",
};

export default function OrdersPage() {
  const supabase = useSupabase();
  const [userId, setUserId] = useState<string | null>(null);
  const containerRef = useScrollRevealAll();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  const { data: orders, isLoading, error } = useOrders(supabase, userId ?? "");

  if (!userId) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-base font-medium text-[#a1a1aa]">로그인이 필요해요</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8">
      <div className="reveal">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#fa2454]">
          Orders
        </span>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0a0a0a]">주문 내역</h1>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white p-5">
              <div className="space-y-2.5">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-6 w-32 rounded" />
              </div>
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-[#fde8ec] p-5 text-sm font-medium text-[#fa2454]" role="alert">
          주문 내역을 불러오지 못했어요
        </div>
      )}

      {orders && orders.length === 0 && (
        <p className="py-20 text-center text-base text-[#a1a1aa]">
          아직 주문 내역이 없어요
        </p>
      )}

      {orders && orders.length > 0 && (
        <ul className="stagger-children space-y-3" role="list">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] spring-transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
            >
              <div>
                <p className="text-xs font-medium text-[#a1a1aa]">
                  {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                </p>
                <p className="mt-1.5 text-lg font-bold text-[#0a0a0a] tabular-nums">
                  {formatPrice(order.totalPrice)}{" "}
                  <span className="text-sm font-normal text-[#a1a1aa]">
                    ({order.quantity}개)
                  </span>
                </p>
              </div>
              <Badge variant={STATUS_VARIANTS[order.status] ?? "default"} size="md">
                {STATUS_LABELS[order.status] ?? order.status}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
