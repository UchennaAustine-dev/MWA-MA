"use client";

import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useEffect, useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  airlines: string[];
  priceRange: [number, number];
}

export interface FilterState {
  selectedDepartureTime: string | null;
  selectedStops: string | null;
  selectedAirlines: string[];
  priceRange: [number, number];
}

const departureTimeSlots = [
  "Before 6 AM",
  "6 AM - 12 PM",
  "12 PM - 6 PM",
  "After 6 PM",
];
const stopsOptions = ["Non-stop", "1 Stop", "2+ Stops"];

export default function FilterModal({
  visible,
  onClose,
  onApplyFilters,
  airlines,
  priceRange,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>({
    selectedDepartureTime: null,
    selectedStops: null,
    selectedAirlines: [],
    priceRange: priceRange,
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, priceRange }));
  }, [priceRange]);

  const handleDepartureTimeSelect = (timeSlot: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedDepartureTime:
        prev.selectedDepartureTime === timeSlot ? null : timeSlot,
    }));
  };

  const handleStopsSelect = (stopOption: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedStops: prev.selectedStops === stopOption ? null : stopOption,
    }));
  };

  const handleAirlineToggle = (airline: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedAirlines: prev.selectedAirlines.includes(airline)
        ? prev.selectedAirlines.filter((a) => a !== airline)
        : [...prev.selectedAirlines, airline],
    }));
  };

  const handlePriceChange = (value: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [prev.priceRange[0], value],
    }));
  };

  const resetFilters = () => {
    setFilters({
      selectedDepartureTime: null,
      selectedStops: null,
      selectedAirlines: [],
      priceRange: priceRange,
    });
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-NG", { maximumFractionDigits: 0 });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Departure Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Departure Time</Text>
            <View style={styles.optionsGrid}>
              {departureTimeSlots.map((timeSlot) => (
                <TouchableOpacity
                  key={timeSlot}
                  style={[
                    styles.optionButton,
                    filters.selectedDepartureTime === timeSlot &&
                      styles.optionButtonSelected,
                  ]}
                  onPress={() => handleDepartureTimeSelect(timeSlot)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      filters.selectedDepartureTime === timeSlot &&
                        styles.optionButtonTextSelected,
                    ]}
                  >
                    {timeSlot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stops */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stops</Text>
            <View style={styles.optionsGrid}>
              {stopsOptions.map((stopOption) => (
                <TouchableOpacity
                  key={stopOption}
                  style={[
                    styles.optionButton,
                    filters.selectedStops === stopOption &&
                      styles.optionButtonSelected,
                  ]}
                  onPress={() => handleStopsSelect(stopOption)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      filters.selectedStops === stopOption &&
                        styles.optionButtonTextSelected,
                    ]}
                  >
                    {stopOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceContainer}>
              <View style={styles.priceLabels}>
                <Text style={styles.priceLabel}>
                  ₦{formatPrice(filters.priceRange[0])}
                </Text>
                <Text style={styles.priceLabel}>
                  ₦{formatPrice(filters.priceRange[1])}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={priceRange[0]}
                maximumValue={priceRange[1]}
                value={filters.priceRange[1]}
                onValueChange={handlePriceChange}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#ddd"
                // thumbStyle={styles.sliderThumb}
              />
            </View>
          </View>

          {/* Airlines */}
          {airlines.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Airlines</Text>
              <View style={styles.airlinesList}>
                {airlines.map((airline) => (
                  <View key={airline} style={styles.airlineItem}>
                    <View style={styles.airlineInfo}>
                      <Ionicons name="airplane" size={16} color="#666" />
                      <Text style={styles.airlineName}>{airline}</Text>
                    </View>
                    <Switch
                      value={filters.selectedAirlines.includes(airline)}
                      onValueChange={() => handleAirlineToggle(airline)}
                      trackColor={{ false: "#ddd", true: "#007AFF" }}
                      thumbColor="#fff"
                    />
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
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
  resetButton: {
    padding: 4,
  },
  resetButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: "#007AFF",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  optionButtonTextSelected: {
    color: "#fff",
  },
  priceContainer: {
    paddingVertical: 8,
  },
  priceLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderThumb: {
    backgroundColor: "#007AFF",
    width: 20,
    height: 20,
  },
  airlinesList: {
    gap: 12,
  },
  airlineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  airlineInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  airlineName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  applyButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
