"use client";

import Link from "next/link";
import { useCartStore, formatPrice } from "@repo/shared";
import { Button } from "../_components/atoms";
import { useScrollRevealAll } from "../_hooks/use-scroll-reveal";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const containerRef = useScrollRevealAll();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#f4f4f5]">
          <svg className="h-8 w-8 text-[#a1a1aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="text-base font-medium text-[#a1a1aa]">아직 담은 상품이 없어요</p>
        <Link href="/products">
          <Button variant="primary" size="lg">쇼핑하러 가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8">
      <div className="reveal flex items-end justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#fa2454]">
            Cart
          </span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0a0a0a]">장바구니</h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="min-h-[44px] rounded-xl px-3 text-sm font-medium text-[#a1a1aa] spring-transition hover:bg-[#fde8ec] hover:text-[#fa2454]"
          aria-label="장바구니 비우기"
        >
          전체 삭제
        </button>
      </div>

      <ul className="reveal divide-y divide-black/[0.04] overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm" role="list">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-5 spring-transition hover:bg-black/[0.01]">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#f4f4f5]">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#a1a1aa]">
                  No Image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-[#0a0a0a]">{item.productName}</p>
              <p className="mt-0.5 text-sm text-[#a1a1aa] tabular-nums">{formatPrice(item.unitPrice)}</p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.08] text-[#71717a] spring-transition hover:bg-[#f4f4f5]"
                aria-label="수량 감소"
              >
                −
              </button>
              <span className="w-9 text-center text-sm font-bold tabular-nums text-[#0a0a0a]">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.08] text-[#71717a] spring-transition hover:bg-[#f4f4f5]"
                aria-label="수량 증가"
              >
                +
              </button>
            </div>

            <p className="w-28 text-right text-lg font-bold text-[#0a0a0a] tabular-nums">
              {formatPrice(item.unitPrice * item.quantity)}
            </p>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#a1a1aa] spring-transition hover:bg-[#fde8ec] hover:text-[#fa2454]"
              aria-label={`${item.productName} 삭제`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {/* 결제 요약 */}
      <div className="reveal overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-[#0a0a0a]">총 결제 금액</span>
          <span className="text-3xl font-bold tracking-tight text-[#fa2454] tabular-nums">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      <div className="reveal">
        <Link href="/checkout" className="block">
          <Button size="lg" className="w-full text-base">
            결제하기
          </Button>
        </Link>
      </div>
    </div>
  );
}
