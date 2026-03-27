"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { registerChannel, unregisterChannel } from "./subscription-registry";
import { createStockThrottler } from "./throttle";
import { productKeys, stockKeys } from "../queries/keys";
import { getStockLevel } from "../utils";
import type { SupabaseClient } from "../supabase/client";
import type { Stock } from "../types/entities";

interface RealtimeStockOptions {
  supabase: SupabaseClient;
  productId: string;
  enabled?: boolean;
}

/**
 * useRealtimeStock — 특정 상품의 재고 변경을 실시간 구독
 *
 * - 구독 레지스트리를 통해 동일 productId 중복 구독 방지
 * - requestAnimationFrame 기반 스로틀링
 * - 품절 이벤트(quantity=0)는 즉시 반영
 * - 뮤테이션 진행 중에는 업데이트를 지연
 */
export function useRealtimeStock({
  supabase,
  productId,
  enabled = true,
}: RealtimeStockOptions) {
  const queryClient = useQueryClient();
  const isMutatingRef = useRef(false);
  const pendingUpdateRef = useRef<Stock | null>(null);

  const applyStockUpdate = useCallback(
    (quantity: number, initialQuantity: number) => {
      const newStock: Stock = {
        productId,
        quantity,
        initialQuantity,
        stockPercentage: Math.round((quantity / initialQuantity) * 100),
        level: getStockLevel(quantity, initialQuantity),
      };

      if (isMutatingRef.current) {
        pendingUpdateRef.current = newStock;
        return;
      }

      // TanStack Query 캐시 직접 갱신
      queryClient.setQueryData(stockKeys.byProduct(productId), newStock);

      // 상품 목록/상세 캐시도 갱신
      queryClient.setQueriesData(
        { queryKey: productKeys.all },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (old: any) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return old.map((p: { id: string; stock: Stock }) =>
              p.id === productId ? { ...p, stock: newStock } : p
            );
          }
          if (old.id === productId) {
            return { ...old, stock: newStock };
          }
          return old;
        }
      );
    },
    [productId, queryClient]
  );

  useEffect(() => {
    if (!enabled || !productId) return;

    const channelKey = `product-stock:${productId}`;

    const throttler = createStockThrottler((updates) => {
      for (const update of updates) {
        applyStockUpdate(update.quantity, update.initialQuantity);
      }
    });

    const channel = registerChannel(channelKey, () =>
      supabase
        .channel(channelKey)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "stocks",
            filter: `product_id=eq.${productId}`,
          },
          (payload) => {
            const { quantity, initial_quantity } = payload.new as {
              quantity: number;
              initial_quantity: number;
            };

            throttler.push({
              productId,
              quantity,
              initialQuantity: initial_quantity,
            });
          }
        )
        .subscribe()
    );

    // channel은 레지스트리가 관리하므로 여기서는 unregister만
    void channel;

    return () => {
      throttler.destroy();
      unregisterChannel(channelKey);
    };
  }, [supabase, productId, enabled, applyStockUpdate]);

  // 뮤테이션 상태 추적 (외부에서 호출)
  const setMutating = useCallback(
    (mutating: boolean) => {
      isMutatingRef.current = mutating;
      if (!mutating && pendingUpdateRef.current) {
        const pending = pendingUpdateRef.current;
        pendingUpdateRef.current = null;
        applyStockUpdate(pending.quantity, pending.initialQuantity);
      }
    },
    [applyStockUpdate]
  );

  return { setMutating };
}
