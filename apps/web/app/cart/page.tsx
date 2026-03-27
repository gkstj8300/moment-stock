"use client";

import Link from "next/link";
import { useCartStore, formatPrice } from "@repo/shared";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());

  if (items.length === 0) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-gray-500">장바구니가 비어 있습니다.</p>
        <Link
          href="/products"
          className="inline-block min-h-[44px] rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">장바구니</h1>
        <button
          type="button"
          onClick={clearCart}
          className="min-h-[44px] text-sm text-red-500 hover:underline"
          aria-label="장바구니 비우기"
        >
          전체 삭제
        </button>
      </div>

      <ul className="divide-y rounded-lg border bg-white" role="list">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
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

            <div className="flex-1">
              <p className="font-medium">{item.productName}</p>
              <p className="text-sm text-gray-500">{formatPrice(item.unitPrice)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded border hover:bg-gray-100"
                aria-label="수량 감소"
              >
                -
              </button>
              <span className="w-8 text-center tabular-nums">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded border hover:bg-gray-100"
                aria-label="수량 증가"
              >
                +
              </button>
            </div>

            <p className="w-24 text-right font-semibold">
              {formatPrice(item.unitPrice * item.quantity)}
            </p>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500"
              aria-label={`${item.productName} 삭제`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between rounded-lg border bg-white p-4">
        <span className="text-lg font-bold">총 결제 금액</span>
        <span className="text-2xl font-bold text-blue-600">
          {formatPrice(totalPrice)}
        </span>
      </div>
    </div>
  );
}
