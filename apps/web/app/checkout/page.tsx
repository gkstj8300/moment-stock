"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, useConnectionStore, formatPrice } from "@repo/shared";
import { useSupabase } from "../_providers/supabase-provider";
import { useToastStore } from "../_components/molecules/toast";
import { Button } from "../_components/atoms";

export default function CheckoutPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const isOnline = useConnectionStore((s) => s.isOnline());
  const showToast = useToastStore((s) => s.show);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-base text-gray-500">결제할 상품이 없어요</p>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!isOnline) {
      setError("인터넷 연결을 확인해주세요.");
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
          setError(result.message ?? "결제에 실패했어요. 다시 시도해주세요.");
          setLoading(false);
          return;
        }
      }

      clearCart();
      showToast("구매 완료!", "success");
      router.push("/orders");
    } catch {
      setError("결제에 실패했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">결제</h1>

      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <span className="text-gray-600">
              {item.productName} × {item.quantity}
            </span>
            <span className="font-semibold text-gray-900 tabular-nums">
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
        <hr className="border-gray-100" />
        <div className="flex justify-between">
          <span className="text-lg font-bold text-gray-900">총 결제 금액</span>
          <span className="text-xl font-bold text-[#fa2454] tabular-nums">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      <Button
        size="lg"
        onClick={handleCheckout}
        loading={loading}
        disabled={!isOnline}
        className="w-full"
      >
        {!isOnline ? "오프라인 상태예요" : "결제하기"}
      </Button>
    </div>
  );
}
