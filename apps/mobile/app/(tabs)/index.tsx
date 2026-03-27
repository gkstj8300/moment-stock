import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useProducts, formatPrice } from "@repo/shared";
import type { ProductWithStock } from "@repo/shared";
import { getSupabaseClient } from "../../lib/supabase";
import { StockDisplay } from "../../components/stock-display";

export default function HomeScreen() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const { data: products, isLoading, error } = useProducts(supabase);

  const renderItem = ({ item }: { item: ProductWithStock }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/product/${item.id}`)}
      accessibilityLabel={`${item.name}, ${formatPrice(item.originalPrice)}`}
      accessibilityRole="button"
    >
      <View style={styles.cardBody}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.price}>{formatPrice(item.originalPrice)}</Text>
        <StockDisplay
          quantity={item.stock.quantity}
          percentage={item.stock.stockPercentage}
          level={item.stock.level}
        />
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.center} accessibilityRole="progressbar">
        <Text style={styles.gray}>상품을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>상품을 불러오지 못했습니다.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      numColumns={2}
      columnWrapperStyle={styles.row}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12 },
  row: { gap: 12 },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 12,
  },
  cardBody: { padding: 12, gap: 8 },
  productName: { fontSize: 14, fontWeight: "600" },
  price: { fontSize: 18, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  gray: { color: "#9ca3af" },
  error: { color: "#ef4444" },
});
