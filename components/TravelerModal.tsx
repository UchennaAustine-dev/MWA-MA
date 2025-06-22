import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { TravelerConfig } from "../types/flight-types";

interface TravelerModalProps {
  visible: boolean;
  onClose: () => void;
  travelerConfig: TravelerConfig;
  onUpdateTravelers: (config: TravelerConfig) => void;
}

const cabinClasses = ["Economy", "Premium Economy", "Business", "First Class"];

export default function TravelerModal({
  visible,
  onClose,
  travelerConfig,
  onUpdateTravelers,
}: TravelerModalProps) {
  const updateTravelerCount = (
    type: "adults" | "children" | "infants",
    operation: "add" | "subtract"
  ) => {
    const newConfig = { ...travelerConfig };
    const totalTravelers =
      newConfig.adults + newConfig.children + newConfig.infants;

    if (operation === "add") {
      if (totalTravelers < 9) {
        newConfig[type] += 1;

        let newTotal =
          newConfig.adults + newConfig.children + newConfig.infants;
        if (newTotal > 9) {
          const excess = newTotal - 9;
          const otherTypes = ["adults", "children", "infants"].filter(
            (t) => t !== type
          ) as ("adults" | "children" | "infants")[];

          for (const otherType of otherTypes) {
            while (excess > 0 && newConfig[otherType] > 0) {
              newConfig[otherType] -= 1;
              newTotal -= 1;
              if (newTotal <= 9) break;
            }
          }
        }
      }
    } else if (operation === "subtract") {
      if (newConfig[type] > 0) {
        newConfig[type] -= 1;
      }
      if (type === "adults" && newConfig.adults < 1) {
        newConfig.adults = 1;
      }
    }

    const finalTotal =
      newConfig.adults + newConfig.children + newConfig.infants;
    if (finalTotal > 9) {
      let excess = finalTotal - 9;
      const reduceOrder: ("children" | "infants")[] = ["children", "infants"];
      for (const t of reduceOrder) {
        while (excess > 0 && newConfig[t] > 0) {
          newConfig[t] -= 1;
          excess -= 1;
        }
        if (excess <= 0) break;
      }
    }

    onUpdateTravelers(newConfig);
  };

  const updateCabinClass = (newClass: string) => {
    onUpdateTravelers({ ...travelerConfig, class: newClass });
  };

  const getTotalTravelers = () => {
    return (
      travelerConfig.adults + travelerConfig.children + travelerConfig.infants
    );
  };

  const CounterRow = ({
    title,
    subtitle,
    count,
    onIncrement,
    onDecrement,
    canDecrement = true,
  }: {
    title: string;
    subtitle: string;
    count: number;
    onIncrement: () => void;
    onDecrement: () => void;
    canDecrement?: boolean;
  }) => (
    <View style={styles.counterRow}>
      <View style={styles.counterInfo}>
        <Text style={styles.counterTitle}>{title}</Text>
        <Text style={styles.counterSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.counterControls}>
        <TouchableOpacity
          style={[
            styles.counterButton,
            !canDecrement && styles.counterButtonDisabled,
          ]}
          onPress={onDecrement}
          disabled={!canDecrement}
        >
          <Ionicons
            name="remove"
            size={20}
            color={canDecrement ? "#007AFF" : "#ccc"}
          />
        </TouchableOpacity>
        <Text style={styles.counterValue}>{count}</Text>
        <TouchableOpacity
          style={[
            styles.counterButton,
            getTotalTravelers() >= 9 && styles.counterButtonDisabled,
          ]}
          onPress={onIncrement}
          disabled={getTotalTravelers() >= 9}
        >
          <Ionicons
            name="add"
            size={20}
            color={getTotalTravelers() >= 9 ? "#ccc" : "#007AFF"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Passengers & Class</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Passengers</Text>
            <Text style={styles.sectionSubtitle}>Maximum 9 travelers</Text>

            <CounterRow
              title="Adults"
              subtitle="12+ years"
              count={travelerConfig.adults}
              onIncrement={() => updateTravelerCount("adults", "add")}
              onDecrement={() => updateTravelerCount("adults", "subtract")}
              canDecrement={travelerConfig.adults > 1}
            />

            <CounterRow
              title="Children"
              subtitle="2-11 years"
              count={travelerConfig.children}
              onIncrement={() => updateTravelerCount("children", "add")}
              onDecrement={() => updateTravelerCount("children", "subtract")}
              canDecrement={travelerConfig.children > 0}
            />

            <CounterRow
              title="Infants"
              subtitle="Under 2 years"
              count={travelerConfig.infants}
              onIncrement={() => updateTravelerCount("infants", "add")}
              onDecrement={() => updateTravelerCount("infants", "subtract")}
              canDecrement={travelerConfig.infants > 0}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cabin Class</Text>
            <View style={styles.classGrid}>
              {cabinClasses.map((cabinClass) => (
                <TouchableOpacity
                  key={cabinClass}
                  style={[
                    styles.classButton,
                    travelerConfig.class === cabinClass &&
                      styles.classButtonSelected,
                  ]}
                  onPress={() => updateCabinClass(cabinClass)}
                >
                  <Text
                    style={[
                      styles.classButtonText,
                      travelerConfig.class === cabinClass &&
                        styles.classButtonTextSelected,
                    ]}
                  >
                    {cabinClass}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  counterInfo: {
    flex: 1,
  },
  counterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  counterSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  counterButtonDisabled: {
    backgroundColor: "#f8f8f8",
  },
  counterValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: "center",
  },
  classGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  classButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  classButtonSelected: {
    backgroundColor: "#007AFF",
  },
  classButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  classButtonTextSelected: {
    color: "#fff",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  doneButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
