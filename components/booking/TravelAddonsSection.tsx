import { TravelAddon } from "@/types/travelAddons";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TravelAddonsSectionProps {
  addons: TravelAddon[];
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
  if (addonsLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enhance Your Journey</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#d32f2f" />
          <Text style={styles.loadingText}>Loading add-ons...</Text>
        </View>
      </View>
    );
  }

  if (addonsError) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enhance Your Journey</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load travel add-ons</Text>
          <TouchableOpacity onPress={refetchAddons} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Enhance Your Journey</Text>
      <FlatList
        data={addons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.addonsContainer}
        renderItem={({ item }) => (
          <TravelAddonCard
            addon={item}
            isSelected={selectedAddons.includes(item.id)}
            isAdding={addingAddon === item.id}
            onToggle={toggleAddon}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </View>
  );
}

interface TravelAddonCardProps {
  addon: TravelAddon;
  isSelected: boolean;
  isAdding: boolean;
  onToggle: (addonId: string) => void;
}

function TravelAddonCard({
  addon,
  isSelected,
  isAdding,
  onToggle,
}: TravelAddonCardProps) {
  return (
    <View style={[styles.card, isSelected && styles.cardSelected]}>
      <View style={styles.iconContainer}>{addon.icon}</View>

      <Text style={styles.title}>{addon.title}</Text>

      <Text style={styles.description}>{addon.description}</Text>

      <View style={styles.footer}>
        <Text style={styles.price}>
          {addon.currency} {addon.price.toFixed(2)}
        </Text>

        <TouchableOpacity
          style={[
            styles.addButton,
            isSelected && styles.addedButton,
            isAdding && styles.addingButton,
          ]}
          onPress={() => onToggle(addon.id)}
          disabled={isAdding}
          accessibilityRole="button"
          accessibilityLabel={
            isSelected ? `Remove ${addon.title}` : `Add ${addon.title}`
          }
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>
              {isSelected ? "Remove" : "Add"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#d32f2f",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  addonsContainer: {
    paddingBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: "flex-start",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#d32f2f",
  },
  iconContainer: {
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#d32f2f",
  },
  addButton: {
    backgroundColor: "#d32f2f",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  addedButton: {
    backgroundColor: "#000",
  },
  addingButton: {
    opacity: 0.7,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
