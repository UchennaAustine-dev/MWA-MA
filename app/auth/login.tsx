import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { api } from "../../lib/api";
import { setUser } from "../../redux/slices/authSlice";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
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

  // Handler for forgot password link
  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  return (
    <View style={styles.outer}>
      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require("../../assets/images/Manwhit-Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>Welcome Back</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Login to manage your bookings, track your trips, and access exclusive
          travel deals.
        </Text>

        {/* Email Input */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Input */}
        {showPasswordInput && (
          <>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Button */}
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

        {/* Register Link */}
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
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 24,
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
  },
  subtitle: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
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
  },
  forgotText: {
    color: "#005ce6",
    fontSize: 14,
    alignSelf: "flex-end",
    marginBottom: 18,
    marginRight: 2,
    fontWeight: "bold",
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
  },
  bottomText: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
  },
  link: {
    color: "#005ce6",
    fontWeight: "bold",
    marginLeft: 4,
  },
});
