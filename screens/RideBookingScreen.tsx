import { baseURL } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCustomFonts } from "../hooks/useCustomFonts";

const { width } = Dimensions.get("window");

interface PassengerCharacteristic {
  passengerTypeCode: "ADT" | "CHD" | "INF";
  age?: number;
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface BookingData {
  startLocationCode: string;
  endAddressLine: string;
  endCityName?: string;
  endZipCode?: string;
  endCountryCode?: string;
  endName?: string;
  endGeoCode?: string;
  transferType: "PRIVATE" | "SHARED";
  startDateTime: string;
  passengers: number;
  passengerCharacteristics: PassengerCharacteristic[];
  contactInfo: ContactInfo;
  stopOvers?: any[];
  startConnectedSegment?: any;
}

interface LocationSuggestion {
  name: string;
  iataCode?: string;
  code?: string;
  cityName?: string;
  city?: string;
  countryName?: string;
  country?: string;
}

export default function RideBookingScreen() {
  const [fontsLoaded] = useCustomFonts();

  // Form state
  const [bookingData, setBookingData] = useState<BookingData>({
    startLocationCode: "",
    endAddressLine: "",
    endCityName: "",
    endZipCode: "",
    endCountryCode: "",
    endName: "",
    transferType: "PRIVATE",
    startDateTime: "",
    passengers: 1,
    passengerCharacteristics: [{ passengerTypeCode: "ADT" }],
    contactInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});
  const [showPickupSearch, setShowPickupSearch] = useState(false);
  const [pickupQuery, setPickupQuery] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Handle pickup location search
  const handlePickupSearch = async (keyword: string) => {
    setPickupQuery(keyword);
    if (keyword.length < 2) {
      setPickupSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch(
        `${baseURL}/flight/search?keyword=${keyword}`
      );
      const data = await response.json();
      setPickupSuggestions(data || []);
    } catch (error) {
      console.log("Error fetching location suggestions:", error);
      setPickupSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle pickup location selection
  const handlePickupSelect = (location: LocationSuggestion) => {
    const locationCode = location?.iataCode || location?.code || "";
    const locationName = location?.name || "";
    setBookingData({
      ...bookingData,
      startLocationCode: locationCode,
    });
    setPickupQuery(`${locationName} (${locationCode})`);
    setShowPickupSearch(false);
    setPickupSuggestions([]);
  };

  // Handle passenger count changes
  const updatePassengerCount = (increment: boolean) => {
    const newCount = increment
      ? bookingData.passengers + 1
      : Math.max(1, bookingData.passengers - 1);
    const newCharacteristics = Array.from({ length: newCount }, (_, i) => ({
      passengerTypeCode: "ADT" as const,
      age:
        i < bookingData.passengerCharacteristics.length
          ? bookingData.passengerCharacteristics[i].age
          : undefined,
    }));
    setBookingData({
      ...bookingData,
      passengers: newCount,
      passengerCharacteristics: newCharacteristics,
    });
  };

  // Validate form
  const validateStep = (step: number) => {
    const newErrors: any = {};
    if (step === 1) {
      if (!bookingData.startLocationCode)
        newErrors.pickup = "Pickup location is required";
      if (!bookingData.endAddressLine)
        newErrors.destination = "Destination address is required";
      if (!bookingData.startDateTime)
        newErrors.datetime = "Date and time are required";
    }
    if (step === 2) {
      if (!bookingData.contactInfo.firstName)
        newErrors.firstName = "First name is required";
      if (!bookingData.contactInfo.lastName)
        newErrors.lastName = "Last name is required";
      if (!bookingData.contactInfo.email) newErrors.email = "Email is required";
      if (!bookingData.contactInfo.phone)
        newErrors.phone = "Phone number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleBooking = async () => {
    if (!validateStep(2)) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${baseURL}/cars/search-cars`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: bookingData }),
      });
      const result = await response.json();
      if (response.ok) {
        setBookingResult(result);
        Alert.alert("Success", "Booking confirmed successfully!");
      } else {
        Alert.alert("Error", result.message || "Booking failed");
        setErrors({ submit: result.message || "Booking failed" });
      }
    } catch (error: any) {
      Alert.alert("Error", "Network error. Please try again.");
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setBookingData({
        ...bookingData,
        startDateTime: selectedDate.toISOString(),
      });
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (bookingResult) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.successContainer}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successSubtitle}>
              Your car transfer has been successfully booked.
            </Text>

            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Booking Reference:</Text>
                <Text style={styles.detailValue}>
                  {bookingResult.booking.referenceId}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[styles.detailValue, styles.statusActive]}>
                  {bookingResult.booking.status}
                </Text>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                  <Text style={styles.routeLabel}>Pickup</Text>
                  <Text style={styles.routeValue}>
                    {bookingData.startLocationCode}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#6B7280" />
                <View style={styles.routePoint}>
                  <Text style={styles.routeLabel}>Destination</Text>
                  <Text style={styles.routeValue}>
                    {bookingData.endAddressLine}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => {
                  /* Handle print */
                }}
              >
                <Text style={styles.secondaryButtonText}>
                  Print Confirmation
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => {
                  setBookingResult(null);
                  setCurrentStep(1);
                  setBookingData({
                    startLocationCode: "",
                    endAddressLine: "",
                    endCityName: "",
                    endZipCode: "",
                    endCountryCode: "",
                    endName: "",
                    transferType: "PRIVATE",
                    startDateTime: "",
                    passengers: 1,
                    passengerCharacteristics: [{ passengerTypeCode: "ADT" }],
                    contactInfo: {
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                    },
                  });
                }}
              >
                <Text style={styles.primaryButtonText}>
                  Book Another Transfer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="car" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Ride Booking</Text>
            <Text style={styles.headerSubtitle}>
              Book your private or shared transfer
            </Text>
          </View>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <View style={styles.progressSteps}>
            <View style={styles.stepContainer}>
              <View
                style={[
                  styles.stepCircle,
                  currentStep >= 1 && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    currentStep >= 1 && styles.stepNumberActive,
                  ]}
                >
                  1
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  currentStep >= 1 && styles.stepLabelActive,
                ]}
              >
                Trip Details
              </Text>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepContainer}>
              <View
                style={[
                  styles.stepCircle,
                  currentStep >= 2 && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    currentStep >= 2 && styles.stepNumberActive,
                  ]}
                >
                  2
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  currentStep >= 2 && styles.stepLabelActive,
                ]}
              >
                Contact Info
              </Text>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepContainer}>
              <View
                style={[
                  styles.stepCircle,
                  currentStep >= 3 && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    currentStep >= 3 && styles.stepNumberActive,
                  ]}
                >
                  3
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  currentStep >= 3 && styles.stepLabelActive,
                ]}
              >
                Confirmation
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Step 1: Trip Details */}
          {currentStep === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Trip Details</Text>

              {/* Pickup Location */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="location" size={16} color="#DC2626" /> Pickup
                  Location *
                </Text>
                <TouchableOpacity
                  style={[styles.input, errors.pickup && styles.inputError]}
                  onPress={() => setShowPickupSearch(true)}
                >
                  <Text
                    style={[
                      styles.inputText,
                      !pickupQuery && styles.inputPlaceholder,
                    ]}
                  >
                    {pickupQuery ||
                      "Search airports, cities, or enter location code..."}
                  </Text>
                  <Ionicons name="search" size={20} color="#6B7280" />
                </TouchableOpacity>
                {errors.pickup && (
                  <Text style={styles.errorText}>{errors.pickup}</Text>
                )}
              </View>

              {/* Destination */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="location" size={16} color="#DC2626" />{" "}
                  Destination Address *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.destination && styles.inputError,
                  ]}
                  value={bookingData.endAddressLine}
                  onChangeText={(text) =>
                    setBookingData({
                      ...bookingData,
                      endAddressLine: text,
                    })
                  }
                  placeholder="Enter full destination address..."
                  placeholderTextColor="#9CA3AF"
                />
                {errors.destination && (
                  <Text style={styles.errorText}>{errors.destination}</Text>
                )}
              </View>

              {/* Additional Destination Details */}
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={bookingData.endCityName || ""}
                    onChangeText={(text) =>
                      setBookingData({
                        ...bookingData,
                        endCityName: text,
                      })
                    }
                    placeholder="City name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Zip Code</Text>
                  <TextInput
                    style={styles.input}
                    value={bookingData.endZipCode || ""}
                    onChangeText={(text) =>
                      setBookingData({
                        ...bookingData,
                        endZipCode: text,
                      })
                    }
                    placeholder="Postal code"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Date and Time */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="calendar" size={16} color="#DC2626" /> Pickup
                  Date & Time *
                </Text>
                <TouchableOpacity
                  style={[styles.input, errors.datetime && styles.inputError]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={[
                      styles.inputText,
                      !bookingData.startDateTime && styles.inputPlaceholder,
                    ]}
                  >
                    {bookingData.startDateTime
                      ? new Date(bookingData.startDateTime).toLocaleString()
                      : "Select date and time"}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#6B7280" />
                </TouchableOpacity>
                {errors.datetime && (
                  <Text style={styles.errorText}>{errors.datetime}</Text>
                )}
              </View>

              {/* Transfer Type */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Transfer Type</Text>
                <View style={styles.transferTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.transferTypeButton,
                      bookingData.transferType === "PRIVATE" &&
                        styles.transferTypeButtonActive,
                    ]}
                    onPress={() =>
                      setBookingData({
                        ...bookingData,
                        transferType: "PRIVATE",
                      })
                    }
                  >
                    <Ionicons
                      name="car"
                      size={24}
                      color={
                        bookingData.transferType === "PRIVATE"
                          ? "#DC2626"
                          : "#6B7280"
                      }
                    />
                    <Text
                      style={[
                        styles.transferTypeText,
                        bookingData.transferType === "PRIVATE" &&
                          styles.transferTypeTextActive,
                      ]}
                    >
                      Private
                    </Text>
                    <Text style={styles.transferTypeSubtext}>
                      Exclusive vehicle
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.transferTypeButton,
                      bookingData.transferType === "SHARED" &&
                        styles.transferTypeButtonActive,
                    ]}
                    onPress={() =>
                      setBookingData({
                        ...bookingData,
                        transferType: "SHARED",
                      })
                    }
                  >
                    <Ionicons
                      name="people"
                      size={24}
                      color={
                        bookingData.transferType === "SHARED"
                          ? "#DC2626"
                          : "#6B7280"
                      }
                    />
                    <Text
                      style={[
                        styles.transferTypeText,
                        bookingData.transferType === "SHARED" &&
                          styles.transferTypeTextActive,
                      ]}
                    >
                      Shared
                    </Text>
                    <Text style={styles.transferTypeSubtext}>
                      Shared with others
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Passengers */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="people" size={16} color="#DC2626" />{" "}
                  Passengers
                </Text>
                <View style={styles.passengerContainer}>
                  <TouchableOpacity
                    style={[
                      styles.passengerButton,
                      bookingData.passengers <= 1 &&
                        styles.passengerButtonDisabled,
                    ]}
                    onPress={() => updatePassengerCount(false)}
                    disabled={bookingData.passengers <= 1}
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={
                        bookingData.passengers <= 1 ? "#9CA3AF" : "#374151"
                      }
                    />
                  </TouchableOpacity>

                  <Text style={styles.passengerCount}>
                    {bookingData.passengers}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.passengerButton,
                      bookingData.passengers >= 8 &&
                        styles.passengerButtonDisabled,
                    ]}
                    onPress={() => updatePassengerCount(true)}
                    disabled={bookingData.passengers >= 8}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={
                        bookingData.passengers >= 8 ? "#9CA3AF" : "#374151"
                      }
                    />
                  </TouchableOpacity>

                  <Text style={styles.passengerLimit}>
                    Maximum 8 passengers
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleNextStep}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Contact Information</Text>
                <TouchableOpacity
                  onPress={() => setCurrentStep(1)}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={20} color="#DC2626" />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>First Name *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.firstName && styles.inputError,
                    ]}
                    value={bookingData.contactInfo.firstName}
                    onChangeText={(text) =>
                      setBookingData({
                        ...bookingData,
                        contactInfo: {
                          ...bookingData.contactInfo,
                          firstName: text,
                        },
                      })
                    }
                    placeholder="Enter first name"
                    placeholderTextColor="#9CA3AF"
                  />
                  {errors.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Last Name *</Text>
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    value={bookingData.contactInfo.lastName}
                    onChangeText={(text) =>
                      setBookingData({
                        ...bookingData,
                        contactInfo: {
                          ...bookingData.contactInfo,
                          lastName: text,
                        },
                      })
                    }
                    placeholder="Enter last name"
                    placeholderTextColor="#9CA3AF"
                  />
                  {errors.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={bookingData.contactInfo.email}
                  onChangeText={(text) =>
                    setBookingData({
                      ...bookingData,
                      contactInfo: {
                        ...bookingData.contactInfo,
                        email: text,
                      },
                    })
                  }
                  placeholder="Enter email address"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={bookingData.contactInfo.phone}
                  onChangeText={(text) =>
                    setBookingData({
                      ...bookingData,
                      contactInfo: {
                        ...bookingData.contactInfo,
                        phone: text,
                      },
                    })
                  }
                  placeholder="Enter phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

              {/* Booking Summary */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Booking Summary</Text>
                <View style={styles.summaryContent}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Transfer Type:</Text>
                    <Text style={styles.summaryValue}>
                      {bookingData.transferType}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Passengers:</Text>
                    <Text style={styles.summaryValue}>
                      {bookingData.passengers}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Pickup:</Text>
                    <Text style={styles.summaryValue}>
                      {bookingData.startLocationCode || "Not selected"}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Destination:</Text>
                    <Text style={styles.summaryValue}>
                      {bookingData.endAddressLine || "Not specified"}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date & Time:</Text>
                    <Text style={styles.summaryValue}>
                      {bookingData.startDateTime
                        ? new Date(bookingData.startDateTime).toLocaleString()
                        : "Not selected"}
                    </Text>
                  </View>
                </View>
              </View>

              {errors.submit && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text style={styles.errorTitle}>Booking Error</Text>
                  <Text style={styles.errorMessage}>{errors.submit}</Text>
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backStepButton}
                  onPress={() => setCurrentStep(1)}
                >
                  <Text style={styles.backStepButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    isLoading && styles.confirmButtonDisabled,
                  ]}
                  onPress={handleBooking}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.confirmButtonText}>
                        Processing...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.confirmButtonText}>
                        Confirm Booking
                      </Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#FFFFFF"
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Pickup Search Modal */}
      <Modal
        visible={showPickupSearch}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Pickup Location</Text>
            <TouchableOpacity
              onPress={() => setShowPickupSearch(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={pickupQuery}
              onChangeText={handlePickupSearch}
              placeholder="Search airports, cities..."
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
            <Ionicons
              name="search"
              size={20}
              color="#6B7280"
              style={styles.searchIcon}
            />
          </View>

          {isLoadingSuggestions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DC2626" />
              <Text style={styles.loadingText}>Searching locations...</Text>
            </View>
          ) : (
            <FlatList
              data={pickupSuggestions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handlePickupSelect(item)}
                >
                  <View style={styles.suggestionIcon}>
                    <Ionicons name="car" size={20} color="#DC2626" />
                  </View>
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionName}>
                      {item?.name || "Unknown Location"}
                    </Text>
                    <Text style={styles.suggestionDetails}>
                      {item?.iataCode || item?.code} •{" "}
                      {item?.cityName || item?.city},{" "}
                      {item?.countryName || item?.country}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                pickupQuery.length >= 2 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No locations found</Text>
                  </View>
                ) : null
              }
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Date Time Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="datetime"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#DC2626",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    fontFamily: "RedHatDisplay-Bold",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "RedHatDisplay-Regular",
  },
  progressContainer: {
    alignItems: "center",
  },
  progressSteps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepContainer: {
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: "#DC2626",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "RedHatDisplay-Bold",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "RedHatDisplay-Regular",
  },
  stepLabelActive: {
    color: "#DC2626",
    fontWeight: "600",
  },
  stepConnector: {
    width: 32,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
    fontFamily: "RedHatDisplay-Bold",
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    color: "#DC2626",
    fontWeight: "600",
    marginLeft: 4,
    fontFamily: "RedHatDisplay-Bold",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
    fontFamily: "RedHatDisplay-Regular",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputError: {
    borderColor: "#DC2626",
  },
  inputText: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "RedHatDisplay-Regular",
    flex: 1,
  },
  inputPlaceholder: {
    color: "#9CA3AF",
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 4,
    fontFamily: "RedHatDisplay-Regular",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  transferTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transferTypeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  transferTypeButtonActive: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  transferTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  transferTypeTextActive: {
    color: "#DC2626",
  },
  transferTypeSubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "RedHatDisplay-Regular",
  },
  passengerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passengerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  passengerButtonDisabled: {
    opacity: 0.5,
  },
  passengerCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginHorizontal: 20,
    minWidth: 32,
    textAlign: "center",
    fontFamily: "RedHatDisplay-Bold",
  },
  passengerLimit: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 16,
    fontFamily: "RedHatDisplay-Regular",
  },
  continueButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  summaryContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    fontFamily: "RedHatDisplay-Bold",
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "RedHatDisplay-Regular",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "RedHatDisplay-Bold",
    flex: 1,
    textAlign: "right",
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#DC2626",
    marginLeft: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  errorMessage: {
    fontSize: 14,
    color: "#DC2626",
    marginTop: 4,
    marginLeft: 32,
    fontFamily: "RedHatDisplay-Regular",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  backStepButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  backStepButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "RedHatDisplay-Bold",
  },
  confirmButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    fontFamily: "RedHatDisplay-Bold",
  },
  modalCloseButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: "relative",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    fontSize: 16,
    color: "#111827",
    fontFamily: "RedHatDisplay-Regular",
  },
  searchIcon: {
    position: "absolute",
    right: 32,
    top: 28,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "RedHatDisplay-Bold",
  },
  suggestionDetails: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
    fontFamily: "RedHatDisplay-Regular",
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "RedHatDisplay-Regular",
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    fontFamily: "RedHatDisplay-Regular",
  },
  // Success screen styles
  successContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "RedHatDisplay-Bold",
  },
  successSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
    fontFamily: "RedHatDisplay-Regular",
  },
  bookingDetails: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "RedHatDisplay-Bold",
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontFamily: "RedHatDisplay-Regular",
    fontWeight: "600",
  },
  statusActive: {
    color: "#10B981",
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  routePoint: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
    fontFamily: "RedHatDisplay-Bold",
  },
  routeValue: {
    fontSize: 14,
    color: "#111827",
    fontFamily: "RedHatDisplay-Regular",
  },
  actionButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#DC2626",
  },
  secondaryButton: {
    backgroundColor: "#6B7280",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "RedHatDisplay-Bold",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "RedHatDisplay-Bold",
  },
});
