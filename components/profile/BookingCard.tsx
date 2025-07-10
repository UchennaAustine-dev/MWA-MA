// /**
//  * Enhanced Booking Card Component
//  * Displays individual flight booking information with improved design and actions
//  */
// import { Ionicons } from "@expo/vector-icons";
// import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// import { deleteFlightBooking } from "@/lib/userAPI";
// import { formatTime } from "@/utils/dateUtils";
// import { formatDate } from "@/utils/formatter";
// import { getStatusColor } from "../../utils/statusUtils";

// interface BookingCardProps {
//   booking: any;
//   onDelete: () => void;
//   onDownload: (booking: any) => void;
// }

// export default function BookingCard({
//   booking,
//   onDelete,
//   onDownload,
// }: BookingCardProps) {
//   const statusColors = getStatusColor(booking.status);

//   const handleDelete = () => {
//     Alert.alert(
//       "Delete Booking",
//       "Are you sure you want to delete this booking? This action cannot be undone.",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await deleteFlightBooking(booking.id);
//               Alert.alert("Success", "Booking deleted successfully");
//               onDelete();
//             } catch (error: any) {
//               Alert.alert("Error", error.message || "Failed to delete booking");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const traveler = booking?.apiResponse?.data?.travelers[0];
//   const segments = booking?.bookingDetails?.itineraries[0]?.segments || [];
//   const firstSegment = segments[0];
//   const lastSegment = segments[segments.length - 1];

//   // Calculate total duration
//   const calculateDuration = () => {
//     if (!firstSegment?.departure?.at || !lastSegment?.arrival?.at) return "N/A";

//     const start = new Date(firstSegment.departure.at);
//     const end = new Date(lastSegment.arrival.at);
//     const diffMs = end.getTime() - start.getTime();
//     const hours = Math.floor(diffMs / (1000 * 60 * 60));
//     const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

//     return `${hours}h ${minutes}m`;
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header with enhanced design */}
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <View style={styles.referenceContainer}>
//             <Ionicons name="document-text-outline" size={16} color="#DC2626" />
//             <Text style={styles.referenceId}>{booking.referenceId}</Text>
//           </View>
//           <Text style={styles.bookingDate}>
//             Booked on {formatDate(booking.createdAt)}
//           </Text>
//         </View>
//         <View style={styles.headerRight}>
//           <View
//             style={[
//               styles.statusBadge,
//               { backgroundColor: statusColors.backgroundColor },
//             ]}
//           >
//             <Text
//               style={[styles.statusText, { color: statusColors.textColor }]}
//             >
//               {booking.status}
//             </Text>
//           </View>
//           <Text style={styles.totalAmount}>
//             {booking?.totalAmount?.toLocaleString(undefined, {
//               style: "currency",
//               currency: booking?.bookingDetails?.price?.currency || "USD",
//             })}
//           </Text>
//         </View>
//       </View>

//       {/* Passenger Info with enhanced styling */}
//       <View style={styles.passengerSection}>
//         <View style={styles.sectionHeader}>
//           <Ionicons name="person" size={16} color="#DC2626" />
//           <Text style={styles.sectionTitle}>Passenger Information</Text>
//         </View>
//         <View style={styles.passengerInfo}>
//           <Text style={styles.passengerName}>
//             {traveler?.name?.firstName || "N/A"}{" "}
//             {traveler?.name?.lastName || "N/A"}
//           </Text>
//           <Text style={styles.passengerEmail}>
//             {traveler?.contact?.emailAddress || "N/A"}
//           </Text>
//         </View>
//       </View>

//       {/* Enhanced Flight Route */}
//       {firstSegment && lastSegment && (
//         <View style={styles.flightSection}>
//           <View style={styles.sectionHeader}>
//             <Ionicons name="airplane" size={16} color="#DC2626" />
//             <Text style={styles.sectionTitle}>Flight Details</Text>
//           </View>

//           <View style={styles.flightRoute}>
//             {/* Departure */}
//             <View style={styles.routePoint}>
//               <View style={styles.routeInfo}>
//                 <Text style={styles.airportCode}>
//                   {firstSegment.departure?.details?.iataCode ||
//                     firstSegment.departure?.iataCode ||
//                     "N/A"}
//                 </Text>
//                 <Text style={styles.cityName}>
//                   {firstSegment.departure?.details?.cityName || "Departure"}
//                 </Text>
//                 <Text style={styles.routeTime}>
//                   {formatTime(firstSegment.departure?.at)}
//                 </Text>
//                 <Text style={styles.routeDate}>
//                   {formatDate(firstSegment.departure?.at)}
//                 </Text>
//               </View>
//             </View>

//             {/* Flight Path */}
//             <View style={styles.routeLine}>
//               <View style={styles.line} />
//               <View style={styles.flightInfo}>
//                 <Ionicons
//                   name="airplane"
//                   size={20}
//                   color="#DC2626"
//                   style={styles.planeIcon}
//                 />
//                 <Text style={styles.duration}>{calculateDuration()}</Text>
//                 {segments.length > 1 && (
//                   <Text style={styles.stopsText}>
//                     {segments.length - 1} stop(s)
//                   </Text>
//                 )}
//               </View>
//               <View style={styles.line} />
//             </View>

//             {/* Arrival */}
//             <View style={styles.routePoint}>
//               <View style={styles.routeInfo}>
//                 <Text style={styles.airportCode}>
//                   {lastSegment.arrival?.iataCode ||
//                     lastSegment.arrival?.details?.iataCode ||
//                     "N/A"}
//                 </Text>
//                 <Text style={styles.cityName}>
//                   {lastSegment.arrival?.details?.cityName || "Arrival"}
//                 </Text>
//                 <Text style={styles.routeTime}>
//                   {formatTime(lastSegment.arrival?.at)}
//                 </Text>
//                 <Text style={styles.routeDate}>
//                   {formatDate(lastSegment.arrival?.at)}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* Flight Number */}
//           <View style={styles.flightDetails}>
//             <Text style={styles.flightNumber}>
//               Flight {firstSegment.carrierCode}
//               {firstSegment.number}
//             </Text>
//             <Text style={styles.aircraft}>
//               {firstSegment.aircraft?.code || "Aircraft TBD"}
//             </Text>
//           </View>
//         </View>
//       )}

//       {/* Enhanced Actions */}
//       <View style={styles.actions}>
//         <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
//           <Ionicons name="trash-outline" size={20} color="#DC2626" />
//           <Text style={styles.deleteButtonText}>Delete</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.downloadButton}
//           onPress={() => onDownload(booking)}
//         >
//           <Ionicons name="download-outline" size={20} color="#FFFFFF" />
//           <Text style={styles.downloadButtonText}>Download Ticket</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     marginBottom: 16,
//     shadowColor: "#000000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 6,
//     overflow: "hidden",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     padding: 20,
//     backgroundColor: "#F8F9FA",
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0F0F0",
//   },
//   headerLeft: {
//     flex: 1,
//   },
//   referenceContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 4,
//   },
//   referenceId: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#000000",
//   },
//   bookingDate: {
//     fontSize: 12,
//     color: "#666666",
//   },
//   headerRight: {
//     alignItems: "flex-end",
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     marginBottom: 8,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: "bold",
//   },
//   totalAmount: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#000000",
//   },
//   passengerSection: {
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0F0F0",
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 12,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#000000",
//   },
//   passengerInfo: {
//     marginLeft: 24,
//   },
//   passengerName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#000000",
//     marginBottom: 4,
//   },
//   passengerEmail: {
//     fontSize: 14,
//     color: "#666666",
//   },
//   flightSection: {
//     padding: 20,
//   },
//   flightRoute: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginLeft: 24,
//     marginBottom: 16,
//   },
//   routePoint: {
//     flex: 1,
//   },
//   routeInfo: {
//     alignItems: "center",
//   },
//   airportCode: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#000000",
//     marginBottom: 4,
//   },
//   cityName: {
//     fontSize: 12,
//     color: "#666666",
//     marginBottom: 4,
//   },
//   routeTime: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#000000",
//     marginBottom: 2,
//   },
//   routeDate: {
//     fontSize: 12,
//     color: "#666666",
//   },
//   routeLine: {
//     flex: 2,
//     alignItems: "center",
//     marginHorizontal: 16,
//   },
//   line: {
//     height: 2,
//     backgroundColor: "#E5E5E5",
//     flex: 1,
//     width: "100%",
//   },
//   flightInfo: {
//     alignItems: "center",
//     paddingVertical: 8,
//   },
//   planeIcon: {
//     transform: [{ rotate: "90deg" }],
//     marginBottom: 4,
//   },
//   duration: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#000000",
//     marginBottom: 2,
//   },
//   stopsText: {
//     fontSize: 10,
//     color: "#666666",
//   },
//   flightDetails: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginLeft: 24,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: "#F0F0F0",
//   },
//   flightNumber: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#000000",
//   },
//   aircraft: {
//     fontSize: 12,
//     color: "#666666",
//   },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: "#F0F0F0",
//     backgroundColor: "#FAFAFA",
//   },
//   deleteButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#DC2626",
//     backgroundColor: "#FFFFFF",
//     gap: 8,
//   },
//   deleteButtonText: {
//     color: "#DC2626",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   downloadButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#DC2626",
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//     gap: 8,
//     shadowColor: "#DC2626",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   downloadButtonText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "600",
//   },
// });

// import { Ionicons } from "@expo/vector-icons";
// import { useState } from "react";
// import {
//   Alert,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   type ViewStyle,
// } from "react-native";

// interface BookingCardProps {
//   booking: any;
//   onDelete: () => void;
//   onDownload: (booking: any) => void;
//   style?: ViewStyle;
// }

// export default function BookingCard({
//   booking,
//   onDelete,
//   onDownload,
//   style,
// }: BookingCardProps) {
//   const [expanded, setExpanded] = useState(false);

//   const getStatusColor = (status: string) => {
//     switch (status?.toUpperCase()) {
//       case "CONFIRMED":
//         return "#DC2626";
//       case "PENDING":
//         return "#F59E0B";
//       case "CANCELLED":
//         return "#666666";
//       default:
//         return "#666666";
//     }
//   };

//   const formatDate = (dateString: string) => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });
//     } catch {
//       return "Invalid Date";
//     }
//   };

//   const formatTime = (dateString: string) => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch {
//       return "N/A";
//     }
//   };

//   const isUpcoming = () => {
//     try {
//       return new Date(booking.departureDate) > new Date();
//     } catch {
//       return false;
//     }
//   };

//   const handleDelete = () => {
//     Alert.alert(
//       "Cancel Booking",
//       `Are you sure you want to cancel booking ${booking.referenceId}?`,
//       [
//         { text: "No", style: "cancel" },
//         {
//           text: "Yes, Cancel",
//           style: "destructive",
//           onPress: onDelete,
//         },
//       ]
//     );
//   };

//   const handleShare = () => {
//     Alert.alert(
//       "Share Booking",
//       `Share booking details for ${booking.referenceId}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Share",
//           onPress: () => {
//             Alert.alert("Success", "Booking details shared!");
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <View style={[styles.container, style]}>
//       <TouchableOpacity
//         onPress={() => setExpanded(!expanded)}
//         activeOpacity={0.7}
//       >
//         <View style={styles.card}>
//           {/* Header */}
//           <View style={styles.header}>
//             <View style={styles.headerLeft}>
//               <Text style={styles.routeText}>
//                 {booking.origin} → {booking.destination}
//               </Text>
//               <Text style={styles.referenceId}>#{booking.referenceId}</Text>
//             </View>
//             <View style={styles.headerRight}>
//               <View
//                 style={[
//                   styles.statusBadge,
//                   { backgroundColor: getStatusColor(booking.status) },
//                 ]}
//               >
//                 <Text style={styles.statusText}>{booking.status}</Text>
//               </View>
//             </View>
//           </View>

//           {/* Flight Details */}
//           <View style={styles.flightDetails}>
//             <View style={styles.timeContainer}>
//               <Text style={styles.time}>
//                 {formatTime(booking.departureTime)}
//               </Text>
//               <Text style={styles.airport}>{booking.origin}</Text>
//             </View>

//             <View style={styles.flightPath}>
//               <View style={styles.dot} />
//               <View style={styles.line} />
//               <Ionicons name="airplane" size={16} color="#DC2626" />
//               <View style={styles.line} />
//               <View style={styles.dot} />
//             </View>

//             <View style={styles.timeContainer}>
//               <Text style={styles.time}>{formatTime(booking.arrivalTime)}</Text>
//               <Text style={styles.airport}>{booking.destination}</Text>
//             </View>
//           </View>

//           {/* Date and Price */}
//           <View style={styles.detailsRow}>
//             <View style={styles.dateContainer}>
//               <Ionicons name="calendar" size={16} color="#666666" />
//               <Text style={styles.dateText}>
//                 {formatDate(booking.departureDate)}
//               </Text>
//             </View>
//             <Text style={styles.price}>
//               {booking.currency} {Number(booking.totalAmount).toLocaleString()}
//             </Text>
//           </View>

//           {/* Expand/Collapse Indicator */}
//           <View style={styles.expandIndicator}>
//             <Ionicons
//               name={expanded ? "chevron-up" : "chevron-down"}
//               size={20}
//               color="#666666"
//             />
//           </View>
//         </View>
//       </TouchableOpacity>

//       {/* Expanded Content */}
//       {expanded && (
//         <View style={styles.expandedContent}>
//           <View style={styles.divider} />

//           {/* Additional Details */}
//           <View style={styles.additionalDetails}>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Passengers:</Text>
//               <Text style={styles.detailValue}>{booking.passengers || 1}</Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Class:</Text>
//               <Text style={styles.detailValue}>
//                 {booking.class || "Economy"}
//               </Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Flight:</Text>
//               <Text style={styles.detailValue}>
//                 {booking.flightNumber || "N/A"}
//               </Text>
//             </View>
//             {booking.verified && (
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Status:</Text>
//                 <View style={styles.verifiedContainer}>
//                   <Ionicons name="checkmark-circle" size={16} color="#DC2626" />
//                   <Text style={styles.verifiedText}>Verified</Text>
//                 </View>
//               </View>
//             )}
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.actionButtons}>
//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={() => onDownload(booking)}
//             >
//               <Ionicons name="download" size={16} color="#FFFFFF" />
//               <Text style={styles.actionButtonText}>Download</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.actionButtonSecondary}
//               onPress={handleShare}
//             >
//               <Ionicons name="share" size={16} color="#000000" />
//               <Text style={styles.actionButtonSecondaryText}>Share</Text>
//             </TouchableOpacity>

//             {isUpcoming() && booking.status !== "CANCELLED" && (
//               <TouchableOpacity
//                 style={styles.actionButtonDanger}
//                 onPress={handleDelete}
//               >
//                 <Ionicons name="close" size={16} color="#DC2626" />
//                 <Text style={styles.actionButtonDangerText}>Cancel</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E5E5E5",
//     overflow: "hidden",
//   },
//   card: {
//     padding: 20,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 20,
//   },
//   headerLeft: {
//     flex: 1,
//   },
//   routeText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#000000",
//     marginBottom: 4,
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   referenceId: {
//     fontSize: 14,
//     color: "#666666",
//     fontWeight: "500",
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   headerRight: {
//     alignItems: "flex-end",
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#FFFFFF",
//     textTransform: "uppercase",
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   flightDetails: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   timeContainer: {
//     alignItems: "center",
//     flex: 1,
//   },
//   time: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#000000",
//     marginBottom: 4,
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   airport: {
//     fontSize: 12,
//     color: "#666666",
//     fontWeight: "500",
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   flightPath: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 2,
//     paddingHorizontal: 16,
//   },
//   dot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: "#DC2626",
//   },
//   line: {
//     flex: 1,
//     height: 1,
//     backgroundColor: "#E5E5E5",
//     marginHorizontal: 8,
//   },
//   detailsRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   dateContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//   },
//   dateText: {
//     fontSize: 14,
//     color: "#666666",
//     fontWeight: "500",
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   price: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#000000",
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   expandIndicator: {
//     alignItems: "center",
//     paddingTop: 8,
//   },
//   expandedContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#E5E5E5",
//     marginBottom: 20,
//   },
//   additionalDetails: {
//     marginBottom: 20,
//   },
//   detailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 8,
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: "#666666",
//     fontWeight: "500",
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   detailValue: {
//     fontSize: 14,
//     color: "#000000",
//     fontWeight: "600",
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   verifiedContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   verifiedText: {
//     fontSize: 14,
//     color: "#DC2626",
//     fontWeight: "600",
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   actionButtons: {
//     flexDirection: "row",
//     gap: 12,
//   },
//   actionButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#DC2626",
//     paddingVertical: 12,
//     borderRadius: 8,
//     gap: 6,
//   },
//   actionButtonText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "600",
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   actionButtonSecondary: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     backgroundColor: "#F5F5F5",
//     borderRadius: 8,
//     gap: 6,
//   },
//   actionButtonSecondaryText: {
//     color: "#000000",
//     fontSize: 14,
//     fontWeight: "600",
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   actionButtonDanger: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     backgroundColor: "#FEF2F2",
//     borderRadius: 8,
//     gap: 6,
//   },
//   actionButtonDangerText: {
//     color: "#DC2626",
//     fontSize: 14,
//     fontWeight: "600",
//     fontFamily: "RedHatDisplay-Bold",
//   },
// });

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
import BookingDetailsModal from "./BookingDetailsModal";

interface BookingCardProps {
  booking: any;
  onDelete: () => void;
  onDownload: (booking: any) => void;
  style?: ViewStyle;
}

export default function BookingCard({
  booking,
  onDelete,
  onDownload,
  style,
}: BookingCardProps) {
  const [modalVisible, setModalVisible] = useState(false);

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
    <>
      <View style={[styles.container, style]}>
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

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="information-circle" size={16} color="#FFFFFF" />
              <Text style={styles.viewDetailsButtonText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={() => onDownload(booking)}
            >
              <Ionicons name="download" size={16} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={handleShare}
            >
              <Ionicons name="share" size={16} color="#64748B" />
            </TouchableOpacity>

            {isUpcoming() && booking.status !== "CANCELLED" && (
              <TouchableOpacity
                style={styles.actionButtonDanger}
                onPress={handleDelete}
              >
                <Ionicons name="close" size={16} color="#DC2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        visible={modalVisible}
        booking={booking}
        onClose={() => setModalVisible(false)}
        onDownload={onDownload}
        onShare={handleShare}
        onCancel={
          isUpcoming() && booking.status !== "CANCELLED"
            ? handleDelete
            : undefined
        }
      />
    </>
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
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
    fontFamily: "RedHatDisplay-Bold",
  },
  referenceId: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    fontFamily: "RedHatDisplay-Regular",
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
    fontWeight: "600",
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
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
    fontFamily: "RedHatDisplay-Bold",
  },
  airport: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    fontFamily: "RedHatDisplay-Regular",
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
    marginBottom: 20,
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
    fontFamily: "RedHatDisplay-Regular",
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "RedHatDisplay-Bold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  viewDetailsButton: {
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
  viewDetailsButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Bold",
  },
  actionButtonSecondary: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionButtonDanger: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
});
