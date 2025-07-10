import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import BookingCard from "../components/profile/BookingCard";
import ErrorState from "../components/profile/ErrorState";
import LoadingSpinner from "../components/profile/LoadingSpinner";
import { useUserData } from "../hooks/useUserData";
import type { RootState } from "../redux/store";

const { width } = Dimensions.get("window");

// Helper function to extract booking details from the complex API response
const extractBookingDetails = (booking: any) => {
  const flightOffer =
    booking.bookingDetails || booking.apiResponse?.data?.flightOffers?.[0];
  const segments = flightOffer?.itineraries?.[0]?.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const origin = firstSegment?.departure?.iataCode || "N/A";
  const destination = lastSegment?.arrival?.iataCode || "N/A";
  const departureTime = firstSegment?.departure?.at || "";
  const arrivalTime = lastSegment?.arrival?.at || "";
  const carrierCode = firstSegment?.carrierCode || "N/A";
  const flightNumber = `${carrierCode}${firstSegment?.number || ""}`;
  const travelers = booking.apiResponse?.data?.travelers || [];
  const passengers = travelers.length || 1;
  const fareDetails =
    flightOffer?.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
  const travelClass = fareDetails?.cabin || "Economy";

  return {
    id: booking.id,
    referenceId: booking.referenceId,
    status: booking.status,
    verified: booking.verified,
    origin,
    destination,
    departureTime,
    arrivalTime,
    departureDate: departureTime,
    totalAmount: booking.totalAmount || flightOffer?.price?.total || 0,
    currency: booking.currency || flightOffer?.price?.currency || "NGN",
    passengers,
    class: travelClass,
    airline: carrierCode,
    flightNumber,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    rawBooking: booking,
  };
};

export default function MyBookingsScreen() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user?.user);
  const userId = user?.id || "";
  const { data: userData, isLoading, error, refetch } = useUserData(userId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    | "all"
    | "upcoming"
    | "past"
    | "cancelled"
    | "pending"
    | "confirmed"
    | "paid"
    | "refunded"
  >("all");
  const [refreshing, setRefreshing] = useState(false);

  const userBookings = useMemo(() => {
    const rawBookings = userData?.bookings || [];
    return rawBookings.map(extractBookingDetails);
  }, [userData]);

  console.log(`userBookings`, userBookings);

  const filteredBookings = useMemo(() => {
    let filtered = userBookings;

    if (searchQuery) {
      filtered = filtered.filter(
        (booking: any) =>
          booking.referenceId
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.destination
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.flightNumber
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((booking: any) => {
        const departureDate = new Date(booking.departureDate);
        switch (selectedFilter) {
          case "upcoming":
            return departureDate > now && booking.status !== "CANCELED";
          case "past":
            return departureDate <= now && booking.status !== "CANCELED";
          case "cancelled":
            return booking.status === "CANCELED";
          case "pending":
            return booking.status === "PENDING";
          case "confirmed":
            return booking.status === "CONFIRMED";
          case "paid":
            return booking.status === "PAID";
          case "refunded":
            return booking.status === "REFUNDED";
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [userBookings, searchQuery, selectedFilter]);

  const getBookingStats = useMemo(() => {
    const now = new Date();
    const upcoming = userBookings.filter(
      (b: any) => new Date(b.departureDate) > now && b.status !== "CANCELED"
    );
    const past = userBookings.filter(
      (b: any) => new Date(b.departureDate) <= now && b.status !== "CANCELED"
    );
    const cancelled = userBookings.filter((b: any) => b.status === "CANCELED");
    const pending = userBookings.filter((b: any) => b.status === "PENDING");
    const confirmed = userBookings.filter((b: any) => b.status === "CONFIRMED");
    const paid = userBookings.filter((b: any) => b.status === "PAID");
    const refunded = userBookings.filter((b: any) => b.status === "REFUNDED");

    // Calculate total spent
    const totalSpent = userBookings.reduce((sum: number, booking: any) => {
      return sum + (Number(booking.totalAmount) || 0);
    }, 0);

    return {
      total: userBookings.length,
      upcoming: upcoming.length,
      past: past.length,
      cancelled: cancelled.length,
      pending: pending.length,
      confirmed: confirmed.length,
      paid: paid.length,
      refunded: refunded.length,
      totalSpent,
    };
  }, [userBookings]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDownloadTicket = useCallback((booking: any) => {
    Alert.alert(
      "Download Ticket",
      `Download e-ticket for ${booking.referenceId}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Download",
          onPress: () => {
            Alert.alert("Success", "Ticket downloaded successfully!");
          },
        },
      ]
    );
  }, []);

  const renderBookingCard = useCallback(
    ({ item }: { item: any }) => (
      <BookingCard
        booking={item}
        onDelete={refetch}
        onDownload={handleDownloadTicket}
        style={{ marginBottom: 16 }}
      />
    ),
    [refetch, handleDownloadTicket]
  );

  const renderFilterButton = (
    filter: typeof selectedFilter,
    label: string,
    count: number,
    icon?: string
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
      activeOpacity={0.8}
    >
      <View style={styles.filterButtonContent}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={16}
            color={selectedFilter === filter ? "#FFFFFF" : "#666666"}
            style={styles.filterIcon}
          />
        )}
        <Text
          style={[
            styles.filterButtonText,
            selectedFilter === filter && styles.filterButtonTextActive,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
        <View
          style={[
            styles.filterBadge,
            selectedFilter === filter && styles.filterBadgeActive,
          ]}
        >
          <Text
            style={[
              styles.filterBadgeText,
              selectedFilter === filter && styles.filterBadgeTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="airplane" size={48} color="#DC2626" />
        </View>
        <Text style={styles.emptyStateTitle}>
          {searchQuery || selectedFilter !== "all"
            ? "No matching bookings"
            : "No bookings yet"}
        </Text>
        <Text style={styles.emptyStateText}>
          {searchQuery || selectedFilter !== "all"
            ? "Try adjusting your search or filter criteria"
            : "Your flight bookings will appear here once you make a reservation"}
        </Text>
        {!searchQuery && selectedFilter === "all" && (
          <TouchableOpacity
            style={styles.bookFlightButton}
            onPress={() => router.push("/(tabs)/flights/" as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="airplane" size={20} color="#FFFFFF" />
            <Text style={styles.bookFlightButtonText}>Book a Flight</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [router, searchQuery, selectedFilter]
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
        <LoadingSpinner message="Loading your bookings..." />
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
          title="Unable to load bookings"
          message={error}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  const stats = getBookingStats;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/profile")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by reference, destination, or flight..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Premium Stats Section */}
      {userBookings.length > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>Overview</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollContainer}
          >
            {/* Total Bookings Card */}
            <View style={[styles.statCard, styles.primaryStatCard]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="airplane" size={20} color="#DC2626" />
                <Text style={styles.statCardTitle}>Total Trips</Text>
              </View>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statSubtext}>All time bookings</Text>
            </View>

            {/* Total Spent Card */}
            <View style={[styles.statCard, styles.secondaryStatCard]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="card" size={20} color="#059669" />
                <Text style={styles.statCardTitle}>Total Spent</Text>
              </View>
              <Text style={[styles.statNumber, { color: "#059669" }]}>
                ₦{stats.totalSpent.toLocaleString()}
              </Text>
              <Text style={styles.statSubtext}>Lifetime spending</Text>
            </View>

            {/* Upcoming Trips Card */}
            <View style={[styles.statCard, styles.accentStatCard]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="time" size={20} color="#DC2626" />
                <Text style={styles.statCardTitle}>Upcoming</Text>
              </View>
              <Text style={[styles.statNumber, { color: "#DC2626" }]}>
                {stats.upcoming}
              </Text>
              <Text style={styles.statSubtext}>Future trips</Text>
            </View>

            {/* Completed Trips Card */}
            <View style={[styles.statCard, styles.neutralStatCard]}>
              <View style={styles.statCardHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#6B7280" />
                <Text style={styles.statCardTitle}>Completed</Text>
              </View>
              <Text style={styles.statNumber}>{stats.past}</Text>
              <Text style={styles.statSubtext}>Past trips</Text>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Premium Filter Buttons */}
      {userBookings.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Filter by Status</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContainer}
          >
            {renderFilterButton("all", "All", stats.total, "grid")}
            {renderFilterButton("upcoming", "Upcoming", stats.upcoming, "time")}
            {renderFilterButton("past", "Past", stats.past, "checkmark-circle")}
            {renderFilterButton(
              "confirmed",
              "Confirmed",
              stats.confirmed,
              "shield-checkmark"
            )}
            {renderFilterButton(
              "pending",
              "Pending",
              stats.pending,
              "hourglass"
            )}
            {renderFilterButton("paid", "Paid", stats.paid, "card")}
            {renderFilterButton(
              "cancelled",
              "Cancelled",
              stats.cancelled,
              "close-circle"
            )}
            {renderFilterButton(
              "refunded",
              "Refunded",
              stats.refunded,
              "return-up-back"
            )}
          </ScrollView>
        </View>
      )}

      {/* Bookings List */}
      <View style={styles.content}>
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            filteredBookings.length === 0 && styles.emptyListContainer,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#DC2626"]}
              tintColor="#DC2626"
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
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "RedHatDisplay-Bold",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    fontFamily: "RedHatDisplay-Regular",
  },

  // Premium Stats Section
  statsSection: {
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 8,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
    paddingHorizontal: 20,
    fontFamily: "RedHatDisplay-Bold",
  },
  statsScrollContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  statCard: {
    minWidth: 160,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryStatCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  secondaryStatCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  accentStatCard: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  neutralStatCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    fontFamily: "RedHatDisplay-Regular",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
    fontFamily: "RedHatDisplay-Bold",
  },
  statSubtext: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    fontFamily: "RedHatDisplay-Regular",
  },

  // Premium Filter Section
  filterSection: {
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 8,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
    paddingHorizontal: 20,
    fontFamily: "RedHatDisplay-Bold",
  },
  filterScrollContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
    shadowColor: "#DC2626",
    shadowOpacity: 0.3,
  },
  filterButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterIcon: {
    marginRight: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    fontFamily: "RedHatDisplay-Regular",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  filterBadge: {
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
    marginLeft: 4,
  },
  filterBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    fontFamily: "RedHatDisplay-Bold",
  },
  filterBadgeTextActive: {
    color: "#FFFFFF",
  },

  content: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#FECACA",
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "RedHatDisplay-Bold",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: "RedHatDisplay-Regular",
  },
  bookFlightButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
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
    fontWeight: "700",
    fontFamily: "RedHatDisplay-Bold",
  },
});

// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { useCallback, useMemo, useState } from "react";
// import {
//   Alert,
//   Dimensions,
//   FlatList,
//   RefreshControl,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useSelector } from "react-redux";
// import BookingCard from "../components/profile/BookingCard";
// import ErrorState from "../components/profile/ErrorState";
// import LoadingSpinner from "../components/profile/LoadingSpinner";
// import { useUserData } from "../hooks/useUserData";
// import type { RootState } from "../redux/store";

// const { width } = Dimensions.get("window");

// // Helper function to extract booking details from the complex API response
// const extractBookingDetails = (booking: any) => {
//   console.log("Processing booking:", booking.id);

//   const flightOffer =
//     booking.bookingDetails || booking.apiResponse?.data?.flightOffers?.[0];
//   const segments = flightOffer?.itineraries?.[0]?.segments || [];
//   const firstSegment = segments[0];
//   const lastSegment = segments[segments.length - 1];

//   // Extract origin and destination
//   const origin = firstSegment?.departure?.iataCode || "N/A";
//   const destination = lastSegment?.arrival?.iataCode || "N/A";

//   // Extract departure and arrival times
//   const departureTime = firstSegment?.departure?.at || "";
//   const arrivalTime = lastSegment?.arrival?.at || "";

//   // Extract airline info
//   const carrierCode = firstSegment?.carrierCode || "N/A";
//   const flightNumber = `${carrierCode}${firstSegment?.number || ""}`;

//   // Extract passenger count
//   const travelers = booking.apiResponse?.data?.travelers || [];
//   const passengers = travelers.length || 1;

//   // Extract class
//   const fareDetails =
//     flightOffer?.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
//   const travelClass = fareDetails?.cabin || "Economy";

//   const processedBooking = {
//     id: booking.id,
//     referenceId: booking.referenceId,
//     status: booking.status,
//     verified: booking.verified,
//     origin,
//     destination,
//     departureTime,
//     arrivalTime,
//     departureDate: departureTime,
//     totalAmount: booking.totalAmount || flightOffer?.price?.total || 0,
//     currency: booking.currency || flightOffer?.price?.currency || "NGN",
//     passengers,
//     class: travelClass,
//     airline: carrierCode,
//     flightNumber,
//     createdAt: booking.createdAt,
//     updatedAt: booking.updatedAt,
//     rawBooking: booking,
//   };

//   console.log("Processed booking:", processedBooking);
//   return processedBooking;
// };

// export default function MyBookingsScreen() {
//   const router = useRouter();
//   const user = useSelector((state: RootState) => state.user?.user);
//   const userId = user?.id || "";

//   const { data: userData, isLoading, error, refetch } = useUserData(userId);

//   // Local state
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedFilter, setSelectedFilter] = useState<
//     "all" | "upcoming" | "past" | "cancelled"
//   >("all");
//   const [refreshing, setRefreshing] = useState(false);

//   // Process and memoize the userBookings to prevent unnecessary re-renders
//   const userBookings = useMemo(() => {
//     console.log("Raw userData:", userData);
//     const rawBookings = userData?.bookings || [];
//     console.log("Raw bookings count:", rawBookings.length);
//     const processed = rawBookings.map(extractBookingDetails);
//     console.log("Processed bookings count:", processed.length);
//     return processed;
//   }, [userData]);

//   // Filter and search bookings
//   const filteredBookings = useMemo(() => {
//     let filtered = userBookings;

//     // Apply search filter
//     if (searchQuery) {
//       filtered = filtered.filter(
//         (booking: any) =>
//           booking.referenceId
//             ?.toLowerCase()
//             .includes(searchQuery.toLowerCase()) ||
//           booking.destination
//             ?.toLowerCase()
//             .includes(searchQuery.toLowerCase()) ||
//           booking.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           booking.flightNumber
//             ?.toLowerCase()
//             .includes(searchQuery.toLowerCase())
//       );
//     }

//     // Apply status filter
//     if (selectedFilter !== "all") {
//       const now = new Date();
//       filtered = filtered.filter((booking: any) => {
//         const departureDate = new Date(booking.departureDate);
//         switch (selectedFilter) {
//           case "upcoming":
//             return departureDate > now && booking.status !== "CANCELLED";
//           case "past":
//             return departureDate <= now && booking.status !== "CANCELLED";
//           case "cancelled":
//             return booking.status === "CANCELLED";
//           default:
//             return true;
//         }
//       });
//     }

//     return filtered;
//   }, [userBookings, searchQuery, selectedFilter]);

//   // Group bookings by status
//   const groupedBookings = useMemo(() => {
//     const now = new Date();
//     const upcoming = userBookings.filter(
//       (b: any) => new Date(b.departureDate) > now && b.status !== "CANCELLED"
//     );
//     const past = userBookings.filter(
//       (b: any) => new Date(b.departureDate) <= now && b.status !== "CANCELLED"
//     );
//     const cancelled = userBookings.filter((b: any) => b.status === "CANCELLED");

//     return { upcoming, past, cancelled };
//   }, [userBookings]);

//   // Enhanced booking stats
//   const getBookingStats = useMemo(() => {
//     const { upcoming, past, cancelled } = groupedBookings;
//     const confirmed = userBookings.filter(
//       (b: any) => b.status === "CONFIRMED"
//     ).length;
//     const pending = userBookings.filter(
//       (b: any) => b.status === "PENDING"
//     ).length;

//     return {
//       total: userBookings.length,
//       upcoming: upcoming.length,
//       past: past.length,
//       cancelled: cancelled.length,
//       confirmed,
//       pending,
//     };
//   }, [userBookings, groupedBookings]);

//   const handleRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await refetch();
//     setRefreshing(false);
//   }, [refetch]);

//   const handleDownloadTicket = useCallback((booking: any) => {
//     Alert.alert(
//       "Download Ticket",
//       `Download e-ticket for ${booking.referenceId}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Download",
//           onPress: () => {
//             Alert.alert("Success", "Ticket downloaded successfully!");
//           },
//         },
//       ]
//     );
//   }, []);

//   const renderBookingCard = useCallback(
//     ({ item, index }: { item: any; index: number }) => (
//       <BookingCard
//         booking={item}
//         onDelete={refetch}
//         onDownload={handleDownloadTicket}
//         style={{ marginBottom: 16 }}
//       />
//     ),
//     [refetch, handleDownloadTicket]
//   );

//   const renderFilterButton = (
//     filter: typeof selectedFilter,
//     label: string,
//     count: number
//   ) => (
//     <TouchableOpacity
//       style={[
//         styles.filterButton,
//         selectedFilter === filter && styles.filterButtonActive,
//       ]}
//       onPress={() => setSelectedFilter(filter)}
//     >
//       <Text
//         style={[
//           styles.filterButtonText,
//           selectedFilter === filter && styles.filterButtonTextActive,
//         ]}
//       >
//         {label}
//       </Text>
//       <View
//         style={[
//           styles.filterBadge,
//           selectedFilter === filter && styles.filterBadgeActive,
//         ]}
//       >
//         <Text
//           style={[
//             styles.filterBadgeText,
//             selectedFilter === filter && styles.filterBadgeTextActive,
//           ]}
//         >
//           {count}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderEmptyState = useCallback(
//     () => (
//       <View style={styles.emptyState}>
//         <View style={styles.emptyIconContainer}>
//           <Ionicons name="airplane" size={48} color="#DC2626" />
//         </View>
//         <Text style={styles.emptyStateTitle}>
//           {searchQuery || selectedFilter !== "all"
//             ? "No matching bookings"
//             : "No bookings yet"}
//         </Text>
//         <Text style={styles.emptyStateText}>
//           {searchQuery || selectedFilter !== "all"
//             ? "Try adjusting your search or filter criteria"
//             : "Your flight bookings will appear here once you make a reservation"}
//         </Text>
//         {!searchQuery && selectedFilter === "all" && (
//           <TouchableOpacity
//             style={styles.bookFlightButton}
//             onPress={() => router.push("/(tabs)/flights/" as any)}
//           >
//             <Ionicons name="airplane" size={20} color="#FFFFFF" />
//             <Text style={styles.bookFlightButtonText}>Book a Flight</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     ),
//     [router, searchQuery, selectedFilter]
//   );

//   if (isLoading && !refreshing) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={styles.backButton}
//           >
//             <Ionicons name="arrow-back" size={24} color="#000000" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>My Bookings</Text>
//           <View style={styles.placeholder} />
//         </View>
//         <LoadingSpinner message="Loading your bookings..." />
//       </SafeAreaView>
//     );
//   }

//   if (error && !refreshing) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={styles.backButton}
//           >
//             <Ionicons name="arrow-back" size={24} color="#000000" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>My Bookings</Text>
//           <View style={styles.placeholder} />
//         </View>
//         <ErrorState
//           title="Unable to load bookings"
//           message={error}
//           onRetry={refetch}
//         />
//       </SafeAreaView>
//     );
//   }

//   const stats = getBookingStats;

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => router.replace("/profile")}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#000000" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>My Bookings</Text>
//         <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
//           <Ionicons name="refresh" size={24} color="#000000" />
//         </TouchableOpacity>
//       </View>

//       {/* Search Bar */}
//       <View style={styles.searchContainer}>
//         <View style={styles.searchInputContainer}>
//           <Ionicons name="search" size={20} color="#666666" />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search bookings..."
//             placeholderTextColor="#999999"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//           {searchQuery.length > 0 && (
//             <TouchableOpacity onPress={() => setSearchQuery("")}>
//               <Ionicons name="close-circle" size={20} color="#666666" />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Stats Section */}
//       {userBookings.length > 0 && (
//         <View style={styles.statsSection}>
//           <Text style={styles.statsTitle}>Booking Summary</Text>
//           <View style={styles.statsGrid}>
//             <View style={styles.statCard}>
//               <Text style={styles.statNumber}>{stats.total}</Text>
//               <Text style={styles.statLabel}>Total</Text>
//             </View>
//             <View style={styles.statCard}>
//               <Text style={[styles.statNumber, { color: "#DC2626" }]}>
//                 {stats.upcoming}
//               </Text>
//               <Text style={styles.statLabel}>Upcoming</Text>
//             </View>
//             <View style={styles.statCard}>
//               <Text style={styles.statNumber}>{stats.past}</Text>
//               <Text style={styles.statLabel}>Completed</Text>
//             </View>
//             <View style={styles.statCard}>
//               <Text style={styles.statNumber}>{stats.cancelled}</Text>
//               <Text style={styles.statLabel}>Cancelled</Text>
//             </View>
//           </View>
//         </View>
//       )}

//       {/* Filter Buttons */}
//       {userBookings.length > 0 && (
//         <View style={styles.filterSection}>
//           <View style={styles.filterContainer}>
//             {renderFilterButton("all", "All", stats.total)}
//             {renderFilterButton("upcoming", "Upcoming", stats.upcoming)}
//             {renderFilterButton("past", "Past", stats.past)}
//             {renderFilterButton("cancelled", "Cancelled", stats.cancelled)}
//           </View>
//         </View>
//       )}

//       {/* Bookings List */}
//       <View style={styles.content}>
//         <FlatList
//           data={filteredBookings}
//           renderItem={renderBookingCard}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={[
//             styles.listContainer,
//             filteredBookings.length === 0 && styles.emptyListContainer,
//           ]}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={handleRefresh}
//               colors={["#DC2626"]}
//               tintColor="#DC2626"
//             />
//           }
//           ListEmptyComponent={renderEmptyState}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E5E5",
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#000000",
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   refreshButton: {
//     padding: 8,
//   },
//   placeholder: {
//     width: 40,
//   },
//   searchContainer: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   searchInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F5F5F5",
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     gap: 12,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     color: "#000000",
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   statsSection: {
//     paddingHorizontal: 20,
//     paddingBottom: 16,
//   },
//   statsTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#000000",
//     marginBottom: 16,
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   statsGrid: {
//     flexDirection: "row",
//     gap: 12,
//   },
//   statCard: {
//     flex: 1,
//     backgroundColor: "#F5F5F5",
//     borderRadius: 12,
//     padding: 16,
//     alignItems: "center",
//   },
//   statNumber: {
//     fontSize: 24,
//     fontWeight: "600",
//     color: "#000000",
//     marginBottom: 4,
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   statLabel: {
//     fontSize: 12,
//     color: "#666666",
//     fontWeight: "500",
//     textAlign: "center",
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   filterSection: {
//     paddingHorizontal: 20,
//     paddingBottom: 16,
//   },
//   filterContainer: {
//     flexDirection: "row",
//     gap: 8,
//   },
//   filterButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#F5F5F5",
//     borderRadius: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     gap: 6,
//     width: "auto",
//   },
//   filterButtonActive: {
//     backgroundColor: "#DC2626",
//   },
//   filterButtonText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#666666",
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   filterButtonTextActive: {
//     color: "#FFFFFF",
//   },
//   filterBadge: {
//     backgroundColor: "#E5E5E5",
//     borderRadius: 10,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     minWidth: 20,
//     alignItems: "center",
//   },
//   filterBadgeActive: {
//     backgroundColor: "rgba(255, 255, 255, 0.3)",
//   },
//   filterBadgeText: {
//     fontSize: 10,
//     fontWeight: "600",
//     color: "#666666",
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   filterBadgeTextActive: {
//     color: "#FFFFFF",
//   },
//   content: {
//     flex: 1,
//   },
//   listContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   emptyListContainer: {
//     flex: 1,
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 40,
//   },
//   emptyIconContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "#F5F5F5",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   emptyStateTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#000000",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   emptyStateText: {
//     fontSize: 16,
//     color: "#666666",
//     textAlign: "center",
//     lineHeight: 24,
//     marginBottom: 32,
//   },
//   bookFlightButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#DC2626",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12,
//     gap: 8,
//   },
//   bookFlightButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });
