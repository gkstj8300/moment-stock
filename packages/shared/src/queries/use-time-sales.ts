import { useQuery } from "@tanstack/react-query";
import { timeSaleKeys } from "./keys";
import type { SupabaseClient } from "../supabase/client";
import type { TimeSale } from "../types/entities";

export function useActiveTimeSales(supabase: SupabaseClient) {
  return useQuery({
    queryKey: timeSaleKeys.active(),
    queryFn: async (): Promise<TimeSale[]> => {
      const { data, error } = await supabase.rpc("get_active_time_sales");

      if (error) throw error;

      return ((data as unknown as TimeSale[]) ?? []).map((ts) => ({
        id: ts.id,
        productId: ts.productId,
        productName: ts.productName,
        imageUrl: ts.imageUrl,
        originalPrice: ts.originalPrice,
        salePrice: ts.salePrice,
        discountRate: ts.discountRate,
        currentStock: ts.currentStock,
        initialStock: ts.initialStock,
        stockPercentage: ts.stockPercentage,
        startsAt: ts.startsAt,
        endsAt: ts.endsAt,
        isActive: ts.isActive,
      }));
    },
  });
}
