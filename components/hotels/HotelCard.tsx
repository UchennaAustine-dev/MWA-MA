import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HotelCardProps {
  hotel: any;
  onPress: () => void;
  formatPrice: (price: number, currency: string) => string;
  getLowestPrice: (hotel: any) => number;
  getCurrency: (hotel: any) => string;
}

function HotelCard({
  hotel,
  onPress,
  formatPrice,
  getLowestPrice,
  getCurrency,
}: HotelCardProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: hotel.images?.[0] }} style={styles.image} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageOverlay}
          />

          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>
              {hotel.hotelRating?.toFixed(1) || "4.0"}
            </Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {hotel.hotelName}
          </Text>

          <View style={styles.location}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {hotel.address.cityName || hotel.address.cityCode},{" "}
              {hotel.address.countryCode}
            </Text>
          </View>

          <Text style={styles.distance}>{hotel.distance}</Text>

          <View style={styles.amenitiesContainer}>
            {hotel.amenities
              ?.slice(0, 3)
              .map((amenity: string, index: number) => (
                <View key={index} style={styles.amenityTag}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
          </View>

          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>From</Text>
              <Text style={styles.price}>
                {formatPrice(getLowestPrice(hotel), getCurrency(hotel))}
              </Text>
              <Text style={styles.priceUnit}>per night</Text>
            </View>
            <TouchableOpacity style={styles.bookButton} onPress={onPress}>
              <Text style={styles.bookButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// Memoize the component
export default memo(HotelCard);

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  imageActions: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  rating: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  distance: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  amenityTag: {
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 12,
    color: "#0369a1",
    fontWeight: "500",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  priceUnit: {
    fontSize: 12,
    color: "#666",
  },
  bookButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
