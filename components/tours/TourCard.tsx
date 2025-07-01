import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Tour {
  type: string;
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  price?: {
    amount: string;
    currencyCode: string;
  };
  pictures?: string[];
  bookingLink: string;
  minimumDuration: string;
}

interface TourCardProps {
  tour: Tour;
  onPress: (tour: Tour) => void;
  index: number;
}

function TourCard({ tour, onPress, index }: TourCardProps) {
  const formatPrice = (amount?: string, currency?: string) => {
    if (!amount || !currency) return "Price on request";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
      }).format(Number.parseFloat(amount));
    } catch {
      return `${currency} ${amount}`;
    }
  };

  const hasValidPrice = tour?.price?.amount && tour?.price?.currencyCode;
  const priceDisplay = formatPrice(
    tour?.price?.amount,
    tour?.price?.currencyCode
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(tour)}
      activeOpacity={0.9}
    >
      {/* Tour Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              tour?.pictures?.[0] ||
              "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
          }}
          style={styles.image}
        />

        {/* Price Badge */}
        <View style={styles.priceBadge}>
          <Text
            style={[
              styles.priceText,
              { color: hasValidPrice ? "#000000" : "#FFFFFF" },
            ]}
          >
            {priceDisplay}
          </Text>
        </View>

        {/* Popular Badge */}
        {index < 3 && (
          <View style={styles.popularBadge}>
            <Ionicons name="trending-up" size={12} color="#FFFFFF" />
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
      </View>

      {/* Tour Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {tour.name}
        </Text>

        <Text style={styles.description} numberOfLines={3}>
          {tour?.shortDescription}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={16} color="#666666" />
            <View style={styles.coordinates}>
              <Text style={styles.coordinateText}>
                {tour?.geoCode?.latitude?.toFixed(2)},{" "}
                {tour?.geoCode?.longitude?.toFixed(2)}
              </Text>
            </View>
          </View>

          {tour.minimumDuration && (
            <View style={styles.durationInfo}>
              <Ionicons name="time-outline" size={16} color="#666666" />
              <Text style={styles.durationText}>{tour.minimumDuration}</Text>
            </View>
          )}
        </View>

        <View style={styles.ratingRow}>
          <View style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={14}
                color={i < 4 ? "#DC2626" : "#E5E5E5"}
              />
            ))}
          </View>
          <Text style={styles.reviewText}>(4.2) • 156 reviews</Text>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => onPress(tour)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default memo(TourCard);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  priceBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#DC2626",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  popularText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  coordinates: {
    flex: 1,
  },
  coordinateText: {
    fontSize: 12,
    color: "#666666",
  },
  durationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: "#666666",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    fontSize: 12,
    color: "#666666",
  },
  viewButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
