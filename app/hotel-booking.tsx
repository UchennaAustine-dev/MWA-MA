import { BookingFormData, HotelBookingData } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PhoneInput from "../components/PhoneInput";
import { baseURL } from "../lib/api";

export default function HotelBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [bookingData, setBookingData] = useState<HotelBookingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});

  // Memoize initial formData based on bookingData
  const initialFormData = useMemo<BookingFormData>(
    () => ({
      guests: [
        {
          tid: 1,
          title: "MR",
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
        },
      ],
      travelAgent: {
        contact: {
          email: "",
        },
      },
      roomAssociations: bookingData?.offer?.id
        ? [
            {
              guestReferences: [
                {
                  guestReference: "1",
                },
              ],
              hotelOfferId: bookingData.offer.id,
            },
          ]
        : [
            {
              guestReferences: [
                {
                  guestReference: "1",
                },
              ],
              hotelOfferId: "",
            },
          ],
      payment: {
        method: "CREDIT_CARD",
        paymentCard: {
          paymentCardInfo: {
            vendorCode: "VI",
            cardNumber: "",
            expiryDate: "",
            holderName: "",
          },
        },
      },
    }),
    [bookingData?.offer?.id]
  );

  // Use the memoized initialFormData
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);

  // Sync formData when bookingData changes
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        if (params.bookingData) {
          const data =
            typeof params.bookingData === "string"
              ? JSON.parse(params.bookingData)
              : params.bookingData;
          setBookingData(data as HotelBookingData);
        } else {
          const storedData = await AsyncStorage.getItem("hotelBookingData");
          if (storedData) {
            setBookingData(JSON.parse(storedData));
          } else {
            Alert.alert("Error", "No booking data found", [
              { text: "OK", onPress: () => router.back() },
            ]);
          }
        }
      } catch (error) {
        console.error("Error loading booking data:", error);
        Alert.alert("Error", "Failed to load booking data", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    };

    loadBookingData();
  }, [params, router]);

  // --- Validation and input handling ---
  const validateForm = () => {
    const newErrors: any = {};

    const guest = formData.guests[0];
    if (!guest.firstName.trim()) newErrors.firstName = "First name is required";
    if (!guest.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!guest.email.trim()) newErrors.email = "Email is required";
    if (!guest.phone.trim()) newErrors.phone = "Phone is required";

    const payment = formData.payment.paymentCard.paymentCardInfo;
    if (!payment.cardNumber.trim())
      newErrors.cardNumber = "Card number is required";
    if (!payment.expiryDate.trim())
      newErrors.expiryDate = "Expiry date is required";
    if (!payment.holderName.trim())
      newErrors.holderName = "Cardholder name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: string,
    value: string,
    section?: string
  ) => {
    if (section === "guest") {
      setFormData((prev) => ({
        ...prev,
        guests: [
          {
            ...prev.guests[0],
            [field]: value,
          },
        ],
        travelAgent: {
          contact: {
            email: field === "email" ? value : prev.travelAgent.contact.email,
          },
        },
      }));
    } else if (section === "payment") {
      setFormData((prev) => ({
        ...prev,
        payment: {
          ...prev.payment,
          paymentCard: {
            paymentCardInfo: {
              ...prev.payment.paymentCard.paymentCardInfo,
              [field]: value,
            },
          },
        },
      }));
    }
  };

  // --- Booking logic ---
  const bookHotel = async () => {
    const response = await fetch(`${baseURL}/hotel/book-hotel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          type: "hotel-order",
          ...formData,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Booking failed");
    }

    return result;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleBooking = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await bookHotel();

      if (response && response.success) {
        setBookingResult(response);
        await AsyncStorage.removeItem("hotelBookingData");
        Alert.alert("Success", "Booking confirmed successfully!");
      } else {
        setErrors({
          submit: response?.message || "Booking failed. Please try again.",
        });
        Alert.alert("Error", "Booking failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      const errorMessage = error.message || "Network error. Please try again.";
      setErrors({ submit: errorMessage });
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (bookingResult) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your hotel reservation has been successfully completed.
          </Text>

          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking Reference:</Text>
              <Text style={styles.detailValue}>
                {bookingResult.booking.referenceId}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hotel:</Text>
              <Text style={styles.detailValue}>
                {bookingData.hotel.hotelName}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount:</Text>
              <Text style={styles.detailValue}>
                {bookingResult.booking.currency}{" "}
                {bookingResult.booking.totalAmount}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, styles.statusSuccess]}>
                {bookingResult.booking.status}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push("/(tabs)/hotels")}
            >
              <Text style={styles.secondaryButtonText}>Book Another Hotel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const nights = calculateNights(
    bookingData.offer.checkInDate,
    bookingData.offer.checkOutDate
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#dc2626" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hotel Details Card */}
        <View style={styles.card}>
          <Image
            source={{
              uri:
                bookingData.hotel.images[0] ||
                "https://via.placeholder.com/300x200",
            }}
            style={styles.hotelImage}
          />
          <Text style={styles.hotelName}>{bookingData.hotel.hotelName}</Text>

          <View style={styles.ratingContainer}>
            {Array.from({
              length: Math.floor(bookingData.hotel.hotelRating),
            }).map((_, i) => (
              <Ionicons key={i} name="star" size={16} color="#fbbf24" />
            ))}
            <Text style={styles.ratingText}>
              {bookingData.hotel.hotelRating.toFixed(1)}
            </Text>
          </View>

          <Text style={styles.address}>
            {bookingData.hotel.address.fullAddress}
          </Text>

          <View style={styles.bookingInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Check-in:</Text>
              <Text style={styles.infoValue}>
                {formatDate(bookingData.offer.checkInDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Check-out:</Text>
              <Text style={styles.infoValue}>
                {formatDate(bookingData.offer.checkOutDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nights:</Text>
              <Text style={styles.infoValue}>{nights} nights</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Guests:</Text>
              <Text style={styles.infoValue}>
                {bookingData.searchParams.adults} adult(s)
              </Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.totalPrice}>
              Total: {bookingData.offer.price.currency}{" "}
              {bookingData.offer.price.total}
            </Text>
            <Text style={styles.priceNote}>Includes taxes and fees</Text>
          </View>
        </View>

        {/* Guest Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Guest Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <View style={styles.pickerContainer}>
              <TextInput
                style={styles.input}
                value={formData.guests[0].title}
                editable={false}
                placeholder="Mr."
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name *</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              value={formData.guests[0].firstName}
              onChangeText={(value) =>
                handleInputChange("firstName", value, "guest")
              }
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name *</Text>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              value={formData.guests[0].lastName}
              onChangeText={(value) =>
                handleInputChange("lastName", value, "guest")
              }
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.guests[0].email}
              onChangeText={(value) =>
                handleInputChange("email", value, "guest")
              }
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <PhoneInput
              value={formData.guests[0].phone || ""}
              onChange={(value: string) =>
                handleInputChange("phone", value, "guest")
              }
              placeholder="Enter mobile number"
              error={!!errors.phone}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cardholder Name *</Text>
            <TextInput
              style={[styles.input, errors.holderName && styles.inputError]}
              value={formData.payment.paymentCard.paymentCardInfo.holderName}
              onChangeText={(value) =>
                handleInputChange("holderName", value, "payment")
              }
              placeholder="Name as it appears on card"
            />
            {errors.holderName && (
              <Text style={styles.errorText}>{errors.holderName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number *</Text>
            <TextInput
              style={[styles.input, errors.cardNumber && styles.inputError]}
              value={formData.payment.paymentCard.paymentCardInfo.cardNumber}
              onChangeText={(value) =>
                handleInputChange("cardNumber", value, "payment")
              }
              placeholder="Card number"
              keyboardType="number-pad"
              maxLength={16}
            />
            {errors.cardNumber && (
              <Text style={styles.errorText}>{errors.cardNumber}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Expiry Date *</Text>
            <TextInput
              style={[styles.input, errors.expiryDate && styles.inputError]}
              value={formData.payment.paymentCard.paymentCardInfo.expiryDate}
              onChangeText={(value) =>
                handleInputChange("expiryDate", value, "payment")
              }
              placeholder="MM/YY"
              maxLength={5}
            />
            {errors.expiryDate && (
              <Text style={styles.errorText}>{errors.expiryDate}</Text>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleBooking}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
          {errors.submit && (
            <Text style={styles.errorText}>{errors.submit}</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#dc2626",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hotelImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6b7280",
  },
  address: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  bookingInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  priceContainer: {
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 8,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 4,
  },
  priceNote: {
    fontSize: 12,
    color: "#dc2626",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  row: {
    flexDirection: "row",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 16,
  },
  termsText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#dc2626",
  },
  secondaryButton: {
    backgroundColor: "#6b7280",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  loadingButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: 20,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
    textAlign: "center",
  },
  bookingDetails: {
    backgroundColor: "#f9fafb",
    padding: 20,
    borderRadius: 8,
    width: "100%",
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  statusSuccess: {
    color: "#10b981",
    fontWeight: "600",
  },
});
