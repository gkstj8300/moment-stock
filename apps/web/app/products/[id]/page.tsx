"use client";

import { useParams } from "next/navigation";
import {
  useProductDetail,
  useRealtimeStock,
  useConnectionStore,
  formatPrice,
  useCartStore,
} from "@repo/shared";
import type { CartItem } from "@repo/shared";
import { useSupabase } from "../../_providers/supabase-provider";
import { StockDisplay } from "../../_components/molecules";
import { useToastStore } from "../../_components/molecules/toast";
import { Button, Skeleton } from "../../_components/atoms";
import { useScrollRevealAll } from "../../_hooks/use-scroll-reveal";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const supabase = useSupabase();
  const { data: product, isLoading, error } = useProductDetail(supabase, productId);
  const addItem = useCartStore((s) => s.addItem);
  const isOnline = useConnectionStore((s) => s.isOnline());
  const showToast = useToastStore((s) => s.show);
  const containerRef = useScrollRevealAll();

  useRealtimeStock({ supabase, productId, enabled: !!product });

  if (isLoading) {
    return (
      <div className="grid gap-10 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-5">
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-5 w-full rounded" />
          <Skeleton className="h-5 w-2/3 rounded" />
          <Skeleton className="h-10 w-1/3 rounded-lg" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-2xl bg-[#fde8ec] p-5 text-sm font-medium text-[#fa2454]" role="alert">
        상품을 찾을 수 없어요.
      </div>
    );
  }

  const isSoldOut = product.stock.level === "soldOut";
  const isDisabled = isSoldOut || !isOnline;

  const handleAddToCart = () => {
    const item: CartItem = {
      productId: product.id,
      productName: product.name,
      unitPrice: product.originalPrice,
      quantity: 1,
      imageUrl: product.imageUrl,
    };
    addItem(item);
    showToast("장바구니에 담았어요", "success");
  };

  return (
    <div ref={containerRef} className="grid gap-10 md:grid-cols-2">
      {/* 이미지 */}
      <div className="reveal aspect-square overflow-hidden rounded-3xl bg-[#f4f4f5]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#a1a1aa]">
            No Image
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="reveal space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0a0a0a]">
            {product.name}
          </h1>
          {product.description && (
            <p className="mt-3 text-base leading-relaxed text-[#71717a]">
              {product.description}
            </p>
          )}
        </div>

        <p className="text-[32px] font-bold tracking-tight text-[#0a0a0a] tabular-nums">
          {formatPrice(product.originalPrice)}
        </p>

        <div className="rounded-2xl border border-black/[0.06] bg-[#fafafa] p-5">
          <StockDisplay
            quantity={product.stock.quantity}
            initialQuantity={product.stock.initialQuantity}
            percentage={product.stock.stockPercentage}
            level={product.stock.level}
          />
        </div>

        <Button
          size="lg"
          variant={isSoldOut ? "secondary" : "primary"}
          onClick={handleAddToCart}
          disabled={isDisabled}
          className="w-full text-base"
          aria-label={
            !isOnline
              ? "오프라인 상태예요"
              : isSoldOut
                ? "품절된 상품이에요"
                : `${product.name} 장바구니에 담기`
          }
        >
          {!isOnline ? "오프라인" : isSoldOut ? "품절" : "장바구니에 담기"}
        </Button>
      </div>
    </div>
  );
}
