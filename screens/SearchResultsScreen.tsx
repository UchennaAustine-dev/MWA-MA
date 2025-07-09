import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import FilterModal, { type FilterState } from "@/components/FilterModal";
import FlightCard from "@/components/FlightCard";
import { addFlightToCart, fetchFlightPricing } from "@/lib/flightAPIs";
import { setSelectedFlight } from "@/redux/slices/flightSlice";

import { useAirlineDetails } from "@/hooks/useAirlineDetails";
import type { AppDispatch, RootState } from "@/redux/store";
import type { FlightOffer } from "@/types/flight-types";

// FlightItem component to fetch and display airline details
const FlightItem = React.memo(
  ({
    flight,
    onBook,
    loading,
  }: {
    flight: FlightOffer;
    onBook: (flight: FlightOffer) => void;
    loading: boolean;
  }) => {
    const carrierCode =
      flight.itineraries?.[0]?.segments?.[0]?.carrierCode || "";
    const { airlineDetails, loading: airlineLoading } =
      useAirlineDetails(carrierCode);

    // Adjust property based on your AirlineDetails structure
    const airlineName =
      airlineDetails?.name || airlineDetails?.commonName || carrierCode;

    return (
      <FlightCard
        flight={flight}
        onBook={onBook}
        loading={loading}
        airlineName={airlineName}
        airlineLoading={airlineLoading}
      />
    );
  }
);

export default function SearchResultsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const searchResults = useSelector(
    (state: RootState) => state.flight.searchResults
  );
  const user = useSelector((state: RootState) => state.user.user);

  const [loadingFlightId, setLoadingFlightId] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    selectedDepartureTime: null,
    selectedStops: null,
    selectedAirlines: [],
    priceRange: [0, 100000],
  });

  // Extract unique airlines from search results
  const airlines = useMemo(() => {
    const airlineSet = new Set<string>();
    searchResults.forEach((offer) => {
      offer.itineraries.forEach((itin) => {
        itin.segments.forEach((seg) => {
          airlineSet.add(seg.carrierCode);
        });
      });
    });
    return Array.from(airlineSet);
  }, [searchResults]);

  // Calculate price range from search results
  const [minPrice, maxPrice] = useMemo(() => {
    if (!searchResults.length) return [0, 100000];
    let min = Infinity;
    let max = -Infinity;
    searchResults.forEach((offer) => {
      const price = Number(offer.price.grandTotal || offer.price.total);
      if (price < min) min = price;
      if (price > max) max = price;
    });
    return [min, max];
  }, [searchResults]);

  // Update price range filter when search results change
  useEffect(() => {
    if (searchResults.length > 0) {
      const [min, max] = (() => {
        let min = Infinity;
        let max = -Infinity;
        searchResults.forEach((offer) => {
          const price = Number(offer.price.grandTotal || offer.price.total);
          if (price < min) min = price;
          if (price > max) max = price;
        });
        return [min, max];
      })();
      setFilters((prev) => ({ ...prev, priceRange: [min, max] }));
    }
  }, [searchResults]);

  // Filter flights based on filters
  const filteredResults = useMemo(() => {
    if (!searchResults.length) return [];

    return searchResults.filter((offer) => {
      const price = Number(offer.price.grandTotal || offer.price.total);
      if (price < filters.priceRange[0] || price > filters.priceRange[1])
        return false;

      if (filters.selectedStops) {
        const stops = offer.itineraries[0].segments.length - 1;
        const isMatch =
          (filters.selectedStops === "Non-stop" && stops === 0) ||
          (filters.selectedStops === "1 Stop" && stops === 1) ||
          (filters.selectedStops === "2+ Stops" && stops >= 2);
        if (!isMatch) return false;
      }

      if (filters.selectedAirlines.length > 0) {
        const offerAirlines = offer.itineraries.flatMap((itin) =>
          itin.segments.map((seg) => seg.carrierCode)
        );
        if (!filters.selectedAirlines.some((a) => offerAirlines.includes(a)))
          return false;
      }

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

  // Handle booking a flight
  const handleBookFlight = useCallback(
    async (flight: FlightOffer) => {
      if (!flight) {
        Alert.alert(
          "Error",
          "Invalid flight data. Please select a valid flight."
        );
        return;
      }

      setLoadingFlightId(flight.id);

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
        const priceTotal = Number.parseFloat(offer.price.total);

        if (isNaN(priceTotal) || priceTotal <= 0) {
          Alert.alert(
            "Error",
            "Invalid flight price. Please select a flight with a valid price."
          );
          return;
        }

        if (user?.id) {
          try {
            await addFlightToCart(user.id, { flightData: flight });
          } catch (error) {
            console.error("Error adding to cart API:", error);
            Alert.alert(
              "Error",
              "Failed to add flight to cart. Please try again."
            );
            return;
          }
        }

        dispatch(setSelectedFlight(flight));

        Alert.alert(
          "Flight Added to Cart",
          "Your selected flight has been successfully added to your cart. What would you like to do next?",
          [
            {
              text: "Continue Browsing Flights",
              style: "cancel",
            },
            {
              text: "View Cart",
              onPress: () => router.push("/cart" as any),
            },
            {
              text: "Proceed to Booking",
              onPress: () => router.push("/traveler-details" as any),
            },
          ]
        );
      } catch (error) {
        Alert.alert("Error", "Failed to add flight to cart. Please try again.");
        console.error("Error adding to cart:", error);
      } finally {
        setLoadingFlightId(null);
      }
    },
    [dispatch, router, user?.id]
  );

  // Render flight item using FlightItem component
  const renderFlightItem = useCallback(
    ({ item }: { item: FlightOffer }) => (
      <FlightItem
        flight={item}
        onBook={handleBookFlight}
        loading={loadingFlightId === item.id}
      />
    ),
    [handleBookFlight, loadingFlightId]
  );

  if (!searchResults.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Results</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="airplane" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No flights found</Text>
          <Text style={styles.emptyText}>
            Try adjusting your search criteria or dates.
          </Text>
          <TouchableOpacity
            style={styles.searchAgainButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Search again"
          >
            <Text style={styles.searchAgainButtonText}>Search Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
        >
          <Ionicons name="filter" size={20} color="#d32f2f" />
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={styles.resultsCountText}>
          {filteredResults.length} of {searchResults.length} flights found
        </Text>
      </View>

      {/* Flight Results List */}
      <FlatList
        data={filteredResults}
        renderItem={renderFlightItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="filter" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No flights match your filters</Text>
            <Text style={styles.emptyText}>
              Try adjusting your filter criteria.
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
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
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  filterButton: {
    padding: 8,
    backgroundColor: "#fde3e3",
    borderRadius: 20,
  },
  placeholder: {
    width: 40,
  },
  resultsCount: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultsCountText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 16,
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
    marginBottom: 16,
  },
  searchAgainButton: {
    backgroundColor: "#d32f2f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchAgainButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

// import FilterModal, { type FilterState } from "@/components/FilterModal";
// import FlightCard from "@/components/FlightCard";
// import { addFlightToCart, fetchFlightPricing } from "@/lib/flightAPIs";
// // import { addToCart } from "@/redux/slices/cartSlice";
// import { setSelectedFlight } from "@/redux/slices/flightSlice";
// import type { AppDispatch, RootState } from "@/redux/store";
// import type { FlightOffer } from "@/types/flight-types";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { useEffect, useMemo, useState } from "react";
// import {
//   Alert,
//   FlatList,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useDispatch, useSelector } from "react-redux";

// export default function SearchResultsScreen() {
//   const dispatch = useDispatch<AppDispatch>();
//   const router = useRouter();

//   // Get search results from Redux
//   const searchResults = useSelector(
//     (state: RootState) => state.flight.searchResults
//   );
//   const user = useSelector((state: RootState) => state.user.user);

//   // Local state
//   const [loadingFlightId, setLoadingFlightId] = useState<string | null>(null);
//   const [showFilterModal, setShowFilterModal] = useState(false);
//   const [filters, setFilters] = useState<FilterState>({
//     selectedDepartureTime: null,
//     selectedStops: null,
//     selectedAirlines: [],
//     priceRange: [0, 100000],
//   });

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

//   // Memoized filter options
//   const airlines = useMemo(
//     () => getUniqueAirlines(searchResults),
//     [searchResults]
//   );
//   const [minPrice, maxPrice] = useMemo(
//     () => getPriceRange(searchResults),
//     [searchResults]
//   );

//   // Update filter price range when search results change
//   useEffect(() => {
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
//       const pricingOffers: any = await fetchFlightPricing(flight);

//       if (
//         !pricingOffers ||
//         !pricingOffers.flightOffers ||
//         pricingOffers.flightOffers.length === 0
//       ) {
//         Alert.alert(
//           "Error",
//           "No pricing information available for this flight."
//         );
//         return;
//       }

//       const offer = pricingOffers.flightOffers[0];
//       const priceTotal = Number.parseFloat(offer.price.total);

//       if (isNaN(priceTotal) || priceTotal <= 0) {
//         Alert.alert(
//           "Error",
//           "Invalid flight price. Please select a flight with a valid price."
//         );
//         return;
//       }

//       // Add to cart
//       if (user?.id) {
//         try {
//           await addFlightToCart(user.id, { flightData: flight });
//         } catch (error) {
//           console.error("Error adding to cart API:", error);
//         }
//       }

//       dispatch(setSelectedFlight(flight));
//       // dispatch(addToCart(flight));

//       Alert.alert(
//         "Added to Cart",
//         "Flight has been added to your cart. What would you like to do next?",
//         [
//           {
//             text: "Continue Shopping",
//             style: "cancel",
//           },
//           {
//             text: "View Cart",
//             onPress: () => router.push("/cart" as any),
//           },
//           {
//             text: "Book Now",
//             onPress: () => router.push("/traveler-details" as any),
//           },
//         ]
//       );
//     } catch (error: any) {
//       Alert.alert("Error", "Failed to add flight to cart. Please try again.");
//       console.error("Error adding to cart:", error);
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

//   if (!searchResults.length) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={styles.backButton}
//           >
//             <Ionicons name="arrow-back" size={24} color="#333" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Search Results</Text>
//           <View style={styles.placeholder} />
//         </View>

//         <View style={styles.emptyContainer}>
//           <Ionicons name="airplane" size={48} color="#ccc" />
//           <Text style={styles.emptyTitle}>No flights found</Text>
//           <Text style={styles.emptyText}>
//             Try adjusting your search criteria or dates.
//           </Text>
//           <TouchableOpacity
//             style={styles.searchAgainButton}
//             onPress={() => router.back()}
//           >
//             <Text style={styles.searchAgainButtonText}>Search Again</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Search Results</Text>
//         <TouchableOpacity
//           style={styles.filterButton}
//           onPress={() => setShowFilterModal(true)}
//         >
//           <Ionicons name="filter" size={20} color="#007AFF" />
//         </TouchableOpacity>
//       </View>

//       {/* Results Count */}
//       <View style={styles.resultsCount}>
//         <Text style={styles.resultsCountText}>
//           {filteredResults.length} of {searchResults.length} flights found
//         </Text>
//       </View>

//       {/* Flight Results */}
//       <FlatList
//         data={filteredResults}
//         renderItem={renderFlightItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.listContainer}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons name="filter" size={48} color="#ccc" />
//             <Text style={styles.emptyTitle}>No flights match your filters</Text>
//             <Text style={styles.emptyText}>
//               Try adjusting your filter criteria.
//             </Text>
//           </View>
//         }
//       />

//       {/* Filter Modal */}
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
//     padding: 16,
//     backgroundColor: "#fff",
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   filterButton: {
//     padding: 8,
//     backgroundColor: "#e3f2fd",
//     borderRadius: 20,
//   },
//   placeholder: {
//     width: 40,
//   },
//   resultsCount: {
//     backgroundColor: "#fff",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   resultsCountText: {
//     fontSize: 14,
//     color: "#666",
//     fontWeight: "500",
//   },
//   listContainer: {
//     padding: 16,
//   },
//   emptyContainer: {
//     alignItems: "center",
//     padding: 40,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     margin: 16,
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
//     marginBottom: 16,
//   },
//   searchAgainButton: {
//     backgroundColor: "#007AFF",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   searchAgainButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });
