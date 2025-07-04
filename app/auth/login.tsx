import { setUser } from "@/redux/slices/userSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import { useDispatch } from "react-redux";
import { api } from "../../lib/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁️ Password toggle
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email) return Alert.alert("Error", "Email is required");
    setLoading(true);
    try {
      await api.post("/account/login", { email });
      setShowPasswordInput(true);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPassword = async () => {
    if (!password) return Alert.alert("Error", "Password is required");
    setLoading(true);
    try {
      const res = await api.post(`/account/${email}/check-password`, {
        password,
      });
      dispatch(setUser(res.data.data));
      router.replace("/(tabs)/flights");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Incorrect password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.outer}>
          <View style={styles.container}>
            <Image
              source={require("../../assets/images/Manwhit-Logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Login to manage your bookings, track your trips, and access
              exclusive travel deals.
            </Text>

            {/* Email Label + Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
            </View>

            {/* Password Label + Input */}
            {showPasswordInput && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      style={styles.passwordInput}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="password"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((prev) => !prev)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={22}
                        color="#777"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.button,
                ((showPasswordInput && !password) ||
                  (!showPasswordInput && !email)) && { opacity: 0.6 },
              ]}
              onPress={showPasswordInput ? handleCheckPassword : handleLogin}
              disabled={loading || (showPasswordInput ? !password : !email)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? showPasswordInput
                    ? "Logging in..."
                    : "Checking..."
                  : showPasswordInput
                  ? "Login"
                  : "Next"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.bottomText}>
              Don't have an account?
              <Text
                style={styles.link}
                onPress={() => router.replace("/auth/register")}
              >
                {" "}
                Register
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    paddingVertical: 32,
    paddingHorizontal: 20,
    width: "92%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  logo: {
    width: 90,
    height: 60,
    marginBottom: 18,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111",
    textAlign: "center",
    fontFamily: "RedHatDisplay-Bold",
  },
  subtitle: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: "Inter",
  },
  inputGroup: {
    width: "100%",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
    fontFamily: "RedHatDisplay-Regular",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    fontFamily: "RedHatDisplay-Regular",
    backgroundColor: "#fff",
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
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "RedHatDisplay-Regular",
  },
  forgotText: {
    color: "#005ce6",
    fontSize: 14,
    alignSelf: "flex-end",
    marginBottom: 18,
    marginTop: 6,
    marginRight: 2,
    fontWeight: "bold",
    fontFamily: "Inter",
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
    fontWeight: "bold",
    fontFamily: "RedHatDisplay-Bold",
  },
  bottomText: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    fontFamily: "Inter",
  },
  link: {
    color: "#005ce6",
    fontWeight: "bold",
    marginLeft: 4,
  },
});
