// import { bookFlightWithAddons } from "@/lib/flightAPIs";
// import { verifyPayment } from "@/lib/paymentAPI";
// import { normalizeTraveler } from "@/utils/formatter";
// import { Ionicons } from "@expo/vector-icons";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import { useSelector } from "react-redux";

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

//   // Redux selectors
//   const user = useSelector((state: any) => state.user.user);
//   const Traveler = useSelector((state: any) => state.flight.traveler); // Now an array!
//   const flightOffer = useSelector((state: any) => state.flight.selectedFlight);
//   const addonIds = useSelector((state: any) => state.addonIds);

//   // Initial state logs
//   console.log("[INIT] user:", user);
//   console.log("[INIT] Traveler (array):", Traveler);
//   console.log("[INIT] flightOffer:", flightOffer);
//   console.log("[INIT] addonIds:", addonIds);
//   console.log("[INIT] tx_ref:", tx_ref);

//   useEffect(() => {
//     if (!tx_ref || hasStartedProcessing.current) {
//       console.log("[EFFECT] Skipping: tx_ref missing or already processing.");
//       return;
//     }

//     hasStartedProcessing.current = true;

//     const verifyAndBook = async () => {
//       try {
//         setStatus("verifying");
//         setMessage("Verifying your payment...");
//         console.log("[STEP] Verifying payment for tx_ref:", tx_ref);

//         const paymentVerificationResult = await verifyPayment(tx_ref as string);
//         console.log(
//           "[RESULT] Payment verification:",
//           paymentVerificationResult
//         );

//         if (!paymentVerificationResult.success) {
//           const errorMsg =
//             paymentVerificationResult.message || "Payment verification failed.";
//           setStatus("failed");
//           setMessage("Payment not successful.");
//           setError(errorMsg);
//           console.error("[ERROR] Payment verification failed:", errorMsg);
//           return;
//         }

//         setStatus("booking");
//         setMessage("Payment successful! Booking your flight...");
//         console.log("[STEP] Payment verified. Preparing to book flight.");

//         // --- Corrected Traveler check for array ---
//         if (!user?.id) {
//           console.error("[ERROR] Missing user id:", user);
//         }
//         if (!Array.isArray(Traveler) || Traveler.length === 0) {
//           console.error(
//             "[ERROR] Traveler array is missing or empty:",
//             Traveler
//           );
//         }
//         if (!flightOffer) {
//           console.error("[ERROR] Missing flightOffer:", flightOffer);
//         }

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
//           console.error("[ERROR] " + errorMsg, {
//             user,
//             Traveler,
//             flightOffer,
//             addonIds,
//           });
//           return;
//         }

//         // Normalize all travelers in the array
//         // Normalize travelers with error handling
//         const travelersToSend = Traveler.map((item: any) => {
//           if (!item.traveler) {
//             console.error("[ERROR] Missing 'traveler' property in item:", item);
//             return null;
//           }
//           try {
//             return normalizeTraveler(item.traveler);
//           } catch (err) {
//             console.error(
//               "[ERROR] Traveler normalization failed:",
//               err,
//               item.traveler
//             );
//             return null;
//           }
//         }).filter(Boolean);

//         if (travelersToSend.length === 0) {
//           const errorMsg = "No valid travelers found for booking.";
//           setStatus("failed");
//           setMessage(errorMsg);
//           setError(errorMsg);
//           console.error("[ERROR]", errorMsg, Traveler);
//           return;
//         }

//         console.log("[INFO] travelersToSend (array):", travelersToSend);

//         const bookingPayload = {
//           flightOffer,
//           travelers: travelersToSend,
//           addonIds,
//           userId: user.id,
//         };
//         console.log("[INFO] bookingPayload:", bookingPayload);
//         console.log(
//           "[DEBUG] Booking payload:",
//           JSON.stringify(bookingPayload, null, 2)
//         );

//         const bookingResponse = await bookFlightWithAddons(bookingPayload);
//         console.log("[RESULT] bookingResponse:", bookingResponse);

//         if (bookingResponse.success) {
//           setStatus("success");
//           setMessage("Your flight has been booked successfully!");
//           setBookingResult(bookingResponse);
//           console.log("[SUCCESS] Booking successful:", bookingResponse);
//         } else {
//           const errorMsg = bookingResponse.message || "Flight booking failed.";
//           setStatus("failed");
//           setMessage(errorMsg);
//           setError(errorMsg);
//           console.error("[ERROR] Booking failed:", errorMsg, bookingResponse);
//         }
//       } catch (err: any) {
//         console.error("[UNEXPECTED ERROR]:", err);
//         setStatus("failed");
//         setMessage("An unexpected error occurred.");
//         setError(err?.message || String(err));
//       }
//     };

//     verifyAndBook();
//   }, [tx_ref, user, Traveler, flightOffer, addonIds]);

//   const renderIcon = () => {
//     switch (status) {
//       case "verifying":
//       case "booking":
//         return <ActivityIndicator size="large" color="#007AFF" />;
//       case "success":
//         return <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />;
//       case "failed":
//         return <Ionicons name="close-circle" size={64} color="#f44336" />;
//       default:
//         return null;
//     }
//   };

//   const renderTitle = () => {
//     switch (status) {
//       case "verifying":
//         return "Verifying Payment...";
//       case "booking":
//         return "Booking Your Flight...";
//       case "success":
//         return "Payment & Booking Successful!";
//       case "failed":
//         return "Payment or Booking Failed";
//       default:
//         return "Processing...";
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         <View style={styles.iconContainer}>{renderIcon()}</View>

//         <Text style={styles.title}>{renderTitle()}</Text>
//         <Text style={styles.message}>{message}</Text>

//         {error && (
//           <View style={styles.errorContainer}>
//             <Text style={styles.errorTitle}>Error Details:</Text>
//             <Text style={styles.errorText}>{error}</Text>
//           </View>
//         )}

//         {status === "success" && bookingResult && (
//           <View style={styles.successContainer}>
//             <Text style={styles.successTitle}>Booking Reference:</Text>
//             <Text style={styles.bookingId}>
//               {bookingResult.bookingId || "N/A"}
//             </Text>
//           </View>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   content: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 32,
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
//   },
// });

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
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

  // Reset state function
  const resetAll = () => {
    dispatch(clearSelectedFlight());
    dispatch(clearTravelers());
    // dispatch(clearUser()); // Uncomment if you want to reset user as well
    setStatus("verifying");
    setMessage("Verifying your payment...");
    setError(null);
    setBookingResult(null);
    hasStartedProcessing.current = false;
  };

  useEffect(() => {
    if (!tx_ref || hasStartedProcessing.current) return;

    hasStartedProcessing.current = true;

    const verifyAndBook = async () => {
      try {
        setStatus("verifying");
        setMessage("Verifying your payment...");

        const paymentVerificationResult = await verifyPayment(tx_ref as string);

        if (!paymentVerificationResult.success) {
          const errorMsg =
            paymentVerificationResult.message || "Payment verification failed.";
          setStatus("failed");
          setMessage("Payment not successful.");
          setError(errorMsg);
          return;
        }

        setStatus("booking");
        setMessage("Payment successful! Booking your flight...");

        if (
          !user?.id ||
          !Array.isArray(Traveler) ||
          Traveler.length === 0 ||
          !flightOffer
        ) {
          const errorMsg = "Missing booking information.";
          setStatus("failed");
          setMessage(errorMsg);
          setError(errorMsg);
          return;
        }

        // Extract and normalize travelers from { message, traveler } structure
        const travelersToSend = Traveler.map((item: any) => {
          if (!item.traveler) return null;
          try {
            return normalizeTraveler(item.traveler);
          } catch {
            return null;
          }
        }).filter(Boolean);

        if (travelersToSend.length === 0) {
          const errorMsg = "No valid travelers found for booking.";
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

        const bookingResponse = await bookFlightWithAddons(bookingPayload);

        if (bookingResponse.success) {
          setStatus("success");
          setMessage("Your flight has been booked successfully!");
          setBookingResult(bookingResponse.booking);
        } else {
          const errorMsg = bookingResponse.message || "Flight booking failed.";
          setStatus("failed");
          setMessage(errorMsg);
          setError(errorMsg);
        }
      } catch (err: any) {
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

  // Auto-route to my-bookings after 5 seconds on success
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        resetAll();
        router.replace("/my-bookings");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleGoToBookings = () => {
    resetAll();
    router.replace("/my-bookings");
  };

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
