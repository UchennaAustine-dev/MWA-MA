import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { api } from "../../lib/api";
import { RootState } from "../../redux/store";

export default function CreatePasswordScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = useSelector((state: RootState) => state.user.newUserId);
  const router = useRouter();

  // Refs for inputs to manage focus
  const lastNameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleCreate = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName || !password) {
      return Alert.alert("Validation", "All fields are required");
    }

    setLoading(true);
    try {
      await api.patch(`/account/${userId}/create-password`, {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        password,
      });
      Alert.alert("Success", "Account created successfully");
      router.replace("/auth/login");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.outer}>
              <View style={styles.container}>
                {/* Logo */}
                <Image
                  source={require("../../assets/images/Manwhit-Logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />

                {/* Title */}
                <Text style={styles.title}>Set Up Your Profile</Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>
                  Enter your details and create a password to complete your
                  account setup.
                </Text>

                {/* First Name */}
                <TextInput
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                  blurOnSubmit={false}
                />

                {/* Last Name */}
                <TextInput
                  ref={lastNameRef}
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />

                {/* Password with visibility toggle */}
                <View style={styles.passwordWrapper}>
                  <TextInput
                    ref={passwordRef}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.passwordInput}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleCreate}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.eyeIcon}
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                    accessible
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={24}
                      color="#777"
                    />
                  </TouchableOpacity>
                </View>

                {/* Button */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    (!firstName.trim() || !lastName.trim() || !password) && {
                      opacity: 0.6,
                    },
                  ]}
                  onPress={handleCreate}
                  disabled={
                    loading ||
                    !firstName.trim() ||
                    !lastName.trim() ||
                    !password
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Creating..." : "Create Account"}
                  </Text>
                </TouchableOpacity>

                {/* Login Link */}
                <Text style={styles.loginRow}>
                  Already have an account?
                  <Text
                    style={styles.loginLink}
                    onPress={() => router.replace("/auth/login")}
                  >
                    {" "}
                    Login
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E5E5E5",
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  outer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  container: {
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 60,
    marginBottom: 18,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    // fontWeight: "bold",
    marginBottom: 8,
    color: "#111",
    textAlign: "center",
    fontFamily: "RedHatDisplay-Bold",
  },
  subtitle: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    fontFamily: "Inter",
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontFamily: "RedHatDisplay-Regular",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "RedHatDisplay-Regular",
    color: "black",
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#FF3B30",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    // fontWeight: "bold",
    fontFamily: "RedHatDisplay-Bold",
  },
  loginRow: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    fontFamily: "RedHatDisplay-Regular",
  },
  loginLink: {
    color: "#005ce6",
    fontWeight: "bold",
    marginLeft: 4,
  },
});
