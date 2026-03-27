import { View, Text, StyleSheet } from "react-native";
import type { StockLevel } from "@repo/shared";
import { colors } from "@repo/ui/tokens";

interface StockDisplayProps {
  quantity: number;
  percentage: number;
  level: StockLevel;
}

const LEVEL_COLORS: Record<StockLevel, string> = {
  high: colors.stock.high,
  medium: colors.stock.medium,
  low: colors.stock.low,
  critical: colors.stock.critical,
  soldOut: colors.stock.soldOut,
};

export function StockDisplay({ quantity, percentage, level }: StockDisplayProps) {
  const barColor = LEVEL_COLORS[level];

  return (
    <View style={styles.container} accessibilityLabel={`재고 ${quantity}개 남음`}>
      <View style={styles.header}>
        <Text style={[styles.text, { color: barColor }]}>
          {quantity > 0 ? `${quantity}개 남음` : "품절"}
        </Text>
        {quantity > 0 && quantity <= 5 && (
          <View style={[styles.badge, quantity <= 3 ? styles.badgeCritical : styles.badgeWarning]}>
            <Text style={styles.badgeText}>
              {quantity <= 3 ? `마지막 ${quantity}개!` : "곧 품절"}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.max(0, Math.min(100, percentage))}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  text: { fontSize: 14, fontWeight: "600" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeCritical: { backgroundColor: "#ef4444" },
  badgeWarning: { backgroundColor: "#f97316" },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  barBg: { height: 6, borderRadius: 3, backgroundColor: "#e5e7eb", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
});
