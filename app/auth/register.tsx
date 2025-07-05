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
import { setNewUserId } from "../../redux/slices/authSlice";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (!email) return Alert.alert("Validation", "Email is required");
    if (!agree) return Alert.alert("Validation", "You must agree to the terms");
    setLoading(true);
    try {
      const res = await api.post("/account", { email });
      dispatch(setNewUserId(res.data.data.id));
      router.push("/auth/create-password");
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#E5E5E5" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
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
            <Text style={styles.title}>Create Account</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Unlock easy flight bookings, personalized{"\n"}
              travel deals, and quick access to all your{"\n"}
              trips in one place.
            </Text>

            {/* Email Input */}
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />

            {/* Checkbox Row */}
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAgree(!agree)}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.checkboxBox, agree && styles.checkboxChecked]}
                >
                  {agree && <View style={styles.checkboxDot} />}
                </View>
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                I agree with <Text style={styles.brand}>Manwhit Aroes</Text>
                <Text> </Text>
                <Text
                  style={styles.link}
                  onPress={() => {
                    /* open terms link */
                  }}
                >
                  Terms
                </Text>
                <Text> and </Text>
                <Text
                  style={styles.link}
                  onPress={() => {
                    /* open conditions link */
                  }}
                >
                  Conditions
                </Text>
              </Text>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={[styles.button, !agree && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading || !agree}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? "Creating..." : "Get Started"}
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
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: "Inter",
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
    fontFamily: "inter",
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#005ce6",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#005ce6",
    borderColor: "#005ce6",
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#fff",
  },
  checkboxText: {
    fontSize: 14,
    color: "#444",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  brand: {
    color: "#222",
    fontWeight: "bold",
  },
  link: {
    color: "#005ce6",
    textDecorationLine: "underline",
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
