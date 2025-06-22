"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

interface TravelerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
}

export default function TravelerDetailsScreen() {
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.global.cartItems);
  const selectedFlight = useSelector(
    (state: RootState) => state.global.selectedFlight
  );

  const [travelerInfo, setTravelerInfo] = useState<TravelerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "MALE",
    passportNumber: "",
    passportExpiry: "",
    nationality: "",
  });

  const [errors, setErrors] = useState<Partial<TravelerInfo>>({});

  const validateForm = () => {
    const newErrors: Partial<TravelerInfo> = {};

    if (!travelerInfo.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!travelerInfo.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!travelerInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(travelerInfo.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!travelerInfo.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!travelerInfo.dateOfBirth.trim()) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TravelerInfo, value: string) => {
    setTravelerInfo((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Navigate to payment or booking confirmation
      Alert.alert(
        "Success",
        "Traveler details saved! Proceeding to payment...",
        [
          {
            text: "OK",
            //   onPress: () => router.push("/payment"),
          },
        ]
      );
    }
  };

  const formatCurrency = (amount: any, currency = "NGN") => {
    const symbol = currency === "NGN" ? "₦" : "$";
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item?.price?.total || item?.price?.grandTotal || 0;
      return total + Number(price);
    }, 0);
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
        <Text style={styles.headerTitle}>Traveler Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Flight Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Flight Summary</Text>
          <Text style={styles.summaryText}>
            {cartItems.length} flight{cartItems.length > 1 ? "s" : ""} selected
          </Text>
          <Text style={styles.summaryPrice}>
            Total:{" "}
            {formatCurrency(calculateTotal(), cartItems[0]?.price?.currency)}
          </Text>
        </View>

        {/* Traveler Information Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Primary Traveler Information</Text>
          <Text style={styles.formSubtitle}>
            Please provide details for the main traveler
          </Text>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.row}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}
              >
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  value={travelerInfo.firstName}
                  onChangeText={(value) =>
                    handleInputChange("firstName", value)
                  }
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  value={travelerInfo.lastName}
                  onChangeText={(value) => handleInputChange("lastName", value)}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={travelerInfo.email}
                onChangeText={(value) => handleInputChange("email", value)}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={travelerInfo.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth *</Text>
              <TextInput
                style={[styles.input, errors.dateOfBirth && styles.inputError]}
                value={travelerInfo.dateOfBirth}
                onChangeText={(value) =>
                  handleInputChange("dateOfBirth", value)
                }
                placeholder="DD/MM/YYYY"
              />
              {errors.dateOfBirth && (
                <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    travelerInfo.gender === "MALE" &&
                      styles.genderButtonSelected,
                  ]}
                  onPress={() => handleInputChange("gender", "MALE")}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      travelerInfo.gender === "MALE" &&
                        styles.genderButtonTextSelected,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    travelerInfo.gender === "FEMALE" &&
                      styles.genderButtonSelected,
                  ]}
                  onPress={() => handleInputChange("gender", "FEMALE")}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      travelerInfo.gender === "FEMALE" &&
                        styles.genderButtonTextSelected,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Travel Documents */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Travel Documents (Optional)</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Passport Number</Text>
              <TextInput
                style={styles.input}
                value={travelerInfo.passportNumber}
                onChangeText={(value) =>
                  handleInputChange("passportNumber", value)
                }
                placeholder="Enter passport number"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Passport Expiry Date</Text>
              <TextInput
                style={styles.input}
                value={travelerInfo.passportExpiry}
                onChangeText={(value) =>
                  handleInputChange("passportExpiry", value)
                }
                placeholder="DD/MM/YYYY"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nationality</Text>
              <TextInput
                style={styles.input}
                value={travelerInfo.nationality}
                onChangeText={(value) =>
                  handleInputChange("nationality", value)
                }
                placeholder="Enter nationality"
              />
            </View>
          </View>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.noticeText}>
            Please ensure all details match your travel documents exactly as
            they appear on your passport or ID.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#d32f2f",
  },
  errorText: {
    fontSize: 12,
    color: "#d32f2f",
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  genderButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  genderButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  genderButtonTextSelected: {
    color: "#fff",
  },
  noticeCard: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 14,
    color: "#1976d2",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  continueButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
