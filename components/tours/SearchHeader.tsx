import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchHeaderProps {
  citySearch: string;
  onCitySearchChange: (text: string) => void;
  onSearch: () => void;
  loading: boolean;
  searchTerm: string;
  onSearchTermChange: (text: string) => void;
  hasSearched: boolean;
  tourCount: number;
}

function SearchHeader({
  citySearch,
  onCitySearchChange,
  onSearch,
  loading,
  searchTerm,
  onSearchTermChange,
  hasSearched,
  tourCount,
}: SearchHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Discover Amazing <Text style={styles.titleAccent}>Tours</Text>
        </Text>
        <Text style={styles.subtitle}>
          Explore the world's most incredible destinations with our curated
          collection of tours
        </Text>
      </View>

      {/* City Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="location-outline"
            size={20}
            color="#DC2626"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter city name (e.g., London, Paris, New York)"
            value={citySearch}
            onChangeText={onCitySearchChange}
            placeholderTextColor="#999999"
          />
        </View>
        <TouchableOpacity
          style={[
            styles.searchButton,
            (!citySearch.trim() || loading) && styles.searchButtonDisabled,
          ]}
          onPress={onSearch}
          disabled={!citySearch.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="search" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Search */}
      {hasSearched && tourCount > 0 && (
        <View style={styles.filterContainer}>
          <View style={styles.filterInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#666666"
              style={styles.filterIcon}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Filter tours by name or description..."
              value={searchTerm}
              onChangeText={onSearchTermChange}
              placeholderTextColor="#999999"
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default memo(SearchHeader);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  titleAccent: {
    color: "#DC2626",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    paddingVertical: 16,
  },
  searchButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  filterContainer: {
    marginTop: 8,
  },
  filterInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterIcon: {
    marginRight: 12,
  },
  filterInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    paddingVertical: 16,
  },
});
