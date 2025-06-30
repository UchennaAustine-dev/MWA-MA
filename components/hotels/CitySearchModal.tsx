import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CitySearchModalProps {
  visible: boolean;
  onClose: () => void;
  citySearch: string;
  onCitySearchChange: (text: string) => void;
  suggestions: any[];
  onCitySelect: (city: any) => void;
  suggestionsLoading: boolean;
}

export default function CitySearchModal({
  visible,
  onClose,
  citySearch,
  onCitySearchChange,
  suggestions,
  onCitySelect,
  suggestionsLoading,
}: CitySearchModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Destination</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cities..."
            value={citySearch}
            onChangeText={onCitySearchChange}
            autoFocus
          />
          {suggestionsLoading && (
            <Ionicons
              name="refresh"
              size={20}
              color="#666"
              style={styles.loadingIcon}
            />
          )}
        </View>

        <FlatList
          data={suggestions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => onCitySelect(item)}
            >
              <Ionicons name="location-outline" size={20} color="#666" />
              <View style={styles.suggestionInfo}>
                <Text style={styles.suggestionName}>
                  {item.name || item.cityName}
                </Text>
                <Text style={styles.suggestionCountry}>
                  {item.country || item.countryName}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          style={styles.suggestionsList}
          showsVerticalScrollIndicator={false}
        />
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  loadingIcon: {
    marginLeft: 8,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  suggestionCountry: {
    fontSize: 14,
    color: "#666",
  },
});
