import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BookingFooterProps {
  onPayNow: () => void;
  isProcessing: boolean;
  totalAmount: number;
  currency?: string;
}

export default function BookingFooter({
  onPayNow,
  isProcessing,
  totalAmount,
  currency = "NGN",
}: BookingFooterProps) {
  const formatCurrency = (amount: number) => {
    const symbol = currency === "NGN" ? "₦" : "$";
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  return (
    <View style={styles.footer}>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
      </View>

      <TouchableOpacity
        style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
        onPress={onPayNow}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.payButtonText}>Processing...</Text>
          </View>
        ) : (
          <View style={styles.loadingRow}>
            <Ionicons name="card" size={20} color="#FFFFFF" />
            <Text style={styles.payButtonText}>Pay Now</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666666",
    fontFamily: "Inter",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#DC2626",
    fontFamily: "RedHatDisplay-Bold",
  },
  payButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "RedHatDisplay-Bold",
  },
});
