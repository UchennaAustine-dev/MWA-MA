import { Ionicons } from "@expo/vector-icons";
import {
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: screenHeight } = Dimensions.get("window");

interface BookingDetailsModalProps {
  visible: boolean;
  booking: any;
  onClose: () => void;
  onDownload: (booking: any) => void;
  onShare: () => void;
  onCancel?: () => void;
}

export default function BookingDetailsModal({
  visible,
  booking,
  onClose,
  onDownload,
  onShare,
  onCancel,
}: BookingDetailsModalProps) {
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch {
      return { date: "Invalid Date", time: "N/A" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "#059669";
      case "PAID":
        return "#DC2626";
      case "PENDING":
        return "#D97706";
      case "CANCELLED":
        return "#6B7280";
      case "REFUNDED":
        return "#7C3AED";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "checkmark-circle";
      case "PAID":
        return "card";
      case "PENDING":
        return "hourglass";
      case "CANCELLED":
        return "close-circle";
      case "REFUNDED":
        return "return-up-back";
      default:
        return "help-circle";
    }
  };

  const departureInfo = formatDateTime(booking.departureTime);
  const arrivalInfo = formatDateTime(booking.arrivalTime);

  // Extract detailed flight information
  const segments =
    booking.rawBooking?.bookingDetails?.itineraries?.[0]?.segments || [];
  const traveler = booking.rawBooking?.apiResponse?.data?.travelers?.[0];
  const travelerPricing =
    booking.rawBooking?.bookingDetails?.travelerPricings?.[0];

  const renderSegment = (segment: any, index: number) => {
    const departure = formatDateTime(segment.departure.at);
    const arrival = formatDateTime(segment.arrival.at);

    return (
      <View key={segment.id} style={styles.segmentCard}>
        <View style={styles.segmentHeader}>
          <Text style={styles.segmentTitle}>
            {index === 0 ? "Outbound Flight" : `Connection ${index}`}
          </Text>
          <Text style={styles.flightNumber}>
            {segment.carrierCode}
            {segment.number}
          </Text>
        </View>

        <View style={styles.flightRoute}>
          <View style={styles.routePoint}>
            <Text style={styles.routeTime}>{departure.time}</Text>
            <Text style={styles.routeCode}>{segment.departure.iataCode}</Text>
            <Text style={styles.routeTerminal}>
              {segment.departure.terminal
                ? `Terminal ${segment.departure.terminal}`
                : ""}
            </Text>
          </View>

          <View style={styles.routeConnector}>
            <View style={styles.routeDot} />
            <View style={styles.routeLine} />
            <Ionicons name="airplane" size={16} color="#DC2626" />
            <View style={styles.routeLine} />
            <View style={styles.routeDot} />
          </View>

          <View style={styles.routePoint}>
            <Text style={styles.routeTime}>{arrival.time}</Text>
            <Text style={styles.routeCode}>{segment.arrival.iataCode}</Text>
            <Text style={styles.routeTerminal}>
              {segment.arrival.terminal
                ? `Terminal ${segment.arrival.terminal}`
                : ""}
            </Text>
          </View>
        </View>

        <View style={styles.segmentDetails}>
          <View style={styles.segmentDetailItem}>
            <Ionicons name="time" size={16} color="#64748B" />
            <Text style={styles.segmentDetailText}>
              Duration:{" "}
              {segment.duration
                .replace("PT", "")
                .replace("H", "h ")
                .replace("M", "m")}
            </Text>
          </View>
          <View style={styles.segmentDetailItem}>
            <Ionicons name="airplane" size={16} color="#64748B" />
            <Text style={styles.segmentDetailText}>
              Aircraft: {segment.aircraft.code}
            </Text>
          </View>
          {segment.numberOfStops === 0 && (
            <View style={styles.segmentDetailItem}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={[styles.segmentDetailText, { color: "#059669" }]}>
                Direct Flight
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Booking Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Booking Status */}
          <View style={styles.statusSection}>
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(booking.status) },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(booking.status) as any}
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.statusText}>{booking.status}</Text>
              </View>
              {booking.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={16} color="#059669" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            <Text style={styles.referenceId}>
              Reference: #{booking.referenceId}
            </Text>
          </View>

          {/* Flight Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Flight Overview</Text>
            <View style={styles.overviewCard}>
              <View style={styles.overviewRoute}>
                <Text style={styles.overviewAirport}>{booking.origin}</Text>
                <Ionicons name="arrow-forward" size={20} color="#64748B" />
                <Text style={styles.overviewAirport}>
                  {booking.destination}
                </Text>
              </View>
              <Text style={styles.overviewDate}>{departureInfo.date}</Text>
              <View style={styles.overviewDetails}>
                <Text style={styles.overviewDetail}>
                  Departure: {departureInfo.time}
                </Text>
                <Text style={styles.overviewDetail}>
                  Arrival: {arrivalInfo.time}
                </Text>
              </View>
            </View>
          </View>

          {/* Flight Segments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Flight Details</Text>
            {segments.map((segment: any, index: number) =>
              renderSegment(segment, index)
            )}
          </View>

          {/* Passenger Information */}
          {traveler && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Passenger Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>
                    {traveler.name.firstName} {traveler.name.lastName}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Date of Birth:</Text>
                  <Text style={styles.infoValue}>{traveler.dateOfBirth}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="male-female" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Gender:</Text>
                  <Text style={styles.infoValue}>{traveler.gender}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="mail" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>
                    {traveler.contact.emailAddress}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Phone:</Text>
                  <Text style={styles.infoValue}>
                    +{traveler.contact.phones[0].countryCallingCode}{" "}
                    {traveler.contact.phones[0].number}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Fare Information */}
          {travelerPricing && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fare Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons name="business" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Class:</Text>
                  <Text style={styles.infoValue}>{booking.class}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="pricetag" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Fare Type:</Text>
                  <Text style={styles.infoValue}>
                    {travelerPricing.fareOption}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="bag" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Checked Baggage:</Text>
                  <Text style={styles.infoValue}>
                    {travelerPricing.fareDetailsBySegment[0]
                      ?.includedCheckedBags?.weight || 0}{" "}
                    KG
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="briefcase" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Cabin Baggage:</Text>
                  <Text style={styles.infoValue}>
                    {travelerPricing.fareDetailsBySegment[0]?.includedCabinBags
                      ?.quantity || 1}{" "}
                    piece
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Price Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Breakdown</Text>
            <View style={styles.priceCard}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Base Fare:</Text>
                <Text style={styles.priceValue}>
                  {booking.currency}{" "}
                  {Number(travelerPricing?.price?.base || 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Taxes & Fees:</Text>
                <Text style={styles.priceValue}>
                  {booking.currency}{" "}
                  {(
                    Number(booking.totalAmount) -
                    Number(travelerPricing?.price?.base || 0)
                  ).toLocaleString()}
                </Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceRow}>
                <Text style={styles.priceTotalLabel}>Total Amount:</Text>
                <Text style={styles.priceTotalValue}>
                  {booking.currency}{" "}
                  {Number(booking.totalAmount).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Booking Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={16} color="#64748B" />
                <Text style={styles.infoLabel}>Booked On:</Text>
                <Text style={styles.infoValue}>
                  {new Date(booking.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="business" size={16} color="#64748B" />
                <Text style={styles.infoLabel}>Airline:</Text>
                <Text style={styles.infoValue}>{booking.airline}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="document-text" size={16} color="#64748B" />
                <Text style={styles.infoLabel}>PNR:</Text>
                <Text style={styles.infoValue}>
                  {booking.rawBooking?.apiResponse?.data?.associatedRecords?.[0]
                    ?.reference || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onDownload(booking)}
          >
            <Ionicons name="download" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Download Ticket</Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onShare}>
              <Ionicons name="share" size={18} color="#64748B" />
              <Text style={styles.secondaryButtonText}>Share</Text>
            </TouchableOpacity>

            {onCancel && (
              <TouchableOpacity style={styles.dangerButton} onPress={onCancel}>
                <Ionicons name="close" size={18} color="#DC2626" />
                <Text style={styles.dangerButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "RedHatDisplay-Bold",
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  statusSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 8,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "uppercase",
    fontFamily: "RedHatDisplay-Bold",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    gap: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
    fontFamily: "RedHatDisplay-Bold",
  },
  referenceId: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748B",
    fontFamily: "RedHatDisplay-Regular",
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
    fontFamily: "RedHatDisplay-Bold",
  },
  overviewCard: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  overviewRoute: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 12,
  },
  overviewAirport: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "RedHatDisplay-Bold",
  },
  overviewDate: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "RedHatDisplay-Regular",
  },
  overviewDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overviewDetail: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "RedHatDisplay-Regular",
  },
  segmentCard: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  segmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  segmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "RedHatDisplay-Bold",
  },
  flightNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  flightRoute: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  routePoint: {
    flex: 1,
    alignItems: "center",
  },
  routeTime: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
    fontFamily: "RedHatDisplay-Bold",
  },
  routeCode: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 2,
    fontFamily: "RedHatDisplay-Regular",
  },
  routeTerminal: {
    fontSize: 12,
    color: "#94A3B8",
    fontFamily: "RedHatDisplay-Regular",
  },
  routeConnector: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
    paddingHorizontal: 16,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DC2626",
  },
  routeLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
  },
  segmentDetails: {
    gap: 8,
  },
  segmentDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  segmentDetailText: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "RedHatDisplay-Regular",
  },
  infoCard: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    minWidth: 100,
    fontFamily: "RedHatDisplay-Regular",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
    fontFamily: "RedHatDisplay-Bold",
  },
  priceCard: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "RedHatDisplay-Regular",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "RedHatDisplay-Bold",
  },
  priceDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  priceTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "RedHatDisplay-Bold",
  },
  priceTotalValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#DC2626",
    fontFamily: "RedHatDisplay-Bold",
  },
  actionSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Bold",
  },
  secondaryButtons: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  secondaryButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Bold",
  },
  dangerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  dangerButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Bold",
  },
});
