import { StyleSheet, Text, View } from "react-native";

interface PriceSummarySectionProps {
  selectedFlight: any;
  selectedAddons: string[];
  getSelectedAddonsTotal: () => number;
  traveler: any;
}

export default function PriceSummarySection({
  selectedFlight,
  selectedAddons,
  getSelectedAddonsTotal,
  traveler,
}: PriceSummarySectionProps) {
  const getPassengerCount = () =>
    Array.isArray(traveler) ? traveler.length : 1;

  const getTaxes = () => {
    if (!selectedFlight?.price) return 0;
    const total = Number(selectedFlight.price.total);
    const base = Number(selectedFlight.price.base);
    return total - base;
  };

  const formatCurrency = (amount: number) => {
    const currency = selectedFlight?.price?.currency || "NGN";
    const symbol = currency === "NGN" ? "₦" : "$";
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Price Breakdown</Text>
      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            Flight × {getPassengerCount()} Traveler
            {getPassengerCount() > 1 ? "s" : ""}
          </Text>
          <Text style={styles.priceValue}>
            {formatCurrency(Number(selectedFlight?.price?.base || 0))}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Taxes & Fees</Text>
          <Text style={styles.priceValue}>{formatCurrency(getTaxes())}</Text>
        </View>

        {selectedAddons.length > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Add-ons ({selectedAddons.length})
            </Text>
            <Text style={styles.priceValue}>
              {formatCurrency(getSelectedAddonsTotal())}
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(
              Number(selectedFlight?.price?.total || 0) +
                getSelectedAddonsTotal()
            )}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
    fontFamily: "RedHatDisplay-Bold",
  },
  priceContainer: {
    gap: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "RedHatDisplay-Regular",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "RedHatDisplay-Bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
    fontFamily: "RedHatDisplay-Regular",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#DC2626",
    fontFamily: "RedHatDisplay-Bold",
  },
});
