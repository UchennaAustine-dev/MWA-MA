import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { updateUserInfo, type UserData } from "../../lib/userAPI";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userData: UserData;
  userId: string;
  onSave: (data: UserData) => void;
}

const { height: screenHeight } = Dimensions.get("window");

export default function EditProfileModal({
  visible,
  onClose,
  userData,
  userId,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<UserData>(userData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<UserData>>({});
  const slideAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    setFormData(userData);
    setErrors({});
  }, [userData]);

  // Animate modal slide in/out
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: false, // Changed to false for layout animations
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false, // Changed to false for layout animations
      }).start();
    }
  }, [visible, slideAnim]);

  const handleInputChange = useCallback(
    (field: keyof UserData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    },
    [errors]
  );

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<UserData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fix the errors before submitting"
      );
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    setLoading(true);
    try {
      // Prepare data matching backend expected fields
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        nationality: formData.nationality,
        dob: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : undefined,
        passportNo: formData.passportNumber,
        passportExpiry: formData.passportExpiry
          ? new Date(formData.passportExpiry).toISOString()
          : undefined,
        gender: formData.gender,
        phone: formData.phoneNumber,
      };

      const updatedUser = await updateUserInfo(userId, payload);

      if (updatedUser) {
        Alert.alert("Success", "Profile updated successfully", [
          {
            text: "OK",
            onPress: () => {
              onSave({
                ...formData,
                email: userData.email, // Keep email unchanged
              });
              onClose();
            },
          },
        ]);
      } else {
        throw new Error("Failed to update user information");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Simplified animation - just opacity for backdrop
  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={styles.backdropTouch} onPress={onClose} />
        </Animated.View>

        <View style={styles.container}>
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.dragIndicator} />
              <View style={styles.headerContent}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#000000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={styles.placeholder} />
              </View>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Warning Banner */}
              <View style={styles.warningBanner}>
                <Ionicons name="information-circle" size={20} color="#DC2626" />
                <Text style={styles.warningText}>
                  Complete your profile to get the best experience with Manwhit
                  Aroes
                </Text>
              </View>

              {/* Form Fields */}
              <View style={styles.form}>
                {/* Name Fields */}
                <View style={styles.row}>
                  <View
                    style={[
                      styles.inputGroup,
                      styles.halfWidth,
                      styles.marginRight,
                    ]}
                  >
                    <Text style={styles.label}>First Name *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.firstName && styles.inputError,
                      ]}
                      value={formData.firstName}
                      onChangeText={(value) =>
                        handleInputChange("firstName", value)
                      }
                      placeholder="Enter first name"
                      placeholderTextColor="#999999"
                      autoCapitalize="words"
                    />
                    {errors.firstName && (
                      <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.inputGroup,
                      styles.halfWidth,
                      styles.marginLeft,
                    ]}
                  >
                    <Text style={styles.label}>Last Name *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.lastName && styles.inputError,
                      ]}
                      value={formData.lastName}
                      onChangeText={(value) =>
                        handleInputChange("lastName", value)
                      }
                      placeholder="Enter last name"
                      placeholderTextColor="#999999"
                      autoCapitalize="words"
                    />
                    {errors.lastName && (
                      <Text style={styles.errorText}>{errors.lastName}</Text>
                    )}
                  </View>
                </View>

                {/* Email (Read-only) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={[styles.input, styles.readOnlyInput]}
                    value={formData.email}
                    editable={false}
                    placeholder="Email address"
                    placeholderTextColor="#999999"
                  />
                  <Text style={styles.helperText}>Email cannot be changed</Text>
                </View>

                {/* Phone Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.phoneNumber && styles.inputError,
                    ]}
                    value={formData.phoneNumber}
                    onChangeText={(value) =>
                      handleInputChange("phoneNumber", value)
                    }
                    placeholder="Enter phone number"
                    placeholderTextColor="#999999"
                    keyboardType="phone-pad"
                  />
                  {errors.phoneNumber && (
                    <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                  )}
                </View>

                {/* Gender and Date of Birth */}
                <View style={styles.row}>
                  <View
                    style={[
                      styles.inputGroup,
                      styles.halfWidth,
                      styles.marginRight,
                    ]}
                  >
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={formData.gender}
                        onValueChange={(value) =>
                          handleInputChange("gender", value)
                        }
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                      >
                        <Picker.Item label="Select Gender" value="" />
                        <Picker.Item label="Male" value="Male" />
                        <Picker.Item label="Female" value="Female" />
                        <Picker.Item label="Other" value="Other" />
                        <Picker.Item
                          label="Prefer not to say"
                          value="Prefer not to say"
                        />
                      </Picker>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.inputGroup,
                      styles.halfWidth,
                      styles.marginLeft,
                    ]}
                  >
                    <Text style={styles.label}>Date of Birth</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.dateOfBirth}
                      onChangeText={(value) =>
                        handleInputChange("dateOfBirth", value)
                      }
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#999999"
                    />
                  </View>
                </View>

                {/* Nationality */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nationality</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.nationality}
                    onChangeText={(value) =>
                      handleInputChange("nationality", value)
                    }
                    placeholder="Enter nationality"
                    placeholderTextColor="#999999"
                    autoCapitalize="words"
                  />
                </View>

                {/* Passport Information */}
                <View style={styles.row}>
                  <View
                    style={[
                      styles.inputGroup,
                      styles.halfWidth,
                      styles.marginRight,
                    ]}
                  >
                    <Text style={styles.label}>Passport Number</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.passportNumber}
                      onChangeText={(value) =>
                        handleInputChange("passportNumber", value)
                      }
                      placeholder="Enter passport number"
                      placeholderTextColor="#999999"
                      autoCapitalize="characters"
                    />
                  </View>
                  <View
                    style={[
                      styles.inputGroup,
                      styles.halfWidth,
                      styles.marginLeft,
                    ]}
                  >
                    <Text style={styles.label}>Passport Expiry</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.passportExpiry}
                      onChangeText={(value) =>
                        handleInputChange("passportExpiry", value)
                      }
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#999999"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  loading && styles.saveButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
  },
  backdropTouch: {
    flex: 1,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: screenHeight * 0.9,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E5E5",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "RedHatDisplay-Bold",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#DC2626",
    lineHeight: 20,
    fontFamily: "Inter",
  },
  form: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  marginRight: {
    marginRight: 8,
  },
  marginLeft: {
    marginLeft: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#FFFFFF",
    minHeight: 50,
    fontFamily: "RedHatDisplay-Regular",
  },
  readOnlyInput: {
    backgroundColor: "#F8F9FA",
    color: "#666666",
  },
  inputError: {
    borderColor: "#DC2626",
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 4,
    fontWeight: "500",
  },
  helperText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#000000",
  },
  pickerItem: {
    fontSize: 16,
    color: "#000000",
    fontFamily: "RedHatDisplay-Regular",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Bold",
  },
});
