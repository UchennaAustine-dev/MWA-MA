import {
  emptyUserFlightCart,
  getUserCart,
  removeFlightFromCart,
} from "@/lib/flightAPIs";
import { clearCart, removeFromCart } from "@/redux/slices/cartSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";

export default function CartScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isEmptyingCart, setIsEmptyingCart] = useState(false);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const userCart = await getUserCart(user.id);
          setCartItems(userCart);
        }
      } catch {
        Alert.alert("Error", "Failed to load cart items");
      } finally {
        setLoading(false);
      }
    };
    fetchCartData();
  }, [user?.id]);

  const formatCurrency = (amount: any, currency = "NGN") => {
    const symbol = currency === "NGN" ? "₦" : "$";
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const getFlightData = (cartItem: any) => {
    if (cartItem?.flightData?.flightData) return cartItem.flightData.flightData;
    if (cartItem?.flightData) return cartItem.flightData;
    return cartItem;
  };

  const handleRemoveItem = async (cartId: string) => {
    try {
      setRemovingId(cartId);
      if (user?.id) {
        await removeFlightFromCart(cartId);
        const updatedCart = await getUserCart(user.id);
        setCartItems(updatedCart);
      } else {
        dispatch(removeFromCart(cartId));
        setCartItems((prev) => prev.filter((item) => item.id !== cartId));
      }
      Alert.alert("Success", "Flight removed from cart");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleEmptyCart = () => {
    Alert.alert(
      "Empty Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Empty Cart",
          style: "destructive",
          onPress: async () => {
            try {
              setIsEmptyingCart(true);
              if (user?.id) {
                await emptyUserFlightCart(user.id);
                setCartItems([]);
              } else {
                dispatch(clearCart());
                setCartItems([]);
              }
              Alert.alert("Success", "Cart has been emptied");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to empty cart");
            } finally {
              setIsEmptyingCart(false);
            }
          },
        },
      ]
    );
  };

  const calculateTotal = () =>
    cartItems.reduce((total, item) => {
      const flightData = getFlightData(item);
      const price =
        flightData?.price?.total || flightData?.price?.grandTotal || 0;
      return total + Number(price);
    }, 0);

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add flights to your cart before proceeding"
      );
      return;
    }
    router.push("/traveler-details");
  };

  const renderCartItem = ({ item }: { item: any }) => {
    const flightData = getFlightData(item);
    if (!flightData) {
      return (
        <View style={styles.cartItem}>
          <Text style={styles.errorText}>Flight data unavailable</Text>
          <TouchableOpacity
            onPress={() => handleRemoveItem(item.id)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const itinerary = flightData.itineraries?.[0];
    if (!itinerary) return null;

    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    const price = flightData.price?.total || flightData.price?.grandTotal || 0;
    const currency = flightData.price?.currency || "NGN";

    return (
      <View style={styles.cartItem}>
        <View style={styles.routeHeader}>
          <View style={styles.routeInfo}>
            <Text style={styles.routeText}>
              {firstSegment.departure.iataCode} → {lastSegment.arrival.iataCode}
            </Text>
            <Text style={styles.dateText}>
              {formatDate(firstSegment.departure.at)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveItem(item.id)}
            disabled={removingId === item.id}
            style={styles.removeIconButton}
            accessibilityRole="button"
            accessibilityLabel="Remove flight from cart"
          >
            {removingId === item.id ? (
              <ActivityIndicator size="small" color="#d32f2f" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#d32f2f" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.flightDetails}>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>
              {formatTime(firstSegment.departure.at)}
            </Text>
            <Text style={styles.airport}>
              {firstSegment.departure.iataCode}
            </Text>
          </View>

          <View style={styles.flightPath}>
            <View style={styles.dot} />
            <View style={styles.line} />
            <Text style={styles.duration}>
              {itinerary.duration?.replace("PT", "").toLowerCase() || ""}
            </Text>
            <View style={styles.line} />
            <View style={styles.dot} />
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.time}>
              {formatTime(lastSegment.arrival.at)}
            </Text>
            <Text style={styles.airport}>{lastSegment.arrival.iataCode}</Text>
          </View>
        </View>

        <Text style={styles.stopsInfo}>
          {itinerary.segments.length === 1
            ? "Non-stop"
            : `${itinerary.segments.length - 1} stop(s)`}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatCurrency(price, currency)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d32f2f" />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity
            onPress={handleEmptyCart}
            disabled={isEmptyingCart}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear all items from cart"
          >
            {isEmptyingCart ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.clearButtonText}>Clear All</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="airplane" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Start by searching for flights to add them to your cart.
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push("/flights")}
            accessibilityRole="button"
            accessibilityLabel="Search flights"
          >
            <Text style={styles.searchButtonText}>Search Flights</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item, index) => item.id || index.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.summaryContainer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>
                Total ({cartItems.length} flight
                {cartItems.length > 1 ? "s" : ""})
              </Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(
                  calculateTotal(),
                  cartItems[0]
                    ? getFlightData(cartItems[0])?.price?.currency
                    : "NGN"
                )}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleProceedToCheckout}
              accessibilityRole="button"
              accessibilityLabel="Proceed to traveler details"
            >
              <Text style={styles.checkoutButtonText}>
                Proceed to Traveler Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push("/flights")}
              accessibilityRole="button"
              accessibilityLabel="Continue shopping"
            >
              <Text style={styles.continueButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#d32f2f",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#000",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  searchButton: {
    backgroundColor: "#d32f2f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
  },
  cartItem: {
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
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  dateText: {
    fontSize: 14,
    color: "#333",
    marginTop: 2,
  },
  removeIconButton: {
    padding: 8,
  },
  flightDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeContainer: {
    alignItems: "center",
  },
  time: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  airport: {
    fontSize: 12,
    color: "#333",
    marginTop: 2,
  },
  flightPath: {
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
    color: "#333",
    paddingHorizontal: 8,
  },
  stopsInfo: {
    fontSize: 12,
    color: "#333",
    marginBottom: 8,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  errorText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "center",
  },
  removeButtonText: {
    color: "#d32f2f",
    fontSize: 12,
    fontWeight: "500",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  checkoutButton: {
    backgroundColor: "#d32f2f",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
