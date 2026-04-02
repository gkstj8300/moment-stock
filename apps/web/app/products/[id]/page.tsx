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

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const supabase = useSupabase();
  const { data: product, isLoading, error } = useProductDetail(supabase, productId);
  const addItem = useCartStore((s) => s.addItem);
  const isOnline = useConnectionStore((s) => s.isOnline());
  const showToast = useToastStore((s) => s.show);

  useRealtimeStock({ supabase, productId, enabled: !!product });

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600" role="alert">
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
    <div className="grid gap-8 md:grid-cols-2">
      {/* 이미지 */}
      <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          {product.description && (
            <p className="mt-2 text-base leading-relaxed text-gray-600">
              {product.description}
            </p>
          )}
        </div>

        <p className="text-[28px] font-bold text-gray-900">
          {formatPrice(product.originalPrice)}
        </p>

        <StockDisplay
          quantity={product.stock.quantity}
          initialQuantity={product.stock.initialQuantity}
          percentage={product.stock.stockPercentage}
          level={product.stock.level}
        />

        <Button
          size="lg"
          variant={isSoldOut ? "secondary" : "primary"}
          onClick={handleAddToCart}
          disabled={isDisabled}
          className="w-full"
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
