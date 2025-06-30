import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GuestsModalProps {
  visible: boolean;
  onClose: () => void;
  searchParams: any;
  updateGuestCount: (
    type: "adults" | "children" | "infants",
    increment: boolean
  ) => void;
  setSearchParams: (params: any) => void;
}

export default function GuestsModal({
  visible,
  onClose,
  searchParams,
  updateGuestCount,
  setSearchParams,
}: GuestsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Guests & Rooms</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Adults */}
          <View style={styles.guestRow}>
            <View>
              <Text style={styles.guestType}>Adults</Text>
              <Text style={styles.guestAge}>Ages 13+</Text>
            </View>
            <View style={styles.guestControls}>
              <TouchableOpacity
                style={[
                  styles.guestButton,
                  searchParams.adults <= 1 && styles.disabledButton,
                ]}
                onPress={() => updateGuestCount("adults", false)}
                disabled={searchParams.adults <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={searchParams.adults <= 1 ? "#ccc" : "#333"}
                />
              </TouchableOpacity>
              <Text style={styles.guestCount}>{searchParams.adults}</Text>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => updateGuestCount("adults", true)}
              >
                <Ionicons name="add" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Children */}
          <View style={styles.guestRow}>
            <View>
              <Text style={styles.guestType}>Children</Text>
              <Text style={styles.guestAge}>Ages 2-12</Text>
            </View>
            <View style={styles.guestControls}>
              <TouchableOpacity
                style={[
                  styles.guestButton,
                  searchParams.children <= 0 && styles.disabledButton,
                ]}
                onPress={() => updateGuestCount("children", false)}
                disabled={searchParams.children <= 0}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={searchParams.children <= 0 ? "#ccc" : "#333"}
                />
              </TouchableOpacity>
              <Text style={styles.guestCount}>{searchParams.children}</Text>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => updateGuestCount("children", true)}
              >
                <Ionicons name="add" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Infants */}
          <View style={styles.guestRow}>
            <View>
              <Text style={styles.guestType}>Infants</Text>
              <Text style={styles.guestAge}>Under 2</Text>
            </View>
            <View style={styles.guestControls}>
              <TouchableOpacity
                style={[
                  styles.guestButton,
                  searchParams.infants <= 0 && styles.disabledButton,
                ]}
                onPress={() => updateGuestCount("infants", false)}
                disabled={searchParams.infants <= 0}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={searchParams.infants <= 0 ? "#ccc" : "#333"}
                />
              </TouchableOpacity>
              <Text style={styles.guestCount}>{searchParams.infants}</Text>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => updateGuestCount("infants", true)}
              >
                <Ionicons name="add" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Rooms */}
          <View style={styles.guestRow}>
            <View>
              <Text style={styles.guestType}>Rooms</Text>
              <Text style={styles.guestAge}>Number of rooms</Text>
            </View>
            <View style={styles.guestControls}>
              <TouchableOpacity
                style={[
                  styles.guestButton,
                  searchParams.rooms <= 1 && styles.disabledButton,
                ]}
                onPress={() =>
                  setSearchParams({
                    ...searchParams,
                    rooms: Math.max(1, searchParams.rooms - 1),
                  })
                }
                disabled={searchParams.rooms <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={searchParams.rooms <= 1 ? "#ccc" : "#333"}
                />
              </TouchableOpacity>
              <Text style={styles.guestCount}>{searchParams.rooms}</Text>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() =>
                  setSearchParams({
                    ...searchParams,
                    rooms: searchParams.rooms + 1,
                  })
                }
              >
                <Ionicons name="add" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.guestLimit}>Maximum 9 guests total</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    padding: 20,
  },
  guestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  guestType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  guestAge: {
    fontSize: 14,
    color: "#666",
  },
  guestControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  guestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  disabledButton: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
  },
  guestCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    minWidth: 24,
    textAlign: "center",
  },
  guestLimit: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
});
