// import { Ionicons } from "@expo/vector-icons";
// import { useState } from "react";
// import {
//   ActivityIndicator,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useAppDispatch } from "../redux/hooks";
// import {
//   addToFavorites,
//   removeFromFavorites,
// } from "../redux/slices/flightSlice";
// import type { FlightOffer } from "../types/flight-types";

// interface FlightCardProps {
//   flight: FlightOffer;
//   onBook: (flight: FlightOffer) => void;
//   loading?: boolean;
// }

// export default function FlightCard({
//   flight,
//   onBook,
//   loading,
// }: FlightCardProps) {
//   const dispatch = useAppDispatch();
//   const [expanded, setExpanded] = useState(false);
//   const [isFavorite, setIsFavorite] = useState(false);

//   const handleToggleFavorite = () => {
//     if (isFavorite) {
//       dispatch(removeFromFavorites(flight.id));
//     } else {
//       dispatch(addToFavorites(flight));
//     }
//     setIsFavorite(!isFavorite);
//   };

//   const formatPrice = (price: number | string) => {
//     const numPrice =
//       typeof price === "string" ? Number.parseFloat(price) : price;
//     return numPrice.toLocaleString("en-NG", { maximumFractionDigits: 0 });
//   };

//   const formatTime = (dateString: string) => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch {
//       return "N/A";
//     }
//   };

//   const formatDuration = (duration: string) => {
//     return duration?.replace("PT", "").toLowerCase() || "N/A";
//   };

//   const price = flight?.price?.total || flight?.price?.grandTotal;
//   const currency = flight?.price?.currency || "NGN";
//   const itineraries = flight?.itineraries || [];

//   // Get unique carrier codes
//   const carrierCodes = [
//     ...new Set(
//       itineraries.flatMap((it: any) =>
//         it.segments.map((seg: any) => seg.carrierCode)
//       )
//     ),
//   ];

//   // Get first and last segments for summary
//   const firstSegment = itineraries[0]?.segments?.[0];
//   const lastItinerary = itineraries[itineraries.length - 1];
//   const lastSegment =
//     lastItinerary?.segments?.[lastItinerary?.segments?.length - 1];

//   if (!firstSegment || !lastSegment) {
//     return (
//       <View style={styles.errorContainer}>
//         <Ionicons name="alert-circle" size={24} color="#d32f2f" />
//         <Text style={styles.errorText}>Flight data unavailable</Text>
//       </View>
//     );
//   }

//   const departureTime = formatTime(firstSegment.departure.at);
//   const arrivalTime = formatTime(lastSegment.arrival.at);
//   const departureCode = firstSegment.departure.iataCode;
//   const arrivalCode = lastSegment.arrival.iataCode;
//   const duration = itineraries
//     .map((it: any) => formatDuration(it.duration))
//     .join(" + ");

//   return (
//     <View style={styles.container}>
//       {/* Header with airlines and price */}
//       <View style={styles.header}>
//         <View style={styles.airlinesContainer}>
//           {carrierCodes.map((carrier, index) => (
//             <View key={index} style={styles.airlineTag}>
//               <Ionicons name="airplane" size={12} color="#007AFF" />
//               <Text style={styles.airlineCode}>{carrier}</Text>
//             </View>
//           ))}
//         </View>
//         <Text style={styles.price}>
//           {currency} {formatPrice(price)}
//         </Text>
//       </View>

//       {/* Flight route summary */}
//       <View style={styles.routeContainer}>
//         <View style={styles.timeContainer}>
//           <Text style={styles.time}>{departureTime}</Text>
//           <Text style={styles.airport}>{departureCode}</Text>
//         </View>

//         <View style={styles.routeLine}>
//           <View style={styles.dot} />
//           <View style={styles.line} />
//           <Text style={styles.duration}>{duration}</Text>
//           <View style={styles.line} />
//           <View style={styles.dot} />
//         </View>

//         <View style={styles.timeContainer}>
//           <Text style={styles.time}>{arrivalTime}</Text>
//           <Text style={styles.airport}>{arrivalCode}</Text>
//         </View>
//       </View>

//       {/* Flight info */}
//       <View style={styles.flightInfo}>
//         <Text style={styles.stopsInfo}>
//           {itineraries[0].segments.length === 1
//             ? "Non-stop"
//             : `${itineraries[0].segments.length - 1} stop(s)`}
//         </Text>
//         <Text style={styles.classInfo}>Economy</Text>
//       </View>

//       {/* Action buttons */}
//       <View style={styles.actions}>
//         <TouchableOpacity
//           style={styles.favoriteButton}
//           onPress={handleToggleFavorite}
//         >
//           <Ionicons
//             name={isFavorite ? "heart" : "heart-outline"}
//             size={16}
//             color={isFavorite ? "#d32f2f" : "#666"}
//           />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.detailsButton}
//           onPress={() => setExpanded(!expanded)}
//         >
//           <Text style={styles.detailsButtonText}>Details</Text>
//           <Ionicons
//             name={expanded ? "chevron-up" : "chevron-down"}
//             size={16}
//             color="#007AFF"
//           />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.bookButton, loading && styles.bookButtonDisabled]}
//           onPress={() => onBook(flight)}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.bookButtonText}>Book Now</Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* Expanded details */}
//       {expanded && (
//         <View style={styles.expandedDetails}>
//           {itineraries.map((itinerary: any, itIndex: number) => (
//             <View key={itIndex} style={styles.itinerary}>
//               <Text style={styles.itineraryTitle}>
//                 {itIndex === 0 ? "Outbound" : "Return"} Flight
//               </Text>
//               {itinerary.segments.map((segment: any, segIndex: number) => (
//                 <View key={segIndex} style={styles.segment}>
//                   <View style={styles.segmentHeader}>
//                     <View style={styles.carrierInfo}>
//                       <Ionicons name="airplane" size={16} color="#666" />
//                       <Text style={styles.carrierText}>
//                         {segment.carrierCode} {segment.number}
//                       </Text>
//                     </View>
//                     <Text style={styles.segmentDuration}>
//                       {formatDuration(segment.duration)}
//                     </Text>
//                   </View>

//                   <View style={styles.segmentRoute}>
//                     <View style={styles.segmentTime}>
//                       <Text style={styles.segmentTimeText}>
//                         {formatTime(segment.departure.at)}
//                       </Text>
//                       <Text style={styles.segmentAirport}>
//                         {segment.departure.iataCode}
//                       </Text>
//                     </View>

//                     <View style={styles.segmentLine}>
//                       <View style={styles.segmentDot} />
//                       <View style={styles.segmentLinePath} />
//                       <View style={styles.segmentDot} />
//                     </View>

//                     <View style={styles.segmentTime}>
//                       <Text style={styles.segmentTimeText}>
//                         {formatTime(segment.arrival.at)}
//                       </Text>
//                       <Text style={styles.segmentAirport}>
//                         {segment.arrival.iataCode}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               ))}
//             </View>
//           ))}
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   errorContainer: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     borderWidth: 1,
//     borderColor: "#ffcdd2",
//   },
//   errorText: {
//     color: "#d32f2f",
//     fontSize: 14,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   airlinesContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//   },
//   airlineTag: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#e3f2fd",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   airlineCode: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#007AFF",
//   },
//   price: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#d32f2f",
//   },
//   routeContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   timeContainer: {
//     alignItems: "center",
//   },
//   time: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   airport: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 2,
//   },
//   routeLine: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     marginHorizontal: 16,
//   },
//   dot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: "#d32f2f",
//   },
//   line: {
//     flex: 1,
//     height: 1,
//     backgroundColor: "#ddd",
//     marginHorizontal: 4,
//   },
//   duration: {
//     fontSize: 12,
//     color: "#666",
//     fontWeight: "500",
//     paddingHorizontal: 8,
//   },
//   flightInfo: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 16,
//   },
//   stopsInfo: {
//     fontSize: 12,
//     color: "#666",
//   },
//   classInfo: {
//     fontSize: 12,
//     color: "#666",
//   },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   detailsButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   detailsButtonText: {
//     fontSize: 14,
//     color: "#007AFF",
//     fontWeight: "500",
//   },
//   bookButton: {
//     backgroundColor: "#d32f2f",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   bookButtonDisabled: {
//     opacity: 0.6,
//   },
//   bookButtonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   expandedDetails: {
//     marginTop: 16,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: "#eee",
//   },
//   itinerary: {
//     marginBottom: 12,
//   },
//   itineraryTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 8,
//   },
//   segment: {
//     backgroundColor: "#f8f9fa",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 8,
//   },
//   segmentHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   carrierInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//   },
//   carrierText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#333",
//   },
//   segmentDuration: {
//     fontSize: 12,
//     color: "#666",
//   },
//   segmentRoute: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   segmentTime: {
//     alignItems: "center",
//   },
//   segmentTimeText: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   segmentAirport: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 2,
//   },
//   segmentLine: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     marginHorizontal: 12,
//   },
//   segmentDot: {
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: "#d32f2f",
//   },
//   segmentLinePath: {
//     flex: 1,
//     height: 1,
//     backgroundColor: "#ddd",
//     marginHorizontal: 4,
//   },
//   favoriteButton: {
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: "#f0f0f0",
//   },
// });

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppDispatch } from "../redux/hooks";
import {
  addToFavorites,
  removeFromFavorites,
} from "../redux/slices/flightSlice";
import type { FlightOffer } from "../types/flight-types";

interface FlightCardProps {
  flight: FlightOffer;
  onBook: (flight: FlightOffer) => void;
  loading?: boolean;
  airlineName?: string;
  airlineLoading?: boolean;
}

export default function FlightCard({
  flight,
  onBook,
  loading,
  airlineName,
  airlineLoading,
}: FlightCardProps) {
  const dispatch = useAppDispatch();

  const [expanded, setExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // TODO: Sync with Redux favorites if available
    setIsFavorite(false);
  }, [flight.id]);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(flight.id));
      AccessibilityInfo.announceForAccessibility(
        "Removed flight from favorites"
      );
    } else {
      dispatch(addToFavorites(flight));
      AccessibilityInfo.announceForAccessibility("Added flight to favorites");
    }
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (price: number | string) => {
    const numPrice =
      typeof price === "string" ? Number.parseFloat(price) : price;
    return numPrice.toLocaleString("en-NG", { maximumFractionDigits: 0 });
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const formatDuration = (duration: string) => {
    return duration?.replace("PT", "").toLowerCase() || "N/A";
  };

  const price = flight?.price?.total || flight?.price?.grandTotal;
  const currency = flight?.price?.currency || "NGN";
  const itineraries = flight?.itineraries || [];

  const carrierCodes = [
    ...new Set(
      itineraries.flatMap((it: any) =>
        it.segments.map((seg: any) => seg.carrierCode)
      )
    ),
  ];

  const firstSegment = itineraries[0]?.segments?.[0];
  const lastItinerary = itineraries[itineraries.length - 1];
  const lastSegment =
    lastItinerary?.segments?.[lastItinerary?.segments?.length - 1];

  if (!firstSegment || !lastSegment) {
    return (
      <View style={styles.errorContainer} accessibilityRole="alert">
        <Ionicons name="alert-circle" size={24} color="#d32f2f" />
        <Text style={styles.errorText}>Flight data unavailable</Text>
      </View>
    );
  }

  const departureTime = formatTime(firstSegment.departure.at);
  const arrivalTime = formatTime(lastSegment.arrival.at);
  const departureCode = firstSegment.departure.iataCode;
  const arrivalCode = lastSegment.arrival.iataCode;
  const duration = itineraries
    .map((it: any) => formatDuration(it.duration))
    .join(" + ");

  return (
    <View style={styles.container} accessible accessibilityRole="summary">
      <View style={styles.header}>
        <View style={styles.airlinesContainer}>
          {carrierCodes.map((carrier, index) => (
            <View key={index} style={styles.airlineTag}>
              <Ionicons name="airplane" size={12} color="#d32f2f" />
              <Text style={styles.airlineCode}>{carrier}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.price}>
          {currency} {formatPrice(price)}
        </Text>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{departureTime}</Text>
          <Text style={styles.airport}>{departureCode}</Text>
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
        </View>
      </View>

      <View style={styles.flightInfo}>
        <Text style={styles.stopsInfo}>
          {itineraries[0].segments.length === 1
            ? "Non-stop"
            : `${itineraries[0].segments.length - 1} stop(s)`}
        </Text>
        <Text style={styles.classInfo}>Economy</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
          accessibilityState={{ selected: isFavorite }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={16}
            color={isFavorite ? "#d32f2f" : "#666"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => setExpanded((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel="Toggle flight details"
        >
          <Text style={styles.detailsButtonText}>Details</Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#d32f2f"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookButton, loading && styles.bookButtonDisabled]}
          onPress={() => onBook(flight)}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Book this flight"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Book Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={styles.expandedDetails}>
          {itineraries.map((itinerary: any, itIndex: number) => (
            <View key={itIndex} style={styles.itinerary}>
              <Text style={styles.itineraryTitle}>
                {itIndex === 0 ? "Outbound" : "Return"} Flight
              </Text>
              {itinerary.segments.map((segment: any, segIndex: number) => (
                <View key={segIndex} style={styles.segment}>
                  <View style={styles.segmentHeader}>
                    <View style={styles.carrierInfo}>
                      <Ionicons name="airplane" size={16} color="#666" />
                      <Text style={styles.carrierText}>
                        {segment.carrierCode} {segment.number}
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
                      <Text style={styles.segmentAirport}>
                        {segment.arrival.iataCode}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

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
  errorContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  airlinesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  airlineTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fde3e3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  airlineCode: {
    fontSize: 12,
    fontWeight: "600",
    color: "#d32f2f",
    fontFamily: "RedHatDisplay-Bold",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#d32f2f",
    fontFamily: "RedHatDisplay-Bold",
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  timeContainer: {
    alignItems: "center",
  },
  time: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    fontFamily: "RedHatDisplay-Bold",
  },
  airport: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    fontFamily: "RedHatDisplay-Regular",
  },
  routeLine: {
    flex: 1,
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
    fontFamily: "RedHatDisplay-Regular",
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
    color: "#d32f2f",
    fontWeight: "500",
    fontFamily: "RedHatDisplay-Regular",
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
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Bold",
  },
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  itinerary: {
    marginBottom: 12,
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    fontFamily: "RedHatDisplay-Bold",
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
    fontFamily: "RedHatDisplay-Bold",
  },
  segmentDuration: {
    fontSize: 12,
    color: "#666",
  },
  segmentRoute: {
    flexDirection: "row",
    alignItems: "center",
  },
  segmentTime: {
    alignItems: "center",
  },
  segmentTimeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    fontFamily: "RedHatDisplay-Bold",
  },
  segmentAirport: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
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
});
