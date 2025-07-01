/**
 * Enhanced Booking Card Component
 * Displays individual flight booking information with improved design and actions
 */
import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { deleteFlightBooking } from "@/lib/userAPI";
import { formatTime } from "@/utils/dateUtils";
import { formatDate } from "@/utils/formatter";
import { getStatusColor } from "../../utils/statusUtils";

interface BookingCardProps {
  booking: any;
  onDelete: () => void;
  onDownload: (booking: any) => void;
}

export default function BookingCard({
  booking,
  onDelete,
  onDownload,
}: BookingCardProps) {
  const statusColors = getStatusColor(booking.status);

  const handleDelete = () => {
    Alert.alert(
      "Delete Booking",
      "Are you sure you want to delete this booking? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFlightBooking(booking.id);
              Alert.alert("Success", "Booking deleted successfully");
              onDelete();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete booking");
            }
          },
        },
      ]
    );
  };

  const traveler = booking?.apiResponse?.data?.travelers[0];
  const segments = booking?.bookingDetails?.itineraries[0]?.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  // Calculate total duration
  const calculateDuration = () => {
    if (!firstSegment?.departure?.at || !lastSegment?.arrival?.at) return "N/A";

    const start = new Date(firstSegment.departure.at);
    const end = new Date(lastSegment.arrival.at);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <View style={styles.container}>
      {/* Header with enhanced design */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.referenceContainer}>
            <Ionicons name="document-text-outline" size={16} color="#DC2626" />
            <Text style={styles.referenceId}>{booking.referenceId}</Text>
          </View>
          <Text style={styles.bookingDate}>
            Booked on {formatDate(booking.createdAt)}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors.backgroundColor },
            ]}
          >
            <Text
              style={[styles.statusText, { color: statusColors.textColor }]}
            >
              {booking.status}
            </Text>
          </View>
          <Text style={styles.totalAmount}>
            {booking?.totalAmount?.toLocaleString(undefined, {
              style: "currency",
              currency: booking?.bookingDetails?.price?.currency || "USD",
            })}
          </Text>
        </View>
      </View>

      {/* Passenger Info with enhanced styling */}
      <View style={styles.passengerSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person" size={16} color="#DC2626" />
          <Text style={styles.sectionTitle}>Passenger Information</Text>
        </View>
        <View style={styles.passengerInfo}>
          <Text style={styles.passengerName}>
            {traveler?.name?.firstName || "N/A"}{" "}
            {traveler?.name?.lastName || "N/A"}
          </Text>
          <Text style={styles.passengerEmail}>
            {traveler?.contact?.emailAddress || "N/A"}
          </Text>
        </View>
      </View>

      {/* Enhanced Flight Route */}
      {firstSegment && lastSegment && (
        <View style={styles.flightSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="airplane" size={16} color="#DC2626" />
            <Text style={styles.sectionTitle}>Flight Details</Text>
          </View>

          <View style={styles.flightRoute}>
            {/* Departure */}
            <View style={styles.routePoint}>
              <View style={styles.routeInfo}>
                <Text style={styles.airportCode}>
                  {firstSegment.departure?.details?.iataCode ||
                    firstSegment.departure?.iataCode ||
                    "N/A"}
                </Text>
                <Text style={styles.cityName}>
                  {firstSegment.departure?.details?.cityName || "Departure"}
                </Text>
                <Text style={styles.routeTime}>
                  {formatTime(firstSegment.departure?.at)}
                </Text>
                <Text style={styles.routeDate}>
                  {formatDate(firstSegment.departure?.at)}
                </Text>
              </View>
            </View>

            {/* Flight Path */}
            <View style={styles.routeLine}>
              <View style={styles.line} />
              <View style={styles.flightInfo}>
                <Ionicons
                  name="airplane"
                  size={20}
                  color="#DC2626"
                  style={styles.planeIcon}
                />
                <Text style={styles.duration}>{calculateDuration()}</Text>
                {segments.length > 1 && (
                  <Text style={styles.stopsText}>
                    {segments.length - 1} stop(s)
                  </Text>
                )}
              </View>
              <View style={styles.line} />
            </View>

            {/* Arrival */}
            <View style={styles.routePoint}>
              <View style={styles.routeInfo}>
                <Text style={styles.airportCode}>
                  {lastSegment.arrival?.iataCode ||
                    lastSegment.arrival?.details?.iataCode ||
                    "N/A"}
                </Text>
                <Text style={styles.cityName}>
                  {lastSegment.arrival?.details?.cityName || "Arrival"}
                </Text>
                <Text style={styles.routeTime}>
                  {formatTime(lastSegment.arrival?.at)}
                </Text>
                <Text style={styles.routeDate}>
                  {formatDate(lastSegment.arrival?.at)}
                </Text>
              </View>
            </View>
          </View>

          {/* Flight Number */}
          <View style={styles.flightDetails}>
            <Text style={styles.flightNumber}>
              Flight {firstSegment.carrierCode}
              {firstSegment.number}
            </Text>
            <Text style={styles.aircraft}>
              {firstSegment.aircraft?.code || "Aircraft TBD"}
            </Text>
          </View>
        </View>
      )}

      {/* Enhanced Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => onDownload(booking)}
        >
          <Ionicons name="download-outline" size={20} color="#FFFFFF" />
          <Text style={styles.downloadButtonText}>Download Ticket</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerLeft: {
    flex: 1,
  },
  referenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  referenceId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  bookingDate: {
    fontSize: 12,
    color: "#666666",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  passengerSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  passengerInfo: {
    marginLeft: 24,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  passengerEmail: {
    fontSize: 14,
    color: "#666666",
  },
  flightSection: {
    padding: 20,
  },
  flightRoute: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 24,
    marginBottom: 16,
  },
  routePoint: {
    flex: 1,
  },
  routeInfo: {
    alignItems: "center",
  },
  airportCode: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  cityName: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  routeTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  routeDate: {
    fontSize: 12,
    color: "#666666",
  },
  routeLine: {
    flex: 2,
    alignItems: "center",
    marginHorizontal: 16,
  },
  line: {
    height: 2,
    backgroundColor: "#E5E5E5",
    flex: 1,
    width: "100%",
  },
  flightInfo: {
    alignItems: "center",
    paddingVertical: 8,
  },
  planeIcon: {
    transform: [{ rotate: "90deg" }],
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  stopsText: {
    fontSize: 10,
    color: "#666666",
  },
  flightDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  flightNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  aircraft: {
    fontSize: 12,
    color: "#666666",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#FAFAFA",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DC2626",
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  deleteButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
