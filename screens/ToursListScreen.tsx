// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import {
//   Alert,
//   Animated,
//   FlatList,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// // Components
// import PriceFilter from "../components/tours/PriceFilter";
// import SearchHeader from "../components/tours/SearchHeader";
// import TourCard from "../components/tours/TourCard";

// // Utils
// import { useAppSelector } from "@/redux/hooks";
// import { baseURL } from "../lib/api";

// interface Tour {
//   type: string;
//   id: string;
//   name: string;
//   shortDescription: string;
//   description: string;
//   geoCode: {
//     latitude: number;
//     longitude: number;
//   };
//   price?: {
//     amount: string;
//     currencyCode: string;
//   };
//   pictures?: string[];
//   bookingLink: string;
//   minimumDuration: string;
// }

// interface ToursApiResponse {
//   message: string;
//   results: {
//     data: Tour[];
//   };
// }

// export default function ToursListScreen() {
//   // Animation values
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(50)).current;

//   // Initialize animations - only run once
//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, [fadeAnim, slideAnim]);

//   const user: any = useAppSelector((state: any) => state.user?.user);
//   const getGreeting = useCallback(() => {
//     const hour = new Date().getHours();
//     if (hour < 12) return "Good morning";
//     if (hour < 18) return "Good afternoon";
//     return "Good evening";
//   }, []);

//   const router = useRouter();

//   // State
//   const [tours, setTours] = useState<Tour[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [citySearch, setCitySearch] = useState("");
//   const [priceFilter, setPriceFilter] = useState<string>("all");
//   const [hasSearched, setHasSearched] = useState(false);

//   // Filter tours based on search term and price filter
//   const filteredTours = useMemo(() => {
//     let filtered = tours;

//     // Filter by search term
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(
//         (tour) =>
//           tour.name.toLowerCase().includes(term) ||
//           tour.shortDescription.toLowerCase().includes(term)
//       );
//     }

//     // Filter by price
//     if (priceFilter !== "all" && filtered.length > 0) {
//       const prices = filtered
//         .filter((tour) => tour.price?.amount)
//         .map((tour) => Number.parseFloat(tour.price!.amount));

//       if (prices.length > 0) {
//         const min = Math.min(...prices);
//         const max = Math.max(...prices);
//         const range = max - min;

//         const lowThreshold = min + range * 0.33;
//         const highThreshold = min + range * 0.67;

//         filtered = filtered.filter((tour) => {
//           if (!tour.price?.amount) return priceFilter === "low";
//           const price = Number.parseFloat(tour.price.amount);

//           switch (priceFilter) {
//             case "low":
//               return price < lowThreshold;
//             case "medium":
//               return price >= lowThreshold && price <= highThreshold;
//             case "high":
//               return price > highThreshold;
//             default:
//               return true;
//           }
//         });
//       }
//     }

//     return filtered;
//   }, [tours, searchTerm, priceFilter]);

//   // Calculate price ranges for filter
//   const priceRanges = useMemo(() => {
//     const toursWithPrices = tours.filter((tour) => tour.price?.amount);
//     if (toursWithPrices.length === 0) {
//       return { min: 0, max: 1000, currency: "USD" };
//     }

//     const prices = toursWithPrices.map((tour) =>
//       Number.parseFloat(tour.price!.amount)
//     );
//     return {
//       min: Math.min(...prices),
//       max: Math.max(...prices),
//       currency: toursWithPrices[0].price!.currencyCode,
//     };
//   }, [tours]);

//   // Fetch tours from API
//   const fetchTours = useCallback(async (cityName: string) => {
//     if (!cityName.trim()) {
//       Alert.alert("Error", "Please enter a city name");
//       return;
//     }

//     setLoading(true);
//     setHasSearched(true);

//     // Reset filters when searching new city
//     setSearchTerm("");
//     setPriceFilter("all");

//     try {
//       const response = await fetch(
//         `${baseURL}/tours/get-tours?cityName=${encodeURIComponent(
//           cityName.trim()
//         )}`
//       );
//       const data: ToursApiResponse | any = await response.json();

//       //   console.log(`Tours Data`, data);

//       const toursData: Tour[] = data?.results || [];
//       setTours(toursData);

//       if (toursData.length === 0) {
//         Alert.alert(
//           "No Results",
//           `No tours found for "${cityName}". Try searching for another city.`
//         );
//       }
//     } catch (error: any) {
//       console.error("API Error:", error);
//       Alert.alert("Error", "Failed to fetch tours. Please try again.");
//       setTours([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Handle search
//   const handleSearch = useCallback(() => {
//     if (citySearch.trim()) {
//       fetchTours(citySearch);
//     }
//   }, [citySearch, fetchTours]);

//   // Handle tour click
//   const handleTourClick = useCallback(
//     (tour: Tour) => {
//       router.push({
//         pathname: "/tour-details",
//         params: { tourId: tour.id, tourData: JSON.stringify(tour) },
//       } as any);
//     },
//     [router]
//   );

//   // Handle refresh
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     // Reset all state
//     setTours([]);
//     setCitySearch("");
//     setSearchTerm("");
//     setPriceFilter("all");
//     setHasSearched(false);
//     setRefreshing(false);
//   }, []);

//   // Render tour card
//   const renderTourCard = useCallback(
//     ({ item, index }: { item: Tour; index: number }) => (
//       <TourCard tour={item} onPress={handleTourClick} index={index} />
//     ),
//     [handleTourClick]
//   );

//   // Loading skeleton
//   const LoadingSkeleton = () => (
//     <View style={styles.skeletonContainer}>
//       {[...Array(6)].map((_, index) => (
//         <View key={index} style={styles.skeletonCard}>
//           <View style={styles.skeletonImage} />
//           <View style={styles.skeletonContent}>
//             <View style={[styles.skeletonLine, { width: "75%" }]} />
//             <View style={[styles.skeletonLine, { width: "100%" }]} />
//             <View style={[styles.skeletonLine, { width: "60%" }]} />
//           </View>
//         </View>
//       ))}
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={["#DC2626"]}
//           />
//         }
//       >
//         {/* Header */}
//         <Animated.View
//           style={[
//             styles.header,
//             {
//               opacity: fadeAnim,
//               transform: [{ translateY: slideAnim }],
//             },
//           ]}
//         >
//           <View style={styles.headerContent}>
//             <View>
//               <Text style={styles.greeting}>{getGreeting()},</Text>
//               <Text style={styles.name}>{user?.firstName || "Guest"}</Text>
//             </View>
//             <View style={styles.headerIcons}>
//               <Ionicons
//                 name="notifications-outline"
//                 size={24}
//                 color="#000000"
//               />
//               <Ionicons
//                 name="person-circle-outline"
//                 size={30}
//                 color="#000000"
//               />
//             </View>
//           </View>
//         </Animated.View>
//         {/* Search Header */}
//         <SearchHeader
//           citySearch={citySearch}
//           onCitySearchChange={setCitySearch}
//           onSearch={handleSearch}
//           loading={loading}
//           searchTerm={searchTerm}
//           onSearchTermChange={setSearchTerm}
//           hasSearched={hasSearched}
//           tourCount={tours.length}
//         />

//         {/* Results Section */}
//         {hasSearched && (
//           <View style={styles.resultsSection}>
//             {/* Results Header with Filter */}
//             {tours.length > 0 && (
//               <View style={styles.resultsHeader}>
//                 <View style={styles.resultsInfo}>
//                   <Text style={styles.resultsTitle}>
//                     {loading
//                       ? "Searching tours..."
//                       : `${filteredTours.length} Tours Found`}
//                   </Text>
//                   {filteredTours.length !== tours.length && (
//                     <Text style={styles.resultsSubtitle}>
//                       Filtered from {tours.length} total tours
//                     </Text>
//                   )}
//                 </View>

//                 {filteredTours.length > 0 && (
//                   <PriceFilter
//                     priceFilter={priceFilter}
//                     onPriceFilterChange={setPriceFilter}
//                     priceRanges={priceRanges}
//                     tourCount={tours.length}
//                   />
//                 )}
//               </View>
//             )}

//             {/* Loading State */}
//             {loading && <LoadingSkeleton />}

//             {/* Tours List */}
//             {!loading && filteredTours.length > 0 && (
//               <FlatList
//                 data={filteredTours}
//                 renderItem={renderTourCard}
//                 keyExtractor={(item) => item.id}
//                 showsVerticalScrollIndicator={false}
//                 scrollEnabled={false}
//                 contentContainerStyle={styles.toursList}
//               />
//             )}

//             {/* No Results State */}
//             {!loading &&
//               hasSearched &&
//               filteredTours.length === 0 &&
//               tours.length > 0 && (
//                 <View style={styles.noResults}>
//                   <Ionicons name="search-outline" size={64} color="#666666" />
//                   <Text style={styles.noResultsTitle}>
//                     No tours match your filters
//                   </Text>
//                   <Text style={styles.noResultsText}>
//                     Try adjusting your search criteria or price filters to see
//                     more results.
//                   </Text>
//                   <TouchableOpacity
//                     style={styles.clearFiltersButton}
//                     onPress={() => {
//                       setSearchTerm("");
//                       setPriceFilter("all");
//                     }}
//                   >
//                     <Text style={styles.clearFiltersText}>Clear Filters</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}

//             {/* Empty State */}
//             {!loading && hasSearched && tours.length === 0 && (
//               <View style={styles.emptyState}>
//                 <Ionicons name="location-outline" size={64} color="#666666" />
//                 <Text style={styles.emptyStateTitle}>
//                   No tours available for this city
//                 </Text>
//                 <Text style={styles.emptyStateText}>
//                   Try searching for another city or check back later. We're
//                   constantly adding new destinations.
//                 </Text>
//               </View>
//             )}
//           </View>
//         )}

//         {/* Welcome State */}
//         {!hasSearched && !loading && (
//           <View style={styles.welcomeSection}>
//             <View style={styles.welcomeContent}>
//               <Ionicons name="airplane" size={80} color="#DC2626" />
//               <Text style={styles.welcomeTitle}>Ready to Explore?</Text>
//               <Text style={styles.welcomeText}>
//                 Search for tours in your favorite destinations and discover
//                 amazing experiences around the world.
//               </Text>
//             </View>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   scrollView: {
//     flex: 1,
//   },
//   header: {
//     paddingTop: 50,
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     backgroundColor: "#FFFFFF",
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E5E5",
//     shadowColor: "#000000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   headerContent: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   greeting: {
//     fontSize: 16,
//     color: "#666666",
//     fontWeight: "400",
//   },
//   name: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#000000",
//     marginTop: 4,
//   },
//   headerIcons: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   resultsSection: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   resultsHeader: {
//     marginBottom: 20,
//   },
//   resultsInfo: {
//     marginBottom: 16,
//   },
//   resultsTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#000000",
//     marginBottom: 4,
//   },
//   resultsSubtitle: {
//     fontSize: 14,
//     color: "#666666",
//   },
//   toursList: {
//     paddingBottom: 20,
//   },
//   skeletonContainer: {
//     paddingVertical: 20,
//   },
//   skeletonCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     marginBottom: 20,
//     overflow: "hidden",
//     shadowColor: "#000000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   skeletonImage: {
//     height: 200,
//     backgroundColor: "#F0F0F0",
//   },
//   skeletonContent: {
//     padding: 16,
//     gap: 8,
//   },
//   skeletonLine: {
//     height: 16,
//     backgroundColor: "#F0F0F0",
//     borderRadius: 8,
//   },
//   noResults: {
//     alignItems: "center",
//     paddingVertical: 60,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     marginVertical: 20,
//     shadowColor: "#000000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   noResultsTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#000000",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   noResultsText: {
//     fontSize: 14,
//     color: "#666666",
//     textAlign: "center",
//     marginBottom: 20,
//     paddingHorizontal: 20,
//   },
//   clearFiltersButton: {
//     backgroundColor: "#DC2626",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   clearFiltersText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   emptyState: {
//     alignItems: "center",
//     paddingVertical: 60,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     marginVertical: 20,
//     shadowColor: "#000000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   emptyStateTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#000000",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyStateText: {
//     fontSize: 14,
//     color: "#666666",
//     textAlign: "center",
//     paddingHorizontal: 20,
//   },
//   welcomeSection: {
//     paddingHorizontal: 20,
//     paddingVertical: 60,
//   },
//   welcomeContent: {
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 40,
//     shadowColor: "#000000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   welcomeTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#000000",
//     marginTop: 20,
//     marginBottom: 12,
//   },
//   welcomeText: {
//     fontSize: 16,
//     color: "#666666",
//     textAlign: "center",
//     lineHeight: 24,
//   },
// });
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Components
import PriceFilter from "../components/tours/PriceFilter";
import SearchHeader from "../components/tours/SearchHeader";
import TourCard from "../components/tours/TourCard";

// Utils
import { useAppSelector } from "@/redux/hooks";
import { baseURL } from "../lib/api";

interface Tour {
  type: string;
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  price?: {
    amount: string;
    currencyCode: string;
  };
  pictures?: string[];
  bookingLink: string;
  minimumDuration: string;
}

interface ToursApiResponse {
  message: string;
  results: {
    data: Tour[];
  };
}

export default function ToursListScreen() {
  const insets = useSafeAreaInsets();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

  const user: any = useAppSelector((state: any) => state.user?.user);
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const router = useRouter();

  // State
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [hasSearched, setHasSearched] = useState(false);

  // Filter tours based on search term and price filter
  const filteredTours = useMemo(() => {
    let filtered = tours;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tour) =>
          tour.name.toLowerCase().includes(term) ||
          tour.shortDescription.toLowerCase().includes(term)
      );
    }

    // Filter by price
    if (priceFilter !== "all" && filtered.length > 0) {
      const prices = filtered
        .filter((tour) => tour.price?.amount)
        .map((tour) => Number.parseFloat(tour.price!.amount));

      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const range = max - min;

        const lowThreshold = min + range * 0.33;
        const highThreshold = min + range * 0.67;

        filtered = filtered.filter((tour) => {
          if (!tour.price?.amount) return priceFilter === "low";
          const price = Number.parseFloat(tour.price.amount);

          switch (priceFilter) {
            case "low":
              return price < lowThreshold;
            case "medium":
              return price >= lowThreshold && price <= highThreshold;
            case "high":
              return price > highThreshold;
            default:
              return true;
          }
        });
      }
    }

    return filtered;
  }, [tours, searchTerm, priceFilter]);

  // Calculate price ranges for filter
  const priceRanges = useMemo(() => {
    const toursWithPrices = tours.filter((tour) => tour.price?.amount);
    if (toursWithPrices.length === 0) {
      return { min: 0, max: 1000, currency: "USD" };
    }

    const prices = toursWithPrices.map((tour) =>
      Number.parseFloat(tour.price!.amount)
    );
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      currency: toursWithPrices[0].price!.currencyCode,
    };
  }, [tours]);

  // Fetch tours from API
  const fetchTours = useCallback(async (cityName: string) => {
    if (!cityName.trim()) {
      Alert.alert("Error", "Please enter a city name");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    // Reset filters when searching new city
    setSearchTerm("");
    setPriceFilter("all");

    try {
      const response = await fetch(
        `${baseURL}/tours/get-tours?cityName=${encodeURIComponent(
          cityName.trim()
        )}`
      );
      const data: ToursApiResponse | any = await response.json();

      //   console.log(`Tours Data`, data);

      const toursData: Tour[] = data?.results || [];
      setTours(toursData);

      if (toursData.length === 0) {
        Alert.alert(
          "No Results",
          `No tours found for "${cityName}". Try searching for another city.`
        );
      }
    } catch (error: any) {
      console.error("API Error:", error);
      Alert.alert("Error", "Failed to fetch tours. Please try again.");
      setTours([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search
  const handleSearch = useCallback(() => {
    if (citySearch.trim()) {
      fetchTours(citySearch);
    }
  }, [citySearch, fetchTours]);

  // Handle tour click
  const handleTourClick = useCallback(
    (tour: Tour) => {
      router.push({
        pathname: "/tour-details",
        params: { tourId: tour.id, tourData: JSON.stringify(tour) },
      } as any);
    },
    [router]
  );

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Reset all state
    setTours([]);
    setCitySearch("");
    setSearchTerm("");
    setPriceFilter("all");
    setHasSearched(false);
    setRefreshing(false);
  }, []);

  // Render tour card
  const renderTourCard = useCallback(
    ({ item, index }: { item: Tour; index: number }) => (
      <TourCard tour={item} onPress={handleTourClick} index={index} />
    ),
    [handleTourClick]
  );

  // Loading skeleton
  const LoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[...Array(6)].map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonContent}>
            <View style={[styles.skeletonLine, { width: "75%" }]} />
            <View style={[styles.skeletonLine, { width: "100%" }]} />
            <View style={[styles.skeletonLine, { width: "60%" }]} />
          </View>
        </View>
      ))}
    </View>
  );

  // Calculate header height for proper spacing
  const headerHeight = 120 + insets.top;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Fixed Header */}
      <Animated.View
        style={[
          styles.fixedHeader,
          {
            paddingTop: insets.top,
            height: headerHeight,
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
            <Ionicons name="notifications-outline" size={24} color="#000000" />
            <Ionicons name="person-circle-outline" size={30} color="#000000" />
          </View>
        </View>
      </Animated.View>

      {/* Scroll Container */}
      <ScrollView
        style={[styles.scrollContainer, { paddingTop: headerHeight }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#DC2626"]}
          />
        }
      >
        {/* Search Header */}
        <SearchHeader
          citySearch={citySearch}
          onCitySearchChange={setCitySearch}
          onSearch={handleSearch}
          loading={loading}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          hasSearched={hasSearched}
          tourCount={tours.length}
        />

        {/* Results Section */}
        {hasSearched && (
          <View style={styles.resultsSection}>
            {/* Results Header with Filter */}
            {tours.length > 0 && (
              <View style={styles.resultsHeader}>
                <View style={styles.resultsInfo}>
                  <Text style={styles.resultsTitle}>
                    {loading
                      ? "Searching tours..."
                      : `${filteredTours.length} Tours Found`}
                  </Text>
                  {filteredTours.length !== tours.length && (
                    <Text style={styles.resultsSubtitle}>
                      Filtered from {tours.length} total tours
                    </Text>
                  )}
                </View>

                {filteredTours.length > 0 && (
                  <PriceFilter
                    priceFilter={priceFilter}
                    onPriceFilterChange={setPriceFilter}
                    priceRanges={priceRanges}
                    tourCount={tours.length}
                  />
                )}
              </View>
            )}

            {/* Loading State */}
            {loading && <LoadingSkeleton />}

            {/* Tours List */}
            {!loading && filteredTours.length > 0 && (
              <FlatList
                data={filteredTours}
                renderItem={renderTourCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={styles.toursList}
              />
            )}

            {/* No Results State */}
            {!loading &&
              hasSearched &&
              filteredTours.length === 0 &&
              tours.length > 0 && (
                <View style={styles.noResults}>
                  <Ionicons name="search-outline" size={64} color="#666666" />
                  <Text style={styles.noResultsTitle}>
                    No tours match your filters
                  </Text>
                  <Text style={styles.noResultsText}>
                    Try adjusting your search criteria or price filters to see
                    more results.
                  </Text>
                  <TouchableOpacity
                    style={styles.clearFiltersButton}
                    onPress={() => {
                      setSearchTerm("");
                      setPriceFilter("all");
                    }}
                  >
                    <Text style={styles.clearFiltersText}>Clear Filters</Text>
                  </TouchableOpacity>
                </View>
              )}

            {/* Empty State */}
            {!loading && hasSearched && tours.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="location-outline" size={64} color="#666666" />
                <Text style={styles.emptyStateTitle}>
                  No tours available for this city
                </Text>
                <Text style={styles.emptyStateText}>
                  Try searching for another city or check back later. We're
                  constantly adding new destinations.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Welcome State */}
        {!hasSearched && !loading && (
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeContent}>
              <Ionicons name="airplane" size={80} color="#DC2626" />
              <Text style={styles.welcomeTitle}>Ready to Explore?</Text>
              <Text style={styles.welcomeText}>
                Search for tours in your favorite destinations and discover
                amazing experiences around the world.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  greeting: {
    fontSize: 16,
    color: "#666666",
    fontFamily: "RedHatDisplay-Regular",
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginTop: 4,
    fontFamily: "RedHatDisplay-Bold",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  resultsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsHeader: {
    marginBottom: 20,
  },
  resultsInfo: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
    fontFamily: "RedHatDisplay-Bold",
  },
  resultsSubtitle: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Inter",
  },
  toursList: {
    paddingBottom: 20,
  },
  skeletonContainer: {
    paddingVertical: 20,
  },
  skeletonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonImage: {
    height: 200,
    backgroundColor: "#F0F0F0",
  },
  skeletonContent: {
    padding: 16,
    gap: 8,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
  },
  noResults: {
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginVertical: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginTop: 16,
    marginBottom: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  noResultsText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    fontFamily: "RedHatDisplay-Regular",
  },
  clearFiltersButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Bold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginVertical: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginTop: 16,
    marginBottom: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: "RedHatDisplay-Regular",
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  welcomeContent: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 45,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginTop: 20,
    marginBottom: 12,
    fontFamily: "RedHatDisplay-Bold",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "RedHatDisplay-Regular",
  },
});
