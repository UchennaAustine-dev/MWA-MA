import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TravelAddon {
  id: string;
  bookingId: string | null;
  name: string;
  description: string;
  price: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface TravelAddonCardProps {
  addon: TravelAddon;
  isSelected: boolean;
  isAdding: boolean;
  onToggle: (addonId: string) => void;
}

const getAddonIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("data") || lowerName.includes("connectivity"))
    return "wifi";
  if (lowerName.includes("insurance")) return "shield-checkmark";
  if (lowerName.includes("priority") || lowerName.includes("boarding"))
    return "star";
  if (lowerName.includes("whatsapp") || lowerName.includes("call"))
    return "call";
  return "airplane";
};

export default function TravelAddonCard({
  addon,
  isSelected,
  isAdding,
  onToggle,
}: TravelAddonCardProps) {
  const iconName = getAddonIcon(addon.name);

  const formatCurrency = (amount: number) => {
    const symbol = addon.currency === "USD" ? "$" : "₦";
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  const isPopular =
    addon.name.toLowerCase().includes("data") ||
    addon.name.toLowerCase().includes("connectivity");

  const handleToggle = () => {
    if (!isAdding) {
      onToggle(addon.id);
    }
  };

  return (
    <View style={[styles.container, isSelected && styles.selectedContainer]}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Left side with icon and content */}
        <View style={styles.leftContent}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              isSelected && styles.selectedIconContainer,
            ]}
          >
            <Ionicons
              name={iconName as any}
              size={24}
              color={isSelected ? "#007AFF" : "#666"}
            />
          </View>

          {/* Content */}
          <View style={styles.textContent}>
            <Text style={styles.title} numberOfLines={2}>
              {addon.name}
            </Text>

            <Text style={styles.description} numberOfLines={3}>
              {addon.description}
            </Text>

            <View style={styles.metaInfo}>
              <Text style={styles.termsText}>Terms & Conditions</Text>
              <Text style={styles.dateText}>
                Added {new Date(addon.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Right side with price and button */}
        <View style={styles.rightContent}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(addon.price)}</Text>
            <Text style={styles.perPassenger}>per passenger</Text>
          </View>

          <TouchableOpacity
            onPress={handleToggle}
            disabled={isAdding}
            style={[
              styles.actionButton,
              isSelected
                ? styles.removeButton
                : isAdding
                ? styles.disabledButton
                : styles.addButton,
            ]}
          >
            {isAdding ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.buttonText}>Adding...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>
                {isSelected ? "REMOVE" : "ADD"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedContainer: {
    borderColor: "#007AFF",
    backgroundColor: "#f8f9ff",
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    left: 16,
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 20,
  },
  leftContent: {
    flex: 1,
    flexDirection: "row",
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedIconContainer: {
    backgroundColor: "#e3f2fd",
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
    marginBottom: 12,
  },
  metaInfo: {
    gap: 4,
  },
  termsText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  dateText: {
    fontSize: 10,
    color: "#999",
  },
  rightContent: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minWidth: 100,
  },
  priceContainer: {
    alignItems: "flex-end",
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  perPassenger: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: "#007AFF",
  },
  removeButton: {
    backgroundColor: "#d32f2f",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
