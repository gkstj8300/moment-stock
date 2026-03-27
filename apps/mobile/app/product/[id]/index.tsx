import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  useProductDetail,
  useRealtimeStock,
  useConnectionStore,
  useCartStore,
  formatPrice,
} from "@repo/shared";
import type { CartItem } from "@repo/shared";
import { getSupabaseClient } from "../../../lib/supabase";
import { StockDisplay } from "../../../components/stock-display";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const supabase = getSupabaseClient();
  const { data: product, isLoading, error } = useProductDetail(supabase, id);
  const addItem = useCartStore((s) => s.addItem);
  const isOnline = useConnectionStore((s) => s.isOnline());

  useRealtimeStock({ supabase, productId: id, enabled: !!product });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.gray}>상품 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>상품을 찾을 수 없습니다.</Text>
      </View>
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
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        {product.description && (
          <Text style={styles.desc}>{product.description}</Text>
        )}
        <Text style={styles.price}>{formatPrice(product.originalPrice)}</Text>

        <StockDisplay
          quantity={product.stock.quantity}
          percentage={product.stock.stockPercentage}
          level={product.stock.level}
        />

        <Pressable
          onPress={handleAddToCart}
          disabled={isDisabled}
          style={[styles.button, isDisabled && styles.buttonDisabled]}
          accessibilityLabel={
            !isOnline
              ? "오프라인 상태입니다"
              : isSoldOut
                ? "품절된 상품입니다"
                : `${product.name} 장바구니에 담기`
          }
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {!isOnline ? "오프라인" : isSoldOut ? "품절" : "장바구니에 담기"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, gap: 16 },
  name: { fontSize: 24, fontWeight: "700" },
  desc: { fontSize: 15, color: "#6b7280", lineHeight: 22 },
  price: { fontSize: 28, fontWeight: "700" },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 48,
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  gray: { color: "#9ca3af" },
  error: { color: "#ef4444" },
});
