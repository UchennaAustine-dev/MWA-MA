import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TravelAddonCard from "../TravelAddonCard";

interface TravelAddonsSectionProps {
  selectedOfferId: string;
  addons: any[];
  addonsLoading: boolean;
  addonsError: string | null;
  selectedAddons: string[];
  addingAddon: string | null;
  toggleAddon: (addonId: string) => void;
  refetchAddons: () => void;
}

export default function TravelAddonsSection({
  addons,
  addonsLoading,
  addonsError,
  selectedAddons,
  addingAddon,
  toggleAddon,
  refetchAddons,
}: TravelAddonsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Enhance Your Journey</Text>

      {addonsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#DC2626" />
          <Text style={styles.loadingText}>Loading add-ons...</Text>
        </View>
      ) : addonsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load travel add-ons</Text>
          <TouchableOpacity onPress={refetchAddons} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.addonsContainer}>
          {addons.map((addon: any) => (
            <TravelAddonCard
              key={addon.id}
              addon={addon}
              isSelected={selectedAddons.includes(addon.id)}
              isAdding={addingAddon === addon.id}
              onToggle={toggleAddon}
            />
          ))}
        </View>
      )}
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
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666666",
  },
  errorContainer: {
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  addonsContainer: {
    gap: 12,
  },
});
