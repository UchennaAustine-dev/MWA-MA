import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

export default function PaymentWebViewScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const paymentUrl = Array.isArray(url) ? url[0] : url;

  useEffect(() => {
    if (!paymentUrl) {
      Alert.alert("Error", "No payment URL provided", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [paymentUrl, router]);

  const handleNavigationStateChange = (navState: any) => {
    const { url: currentUrl } = navState;

    // Check if the URL contains success or failure indicators
    if (
      currentUrl.includes("payment-success") ||
      currentUrl.includes("success")
    ) {
      // Extract transaction reference if available
      const urlParams = new URLSearchParams(currentUrl.split("?")[1]);
      const txRef = urlParams.get("tx_ref") || urlParams.get("reference");

      if (txRef) {
        router.replace(`/payment-success?tx_ref=${txRef}`);
      } else {
        router.replace("/payment-success");
      }
    } else if (
      currentUrl.includes("payment-failed") ||
      currentUrl.includes("failed") ||
      currentUrl.includes("cancel")
    ) {
      Alert.alert(
        "Payment Cancelled",
        "Your payment was cancelled or failed. Please try again.",
        [
          { text: "Try Again", onPress: () => router.back() },
          { text: "Cancel", onPress: () => router.push("/") },
        ]
      );
    }
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  if (!paymentUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#d32f2f" />
          <Text style={styles.errorText}>Invalid payment URL</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
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
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={styles.securityIndicator}>
          <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
        </View>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d32f2f" />
          <Text style={styles.loadingText}>Loading secure payment...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#d32f2f" />
          <Text style={styles.errorText}>Failed to load payment page</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setError(false)}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView */}
      {!error && (
        <WebView
          source={{ uri: decodeURIComponent(paymentUrl) }}
          style={styles.webview}
          onLoad={handleLoad}
          onError={handleError}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="compatibility"
          onShouldStartLoadWithRequest={(request) => {
            // Allow all requests for payment processing
            return true;
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#d32f2f",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  securityIndicator: {
    padding: 8,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#d32f2f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
