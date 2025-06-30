import {
  emptyUserFlightCart,
  getUserCart,
  removeFlightFromCart,
} from "@/lib/flightAPIs";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
// import { clearCart, removeFromCart } from "../redux/slices/globalSlice";
import { clearCart, removeFromCart } from "@/redux/slices/cartSlice";
import type { AppDispatch, RootState } from "../redux/store";

export default function CartScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);

  const guestCart = useSelector((state: RootState) => state.cart.cartItems);

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isEmptyingCart, setIsEmptyingCart] = useState(false);

  console.log("[Init] User:", user);
  console.log("[Init] Guest cart from Redux:", guestCart);

  // Fetch cart data
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        console.log("[Cart] Fetching cart data...");
        if (user?.id) {
          // Fetch from API for logged-in users
          const userCart = await getUserCart(user?.id);
          console.log("[Cart] User cart from API:", userCart);
          setCartItems(userCart);
        } else {
          // Use Redux state for guest users
          setCartItems(guestCart);
          console.log("[Cart] Guest cart set from Redux:", guestCart);
        }
      } catch (error) {
        console.error("[Cart] Error fetching cart:", error);
        Alert.alert("Error", "Failed to load cart items");
      } finally {
        setLoading(false);
        console.log("[Cart] Done loading cart data.");
      }
    };

    fetchCartData();
  }, [user?.id, guestCart]);

  const formatCurrency = (amount: any, currency = "NGN") => {
    const symbol = currency === "NGN" ? "₦" : "$";
    const formatted = `${symbol}${Number(amount).toLocaleString()}`;
    console.log("[formatCurrency]", formatted);
    return formatted;
  };

  const formatTime = (isoString: string) => {
    const formatted = new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    console.log("[formatTime]", isoString, "->", formatted);
    return formatted;
  };

  const formatDate = (isoString: string) => {
    const formatted = new Date(isoString).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    console.log("[formatDate]", isoString, "->", formatted);
    return formatted;
  };

  const getFlightData = (cartItem: any) => {
    let result;
    if (cartItem?.flightData?.flightData) {
      result = cartItem.flightData.flightData;
    } else if (cartItem?.flightData) {
      result = cartItem.flightData;
    } else {
      result = cartItem;
    }
    console.log("[getFlightData] For cartItem:", cartItem, "->", result);
    return result;
  };

  const handleRemoveItem = async (cartId: string) => {
    try {
      setRemovingId(cartId);
      console.log("[RemoveItem] Removing cart item:", cartId);

      if (user?.id) {
        // Remove from API for logged-in users
        await removeFlightFromCart(cartId);
        const updatedCart = await getUserCart(user.id);
        setCartItems(updatedCart);
        console.log(
          "[RemoveItem] Updated user cart after removal:",
          updatedCart
        );
      } else {
        // Remove from Redux for guest users
        dispatch(removeFromCart(cartId));
        setCartItems((prev) => prev.filter((item) => item.id !== cartId));
        console.log("[RemoveItem] Updated guest cart after removal:", cartId);
      }

      Alert.alert("Success", "Flight removed from cart");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to remove item");
      console.error("[RemoveItem] Error:", error);
    } finally {
      setRemovingId(null);
      console.log("[RemoveItem] Done removing cart item:", cartId);
    }
  };

  const handleEmptyCart = async () => {
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
              console.log("[EmptyCart] Emptying cart...");

              if (user?.id) {
                await emptyUserFlightCart(user.id);
                setCartItems([]);
                console.log("[EmptyCart] User cart emptied via API.");
              } else {
                dispatch(clearCart());
                setCartItems([]);
                console.log("[EmptyCart] Guest cart emptied via Redux.");
              }

              Alert.alert("Success", "Cart has been emptied");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to empty cart");
              console.error("[EmptyCart] Error:", error);
            } finally {
              setIsEmptyingCart(false);
              console.log("[EmptyCart] Done emptying cart.");
            }
          },
        },
      ]
    );
  };

  const calculateTotal = () => {
    const total = cartItems.reduce((total, item) => {
      const flightData = getFlightData(item);
      const price =
        flightData?.price?.total || flightData?.price?.grandTotal || 0;
      return total + Number(price);
    }, 0);
    console.log("[calculateTotal] Cart total:", total);
    return total;
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add flights to your cart before proceeding"
      );
      console.warn("[Checkout] Attempted with empty cart.");
      return;
    }
    console.log("[Checkout] Proceeding to traveler details...");
    router.push("/traveler-details");
  };

  const renderCartItem = ({ item, index }: { item: any; index: number }) => {
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
        {/* Flight Route Header */}
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
          >
            {removingId === item.id ? (
              <ActivityIndicator size="small" color="#d32f2f" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#d32f2f" />
            )}
          </TouchableOpacity>
        </View>

        {/* Flight Details */}
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

        {/* Stops Info */}
        <Text style={styles.stopsInfo}>
          {itinerary.segments.length === 1
            ? "Non-stop"
            : `${itinerary.segments.length - 1} stop(s)`}
        </Text>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatCurrency(price, currency)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity
            onPress={handleEmptyCart}
            disabled={isEmptyingCart}
            style={styles.clearButton}
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
          >
            <Text style={styles.searchButtonText}>Search Flights</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Cart Items */}
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item, index) => item.id || index.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Summary Footer */}
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
            >
              <Text style={styles.checkoutButtonText}>
                Proceed to Traveler Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push("/flights")}
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
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
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
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  searchButton: {
    backgroundColor: "#007AFF",
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
    color: "#333",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
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
    color: "#333",
  },
  airport: {
    fontSize: 12,
    color: "#666",
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
    backgroundColor: "#007AFF",
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
    paddingHorizontal: 8,
  },
  stopsInfo: {
    fontSize: 12,
    color: "#666",
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
    color: "#666",
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
    color: "#333",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  checkoutButton: {
    backgroundColor: "#007AFF",
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
    backgroundColor: "#f0f0f0",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
});
