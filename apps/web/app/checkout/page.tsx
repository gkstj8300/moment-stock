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
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-base font-medium text-[#a1a1aa]">결제할 상품이 없어요</p>
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
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#fa2454]">
          Checkout
        </span>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0a0a0a]">결제</h1>
      </div>

      <div className="space-y-4 overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <span className="text-[#71717a]">
              {item.productName} × {item.quantity}
            </span>
            <span className="font-semibold text-[#0a0a0a] tabular-nums">
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
        <div className="border-t border-black/[0.04] pt-4">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-[#0a0a0a]">총 결제 금액</span>
            <span className="text-2xl font-bold tracking-tight text-[#fa2454] tabular-nums">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-[#fde8ec] px-5 py-3.5 text-sm font-medium text-[#fa2454]" role="alert">
          {error}
        </div>
      )}

      <Button
        size="lg"
        onClick={handleCheckout}
        loading={loading}
        disabled={!isOnline}
        className="w-full text-base"
      >
        {!isOnline ? "오프라인 상태예요" : "결제하기"}
      </Button>
    </div>
  );
}
