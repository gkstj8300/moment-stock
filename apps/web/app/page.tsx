"use client";

import Link from "next/link";
import { useProducts } from "@repo/shared";
import { useSupabase } from "./_providers/supabase-provider";
import { ProductCard } from "./_components/organisms";
import { CountdownTimer } from "./_components/molecules";
import { Skeleton } from "./_components/atoms";
import {
  Zap,
  Tag,
  Clock,
  Gift,
  Flame,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

const CATEGORIES = [
  { icon: Zap, label: "타임세일", href: "/time-sale" },
  { icon: Flame, label: "베스트", href: "/products" },
  { icon: Tag, label: "특가", href: "/products" },
  { icon: Gift, label: "신상품", href: "/products" },
  { icon: Clock, label: "마감임박", href: "/products" },
  { icon: ShoppingBag, label: "전체상품", href: "/products" },
  { icon: Star, label: "추천", href: "/products" },
  { icon: Truck, label: "무료배송", href: "/products" },
];

export default function HomePage() {
  const supabase = useSupabase();
  const { data: products, isLoading, error } = useProducts(supabase);

  return (
    <div className="space-y-10">
      {/* 1. 메인 비주얼 배너 */}
      <section
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#fa2454] to-[#ff6b81] px-8 py-10 text-white sm:px-12 sm:py-14"
        aria-label="타임 세일 배너"
      >
        <div className="relative z-10 max-w-lg">
          <p className="text-sm font-medium opacity-80">기간한정 특가</p>
          <h2 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">
            타임 세일 진행 중
          </h2>
          <p className="mt-3 text-base leading-relaxed opacity-90">
            지금 바로 특가 상품을 만나보세요.
            <br className="hidden sm:block" />
            한정 수량, 선착순 마감!
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div>
              <span className="text-xs opacity-75">세일 종료까지</span>
              <div className="mt-1">
                <CountdownTimer
                  endsAt={new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()}
                />
              </div>
            </div>
            <Link
              href="/time-sale"
              className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#fa2454] shadow-sm transition-all hover:shadow-md hover:scale-[1.02] motion-reduce:hover:scale-100 motion-reduce:transition-none"
            >
              지금 보러가기 →
            </Link>
          </div>
        </div>
        {/* 배경 장식 */}
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute -bottom-6 right-16 h-32 w-32 rounded-full bg-white/5" aria-hidden="true" />
      </section>

      {/* 2. 카테고리 퀵 메뉴 */}
      <section aria-label="카테고리">
        <h2 className="sr-only">카테고리</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:justify-center sm:gap-4">
          {CATEGORIES.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex min-w-[72px] flex-shrink-0 flex-col items-center gap-2 rounded-xl px-3 py-3 text-center transition-colors hover:bg-gray-50 motion-reduce:transition-none"
              aria-label={label}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff5f7]">
                <Icon className="h-5 w-5 text-[#fa2454]" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. 큐레이션 상품 그리드 */}
      <section aria-label="추천 상품">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">오늘의 추천</h2>
          <Link
            href="/products"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            전체보기 &gt;
          </Link>
        </div>

        {isLoading && (
          <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-[#f0f0f0] bg-white p-0">
                <Skeleton className="aspect-square w-full rounded-t-xl" />
                <div className="space-y-2 px-3 pb-3">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-5 w-2/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600" role="alert">
            상품을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </div>
        )}

        {products && products.length === 0 && (
          <p className="py-16 text-center text-base text-gray-400">
            등록된 상품이 없어요
          </p>
        )}

        {products && products.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} href={`/products/${product.id}`}>
                <ProductCard.Image src={product.imageUrl} alt={product.name} />
                <ProductCard.Info>
                  <ProductCard.Name>{product.name}</ProductCard.Name>
                  <ProductCard.Price original={product.originalPrice} />
                  {product.stock.quantity <= 5 && product.stock.quantity > 0 && (
                    <span className="inline-block rounded bg-[#fde8ec] px-2 py-0.5 text-xs font-semibold text-[#fa2454]">
                      {product.stock.quantity}개 남음
                    </span>
                  )}
                  {product.stock.quantity === 0 && (
                    <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                      품절
                    </span>
                  )}
                </ProductCard.Info>
              </ProductCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
