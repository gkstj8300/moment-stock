"use client";

import { useParams } from "next/navigation";
import {
  useProductDetail,
  formatPrice,
  useCartStore,
} from "@repo/shared";
import type { CartItem } from "@repo/shared";
import { useSupabase } from "../../_providers/supabase-provider";
import { StockDisplay } from "../../_components/urgency";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const supabase = useSupabase();
  const { data: product, isLoading, error } = useProductDetail(supabase, productId);
  const addItem = useCartStore((s) => s.addItem);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-gray-500" role="status">
        상품 정보를 불러오는 중...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">
        상품을 찾을 수 없습니다.
      </div>
    );
  }

  const isSoldOut = product.stock.level === "soldOut";

  const handleAddToCart = () => {
    const item: CartItem = {
      productId: product.id,
      productName: product.name,
      unitPrice: product.originalPrice,
      quantity: 1,
      imageUrl: product.imageUrl,
    };
    addItem(item);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* 이미지 */}
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
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
          <h1 className="text-2xl font-bold">{product.name}</h1>
          {product.description && (
            <p className="mt-2 text-gray-600">{product.description}</p>
          )}
        </div>

        <p className="text-3xl font-bold">{formatPrice(product.originalPrice)}</p>

        {/* 재고 표시 (Phase 5에서 실시간 데이터 연결) */}
        <StockDisplay
          quantity={product.stock.quantity}
          initialQuantity={product.stock.initialQuantity}
          percentage={product.stock.stockPercentage}
          level={product.stock.level}
        />

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className="w-full min-h-[44px] rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 motion-reduce:transition-none"
          aria-label={isSoldOut ? "품절된 상품입니다" : `${product.name} 장바구니에 담기`}
        >
          {isSoldOut ? "품절" : "장바구니에 담기"}
        </button>
      </div>
    </div>
  );
}
