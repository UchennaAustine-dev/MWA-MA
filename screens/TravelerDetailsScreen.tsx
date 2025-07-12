// import PhoneInput from "@/components/PhoneInput";
// import { getUserCart, storeSelectedOffer } from "@/lib/flightAPIs";
// import { createTraveler } from "@/lib/userAPI";
// import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { Picker } from "@react-native-picker/picker";
// import { useRouter } from "expo-router";
// import { useCallback, useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useDispatch, useSelector } from "react-redux";
// import { useCountries } from "../hooks/useCountries";
// import { setFlightOffrId, setTraveler } from "../redux/slices/flightSlice";
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
//   const selectedFlight = useSelector(
//     (state: RootState) => state.flight.selectedFlight
//   );

//   const [cartItems, setCartItems] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCartData = async () => {
//       try {
//         setLoading(true);
//         if (user?.id) {
//           const userCart: any[] = await getUserCart(user.id);
//           setCartItems(Array.isArray(userCart) ? userCart : []);
//         } else {
//           setCartItems([]);
//         }
//       } catch (error) {
//         Alert.alert("Error", "Failed to load cart items");
//         setCartItems([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCartData();
//   }, [user?.id]);

//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [agreedToTerms, setAgreedToTerms] = useState(false);
//   const [flightOfferId, setFlightOfferId] = useState<string | null>(null);

//   const { countries, loadingCountries } = useCountries();

//   const [billingInfo, setBillingInfo] = useState<BillingFormData>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     nationality: "",
//   });
//   const [billingFormSubmitted, setBillingFormSubmitted] = useState(false);

//   const passengerCount = selectedFlight?.travelerPricings?.length || 1;
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

//   const [showDatePicker, setShowDatePicker] = useState<number | null>(null);
//   const [showExpiryPicker, setShowExpiryPicker] = useState<number | null>(null);
//   const [tempDate, setTempDate] = useState(new Date());
//   const genderOptions = ["MALE", "FEMALE"];

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
//     if (user && billingFormSubmitted) {
//       setTravelers((prev) =>
//         prev.map((t, i) =>
//           i === 0
//             ? {
//                 ...t,
//                 firstName: user?.firstName || billingInfo.firstName,
//                 lastName: user?.lastName || billingInfo.lastName,
//                 email: user?.email || billingInfo.email,
//                 phone: user?.phone || billingInfo.phone,
//                 nationality: user?.nationality || billingInfo.nationality,
//                 countryCode: user?.nationality || billingInfo.nationality,
//                 issuanceCountry: user?.nationality || billingInfo.nationality,
//               }
//             : t
//         )
//       );
//     }
//   }, [passengerCount, user, billingFormSubmitted, billingInfo]);

//   useEffect(() => {
//     if (!selectedFlight || flightOfferId) return;
//     let isMounted = true;
//     const persistBooking = async () => {
//       try {
//         const result = await storeSelectedOffer({ offerData: selectedFlight });
//         if (isMounted && result.flightOfferId) {
//           setFlightOfferId(result.flightOfferId);
//           dispatch(setFlightOffrId(result.flightOfferId));
//         }
//       } catch (error) {
//         if (isMounted) {
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
//     };
//   }, [selectedFlight, flightOfferId, dispatch]);

//   const updateTraveler = useCallback(
//     (index: number, field: keyof TravelerFormData, value: string) => {
//       setTravelers((prev) =>
//         prev.map((traveler, i) =>
//           i === index ? { ...traveler, [field]: value } : traveler
//         )
//       );
//     },
//     []
//   );

//   const isBillingFormValid = () => {
//     return (
//       billingInfo.firstName.trim() &&
//       billingInfo.lastName.trim() &&
//       billingInfo.email.trim() &&
//       billingInfo.phone.trim() &&
//       billingInfo.nationality
//     );
//   };

//   const isTravelerFormValid = () => {
//     if (!agreedToTerms) return false;
//     return travelers.every(
//       (traveler) =>
//         traveler.firstName.trim() &&
//         traveler.lastName.trim() &&
//         traveler.gender &&
//         traveler.dateOfBirth &&
//         traveler.email.trim() &&
//         traveler.phone.trim() &&
//         traveler.nationality &&
//         traveler.birthPlace.trim() &&
//         traveler.passportNumber.trim() &&
//         traveler.passportExpiry
//     );
//   };

//   const handleBillingSubmit = () => {
//     if (!isBillingFormValid()) {
//       setError("Please fill in all required billing information.");
//       Alert.alert("Error", "Please fill in all required billing information.");
//       return;
//     }
//     setBillingFormSubmitted(true);
//     Alert.alert(
//       "Success",
//       "Billing information saved. Please proceed with traveler details."
//     );
//   };

//   const handleSubmit = async () => {
//     if (!agreedToTerms) {
//       setError("Please agree to the terms and conditions.");
//       Alert.alert("Error", "Please agree to the terms and conditions.");
//       return;
//     }
//     if (!flightOfferId) {
//       setError("Booking ID not available yet. Please wait.");
//       Alert.alert("Error", "Booking ID not available yet. Please wait.");
//       return;
//     }
//     for (let i = 0; i < travelers.length; i++) {
//       const traveler = travelers[i];
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
//         return;
//       }
//     }
//     setIsLoading(true);
//     setError(null);

//     try {
//       const travelerResults = [];
//       for (const traveler of travelers) {
//         const travelerData = {
//           flightOfferId,
//           ...traveler,
//         };
//         const stateTravelerDetails = await createTraveler(travelerData);
//         travelerResults.push(stateTravelerDetails);
//       }
//       dispatch(setTraveler(travelerResults));
//       router.push("/full-summary");
//       Alert.alert("Success", "All travelers created successfully!");
//     } catch (err: any) {
//       setError(err.message || "Failed to create travelers. Please try again.");
//       Alert.alert(
//         "Error",
//         err.message || "Failed to create travelers. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
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
//           selectedDate.toISOString().split("T")[0]
//         );
//       }
//     } else {
//       if (selectedDate) {
//         setTempDate(selectedDate);
//       }
//     }
//   };

//   const confirmIOSDate = (travelerIndex: number, field: string) => {
//     updateTraveler(
//       travelerIndex,
//       field as keyof TravelerFormData,
//       tempDate.toISOString().split("T")[0]
//     );
//     setShowDatePicker(null);
//     setShowExpiryPicker(null);
//   };

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
//           {billingFormSubmitted
//             ? "Traveler Information"
//             : "Billing Information"}
//         </Text>
//       </View>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {!billingFormSubmitted && (
//           <View style={styles.formSection}>
//             <Text style={styles.sectionTitle}>Billing Information</Text>
//             <Text style={styles.label}>First Name</Text>
//             <TextInput
//               style={styles.input}
//               value={billingInfo.firstName}
//               onChangeText={(text) =>
//                 setBillingInfo((prev) => ({ ...prev, firstName: text }))
//               }
//             />
//             <Text style={styles.label}>Last Name</Text>
//             <TextInput
//               style={styles.input}
//               value={billingInfo.lastName}
//               onChangeText={(text) =>
//                 setBillingInfo((prev) => ({ ...prev, lastName: text }))
//               }
//             />
//             <Text style={styles.label}>Email</Text>
//             <TextInput
//               style={styles.input}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               value={billingInfo.email}
//               onChangeText={(text) =>
//                 setBillingInfo((prev) => ({ ...prev, email: text }))
//               }
//             />
//             <Text style={styles.label}>Phone</Text>
//             <PhoneInput
//               value={billingInfo.phone}
//               onChange={(val) =>
//                 setBillingInfo((prev) => ({ ...prev, phone: val }))
//               }
//               placeholder="Enter phone number"
//             />
//             <Text style={styles.label}>Nationality</Text>
//             {loadingCountries ? (
//               <ActivityIndicator size="small" color="#d32f2f" />
//             ) : (
//               <Picker
//                 selectedValue={billingInfo.nationality}
//                 onValueChange={(value) =>
//                   setBillingInfo((prev) => ({
//                     ...prev,
//                     nationality: value,
//                   }))
//                 }
//                 style={styles.input}
//               >
//                 <Picker.Item label="Select Nationality" value="" />
//                 {countries.map((country: any) => (
//                   <Picker.Item
//                     key={country.iso2}
//                     label={`${country.name} (${country.iso2})`}
//                     value={country.iso2}
//                   />
//                 ))}
//               </Picker>
//             )}
//             <TouchableOpacity
//               style={styles.saveButton}
//               onPress={handleBillingSubmit}
//             >
//               <Text style={styles.saveButtonText}>Save Billing Info</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {billingFormSubmitted && (
//           <View style={styles.formSection}>
//             <Text style={styles.sectionTitle}>Traveler Details</Text>
//             {travelers.map((traveler, idx) => (
//               <View
//                 key={`${traveler.passportNumber || idx}-${idx}`}
//                 style={styles.travelerForm}
//               >
//                 <Text style={styles.travelerTitle}>Traveler {idx + 1}</Text>
//                 <Text style={styles.label}>First Name</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={traveler.firstName}
//                   onChangeText={(text) =>
//                     updateTraveler(idx, "firstName", text)
//                   }
//                 />
//                 <Text style={styles.label}>Last Name</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={traveler.lastName}
//                   onChangeText={(text) => updateTraveler(idx, "lastName", text)}
//                 />
//                 <Text style={styles.label}>Gender</Text>
//                 <View style={styles.genderRow}>
//                   {genderOptions.map((option) => (
//                     <TouchableOpacity
//                       key={option}
//                       style={[
//                         styles.genderButton,
//                         traveler.gender === option &&
//                           styles.genderButtonSelected,
//                       ]}
//                       onPress={() => updateTraveler(idx, "gender", option)}
//                     >
//                       <Text
//                         style={[
//                           styles.genderButtonText,
//                           traveler.gender === option &&
//                             styles.genderButtonTextSelected,
//                         ]}
//                       >
//                         {option}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//                 <Text style={styles.label}>Date of Birth</Text>
//                 <TouchableOpacity
//                   style={styles.input}
//                   onPress={() => setShowDatePicker(idx)}
//                 >
//                   <Text>
//                     {traveler.dateOfBirth
//                       ? traveler.dateOfBirth
//                       : "Select Date of Birth"}
//                   </Text>
//                 </TouchableOpacity>
//                 {showDatePicker === idx && (
//                   <DateTimePicker
//                     value={
//                       traveler.dateOfBirth
//                         ? new Date(traveler.dateOfBirth)
//                         : new Date()
//                     }
//                     mode="date"
//                     display="default"
//                     onChange={(event, date) =>
//                       handleDateChange(event, date, idx, "dateOfBirth")
//                     }
//                   />
//                 )}
//                 <Text style={styles.label}>Email</Text>
//                 <TextInput
//                   style={styles.input}
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   value={traveler.email}
//                   onChangeText={(text) => updateTraveler(idx, "email", text)}
//                 />
//                 <Text style={styles.label}>Phone</Text>
//                 <PhoneInput
//                   value={traveler.phone}
//                   onChange={(val) => updateTraveler(idx, "phone", val)}
//                   placeholder="Enter phone number"
//                 />
//                 <Text style={styles.label}>Nationality</Text>
//                 {loadingCountries ? (
//                   <ActivityIndicator size="small" color="#d32f2f" />
//                 ) : (
//                   <Picker
//                     selectedValue={traveler.nationality}
//                     onValueChange={(value) =>
//                       updateTraveler(idx, "nationality", value)
//                     }
//                     style={styles.input}
//                   >
//                     <Picker.Item label="Select Nationality" value="" />
//                     {countries.map((country: any) => (
//                       <Picker.Item
//                         key={country.iso2}
//                         label={`${country.name} (${country.iso2})`}
//                         value={country.iso2}
//                       />
//                     ))}
//                   </Picker>
//                 )}
//                 <Text style={styles.label}>Country of Passport Issuance</Text>
//                 {loadingCountries ? (
//                   <ActivityIndicator size="small" color="#d32f2f" />
//                 ) : (
//                   <Picker
//                     selectedValue={traveler.issuanceCountry}
//                     onValueChange={(value) =>
//                       updateTraveler(idx, "issuanceCountry", value)
//                     }
//                     style={styles.input}
//                   >
//                     <Picker.Item label="Select Country" value="" />
//                     {countries.map((country: any) => (
//                       <Picker.Item
//                         key={country.iso2}
//                         label={`${country.name} (${country.iso2})`}
//                         value={country.iso2}
//                       />
//                     ))}
//                   </Picker>
//                 )}
//                 <Text style={styles.label}>Place of Birth</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={traveler.birthPlace}
//                   onChangeText={(text) =>
//                     updateTraveler(idx, "birthPlace", text)
//                   }
//                 />
//                 <Text style={styles.label}>Passport Number</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={traveler.passportNumber}
//                   maxLength={9}
//                   keyboardType="default" // or "ascii-capable" on iOS
//                   autoCorrect={false}
//                   autoCapitalize="characters"
//                   importantForAutofill="no"
//                   onChangeText={(text) => {
//                     const sanitized = text
//                       .replace(/[^a-zA-Z0-9]/g, "")
//                       .toUpperCase()
//                       .slice(0, 9);
//                     updateTraveler(idx, "passportNumber", sanitized);
//                   }}
//                   placeholder="Enter Passport Number (max 9 chars)"
//                 />

//                 <Text style={styles.inputHint}>Maximum 9 characters</Text>
//                 <Text style={styles.label}>Passport Expiry</Text>
//                 <TouchableOpacity
//                   style={styles.input}
//                   onPress={() => setShowExpiryPicker(idx)}
//                 >
//                   <Text>
//                     {traveler.passportExpiry
//                       ? traveler.passportExpiry
//                       : "Select Expiry Date"}
//                   </Text>
//                 </TouchableOpacity>
//                 {showExpiryPicker === idx && (
//                   <DateTimePicker
//                     value={
//                       traveler.passportExpiry
//                         ? new Date(traveler.passportExpiry)
//                         : new Date()
//                     }
//                     mode="date"
//                     display="default"
//                     onChange={(event, date) =>
//                       handleDateChange(event, date, idx, "passportExpiry")
//                     }
//                   />
//                 )}
//               </View>
//             ))}
//             <View style={styles.termsRow}>
//               <TouchableOpacity
//                 style={[
//                   styles.checkbox,
//                   agreedToTerms && styles.checkboxChecked,
//                 ]}
//                 onPress={() => setAgreedToTerms((prev) => !prev)}
//               >
//                 {agreedToTerms && (
//                   <Ionicons name="checkmark" size={18} color="#fff" />
//                 )}
//               </TouchableOpacity>
//               <Text style={styles.termsText}>
//                 I agree to the terms and conditions.
//               </Text>
//             </View>
//             <TouchableOpacity
//               style={[
//                 styles.saveButton,
//                 (!isTravelerFormValid() || isLoading) && { opacity: 0.6 },
//               ]}
//               onPress={handleSubmit}
//               disabled={!isTravelerFormValid() || isLoading}
//             >
//               <Text style={styles.saveButtonText}>
//                 {isLoading ? "Submitting..." : "Submit Travelers"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   header: {
//     backgroundColor: "#d32f2f",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   backButton: { padding: 8 },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#fff",
//     flex: 1,
//     textAlign: "center",
//     marginRight: 40,
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   content: { flex: 1 },
//   formSection: {
//     padding: 16,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     margin: 16,
//     marginBottom: 0,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#d32f2f",
//     marginBottom: 12,
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   travelerForm: {
//     marginBottom: 28,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//     paddingBottom: 16,
//   },
//   travelerTitle: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#000",
//     marginBottom: 8,
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   input: {
//     backgroundColor: "#f5f5f5",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 10,
//     fontSize: 14,
//     color: "#000",
//   },
//   inputHint: {
//     fontSize: 12,
//     color: "#888",
//     marginBottom: 10,
//     marginLeft: 2,
//   },
//   label: {
//     fontSize: 13,
//     color: "#333",
//     marginBottom: 4,
//     marginTop: 8,
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   saveButton: {
//     backgroundColor: "#d32f2f",
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: "center",
//     marginTop: 8,
//     marginBottom: 8,
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 15,
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   genderRow: {
//     flexDirection: "row",
//     gap: 10,
//     marginBottom: 10,
//   },
//   genderButton: {
//     backgroundColor: "#f5f5f5",
//     borderRadius: 6,
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//   },
//   genderButtonSelected: {
//     backgroundColor: "#d32f2f",
//   },
//   genderButtonText: {
//     color: "#333",
//     fontWeight: "500",
//   },
//   genderButtonTextSelected: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   termsRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//     marginTop: 8,
//   },
//   checkbox: {
//     width: 22,
//     height: 22,
//     borderWidth: 2,
//     borderColor: "#d32f2f",
//     borderRadius: 6,
//     marginRight: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#fff",
//   },
//   checkboxChecked: {
//     backgroundColor: "#d32f2f",
//   },
//   termsText: {
//     fontSize: 13,
//     color: "#333",
//   },
// });

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
  KeyboardAvoidingView,
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
        issuanceCountry: "",
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

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={billingInfo.lastName}
                onChangeText={(text) =>
                  setBillingInfo((prev) => ({ ...prev, lastName: text }))
                }
                returnKeyType="next"
                blurOnSubmit={false}
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
                returnKeyType="next"
                blurOnSubmit={false}
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
                <View key={`traveler-${idx}`} style={styles.travelerForm}>
                  <Text style={styles.travelerTitle}>Traveler {idx + 1}</Text>

                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={traveler.firstName}
                    onChangeText={(text) =>
                      updateTraveler(idx, "firstName", text)
                    }
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />

                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={traveler.lastName}
                    onChangeText={(text) =>
                      updateTraveler(idx, "lastName", text)
                    }
                    returnKeyType="next"
                    blurOnSubmit={false}
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
                    <Text
                      style={
                        traveler.dateOfBirth
                          ? styles.inputText
                          : styles.placeholderText
                      }
                    >
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
                    returnKeyType="next"
                    blurOnSubmit={false}
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

                  <Text style={styles.label}>Place of Birth</Text>
                  <TextInput
                    style={styles.input}
                    value={traveler.birthPlace}
                    onChangeText={(text) =>
                      updateTraveler(idx, "birthPlace", text)
                    }
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />

                  <Text style={styles.label}>Passport Number</Text>
                  <TextInput
                    style={styles.input}
                    value={traveler.passportNumber}
                    maxLength={9}
                    keyboardType="default"
                    autoCorrect={false}
                    autoCapitalize="characters"
                    importantForAutofill="no"
                    textContentType="none"
                    onChangeText={(text) => {
                      const sanitized = text
                        .replace(/[^a-zA-Z0-9]/g, "")
                        .toUpperCase()
                        .slice(0, 9);
                      updateTraveler(idx, "passportNumber", sanitized);
                    }}
                    placeholder="Enter Passport Number (max 9 chars)"
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                  <Text style={styles.inputHint}>Maximum 9 characters</Text>

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

                  <Text style={styles.label}>Passport Expiry</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowExpiryPicker(idx)}
                  >
                    <Text
                      style={
                        traveler.passportExpiry
                          ? styles.inputText
                          : styles.placeholderText
                      }
                    >
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#d32f2f",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
    fontFamily: "RedHatDisplay-Bold",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
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
    justifyContent: "center",
  },
  inputText: {
    color: "#000",
    fontSize: 14,
  },
  placeholderText: {
    color: "#999",
    fontSize: 14,
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
