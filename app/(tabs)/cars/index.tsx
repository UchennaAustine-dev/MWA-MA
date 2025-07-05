import RideSearchComponent from "@/components/rides/RideSearchComponent";
import { useCustomFonts } from "@/hooks/useCustomFonts";
import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function CarsScreen() {
  const [fontsLoaded] = useCustomFonts();
  const user: any = useSelector((state: RootState) => state.user?.user);
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // const pathname = usePathname();

  // Define your routes
  const routes = {
    rideBooking: "/ride-booking",
  };

  const handleSearch = (searchData: any) => {
    console.log("Search data:", searchData);
    // Navigate to ride booking screen
    router.push(routes.rideBooking as any);
  };

  const handleQuickBooking = () => {
    router.push(routes.rideBooking as any);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{user?.firstName || "Guest"}</Text>
          </View>
          <View style={styles.icons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#111827"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="person-circle-outline"
                size={30}
                color="#111827"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleQuickBooking}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="car" size={24} color="#DC2626" />
              </View>
              <Text style={styles.actionTitle}>Book Ride</Text>
              <Text style={styles.actionSubtitle}>Private or shared</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Ionicons name="airplane" size={24} color="#DC2626" />
              </View>
              <Text style={styles.actionTitle}>Airport Transfer</Text>
              <Text style={styles.actionSubtitle}>To/from airport</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Ionicons name="time" size={24} color="#DC2626" />
              </View>
              <Text style={styles.actionTitle}>Schedule Ride</Text>
              <Text style={styles.actionSubtitle}>Book for later</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Ionicons name="location" size={24} color="#DC2626" />
              </View>
              <Text style={styles.actionTitle}>City Tours</Text>
              <Text style={styles.actionSubtitle}>Explore the city</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Component */}
        <View style={styles.searchSection}>
          <RideSearchComponent onSearch={handleSearch} />
        </View>

        {/* Recent Bookings */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <View style={styles.recentCard}>
            <View style={styles.recentIcon}>
              <Ionicons name="car" size={20} color="#DC2626" />
            </View>
            <View style={styles.recentContent}>
              <Text style={styles.recentTitle}>Airport Transfer</Text>
              <Text style={styles.recentSubtitle}>JFK Airport → Manhattan</Text>
              <Text style={styles.recentDate}>Dec 15, 2024</Text>
            </View>
            <TouchableOpacity style={styles.recentAction}>
              <Text style={styles.recentActionText}>Book Again</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose Our Service</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.featureText}>Safe & Reliable</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="time" size={20} color="#10B981" />
              <Text style={styles.featureText}>24/7 Available</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="card" size={20} color="#10B981" />
              <Text style={styles.featureText}>Easy Payment</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="star" size={20} color="#10B981" />
              <Text style={styles.featureText}>Top Rated Drivers</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  greeting: {
    fontFamily: "RedHatDisplay-Regular",
    fontSize: 18,
    color: "#6B7280",
  },
  name: {
    fontFamily: "RedHatDisplay-Bold",
    fontSize: 24,
    color: "#111827",
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 16,
    padding: 4,
  },
  quickActions: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    fontFamily: "RedHatDisplay-Bold",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#FEF2F2",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
    fontFamily: "RedHatDisplay-Bold",
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontFamily: "RedHatDisplay-Regular",
  },
  searchSection: {
    marginTop: 8,
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    marginTop: 8,
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  recentIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
    fontFamily: "RedHatDisplay-Bold",
  },
  recentSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
    fontFamily: "RedHatDisplay-Regular",
  },
  recentDate: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "RedHatDisplay-Regular",
  },
  recentAction: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  recentActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "RedHatDisplay-Bold",
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    marginBottom: 20,
  },
  featuresList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    fontFamily: "RedHatDisplay-Regular",
  },
});
