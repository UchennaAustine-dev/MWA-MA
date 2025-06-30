import { bookFlightWithAddons } from "@/lib/flightAPIs";
import { verifyPayment } from "@/lib/paymentAPI";
import { normalizeTraveler } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSelector } from "react-redux";

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

  const user = useSelector((state: any) => state.user.user);
  const Traveler = useSelector((state: any) => state.flight.traveler);
  const flightOffer = useSelector((state: any) => state.flight.selectedFlight);
  const addonIds = useSelector((state: any) => state.addonIds);

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

        if (!user?.id || !Traveler?.traveler || !flightOffer) {
          const errorMsg = "Missing booking information.";
          setStatus("failed");
          setMessage(errorMsg);
          setError(errorMsg);
          return;
        }
        let travelersToSend = [normalizeTraveler(Traveler.traveler)];
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
          setBookingResult(bookingResponse);
        } else {
          const errorMsg = bookingResponse.message || "Flight booking failed.";
          setStatus("failed");
          setMessage(errorMsg);
          setError(errorMsg);
        }
      } catch (err: any) {
        console.error("Unexpected Error:", err);
        setStatus("failed");
        setMessage("An unexpected error occurred.");
        setError(err?.message || String(err));
      }
    };

    verifyAndBook();
  }, [tx_ref]);

  const renderIcon = () => {
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
  };

  const renderTitle = () => {
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>{renderIcon()}</View>

        <Text style={styles.title}>{renderTitle()}</Text>
        <Text style={styles.message}>{message}</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error Details:</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {status === "success" && bookingResult && (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Booking Reference:</Text>
            <Text style={styles.bookingId}>
              {bookingResult.bookingId || "N/A"}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
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
  },
});
