import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCustomFonts } from "../../hooks/useCustomFonts";

interface RideSearchProps {
  onSearch?: (searchData: any) => void;
}

export default function RideSearchComponent({ onSearch }: RideSearchProps) {
  const [fontsLoaded] = useCustomFonts();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);

  const handleSearch = () => {
    const searchData = {
      pickup,
      destination,
      date,
      passengers,
    };
    onSearch?.(searchData);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Book Your Ride</Text>
          <Text style={styles.subtitle}>
            Find the perfect transfer for your journey
          </Text>
        </View>

        <View style={styles.searchForm}>
          {/* Pickup Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Ionicons name="location" size={16} color="#DC2626" /> Pickup
              Location
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={pickup}
                onChangeText={setPickup}
                placeholder="Enter pickup location"
                placeholderTextColor="#9CA3AF"
              />
              <Ionicons name="search" size={20} color="#6B7280" />
            </View>
          </View>

          {/* Destination */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Ionicons name="location" size={16} color="#DC2626" /> Destination
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={destination}
                onChangeText={setDestination}
                placeholder="Enter destination"
                placeholderTextColor="#9CA3AF"
              />
              <Ionicons name="search" size={20} color="#6B7280" />
            </View>
          </View>

          {/* Date and Passengers Row */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>
                <Ionicons name="calendar" size={16} color="#DC2626" /> Date
              </Text>
              <TouchableOpacity style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="Select date"
                  placeholderTextColor="#9CA3AF"
                />
                <Ionicons name="calendar" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>
                <Ionicons name="people" size={16} color="#DC2626" /> Passengers
              </Text>
              <View style={styles.passengerContainer}>
                <TouchableOpacity
                  style={styles.passengerButton}
                  onPress={() => setPassengers(Math.max(1, passengers - 1))}
                >
                  <Ionicons name="remove" size={16} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.passengerCount}>{passengers}</Text>
                <TouchableOpacity
                  style={styles.passengerButton}
                  onPress={() => setPassengers(Math.min(8, passengers + 1))}
                >
                  <Ionicons name="add" size={16} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Transfer Type */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Transfer Type</Text>
            <View style={styles.transferTypeContainer}>
              <TouchableOpacity style={styles.transferTypeButton}>
                <Ionicons name="car" size={24} color="#DC2626" />
                <Text style={styles.transferTypeText}>Private</Text>
                <Text style={styles.transferTypeSubtext}>
                  Exclusive vehicle
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.transferTypeButton}>
                <Ionicons name="people" size={24} color="#6B7280" />
                <Text style={styles.transferTypeText}>Shared</Text>
                <Text style={styles.transferTypeSubtext}>Shared ride</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Button */}
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search Rides</Text>
            <Ionicons name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Options */}
        <View style={styles.quickOptions}>
          <Text style={styles.quickOptionsTitle}>Popular Routes</Text>
          <View style={styles.quickOptionsList}>
            <TouchableOpacity style={styles.quickOption}>
              <Ionicons name="airplane" size={20} color="#DC2626" />
              <Text style={styles.quickOptionText}>Airport Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickOption}>
              <Ionicons name="business" size={20} color="#DC2626" />
              <Text style={styles.quickOptionText}>City Center</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickOption}>
              <Ionicons name="train" size={20} color="#DC2626" />
              <Text style={styles.quickOptionText}>Train Station</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "RedHatDisplay-Regular",
  },
  searchForm: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontFamily: "RedHatDisplay-Regular",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  passengerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  passengerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  passengerCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: "center",
    fontFamily: "RedHatDisplay-Bold",
  },
  transferTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transferTypeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#FFFFFF",
  },
  transferTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  transferTypeSubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "RedHatDisplay-Regular",
  },
  searchButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  quickOptions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickOptionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    fontFamily: "RedHatDisplay-Bold",
  },
  quickOptionsList: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickOption: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickOptionText: {
    fontSize: 12,
    color: "#374151",
    marginTop: 8,
    textAlign: "center",
    fontFamily: "RedHatDisplay-Regular",
  },
});
