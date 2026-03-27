import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
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
import { authenticateWithBiometric } from "../../../lib/biometric-auth";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const supabase = getSupabaseClient();
  const { data: product, isLoading, error } = useProductDetail(supabase, id);
  const addItem = useCartStore((s) => s.addItem);
  const isOnline = useConnectionStore((s) => s.isOnline());
  const [purchasing, setPurchasing] = useState(false);

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
  const isDisabled = isSoldOut || !isOnline || purchasing;

  const handleAddToCart = () => {
    const item: CartItem = {
      productId: product.id,
      productName: product.name,
      unitPrice: product.originalPrice,
      quantity: 1,
      imageUrl: product.imageUrl,
    };
    addItem(item);
    Alert.alert("장바구니", "장바구니에 담았습니다.");
  };

  const handleQuickPurchase = async () => {
    // 1. 생체 인증
    const authResult = await authenticateWithBiometric("결제를 위해 인증해주세요");
    if (!authResult.success) {
      if (authResult.error !== "CANCELLED") {
        Alert.alert("인증 실패", "다시 시도해주세요.");
      }
      return;
    }

    // 2. 결제 Edge Function 호출
    setPurchasing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert("로그인 필요", "로그인 후 이용해주세요.");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/verify-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity: 1,
            unit_price: product.originalPrice,
            payment_token: `bio_${Date.now()}`,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        Alert.alert("구매 완료", "주문이 완료되었습니다.");
      } else {
        Alert.alert("구매 실패", result.message ?? "다시 시도해주세요.");
      }
    } catch {
      Alert.alert("오류", "결제 처리 중 오류가 발생했습니다.");
    } finally {
      setPurchasing(false);
    }
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
            isSoldOut ? "품절된 상품입니다" : `${product.name} 장바구니에 담기`
          }
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {isSoldOut ? "품절" : "장바구니에 담기"}
          </Text>
        </Pressable>

        {!isSoldOut && isOnline && (
          <Pressable
            onPress={handleQuickPurchase}
            disabled={purchasing}
            style={[styles.quickBuyButton, purchasing && styles.buttonDisabled]}
            accessibilityLabel="생체 인증으로 바로 구매"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              {purchasing ? "결제 중..." : "바로 구매 (생체 인증)"}
            </Text>
          </Pressable>
        )}
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
  quickBuyButton: {
    backgroundColor: "#16a34a",
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
