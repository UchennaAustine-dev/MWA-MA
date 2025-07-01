/**
 * Enhanced My Bookings Screen
 * Displays user flight bookings with improved design and functionality
 */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import BookingCard from "../components/profile/BookingCard";
import ErrorState from "../components/profile/ErrorState";
import LoadingSpinner from "../components/profile/LoadingSpinner";
import { useUserData } from "../hooks/useUserData";
import type { RootState } from "../redux/store";

export default function MyBookingsScreen() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user?.user);
  const userId = user?.id || "";

  const { data: userData, isLoading, error, refetch } = useUserData(userId);

  // Memoize the userBookings to prevent unnecessary re-renders
  const userBookings = useMemo(
    () => userData?.bookings || [],
    [userData?.bookings]
  );

  // Memoize the booking stats calculation
  const getBookingStats = useMemo(() => {
    const confirmed = userBookings.filter(
      (b: any) => b.status === "CONFIRMED"
    ).length;
    const pending = userBookings.filter(
      (b: any) => b.status === "PENDING"
    ).length;
    const cancelled = userBookings.filter(
      (b: any) => b.status === "CANCELLED"
    ).length;

    return { confirmed, pending, cancelled, total: userBookings.length };
  }, [userBookings]);

  // Memoize the download handler
  const handleDownloadTicket = useCallback((booking: any) => {
    try {
      Alert.alert(
        "Download Ticket",
        `Ticket for booking ${booking.referenceId} will be downloaded.\n\nNote: PDF generation functionality will be implemented with a React Native PDF library like react-native-pdf or @react-pdf/renderer.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error generating ticket:", error);
      Alert.alert("Error", "Error generating ticket. Please try again.");
    }
  }, []);

  // Memoize the render functions
  const renderBookingCard = useCallback(
    ({ item }: { item: any }) => (
      <BookingCard
        booking={item}
        onDelete={refetch}
        onDownload={handleDownloadTicket}
      />
    ),
    [refetch, handleDownloadTicket]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="airplane-outline" size={64} color="#CCCCCC" />
        </View>
        <Text style={styles.emptyStateTitle}>No Flight Bookings</Text>
        <Text style={styles.emptyStateText}>
          You haven't booked any flights yet. Start exploring amazing
          destinations and book your first flight!
        </Text>
        <TouchableOpacity
          style={styles.bookFlightButton}
          onPress={() => router.push("/(tabs)/flights/" as any)}
        >
          <Ionicons name="airplane" size={20} color="#FFFFFF" />
          <Text style={styles.bookFlightButtonText}>
            Book Your First Flight
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [router]
  );

  const stats = getBookingStats;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={styles.placeholder} />
        </View>
        <LoadingSpinner message="Loading bookings..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={styles.placeholder} />
        </View>
        <ErrorState
          title="Error Loading Bookings"
          message={error}
          onRetry={refetch}
        />
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
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity onPress={refetch} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      {userBookings.length > 0 && (
        <View style={styles.statsSection}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#10B981" }]}>
                {stats.confirmed}
              </Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
                {stats.pending}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#EF4444" }]}>
                {stats.cancelled}
              </Text>
              <Text style={styles.statLabel}>Cancelled</Text>
            </View>
          </View>
          <Text style={styles.statsSubtext}>
            View and manage your flight reservations
          </Text>
        </View>
      )}

      {/* Bookings List */}
      <View style={styles.content}>
        <FlatList
          data={userBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            userBookings.length === 0 && styles.emptyListContainer,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={["#DC2626"]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  refreshButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  statsSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 8,
  },
  statsSubtext: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#F0F0F0",
    borderStyle: "dashed",
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  bookFlightButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookFlightButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
