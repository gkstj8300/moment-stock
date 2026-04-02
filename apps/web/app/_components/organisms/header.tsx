"use client";

import Link from "next/link";
import { useCartStore } from "@repo/shared";

export function Header() {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* 상단 GNB */}
      <div className="border-b border-[#f0f0f0]">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="flex-shrink-0 text-xl font-bold text-gray-900"
            aria-label="moment-stock 홈으로 이동"
          >
            <span className="text-[#fa2454]">m</span>oment-stock
          </Link>

          {/* 검색바 */}
          <div className="hidden flex-1 sm:block">
            <div className="relative mx-auto max-w-md">
              <input
                type="search"
                placeholder="어떤 상품을 찾으시나요?"
                className="h-10 w-full rounded-lg border border-[#f0f0f0] bg-[#f7f8fa] px-4 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#fa2454] focus:bg-white focus:outline-none"
                aria-label="상품 검색"
              />
              <svg
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* 우측 아이콘 */}
          <nav className="flex items-center gap-1" aria-label="유틸 네비게이션">
            <Link
              href="/cart"
              className="relative flex min-h-[44px] min-w-[44px] items-center justify-center text-gray-600 hover:text-gray-900 transition-colors motion-reduce:transition-none"
              aria-label={`장바구니${totalItems > 0 ? `, ${totalItems}개 상품` : ""}`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute right-1 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#fa2454] text-[10px] font-bold text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            <Link
              href="/auth/login"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-gray-600 hover:text-gray-900 transition-colors motion-reduce:transition-none"
              aria-label="로그인"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </nav>
        </div>
      </div>

      {/* 서브 네비 */}
      <div className="border-b border-[#f0f0f0]">
        <nav
          className="mx-auto flex h-11 max-w-[1120px] items-center gap-6 px-4 sm:px-6"
          aria-label="카테고리 네비게이션"
        >
          <Link
            href="/time-sale"
            className="flex h-full items-center text-sm font-semibold text-[#fa2454] hover:opacity-80 transition-opacity motion-reduce:transition-none"
          >
            타임세일
          </Link>
          <Link
            href="/products"
            className="flex h-full items-center text-sm text-gray-600 hover:text-gray-900 transition-colors motion-reduce:transition-none"
          >
            베스트
          </Link>
          <Link
            href="/products"
            className="flex h-full items-center text-sm text-gray-600 hover:text-gray-900 transition-colors motion-reduce:transition-none"
          >
            신상품
          </Link>
        </nav>
      </div>
    </header>
  );
}
