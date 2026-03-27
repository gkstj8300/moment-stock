import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useProducts, formatPrice } from "@repo/shared";
import type { ProductWithStock } from "@repo/shared";
import { getSupabaseClient } from "../../lib/supabase";
import { StockDisplay } from "../../components/stock-display";

export default function ProductsScreen() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const { data: products, isLoading } = useProducts(supabase);

  const renderItem = ({ item }: { item: ProductWithStock }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/product/${item.id}`)}
      accessibilityLabel={`${item.name}, ${formatPrice(item.originalPrice)}`}
      accessibilityRole="button"
    >
      <View style={styles.cardBody}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
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
      <View style={styles.center}>
        <Text style={styles.gray}>상품을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>상품 목록 ({products?.length ?? 0}개)</Text>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { fontSize: 20, fontWeight: "700", padding: 16 },
  list: { paddingHorizontal: 16 },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  cardBody: { padding: 16, gap: 6 },
  name: { fontSize: 16, fontWeight: "600" },
  desc: { fontSize: 13, color: "#6b7280" },
  price: { fontSize: 18, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  gray: { color: "#9ca3af" },
});
