import { LinearGradient } from "expo-linear-gradient";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FeaturedDestinationsProps {
  destinations: any[];
  onDestinationPress?: (destination: any) => void;
}

export default function FeaturedDestinations({
  destinations,
  onDestinationPress,
}: FeaturedDestinationsProps) {
  const renderDestination = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.destinationCard}
      activeOpacity={0.8}
      onPress={() => onDestinationPress?.(item)}
    >
      <Image source={{ uri: item.image }} style={styles.destinationImage} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.destinationOverlay}
      />
      <View style={styles.destinationInfo}>
        <Text style={styles.destinationName}>{item.name}</Text>
        <Text style={styles.destinationCountry}>{item.country}</Text>
        <Text style={styles.destinationHotels}>{item.hotels}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Popular Destinations</Text>
      <FlatList
        data={destinations}
        renderItem={renderDestination}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.destinationsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    fontFamily: "RedHatDisplay-Bold",
  },
  destinationsList: {
    paddingRight: 20,
  },
  destinationCard: {
    width: 200,
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  destinationImage: {
    width: "100%",
    height: "100%",
  },
  destinationOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  destinationInfo: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
    fontFamily: "RedHatDisplay-Bold",
  },
  destinationCountry: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
    fontFamily: "RedHatDisplay-Regular",
  },
  destinationHotels: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "RedHatDisplay-Regular",
  },
});
