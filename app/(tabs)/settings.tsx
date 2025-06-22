import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export default function SettingsScreen() {
  const user: any = useSelector((state: RootState) => state.auth.user);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{user?.firstName || "Guest"}</Text>
        </View>
        <View style={styles.icons}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color="black"
            style={styles.icon}
          />
          <Ionicons name="person-circle-outline" size={30} color="black" />
        </View>
      </View>
      <Text style={{ fontFamily: "RedHatDisplay-Regular", fontSize: 16 }}>
        Account
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontFamily: "RedHatDisplay-Regular",
    fontSize: 18,
    color: "#333",
  },
  name: { fontFamily: "RedHatDisplay-Bold", fontSize: 20 },
  icons: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 15 },
});
