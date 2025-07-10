import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchFormProps {
  searchParams: any;
  selectedCity: any;
  isSearching: boolean;
  onCityPress: () => void;
  onDatePress: (type: "checkin" | "checkout") => void;
  onGuestsPress: () => void;
  onSearch: () => void;
  formatDate: (date: Date) => string;
  getTotalGuests: () => number;
}

function SearchForm({
  searchParams,
  selectedCity,
  isSearching,
  onCityPress,
  onDatePress,
  onGuestsPress,
  onSearch,
  formatDate,
  getTotalGuests,
}: SearchFormProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Find Your Perfect Stay</Text>
        <Text style={styles.subtitle}>Discover amazing hotels worldwide</Text>

        <View style={styles.form}>
          {/* City Search */}
          <TouchableOpacity style={styles.input} onPress={onCityPress}>
            <Ionicons name="location-outline" size={20} color="#DC2626" />
            <Text
              style={[styles.inputText, !selectedCity && styles.placeholder]}
            >
              {selectedCity ? selectedCity.name : "Where are you going?"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666666" />
          </TouchableOpacity>

          {/* Date Selection */}
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[styles.input, styles.dateInput]}
              onPress={() => onDatePress("checkin")}
            >
              <Ionicons name="calendar-outline" size={20} color="#DC2626" />
              <View>
                <Text style={styles.dateLabel}>Check-in</Text>
                <Text style={styles.dateText}>
                  {formatDate(searchParams.checkInDate)}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.input, styles.dateInput]}
              onPress={() => onDatePress("checkout")}
            >
              <Ionicons name="calendar-outline" size={20} color="#DC2626" />
              <View>
                <Text style={styles.dateLabel}>Check-out</Text>
                <Text style={styles.dateText}>
                  {formatDate(searchParams.checkOutDate)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Guests and Rooms */}
          <TouchableOpacity style={styles.input} onPress={onGuestsPress}>
            <Ionicons name="people-outline" size={20} color="#DC2626" />
            <Text style={styles.inputText}>
              {getTotalGuests()} Guest{getTotalGuests() > 1 ? "s" : ""} •{" "}
              {searchParams.rooms} Room
              {searchParams.rooms > 1 ? "s" : ""}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666666" />
          </TouchableOpacity>

          {/* Search Button */}
          <TouchableOpacity
            style={[
              styles.searchButton,
              isSearching && styles.searchButtonDisabled,
            ]}
            onPress={onSearch}
            disabled={isSearching}
          >
            <View style={styles.searchButtonContent}>
              {isSearching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="search" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.searchButtonText}>
                {isSearching ? "Searching..." : "Search Hotels"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default memo(SearchForm);

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "RedHatDisplay-Regular",
  },
  form: {
    gap: 16,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
    fontFamily: "RedHatDisplay-Regular",
  },
  placeholder: {
    color: "#999999",
    fontWeight: "400",
  },
  dateRow: {
    flexDirection: "column",
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
    fontFamily: "RedHatDisplay-Regular",
  },
  dateText: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
    fontFamily: "RedHatDisplay-Regular",
  },
  searchButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchButtonDisabled: {
    opacity: 0.7,
  },
  searchButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Bold",
  },
});
