import { bookFlightWithAddons } from "@/lib/flightAPIs";
import { verifyPayment } from "@/lib/paymentAPI";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearSelectedFlight,
  clearTravelers,
} from "@/redux/slices/flightSlice";
import { normalizeTraveler } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper to format date/time
function formatDateTime(dt: string) {
  if (!dt) return "";
  try {
    const d = new Date(dt);
    return d.toLocaleString();
  } catch {
    return dt;
  }
}

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { tx_ref } = useLocalSearchParams();

  console.log("🚀 PaymentSuccessScreen initialized");
  console.log("📧 tx_ref from params:", tx_ref);

  const [status, setStatus] = useState<
    "verifying" | "booking" | "success" | "failed"
  >("verifying");
  const [message, setMessage] = useState("Verifying your payment...");
  const [error, setError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);

  const hasStartedProcessing = useRef(false);

  const dispatch = useAppDispatch();
  // Redux selectors
  const user = useAppSelector((state: any) => state.user.user);
  const Traveler = useAppSelector((state: any) => state.flight.traveler); // [{ message, traveler }]
  const flightOffer = useAppSelector(
    (state: any) => state.flight.selectedFlight
  );
  const addonIds = useAppSelector((state: any) => state.addonIds);

  // Log Redux state
  console.log("📊 Redux State:");
  console.log("  👤 User:", user);
  console.log("  ✈️ FlightOffer:", flightOffer);
  console.log("  👥 Traveler:", Traveler);
  console.log("  🎒 AddonIds:", addonIds);

  // Reset state function
  const resetAll = () => {
    console.log("🔄 Resetting all state and Redux data");
    dispatch(clearSelectedFlight());
    dispatch(clearTravelers());
    // dispatch(clearUser()); // Uncomment if you want to reset user as well
    setStatus("verifying");
    setMessage("Verifying your payment...");
    setError(null);
    setBookingResult(null);
    hasStartedProcessing.current = false;
    console.log("✅ Reset complete");
  };

  useEffect(() => {
    console.log("🔄 useEffect triggered");
    console.log("  tx_ref:", tx_ref);
    console.log("  hasStartedProcessing:", hasStartedProcessing.current);

    if (!tx_ref || hasStartedProcessing.current) {
      console.log("⏹️ Skipping verification - no tx_ref or already processing");
      return;
    }

    hasStartedProcessing.current = true;
    console.log("🚀 Starting verification and booking process");

    const verifyAndBook = async () => {
      try {
        console.log("🔍 Starting payment verification");
        setStatus("verifying");
        setMessage("Verifying your payment...");

        const paymentVerificationResult = await verifyPayment(tx_ref as string);
        console.log(
          "💳 Payment verification result:",
          paymentVerificationResult
        );

        if (!paymentVerificationResult.success) {
          const errorMsg =
            paymentVerificationResult.message || "Payment verification failed.";
          console.log("❌ Payment verification failed:", errorMsg);
          setStatus("failed");
          setMessage("Payment not successful.");
          setError(errorMsg);
          return;
        }

        console.log("✅ Payment verification successful");
        setStatus("booking");
        setMessage("Payment successful! Booking your flight...");

        // Validate required data
        console.log("🔍 Validating booking data:");
        console.log("  User ID:", user?.id);
        console.log(
          "  Traveler array length:",
          Array.isArray(Traveler) ? Traveler.length : "Not array"
        );
        console.log("  FlightOffer exists:", !!flightOffer);

        if (
          !user?.id ||
          !Array.isArray(Traveler) ||
          Traveler.length === 0 ||
          !flightOffer
        ) {
          const errorMsg = "Missing booking information.";
          console.log("❌ Validation failed:", errorMsg);
          console.log("  Missing user ID:", !user?.id);
          console.log(
            "  Missing/invalid travelers:",
            !Array.isArray(Traveler) || Traveler.length === 0
          );
          console.log("  Missing flight offer:", !flightOffer);
          setStatus("failed");
          setMessage(errorMsg);
          setError(errorMsg);
          return;
        }

        // Extract and normalize travelers from { message, traveler } structure
        console.log("🔄 Processing travelers data:");
        // const travelersToSend = Traveler.map((item: any, index: number) => {
        //   console.log(`  Processing traveler ${index + 1}:`, item);
        //   if (!item.traveler) {
        //     console.log(`    ❌ No traveler data found for index ${index}`);
        //     return null;
        //   }
        //   try {
        //     const normalized = normalizeTraveler(item.traveler);
        //     console.log(`    ✅ Normalized traveler ${index + 1}:`, normalized);
        //     return normalized;
        //   } catch (err) {
        //     console.log(`    ❌ Error normalizing traveler ${index + 1}:`, err);
        //     return null;
        //   }
        // }).filter(Boolean);

        const countryNameToISO: Record<string, string> = {
          Nigeria: "NG",
          "United States": "US",
          "United Kingdom": "GB",
          Canada: "CA",
          Australia: "AU",
          Germany: "DE",
          France: "FR",
          India: "IN",
          China: "CN",
          Japan: "JP",
          // add more countries as needed
        };

        // Inside your booking flow, before calling normalizeTraveler:

        const travelersToSend = Traveler.map((item: any, index: number) => {
          if (!item.traveler) return null;
          try {
            // Prepare traveler data with ISO country code conversion
            const preparedTraveler = {
              ...item.traveler,
              countryCode:
                item.traveler.countryCode &&
                item.traveler.countryCode.length > 2
                  ? countryNameToISO[item.traveler.countryCode] ||
                    item.traveler.countryCode
                  : item.traveler.countryCode,
            };
            const normalized = normalizeTraveler(preparedTraveler);
            return normalized;
          } catch (err) {
            console.error(`Error normalizing traveler ${index + 1}:`, err);
            return null;
          }
        }).filter(Boolean);

        console.log("👥 Final travelers to send:", travelersToSend);

        if (travelersToSend.length === 0) {
          const errorMsg = "No valid travelers found for booking.";
          console.log("❌ No valid travelers after processing");
          setStatus("failed");
          setMessage(errorMsg);
          setError(errorMsg);
          return;
        }

        const bookingPayload = {
          flightOffer,
          travelers: travelersToSend,
          addonIds,
          userId: user.id,
        };

        console.log("📤 Sending booking request with payload:", bookingPayload);

        const bookingResponse = await bookFlightWithAddons(bookingPayload);
        console.log("📥 Booking response received:", bookingResponse);

        if (bookingResponse.success) {
          console.log("✅ Booking successful!");
          setStatus("success");
          setMessage("Your flight has been booked successfully!");
          setBookingResult(bookingResponse.booking);
          console.log("📋 Booking result saved:", bookingResponse.booking);
        } else {
          const errorMsg = bookingResponse.message || "Flight booking failed.";
          console.log("❌ Booking failed:", errorMsg);
          console.log("📋 Full booking response:", bookingResponse);
          setStatus("failed");
          setMessage(errorMsg);
          setError(errorMsg);
        }
      } catch (err: any) {
        console.log("💥 Unexpected error in verifyAndBook:", err);
        console.log("Error stack:", err?.stack);
        setStatus("failed");
        setMessage("An unexpected error occurred.");
        setError(err?.message || String(err));
      }
    };

    verifyAndBook();
  }, [tx_ref, user, Traveler, flightOffer, addonIds]);

  // Extract booking info for display
  const booking = bookingResult;
  const referenceId = booking?.referenceId || "";
  const travelers = booking?.apiResponse?.data?.travelers || [];
  const flightOfferData = booking?.apiResponse?.data?.flightOffers?.[0];
  const grandTotal = flightOfferData?.price?.grandTotal || "";
  const currency = flightOfferData?.price?.currency || "";
  const statusText = booking?.status || "";
  const segments = flightOfferData?.itineraries?.[0]?.segments || [];

  // Log booking details when available
  useEffect(() => {
    if (booking) {
      console.log("📋 Booking details extracted:");
      console.log("  Reference ID:", referenceId);
      console.log("  Travelers:", travelers);
      console.log("  Grand Total:", grandTotal, currency);
      console.log("  Status:", statusText);
      console.log("  Segments:", segments);
    }
  }, [booking]);

  // Auto-route to my-bookings after 5 seconds on success
  useEffect(() => {
    if (status === "success") {
      console.log("🎉 Success! Setting up auto-redirect timer");
      const timer = setTimeout(() => {
        console.log("⏰ Auto-redirect timer triggered");
        resetAll();
        router.replace("/my-bookings");
      }, 5000);
      return () => {
        console.log("🚫 Clearing auto-redirect timer");
        clearTimeout(timer);
      };
    }
  }, [status]);

  const handleGoToBookings = () => {
    console.log("👆 User clicked 'Go to My Bookings' button");
    resetAll();
    router.replace("/my-bookings");
  };

  // Log status changes
  useEffect(() => {
    console.log("📊 Status changed to:", status);
    console.log("📝 Message:", message);
    if (error) {
      console.log("❌ Error:", error);
    }
  }, [status, message, error]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>{renderIcon(status)}</View>

        <Text style={styles.title}>{renderTitle(status)}</Text>
        <Text style={styles.message}>{message}</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error Details:</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {status === "success" && booking && (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Booking Reference:</Text>
            <Text style={styles.bookingId}>{referenceId}</Text>

            <Text style={styles.successTitle}>Traveler(s):</Text>
            {travelers.map((trav: any, idx: number) => (
              <Text key={idx} style={styles.detailText}>
                {trav.name.firstName} {trav.name.lastName}
              </Text>
            ))}

            <Text style={styles.successTitle}>Total Paid:</Text>
            <Text style={styles.detailText}>
              {grandTotal} {currency}
            </Text>

            <Text style={styles.successTitle}>Status:</Text>
            <Text style={styles.detailText}>{statusText}</Text>

            <Text style={styles.successTitle}>Itinerary:</Text>
            {segments.map((seg: any, idx: number) => (
              <Text key={idx} style={styles.detailText}>
                {seg.departure.iataCode} ({formatDateTime(seg.departure.at)}) →{" "}
                {seg.arrival.iataCode} ({formatDateTime(seg.arrival.at)}) |
                Flight {seg.carrierCode}
                {seg.number}
              </Text>
            ))}

            <TouchableOpacity
              style={styles.button}
              onPress={handleGoToBookings}
            >
              <Text style={styles.buttonText}>Go to My Bookings</Text>
            </TouchableOpacity>

            <Text style={styles.infoText}>
              You will be redirected to My Bookings shortly.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions for icons/titles
function renderIcon(status: string) {
  switch (status) {
    case "verifying":
    case "booking":
      return <ActivityIndicator size="large" color="#007AFF" />;
    case "success":
      return <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />;
    case "failed":
      return <Ionicons name="close-circle" size={64} color="#f44336" />;
    default:
      return null;
  }
}
function renderTitle(status: string) {
  switch (status) {
    case "verifying":
      return "Verifying Payment...";
    case "booking":
      return "Booking Your Flight...";
    case "success":
      return "Payment & Booking Successful!";
    case "failed":
      return "Payment or Booking Failed";
    default:
      return "Processing...";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    borderWidth: 1,
    borderColor: "#ffcdd2",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: "100%",
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#d32f2f",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: "#d32f2f",
  },
  successContainer: {
    backgroundColor: "#e8f5e8",
    borderWidth: 1,
    borderColor: "#c8e6c9",
    borderRadius: 8,
    padding: 16,
    width: "100%",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 16,
    fontFamily: "monospace",
    color: "#2e7d32",
    fontWeight: "bold",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 2,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  infoText: {
    marginTop: 16,
    color: "#666",
    fontSize: 13,
    textAlign: "center",
  },
});

// import { bookFlightWithAddons } from "@/lib/flightAPIs";
// import { verifyPayment } from "@/lib/paymentAPI";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks";
// import {
//   clearSelectedFlight,
//   clearTravelers,
// } from "@/redux/slices/flightSlice";
// import { normalizeTraveler } from "@/utils/formatter";
// import { Ionicons } from "@expo/vector-icons";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// // Helper to format date/time
// function formatDateTime(dt: string) {
//   if (!dt) return "";
//   try {
//     const d = new Date(dt);
//     return d.toLocaleString();
//   } catch {
//     return dt;
//   }
// }

// export default function PaymentSuccessScreen() {
//   const router = useRouter();
//   const { tx_ref } = useLocalSearchParams();

//   const [status, setStatus] = useState<
//     "verifying" | "booking" | "success" | "failed"
//   >("verifying");
//   const [message, setMessage] = useState("Verifying your payment...");
//   const [error, setError] = useState<string | null>(null);
//   const [bookingResult, setBookingResult] = useState<any>(null);

//   const hasStartedProcessing = useRef(false);

//   const dispatch = useAppDispatch();
//   // Redux selectors
//   const user = useAppSelector((state: any) => state.user.user);
//   const Traveler = useAppSelector((state: any) => state.flight.traveler); // [{ message, traveler }]
//   const flightOffer = useAppSelector(
//     (state: any) => state.flight.selectedFlight
//   );
//   const addonIds = useAppSelector((state: any) => state.addonIds);

//   // Reset state function
//   const resetAll = () => {
//     dispatch(clearSelectedFlight());
//     dispatch(clearTravelers());
//     // dispatch(clearUser()); // Uncomment if you want to reset user as well
//     setStatus("verifying");
//     setMessage("Verifying your payment...");
//     setError(null);
//     setBookingResult(null);
//     hasStartedProcessing.current = false;
//   };

//   useEffect(() => {
//     if (!tx_ref || hasStartedProcessing.current) return;

//     hasStartedProcessing.current = true;

//     const verifyAndBook = async () => {
//       try {
//         setStatus("verifying");
//         setMessage("Verifying your payment...");

//         const paymentVerificationResult = await verifyPayment(tx_ref as string);

//         if (!paymentVerificationResult.success) {
//           const errorMsg =
//             paymentVerificationResult.message || "Payment verification failed.";
//           setStatus("failed");
//           setMessage("Payment not successful.");
//           setError(errorMsg);
//           return;
//         }

//         setStatus("booking");
//         setMessage("Payment successful! Booking your flight...");

//         if (
//           !user?.id ||
//           !Array.isArray(Traveler) ||
//           Traveler.length === 0 ||
//           !flightOffer
//         ) {
//           const errorMsg = "Missing booking information.";
//           setStatus("failed");
//           setMessage(errorMsg);
//           setError(errorMsg);
//           return;
//         }

//         // Extract and normalize travelers from { message, traveler } structure
//         const travelersToSend = Traveler.map((item: any) => {
//           if (!item.traveler) return null;
//           try {
//             return normalizeTraveler(item.traveler);
//           } catch {
//             return null;
//           }
//         }).filter(Boolean);

//         if (travelersToSend.length === 0) {
//           const errorMsg = "No valid travelers found for booking.";
//           setStatus("failed");
//           setMessage(errorMsg);
//           setError(errorMsg);
//           return;
//         }

//         const bookingPayload = {
//           flightOffer,
//           travelers: travelersToSend,
//           addonIds,
//           userId: user.id,
//         };

//         const bookingResponse = await bookFlightWithAddons(bookingPayload);

//         if (bookingResponse.success) {
//           setStatus("success");
//           setMessage("Your flight has been booked successfully!");
//           setBookingResult(bookingResponse.booking);
//         } else {
//           const errorMsg = bookingResponse.message || "Flight booking failed.";
//           setStatus("failed");
//           setMessage(errorMsg);
//           setError(errorMsg);
//         }
//       } catch (err: any) {
//         setStatus("failed");
//         setMessage("An unexpected error occurred.");
//         setError(err?.message || String(err));
//       }
//     };

//     verifyAndBook();
//   }, [tx_ref, user, Traveler, flightOffer, addonIds]);

//   // Extract booking info for display
//   const booking = bookingResult;
//   const referenceId = booking?.referenceId || "";
//   const travelers = booking?.apiResponse?.data?.travelers || [];
//   const flightOfferData = booking?.apiResponse?.data?.flightOffers?.[0];
//   const grandTotal = flightOfferData?.price?.grandTotal || "";
//   const currency = flightOfferData?.price?.currency || "";
//   const statusText = booking?.status || "";
//   const segments = flightOfferData?.itineraries?.[0]?.segments || [];

//   // Auto-route to my-bookings after 5 seconds on success
//   useEffect(() => {
//     if (status === "success") {
//       const timer = setTimeout(() => {
//         resetAll();
//         router.replace("/my-bookings");
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [status]);

//   const handleGoToBookings = () => {
//     resetAll();
//     router.replace("/my-bookings");
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.content}>
//         <View style={styles.iconContainer}>{renderIcon(status)}</View>

//         <Text style={styles.title}>{renderTitle(status)}</Text>
//         <Text style={styles.message}>{message}</Text>

//         {error && (
//           <View style={styles.errorContainer}>
//             <Text style={styles.errorTitle}>Error Details:</Text>
//             <Text style={styles.errorText}>{error}</Text>
//           </View>
//         )}

//         {status === "success" && booking && (
//           <View style={styles.successContainer}>
//             <Text style={styles.successTitle}>Booking Reference:</Text>
//             <Text style={styles.bookingId}>{referenceId}</Text>

//             <Text style={styles.successTitle}>Traveler(s):</Text>
//             {travelers.map((trav: any, idx: number) => (
//               <Text key={idx} style={styles.detailText}>
//                 {trav.name.firstName} {trav.name.lastName}
//               </Text>
//             ))}

//             <Text style={styles.successTitle}>Total Paid:</Text>
//             <Text style={styles.detailText}>
//               {grandTotal} {currency}
//             </Text>

//             <Text style={styles.successTitle}>Status:</Text>
//             <Text style={styles.detailText}>{statusText}</Text>

//             <Text style={styles.successTitle}>Itinerary:</Text>
//             {segments.map((seg: any, idx: number) => (
//               <Text key={idx} style={styles.detailText}>
//                 {seg.departure.iataCode} ({formatDateTime(seg.departure.at)}) →{" "}
//                 {seg.arrival.iataCode} ({formatDateTime(seg.arrival.at)}) |
//                 Flight {seg.carrierCode}
//                 {seg.number}
//               </Text>
//             ))}

//             <TouchableOpacity
//               style={styles.button}
//               onPress={handleGoToBookings}
//             >
//               <Text style={styles.buttonText}>Go to My Bookings</Text>
//             </TouchableOpacity>

//             <Text style={styles.infoText}>
//               You will be redirected to My Bookings shortly.
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // Helper functions for icons/titles
// function renderIcon(status: string) {
//   switch (status) {
//     case "verifying":
//     case "booking":
//       return <ActivityIndicator size="large" color="#007AFF" />;
//     case "success":
//       return <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />;
//     case "failed":
//       return <Ionicons name="close-circle" size={64} color="#f44336" />;
//     default:
//       return null;
//   }
// }
// function renderTitle(status: string) {
//   switch (status) {
//     case "verifying":
//       return "Verifying Payment...";
//     case "booking":
//       return "Booking Your Flight...";
//     case "success":
//       return "Payment & Booking Successful!";
//     case "failed":
//       return "Payment or Booking Failed";
//     default:
//       return "Processing...";
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   content: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 32,
//     paddingVertical: 24,
//   },
//   iconContainer: {
//     marginBottom: 24,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333",
//     textAlign: "center",
//     marginBottom: 12,
//   },
//   message: {
//     fontSize: 16,
//     color: "#666",
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   errorContainer: {
//     backgroundColor: "#ffebee",
//     borderWidth: 1,
//     borderColor: "#ffcdd2",
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 24,
//     width: "100%",
//   },
//   errorTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#d32f2f",
//     marginBottom: 4,
//   },
//   errorText: {
//     fontSize: 14,
//     color: "#d32f2f",
//   },
//   successContainer: {
//     backgroundColor: "#e8f5e8",
//     borderWidth: 1,
//     borderColor: "#c8e6c9",
//     borderRadius: 8,
//     padding: 16,
//     width: "100%",
//     marginBottom: 16,
//   },
//   successTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#2e7d32",
//     marginBottom: 4,
//   },
//   bookingId: {
//     fontSize: 16,
//     fontFamily: "monospace",
//     color: "#2e7d32",
//     fontWeight: "bold",
//     marginBottom: 8,
//   },
//   detailText: {
//     fontSize: 15,
//     color: "#333",
//     marginBottom: 2,
//   },
//   button: {
//     marginTop: 12,
//     backgroundColor: "#007AFF",
//     paddingVertical: 12,
//     paddingHorizontal: 32,
//     borderRadius: 8,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   infoText: {
//     marginTop: 16,
//     color: "#666",
//     fontSize: 13,
//     textAlign: "center",
//   },
// });
