import { useQuery } from "@tanstack/react-query";
import { orderKeys } from "./keys";
import type { SupabaseClient } from "../supabase/client";
import type { Order } from "../types/entities";

export function useOrders(supabase: SupabaseClient, userId: string) {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((o) => ({
        id: o.id,
        userId: o.user_id,
        productId: o.product_id,
        quantity: o.quantity,
        unitPrice: o.unit_price,
        totalPrice: o.total_price,
        status: o.status as Order["status"],
        paymentId: o.payment_id,
        createdAt: o.created_at,
      }));
    },
    enabled: !!userId,
  });
}
