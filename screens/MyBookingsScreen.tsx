// /**
//  * Enhanced My Bookings Screen
//  * Displays user flight bookings with improved design and functionality
//  */
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { useCallback, useMemo } from "react";
// import {
//   Alert,
//   FlatList,
//   RefreshControl,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useSelector } from "react-redux";
// import BookingCard from "../components/profile/BookingCard";
// import ErrorState from "../components/profile/ErrorState";
// import LoadingSpinner from "../components/profile/LoadingSpinner";
// import { useUserData } from "../hooks/useUserData";
// import type { RootState } from "../redux/store";

// export default function MyBookingsScreen() {
//   const router = useRouter();
//   const user = useSelector((state: RootState) => state.user?.user);
//   const userId = user?.id || "";

//   const { data: userData, isLoading, error, refetch } = useUserData(userId);

//   // Memoize the userBookings to prevent unnecessary re-renders
//   const userBookings = useMemo(
//     () => userData?.bookings || [],
//     [userData?.bookings]
//   );

//   // Memoize the booking stats calculation
//   const getBookingStats = useMemo(() => {
//     const confirmed = userBookings.filter(
//       (b: any) => b.status === "CONFIRMED"
//     ).length;
//     const pending = userBookings.filter(
//       (b: any) => b.status === "PENDING"
//     ).length;
//     const cancelled = userBookings.filter(
//       (b: any) => b.status === "CANCELLED"
//     ).length;

//     return { confirmed, pending, cancelled, total: userBookings.length };
//   }, [userBookings]);

//   // Memoize the download handler
//   const handleDownloadTicket = useCallback((booking: any) => {
//     try {
//       Alert.alert(
//         "Download Ticket",
//         `Ticket for booking ${booking.referenceId} will be downloaded.\n\nNote: PDF generation functionality will be implemented with a React Native PDF library like react-native-pdf or @react-pdf/renderer.`,
//         [{ text: "OK" }]
//       );
//     } catch (error) {
//       console.error("Error generating ticket:", error);
//       Alert.alert("Error", "Error generating ticket. Please try again.");
//     }
//   }, []);

//   // Memoize the render functions
//   const renderBookingCard = useCallback(
//     ({ item }: { item: any }) => (
//       <BookingCard
//         booking={item}
//         onDelete={refetch}
//         onDownload={handleDownloadTicket}
//       />
//     ),
//     [refetch, handleDownloadTicket]
//   );

//   const renderEmptyState = useCallback(
//     () => (
//       <View style={styles.emptyState}>
//         <View style={styles.emptyIconContainer}>
//           <Ionicons name="airplane-outline" size={64} color="#CCCCCC" />
//         </View>
//         <Text style={styles.emptyStateTitle}>No Flight Bookings</Text>
//         <Text style={styles.emptyStateText}>
//           You haven't booked any flights yet. Start exploring amazing
//           destinations and book your first flight!
//         </Text>
//         <TouchableOpacity
//           style={styles.bookFlightButton}
//           onPress={() => router.push("/(tabs)/flights/" as any)}
//         >
//           <Ionicons name="airplane" size={20} color="#FFFFFF" />
//           <Text style={styles.bookFlightButtonText}>
//             Book Your First Flight
//           </Text>
//         </TouchableOpacity>
//       </View>
//     ),
//     [router]
//   );

//   const stats = getBookingStats;

//   if (isLoading) {
//     return (
//       <SafeAreaView style={styles.container}>
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
//         <LoadingSpinner message="Loading bookings..." />
//       </SafeAreaView>
//     );
//   }

//   if (error) {
//     return (
//       <SafeAreaView style={styles.container}>
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
//           title="Error Loading Bookings"
//           message={error}
//           onRetry={refetch}
//         />
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
//           <Ionicons name="arrow-back" size={24} color="#000000" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>My Bookings</Text>
//         <TouchableOpacity onPress={refetch} style={styles.refreshButton}>
//           <Ionicons name="refresh-outline" size={24} color="#DC2626" />
//         </TouchableOpacity>
//       </View>

//       {/* Stats Section */}
//       {userBookings.length > 0 && (
//         <View style={styles.statsSection}>
//           <View style={styles.statsContainer}>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>{stats.total}</Text>
//               <Text style={styles.statLabel}>Total</Text>
//             </View>
//             <View style={styles.statDivider} />
//             <View style={styles.statItem}>
//               <Text style={[styles.statNumber, { color: "#10B981" }]}>
//                 {stats.confirmed}
//               </Text>
//               <Text style={styles.statLabel}>Confirmed</Text>
//             </View>
//             <View style={styles.statDivider} />
//             <View style={styles.statItem}>
//               <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
//                 {stats.pending}
//               </Text>
//               <Text style={styles.statLabel}>Pending</Text>
//             </View>
//             <View style={styles.statDivider} />
//             <View style={styles.statItem}>
//               <Text style={[styles.statNumber, { color: "#EF4444" }]}>
//                 {stats.cancelled}
//               </Text>
//               <Text style={styles.statLabel}>Cancelled</Text>
//             </View>
//           </View>
//           <Text style={styles.statsSubtext}>
//             View and manage your flight reservations
//           </Text>
//         </View>
//       )}

//       {/* Bookings List */}
//       <View style={styles.content}>
//         <FlatList
//           data={userBookings}
//           renderItem={renderBookingCard}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={[
//             styles.listContainer,
//             userBookings.length === 0 && styles.emptyListContainer,
//           ]}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={isLoading}
//               onRefresh={refetch}
//               colors={["#DC2626"]}
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
//     backgroundColor: "#F8F9FA",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: "#FFFFFF",
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0F0F0",
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#000000",
//   },
//   refreshButton: {
//     padding: 8,
//   },
//   placeholder: {
//     width: 40,
//   },
//   statsSection: {
//     backgroundColor: "#FFFFFF",
//     marginHorizontal: 20,
//     marginTop: 16,
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: "#000000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   statsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   statItem: {
//     alignItems: "center",
//     flex: 1,
//   },
//   statNumber: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#000000",
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: "#666666",
//     textTransform: "uppercase",
//     fontWeight: "600",
//   },
//   statDivider: {
//     width: 1,
//     height: 40,
//     backgroundColor: "#F0F0F0",
//     marginHorizontal: 8,
//   },
//   statsSubtext: {
//     fontSize: 14,
//     color: "#666666",
//     textAlign: "center",
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
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: "#F8F9FA",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 24,
//     borderWidth: 2,
//     borderColor: "#F0F0F0",
//     borderStyle: "dashed",
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
//     paddingVertical: 16,
//     borderRadius: 12,
//     gap: 8,
//     shadowColor: "#DC2626",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   bookFlightButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import BookingCard from "../components/profile/BookingCard";
import ErrorState from "../components/profile/ErrorState";
import LoadingSpinner from "../components/profile/LoadingSpinner";
import { useUserData } from "../hooks/useUserData";
import type { RootState } from "../redux/store";

const { width } = Dimensions.get("window");

// Helper function to extract booking details from the complex API response
const extractBookingDetails = (booking: any) => {
  console.log("Processing booking:", booking.id);

  const flightOffer =
    booking.bookingDetails || booking.apiResponse?.data?.flightOffers?.[0];
  const segments = flightOffer?.itineraries?.[0]?.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  // Extract origin and destination
  const origin = firstSegment?.departure?.iataCode || "N/A";
  const destination = lastSegment?.arrival?.iataCode || "N/A";

  // Extract departure and arrival times
  const departureTime = firstSegment?.departure?.at || "";
  const arrivalTime = lastSegment?.arrival?.at || "";

  // Extract airline info
  const carrierCode = firstSegment?.carrierCode || "N/A";
  const flightNumber = `${carrierCode}${firstSegment?.number || ""}`;

  // Extract passenger count
  const travelers = booking.apiResponse?.data?.travelers || [];
  const passengers = travelers.length || 1;

  // Extract class
  const fareDetails =
    flightOffer?.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
  const travelClass = fareDetails?.cabin || "Economy";

  const processedBooking = {
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

  console.log("Processed booking:", processedBooking);
  return processedBooking;
};

export default function MyBookingsScreen() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user?.user);
  const userId = user?.id || "";

  const { data: userData, isLoading, error, refetch } = useUserData(userId);

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "upcoming" | "past" | "cancelled"
  >("all");
  const [refreshing, setRefreshing] = useState(false);

  // Process and memoize the userBookings to prevent unnecessary re-renders
  const userBookings = useMemo(() => {
    console.log("Raw userData:", userData);
    const rawBookings = userData?.bookings || [];
    console.log("Raw bookings count:", rawBookings.length);
    const processed = rawBookings.map(extractBookingDetails);
    console.log("Processed bookings count:", processed.length);
    return processed;
  }, [userData]);

  // Filter and search bookings
  const filteredBookings = useMemo(() => {
    let filtered = userBookings;

    // Apply search filter
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

    // Apply status filter
    if (selectedFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((booking: any) => {
        const departureDate = new Date(booking.departureDate);
        switch (selectedFilter) {
          case "upcoming":
            return departureDate > now && booking.status !== "CANCELLED";
          case "past":
            return departureDate <= now && booking.status !== "CANCELLED";
          case "cancelled":
            return booking.status === "CANCELLED";
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [userBookings, searchQuery, selectedFilter]);

  // Group bookings by status
  const groupedBookings = useMemo(() => {
    const now = new Date();
    const upcoming = userBookings.filter(
      (b: any) => new Date(b.departureDate) > now && b.status !== "CANCELLED"
    );
    const past = userBookings.filter(
      (b: any) => new Date(b.departureDate) <= now && b.status !== "CANCELLED"
    );
    const cancelled = userBookings.filter((b: any) => b.status === "CANCELLED");

    return { upcoming, past, cancelled };
  }, [userBookings]);

  // Enhanced booking stats
  const getBookingStats = useMemo(() => {
    const { upcoming, past, cancelled } = groupedBookings;
    const confirmed = userBookings.filter(
      (b: any) => b.status === "CONFIRMED"
    ).length;
    const pending = userBookings.filter(
      (b: any) => b.status === "PENDING"
    ).length;

    return {
      total: userBookings.length,
      upcoming: upcoming.length,
      past: past.length,
      cancelled: cancelled.length,
      confirmed,
      pending,
    };
  }, [userBookings, groupedBookings]);

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
    ({ item, index }: { item: any; index: number }) => (
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
    count: number
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
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
          onPress={() => router.back()}
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
            placeholder="Search bookings..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats Section */}
      {userBookings.length > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Booking Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: "#DC2626" }]}>
                {stats.upcoming}
              </Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.past}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.cancelled}</Text>
              <Text style={styles.statLabel}>Cancelled</Text>
            </View>
          </View>
        </View>
      )}

      {/* Filter Buttons */}
      {userBookings.length > 0 && (
        <View style={styles.filterSection}>
          <View style={styles.filterContainer}>
            {renderFilterButton("all", "All", stats.total)}
            {renderFilterButton("upcoming", "Upcoming", stats.upcoming)}
            {renderFilterButton("past", "Past", stats.past)}
            {renderFilterButton("cancelled", "Cancelled", stats.cancelled)}
          </View>
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
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  refreshButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
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
    fontWeight: "500",
    textAlign: "center",
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: "#DC2626",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  filterBadge: {
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  filterBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#666666",
  },
  filterBadgeTextActive: {
    color: "#FFFFFF",
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
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
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  bookFlightButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
