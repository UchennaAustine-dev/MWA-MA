import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BookingHeaderProps {
  onBack: () => void;
}

export default function BookingHeader({ onBack }: BookingHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Full Summary</Text>
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#DC2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 18,
    // fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "RedHatDisplay-Bold",
  },
  placeholder: {
    width: 40,
  },
});
