import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface FareSummarySectionProps {
  selectedFlight: any;
}

export default function FareSummarySection({
  selectedFlight,
}: FareSummarySectionProps) {
  const getFlightRoutes = () => {
    if (!selectedFlight?.itineraries?.length) return [];

    return selectedFlight.itineraries.flatMap((itinerary: any) =>
      itinerary.segments.map((segment: any) => {
        const dep = segment.departure;
        const arr = segment.arrival;
        const depName = dep.details?.name || dep.iataCode;
        const arrName = arr.details?.name || arr.iataCode;

        return `${depName} (${dep.iataCode}) → ${arrName} (${arr.iataCode})`;
      })
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Flight Details</Text>
      <View style={styles.fareContainer}>
        {getFlightRoutes().map((route: any, idx: any) => (
          <View key={idx} style={styles.routeItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="airplane" size={20} color="#DC2626" />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeText}>{route}</Text>
              <Text style={styles.routeSubtext}>
                {selectedFlight?.oneWay ? "One Way" : "Round Trip"} • Economy
                Class
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
  },
  fareContainer: {
    gap: 16,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  routeInfo: {
    flex: 1,
  },
  routeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  routeSubtext: {
    fontSize: 14,
    color: "#666666",
  },
});
