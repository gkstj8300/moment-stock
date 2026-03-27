"use client";

import { useOrders, formatPrice } from "@repo/shared";
import { useSupabase } from "../_providers/supabase-provider";
import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  pending: "결제 대기",
  confirmed: "결제 완료",
  cancelled: "취소됨",
  refunded: "환불됨",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
  refunded: "bg-red-100 text-red-800",
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
      <div className="py-12 text-center text-gray-500">
        로그인이 필요합니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">주문 내역</h1>

      {isLoading && (
        <div className="py-12 text-center text-gray-500" role="status">
          주문 내역을 불러오는 중...
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">
          주문 내역을 불러오지 못했습니다.
        </div>
      )}

      {orders && orders.length === 0 && (
        <p className="py-12 text-center text-gray-500">주문 내역이 없습니다.</p>
      )}

      {orders && orders.length > 0 && (
        <ul className="space-y-3" role="list">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between rounded-lg border bg-white p-4"
            >
              <div>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                </p>
                <p className="font-medium">
                  {formatPrice(order.totalPrice)} ({order.quantity}개)
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status] ?? ""}`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
