import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productKeys, stockKeys } from "./keys";
import type { SupabaseClient } from "../supabase/client";
import type { PurchaseResponse } from "../types/api";
import type { PurchaseInput } from "../schemas/purchase";

export function usePurchaseMutation(supabase: SupabaseClient, userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PurchaseInput): Promise<PurchaseResponse> => {
      const { data, error } = await supabase.rpc("purchase_stock", {
        p_user_id: userId,
        p_product_id: input.productId,
        p_quantity: input.quantity,
        p_unit_price: input.unitPrice,
      });

      if (error) throw error;
      return data as unknown as PurchaseResponse;
    },

    onMutate: async (input) => {
      // 낙관적 업데이트: 재고 즉시 차감
      await queryClient.cancelQueries({ queryKey: productKeys.detail(input.productId) });
      await queryClient.cancelQueries({ queryKey: stockKeys.byProduct(input.productId) });

      const previousProduct = queryClient.getQueryData(productKeys.detail(input.productId));
      const previousProducts = queryClient.getQueryData(productKeys.lists());

      return { previousProduct, previousProducts };
    },

    onError: (_error, input, context) => {
      // 롤백: 스냅샷 복원
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.detail(input.productId), context.previousProduct);
      }
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.lists(), context.previousProducts);
      }
    },

    onSettled: (_data, _error, input) => {
      // 서버 데이터로 최종 동기화
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(input.productId) });
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: stockKeys.byProduct(input.productId) });
    },
  });
}
