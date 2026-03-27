"use client";

import Link from "next/link";
import { useCartStore } from "@repo/shared";

export function Header() {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold" aria-label="홈으로 이동">
          moment-stock
        </Link>

        <nav className="flex items-center gap-4" aria-label="메인 네비게이션">
          <Link
            href="/products"
            className="text-sm hover:underline"
          >
            상품
          </Link>
          <Link
            href="/cart"
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-sm hover:underline"
            aria-label={`장바구니${totalItems > 0 ? `, ${totalItems}개 상품` : ""}`}
          >
            장바구니
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {totalItems}
              </span>
            )}
          </Link>
          <Link
            href="/auth/login"
            className="min-h-[44px] flex items-center text-sm hover:underline"
          >
            로그인
          </Link>
        </nav>
      </div>
    </header>
  );
}
