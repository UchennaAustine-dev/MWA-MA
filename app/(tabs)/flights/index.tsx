import CitySearchModal from "@/components/CitySearchModal";
import DatePickerModal from "@/components/DatePickerModal";
import FilterModal, { FilterState } from "@/components/FilterModal";
import FlightCard from "@/components/FlightCard";
import TravelerModal from "@/components/TravelerModal";
import { fetchFlightPricing, searchFlights } from "@/lib/flightAPIs";
import {
  addToCart,
  addToSearchHistory,
  setSelectedFlight,
} from "@/redux/slices/globalSlice";
import { setCurrency } from "@/redux/slices/toggleSlice";
import { AppDispatch, RootState } from "@/redux/store";
import {
  City,
  FlightOffer,
  FlightSearchParams,
  TravelerConfig,
  TripType,
} from "@/types/flight-types";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function FlightSearchScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const currency = useSelector((state: RootState) => state.toggle.currency);
  const cartItems = useSelector((state: RootState) => state.global.cartItems);
  const router = useRouter();

  // Trip configuration
  const [tripType, setTripType] = useState<TripType>("oneway");
  const [selectedFromCity, setSelectedFromCity] = useState<City>({
    code: "",
    name: "",
    country: "",
    fullName: "",
  });
  const [selectedToCity, setSelectedToCity] = useState<City>({
    code: "",
    name: "",
    country: "",
    fullName: "",
  });

  // Dates
  const today = new Date();
  const twoDaysLater = new Date();
  twoDaysLater.setDate(today.getDate() + 2);
  const [departureDate, setDepartureDate] = useState(today);
  const [returnDate, setReturnDate] = useState(twoDaysLater);

  // Travelers
  const [travelerConfig, setTravelerConfig] = useState<TravelerConfig>({
    adults: 1,
    children: 0,
    infants: 0,
    class: "Economy",
  });

  // Modal states
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [showTravelerModal, setShowTravelerModal] = useState(false);
  const [showDepartureDateModal, setShowDepartureDateModal] = useState(false);
  const [showReturnDateModal, setShowReturnDateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Search states
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FlightOffer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loadingFlightId, setLoadingFlightId] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    selectedDepartureTime: null,
    selectedStops: null,
    selectedAirlines: [],
    priceRange: [0, 100000],
  });

  // Utility functions
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "2-digit",
    };
    return date.toLocaleDateString("en-GB", options).replace(",", "'");
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const getTotalTravelers = () => {
    return (
      travelerConfig.adults + travelerConfig.children + travelerConfig.infants
    );
  };

  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const swapCities = () => {
    const tempCity = selectedFromCity;
    setSelectedFromCity(selectedToCity);
    setSelectedToCity(tempCity);
    setSearchResults([]);
    setHasSearched(false);
    setSearchError(null);
  };

  // Filter utility functions
  const getUniqueAirlines = (results: FlightOffer[]): string[] => {
    const airlines = new Set<string>();
    results.forEach((offer) => {
      offer.itineraries.forEach((itinerary) => {
        itinerary.segments.forEach((segment) => {
          airlines.add(segment.carrierCode);
        });
      });
    });
    return Array.from(airlines);
  };

  const getPriceRange = (results: FlightOffer[]): [number, number] => {
    if (!results.length) return [0, 100000];

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    results.forEach((offer) => {
      const price = Number(offer.price.grandTotal || offer.price.total);
      if (price < min) min = price;
      if (price > max) max = price;
    });

    return [min, max];
  };

  const getStopsOptions = (results: FlightOffer[]): string[] => {
    const stops = new Set<number>();
    results.forEach((offer) => {
      offer.itineraries.forEach((itinerary) => {
        stops.add(itinerary.segments.length - 1);
      });
    });

    return Array.from(stops)
      .sort((a, b) => a - b)
      .map((num) => {
        if (num === 0) return "Non-stop";
        if (num === 1) return "1 Stop";
        return "2+ Stops";
      });
  };

  // Memoized filter options
  const airlines = useMemo(
    () => getUniqueAirlines(searchResults),
    [searchResults]
  );
  const stopsOptions = useMemo(
    () => getStopsOptions(searchResults),
    [searchResults]
  );
  const [minPrice, maxPrice] = useMemo(
    () => getPriceRange(searchResults),
    [searchResults]
  );

  // Update filter price range when search results change
  React.useEffect(() => {
    if (searchResults.length > 0) {
      const [min, max] = getPriceRange(searchResults);
      setFilters((prev) => ({ ...prev, priceRange: [min, max] }));
    }
  }, [searchResults]);

  // Filtered results
  const filteredResults = useMemo(() => {
    if (!searchResults.length) return [];

    return searchResults.filter((offer) => {
      // Price filter
      const price = Number(offer.price.grandTotal || offer.price.total);
      if (price < filters.priceRange[0] || price > filters.priceRange[1])
        return false;

      // Stops filter
      if (filters.selectedStops) {
        const stops = offer.itineraries[0].segments.length - 1;
        const isMatch =
          (filters.selectedStops === "Non-stop" && stops === 0) ||
          (filters.selectedStops === "1 Stop" && stops === 1) ||
          (filters.selectedStops === "2+ Stops" && stops >= 2);
        if (!isMatch) return false;
      }

      // Airline filter
      if (filters.selectedAirlines.length > 0) {
        const offerAirlines = offer.itineraries.flatMap((itin) =>
          itin.segments.map((seg) => seg.carrierCode)
        );
        if (!filters.selectedAirlines.some((a) => offerAirlines.includes(a)))
          return false;
      }

      // Departure time filter
      if (filters.selectedDepartureTime) {
        const depTime = new Date(
          offer.itineraries[0].segments[0].departure.at
        ).getHours();
        const isMatch =
          (filters.selectedDepartureTime === "Before 6 AM" && depTime < 6) ||
          (filters.selectedDepartureTime === "6 AM - 12 PM" &&
            depTime >= 6 &&
            depTime < 12) ||
          (filters.selectedDepartureTime === "12 PM - 6 PM" &&
            depTime >= 12 &&
            depTime < 18) ||
          (filters.selectedDepartureTime === "After 6 PM" && depTime >= 18);
        if (!isMatch) return false;
      }

      return true;
    });
  }, [searchResults, filters]);

  // Search handler
  const handleFlightSearch = async () => {
    // Validation
    if (!selectedFromCity.name || !selectedToCity.name) {
      Alert.alert(
        "Error",
        "Please select both departure and destination cities."
      );
      return;
    }
    if (selectedFromCity.code === selectedToCity.code) {
      Alert.alert(
        "Error",
        "Departure and destination cities cannot be the same."
      );
      return;
    }
    if (travelerConfig.adults < 1) {
      Alert.alert("Error", "At least one adult traveler is required.");
      return;
    }
    if (tripType === "roundtrip" && !returnDate) {
      Alert.alert(
        "Error",
        "Please select a return date for round trip flights."
      );
      return;
    }

    // Save search to history
    const searchData = {
      from: selectedFromCity,
      to: selectedToCity,
      departureDate: formatDateForAPI(departureDate),
      returnDate:
        tripType === "roundtrip" ? formatDateForAPI(returnDate) : null,
      travelers: getTotalTravelers(),
      class: travelerConfig.class,
      timestamp: new Date().toISOString(),
    };
    dispatch(addToSearchHistory(searchData));

    setSearchError(null);
    setSearchResults([]);
    setIsSearching(true);
    setHasSearched(true);

    try {
      const searchParams: FlightSearchParams = {
        origin: selectedFromCity.name,
        destination: selectedToCity.name,
        adults: travelerConfig.adults,
        departureDate: formatDateForAPI(departureDate),
        currency: currency ? "NGN" : "USD", // Use the currency from toggle slice
      };

      const response = await searchFlights(searchParams);

      if (response && response.length >= 0) {
        setSearchResults(response);
      } else {
        setSearchError(
          "No flights found for the selected criteria. Please try different dates or destinations."
        );
      }
    } catch (error: any) {
      console.error("Flight search error:", error);
      setSearchError(
        error.message || "Failed to search flights. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Book flight handler
  const handleBookFlight = async (flight: FlightOffer) => {
    if (!flight) {
      Alert.alert(
        "Error",
        "Invalid flight data. Please select a valid flight."
      );
      return;
    }

    setLoadingFlightId(flight.id);
    console.log(`Flight`, flight);

    try {
      const pricingOffers: any = await fetchFlightPricing(flight);

      if (
        !pricingOffers ||
        !pricingOffers.flightOffers ||
        pricingOffers.flightOffers.length === 0
      ) {
        Alert.alert(
          "Error",
          "No pricing information available for this flight."
        );
        return;
      }

      const offer = pricingOffers.flightOffers[0];
      console.log(`offer`, offer);

      const priceTotal = Number.parseFloat(offer.price.total);

      if (isNaN(priceTotal) || priceTotal <= 0) {
        Alert.alert(
          "Error",
          "Invalid flight price. Please select a flight with a valid price."
        );
        return;
      }

      // Use the new Redux actions
      dispatch(setSelectedFlight(flight));
      dispatch(addToCart(flight));

      Alert.alert("Success", `Flight booking initiated for ${flight.id}`);

      // Navigate to payment page
      router.push("/traveler-details");
    } catch (error: any) {
      Alert.alert(
        "Error",
        "Failed to verify flight pricing. Please try again."
      );
      console.error("Error verifying flight pricing:", error);
    } finally {
      setLoadingFlightId(null);
    }
  };

  const renderFlightItem = ({ item }: { item: FlightOffer }) => (
    <FlightCard
      flight={item}
      onBook={handleBookFlight}
      loading={loadingFlightId === item.id}
    />
  );

  // Add this useEffect to handle modal cleanup
  React.useEffect(() => {
    // Cleanup function to ensure modals are closed when component unmounts
    return () => {
      setShowFromModal(false);
      setShowToModal(false);
      setShowTravelerModal(false);
      setShowDepartureDateModal(false);
      setShowReturnDateModal(false);
      setShowFilterModal(false);
    };
  }, []);

  // Add these handlers for better modal management
  const handleCloseDepartureModal = () => {
    setShowDepartureDateModal(false);
  };

  const handleCloseReturnModal = () => {
    setShowReturnDateModal(false);
  };

  const handleSelectDepartureDate = (date: Date) => {
    setDepartureDate(date);
    setShowDepartureDateModal(false);
  };

  const handleSelectReturnDate = (date: Date) => {
    setReturnDate(date);
    setShowReturnDateModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{user?.firstName || "Guest"}</Text>
          </View>
          <View style={styles.headerActions}>
            {/* Currency Picker */}
            <View style={styles.currencyPickerContainer}>
              <Picker
                selectedValue={currency ? "NGN" : "USD"}
                style={styles.picker}
                onValueChange={(value) => {
                  dispatch(setCurrency(value === "NGN"));
                }}
                mode="dropdown"
              >
                <Picker.Item label="Naira (₦)" value="NGN" />
                <Picker.Item label="Dollar ($)" value="USD" />
              </Picker>
            </View>
            {/* Cart Button */}
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push("/cart")}
            >
              <Ionicons name="bag-outline" size={24} color="#333" />
              {cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            {/* Profile Avatar */}
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => router.push("/profile")}
            >
              <Ionicons name="person" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        {/* <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{user?.firstName || "Guest"}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push("/cart")}
            >
              <Ionicons name="bag-outline" size={24} color="#333" />
              {cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => router.push("/profile")}
            >
              <Ionicons name="person" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View> */}

        {/* Trip Type Selection */}
        <View style={styles.tripTypeContainer}>
          <TouchableOpacity
            onPress={() => setTripType("oneway")}
            style={[
              styles.tripTypeButton,
              tripType === "oneway" && styles.tripTypeSelected,
            ]}
          >
            <Text
              style={[
                styles.tripTypeText,
                tripType === "oneway" && styles.tripTypeTextSelected,
              ]}
            >
              One Way
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTripType("roundtrip")}
            style={[
              styles.tripTypeButton,
              tripType === "roundtrip" && styles.tripTypeSelected,
            ]}
          >
            <Text
              style={[
                styles.tripTypeText,
                tripType === "roundtrip" && styles.tripTypeTextSelected,
              ]}
            >
              Round Trip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Form */}
        <View style={styles.searchCard}>
          {/* From/To Cities */}
          <View style={styles.citiesContainer}>
            <TouchableOpacity
              style={styles.cityButton}
              onPress={() => setShowFromModal(true)}
            >
              <Text style={styles.cityLabel}>From</Text>
              <Text style={styles.cityName}>
                {selectedFromCity.name || "Select City"}
              </Text>
              <Text style={styles.cityCode}>
                {selectedFromCity.code
                  ? `${selectedFromCity.code}, ${selectedFromCity.country}`
                  : ""}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.swapButton} onPress={swapCities}>
              <Ionicons name="swap-vertical" size={20} color="#007AFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cityButton}
              onPress={() => setShowToModal(true)}
            >
              <Text style={styles.cityLabel}>To</Text>
              <Text style={styles.cityName}>
                {selectedToCity.name || "Select City"}
              </Text>
              <Text style={styles.cityCode}>
                {selectedToCity.code
                  ? `${selectedToCity.code}, ${selectedToCity.country}`
                  : ""}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dates and Passengers */}
          <View style={styles.detailsContainer}>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => setShowDepartureDateModal(true)}
            >
              <Text style={styles.detailLabel}>Departure</Text>
              <Text style={styles.detailValue}>
                {formatDate(departureDate)}
              </Text>
              <Text style={styles.detailSubValue}>
                {getDayName(departureDate)}
              </Text>
            </TouchableOpacity>

            {tripType === "roundtrip" && (
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => setShowReturnDateModal(true)}
              >
                <Text style={styles.detailLabel}>Return</Text>
                <Text style={styles.detailValue}>{formatDate(returnDate)}</Text>
                <Text style={styles.detailSubValue}>
                  {getDayName(returnDate)}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => setShowTravelerModal(true)}
            >
              <Text style={styles.detailLabel}>Passengers</Text>
              <Text style={styles.detailValue}>
                {getTotalTravelers()} Traveler
                {getTotalTravelers() > 1 ? "s" : ""}
              </Text>
              <Text style={styles.detailSubValue}>{travelerConfig.class}</Text>
            </TouchableOpacity>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={[
              styles.searchButton,
              isSearching && styles.searchButtonDisabled,
            ]}
            onPress={handleFlightSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.searchButtonText}>Search Flights</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {searchError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#d32f2f" />
            <Text style={styles.errorText}>{searchError}</Text>
          </View>
        )}

        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Searching for flights...</Text>
            <Text style={styles.loadingSubText}>
              Please wait while we find the best options for you.
            </Text>
          </View>
        )}

        {hasSearched &&
          !isSearching &&
          searchResults.length === 0 &&
          !searchError && (
            <View style={styles.emptyContainer}>
              <Ionicons name="airplane" size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>No flights found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search criteria or dates.
              </Text>
            </View>
          )}

        {hasSearched && !isSearching && searchResults.length > 0 && (
          <>
            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {selectedFromCity.name} → {selectedToCity.name}
              </Text>
              <View style={styles.resultsActions}>
                <Text style={styles.resultsCount}>
                  {filteredResults.length} of {searchResults.length} flights
                </Text>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowFilterModal(true)}
                >
                  <Ionicons name="filter" size={16} color="#007AFF" />
                  <Text style={styles.filterButtonText}>Filter</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Flight Results */}
            <FlatList
              data={filteredResults}
              renderItem={renderFlightItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <CitySearchModal
        visible={showFromModal}
        onClose={() => setShowFromModal(false)}
        onSelectCity={setSelectedFromCity}
        title="Select Departure City"
        selectedCity={selectedFromCity}
      />

      <CitySearchModal
        visible={showToModal}
        onClose={() => setShowToModal(false)}
        onSelectCity={setSelectedToCity}
        title="Select Destination City"
        selectedCity={selectedToCity}
      />

      <TravelerModal
        visible={showTravelerModal}
        onClose={() => setShowTravelerModal(false)}
        travelerConfig={travelerConfig}
        onUpdateTravelers={setTravelerConfig}
      />

      <DatePickerModal
        visible={showDepartureDateModal}
        onClose={handleCloseDepartureModal}
        onSelectDate={handleSelectDepartureDate}
        title="Select Departure Date"
        selectedDate={departureDate}
        minimumDate={new Date()}
      />

      <DatePickerModal
        visible={showReturnDateModal}
        onClose={handleCloseReturnModal}
        onSelectDate={handleSelectReturnDate}
        title="Select Return Date"
        selectedDate={returnDate}
        minimumDate={departureDate}
      />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={setFilters}
        airlines={airlines}
        priceRange={[minPrice || 0, maxPrice || 100000]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currencyPickerContainer: {
    width: 110,
    marginRight: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  picker: {
    height: 40,
    width: "100%",
  },

  cartButton: {
    position: "relative",
    padding: 8,
  },
  cartBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#d32f2f",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  tripTypeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    padding: 4,
  },
  tripTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  tripTypeSelected: {
    backgroundColor: "#007AFF",
  },
  tripTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tripTypeTextSelected: {
    color: "#fff",
  },
  searchCard: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  citiesContainer: {
    marginBottom: 20,
  },
  cityButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cityLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  cityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  cityCode: {
    fontSize: 14,
    color: "#666",
  },
  swapButton: {
    alignSelf: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 20,
    padding: 10,
    marginVertical: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  detailButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  detailSubValue: {
    fontSize: 12,
    color: "#666",
  },
  searchButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#d32f2f",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  resultsHeader: {
    margin: 20,
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  resultsActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultsCount: {
    fontSize: 14,
    color: "#666",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
});

// import CitySearchModal from "@/components/CitySearchModal";
// import DatePickerModal from "@/components/DatePickerModal";
// import FilterModal, { FilterState } from "@/components/FilterModal";
// import FlightCard from "@/components/FlightCard";
// import TravelerModal from "@/components/TravelerModal";
// import { fetchFlightPricing, searchFlights } from "@/lib/flightAPIs";
// import {
//   addToCart,
//   addToSearchHistory,
//   setSelectedFlight,
// } from "@/redux/slices/globalSlice";
// import { AppDispatch, RootState } from "@/redux/store";
// import {
//   City,
//   FlightOffer,
//   FlightSearchParams,
//   TravelerConfig,
//   TripType,
// } from "@/types/flight-types";
// import { Ionicons } from "@expo/vector-icons";
// import React, { useMemo, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useDispatch, useSelector } from "react-redux";

// export default function FlightSearchScreen() {
//   const dispatch = useDispatch<AppDispatch>();
//   const user = useSelector((state: RootState) => state.auth.user);
//   const currency = useSelector((state: RootState) => state.toggle.currency);

//   // Trip configuration
//   const [tripType, setTripType] = useState<TripType>("oneway");
//   const [selectedFromCity, setSelectedFromCity] = useState<City>({
//     code: "",
//     name: "",
//     country: "",
//     fullName: "",
//   });

//   const [selectedToCity, setSelectedToCity] = useState<City>({
//     code: "",
//     name: "",
//     country: "",
//     fullName: "",
//   });

//   // Dates
//   const today = new Date();
//   const twoDaysLater = new Date();
//   twoDaysLater.setDate(today.getDate() + 2);
//   const [departureDate, setDepartureDate] = useState(today);
//   const [returnDate, setReturnDate] = useState(twoDaysLater);

//   // Travelers
//   const [travelerConfig, setTravelerConfig] = useState<TravelerConfig>({
//     adults: 1,
//     children: 0,
//     infants: 0,
//     class: "Economy",
//   });

//   // Modal states
//   const [showFromModal, setShowFromModal] = useState(false);
//   const [showToModal, setShowToModal] = useState(false);
//   const [showTravelerModal, setShowTravelerModal] = useState(false);
//   const [showDepartureDateModal, setShowDepartureDateModal] = useState(false);
//   const [showReturnDateModal, setShowReturnDateModal] = useState(false);
//   const [showFilterModal, setShowFilterModal] = useState(false);

//   // Search states
//   const [isSearching, setIsSearching] = useState(false);
//   const [searchResults, setSearchResults] = useState<FlightOffer[]>([]);
//   const [hasSearched, setHasSearched] = useState(false);
//   const [searchError, setSearchError] = useState<string | null>(null);
//   const [loadingFlightId, setLoadingFlightId] = useState<string | null>(null);

//   // Filter states
//   const [filters, setFilters] = useState<FilterState>({
//     selectedDepartureTime: null,
//     selectedStops: null,
//     selectedAirlines: [],
//     priceRange: [0, 100000],
//   });

//   // Utility functions
//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return "Good morning";
//     if (hour < 18) return "Good afternoon";
//     return "Good evening";
//   };

//   const formatDate = (date: Date) => {
//     const options: Intl.DateTimeFormatOptions = {
//       day: "numeric",
//       month: "short",
//       year: "2-digit",
//     };
//     return date.toLocaleDateString("en-GB", options).replace(",", "'");
//   };

//   const getDayName = (date: Date) => {
//     return date.toLocaleDateString("en-US", { weekday: "long" });
//   };

//   const getTotalTravelers = () => {
//     return (
//       travelerConfig.adults + travelerConfig.children + travelerConfig.infants
//     );
//   };

//   const formatDateForAPI = (date: Date) => {
//     return date.toISOString().split("T")[0];
//   };

//   const swapCities = () => {
//     const tempCity = selectedFromCity;
//     setSelectedFromCity(selectedToCity);
//     setSelectedToCity(tempCity);
//     setSearchResults([]);
//     setHasSearched(false);
//     setSearchError(null);
//   };

//   // Filter utility functions
//   const getUniqueAirlines = (results: FlightOffer[]): string[] => {
//     const airlines = new Set<string>();
//     results.forEach((offer) => {
//       offer.itineraries.forEach((itinerary) => {
//         itinerary.segments.forEach((segment) => {
//           airlines.add(segment.carrierCode);
//         });
//       });
//     });
//     return Array.from(airlines);
//   };

//   const getPriceRange = (results: FlightOffer[]): [number, number] => {
//     if (!results.length) return [0, 100000];

//     let min = Number.POSITIVE_INFINITY;
//     let max = Number.NEGATIVE_INFINITY;

//     results.forEach((offer) => {
//       const price = Number(offer.price.grandTotal || offer.price.total);
//       if (price < min) min = price;
//       if (price > max) max = price;
//     });

//     return [min, max];
//   };

//   const getStopsOptions = (results: FlightOffer[]): string[] => {
//     const stops = new Set<number>();
//     results.forEach((offer) => {
//       offer.itineraries.forEach((itinerary) => {
//         stops.add(itinerary.segments.length - 1);
//       });
//     });

//     return Array.from(stops)
//       .sort((a, b) => a - b)
//       .map((num) => {
//         if (num === 0) return "Non-stop";
//         if (num === 1) return "1 Stop";
//         return "2+ Stops";
//       });
//   };

//   // Memoized filter options
//   const airlines = useMemo(
//     () => getUniqueAirlines(searchResults),
//     [searchResults]
//   );
//   const stopsOptions = useMemo(
//     () => getStopsOptions(searchResults),
//     [searchResults]
//   );
//   const [minPrice, maxPrice] = useMemo(
//     () => getPriceRange(searchResults),
//     [searchResults]
//   );

//   // Update filter price range when search results change
//   React.useEffect(() => {
//     if (searchResults.length > 0) {
//       const [min, max] = getPriceRange(searchResults);
//       setFilters((prev) => ({ ...prev, priceRange: [min, max] }));
//     }
//   }, [searchResults]);

//   // Filtered results
//   const filteredResults = useMemo(() => {
//     if (!searchResults.length) return [];

//     return searchResults.filter((offer) => {
//       // Price filter
//       const price = Number(offer.price.grandTotal || offer.price.total);
//       if (price < filters.priceRange[0] || price > filters.priceRange[1])
//         return false;

//       // Stops filter
//       if (filters.selectedStops) {
//         const stops = offer.itineraries[0].segments.length - 1;
//         const isMatch =
//           (filters.selectedStops === "Non-stop" && stops === 0) ||
//           (filters.selectedStops === "1 Stop" && stops === 1) ||
//           (filters.selectedStops === "2+ Stops" && stops >= 2);
//         if (!isMatch) return false;
//       }

//       // Airline filter
//       if (filters.selectedAirlines.length > 0) {
//         const offerAirlines = offer.itineraries.flatMap((itin) =>
//           itin.segments.map((seg) => seg.carrierCode)
//         );
//         if (!filters.selectedAirlines.some((a) => offerAirlines.includes(a)))
//           return false;
//       }

//       // Departure time filter
//       if (filters.selectedDepartureTime) {
//         const depTime = new Date(
//           offer.itineraries[0].segments[0].departure.at
//         ).getHours();
//         const isMatch =
//           (filters.selectedDepartureTime === "Before 6 AM" && depTime < 6) ||
//           (filters.selectedDepartureTime === "6 AM - 12 PM" &&
//             depTime >= 6 &&
//             depTime < 12) ||
//           (filters.selectedDepartureTime === "12 PM - 6 PM" &&
//             depTime >= 12 &&
//             depTime < 18) ||
//           (filters.selectedDepartureTime === "After 6 PM" && depTime >= 18);
//         if (!isMatch) return false;
//       }

//       return true;
//     });
//   }, [searchResults, filters]);

//   // Search handler
//   const handleFlightSearch = async () => {
//     // Validation
//     if (!selectedFromCity.name || !selectedToCity.name) {
//       Alert.alert(
//         "Error",
//         "Please select both departure and destination cities."
//       );
//       return;
//     }
//     if (selectedFromCity.code === selectedToCity.code) {
//       Alert.alert(
//         "Error",
//         "Departure and destination cities cannot be the same."
//       );
//       return;
//     }
//     if (travelerConfig.adults < 1) {
//       Alert.alert("Error", "At least one adult traveler is required.");
//       return;
//     }
//     if (tripType === "roundtrip" && !returnDate) {
//       Alert.alert(
//         "Error",
//         "Please select a return date for round trip flights."
//       );
//       return;
//     }

//     // Save search to history
//     const searchData = {
//       from: selectedFromCity,
//       to: selectedToCity,
//       departureDate: formatDateForAPI(departureDate),
//       returnDate:
//         tripType === "roundtrip" ? formatDateForAPI(returnDate) : null,
//       travelers: getTotalTravelers(),
//       class: travelerConfig.class,
//       timestamp: new Date().toISOString(),
//     };
//     dispatch(addToSearchHistory(searchData));

//     setSearchError(null);
//     setSearchResults([]);
//     setIsSearching(true);
//     setHasSearched(true);

//     try {
//       const searchParams: FlightSearchParams = {
//         origin: selectedFromCity.name,
//         destination: selectedToCity.name,
//         adults: travelerConfig.adults,
//         departureDate: formatDateForAPI(departureDate),
//         currency: currency ? "NGN" : "USD", // Use the currency from toggle slice
//       };

//       const response = await searchFlights(searchParams);

//       if (response && response.length >= 0) {
//         setSearchResults(response);
//       } else {
//         setSearchError(
//           "No flights found for the selected criteria. Please try different dates or destinations."
//         );
//       }
//     } catch (error: any) {
//       console.error("Flight search error:", error);
//       setSearchError(
//         error.message || "Failed to search flights. Please try again."
//       );
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   // Book flight handler
//   const handleBookFlight = async (flight: FlightOffer) => {
//     if (!flight) {
//       Alert.alert(
//         "Error",
//         "Invalid flight data. Please select a valid flight."
//       );
//       return;
//     }

//     setLoadingFlightId(flight.id);

//     try {
//       const pricingOffers = await fetchFlightPricing(flight);

//       if (!pricingOffers || pricingOffers.length === 0) {
//         Alert.alert(
//           "Error",
//           "No pricing information available for this flight."
//         );
//         return;
//       }

//       const offer = pricingOffers[0];
//       const priceTotal = Number.parseFloat(offer.price.total);

//       if (isNaN(priceTotal) || priceTotal <= 0) {
//         Alert.alert(
//           "Error",
//           "Invalid flight price. Please select a flight with a valid price."
//         );
//         return;
//       }

//       // Use the new Redux actions
//       dispatch(setSelectedFlight(flight));
//       dispatch(addToCart(flight));

//       Alert.alert("Success", `Flight booking initiated for ${flight.id}`);
//       // Navigate to booking details or traveler details screen
//     } catch (error: any) {
//       Alert.alert(
//         "Error",
//         "Failed to verify flight pricing. Please try again."
//       );
//       console.error("Error verifying flight pricing:", error);
//     } finally {
//       setLoadingFlightId(null);
//     }
//   };

//   const renderFlightItem = ({ item }: { item: FlightOffer }) => (
//     <FlightCard
//       flight={item}
//       onBook={handleBookFlight}
//       loading={loadingFlightId === item.id}
//     />
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Header */}
//         <View style={styles.header}>
//           <View>
//             <Text style={styles.greeting}>{getGreeting()},</Text>
//             <Text style={styles.name}>{user?.firstName || "Guest"}</Text>
//           </View>
//           <TouchableOpacity style={styles.avatar}>
//             <Ionicons name="person" size={20} color="#666" />
//           </TouchableOpacity>
//         </View>

//         {/* Trip Type Selection */}
//         <View style={styles.tripTypeContainer}>
//           <TouchableOpacity
//             onPress={() => setTripType("oneway")}
//             style={[
//               styles.tripTypeButton,
//               tripType === "oneway" && styles.tripTypeSelected,
//             ]}
//           >
//             <Text
//               style={[
//                 styles.tripTypeText,
//                 tripType === "oneway" && styles.tripTypeTextSelected,
//               ]}
//             >
//               One Way
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => setTripType("roundtrip")}
//             style={[
//               styles.tripTypeButton,
//               tripType === "roundtrip" && styles.tripTypeSelected,
//             ]}
//           >
//             <Text
//               style={[
//                 styles.tripTypeText,
//                 tripType === "roundtrip" && styles.tripTypeTextSelected,
//               ]}
//             >
//               Round Trip
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Search Form */}
//         <View style={styles.searchCard}>
//           {/* From/To Cities */}
//           <View style={styles.citiesContainer}>
//             <TouchableOpacity
//               style={styles.cityButton}
//               onPress={() => setShowFromModal(true)}
//             >
//               <Text style={styles.cityLabel}>From</Text>
//               <Text style={styles.cityName}>
//                 {selectedFromCity.name || "Select City"}
//               </Text>
//               <Text style={styles.cityCode}>
//                 {selectedFromCity.code
//                   ? `${selectedFromCity.code}, ${selectedFromCity.country}`
//                   : ""}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.swapButton} onPress={swapCities}>
//               <Ionicons name="swap-vertical" size={20} color="#007AFF" />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.cityButton}
//               onPress={() => setShowToModal(true)}
//             >
//               <Text style={styles.cityLabel}>To</Text>
//               <Text style={styles.cityName}>
//                 {selectedToCity.name || "Select City"}
//               </Text>
//               <Text style={styles.cityCode}>
//                 {selectedToCity.code
//                   ? `${selectedToCity.code}, ${selectedToCity.country}`
//                   : ""}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* Dates and Passengers */}
//           <View style={styles.detailsContainer}>
//             <TouchableOpacity
//               style={styles.detailButton}
//               onPress={() => setShowDepartureDateModal(true)}
//             >
//               <Text style={styles.detailLabel}>Departure</Text>
//               <Text style={styles.detailValue}>
//                 {formatDate(departureDate)}
//               </Text>
//               <Text style={styles.detailSubValue}>
//                 {getDayName(departureDate)}
//               </Text>
//             </TouchableOpacity>

//             {tripType === "roundtrip" && (
//               <TouchableOpacity
//                 style={styles.detailButton}
//                 onPress={() => setShowReturnDateModal(true)}
//               >
//                 <Text style={styles.detailLabel}>Return</Text>
//                 <Text style={styles.detailValue}>{formatDate(returnDate)}</Text>
//                 <Text style={styles.detailSubValue}>
//                   {getDayName(returnDate)}
//                 </Text>
//               </TouchableOpacity>
//             )}

//             <TouchableOpacity
//               style={styles.detailButton}
//               onPress={() => setShowTravelerModal(true)}
//             >
//               <Text style={styles.detailLabel}>Passengers</Text>
//               <Text style={styles.detailValue}>
//                 {getTotalTravelers()} Traveler
//                 {getTotalTravelers() > 1 ? "s" : ""}
//               </Text>
//               <Text style={styles.detailSubValue}>{travelerConfig.class}</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Search Button */}
//           <TouchableOpacity
//             style={[
//               styles.searchButton,
//               isSearching && styles.searchButtonDisabled,
//             ]}
//             onPress={handleFlightSearch}
//             disabled={isSearching}
//           >
//             {isSearching ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <>
//                 <Ionicons name="search" size={20} color="#fff" />
//                 <Text style={styles.searchButtonText}>Search Flights</Text>
//               </>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Search Results */}
//         {searchError && (
//           <View style={styles.errorContainer}>
//             <Ionicons name="alert-circle" size={20} color="#d32f2f" />
//             <Text style={styles.errorText}>{searchError}</Text>
//           </View>
//         )}

//         {isSearching && (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#007AFF" />
//             <Text style={styles.loadingText}>Searching for flights...</Text>
//             <Text style={styles.loadingSubText}>
//               Please wait while we find the best options for you.
//             </Text>
//           </View>
//         )}

//         {hasSearched &&
//           !isSearching &&
//           searchResults.length === 0 &&
//           !searchError && (
//             <View style={styles.emptyContainer}>
//               <Ionicons name="airplane" size={48} color="#ccc" />
//               <Text style={styles.emptyTitle}>No flights found</Text>
//               <Text style={styles.emptyText}>
//                 Try adjusting your search criteria or dates.
//               </Text>
//             </View>
//           )}

//         {hasSearched && !isSearching && searchResults.length > 0 && (
//           <>
//             {/* Results Header */}
//             <View style={styles.resultsHeader}>
//               <Text style={styles.resultsTitle}>
//                 {selectedFromCity.name} → {selectedToCity.name}
//               </Text>
//               <View style={styles.resultsActions}>
//                 <Text style={styles.resultsCount}>
//                   {filteredResults.length} of {searchResults.length} flights
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.filterButton}
//                   onPress={() => setShowFilterModal(true)}
//                 >
//                   <Ionicons name="filter" size={16} color="#007AFF" />
//                   <Text style={styles.filterButtonText}>Filter</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Flight Results */}
//             <FlatList
//               data={filteredResults}
//               renderItem={renderFlightItem}
//               keyExtractor={(item) => item.id}
//               scrollEnabled={false}
//               showsVerticalScrollIndicator={false}
//             />
//           </>
//         )}
//       </ScrollView>

//       {/* Modals */}
//       <CitySearchModal
//         visible={showFromModal}
//         onClose={() => setShowFromModal(false)}
//         onSelectCity={setSelectedFromCity}
//         title="Select Departure City"
//         selectedCity={selectedFromCity}
//       />

//       <CitySearchModal
//         visible={showToModal}
//         onClose={() => setShowToModal(false)}
//         onSelectCity={setSelectedToCity}
//         title="Select Destination City"
//         selectedCity={selectedToCity}
//       />

//       <TravelerModal
//         visible={showTravelerModal}
//         onClose={() => setShowTravelerModal(false)}
//         travelerConfig={travelerConfig}
//         onUpdateTravelers={setTravelerConfig}
//       />

//       <DatePickerModal
//         visible={showDepartureDateModal}
//         onClose={() => setShowDepartureDateModal(false)}
//         onSelectDate={setDepartureDate}
//         title="Select Departure Date"
//         selectedDate={departureDate}
//         minimumDate={new Date()}
//       />

//       <DatePickerModal
//         visible={showReturnDateModal}
//         onClose={() => setShowReturnDateModal(false)}
//         onSelectDate={setReturnDate}
//         title="Select Return Date"
//         selectedDate={returnDate}
//         minimumDate={departureDate}
//       />

//       <FilterModal
//         visible={showFilterModal}
//         onClose={() => setShowFilterModal(false)}
//         onApplyFilters={setFilters}
//         airlines={airlines}
//         priceRange={[minPrice || 0, maxPrice || 100000]}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     paddingTop: 10,
//   },
//   greeting: {
//     fontSize: 16,
//     color: "#666",
//     fontWeight: "400",
//   },
//   name: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333",
//     marginTop: 2,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#e0e0e0",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   tripTypeContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginHorizontal: 20,
//     marginBottom: 20,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 25,
//     padding: 4,
//   },
//   tripTypeButton: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     alignItems: "center",
//   },
//   tripTypeSelected: {
//     backgroundColor: "#007AFF",
//   },
//   tripTypeText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#666",
//   },
//   tripTypeTextSelected: {
//     color: "#fff",
//   },
//   searchCard: {
//     backgroundColor: "#fff",
//     margin: 20,
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   citiesContainer: {
//     marginBottom: 20,
//   },
//   cityButton: {
//     backgroundColor: "#f8f9fa",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//   },
//   cityLabel: {
//     fontSize: 12,
//     color: "#666",
//     marginBottom: 4,
//     fontWeight: "500",
//   },
//   cityName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 2,
//   },
//   cityCode: {
//     fontSize: 14,
//     color: "#666",
//   },
//   swapButton: {
//     alignSelf: "center",
//     backgroundColor: "#e3f2fd",
//     borderRadius: 20,
//     padding: 10,
//     marginVertical: 8,
//   },
//   detailsContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 12,
//     marginBottom: 20,
//   },
//   detailButton: {
//     flex: 1,
//     minWidth: "45%",
//     backgroundColor: "#f8f9fa",
//     borderRadius: 12,
//     padding: 16,
//   },
//   detailLabel: {
//     fontSize: 12,
//     color: "#666",
//     marginBottom: 4,
//     fontWeight: "500",
//   },
//   detailValue: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 2,
//   },
//   detailSubValue: {
//     fontSize: 12,
//     color: "#666",
//   },
//   searchButton: {
//     backgroundColor: "#007AFF",
//     borderRadius: 12,
//     paddingVertical: 16,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//   },
//   searchButtonDisabled: {
//     opacity: 0.6,
//   },
//   searchButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   errorContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#ffebee",
//     margin: 20,
//     padding: 16,
//     borderRadius: 12,
//     gap: 12,
//   },
//   errorText: {
//     flex: 1,
//     fontSize: 14,
//     color: "#d32f2f",
//   },
//   loadingContainer: {
//     alignItems: "center",
//     padding: 40,
//     margin: 20,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//   },
//   loadingText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   loadingSubText: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//   },
//   emptyContainer: {
//     alignItems: "center",
//     padding: 40,
//     margin: 20,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyText: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//   },
//   resultsHeader: {
//     margin: 20,
//     marginBottom: 12,
//   },
//   resultsTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 8,
//   },
//   resultsActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   resultsCount: {
//     fontSize: 14,
//     color: "#666",
//   },
//   filterButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#e3f2fd",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     gap: 4,
//   },
//   filterButtonText: {
//     fontSize: 14,
//     color: "#007AFF",
//     fontWeight: "500",
//   },
// });
