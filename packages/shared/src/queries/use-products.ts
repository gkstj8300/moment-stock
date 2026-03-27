import { useQuery } from "@tanstack/react-query";
import { productKeys } from "./keys";
import type { SupabaseClient } from "../supabase/client";
import type { ProductWithStock } from "../types/entities";
import { getStockLevel } from "../utils";

export function useProducts(supabase: SupabaseClient) {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: async (): Promise<ProductWithStock[]> => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          stocks (quantity, initial_quantity)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((p) => {
        const stock = Array.isArray(p.stocks) ? p.stocks[0] : p.stocks;
        const quantity = stock?.quantity ?? 0;
        const initialQuantity = stock?.initial_quantity ?? 1;

        return {
          id: p.id,
          name: p.name,
          description: p.description,
          imageUrl: p.image_url,
          originalPrice: p.original_price,
          isActive: p.is_active,
          createdAt: p.created_at,
          stock: {
            productId: p.id,
            quantity,
            initialQuantity,
            stockPercentage: Math.round((quantity / initialQuantity) * 100),
            level: getStockLevel(quantity, initialQuantity),
          },
        };
      });
    },
  });
}

export function useProductDetail(supabase: SupabaseClient, productId: string) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async (): Promise<ProductWithStock | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          stocks (quantity, initial_quantity)
        `)
        .eq("id", productId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const stock = Array.isArray(data.stocks) ? data.stocks[0] : data.stocks;
      const quantity = stock?.quantity ?? 0;
      const initialQuantity = stock?.initial_quantity ?? 1;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        imageUrl: data.image_url,
        originalPrice: data.original_price,
        isActive: data.is_active,
        createdAt: data.created_at,
        stock: {
          productId: data.id,
          quantity,
          initialQuantity,
          stockPercentage: Math.round((quantity / initialQuantity) * 100),
          level: getStockLevel(quantity, initialQuantity),
        },
      };
    },
    enabled: !!productId,
  });
}
