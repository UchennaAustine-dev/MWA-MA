// import TravelAddonCard from "@/components/TravelAddonCard";
// import { useTravelAddons } from "@/hooks/useTravelAddons";
// import { fetchFlightOfferById, getTravelerById } from "@/lib/flightAPIs";
// import { initializePayment } from "@/lib/paymentAPI";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Modal,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import type { AppDispatch, RootState } from "../redux/store";

// export default function FullSummaryScreen() {
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const user = useSelector((state: RootState) => state.user.user);
//   const selectedFlight: any = useSelector(
//     (state: RootState) => state.flight.selectedFlight
//   );
//   const selectedOfferId: any = useSelector(
//     (state: RootState) => state.flight.flightOffrId
//   );
//   const traveler: any = useSelector(
//     (state: RootState) => state.flight.traveler
//   );

//   // console.log(`traveler`, traveler);

//   const guestUser = useSelector((state: RootState) => state.user.guestUser);

//   const [travelerData, setTravelerData] = useState<any>(null);
//   const [travelerLoading, setTravelerLoading] = useState(false);
//   const [flightOffer, setFlightOffer] = useState<any>(null);
//   const [flightOfferLoading, setFlightOfferLoading] = useState(false);
//   const [isProcessingPayment, setIsProcessingPayment] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);

//   console.log(`traveler`, traveler[0]);
//   const travelerId = Array.isArray(traveler)
//     ? traveler[0]?.traveler?.id
//     : traveler?.traveler?.id;

//   console.log(`travelerId`, travelerId);

//   // Fetch traveler details by ID
//   useEffect(() => {
//     if (!travelerId) return;
//     setTravelerLoading(true);
//     getTravelerById(travelerId)
//       .then((data: any) => setTravelerData(data.traveler || data))
//       .catch((err) => console.error("Failed to fetch traveler:", err))
//       .finally(() => setTravelerLoading(false));
//   }, [travelerId]);

//   // Fetch full flight offer object by ID
//   useEffect(() => {
//     if (!selectedOfferId) return;
//     setFlightOfferLoading(true);
//     fetchFlightOfferById(selectedOfferId)
//       .then((data) => setFlightOffer(data))
//       .catch((err) => console.error("Failed to fetch flight offer:", err))
//       .finally(() => setFlightOfferLoading(false));
//   }, [selectedOfferId]);

//   // console.log(`selectedOfferId`, selectedOfferId);

//   // Addons hook
//   const {
//     addons,
//     loading: addonsLoading,
//     error: addonsError,
//     selectedAddons,
//     addingAddon,
//     toggleAddon,
//     getSelectedAddonsTotal,
//     getSelectedAddonsDetails,
//     refetch: refetchAddons,
//   } = useTravelAddons(selectedOfferId);

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return "Good morning";
//     if (hour < 18) return "Good afternoon";
//     return "Good evening";
//   };

//   const getFlightRoutes = () => {
//     if (!selectedFlight?.itineraries?.length) return [];

//     return selectedFlight.itineraries.flatMap((itinerary: any) =>
//       itinerary.segments.map((segment: any) => {
//         const dep = segment.departure;
//         const arr = segment.arrival;
//         const depName = dep.details?.name || dep.iataCode;
//         const arrName = arr.details?.name || arr.iataCode;
//         return `${depName} (${dep.iataCode}) → ${arrName} (${arr.iataCode})`;
//       })
//     );
//   };

//   const getTotalPrice = () => selectedFlight?.price?.total || 0;
//   const getPassengerCount = () =>
//     Array.isArray(traveler) ? traveler.length : 1;
//   const getTaxes = () => {
//     if (!selectedFlight?.price) return 0;
//     const total = Number(selectedFlight.price.total);
//     const base = Number(selectedFlight.price.base);
//     return total - base;
//   };

//   const formatCurrency = (amount: number) => {
//     const currency = selectedFlight?.price?.currency || "NGN";
//     const symbol = currency === "NGN" ? "₦" : "$";
//     return `${symbol}${Number(amount).toLocaleString()}`;
//   };

//   const formatDate = (dateStr: string) => {
//     if (!dateStr) return "N/A";
//     return new Date(dateStr).toLocaleDateString(undefined, {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const handlePayNow = () => {
//     if (!traveler) {
//       Alert.alert("Error", "Traveler information is missing or invalid.");
//       return;
//     }
//     if (!selectedFlight) {
//       Alert.alert("Error", "No flight offer selected.");
//       return;
//     }
//     setShowPaymentModal(true);
//   };

//   const handleProceedToCheckout = async () => {
//     try {
//       setShowPaymentModal(false);
//       setIsProcessingPayment(true);

//       const paymentInitData = {
//         amount: selectedFlight.price?.total,
//         currency: selectedFlight?.price?.currency,
//         email: user?.email || guestUser?.email,
//         bookingData: {
//           flightOffer: selectedFlight,
//           travelers: [traveler],
//           userId: user?.id,
//           guestUserId: guestUser?.guestUserId,
//         },
//       };

//       const paymentConfig = await initializePayment(paymentInitData);

//       // For mobile, we might need to handle this differently
//       // You could use a WebView or redirect to payment URL
//       Alert.alert("Payment", "Redirecting to payment gateway...", [
//         {
//           text: "OK",
//           onPress: () => {
//             // Handle payment redirect for mobile
//             // This could open a WebView or external browser
//             router.push({
//               pathname: "/payment-webview",
//               params: { url: encodeURIComponent(paymentConfig.paymentLink) },
//             });
//           },
//         },
//       ]);
//     } catch (error) {
//       Alert.alert("Error", "Payment initialization failed. Please try again.");
//     } finally {
//       setIsProcessingPayment(false);
//     }
//   };

//   console.log(`travelerData`, travelerData);

//   const Traveler = travelerData;

//   if (travelerLoading || flightOfferLoading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#DC2626" />
//           <Text style={styles.loadingText}>Loading booking details...</Text>
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
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Complete Booking</Text>
//       </View>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Greeting */}
//         <View style={styles.greetingContainer}>
//           <Text style={styles.greeting}>{getGreeting()},</Text>
//           <Text style={styles.name}>
//             {user?.firstName || guestUser?.firstName || "Guest"}
//           </Text>
//         </View>

//         {/* Progress Steps */}
//         <View style={styles.progressContainer}>
//           <View style={styles.progressStep}>
//             <View style={[styles.progressDot, styles.completedDot]}>
//               <Ionicons name="checkmark" size={16} color="#fff" />
//             </View>
//             <Text style={styles.progressLabel}>Flight Selected</Text>
//           </View>
//           <View style={styles.progressLine} />
//           <View style={styles.progressStep}>
//             <View style={[styles.progressDot, styles.completedDot]}>
//               <Ionicons name="checkmark" size={16} color="#fff" />
//             </View>
//             <Text style={styles.progressLabel}>Traveler Info</Text>
//           </View>
//           <View style={styles.progressLine} />
//           <View style={styles.progressStep}>
//             <View style={styles.progressDot}>
//               <Text style={styles.progressNumber}>3</Text>
//             </View>
//             <Text style={styles.progressLabel}>Payment</Text>
//           </View>
//         </View>

//         {/* Travel Add-ons Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Enhance Your Journey</Text>
//           {/* {selectedOfferId && (
//             <Text style={styles.flightId}>Flight ID: {selectedOfferId}</Text>
//           )} */}

//           {addonsLoading ? (
//             <View style={styles.addonsLoading}>
//               <ActivityIndicator size="small" color="#DC2626" />
//               <Text style={styles.loadingText}>Loading add-ons...</Text>
//             </View>
//           ) : addonsError ? (
//             <View style={styles.errorContainer}>
//               <Text style={styles.errorText}>
//                 Failed to load travel add-ons
//               </Text>
//               <TouchableOpacity
//                 onPress={refetchAddons}
//                 style={styles.retryButton}
//               >
//                 <Text style={styles.retryButtonText}>Try Again</Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <View style={styles.addonsContainer}>
//               {addons.map((addon: any) => (
//                 <TravelAddonCard
//                   key={addon.id}
//                   addon={addon}
//                   isSelected={selectedAddons.includes(addon.id)}
//                   isAdding={addingAddon === addon.id}
//                   onToggle={toggleAddon}
//                 />
//               ))}
//             </View>
//           )}
//         </View>

//         {/* Fare Summary */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Fare Summary</Text>
//           <View style={styles.fareContainer}>
//             {getFlightRoutes().map((route: any, idx: any) => (
//               <View key={idx} style={styles.routeItem}>
//                 <Ionicons name="airplane" size={20} color="#DC2626" />
//                 <View style={styles.routeInfo}>
//                   <Text style={styles.routeText}>{route}</Text>
//                   <Text style={styles.routeSubtext}>
//                     {selectedFlight?.oneWay ? "One Way" : "Round Trip"} ·
//                     Economy
//                   </Text>
//                 </View>
//               </View>
//             ))}
//           </View>
//         </View>

//         {/* Traveler Information */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Traveler Information</Text>
//           <View style={styles.travelerContainer}>
//             {[
//               {
//                 label: "Name",
//                 value: `${Traveler?.name?.firstName} ${Traveler?.name?.lastName}`,
//               },
//               { label: "Gender", value: Traveler?.gender },
//               {
//                 label: "Date of Birth",
//                 value: Traveler?.dateOfBirth
//                   ? formatDate(Traveler?.dateOfBirth)
//                   : "N/A",
//               },
//               { label: "Email", value: Traveler?.contact?.emailAddress },
//               { label: "Phone", value: Traveler?.contact?.phones?.[0]?.number },
//               {
//                 label: "Nationality",
//                 value: `${Traveler?.documents?.[0]?.nationality} (${Traveler?.contact?.phones?.[0]?.countryCallingCode})`,
//               },
//               {
//                 label: "Birth Place",
//                 value: Traveler?.documents?.[0]?.birthPlace,
//               },
//               {
//                 label: "Passport Number",
//                 value: Traveler?.documents?.[0]?.number,
//               },
//               {
//                 label: "Passport Expiry",
//                 value: Traveler?.documents?.[0]?.expiryDate
//                   ? formatDate(Traveler?.documents?.[0]?.expiryDate)
//                   : "N/A",
//               },
//             ].map(({ label, value }) => (
//               <View key={label} style={styles.travelerItem}>
//                 <Text style={styles.travelerLabel}>{label}</Text>
//                 <Text style={styles.travelerValue}>{value}</Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         {/* Price Summary */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Price Summary</Text>
//           <View style={styles.priceContainer}>
//             <View style={styles.priceRow}>
//               <Text style={styles.priceLabel}>
//                 Flights × {getPassengerCount()} Traveler
//                 {getPassengerCount() > 1 ? "s" : ""}
//               </Text>
//               <Text style={styles.priceValue}>
//                 {formatCurrency(Number(selectedFlight?.price?.base || 0))}
//               </Text>
//             </View>
//             <View style={styles.priceRow}>
//               <Text style={styles.priceLabel}>Taxes & Fees</Text>
//               <Text style={styles.priceValue}>
//                 {formatCurrency(getTaxes())}
//               </Text>
//             </View>
//             {selectedAddons.length > 0 && (
//               <View style={styles.priceRow}>
//                 <Text style={styles.priceLabel}>Add-ons</Text>
//                 <Text style={styles.priceValue}>
//                   {formatCurrency(getSelectedAddonsTotal())}
//                 </Text>
//               </View>
//             )}
//             <View style={styles.divider} />
//             <View style={styles.priceRow}>
//               <Text style={styles.totalLabel}>Trip Total</Text>
//               <Text style={styles.totalValue}>
//                 {formatCurrency(getTotalPrice() + getSelectedAddonsTotal())}
//               </Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Pay Now Button */}
//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={[
//             styles.payButton,
//             isProcessingPayment && styles.payButtonDisabled,
//           ]}
//           onPress={handlePayNow}
//           disabled={isProcessingPayment}
//         >
//           {isProcessingPayment ? (
//             <View style={styles.loadingRow}>
//               <ActivityIndicator size="small" color="#fff" />
//               <Text style={styles.payButtonText}>Processing...</Text>
//             </View>
//           ) : (
//             <View style={styles.loadingRow}>
//               <Ionicons name="card" size={20} color="#fff" />
//               <Text style={styles.payButtonText}>Pay Now</Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* Payment Confirmation Modal */}
//       <Modal visible={showPaymentModal} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Ionicons name="shield-checkmark" size={48} color="#4CAF50" />
//               <Text style={styles.modalTitle}>Complete Checkout</Text>
//             </View>
//             <Text style={styles.modalText}>
//               To complete your booking, you'll be securely redirected to the
//               payment gateway.
//             </Text>
//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={styles.cancelButton}
//                 onPress={() => setShowPaymentModal(false)}
//               >
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.proceedButton}
//                 onPress={handleProceedToCheckout}
//               >
//                 <Text style={styles.proceedButtonText}>
//                   Proceed to Checkout
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   header: {
//     backgroundColor: "#DC2626",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   backButton: {
//     padding: 8,
//     marginRight: 8,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: "#666",
//   },
//   greetingContainer: {
//     marginBottom: 24,
//   },
//   greeting: {
//     fontSize: 16,
//     color: "#666",
//   },
//   name: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   progressContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 24,
//     paddingHorizontal: 8,
//   },
//   progressStep: {
//     alignItems: "center",
//     flex: 1,
//   },
//   progressDot: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: "#e0e0e0",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   completedDot: {
//     backgroundColor: "#4CAF50",
//   },
//   progressNumber: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#666",
//   },
//   progressLabel: {
//     fontSize: 12,
//     color: "#666",
//     textAlign: "center",
//   },
//   progressLine: {
//     height: 2,
//     backgroundColor: "#e0e0e0",
//     flex: 1,
//     marginHorizontal: 8,
//     marginBottom: 24,
//   },
//   section: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 16,
//   },
//   flightId: {
//     fontSize: 12,
//     color: "#666",
//     marginBottom: 16,
//   },
//   addonsLoading: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 20,
//     gap: 12,
//   },
//   errorContainer: {
//     alignItems: "center",
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 14,
//     color: "#d32f2f",
//     marginBottom: 12,
//   },
//   retryButton: {
//     backgroundColor: "#DC2626",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   addonsContainer: {
//     gap: 12,
//   },
//   fareContainer: {
//     gap: 12,
//   },
//   routeItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   routeInfo: {
//     flex: 1,
//   },
//   routeText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//   },
//   routeSubtext: {
//     fontSize: 14,
//     color: "#666",
//     marginTop: 2,
//   },
//   travelerContainer: {
//     gap: 12,
//   },
//   travelerItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   travelerLabel: {
//     fontSize: 14,
//     color: "#666",
//     flex: 1,
//   },
//   travelerValue: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#333",
//     flex: 2,
//     textAlign: "right",
//   },
//   priceContainer: {
//     gap: 12,
//   },
//   priceRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   priceLabel: {
//     fontSize: 14,
//     color: "#666",
//   },
//   priceValue: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#333",
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#e0e0e0",
//     marginVertical: 8,
//   },
//   totalLabel: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   totalValue: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#d32f2f",
//   },
//   footer: {
//     backgroundColor: "#fff",
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: "#e0e0e0",
//   },
//   payButton: {
//     backgroundColor: "#d32f2f",
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   payButtonDisabled: {
//     opacity: 0.6,
//   },
//   loadingRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   payButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   modalContainer: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 24,
//     width: "100%",
//     maxWidth: 400,
//     alignItems: "center",
//   },
//   modalHeader: {
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#333",
//     marginTop: 12,
//   },
//   modalText: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 24,
//   },
//   modalActions: {
//     flexDirection: "row",
//     gap: 12,
//     width: "100%",
//   },
//   cancelButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#d32f2f",
//     alignItems: "center",
//   },
//   cancelButtonText: {
//     color: "#d32f2f",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   proceedButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     backgroundColor: "#d32f2f",
//     alignItems: "center",
//   },
//   proceedButtonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
// });

import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

// Components
import BookingFooter from "../components/booking/BookingFooter";
import BookingHeader from "../components/booking/BookingHeader";
import FareSummarySection from "../components/booking/FareSummarySection";
import PaymentModal from "../components/booking/PaymentModal";
import PriceSummarySection from "../components/booking/PriceSummarySection";
import ProgressSteps from "../components/booking/ProgressSteps";
import TravelAddonsSection from "../components/booking/TravelAddonsSection";
import TravelerInfoSection from "../components/booking/TravelerInfoSection";

// Hooks and APIs
import { useCustomFonts } from "../hooks/useCustomFonts";
import { useTravelAddons } from "../hooks/useTravelAddons";
import { fetchFlightOfferById, getTravelerById } from "../lib/flightAPIs";
import { initializePayment } from "../lib/paymentAPI";

// Types
import type { AppDispatch, RootState } from "../redux/store";
import type { TravelAddon } from "../types/travelAddons";

export default function FullSummaryScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [fontsLoaded] = useCustomFonts();

  const user = useSelector((state: RootState) => state.user.user);
  const selectedFlight: any = useSelector(
    (state: RootState) => state.flight.selectedFlight
  );
  const selectedOfferId: any = useSelector(
    (state: RootState) => state.flight.flightOffrId
  );
  const traveler: any = useSelector(
    (state: RootState) => state.flight.traveler
  );

  const [travelerData, setTravelerData] = useState<any[]>([]);
  const [travelerLoading, setTravelerLoading] = useState(false);
  const [flightOfferLoading, setFlightOfferLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const {
    addons,
    loading: addonsLoading,
    error: addonsError,
    selectedAddons,
    addingAddon,
    toggleAddon,
    getSelectedAddonsTotal,
    refetch: refetchAddons,
  } = useTravelAddons(selectedOfferId);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!traveler || !Array.isArray(traveler) || traveler.length === 0) return;

    setTravelerLoading(true);

    Promise.all(
      traveler.map((t: any) => getTravelerById(t.traveler?.id || t.id || ""))
    )
      .then((results) => {
        setTravelerData(results.map((res) => res.traveler || res));
      })
      .catch((err) => {
        console.error("Failed to fetch travelers:", err);
        setTravelerData([]);
      })
      .finally(() => setTravelerLoading(false));
  }, [traveler]);

  useEffect(() => {
    if (!selectedOfferId) return;

    setFlightOfferLoading(true);
    fetchFlightOfferById(selectedOfferId)
      .then(() => setFlightOfferLoading(false))
      .catch((err) => {
        console.error("Failed to fetch flight offer:", err);
        setFlightOfferLoading(false);
      });
  }, [selectedOfferId]);

  const handlePayNow = () => {
    if (!traveler || !selectedFlight) return;
    setShowPaymentModal(true);
  };

  const handleProceedToCheckout = async () => {
    try {
      setShowPaymentModal(false);
      setIsProcessingPayment(true);

      const paymentInitData: any = {
        amount: selectedFlight.price?.total,
        currency: selectedFlight?.price?.currency,
        email: user?.email,
        bookingData: {
          flightOffer: selectedFlight,
          travelers: travelerData,
          userId: user?.id,
        },
      };

      const paymentConfig = await initializePayment(paymentInitData);

      router.push({
        pathname: "/payment-webview",
        params: { url: encodeURIComponent(paymentConfig.paymentLink) },
      } as any);
    } catch (error) {
      console.error("Payment initialization failed:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!fontsLoaded || travelerLoading || flightOfferLoading) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d32f2f" />
            <Text style={styles.loadingText}>Loading booking details...</Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  // Compose list data with keys and types for FlatList rendering
  const listData = [
    { key: "progress", type: "header" },
    { key: "addons", type: "addons" },
    { key: "fare_summary", type: "fare" },
    ...travelerData.map((traveler, index) => ({
      key: `traveler-${index}`,
      type: "traveler",
      traveler,
    })),
    { key: "price_summary", type: "price" },
  ];

  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case "header":
        return <ProgressSteps currentStep={3} />;
      case "addons":
        return (
          <TravelAddonsSection
            addons={addons as TravelAddon[]}
            addonsLoading={addonsLoading}
            addonsError={addonsError}
            selectedAddons={selectedAddons}
            addingAddon={addingAddon}
            toggleAddon={toggleAddon}
            refetchAddons={refetchAddons}
          />
        );
      case "fare":
        return <FareSummarySection selectedFlight={selectedFlight} />;
      case "traveler":
        return <TravelerInfoSection travelersData={[item.traveler]} />;
      case "price":
        return (
          <PriceSummarySection
            selectedFlight={selectedFlight}
            selectedAddons={selectedAddons}
            getSelectedAddonsTotal={getSelectedAddonsTotal}
            traveler={traveler}
          />
        );
      default:
        return null;
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <BookingHeader onBack={() => router.back()} />

        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />

        <BookingFooter
          onPayNow={handlePayNow}
          isProcessing={isProcessingPayment}
          totalAmount={
            (selectedFlight?.price?.total || 0) + getSelectedAddonsTotal()
          }
          currency={selectedFlight?.price?.currency}
        />

        <PaymentModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onProceed={handleProceedToCheckout}
          totalAmount={
            (selectedFlight?.price?.total || 0) + getSelectedAddonsTotal()
          }
          currency={selectedFlight?.price?.currency}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontFamily: "Inter",
  },
});
