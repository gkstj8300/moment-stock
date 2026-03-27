import { View, Text, StyleSheet } from "react-native";
import { formatPrice, getStockLevel } from "@repo/shared";
import { colors } from "@repo/ui/tokens";

export default function Home() {
  const level = getStockLevel(42, 100);
  const stockColor = colors.stock[level];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>moment-stock</Text>
      <Text style={styles.subtitle}>
        실시간 재고 동기화 타임 세일 플랫폼
      </Text>
      <View style={styles.card}>
        <Text style={styles.label}>@repo/shared 연결 확인</Text>
        <Text style={styles.price}>{formatPrice(29900)}</Text>
        <Text style={[styles.stock, { color: stockColor }]}>
          재고 상태: {level}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 32,
  },
  title: { fontSize: 36, fontWeight: "bold" },
  subtitle: { fontSize: 18, color: "#6b7280" },
  card: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  label: { fontSize: 14, color: "#9ca3af" },
  price: { fontSize: 24, fontWeight: "600", marginTop: 8 },
  stock: { marginTop: 4, fontSize: 16 },
});
