"use client";

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";

interface BookingCardProps {
  booking: any;
  onDelete: () => void;
  onDownload: (booking: any) => void;
  style?: ViewStyle;
}

export default function EnhancedBookingCard({
  booking,
  onDelete,
  onDownload,
  style,
}: BookingCardProps) {
  const [expanded, setExpanded] = useState(false);

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const isUpcoming = () => {
    try {
      return new Date(booking.departureDate) > new Date();
    } catch {
      return false;
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel booking ${booking.referenceId}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert(
      "Share Booking",
      `Share booking details for ${booking.referenceId}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share",
          onPress: () => {
            Alert.alert("Success", "Booking details shared!");
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.routeText}>
                {booking.origin} → {booking.destination}
              </Text>
              <Text style={styles.referenceId}>#{booking.referenceId}</Text>
            </View>
            <View style={styles.headerRight}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(booking.status) },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(booking.status) as any}
                  size={12}
                  color="#FFFFFF"
                  style={styles.statusIcon}
                />
                <Text style={styles.statusText}>{booking.status}</Text>
              </View>
            </View>
          </View>

          {/* Flight Details */}
          <View style={styles.flightDetails}>
            <View style={styles.timeContainer}>
              <Text style={styles.time}>
                {formatTime(booking.departureTime)}
              </Text>
              <Text style={styles.airport}>{booking.origin}</Text>
            </View>
            <View style={styles.flightPath}>
              <View style={styles.dot} />
              <View style={styles.line} />
              <View style={styles.airplaneContainer}>
                <Ionicons name="airplane" size={16} color="#DC2626" />
              </View>
              <View style={styles.line} />
              <View style={styles.dot} />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{formatTime(booking.arrivalTime)}</Text>
              <Text style={styles.airport}>{booking.destination}</Text>
            </View>
          </View>

          {/* Date and Price */}
          <View style={styles.detailsRow}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar" size={16} color="#64748B" />
              <Text style={styles.dateText}>
                {formatDate(booking.departureDate)}
              </Text>
            </View>
            <Text style={styles.price}>
              {booking.currency} {Number(booking.totalAmount).toLocaleString()}
            </Text>
          </View>

          {/* Expand/Collapse Indicator */}
          <View style={styles.expandIndicator}>
            <View style={styles.expandLine} />
            <View style={styles.expandButton}>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={16}
                color="#64748B"
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />

          {/* Additional Details */}
          <View style={styles.additionalDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="people" size={16} color="#64748B" />
                <Text style={styles.detailLabel}>Passengers</Text>
              </View>
              <Text style={styles.detailValue}>{booking.passengers || 1}</Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="business" size={16} color="#64748B" />
                <Text style={styles.detailLabel}>Class</Text>
              </View>
              <Text style={styles.detailValue}>
                {booking.class || "Economy"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="airplane" size={16} color="#64748B" />
                <Text style={styles.detailLabel}>Flight</Text>
              </View>
              <Text style={styles.detailValue}>
                {booking.flightNumber || "N/A"}
              </Text>
            </View>
            {booking.verified && (
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <Ionicons name="shield-checkmark" size={16} color="#64748B" />
                  <Text style={styles.detailLabel}>Status</Text>
                </View>
                <View style={styles.verifiedContainer}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDownload(booking)}
            >
              <Ionicons name="download" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={handleShare}
            >
              <Ionicons name="share" size={16} color="#64748B" />
              <Text style={styles.actionButtonSecondaryText}>Share</Text>
            </TouchableOpacity>
            {isUpcoming() && booking.status !== "CANCELLED" && (
              <TouchableOpacity
                style={styles.actionButtonDanger}
                onPress={handleDelete}
              >
                <Ionicons name="close" size={16} color="#DC2626" />
                <Text style={styles.actionButtonDangerText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  card: {
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  routeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
    fontFamily: "RedHatDisplay-Bold",
  },
  referenceId: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    fontFamily: "RedHatDisplay-Medium",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  statusIcon: {
    marginRight: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    fontFamily: "RedHatDisplay-Bold",
  },
  flightDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  timeContainer: {
    alignItems: "center",
    flex: 1,
  },
  time: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
    fontFamily: "RedHatDisplay-Bold",
  },
  airport: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Medium",
  },
  flightPath: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
    paddingHorizontal: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DC2626",
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
  },
  airplaneContainer: {
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FECACA",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    fontFamily: "RedHatDisplay-Medium",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    fontFamily: "RedHatDisplay-Bold",
  },
  expandIndicator: {
    alignItems: "center",
    paddingTop: 16,
  },
  expandLine: {
    width: 40,
    height: 2,
    backgroundColor: "#E2E8F0",
    borderRadius: 1,
    marginBottom: 8,
  },
  expandButton: {
    backgroundColor: "#F8FAFC",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  expandedContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 24,
  },
  additionalDetails: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    fontFamily: "RedHatDisplay-Medium",
  },
  detailValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Bold",
  },
  verifiedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verifiedText: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Bold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "RedHatDisplay-Bold",
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionButtonSecondaryText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "RedHatDisplay-Bold",
  },
  actionButtonDanger: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  actionButtonDangerText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "RedHatDisplay-Bold",
  },
});
