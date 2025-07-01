import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// Utils
import WebView from "react-native-webview";
import { baseURL } from "../lib/api";

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
  price: {
    amount: string;
    currencyCode: string;
  };
  pictures: string[];
  bookingLink: string;
  minimumDuration: string;
}

// const { width: screenWidth } = Dimensions.get("window");
const { width: screenWidth } = useWindowDimensions();

export default function TourDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // State
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Load tour data
  useEffect(() => {
    const loadTourData = () => {
      try {
        if (params.tourData) {
          const tourData = JSON.parse(params.tourData as string);
          setTour(tourData);
          setLoading(false);
        } else if (params.tourId) {
          fetchTourDetails(params.tourId as string).finally(() =>
            setLoading(false)
          );
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading tour data:", error);
        Alert.alert("Error", "Failed to load tour details");
        setLoading(false);
      }
    };

    loadTourData();
  }, [params.tourData, params.tourId]); // ✅ Safe dependency

  // Fetch tour details from API
  const fetchTourDetails = async (tourId: string) => {
    try {
      const response = await fetch(`${baseURL}/tours/${tourId}`);
      const data = await response.json();
      console.log(`Deatils Data`, data);

      setTour(data.data);
    } catch (error) {
      console.error("Error fetching tour details:", error);
      Alert.alert("Error", "Failed to fetch tour details");
    }
  };

  // Format price
  const formatPrice = useCallback((amount: string, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
      }).format(Number.parseFloat(amount));
    } catch {
      return `${currency} ${amount}`;
    }
  }, []);

  // Handle image navigation
  const nextImage = useCallback(() => {
    if (!tour) return;
    setCurrentImageIndex((prev) =>
      prev === tour.pictures.length - 1 ? 0 : prev + 1
    );
  }, [tour]);

  const prevImage = useCallback(() => {
    if (!tour) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? tour.pictures.length - 1 : prev - 1
    );
  }, [tour]);

  // Handle booking
  const handleBooking = useCallback(async () => {
    if (!tour?.bookingLink) return;

    try {
      const supported = await Linking.canOpenURL(tour.bookingLink);
      if (supported) {
        await Linking.openURL(tour.bookingLink);
      } else {
        Alert.alert("Error", "Cannot open booking link");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open booking link");
    }
  }, [tour]);

  // Handle favorite toggle
  const toggleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading tour details...</Text>
      </View>
    );
  }

  if (!tour) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#666666" />
        <Text style={styles.errorTitle}>Tour Not Found</Text>
        <Text style={styles.errorText}>
          The tour you're looking for could not be found.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#DC2626" : "#000000"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth
              );
              setCurrentImageIndex(index);
            }}
          >
            {tour.pictures.map((picture, index) => (
              <Image
                key={index}
                source={{
                  uri:
                    picture ||
                    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
                }}
                style={styles.image}
              />
            ))}
          </ScrollView>

          {/* Image Navigation */}
          {tour.pictures.length > 1 && (
            <>
              <TouchableOpacity style={styles.prevButton} onPress={prevImage}>
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextButton} onPress={nextImage}>
                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}

          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1} / {tour.pictures.length}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Rating */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{tour.name}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name="star"
                    size={16}
                    color={i < 4 ? "#DC2626" : "#E5E5E5"}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>(4.2) • 156 reviews</Text>
            </View>
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={16} color="#DC2626" />
              <Text style={styles.infoText}>
                {tour.geoCode.latitude.toFixed(4)},{" "}
                {tour.geoCode.longitude.toFixed(4)}
              </Text>
            </View>
            {tour.minimumDuration && (
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color="#DC2626" />
                <Text style={styles.infoText}>{tour.minimumDuration}</Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={16} color="#DC2626" />
              <Text style={styles.infoText}>Small group</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.description}>{tour.shortDescription}</Text>
          </View>

          {/* Full Description */}
          <View style={{ height: 400, marginBottom: 20 }}>
            <WebView
              originWhitelist={["*"]}
              source={{
                html: `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-size: 16px;
                color: #666666;
                line-height: 1.6;
                padding: 10px;
                margin: 0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
              }
            </style>
          </head>
          <body>
            ${tour.description || "<p>No description available.</p>"}
          </body>
        </html>
      `,
              }}
              style={{ flex: 1 }}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* What's Included */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            <View style={styles.includedList}>
              {[
                "Professional tour guide",
                "Transportation",
                "Entry tickets",
                "Refreshments",
                "Photo opportunities",
                "Small group experience",
              ].map((item, index) => (
                <View key={index} style={styles.includedItem}>
                  <View style={styles.includedDot} />
                  <Text style={styles.includedText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Booking Footer */}
      <View style={styles.bookingFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.price}>
            {formatPrice(tour.price.amount, tour.price.currencyCode)}
          </Text>
          <Text style={styles.priceUnit}>per person</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    position: "relative",
  },
  image: {
    width: screenWidth,
    height: 300,
  },
  prevButton: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCounter: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: "#666666",
  },
  quickInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#666666",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 24,
  },
  includedList: {
    gap: 8,
  },
  includedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  includedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DC2626",
  },
  includedText: {
    fontSize: 16,
    color: "#666666",
  },
  bookingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  priceContainer: {
    alignItems: "flex-start",
  },
  priceLabel: {
    fontSize: 12,
    color: "#666666",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#DC2626",
  },
  priceUnit: {
    fontSize: 12,
    color: "#666666",
  },
  bookButton: {
    backgroundColor: "#DC2626",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
