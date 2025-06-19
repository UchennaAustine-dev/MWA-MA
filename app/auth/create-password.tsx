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
import { useSelector } from "react-redux";
import { api } from "../../lib/api";
import { RootState } from "../../redux/store";

export default function CreatePasswordScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = useSelector((state: RootState) => state.auth.newUserId);
  const router = useRouter();

  const handleCreate = async () => {
    if (!firstName || !lastName || !password) {
      return Alert.alert("Validation", "All fields are required");
    }

    setLoading(true);
    try {
      await api.patch(`/account/${userId}/create-password`, {
        firstName,
        lastName,
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
          Enter your details and create a password to complete your account
          setup.
        </Text>

        {/* First Name */}
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />

        {/* Last Name */}
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />

        {/* Password */}
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        {/* Button */}
        <TouchableOpacity
          style={[
            styles.button,
            (!firstName || !lastName || !password) && { opacity: 0.6 },
          ]}
          onPress={handleCreate}
          disabled={loading || !firstName || !lastName || !password}
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
