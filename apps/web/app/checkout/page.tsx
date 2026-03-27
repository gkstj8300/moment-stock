"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, useConnectionStore, formatPrice } from "@repo/shared";
import { useSupabase } from "../_providers/supabase-provider";

export default function CheckoutPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const isOnline = useConnectionStore((s) => s.isOnline());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        결제할 상품이 없습니다.
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!isOnline) {
      setError("네트워크 연결을 확인해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login?redirect=/checkout");
        return;
      }

      // 각 상품별로 결제 Edge Function 호출
      for (const item of items) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            },
            body: JSON.stringify({
              product_id: item.productId,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              payment_token: `mock_token_${Date.now()}`,
            }),
          }
        );

        const result = await response.json();
        if (!result.success) {
          setError(result.message ?? "결제에 실패했습니다.");
          setLoading(false);
          return;
        }
      }

      // 전체 성공
      clearCart();
      router.push("/orders");
    } catch {
      setError("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">결제</h1>

      <div className="space-y-3 rounded-lg border bg-white p-4">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between">
            <span>
              {item.productName} × {item.quantity}
            </span>
            <span className="font-semibold">
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
        <hr />
        <div className="flex justify-between text-lg font-bold">
          <span>총 결제 금액</span>
          <span className="text-blue-600">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading || !isOnline}
        className="w-full min-h-[44px] rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
        aria-label={loading ? "결제 처리 중" : "결제하기"}
      >
        {loading ? "결제 처리 중..." : !isOnline ? "오프라인 상태" : "결제하기"}
      </button>
    </div>
  );
}
