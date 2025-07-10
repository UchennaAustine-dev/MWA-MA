import PhoneInput from "@/components/PhoneInput";
import { getUserCart, storeSelectedOffer } from "@/lib/flightAPIs";
import { createTraveler } from "@/lib/userAPI";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useCountries } from "../hooks/useCountries";
import { setFlightOffrId, setTraveler } from "../redux/slices/flightSlice";
import type { AppDispatch, RootState } from "../redux/store";

interface TravelerFormData {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  nationality: string;
  issuanceCountry?: string;
  birthPlace: string;
  countryCode: string;
  passportNumber: string;
  passportExpiry: string;
}

interface BillingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
}

export default function TravelerDetailsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const selectedFlight = useSelector(
    (state: RootState) => state.flight.selectedFlight
  );

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const userCart: any[] = await getUserCart(user.id);
          setCartItems(Array.isArray(userCart) ? userCart : []);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load cart items");
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCartData();
  }, [user?.id]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [flightOfferId, setFlightOfferId] = useState<string | null>(null);

  const { countries, loadingCountries } = useCountries();

  const [billingInfo, setBillingInfo] = useState<BillingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
  });
  const [billingFormSubmitted, setBillingFormSubmitted] = useState(false);

  const passengerCount = selectedFlight?.travelerPricings?.length || 1;
  const [travelers, setTravelers] = useState<TravelerFormData[]>(() =>
    Array.from({ length: passengerCount }, () => ({
      firstName: "",
      lastName: "",
      gender: "",
      dateOfBirth: "",
      email: "",
      phone: "",
      nationality: "",
      issuanceCountry: "",
      birthPlace: "",
      countryCode: "",
      passportNumber: "",
      passportExpiry: "",
    }))
  );

  const [showDatePicker, setShowDatePicker] = useState<number | null>(null);
  const [showExpiryPicker, setShowExpiryPicker] = useState<number | null>(null);
  const [tempDate, setTempDate] = useState(new Date());
  const genderOptions = ["MALE", "FEMALE"];

  useEffect(() => {
    setTravelers(
      Array.from({ length: passengerCount }, () => ({
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        email: "",
        phone: "",
        nationality: "",
        countryCode: "",
        birthPlace: "",
        passportNumber: "",
        passportExpiry: "",
      }))
    );
    if (user && billingFormSubmitted) {
      setTravelers((prev) =>
        prev.map((t, i) =>
          i === 0
            ? {
                ...t,
                firstName: user?.firstName || billingInfo.firstName,
                lastName: user?.lastName || billingInfo.lastName,
                email: user?.email || billingInfo.email,
                phone: user?.phone || billingInfo.phone,
                nationality: user?.nationality || billingInfo.nationality,
                countryCode: user?.nationality || billingInfo.nationality,
                issuanceCountry: user?.nationality || billingInfo.nationality,
              }
            : t
        )
      );
    }
  }, [passengerCount, user, billingFormSubmitted, billingInfo]);

  useEffect(() => {
    if (!selectedFlight || flightOfferId) return;
    let isMounted = true;
    const persistBooking = async () => {
      try {
        const result = await storeSelectedOffer({ offerData: selectedFlight });
        if (isMounted && result.flightOfferId) {
          setFlightOfferId(result.flightOfferId);
          dispatch(setFlightOffrId(result.flightOfferId));
        }
      } catch (error) {
        if (isMounted) {
          Alert.alert(
            "Error",
            "Failed to store booking details. Please try again."
          );
        }
      }
    };
    persistBooking();
    return () => {
      isMounted = false;
    };
  }, [selectedFlight, flightOfferId, dispatch]);

  const updateTraveler = useCallback(
    (index: number, field: keyof TravelerFormData, value: string) => {
      setTravelers((prev) =>
        prev.map((traveler, i) =>
          i === index ? { ...traveler, [field]: value } : traveler
        )
      );
    },
    []
  );

  const isBillingFormValid = () => {
    return (
      billingInfo.firstName.trim() &&
      billingInfo.lastName.trim() &&
      billingInfo.email.trim() &&
      billingInfo.phone.trim() &&
      billingInfo.nationality
    );
  };

  const isTravelerFormValid = () => {
    if (!agreedToTerms) return false;
    return travelers.every(
      (traveler) =>
        traveler.firstName.trim() &&
        traveler.lastName.trim() &&
        traveler.gender &&
        traveler.dateOfBirth &&
        traveler.email.trim() &&
        traveler.phone.trim() &&
        traveler.nationality &&
        traveler.birthPlace.trim() &&
        traveler.passportNumber.trim() &&
        traveler.passportExpiry
    );
  };

  const handleBillingSubmit = () => {
    if (!isBillingFormValid()) {
      setError("Please fill in all required billing information.");
      Alert.alert("Error", "Please fill in all required billing information.");
      return;
    }
    setBillingFormSubmitted(true);
    Alert.alert(
      "Success",
      "Billing information saved. Please proceed with traveler details."
    );
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions.");
      Alert.alert("Error", "Please agree to the terms and conditions.");
      return;
    }
    if (!flightOfferId) {
      setError("Booking ID not available yet. Please wait.");
      Alert.alert("Error", "Booking ID not available yet. Please wait.");
      return;
    }
    for (let i = 0; i < travelers.length; i++) {
      const traveler = travelers[i];
      if (
        !traveler.firstName ||
        !traveler.lastName ||
        !traveler.email ||
        !traveler.phone ||
        !traveler.gender ||
        !traveler.dateOfBirth ||
        !traveler.nationality ||
        !traveler.birthPlace ||
        !traveler.passportNumber ||
        !traveler.passportExpiry
      ) {
        setError(`Please fill in all required fields for Adult ${i + 1}.`);
        Alert.alert(
          "Error",
          `Please fill in all required fields for Adult ${i + 1}.`
        );
        return;
      }
    }
    setIsLoading(true);
    setError(null);

    try {
      const travelerResults = [];
      for (const traveler of travelers) {
        const travelerData = {
          flightOfferId,
          ...traveler,
        };
        const stateTravelerDetails = await createTraveler(travelerData);
        travelerResults.push(stateTravelerDetails);
      }
      dispatch(setTraveler(travelerResults));
      router.push("/full-summary");
      Alert.alert("Success", "All travelers created successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to create travelers. Please try again.");
      Alert.alert(
        "Error",
        err.message || "Failed to create travelers. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (
    event: any,
    selectedDate?: Date,
    travelerIndex?: number,
    field?: string
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(null);
      setShowExpiryPicker(null);
      if (
        event.type === "set" &&
        selectedDate &&
        travelerIndex !== undefined &&
        field
      ) {
        updateTraveler(
          travelerIndex,
          field as keyof TravelerFormData,
          selectedDate.toISOString().split("T")[0]
        );
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const confirmIOSDate = (travelerIndex: number, field: string) => {
    updateTraveler(
      travelerIndex,
      field as keyof TravelerFormData,
      tempDate.toISOString().split("T")[0]
    );
    setShowDatePicker(null);
    setShowExpiryPicker(null);
  };

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
        <Text style={styles.headerTitle}>
          {billingFormSubmitted
            ? "Traveler Information"
            : "Billing Information"}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!billingFormSubmitted && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Billing Information</Text>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={billingInfo.firstName}
              onChangeText={(text) =>
                setBillingInfo((prev) => ({ ...prev, firstName: text }))
              }
            />
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={billingInfo.lastName}
              onChangeText={(text) =>
                setBillingInfo((prev) => ({ ...prev, lastName: text }))
              }
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={billingInfo.email}
              onChangeText={(text) =>
                setBillingInfo((prev) => ({ ...prev, email: text }))
              }
            />
            <Text style={styles.label}>Phone</Text>
            <PhoneInput
              value={billingInfo.phone}
              onChange={(val) =>
                setBillingInfo((prev) => ({ ...prev, phone: val }))
              }
              placeholder="Enter phone number"
            />
            <Text style={styles.label}>Nationality</Text>
            {loadingCountries ? (
              <ActivityIndicator size="small" color="#d32f2f" />
            ) : (
              <Picker
                selectedValue={billingInfo.nationality}
                onValueChange={(value) =>
                  setBillingInfo((prev) => ({
                    ...prev,
                    nationality: value,
                  }))
                }
                style={styles.input}
              >
                <Picker.Item label="Select Nationality" value="" />
                {countries.map((country: any) => (
                  <Picker.Item
                    key={country.iso2}
                    label={`${country.name} (${country.iso2})`}
                    value={country.iso2}
                  />
                ))}
              </Picker>
            )}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleBillingSubmit}
            >
              <Text style={styles.saveButtonText}>Save Billing Info</Text>
            </TouchableOpacity>
          </View>
        )}

        {billingFormSubmitted && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Traveler Details</Text>
            {travelers.map((traveler, idx) => (
              <View
                key={`${traveler.passportNumber || idx}-${idx}`}
                style={styles.travelerForm}
              >
                <Text style={styles.travelerTitle}>Traveler {idx + 1}</Text>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={traveler.firstName}
                  onChangeText={(text) =>
                    updateTraveler(idx, "firstName", text)
                  }
                />
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={traveler.lastName}
                  onChangeText={(text) => updateTraveler(idx, "lastName", text)}
                />
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderRow}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.genderButton,
                        traveler.gender === option &&
                          styles.genderButtonSelected,
                      ]}
                      onPress={() => updateTraveler(idx, "gender", option)}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          traveler.gender === option &&
                            styles.genderButtonTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(idx)}
                >
                  <Text>
                    {traveler.dateOfBirth
                      ? traveler.dateOfBirth
                      : "Select Date of Birth"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker === idx && (
                  <DateTimePicker
                    value={
                      traveler.dateOfBirth
                        ? new Date(traveler.dateOfBirth)
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={(event, date) =>
                      handleDateChange(event, date, idx, "dateOfBirth")
                    }
                  />
                )}
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={traveler.email}
                  onChangeText={(text) => updateTraveler(idx, "email", text)}
                />
                <Text style={styles.label}>Phone</Text>
                <PhoneInput
                  value={traveler.phone}
                  onChange={(val) => updateTraveler(idx, "phone", val)}
                  placeholder="Enter phone number"
                />
                <Text style={styles.label}>Nationality</Text>
                {loadingCountries ? (
                  <ActivityIndicator size="small" color="#d32f2f" />
                ) : (
                  <Picker
                    selectedValue={traveler.nationality}
                    onValueChange={(value) =>
                      updateTraveler(idx, "nationality", value)
                    }
                    style={styles.input}
                  >
                    <Picker.Item label="Select Nationality" value="" />
                    {countries.map((country: any) => (
                      <Picker.Item
                        key={country.iso2}
                        label={`${country.name} (${country.iso2})`}
                        value={country.iso2}
                      />
                    ))}
                  </Picker>
                )}
                <Text style={styles.label}>Country of Passport Issuance</Text>
                {loadingCountries ? (
                  <ActivityIndicator size="small" color="#d32f2f" />
                ) : (
                  <Picker
                    selectedValue={traveler.issuanceCountry}
                    onValueChange={(value) =>
                      updateTraveler(idx, "issuanceCountry", value)
                    }
                    style={styles.input}
                  >
                    <Picker.Item label="Select Country" value="" />
                    {countries.map((country: any) => (
                      <Picker.Item
                        key={country.iso2}
                        label={`${country.name} (${country.iso2})`}
                        value={country.iso2}
                      />
                    ))}
                  </Picker>
                )}
                <Text style={styles.label}>Place of Birth</Text>
                <TextInput
                  style={styles.input}
                  value={traveler.birthPlace}
                  onChangeText={(text) =>
                    updateTraveler(idx, "birthPlace", text)
                  }
                />
                <Text style={styles.label}>Passport Number</Text>
                <TextInput
                  style={styles.input}
                  value={traveler.passportNumber}
                  maxLength={9}
                  keyboardType="default" // or "ascii-capable" on iOS
                  autoCorrect={false}
                  autoCapitalize="characters"
                  importantForAutofill="no"
                  onChangeText={(text) => {
                    const sanitized = text
                      .replace(/[^a-zA-Z0-9]/g, "")
                      .toUpperCase()
                      .slice(0, 9);
                    updateTraveler(idx, "passportNumber", sanitized);
                  }}
                  placeholder="Enter Passport Number (max 9 chars)"
                />

                <Text style={styles.inputHint}>Maximum 9 characters</Text>
                <Text style={styles.label}>Passport Expiry</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowExpiryPicker(idx)}
                >
                  <Text>
                    {traveler.passportExpiry
                      ? traveler.passportExpiry
                      : "Select Expiry Date"}
                  </Text>
                </TouchableOpacity>
                {showExpiryPicker === idx && (
                  <DateTimePicker
                    value={
                      traveler.passportExpiry
                        ? new Date(traveler.passportExpiry)
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={(event, date) =>
                      handleDateChange(event, date, idx, "passportExpiry")
                    }
                  />
                )}
              </View>
            ))}
            <View style={styles.termsRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  agreedToTerms && styles.checkboxChecked,
                ]}
                onPress={() => setAgreedToTerms((prev) => !prev)}
              >
                {agreedToTerms && (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                )}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the terms and conditions.
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!isTravelerFormValid() || isLoading) && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              disabled={!isTravelerFormValid() || isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? "Submitting..." : "Submit Travelers"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#d32f2f",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
    fontFamily: "RedHatDisplay-Bold",
  },
  content: { flex: 1 },
  formSection: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#d32f2f",
    marginBottom: 12,
    fontFamily: "RedHatDisplay-Bold",
  },
  travelerForm: {
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 16,
  },
  travelerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    color: "#000",
  },
  inputHint: {
    fontSize: 12,
    color: "#888",
    marginBottom: 10,
    marginLeft: 2,
  },
  label: {
    fontSize: 13,
    color: "#333",
    marginBottom: 4,
    marginTop: 8,
    fontFamily: "RedHatDisplay-Regular",
  },
  saveButton: {
    backgroundColor: "#d32f2f",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    fontFamily: "RedHatDisplay-Bold",
  },
  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  genderButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  genderButtonSelected: {
    backgroundColor: "#d32f2f",
  },
  genderButtonText: {
    color: "#333",
    fontWeight: "500",
  },
  genderButtonTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#d32f2f",
    borderRadius: 6,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#d32f2f",
  },
  termsText: {
    fontSize: 13,
    color: "#333",
  },
});

// import { getUserCart, storeSelectedOffer } from "@/lib/flightAPIs";
// import { createGuestUser, createTraveler } from "@/lib/userAPI";
// import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { useRouter } from "expo-router";
// import { useCallback, useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Modal,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import { useCountries } from "../hooks/useCountries";
// import { setFlightOffrId, setTraveler } from "../redux/slices/flightSlice";
// import { setGuestUser } from "../redux/slices/userSlice";
// import type { AppDispatch, RootState } from "../redux/store";

// interface TravelerFormData {
//   firstName: string;
//   lastName: string;
//   gender: string;
//   dateOfBirth: string;
//   email: string;
//   phone: string;
//   nationality: string;
//   issuanceCountry?: string;
//   birthPlace: string;
//   countryCode: string;
//   passportNumber: string;
//   passportExpiry: string;
// }

// interface BillingFormData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   nationality: string;
// }

// export default function TravelerDetailsScreen() {
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const user = useSelector((state: RootState) => state.user.user);
//   const guestUser = useSelector((state: RootState) => state.user.guestUser);
//   const selectedFlight = useSelector(
//     (state: RootState) => state.flight.selectedFlight
//   );

//   console.log("[Init] user:", user);
//   console.log("[Init] selectedFlight:", selectedFlight);

//   const [cartItems, setCartItems] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCartData = async () => {
//       try {
//         setLoading(true);
//         if (user?.id) {
//           // Fetch from API for logged-in users
//           const userCart: any[] = await getUserCart(user.id);
//           setCartItems(Array.isArray(userCart) ? userCart : []);
//         } else {
//           // For guests, use Redux state (if available)
//           setCartItems([]);
//         }
//       } catch (error) {
//         console.error("[Cart] Error fetching cart:", error);
//         Alert.alert("Error", "Failed to load cart items");
//         setCartItems([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCartData();
//   }, [user?.id]);

//   // const CartInfo = userCart[0].flightData.flightData;

//   // console.log(`CartInfo`, CartInfo);

//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showAdditionalTravelers, setShowAdditionalTravelers] = useState(true);
//   const [agreedToTerms, setAgreedToTerms] = useState(false);
//   const [flightOfferId, setFlightOfferId] = useState<string | null>(null);

//   const { countries, loadingCountries, countryError } = useCountries();

//   // console.log("[Init] countries:", countries);

//   const [billingInfo, setBillingInfo] = useState<BillingFormData>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     nationality: "",
//   });
//   const [billingFormSubmitted, setBillingFormSubmitted] = useState(false);

//   const passengerCount = selectedFlight?.travelerPricings?.length || 1;
//   console.log("[PassengerCount]", passengerCount);

//   const [travelers, setTravelers] = useState<TravelerFormData[]>(() =>
//     Array.from({ length: passengerCount }, () => ({
//       firstName: "",
//       lastName: "",
//       gender: "",
//       dateOfBirth: "",
//       email: "",
//       phone: "",
//       nationality: "",
//       issuanceCountry: "",
//       birthPlace: "",
//       countryCode: "",
//       passportNumber: "",
//       passportExpiry: "",
//     }))
//   );

//   const [showGenderModal, setShowGenderModal] = useState<number | null>(null);
//   const [showNationalityModal, setShowNationalityModal] = useState<
//     number | null
//   >(null);
//   const [showDatePicker, setShowDatePicker] = useState<number | null | any>(
//     null
//   );
//   const [showExpiryPicker, setShowExpiryPicker] = useState<number | null>(null);
//   const [tempDate, setTempDate] = useState(new Date());

//   const genderOptions = ["MALE", "FEMALE"];

//   // Reset travelers when passengerCount changes or if billing form is submitted
//   useEffect(() => {
//     setTravelers(
//       Array.from({ length: passengerCount }, () => ({
//         firstName: "",
//         lastName: "",
//         gender: "",
//         dateOfBirth: "",
//         email: "",
//         phone: "",
//         nationality: "",
//         countryCode: "",
//         birthPlace: "",
//         passportNumber: "",
//         passportExpiry: "",
//       }))
//     );
//     console.log("[Travelers] Reset for passengerCount:", passengerCount);

//     // Pre-fill first traveler's info if available
//     if (user || (guestUser && billingFormSubmitted)) {
//       const userInfo = user || guestUser;
//       setTravelers((prev) =>
//         prev.map((t, i) =>
//           i === 0
//             ? {
//                 ...t,
//                 firstName: userInfo?.firstName || billingInfo.firstName,
//                 lastName: userInfo?.lastName || billingInfo.lastName,
//                 email: userInfo?.email || billingInfo.email,
//                 phone: userInfo?.phone || billingInfo.phone,
//                 nationality: userInfo?.nationality || billingInfo.nationality,
//                 countryCode: userInfo?.nationality || billingInfo.nationality,
//                 issuanceCountry:
//                   userInfo?.nationality || billingInfo.nationality,
//               }
//             : t
//         )
//       );
//       console.log("[Travelers] Pre-filled first traveler with user/guest info");
//     }
//   }, [passengerCount, user, guestUser, billingFormSubmitted, billingInfo]);

//   // Persist booking
//   useEffect(() => {
//     if (!selectedFlight || flightOfferId) return;
//     let isMounted = true;
//     const persistBooking = async () => {
//       try {
//         const result = await storeSelectedOffer({ offerData: selectedFlight });
//         console.log("[PersistBooking] Result:", result);

//         if (isMounted && result.flightOfferId) {
//           setFlightOfferId(result.flightOfferId);
//           dispatch(setFlightOffrId(result.flightOfferId));
//           console.log(
//             "[PersistBooking] flightOfferId set:",
//             result.flightOfferId
//           );
//         }
//       } catch (error) {
//         if (isMounted) {
//           console.error("[PersistBooking] Failed to store booking:", error);
//           Alert.alert(
//             "Error",
//             "Failed to store booking details. Please try again."
//           );
//         }
//       }
//     };
//     persistBooking();
//     return () => {
//       isMounted = false;
//       console.log("[PersistBooking] Cleanup on unmount");
//     };
//   }, [selectedFlight, flightOfferId, dispatch]);

//   const updateTraveler = useCallback(
//     (index: number, field: keyof TravelerFormData, value: string) => {
//       setTravelers((prev) =>
//         prev.map((traveler, i) =>
//           i === index ? { ...traveler, [field]: value } : traveler
//         )
//       );
//       console.log(
//         `[updateTraveler] Traveler ${index} field ${field} updated to`,
//         value
//       );
//     },
//     []
//   );

//   const isBillingFormValid = () => {
//     const valid =
//       billingInfo.firstName.trim() &&
//       billingInfo.lastName.trim() &&
//       billingInfo.email.trim() &&
//       billingInfo.phone.trim() &&
//       billingInfo.nationality;
//     console.log("[isBillingFormValid]", valid);
//     return valid;
//   };

//   const isTravelerFormValid = () => {
//     if (!agreedToTerms) {
//       console.log("[isTravelerFormValid] Terms not agreed");
//       return false;
//     }
//     const activeTravelers = showAdditionalTravelers
//       ? travelers
//       : [travelers[0]];

//     const valid = activeTravelers.every((traveler) => {
//       const result =
//         traveler.firstName.trim() &&
//         traveler.lastName.trim() &&
//         traveler.gender &&
//         traveler.dateOfBirth &&
//         traveler.email.trim() &&
//         traveler.phone.trim() &&
//         traveler.nationality &&
//         traveler.birthPlace.trim() &&
//         traveler.passportNumber.trim() &&
//         traveler.passportExpiry;
//       if (!result) {
//         console.warn("[isTravelerFormValid] Incomplete traveler:", traveler);
//       }
//       return result;
//     });
//     console.log("[isTravelerFormValid]", valid);
//     return valid;
//   };

//   const handleBillingSubmit = async () => {
//     if (!isBillingFormValid()) {
//       setError("Please fill in all required billing information.");
//       console.warn("[handleBillingSubmit] Invalid billing info:", billingInfo);
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       const guestData = {
//         email: billingInfo.email,
//         firstName: billingInfo.firstName,
//         lastName: billingInfo.lastName,
//         phone: billingInfo.phone,
//         nationality: billingInfo.nationality,
//         country: billingInfo.nationality,
//       };
//       const newGuestUserId = await createGuestUser(guestData);
//       dispatch(setGuestUser({ guestUserId: newGuestUserId, ...guestData }));
//       setBillingFormSubmitted(true);
//       Alert.alert(
//         "Success",
//         "Billing information saved. Please proceed with traveler details."
//       );
//       console.log("[handleBillingSubmit] Guest user created:", newGuestUserId);
//     } catch (err: any) {
//       setError(err.message || "Failed to save billing information.");
//       Alert.alert(
//         "Error",
//         err.message || "Failed to save billing information."
//       );
//       console.error("[handleBillingSubmit] Error:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!agreedToTerms) {
//       setError("Please agree to the terms and conditions.");
//       Alert.alert("Error", "Please agree to the terms and conditions.");
//       console.warn("[handleSubmit] Terms not agreed");
//       return;
//     }
//     if (!flightOfferId) {
//       setError("Booking ID not available yet. Please wait.");
//       Alert.alert("Error", "Booking ID not available yet. Please wait.");
//       console.warn("[handleSubmit] Missing flightOfferId");
//       return;
//     }

//     const activeTravelers = showAdditionalTravelers
//       ? travelers
//       : [travelers[0]];

//     for (let i = 0; i < activeTravelers.length; i++) {
//       const traveler = activeTravelers[i];
//       if (
//         !traveler.firstName ||
//         !traveler.lastName ||
//         !traveler.email ||
//         !traveler.phone ||
//         !traveler.gender ||
//         !traveler.dateOfBirth ||
//         !traveler.nationality ||
//         !traveler.birthPlace ||
//         !traveler.passportNumber ||
//         !traveler.passportExpiry
//       ) {
//         setError(`Please fill in all required fields for Adult ${i + 1}.`);
//         Alert.alert(
//           "Error",
//           `Please fill in all required fields for Adult ${i + 1}.`
//         );
//         console.warn(
//           `[handleSubmit] Incomplete traveler at index ${i}:`,
//           traveler
//         );
//         return;
//       }
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       const travelerResults = [];
//       for (const traveler of activeTravelers) {
//         const userId = !user ? guestUser?.guestUserId : null;

//         const travelerData = {
//           flightOfferId,
//           ...traveler,
//           ...(userId && { guestUserId: userId }),
//         };

//         const stateTravelerDetails = await createTraveler(travelerData);
//         travelerResults.push(stateTravelerDetails);
//         console.log("[handleSubmit] Traveler created:", stateTravelerDetails);
//       }

//       dispatch(setTraveler(travelerResults));
//       router.push("/full-summary");
//       Alert.alert("Success", "All travelers created successfully!");
//       console.log(
//         "[handleSubmit] All travelers created, navigating to summary."
//       );
//     } catch (err: any) {
//       setError(err.message || "Failed to create travelers. Please try again.");
//       Alert.alert(
//         "Error",
//         err.message || "Failed to create travelers. Please try again."
//       );
//       console.error("[handleSubmit] Error:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formatCurrency = (amount: any, currency = "NGN") => {
//     const symbol = currency === "NGN" ? "₦" : "$";
//     const formatted = `${symbol}${Number(amount).toLocaleString()}`;
//     console.log("[formatCurrency]", formatted);
//     return formatted;
//   };

//   const getFlightData = (cartItem: any) => {
//     if (cartItem?.flightData?.flightData) return cartItem.flightData.flightData;
//     if (cartItem?.flightData) return cartItem.flightData;
//     return cartItem;
//   };

//   const calculateTotal = () => {
//     return cartItems.reduce((sum, item) => {
//       const flightData = getFlightData(item);
//       const price =
//         flightData?.price?.total || flightData?.price?.grandTotal || 0;
//       return sum + Number(price);
//     }, 0);
//   };

//   const formatDateForDisplay = (dateString: string) => {
//     if (!dateString) return "";
//     const formatted = new Date(dateString).toLocaleDateString();
//     console.log("[formatDateForDisplay]", formatted);
//     return formatted;
//   };

//   const formatDateForAPI = (date: Date) => {
//     const formatted = date.toISOString().split("T")[0];
//     console.log("[formatDateForAPI]", formatted);
//     return formatted;
//   };

//   const handleDateChange = (
//     event: any,
//     selectedDate?: Date,
//     travelerIndex?: number,
//     field?: string
//   ) => {
//     if (Platform.OS === "android") {
//       setShowDatePicker(null);
//       setShowExpiryPicker(null);
//       if (
//         event.type === "set" &&
//         selectedDate &&
//         travelerIndex !== undefined &&
//         field
//       ) {
//         updateTraveler(
//           travelerIndex,
//           field as keyof TravelerFormData,
//           formatDateForAPI(selectedDate)
//         );
//         console.log(
//           "[handleDateChange] Android date set for traveler",
//           travelerIndex,
//           field,
//           selectedDate
//         );
//       }
//     } else {
//       if (selectedDate) {
//         setTempDate(selectedDate);
//         console.log("[handleDateChange] iOS tempDate set:", selectedDate);
//       }
//     }
//   };

//   const confirmIOSDate = (travelerIndex: number, field: string) => {
//     updateTraveler(
//       travelerIndex,
//       field as keyof TravelerFormData,
//       formatDateForAPI(tempDate)
//     );
//     setShowDatePicker(null);
//     setShowExpiryPicker(null);
//     console.log(
//       "[confirmIOSDate] Date confirmed for traveler",
//       travelerIndex,
//       field,
//       tempDate
//     );
//   };

//   const showTravelerForms = user || billingFormSubmitted;
//   console.log("[showTravelerForms]", showTravelerForms);

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>
//           {showTravelerForms ? "Traveler Information" : "Billing Information"}
//         </Text>
//       </View>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Flight Summary */}
//         <View style={styles.summaryCard}>
//           <Text style={styles.summaryTitle}>Flight Summary</Text>
//           <Text style={styles.summaryText}>
//             {cartItems.length} flight{cartItems.length > 1 ? "s" : ""} selected
//           </Text>
//           <Text style={styles.summaryPrice}>
//             Total:{" "}
//             {formatCurrency(calculateTotal(), cartItems[0]?.price?.currency)}
//           </Text>
//         </View>

//         {/* Warning Banner */}
//         <View style={styles.warningBanner}>
//           <Ionicons name="information-circle" size={20} color="#fff" />
//           <Text style={styles.warningText}>
//             Please ensure details match information in your government issued ID
//             or Passport
//           </Text>
//         </View>

//         {/* Error Message */}
//         {error && (
//           <View style={styles.errorContainer}>
//             <Ionicons name="alert-circle" size={20} color="#d32f2f" />
//             <Text style={styles.errorText}>{error}</Text>
//           </View>
//         )}

//         {/* Billing Information Form (for guest users) */}
//         {!user && !billingFormSubmitted && (
//           <View style={styles.formCard}>
//             <Text style={styles.formTitle}>Your Contact Details</Text>
//             <Text style={styles.formSubtitle}>
//               Enter your contact information to proceed
//             </Text>

//             <View style={styles.inputContainer}>
//               <Text style={styles.label}>
//                 First Name <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={billingInfo.firstName}
//                 onChangeText={(value) =>
//                   setBillingInfo({ ...billingInfo, firstName: value })
//                 }
//                 placeholder="Enter first name"
//                 autoCapitalize="words"
//               />
//             </View>

//             <View style={styles.inputContainer}>
//               <Text style={styles.label}>
//                 Last Name <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={billingInfo.lastName}
//                 onChangeText={(value) =>
//                   setBillingInfo({ ...billingInfo, lastName: value })
//                 }
//                 placeholder="Enter last name"
//                 autoCapitalize="words"
//               />
//             </View>

//             <View style={styles.inputContainer}>
//               <Text style={styles.label}>
//                 Email Address <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={billingInfo.email}
//                 onChangeText={(value) =>
//                   setBillingInfo({ ...billingInfo, email: value })
//                 }
//                 placeholder="Enter email address"
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//               />
//             </View>

//             <View style={styles.inputContainer}>
//               <Text style={styles.label}>
//                 Mobile Number <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={billingInfo.phone}
//                 onChangeText={(value) =>
//                   setBillingInfo({ ...billingInfo, phone: value })
//                 }
//                 placeholder="Enter mobile number"
//                 keyboardType="phone-pad"
//               />
//             </View>

//             <View style={styles.inputContainer}>
//               <Text style={styles.label}>
//                 Nationality <Text style={styles.required}>*</Text>
//               </Text>
//               <TouchableOpacity
//                 style={styles.selectInput}
//                 onPress={() => setShowNationalityModal(-1)} // Use -1 for billing form
//               >
//                 <Text
//                   style={[
//                     styles.selectText,
//                     !billingInfo.nationality && styles.placeholder,
//                   ]}
//                 >
//                   {billingInfo.nationality
//                     ? countries.find((c) => c.iso2 === billingInfo.nationality)
//                         ?.name
//                     : "Select country"}
//                 </Text>
//                 <Ionicons name="chevron-down" size={20} color="#666" />
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity
//               style={[
//                 styles.continueButton,
//                 !isBillingFormValid() && styles.continueButtonDisabled,
//               ]}
//               onPress={handleBillingSubmit}
//               disabled={isLoading || !isBillingFormValid()}
//             >
//               {isLoading ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <Text style={styles.continueButtonText}>
//                   Continue to Traveler Details
//                 </Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Traveler Information Forms */}
//         {showTravelerForms && (
//           <View style={styles.formCard}>
//             <Text style={styles.formTitle}>Passenger Information</Text>
//             <Text style={styles.formSubtitle}>Confirm traveler details</Text>

//             {/* Additional Travelers Checkbox */}
//             {passengerCount > 1 && (
//               <View style={styles.checkboxContainer}>
//                 <TouchableOpacity
//                   style={styles.checkbox}
//                   onPress={() =>
//                     setShowAdditionalTravelers(!showAdditionalTravelers)
//                   }
//                 >
//                   <Ionicons
//                     name={
//                       showAdditionalTravelers ? "checkbox" : "square-outline"
//                     }
//                     size={20}
//                     color="#007AFF"
//                   />
//                   <Text style={styles.checkboxText}>
//                     Add information for additional travelers (
//                     {passengerCount - 1} more)
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             {/* Traveler Forms */}
//             {travelers.map((traveler, index) => {
//               if (index > 0 && !showAdditionalTravelers) return null;

//               return (
//                 <View key={index} style={styles.travelerForm}>
//                   <Text style={styles.travelerTitle}>Adult - {index + 1}</Text>

//                   <View style={styles.row}>
//                     <View
//                       style={[
//                         styles.inputContainer,
//                         { flex: 1, marginRight: 8 },
//                       ]}
//                     >
//                       <Text style={styles.label}>
//                         First Name <Text style={styles.required}>*</Text>
//                       </Text>
//                       <TextInput
//                         style={styles.input}
//                         value={traveler.firstName}
//                         onChangeText={(value) =>
//                           updateTraveler(index, "firstName", value)
//                         }
//                         placeholder="Enter first name"
//                         autoCapitalize="words"
//                       />
//                     </View>

//                     <View
//                       style={[
//                         styles.inputContainer,
//                         { flex: 1, marginLeft: 8 },
//                       ]}
//                     >
//                       <Text style={styles.label}>
//                         Last Name <Text style={styles.required}>*</Text>
//                       </Text>
//                       <TextInput
//                         style={styles.input}
//                         value={traveler.lastName}
//                         onChangeText={(value) =>
//                           updateTraveler(index, "lastName", value)
//                         }
//                         placeholder="Enter last name"
//                         autoCapitalize="words"
//                       />
//                     </View>
//                   </View>

//                   <View style={styles.inputContainer}>
//                     <Text style={styles.label}>
//                       Gender <Text style={styles.required}>*</Text>
//                     </Text>
//                     <TouchableOpacity
//                       style={styles.selectInput}
//                       onPress={() => setShowGenderModal(index)}
//                     >
//                       <Text
//                         style={[
//                           styles.selectText,
//                           !traveler.gender && styles.placeholder,
//                         ]}
//                       >
//                         {traveler.gender || "Choose Gender"}
//                       </Text>
//                       <Ionicons name="chevron-down" size={20} color="#666" />
//                     </TouchableOpacity>
//                   </View>

//                   <View style={styles.inputContainer}>
//                     <Text style={styles.label}>
//                       Date of Birth <Text style={styles.required}>*</Text>
//                     </Text>
//                     <TouchableOpacity
//                       style={styles.selectInput}
//                       onPress={() => {
//                         setShowDatePicker(index);
//                         setTempDate(
//                           traveler.dateOfBirth
//                             ? new Date(traveler.dateOfBirth)
//                             : new Date()
//                         );
//                       }}
//                     >
//                       <Text
//                         style={[
//                           styles.selectText,
//                           !traveler.dateOfBirth && styles.placeholder,
//                         ]}
//                       >
//                         {traveler.dateOfBirth
//                           ? formatDateForDisplay(traveler.dateOfBirth)
//                           : "Select Date"}
//                       </Text>
//                       <Ionicons name="calendar" size={20} color="#666" />
//                     </TouchableOpacity>
//                   </View>

//                   <View style={styles.inputContainer}>
//                     <Text style={styles.label}>
//                       Email Address <Text style={styles.required}>*</Text>
//                     </Text>
//                     <TextInput
//                       style={styles.input}
//                       value={traveler.email}
//                       onChangeText={(value) =>
//                         updateTraveler(index, "email", value)
//                       }
//                       placeholder="Enter email address"
//                       keyboardType="email-address"
//                       autoCapitalize="none"
//                     />
//                   </View>

//                   <View style={styles.inputContainer}>
//                     <Text style={styles.label}>
//                       Mobile Number <Text style={styles.required}>*</Text>
//                     </Text>
//                     <TextInput
//                       style={styles.input}
//                       value={traveler.phone}
//                       onChangeText={(value) =>
//                         updateTraveler(index, "phone", value)
//                       }
//                       placeholder="Enter mobile number"
//                       keyboardType="phone-pad"
//                     />
//                   </View>

//                   <View style={styles.inputContainer}>
//                     <Text style={styles.label}>
//                       Nationality & Country Code{" "}
//                       <Text style={styles.required}>*</Text>
//                     </Text>
//                     <TouchableOpacity
//                       style={styles.selectInput}
//                       onPress={() => setShowNationalityModal(index)}
//                     >
//                       <Text
//                         style={[
//                           styles.selectText,
//                           !traveler.nationality && styles.placeholder,
//                         ]}
//                       >
//                         {traveler.nationality
//                           ? countries.find(
//                               (c) => c.iso2 === traveler.nationality
//                             )?.name
//                           : "Select country"}
//                       </Text>
//                       <Ionicons name="chevron-down" size={20} color="#666" />
//                     </TouchableOpacity>
//                   </View>

//                   <View style={styles.inputContainer}>
//                     <Text style={styles.label}>
//                       Birth Place <Text style={styles.required}>*</Text>
//                     </Text>
//                     <TextInput
//                       style={styles.input}
//                       value={traveler.birthPlace}
//                       onChangeText={(value) =>
//                         updateTraveler(index, "birthPlace", value)
//                       }
//                       placeholder="Enter place of birth"
//                       autoCapitalize="words"
//                     />
//                   </View>

//                   <View style={styles.inputContainer}>
//                     <Text style={styles.label}>
//                       Passport Number <Text style={styles.required}>*</Text>
//                     </Text>
//                     <TextInput
//                       style={styles.input}
//                       value={traveler.passportNumber}
//                       onChangeText={(value) =>
//                         updateTraveler(index, "passportNumber", value)
//                       }
//                       placeholder="Enter passport number"
//                       autoCapitalize="characters"
//                       maxLength={9}
//                     />
//                   </View>

//                   <View style={styles.inputContainer}>
//                     <Text style={styles.label}>
//                       Passport Expiry Date{" "}
//                       <Text style={styles.required}>*</Text>
//                     </Text>
//                     <TouchableOpacity
//                       style={styles.selectInput}
//                       onPress={() => {
//                         setShowExpiryPicker(index);
//                         setTempDate(
//                           traveler.passportExpiry
//                             ? new Date(traveler.passportExpiry)
//                             : new Date()
//                         );
//                       }}
//                     >
//                       <Text
//                         style={[
//                           styles.selectText,
//                           !traveler.passportExpiry && styles.placeholder,
//                         ]}
//                       >
//                         {traveler.passportExpiry
//                           ? formatDateForDisplay(traveler.passportExpiry)
//                           : "Select expiry date"}
//                       </Text>
//                       <Ionicons name="calendar" size={20} color="#666" />
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               );
//             })}

//             {/* Terms and Conditions */}
//             <View style={styles.checkboxContainer}>
//               <TouchableOpacity
//                 style={styles.checkbox}
//                 onPress={() => setAgreedToTerms(!agreedToTerms)}
//               >
//                 <Ionicons
//                   name={agreedToTerms ? "checkbox" : "square-outline"}
//                   size={20}
//                   color="#007AFF"
//                 />
//                 <Text style={styles.checkboxText}>
//                   By clicking Continue, I agree that I have read and accepted
//                   the <Text style={styles.linkText}>Terms of Use</Text> and{" "}
//                   <Text style={styles.linkText}>Privacy Policy</Text>.
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity
//               style={[
//                 styles.continueButton,
//                 !isTravelerFormValid() && styles.continueButtonDisabled,
//               ]}
//               onPress={handleSubmit}
//               disabled={isLoading || !isTravelerFormValid()}
//             >
//               {isLoading ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <Text style={styles.continueButtonText}>Continue</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>

//       {/* Gender Selection Modal */}
//       <Modal
//         visible={showGenderModal !== null}
//         transparent
//         animationType="slide"
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Gender</Text>
//               <TouchableOpacity onPress={() => setShowGenderModal(null)}>
//                 <Ionicons name="close" size={24} color="#333" />
//               </TouchableOpacity>
//             </View>
//             {genderOptions.map((option) => (
//               <TouchableOpacity
//                 key={option}
//                 style={styles.modalOption}
//                 onPress={() => {
//                   if (showGenderModal !== null) {
//                     updateTraveler(showGenderModal, "gender", option);
//                   }
//                   setShowGenderModal(null);
//                 }}
//               >
//                 <Text style={styles.modalOptionText}>{option}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       </Modal>

//       {/* Nationality Selection Modal */}
//       <Modal
//         visible={showNationalityModal !== null}
//         transparent
//         animationType="slide"
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Country</Text>
//               <TouchableOpacity onPress={() => setShowNationalityModal(null)}>
//                 <Ionicons name="close" size={24} color="#333" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={styles.modalScrollView}>
//               {loadingCountries ? (
//                 <View style={styles.modalLoading}>
//                   <ActivityIndicator size="small" color="#DC2626" />
//                   <Text>Loading countries...</Text>
//                 </View>
//               ) : countryError ? (
//                 <Text style={styles.modalError}>{countryError}</Text>
//               ) : (
//                 countries.map((country) => (
//                   <TouchableOpacity
//                     key={country.iso2}
//                     style={styles.modalOption}
//                     onPress={() => {
//                       if (showNationalityModal === -1) {
//                         // Billing form
//                         setBillingInfo({
//                           ...billingInfo,
//                           nationality: country.iso2,
//                         });
//                       } else if (showNationalityModal !== null) {
//                         // Traveler form
//                         updateTraveler(
//                           showNationalityModal,
//                           "nationality",
//                           country.iso2
//                         );
//                         updateTraveler(
//                           showNationalityModal,
//                           "countryCode",
//                           country.iso2
//                         );
//                         updateTraveler(
//                           showNationalityModal,
//                           "issuanceCountry",
//                           country.iso2
//                         );
//                       }
//                       setShowNationalityModal(null);
//                     }}
//                   >
//                     <Text style={styles.modalOptionText}>
//                       {country.name} ({country.iso2})
//                     </Text>
//                   </TouchableOpacity>
//                 ))
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       {/* Date Picker */}
//       {(showDatePicker !== null || showExpiryPicker !== null) && (
//         <>
//           {Platform.OS === "android" ? (
//             <DateTimePicker
//               value={tempDate}
//               mode="date"
//               display="default"
//               onChange={(event, selectedDate) =>
//                 handleDateChange(
//                   event,
//                   selectedDate,
//                   showDatePicker !== null ? showDatePicker : showExpiryPicker,
//                   showDatePicker !== null ? "dateOfBirth" : "passportExpiry"
//                 )
//               }
//             />
//           ) : (
//             <Modal visible={true} transparent animationType="slide">
//               <View style={styles.modalOverlay}>
//                 <View style={styles.datePickerContainer}>
//                   <View style={styles.modalHeader}>
//                     <TouchableOpacity
//                       onPress={() => {
//                         setShowDatePicker(null);
//                         setShowExpiryPicker(null);
//                       }}
//                     >
//                       <Text style={styles.cancelText}>Cancel</Text>
//                     </TouchableOpacity>
//                     <Text style={styles.modalTitle}>
//                       {showDatePicker !== null
//                         ? "Select Date of Birth"
//                         : "Select Expiry Date"}
//                     </Text>
//                     <TouchableOpacity
//                       onPress={() =>
//                         confirmIOSDate(
//                           showDatePicker !== null
//                             ? showDatePicker!
//                             : showExpiryPicker!,
//                           showDatePicker !== null
//                             ? "dateOfBirth"
//                             : "passportExpiry"
//                         )
//                       }
//                     >
//                       <Text style={styles.doneText}>Done</Text>
//                     </TouchableOpacity>
//                   </View>
//                   <DateTimePicker
//                     value={tempDate}
//                     mode="date"
//                     display="spinner"
//                     onChange={(event, selectedDate) =>
//                       handleDateChange(event, selectedDate)
//                     }
//                     style={styles.datePicker}
//                   />
//                 </View>
//               </View>
//             </Modal>
//           )}
//         </>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   header: {
//     backgroundColor: "#DC2626",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   backButton: {
//     padding: 8,
//     marginRight: 8,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   summaryCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   summaryTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 4,
//   },
//   summaryText: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 4,
//   },
//   summaryPrice: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#DC2626",
//   },
//   warningBanner: {
//     backgroundColor: "#DC2626",
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 16,
//     gap: 12,
//   },
//   warningText: {
//     color: "#fff",
//     fontSize: 14,
//     flex: 1,
//     lineHeight: 18,
//   },
//   errorContainer: {
//     backgroundColor: "#ffebee",
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 16,
//     gap: 12,
//     borderWidth: 1,
//     borderColor: "#ffcdd2",
//   },
//   errorText: {
//     color: "#d32f2f",
//     fontSize: 14,
//     flex: 1,
//   },
//   formCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   formTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 4,
//   },
//   formSubtitle: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 20,
//   },
//   inputContainer: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#333",
//     marginBottom: 6,
//   },
//   required: {
//     color: "#d32f2f",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     fontSize: 16,
//     backgroundColor: "#fff",
//     color: "#333",
//   },
//   selectInput: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },
//   selectText: {
//     fontSize: 16,
//     color: "#333",
//     flex: 1,
//   },
//   placeholder: {
//     color: "#999",
//   },
//   row: {
//     flexDirection: "row",
//   },
//   checkboxContainer: {
//     marginBottom: 16,
//   },
//   checkbox: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 12,
//   },
//   checkboxText: {
//     fontSize: 14,
//     color: "#333",
//     flex: 1,
//     lineHeight: 20,
//   },
//   linkText: {
//     color: "#d32f2f",
//     fontWeight: "500",
//   },
//   travelerForm: {
//     backgroundColor: "#f8f9fa",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#e9ecef",
//   },
//   travelerTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 16,
//   },
//   continueButton: {
//     backgroundColor: "#d32f2f",
//     paddingVertical: 16,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   continueButtonDisabled: {
//     opacity: 0.6,
//   },
//   continueButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContainer: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "80%",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   modalScrollView: {
//     maxHeight: 400,
//   },
//   modalOption: {
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   modalOptionText: {
//     fontSize: 16,
//     color: "#333",
//   },
//   modalLoading: {
//     padding: 20,
//     alignItems: "center",
//     gap: 12,
//   },
//   modalError: {
//     padding: 20,
//     textAlign: "center",
//     color: "#d32f2f",
//   },
//   datePickerContainer: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   datePicker: {
//     height: 200,
//   },
//   cancelText: {
//     fontSize: 16,
//     color: "#666",
//   },
//   doneText: {
//     fontSize: 16,
//     color: "#DC2626",
//     fontWeight: "600",
//   },
// });
