import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAirlineDetails } from "../hooks/useAirlineDetails";
import { useAirportDetails } from "../hooks/useAirportDetails";
import { useAppDispatch } from "../redux/hooks";
import {
  addToFavorites,
  removeFromFavorites,
} from "../redux/slices/flightSlice";
import type { FlightOffer } from "../types/flight-types";

interface EnhancedFlightCardProps {
  flight: FlightOffer;
  onBook: (flight: FlightOffer) => void;
  loading?: boolean;
}

export default function EnhancedFlightCard({
  flight,
  onBook,
  loading,
}: EnhancedFlightCardProps) {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(flight.id));
    } else {
      dispatch(addToFavorites(flight));
    }
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (price: number | string) => {
    const numPrice =
      typeof price === "string" ? Number.parseFloat(price) : price;
    return numPrice.toLocaleString("en-NG", { maximumFractionDigits: 0 });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (duration: string) => {
    return duration?.replace("PT", "").toLowerCase() || "";
  };

  const price = flight?.price?.total || flight?.price?.grandTotal;
  const currency = flight?.price?.currency || "NGN";
  const itineraries = flight?.itineraries || [];

  // Get unique carrier codes for airline details
  const carrierCodes = [
    ...new Set(
      itineraries.flatMap((it: any) =>
        it.segments.map((seg: any) => seg.carrierCode)
      )
    ),
  ];

  // Get first and last segments for summary
  const firstSegment = itineraries[0]?.segments?.[0];
  const lastItinerary = itineraries[itineraries.length - 1];
  const lastSegment =
    lastItinerary?.segments?.[lastItinerary?.segments?.length - 1];

  // Use hooks for airport and airline details
  const { airportDetails: depAirport } = useAirportDetails(
    firstSegment?.departure?.iataCode || ""
  );
  const { airportDetails: arrAirport } = useAirportDetails(
    lastSegment?.arrival?.iataCode || ""
  );
  const { airlineDetails: primaryAirline } = useAirlineDetails(
    carrierCodes[0] || ""
  );

  if (!firstSegment || !lastSegment) return null;

  const departureTime = formatTime(firstSegment.departure.at);
  const arrivalTime = formatTime(lastSegment.arrival.at);
  const departureCode = firstSegment.departure.iataCode;
  const arrivalCode = lastSegment.arrival.iataCode;
  const duration = itineraries
    .map((it: any) => formatDuration(it.duration))
    .join(" + ");

  return (
    <View style={styles.container}>
      {/* Header with airlines and price */}
      <View style={styles.header}>
        <View style={styles.airlinesContainer}>
          {carrierCodes.map((carrier, index) => (
            <View key={index} style={styles.airlineTag}>
              <Ionicons name="airplane" size={12} color="#007AFF" />
              <Text style={styles.airlineCode}>{carrier}</Text>
            </View>
          ))}
          {primaryAirline?.commonName && (
            <Text style={styles.airlineName}>{primaryAirline.commonName}</Text>
          )}
        </View>
        <Text style={styles.price}>
          {currency} {formatPrice(price)}
        </Text>
      </View>

      {/* Enhanced route summary with airport names */}
      <View style={styles.routeContainer}>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{departureTime}</Text>
          <Text style={styles.airport}>{departureCode}</Text>
          {depAirport?.name && (
            <Text style={styles.airportName} numberOfLines={1}>
              {depAirport.name}
            </Text>
          )}
        </View>

        <View style={styles.routeLine}>
          <View style={styles.dot} />
          <View style={styles.line} />
          <Text style={styles.duration}>{duration}</Text>
          <View style={styles.line} />
          <View style={styles.dot} />
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.time}>{arrivalTime}</Text>
          <Text style={styles.airport}>{arrivalCode}</Text>
          {arrAirport?.name && (
            <Text style={styles.airportName} numberOfLines={1}>
              {arrAirport.name}
            </Text>
          )}
        </View>
      </View>

      {/* Flight details summary */}
      <View style={styles.flightInfo}>
        <Text style={styles.stopsInfo}>
          {itineraries[0].segments.length === 1
            ? "Non-stop"
            : `${itineraries[0].segments.length - 1} stop(s)`}
        </Text>
        <Text style={styles.classInfo}>Economy</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={16}
            color={isFavorite ? "#d32f2f" : "#666"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#007AFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookButton, loading && styles.bookButtonDisabled]}
          onPress={() => onBook(flight)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Expanded details with enhanced information */}
      {expanded && (
        <View style={styles.expandedDetails}>
          {itineraries.map((itinerary: any, itIndex: number) => (
            <View key={itIndex} style={styles.itinerary}>
              <Text style={styles.itineraryTitle}>
                {itIndex === 0 ? "Outbound" : "Return"} Flight
              </Text>
              {itinerary.segments.map((segment: any, segIndex: number) => (
                <SegmentDetails key={segIndex} segment={segment} />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// Separate component for segment details to use hooks properly
const SegmentDetails = ({ segment }: { segment: any }) => {
  const { airportDetails: depAirport } = useAirportDetails(
    segment.departure.iataCode
  );
  const { airportDetails: arrAirport } = useAirportDetails(
    segment.arrival.iataCode
  );
  const { airlineDetails: airline } = useAirlineDetails(segment.carrierCode);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (duration: string) => {
    return duration?.replace("PT", "").toLowerCase() || "";
  };

  return (
    <View style={styles.segment}>
      <View style={styles.segmentHeader}>
        <View style={styles.carrierInfo}>
          <Ionicons name="airplane" size={16} color="#666" />
          <Text style={styles.carrierText}>
            {airline?.commonName || segment.carrierCode} {segment.number}
          </Text>
        </View>
        <Text style={styles.segmentDuration}>
          {formatDuration(segment.duration)}
        </Text>
      </View>

      <View style={styles.segmentRoute}>
        <View style={styles.segmentTime}>
          <Text style={styles.segmentTimeText}>
            {formatTime(segment.departure.at)}
          </Text>
          <Text style={styles.segmentAirport}>
            {segment.departure.iataCode}
          </Text>
          {depAirport?.name && (
            <Text style={styles.segmentAirportName} numberOfLines={2}>
              {depAirport.name}
            </Text>
          )}
        </View>

        <View style={styles.segmentLine}>
          <View style={styles.segmentDot} />
          <View style={styles.segmentLinePath} />
          <View style={styles.segmentDot} />
        </View>

        <View style={styles.segmentTime}>
          <Text style={styles.segmentTimeText}>
            {formatTime(segment.arrival.at)}
          </Text>
          <Text style={styles.segmentAirport}>{segment.arrival.iataCode}</Text>
          {arrAirport?.name && (
            <Text style={styles.segmentAirportName} numberOfLines={2}>
              {arrAirport.name}
            </Text>
          )}
        </View>
      </View>

      {/* Additional segment details */}
      <View style={styles.segmentDetails}>
        <Text style={styles.segmentDetailText}>
          Aircraft: {segment.aircraft?.code || "N/A"}
        </Text>
        {segment.operating?.carrierCode &&
          segment.operating.carrierCode !== segment.carrierCode && (
            <Text style={styles.segmentDetailText}>
              Operated by: {segment.operating.carrierCode}
            </Text>
          )}
        {airline?.businessName && (
          <Text style={styles.segmentDetailText}>
            Airline: {airline.businessName}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  airlinesContainer: {
    flex: 1,
    marginRight: 12,
  },
  airlineTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  airlineCode: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  airlineName: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  timeContainer: {
    alignItems: "center",
    flex: 1,
  },
  time: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  airport: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  airportName: {
    fontSize: 10,
    color: "#888",
    marginTop: 1,
    textAlign: "center",
  },
  routeLine: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d32f2f",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
  },
  duration: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    paddingHorizontal: 8,
  },
  flightInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  stopsInfo: {
    fontSize: 12,
    color: "#666",
  },
  classInfo: {
    fontSize: 12,
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  bookButton: {
    backgroundColor: "#d32f2f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  itinerary: {
    marginBottom: 16,
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  segment: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  segmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  carrierInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  carrierText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  segmentDuration: {
    fontSize: 12,
    color: "#666",
  },
  segmentRoute: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  segmentTime: {
    alignItems: "center",
    flex: 1,
  },
  segmentTimeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  segmentAirport: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  segmentAirportName: {
    fontSize: 10,
    color: "#888",
    marginTop: 1,
    textAlign: "center",
  },
  segmentLine: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  segmentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d32f2f",
  },
  segmentLinePath: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
  },
  segmentDetails: {
    marginTop: 8,
  },
  segmentDetailText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
});
