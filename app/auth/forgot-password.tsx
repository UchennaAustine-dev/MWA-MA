import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../lib/api";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  console.log("🔄 ForgotPasswordScreen rendered");

  const handleResetPassword = async () => {
    console.log("🚀 handleResetPassword called");
    console.log("📧 Email input:", email);
    console.log("✂️ Trimmed email:", email.trim());

    if (!email.trim()) {
      console.log("❌ Email validation failed - empty email");
      return Alert.alert("Error", "Please enter your email");
    }

    console.log("✅ Email validation passed");
    console.log("🔄 Setting loading to true");
    setLoading(true);

    try {
      console.log("🌐 Making API call to /account/request-reset-password");
      console.log("📦 Request payload:", { email: email.trim() });

      // Call the correct endpoint for requesting password reset
      const response = await api.post("/account/request-reset-password", {
        email: email.trim(),
      });

      console.log("✅ API call successful");
      console.log("📋 Response status:", response.status);
      console.log("📋 Response data:", response.data);
      console.log("💬 Response message:", response.data.message);

      Alert.alert(
        "Success",
        response.data.message || "Check your email for reset instructions"
      );

      console.log("🧭 Navigating to create-new-password screen");
      router.replace("/auth/create-new-password");
    } catch (error: any) {
      console.log("❌ API call failed");
      console.log("🔍 Error object:", error);
      console.log("🔍 Error response:", error.response);
      console.log("🔍 Error response data:", error.response?.data);
      console.log("🔍 Error response status:", error.response?.status);
      console.log("🔍 Error response headers:", error.response?.headers);
      console.log("🔍 Error message:", error.message);
      console.log("🔍 Error stack:", error.stack);

      // Log the full error structure
      if (error.response) {
        console.log("📊 Server responded with error:");
        console.log("   Status:", error.response.status);
        console.log("   Status Text:", error.response.statusText);
        console.log("   Data:", JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.log("📡 Network error - no response received:");
        console.log("   Request:", error.request);
      } else {
        console.log("⚙️ Request setup error:");
        console.log("   Message:", error.message);
      }

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send reset password email"
      );
    } finally {
      console.log("🔄 Setting loading to false");
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
            <View style={styles.container}>
              <Image
                source={require("../../assets/images/Manwhit-Logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address below to receive password reset
                instructions.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text) => {
                    console.log("📝 Email input changed:", text);
                    setEmail(text);
                  }}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    console.log("⌨️ Submit editing triggered");
                    handleResetPassword();
                  }}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, !email && { opacity: 0.6 }]}
                onPress={() => {
                  console.log("👆 Reset Password button pressed");
                  handleResetPassword();
                }}
                disabled={loading || !email.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Sending..." : "Reset Password"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  console.log("👆 Back to Login pressed");
                  router.replace("/auth/login");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  logo: { width: 90, height: 60, marginBottom: 24, marginTop: 10 },
  title: {
    fontSize: 24,
    marginBottom: 12,
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
  inputGroup: { width: "100%", marginBottom: 16 },
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
    fontFamily: "RedHatDisplay-Bold",
  },
  linkText: {
    fontSize: 14,
    color: "#005ce6",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
    fontFamily: "Inter",
  },
});
// import { useRouter } from "expo-router";
// import React, { useState } from "react";
// import {
//   Alert,
//   Image,
//   Keyboard,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { api } from "../../lib/api";

// export default function ForgotPasswordScreen() {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleResetPassword = async () => {
//     if (!email.trim()) {
//       return Alert.alert("Error", "Please enter your email");
//     }
//     setLoading(true);
//     try {
//       // Call the correct endpoint for requesting password reset
//       const response = await api.post("/account/request-reset-password", {
//         email: email.trim(),
//       });
//       Alert.alert(
//         "Success",
//         response.data.message || "Check your email for reset instructions"
//       );
//       router.replace("/auth/create-new-password");
//     } catch (error: any) {
//       Alert.alert(
//         "Error",
//         error.response?.data?.message || "Failed to send reset password email"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
//         <KeyboardAvoidingView
//           style={styles.flex}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContainer}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             <View style={styles.container}>
//               <Image
//                 source={require("../../assets/images/Manwhit-Logo.png")}
//                 style={styles.logo}
//                 resizeMode="contain"
//               />

//               <Text style={styles.title}>Forgot Password</Text>
//               <Text style={styles.subtitle}>
//                 Enter your email address below to receive password reset
//                 instructions.
//               </Text>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Email</Text>
//                 <TextInput
//                   placeholder="Enter your email"
//                   value={email}
//                   onChangeText={setEmail}
//                   style={styles.input}
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                   textContentType="emailAddress"
//                   returnKeyType="done"
//                   onSubmitEditing={handleResetPassword}
//                 />
//               </View>

//               <TouchableOpacity
//                 style={[styles.button, !email && { opacity: 0.6 }]}
//                 onPress={handleResetPassword}
//                 disabled={loading || !email.trim()}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.buttonText}>
//                   {loading ? "Sending..." : "Reset Password"}
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={() => router.replace("/auth/login")}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.linkText}>Back to Login</Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </TouchableWithoutFeedback>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#fff" },
//   flex: { flex: 1 },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 24,
//   },
//   container: {
//     width: "100%",
//     maxWidth: 400,
//     backgroundColor: "#fff",
//     paddingVertical: 32,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 10,
//     elevation: 3,
//   },
//   logo: { width: 90, height: 60, marginBottom: 24, marginTop: 10 },
//   title: {
//     fontSize: 24,
//     marginBottom: 12,
//     color: "#111",
//     textAlign: "center",
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   subtitle: {
//     fontSize: 15,
//     color: "#444",
//     textAlign: "center",
//     marginBottom: 24,
//     lineHeight: 22,
//     fontFamily: "Inter",
//   },
//   inputGroup: { width: "100%", marginBottom: 16 },
//   label: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginBottom: 6,
//     color: "#333",
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   input: {
//     width: "100%",
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     borderRadius: 10,
//     padding: 14,
//     fontSize: 16,
//     fontFamily: "RedHatDisplay-Regular",
//     backgroundColor: "#fff",
//   },
//   button: {
//     width: "100%",
//     backgroundColor: "#FF3B30",
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 18,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 18,
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   linkText: {
//     fontSize: 14,
//     color: "#005ce6",
//     fontWeight: "600",
//     textAlign: "center",
//     marginTop: 12,
//     fontFamily: "Inter",
//   },
// });
