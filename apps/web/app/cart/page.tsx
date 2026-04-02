"use client";

import Link from "next/link";
import { useCartStore, formatPrice } from "@repo/shared";
import { Button } from "../_components/atoms";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());

  if (items.length === 0) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-base text-gray-500">아직 담은 상품이 없어요</p>
        <Link href="/products">
          <Button variant="primary">쇼핑하러 가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">장바구니</h1>
        <button
          type="button"
          onClick={clearCart}
          className="min-h-[44px] text-sm text-red-500 hover:underline"
          aria-label="장바구니 비우기"
        >
          전체 삭제
        </button>
      </div>

      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white" role="list">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-400">
                  No Image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-gray-900">{item.productName}</p>
              <p className="text-sm text-gray-500">{formatPrice(item.unitPrice)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label="수량 감소"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold tabular-nums">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label="수량 증가"
              >
                +
              </button>
            </div>

            <p className="w-24 text-right font-semibold text-gray-900 tabular-nums">
              {formatPrice(item.unitPrice * item.quantity)}
            </p>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              aria-label={`${item.productName} 삭제`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5">
        <span className="text-lg font-bold text-gray-900">총 결제 금액</span>
        <span className="text-2xl font-bold text-blue-600 tabular-nums">
          {formatPrice(totalPrice)}
        </span>
      </div>

      <Link href="/checkout" className="block">
        <Button size="lg" className="w-full">
          결제하기
        </Button>
      </Link>
    </div>
  );
}
