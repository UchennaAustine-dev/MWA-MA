import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Components
import CitySearchModal from "../../../components/hotels/CitySearchModal";
import FeaturedDestinations from "../../../components/hotels/FeaturedDestinations";
import GuestsModal from "../../../components/hotels/GuestsModal";
import HotelCard from "../../../components/hotels/HotelCard";
import SearchForm from "../../../components/hotels/SearchForm";

// Hooks and Utils
import DatePickerModal from "@/components/DatePickerModal";
import { useAppSelector } from "@/redux/hooks";
import { useHotelSearch } from "../../../hooks/useHotelSearch";
import { baseURL } from "../../../lib/api";
import {
  formatDate,
  formatPrice,
  getCurrency,
  getLowestPrice,
  getTotalGuests,
} from "../../../utils/hotelUtils";

interface City {
  code: string;
  name: string;
  country: string;
  iataCode?: string;
}

interface SearchParams {
  cityCode: string;
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children: number;
  infants: number;
  rooms: number;
}

export default function HotelsScreen() {
  const router = useRouter();
  const user: any = useAppSelector((state: any) => state.user?.user);
  const {
    hotels,
    isSearching,
    hasSearched,
    searchHotels,
    createBookingData,
    saveBookingData,
  } = useHotelSearch();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [searchParams, setSearchParams] = useState<SearchParams>({
    cityCode: "",
    checkInDate: new Date(),
    checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    adults: 1,
    children: 0,
    infants: 0,
    rooms: 1,
  });

  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [showCityModal, setShowCityModal] = useState(false);
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [hotelSuggestions, setHotelSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState<{
    type: "checkin" | "checkout" | null;
    visible: boolean;
  }>({ type: null, visible: false });
  const [tempDate, setTempDate] = useState<Date>(new Date());

  // Loading states
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);

  // Handler for date press
  const handleDatePress = (type: "checkin" | "checkout") => {
    setTempDate(
      searchParams[type === "checkin" ? "checkInDate" : "checkOutDate"]
    );
    setShowDatePicker({ type, visible: true });
  };

  // Handler for date selection
  const handleDateSelect = (date: Date) => {
    setSearchParams((prev) => ({
      ...prev,
      [showDatePicker.type === "checkin" ? "checkInDate" : "checkOutDate"]:
        date,
      ...(showDatePicker.type === "checkin" && date >= prev.checkOutDate
        ? { checkOutDate: new Date(date.getTime() + 24 * 60 * 60 * 1000) }
        : {}),
    }));
    setShowDatePicker({ type: null, visible: false });
  };

  // Featured destinations - memoized to prevent re-creation
  const featuredDestinations = useMemo(
    () => [
      {
        id: 1,
        name: "Paris",
        country: "France",
        image:
          "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400",
        hotels: "2,847 hotels",
      },
      {
        id: 2,
        name: "Tokyo",
        country: "Japan",
        image:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400",
        hotels: "1,923 hotels",
      },
      {
        id: 3,
        name: "New York",
        country: "USA",
        image:
          "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400",
        hotels: "3,156 hotels",
      },
    ],
    []
  );

  // Initialize animations - only run once
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const updateGuestCount = useCallback(
    (type: "adults" | "children" | "infants", increment: boolean) => {
      setSearchParams((prevParams) => {
        const currentCount = prevParams[type];
        let newCount = increment ? currentCount + 1 : currentCount - 1;

        if (type === "adults" && newCount < 1) newCount = 1;
        if ((type === "children" || type === "infants") && newCount < 0)
          newCount = 0;

        const otherGuestsCount = Object.entries(prevParams)
          .filter(
            ([key]) =>
              key !== type && ["adults", "children", "infants"].includes(key)
          )
          .reduce((sum, [, count]) => sum + count, 0);

        if (otherGuestsCount + newCount > 9) return prevParams;

        return {
          ...prevParams,
          [type]: newCount,
        };
      });
    },
    []
  );

  const fetchSuggestions = useCallback(async (keyword: string) => {
    if (keyword.length < 2) {
      setHotelSuggestions([]);
      return;
    }

    setSuggestionsLoading(true);
    try {
      const response = await fetch(
        `${baseURL}/hotel/hotel-autocomplete?keyword=${keyword}`
      );
      const data = await response.json();
      setHotelSuggestions(data?.data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setHotelSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  const handleCitySearchChange = useCallback(
    (text: string) => {
      setCitySearch(text);
      fetchSuggestions(text);
    },
    [fetchSuggestions]
  );

  const handleCitySelect = useCallback((city: any) => {
    setSelectedCity({
      code: city.code || city.iataCode || "",
      name: city.name || city.cityName || "",
      country: city.country || city.countryName || "",
      iataCode: city.iataCode || city.code || "",
    });
    setCitySearch("");
    setShowCityModal(false);
  }, []);

  const handleHotelSearch = useCallback(() => {
    searchHotels(searchParams, selectedCity);
  }, [searchHotels, searchParams, selectedCity]);

  const handleHotelClick = useCallback(
    async (hotel: any, selectedOffer?: any) => {
      const bookingData = createBookingData(
        hotel,
        searchParams,
        selectedCity,
        selectedOffer
      );

      await saveBookingData(bookingData);

      router.push({
        pathname: "/hotel-booking",
        params: { hotelId: hotel.hotelId },
      } as any);
    },
    [createBookingData, saveBookingData, searchParams, selectedCity, router]
  );

  // Updated refresh function - resets everything instead of re-searching
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    // Reset all state to initial values
    setSearchParams({
      cityCode: "",
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      adults: 1,
      children: 0,
      infants: 0,
      rooms: 1,
    });

    setSelectedCity(null);
    setCitySearch("");
    setHotelSuggestions([]);

    // Reset search state in the hook if needed
    // This depends on your useHotelSearch implementation

    setRefreshing(false);
  }, []);

  const renderHotelCard = useCallback(
    ({ item: hotel }: { item: any }) => (
      <HotelCard
        hotel={hotel}
        onPress={() => handleHotelClick(hotel)}
        formatPrice={formatPrice}
        getLowestPrice={getLowestPrice}
        getCurrency={getCurrency}
      />
    ),
    [handleHotelClick]
  );

  const getTotalGuestsCount = useCallback(
    () => getTotalGuests(searchParams),
    [searchParams]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#DC2626"]} // Red color for Android
            tintColor="#DC2626" // Red color for iOS
          />
        }
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.name}>{user?.firstName || "Guest"}</Text>
            </View>
            <View style={styles.headerIcons}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#000000"
              />
              <Ionicons
                name="person-circle-outline"
                size={30}
                color="#000000"
              />
            </View>
          </View>
        </Animated.View>

        {/* Search Section */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SearchForm
            searchParams={searchParams}
            selectedCity={selectedCity}
            isSearching={isSearching}
            onCityPress={() => setShowCityModal(true)}
            onDatePress={handleDatePress}
            onGuestsPress={() => setShowGuestsModal(true)}
            onSearch={handleHotelSearch}
            formatDate={formatDate}
            getTotalGuests={getTotalGuestsCount}
          />
        </Animated.View>

        {/* Featured Destinations */}
        {!hasSearched && (
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {isLoadingDestinations ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#DC2626" />
                <Text style={styles.loadingText}>Loading destinations...</Text>
              </View>
            ) : (
              <FeaturedDestinations destinations={featuredDestinations} />
            )}
          </Animated.View>
        )}

        {/* Hotel Results */}
        {hasSearched && (
          <Animated.View
            style={[
              styles.resultsSection,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {isSearching
                  ? "Searching..."
                  : `${hotels.length} Hotel${
                      hotels.length !== 1 ? "s" : ""
                    } Found`}
              </Text>
              <Text style={styles.resultsSubtitle}>
                {selectedCity?.name} • {formatDate(searchParams.checkInDate)} -{" "}
                {formatDate(searchParams.checkOutDate)}
              </Text>
            </View>

            {isSearching ? (
              <View style={styles.searchingContainer}>
                <ActivityIndicator size="large" color="#DC2626" />
                <Text style={styles.searchingText}>
                  Finding the best hotels for you...
                </Text>
              </View>
            ) : hotels.length > 0 ? (
              <FlatList
                data={hotels}
                renderItem={renderHotelCard}
                keyExtractor={(item) => item.hotelId}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.hotelsList}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={64} color="#666666" />
                <Text style={styles.noResultsTitle}>No hotels found</Text>
                <Text style={styles.noResultsText}>
                  Try adjusting your search criteria
                </Text>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Modals */}
      <CitySearchModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        citySearch={citySearch}
        onCitySearchChange={handleCitySearchChange}
        suggestions={hotelSuggestions}
        onCitySelect={handleCitySelect}
        suggestionsLoading={suggestionsLoading}
      />

      <DatePickerModal
        visible={showDatePicker.visible}
        onClose={() => setShowDatePicker({ type: null, visible: false })}
        onSelectDate={handleDateSelect}
        title={
          showDatePicker.type === "checkin"
            ? "Select Check-In Date"
            : "Select Check-Out Date"
        }
        selectedDate={tempDate}
        minimumDate={
          showDatePicker.type === "checkout"
            ? searchParams.checkInDate
            : new Date()
        }
      />

      <GuestsModal
        visible={showGuestsModal}
        onClose={() => setShowGuestsModal(false)}
        searchParams={searchParams}
        updateGuestCount={updateGuestCount}
        setSearchParams={setSearchParams}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "400",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resultsSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: "#666666",
  },
  hotelsList: {
    paddingBottom: 20,
  },
  searchingContainer: {
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginVertical: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchingText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 16,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 16,
    textAlign: "center",
  },
  noResults: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
});
