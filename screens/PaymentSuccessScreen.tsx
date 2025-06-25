import { verifyPayment } from "@/lib/paymentAPI";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { tx_ref } = useLocalSearchParams();

  const [status, setStatus] = useState<
    "verifying" | "booking" | "success" | "failed"
  >("verifying");
  const [message, setMessage] = useState("Verifying your payment...");
  const [error, setError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Ref to prevent multiple executions
  const hasStartedProcessing = useRef(false);

  // Redux state
  const user = useSelector((state: RootState) => state.user.user);
  const guestUser = useSelector((state: RootState) => state.user.guestUser);
  const traveler = useSelector((state: RootState) => state.flight.traveler);
  const flightOffer = useSelector(
    (state: RootState) => state.flight.selectedFlight
  );

  useEffect(() => {
    // Prevent multiple executions
    if (hasStartedProcessing.current) {
      return;
    }

    if (!tx_ref || typeof tx_ref !== "string") {
      const errorMsg = "No transaction reference found.";
      setStatus("failed");
      setMessage(errorMsg);
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
      return;
    }

    hasStartedProcessing.current = true;

    const verifyAndBook = async () => {
      try {
        // 1. Payment Verification Phase
        setStatus("verifying");
        setMessage("Verifying your payment...");

        const paymentVerificationResult = await verifyPayment(tx_ref);

        if (!paymentVerificationResult.success) {
          const errorMsg =
            paymentVerificationResult.message || "Payment verification failed.";
          setStatus("failed");
          setMessage("Payment not successful.");
          setError(errorMsg);
          Alert.alert("Payment Failed", errorMsg);
          return;
        }

        // 2. Flight Booking Phase
        setStatus("booking");
        setMessage("Payment successful! Booking your flight...");

        // Simulate booking process (replace with actual booking API call)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setBookingResult({ bookingId: "BK123456789" });
        setStatus("success");
        setMessage("Your flight has been booked successfully!");

        Alert.alert(
          "Booking Successful!",
          "Your flight has been booked successfully!",
          [
            {
              text: "View Bookings",
              onPress: () => router.push("/profile"),
            },
            {
              text: "Go Home",
              onPress: () => router.push("/"),
            },
          ]
        );
      } catch (error: any) {
        setStatus("failed");
        setMessage("An error occurred during the process.");
        setError(error.message || "An unexpected error occurred");
        Alert.alert("Error", "An unexpected error occurred.");
      }
    };

    verifyAndBook();
  }, [tx_ref, user, guestUser, traveler, flightOffer, router]);

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
