import { View, Text, FlatList, StyleSheet } from "react-native";
import { useOrders, formatPrice } from "@repo/shared";
import type { Order } from "@repo/shared";
import { getSupabaseClient } from "../../lib/supabase";
import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  pending: "결제 대기",
  confirmed: "결제 완료",
  cancelled: "취소됨",
  refunded: "환불됨",
};

export default function MyPageScreen() {
  const supabase = getSupabaseClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  const { data: orders, isLoading } = useOrders(supabase, userId ?? "");

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleDateString("ko-KR")}
      </Text>
      <Text style={styles.price}>
        {formatPrice(item.totalPrice)} ({item.quantity}개)
      </Text>
      <Text style={styles.status}>{STATUS_LABELS[item.status] ?? item.status}</Text>
    </View>
  );

  if (!userId) {
    return (
      <View style={styles.center}>
        <Text style={styles.gray}>로그인이 필요합니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>주문 내역</Text>
      {isLoading ? (
        <View style={styles.center}>
          <Text style={styles.gray}>주문 내역을 불러오는 중...</Text>
        </View>
      ) : orders && orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.gray}>주문 내역이 없습니다.</Text>
        </View>
      )}
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
    padding: 16,
    marginBottom: 12,
  },
  date: { fontSize: 13, color: "#9ca3af" },
  price: { fontSize: 16, fontWeight: "600", marginTop: 4 },
  status: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  gray: { color: "#9ca3af" },
});
