"use client";

import { useOrders, formatPrice } from "@repo/shared";
import { useSupabase } from "../_providers/supabase-provider";
import { useEffect, useState } from "react";
import { Badge, Skeleton } from "../_components/atoms";

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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  const { data: orders, isLoading, error } = useOrders(supabase, userId ?? "");

  if (!userId) {
    return (
      <div className="py-16 text-center">
        <p className="text-base text-gray-500">로그인이 필요해요</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">주문 내역</h1>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600" role="alert">
          주문 내역을 불러오지 못했어요
        </div>
      )}

      {orders && orders.length === 0 && (
        <p className="py-16 text-center text-base text-gray-500">
          아직 주문 내역이 없어요
        </p>
      )}

      {orders && orders.length > 0 && (
        <ul className="space-y-3" role="list">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
            >
              <div>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                </p>
                <p className="mt-1 font-semibold text-gray-900 tabular-nums">
                  {formatPrice(order.totalPrice)}{" "}
                  <span className="text-sm font-normal text-gray-500">
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
