import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useCartStore, formatPrice } from "@repo/shared";
import type { CartItem } from "@repo/shared";

export default function CartScreen() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.totalPrice());

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.gray}>장바구니가 비어 있습니다.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.productName}</Text>
        <Text style={styles.price}>{formatPrice(item.unitPrice)}</Text>
      </View>
      <View style={styles.controls}>
        <Pressable
          onPress={() => updateQuantity(item.productId, item.quantity - 1)}
          style={styles.btn}
          accessibilityLabel="수량 감소"
        >
          <Text style={styles.btnText}>-</Text>
        </Pressable>
        <Text style={styles.qty}>{item.quantity}</Text>
        <Pressable
          onPress={() => updateQuantity(item.productId, item.quantity + 1)}
          style={styles.btn}
          accessibilityLabel="수량 증가"
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
        <Pressable
          onPress={() => removeItem(item.productId)}
          style={styles.removeBtn}
          accessibilityLabel={`${item.productName} 삭제`}
        >
          <Text style={styles.removeText}>삭제</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.list}
      />
      <View style={styles.footer}>
        <Text style={styles.totalLabel}>총 결제 금액</Text>
        <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  list: { padding: 16 },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
  },
  cardBody: { marginBottom: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  price: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  controls: { flexDirection: "row", alignItems: "center", gap: 12 },
  btn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 18 },
  qty: { fontSize: 16, fontWeight: "600", minWidth: 24, textAlign: "center" },
  removeBtn: { marginLeft: "auto" },
  removeText: { color: "#ef4444", fontSize: 14 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalPrice: { fontSize: 20, fontWeight: "700", color: "#3b82f6" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  gray: { color: "#9ca3af" },
});
