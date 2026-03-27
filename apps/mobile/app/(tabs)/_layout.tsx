import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#3b82f6",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarLabel: "홈",
          tabBarAccessibilityLabel: "홈 탭",
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "상품",
          tabBarLabel: "상품",
          tabBarAccessibilityLabel: "상품 탭",
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "장바구니",
          tabBarLabel: "장바구니",
          tabBarAccessibilityLabel: "장바구니 탭",
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: "마이페이지",
          tabBarLabel: "MY",
          tabBarAccessibilityLabel: "마이페이지 탭",
        }}
      />
    </Tabs>
  );
}
