// import CitySearchModal from "@/components/CitySearchModal";
// import DatePickerModal from "@/components/DatePickerModal";
// import TravelerModal from "@/components/TravelerModal";
// import { getUserCart, searchFlights } from "@/lib/flightAPIs";
// import {
//   addToSearchHistory,
//   setSearchResults,
// } from "@/redux/slices/flightSlice";
// import { setCurrency } from "@/redux/slices/toggleSlice";
// import type { AppDispatch, RootState } from "@/redux/store";
// import type {
//   City,
//   FlightSearchParams,
//   TravelerConfig,
//   TripType,
// } from "@/types/flight-types";
// import { Ionicons } from "@expo/vector-icons";
// import { Picker } from "@react-native-picker/picker";
// import { useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useDispatch, useSelector } from "react-redux";

// export default function FlightSearchScreen() {
//   const dispatch = useDispatch<AppDispatch>();
//   const user = useSelector((state: RootState) => state.user.user);
//   const currency = useSelector((state: RootState) => state.toggle.currency);
//   const [cartItems, setCartItems] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const insets = useSafeAreaInsets();

//   useEffect(() => {
//     const fetchCartData = async () => {
//       try {
//         setLoading(true);
//         console.log("[Cart] Fetching cart data...");
//         if (user?.id) {
//           const userCart = await getUserCart(user?.id);
//           console.log("[Cart] User cart from API:", userCart);
//           setCartItems(userCart);
//         }
//       } catch (error) {
//         console.error("[Cart] Error fetching cart:", error);
//         Alert.alert("Error", "Failed to load cart items");
//       } finally {
//         setLoading(false);
//         console.log("[Cart] Done loading cart data.");
//       }
//     };

//     fetchCartData();
//   }, [user?.id]);

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

//   // Search states
//   const [isSearching, setIsSearching] = useState(false);

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
//     console.log("[SwapCities] Swapping", selectedFromCity, selectedToCity);
//     const tempCity = selectedFromCity;
//     setSelectedFromCity(selectedToCity);
//     setSelectedToCity(tempCity);
//   };

//   // Enhanced search handler with automatic routing
//   const handleFlightSearch = async () => {
//     console.log("[FlightSearch] Initiated");

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

//     const searchData = {
//       from: selectedFromCity,
//       to: selectedToCity,
//       departureDate: formatDateForAPI(departureDate),
//       returnDate:
//         tripType === "roundtrip" ? formatDateForAPI(returnDate) : null,
//       travelers: getTotalTravelers(),
//       class: travelerConfig.class,
//       timestamp: new Date().toISOString(),
//       tripType,
//     };

//     console.log("[FlightSearch] Search data:", searchData);
//     dispatch(addToSearchHistory(searchData));

//     setIsSearching(true);

//     try {
//       const currencyCode = currency ? "NGN" : "USD";

//       const searchParams: FlightSearchParams = {
//         origin: selectedFromCity.code || selectedFromCity.name,
//         destination: selectedToCity.code || selectedToCity.name,
//         adults: travelerConfig.adults,
//         // children: travelerConfig.children,
//         // infants: travelerConfig.infants,
//         departureDate: formatDateForAPI(departureDate),
//         currency: currencyCode,
//         ...(tripType === "roundtrip" && {
//           returnDate: formatDateForAPI(returnDate),
//         }),
//       };

//       console.log("[FlightSearch] API Params:", searchParams);
//       const response = await searchFlights(searchParams);

//       if (response && response.length >= 0) {
//         // Store search results in Redux
//         dispatch(setSearchResults(response));

//         console.log("[FlightSearch] Results:", response.length);

//         // Navigate to search results using push with string path
//         router.push("/search-results" as any);
//       } else {
//         Alert.alert(
//           "No Flights Found",
//           "No flights found for the selected criteria. Please try different dates or destinations."
//         );
//       }
//     } catch (error: any) {
//       console.error("[FlightSearch] Error:", error);
//       Alert.alert(
//         "Search Error",
//         error.message || "Failed to search flights. Please try again."
//       );
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   // Modal handlers
//   const handleCloseDepartureModal = () => {
//     setShowDepartureDateModal(false);
//   };

//   const handleCloseReturnModal = () => {
//     setShowReturnDateModal(false);
//   };

//   const handleSelectDepartureDate = (date: Date) => {
//     setDepartureDate(date);
//     setShowDepartureDateModal(false);
//   };

//   const handleSelectReturnDate = (date: Date) => {
//     setReturnDate(date);
//     setShowReturnDateModal(false);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Fixed Header */}
//       <View style={[styles.fixedHeader, { paddingTop: insets.top }]}>
//         <View style={styles.headerLeft}>
//           <Text style={styles.greeting}>{getGreeting()},</Text>
//           <Text style={styles.name}>{user?.firstName || "Guest"}</Text>

//           {/* Currency Picker */}
//           <View style={styles.currencySection}>
//             <Text style={styles.currencyLabel}>Currency</Text>
//             <View style={styles.currencyPickerWrapper}>
//               <Picker
//                 selectedValue={currency ? "NGN" : "USD"}
//                 onValueChange={(value) =>
//                   dispatch(setCurrency(value === "NGN"))
//                 }
//                 style={styles.picker}
//                 mode="dropdown"
//                 itemStyle={{ height: 60 }}
//               >
//                 <Picker.Item label="Naira (₦)" value="NGN" />
//                 <Picker.Item label="Dollar ($)" value="USD" />
//               </Picker>
//             </View>
//           </View>
//         </View>

//         <View style={styles.headerActions}>
//           <TouchableOpacity
//             style={styles.cartButton}
//             onPress={() => router.push("/cart" as any)}
//           >
//             <Ionicons name="bag-outline" size={24} color="#333" />
//             {cartItems.length > 0 && (
//               <View style={styles.cartBadge}>
//                 <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Scrollable Content */}
//       <ScrollView
//         style={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
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
//               <Ionicons name="swap-vertical" size={20} color="#DC2626" />
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

//         {/* Loading State */}
//         {isSearching && (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#007AFF" />
//             <Text style={styles.loadingText}>Searching for flights...</Text>
//             <Text style={styles.loadingSubText}>
//               Please wait while we find the best options for you.
//             </Text>
//           </View>
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
//         onClose={handleCloseDepartureModal}
//         onSelectDate={handleSelectDepartureDate}
//         title="Select Departure Date"
//         selectedDate={departureDate}
//         minimumDate={new Date()}
//       />

//       <DatePickerModal
//         visible={showReturnDateModal}
//         onClose={handleCloseReturnModal}
//         onSelectDate={handleSelectReturnDate}
//         title="Select Return Date"
//         selectedDate={returnDate}
//         minimumDate={departureDate}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   fixedHeader: {
//     backgroundColor: "#f5f5f5",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     paddingHorizontal: 20,
//     paddingBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e5e5",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     marginTop: 20,
//   },
//   headerLeft: {
//     flex: 1,
//   },
//   greeting: {
//     fontSize: 16,
//     color: "#666",
//     fontWeight: "400",
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   name: {
//     fontSize: 24,
//     // fontWeight: "bold",
//     color: "#333",
//     marginTop: 2,
//     marginBottom: 6,
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   currencySection: {
//     marginTop: 6,
//     width: 140,
//   },
//   currencyLabel: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 4,
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   currencyPickerWrapper: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     backgroundColor: "#fff",
//     height: 50,
//     justifyContent: "center",
//     width: 160,
//     paddingHorizontal: 8,
//     zIndex: 1000,
//     elevation: 1000,
//   },

//   picker: {
//     height: 50,
//     width: "100%",
//     color: "#333",
//     fontFamily: "RedHatDisplay-Regular",
//     lineHeight: 50,
//   },

//   pickerItem: {
//     fontSize: 16,
//     paddingVertical: 8,
//   },

//   headerActions: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   cartButton: {
//     position: "relative",
//     padding: 8,
//   },
//   cartBadge: {
//     position: "absolute",
//     top: 4,
//     right: 4,
//     backgroundColor: "#d32f2f",
//     borderRadius: 10,
//     minWidth: 20,
//     height: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   cartBadgeText: {
//     color: "#fff",
//     fontSize: 12,
//     // fontWeight: "bold",
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 100, // Extra padding for tab bar
//   },
//   tripTypeContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginHorizontal: 20,
//     marginTop: 20,
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
//     backgroundColor: "#DC2626",
//   },
//   tripTypeText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#666",
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   tripTypeTextSelected: {
//     color: "#fff",
//     fontFamily: "RedHatDisplay-Bold",
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
//     fontFamily: "Inter",
//   },
//   cityName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 2,
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   cityCode: {
//     fontSize: 14,
//     color: "#666",
//     fontFamily: "Inter",
//   },
//   swapButton: {
//     alignSelf: "center",
//     backgroundColor: "#fde3e3",
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
//     fontFamily: "Inter",
//   },
//   detailValue: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 2,
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   detailSubValue: {
//     fontSize: 12,
//     color: "#666",
//     fontFamily: "Inter",
//   },
//   searchButton: {
//     backgroundColor: "#DC2626",
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
//     fontFamily: "RedHatDisplay-Bold",
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
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   loadingSubText: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//     fontFamily: "Inter",
//   },
// });

import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import CitySearchModal from "@/components/CitySearchModal";
import DatePickerModal from "@/components/DatePickerModal";
import TravelerModal from "@/components/TravelerModal";

import { getUserCart, searchFlights } from "@/lib/flightAPIs";
import {
  addToSearchHistory,
  setSearchResults,
} from "@/redux/slices/flightSlice";
import { setCurrency } from "@/redux/slices/toggleSlice";

import type { AppDispatch, RootState } from "@/redux/store";
import type {
  City,
  FlightSearchParams,
  TravelerConfig,
  TripType,
} from "@/types/flight-types";

const AnimatedView = Animatable.View;

const FlightSearchScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const user = useSelector((state: RootState) => state.user.user);
  const currency = useSelector((state: RootState) => state.toggle.currency);

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);

  // Trip config states
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

  const today = useMemo(() => new Date(), []);
  const twoDaysLater = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d;
  }, []);

  const [departureDate, setDepartureDate] = useState<Date>(today);
  const [returnDate, setReturnDate] = useState<Date>(twoDaysLater);

  const [travelerConfig, setTravelerConfig] = useState<TravelerConfig>({
    adults: 1,
    children: 0,
    infants: 0,
    class: "Economy",
  });

  // Modal visibility states
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [showTravelerModal, setShowTravelerModal] = useState(false);
  const [showDepartureDateModal, setShowDepartureDateModal] = useState(false);
  const [showReturnDateModal, setShowReturnDateModal] = useState(false);

  // Search state
  const [isSearching, setIsSearching] = useState(false);

  // Validation error states
  const [errors, setErrors] = useState({
    fromCity: "",
    toCity: "",
    travelers: "",
    returnDate: "",
  });

  // Fetch cart data with error handling and loading state
  useEffect(() => {
    let isMounted = true;
    const fetchCartData = async () => {
      try {
        setLoadingCart(true);
        if (user?.id) {
          const userCart = await getUserCart(user.id);
          if (isMounted) setCartItems(userCart);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load cart items");
      } finally {
        if (isMounted) setLoadingCart(false);
      }
    };
    fetchCartData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Utility functions
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const formatDate = useCallback((date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "2-digit",
    };
    return date.toLocaleDateString("en-GB", options).replace(",", "'");
  }, []);

  const getDayName = useCallback((date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }, []);

  const getTotalTravelers = useCallback(() => {
    return (
      travelerConfig.adults + travelerConfig.children + travelerConfig.infants
    );
  }, [travelerConfig]);

  const formatDateForAPI = useCallback((date: Date) => {
    return date.toISOString().split("T")[0];
  }, []);

  // Swap cities handler
  const swapCities = useCallback(() => {
    setSelectedFromCity((prevFrom) => {
      setSelectedToCity(prevFrom);
      return selectedToCity;
    });
  }, [selectedToCity]);

  // Validate inputs and set inline errors
  const validateInputs = useCallback(() => {
    let valid = true;
    const newErrors = {
      fromCity: "",
      toCity: "",
      travelers: "",
      returnDate: "",
    };

    if (!selectedFromCity.name) {
      newErrors.fromCity = "Please select a departure city.";
      valid = false;
    }
    if (!selectedToCity.name) {
      newErrors.toCity = "Please select a destination city.";
      valid = false;
    }
    if (
      selectedFromCity.code === selectedToCity.code &&
      selectedFromCity.code !== ""
    ) {
      newErrors.toCity = "Departure and destination cannot be the same.";
      valid = false;
    }
    if (travelerConfig.adults < 1) {
      newErrors.travelers = "At least one adult traveler is required.";
      valid = false;
    }
    if (tripType === "roundtrip" && !returnDate) {
      newErrors.returnDate = "Please select a return date.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }, [selectedFromCity, selectedToCity, travelerConfig, tripType, returnDate]);

  // Flight search handler
  const handleFlightSearch = useCallback(async () => {
    if (!validateInputs()) {
      // Announce error for accessibility
      AccessibilityInfo.announceForAccessibility(
        "Please fix errors before searching."
      );
      return;
    }

    const searchData = {
      from: selectedFromCity,
      to: selectedToCity,
      departureDate: formatDateForAPI(departureDate),
      returnDate:
        tripType === "roundtrip" ? formatDateForAPI(returnDate) : null,
      travelers: getTotalTravelers(),
      class: travelerConfig.class,
      timestamp: new Date().toISOString(),
      tripType,
    };

    dispatch(addToSearchHistory(searchData));
    setIsSearching(true);

    try {
      const currencyCode = currency ? "NGN" : "USD";

      const searchParams: FlightSearchParams = {
        origin: selectedFromCity.code || selectedFromCity.name,
        destination: selectedToCity.code || selectedToCity.name,
        adults: travelerConfig.adults,
        departureDate: formatDateForAPI(departureDate),
        currency: currencyCode,
        ...(tripType === "roundtrip" && {
          returnDate: formatDateForAPI(returnDate),
        }),
      };

      const response = await searchFlights(searchParams);

      if (response && response.length >= 0) {
        dispatch(setSearchResults(response));
        router.push("/search-results" as any);
      } else {
        Alert.alert(
          "No Flights Found",
          "No flights found for the selected criteria. Please try different dates or destinations."
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Search Error",
        error.message || "Failed to search flights. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  }, [
    currency,
    departureDate,
    dispatch,
    formatDateForAPI,
    getTotalTravelers,
    router,
    returnDate,
    selectedFromCity,
    selectedToCity,
    tripType,
    travelerConfig.adults,
  ]);

  // Modal close handlers
  const handleCloseDepartureModal = useCallback(
    () => setShowDepartureDateModal(false),
    []
  );
  const handleCloseReturnModal = useCallback(
    () => setShowReturnDateModal(false),
    []
  );
  const handleSelectDepartureDate = useCallback((date: Date) => {
    setDepartureDate(date);
    setShowDepartureDateModal(false);
  }, []);
  const handleSelectReturnDate = useCallback((date: Date) => {
    setReturnDate(date);
    setShowReturnDateModal(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, { paddingTop: insets.top }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{user?.firstName || "Guest"}</Text>

          {/* Currency Picker */}
          <View style={styles.currencySection}>
            <Text style={styles.currencyLabel}>Currency</Text>
            <View style={styles.currencyPickerWrapper}>
              <Picker
                selectedValue={currency ? "NGN" : "USD"}
                onValueChange={(value) =>
                  dispatch(setCurrency(value === "NGN"))
                }
                style={styles.picker}
                mode="dropdown"
                itemStyle={styles.pickerItem}
                accessibilityLabel="Select currency"
              >
                <Picker.Item
                  style={styles.picking}
                  label="Naira (₦)"
                  value="NGN"
                />
                <Picker.Item label="Dollar ($)" value="USD" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/cart" as any)}
            accessibilityLabel={`Cart with ${cartItems.length} items`}
            accessibilityRole="button"
          >
            <Ionicons name="bag-outline" size={24} color="#333" />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Trip Type Selection */}
        <View style={styles.tripTypeContainer}>
          <TouchableOpacity
            onPress={() => setTripType("oneway")}
            style={[
              styles.tripTypeButton,
              tripType === "oneway" && styles.tripTypeSelected,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: tripType === "oneway" }}
            accessibilityLabel="Select one way trip"
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
            accessibilityRole="button"
            accessibilityState={{ selected: tripType === "roundtrip" }}
            accessibilityLabel="Select round trip"
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
          {/* From City */}
          <TouchableOpacity
            style={styles.cityButton}
            onPress={() => setShowFromModal(true)}
            accessibilityRole="button"
            accessibilityLabel={`Select departure city. Current: ${
              selectedFromCity.name || "none"
            }`}
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

          {/* Swap Button */}
          <TouchableOpacity
            style={styles.swapButton}
            onPress={swapCities}
            accessibilityRole="button"
            accessibilityLabel="Swap departure and destination cities"
          >
            <Ionicons name="swap-vertical" size={20} color="#DC2626" />
          </TouchableOpacity>

          {/* To City */}
          <TouchableOpacity
            style={styles.cityButton}
            onPress={() => setShowToModal(true)}
            accessibilityRole="button"
            accessibilityLabel={`Select destination city. Current: ${
              selectedToCity.name || "none"
            }`}
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

          {/* Dates and Passengers */}
          <View style={styles.detailsContainer}>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => setShowDepartureDateModal(true)}
              accessibilityRole="button"
              accessibilityLabel={`Select departure date. Current: ${formatDate(
                departureDate
              )}`}
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
                accessibilityRole="button"
                accessibilityLabel={`Select return date. Current: ${formatDate(
                  returnDate
                )}`}
              >
                <Text style={styles.detailLabel}>Return</Text>
                <Text style={styles.detailValue}>{formatDate(returnDate)}</Text>
                <Text style={styles.detailSubValue}>
                  {getDayName(returnDate)}
                </Text>
                {errors.returnDate ? (
                  <Text style={styles.errorText}>{errors.returnDate}</Text>
                ) : null}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => setShowTravelerModal(true)}
              accessibilityRole="button"
              accessibilityLabel={`Select travelers. Current: ${getTotalTravelers()} traveler(s), class ${
                travelerConfig.class
              }`}
            >
              <Text style={styles.detailLabel}>Passengers</Text>
              <Text style={styles.detailValue}>
                {getTotalTravelers()} Traveler
                {getTotalTravelers() > 1 ? "s" : ""}
              </Text>
              <Text style={styles.detailSubValue}>{travelerConfig.class}</Text>
              {errors.travelers ? (
                <Text style={styles.errorText}>{errors.travelers}</Text>
              ) : null}
            </TouchableOpacity>
          </View>

          {/* Inline validation errors for cities */}
          {errors.fromCity ? (
            <Text style={styles.errorText}>{errors.fromCity}</Text>
          ) : null}
          {errors.toCity ? (
            <Text style={styles.errorText}>{errors.toCity}</Text>
          ) : null}

          {/* Search Button */}
          <TouchableOpacity
            style={[
              styles.searchButton,
              isSearching && styles.searchButtonDisabled,
            ]}
            onPress={handleFlightSearch}
            disabled={isSearching}
            accessibilityRole="button"
            accessibilityLabel="Search flights"
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

        {/* Loading State */}
        {isSearching && (
          <AnimatedView
            animation="fadeIn"
            duration={500}
            style={styles.loadingContainer}
            accessibilityLiveRegion="polite"
          >
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Searching for flights...</Text>
            <Text style={styles.loadingSubText}>
              Please wait while we find the best options for you.
            </Text>
          </AnimatedView>
        )}
      </ScrollView>

      {/* Modals with animated transitions */}
      <Animatable.View
        animation={showFromModal ? "fadeInUp" : "fadeOutDown"}
        duration={300}
        style={showFromModal ? styles.modalVisible : styles.modalHidden}
        pointerEvents={showFromModal ? "auto" : "none"}
      >
        <CitySearchModal
          visible={showFromModal}
          onClose={() => setShowFromModal(false)}
          onSelectCity={setSelectedFromCity}
          title="Select Departure City"
          selectedCity={selectedFromCity}
        />
      </Animatable.View>

      <Animatable.View
        animation={showToModal ? "fadeInUp" : "fadeOutDown"}
        duration={300}
        style={showToModal ? styles.modalVisible : styles.modalHidden}
        pointerEvents={showToModal ? "auto" : "none"}
      >
        <CitySearchModal
          visible={showToModal}
          onClose={() => setShowToModal(false)}
          onSelectCity={setSelectedToCity}
          title="Select Destination City"
          selectedCity={selectedToCity}
        />
      </Animatable.View>

      <Animatable.View
        animation={showTravelerModal ? "fadeInUp" : "fadeOutDown"}
        duration={300}
        style={showTravelerModal ? styles.modalVisible : styles.modalHidden}
        pointerEvents={showTravelerModal ? "auto" : "none"}
      >
        <TravelerModal
          visible={showTravelerModal}
          onClose={() => setShowTravelerModal(false)}
          travelerConfig={travelerConfig}
          onUpdateTravelers={setTravelerConfig}
        />
      </Animatable.View>

      <Animatable.View
        animation={showDepartureDateModal ? "fadeInUp" : "fadeOutDown"}
        duration={300}
        style={
          showDepartureDateModal ? styles.modalVisible : styles.modalHidden
        }
        pointerEvents={showDepartureDateModal ? "auto" : "none"}
      >
        <DatePickerModal
          visible={showDepartureDateModal}
          onClose={handleCloseDepartureModal}
          onSelectDate={handleSelectDepartureDate}
          title="Select Departure Date"
          selectedDate={departureDate}
          minimumDate={new Date()}
        />
      </Animatable.View>

      <Animatable.View
        animation={showReturnDateModal ? "fadeInUp" : "fadeOutDown"}
        duration={300}
        style={showReturnDateModal ? styles.modalVisible : styles.modalHidden}
        pointerEvents={showReturnDateModal ? "auto" : "none"}
      >
        <DatePickerModal
          visible={showReturnDateModal}
          onClose={handleCloseReturnModal}
          onSelectDate={handleSelectReturnDate}
          title="Select Return Date"
          selectedDate={returnDate}
          minimumDate={departureDate}
        />
      </Animatable.View>
    </SafeAreaView>
  );
};

export default React.memo(FlightSearchScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  fixedHeader: {
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
    fontFamily: "RedHatDisplay-Regular",
  },
  name: {
    fontSize: 24,
    color: "#333",
    marginTop: 2,
    marginBottom: 6,
    fontFamily: "RedHatDisplay-Bold",
  },
  currencySection: {
    marginTop: 6,
    width: 140,
  },
  currencyLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontFamily: "RedHatDisplay-Regular",
  },
  currencyPickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    height: 50,
    justifyContent: "center",
    width: 160,
    paddingHorizontal: 8,
    zIndex: 1000,
    elevation: 1000,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#333",
    fontFamily: "RedHatDisplay-Regular",
    lineHeight: 50,
  },
  pickerItem: {
    fontSize: 16,
    paddingVertical: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  picking: {
    fontFamily: "RedHatDisplay-Bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    fontFamily: "RedHatDisplay-Bold",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  tripTypeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
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
    backgroundColor: "#DC2626",
  },
  tripTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    fontFamily: "RedHatDisplay-Regular",
  },
  tripTypeTextSelected: {
    color: "#fff",
    fontFamily: "RedHatDisplay-Bold",
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
    fontFamily: "Inter",
  },
  cityName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
    fontFamily: "RedHatDisplay-Bold",
  },
  cityCode: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Inter",
  },
  swapButton: {
    alignSelf: "center",
    backgroundColor: "#fde3e3",
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
    fontFamily: "Inter",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
    fontFamily: "RedHatDisplay-Bold",
  },
  detailSubValue: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Inter",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    marginTop: 4,
    fontFamily: "RedHatDisplay-Regular",
  },
  searchButton: {
    backgroundColor: "#DC2626",
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
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Bold",
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
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  loadingSubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontFamily: "Inter",
  },
  modalVisible: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalHidden: {
    height: 0,
    overflow: "hidden",
  },
});
