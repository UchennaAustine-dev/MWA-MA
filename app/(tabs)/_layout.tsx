import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="flights"
        options={{
          title: "Flights",
          tabBarIcon: ({ color }) => (
            <Ionicons name="airplane" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hotels"
        options={{
          title: "Hotels",
          tabBarIcon: ({ color }) => (
            <Ionicons name="bed" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cars"
        options={{
          title: "Cars",
          tabBarIcon: ({ color }) => (
            <Ionicons name="car" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tours"
        options={{
          title: "Tours",
          tabBarIcon: ({ color }) => (
            <Ionicons name="map" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
