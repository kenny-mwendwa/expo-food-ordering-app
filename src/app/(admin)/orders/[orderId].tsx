import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import orders from "../../../../assets/data/orders";
import OrderItemListItem from "@/components/OrderItemListItem";
import OrderListItem from "@/components/OrderListItem";
import { Order, OrderStatusList } from "@/types";
import Colors from "@/constants/Colors";

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams();

  const order = orders.find((order) => order.id.toString() === orderId);

  if (!order) {
    return <Text>Order not found!</Text>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Order #${order.id}` }} />

      <FlatList
        data={order.order_items}
        renderItem={({ item }) => <OrderItemListItem item={item} />}
        contentContainerStyle={{ gap: 10 }}
        ListHeaderComponent={() => <OrderListItem order={order} />}
        ListFooterComponent={() => <OrderStatusSelector order={order} />}
      />
    </View>
  );
}

type OrderStatusSelectorProps = {
  order: Order;
};

function OrderStatusSelector({ order }: OrderStatusSelectorProps) {
  return (
    <>
      <Text style={{ fontWeight: "bold" }}>Status</Text>
      <View style={{ flexDirection: "row", gap: 5 }}>
        {OrderStatusList.map((status) => (
          <Pressable
            key={status}
            onPress={() => console.warn("Update status")}
            style={{
              borderColor: Colors.light.tint,
              borderWidth: 1,
              padding: 10,
              borderRadius: 5,
              marginVertical: 10,
              backgroundColor:
                order.status === status ? Colors.light.tint : "transparent",
            }}>
            <Text
              style={{
                color: order.status === status ? "white" : Colors.light.tint,
              }}>
              {status}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
    gap: 10,
  },
});
