// import { Ionicons } from "@expo/vector-icons";
// import { useLocalSearchParams, useRouter } from "expo-router";
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

// const confirmPasswordRef = React.createRef<TextInput>();

// export default function CreateNewPasswordScreen() {
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const router = useRouter();
//   const { id } = useLocalSearchParams<{ id: string }>();

//   const handleCreateNewPassword = async () => {
//     if (!password || !confirmPassword) {
//       return Alert.alert("Error", "Please fill in all fields");
//     }
//     if (password !== confirmPassword) {
//       return Alert.alert("Error", "Passwords do not match");
//     }
//     setLoading(true);
//     try {
//       const response = await api.patch(`/${id}/complete`, { password });
//       Alert.alert(
//         "Success",
//         response.data.message || "Password updated successfully"
//       );
//       router.replace("/auth/login");
//     } catch (error: any) {
//       Alert.alert(
//         "Error",
//         error.response?.data?.message || "Failed to update password"
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
//             <View style={styles.outer}>
//               <View style={styles.container}>
//                 {/* Logo */}
//                 <Image
//                   source={require("../../assets/images/Manwhit-Logo.png")}
//                   style={styles.logo}
//                   resizeMode="contain"
//                 />

//                 <Text style={styles.title}>Create New Password</Text>
//                 <Text style={styles.subtitle}>
//                   Please enter your new password below to complete the reset
//                   process.
//                 </Text>

//                 {/* Password Input */}
//                 <View style={styles.inputGroup}>
//                   <Text style={styles.label}>New Password</Text>
//                   <View style={styles.passwordWrapper}>
//                     <TextInput
//                       placeholder="Enter new password"
//                       value={password}
//                       onChangeText={setPassword}
//                       secureTextEntry={!showPassword}
//                       style={styles.passwordInput}
//                       autoCapitalize="none"
//                       autoCorrect={false}
//                       textContentType="newPassword"
//                       returnKeyType="next"
//                       onSubmitEditing={() =>
//                         confirmPasswordRef.current?.focus()
//                       }
//                     />
//                     <TouchableOpacity
//                       onPress={() => setShowPassword((p) => !p)}
//                       hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//                       accessibilityLabel={
//                         showPassword ? "Hide password" : "Show password"
//                       }
//                       accessible
//                     >
//                       <Ionicons
//                         name={showPassword ? "eye-off" : "eye"}
//                         size={22}
//                         color="#777"
//                       />
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 {/* Confirm Password Input */}
//                 <View style={styles.inputGroup}>
//                   <Text style={styles.label}>Confirm Password</Text>
//                   <View style={styles.passwordWrapper}>
//                     <TextInput
//                       ref={confirmPasswordRef}
//                       placeholder="Confirm new password"
//                       value={confirmPassword}
//                       onChangeText={setConfirmPassword}
//                       secureTextEntry={!showConfirmPassword}
//                       style={styles.passwordInput}
//                       autoCapitalize="none"
//                       autoCorrect={false}
//                       textContentType="password"
//                       returnKeyType="done"
//                       onSubmitEditing={handleCreateNewPassword}
//                     />
//                     <TouchableOpacity
//                       onPress={() => setShowConfirmPassword((p) => !p)}
//                       hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//                       accessibilityLabel={
//                         showConfirmPassword ? "Hide password" : "Show password"
//                       }
//                       accessible
//                     >
//                       <Ionicons
//                         name={showConfirmPassword ? "eye-off" : "eye"}
//                         size={22}
//                         color="#777"
//                       />
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 {/* Submit Button */}
//                 <TouchableOpacity
//                   style={[
//                     styles.button,
//                     (!password ||
//                       !confirmPassword ||
//                       password !== confirmPassword) && { opacity: 0.6 },
//                   ]}
//                   onPress={handleCreateNewPassword}
//                   disabled={
//                     loading ||
//                     !password ||
//                     !confirmPassword ||
//                     password !== confirmPassword
//                   }
//                   activeOpacity={0.8}
//                 >
//                   <Text style={styles.buttonText}>
//                     {loading ? "Updating..." : "Update Password"}
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   onPress={() => router.replace("/auth/login")}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={styles.linkText}>Back to Login</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </TouchableWithoutFeedback>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   flex: {
//     flex: 1,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 24,
//   },
//   outer: {
//     backgroundColor: "#fff",
//     paddingVertical: 32,
//     paddingHorizontal: 20,
//     width: "92%",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 10,
//     elevation: 3,
//   },
//   container: {
//     width: "100%",
//     alignItems: "center",
//   },
//   logo: {
//     width: 90,
//     height: 60,
//     marginBottom: 24,
//     marginTop: 10,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
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
//   inputGroup: {
//     width: "100%",
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginBottom: 6,
//     color: "#333",
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   passwordWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: "100%",
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     borderRadius: 10,
//     paddingHorizontal: 14,
//     backgroundColor: "#fff",
//   },
//   passwordInput: {
//     flex: 1,
//     paddingVertical: 14,
//     fontSize: 16,
//     fontFamily: "RedHatDisplay-Regular",
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
//     fontWeight: "bold",
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   linkText: {
//     fontSize: 14,
//     color: "#005ce6",
//     fontWeight: "bold",
//     textAlign: "center",
//     marginTop: 12,
//     fontFamily: "Inter",
//   },
// });

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function CreateNewPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { recoveryCode } = useLocalSearchParams<{ recoveryCode: string }>();

  const handleCreateNewPassword = async () => {
    if (!password || !confirmPassword) {
      return Alert.alert("Error", "Please fill in all fields");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }
    if (!recoveryCode) {
      return Alert.alert("Error", "Recovery code is missing");
    }
    setLoading(true);
    try {
      const response = await api.post("/account/reset-password", {
        recoveryCode,
        newPassword: password,
      });
      Alert.alert(
        "Success",
        response.data.message || "Password updated successfully"
      );
      router.replace("/auth/login");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update password"
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
                <Image
                  source={require("../../assets/images/Manwhit-Logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />

                <Text style={styles.title}>Create New Password</Text>
                <Text style={styles.subtitle}>
                  Please enter your new password below to complete the reset
                  process.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      placeholder="Enter new password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      style={styles.passwordInput}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="newPassword"
                      returnKeyType="next"
                      onSubmitEditing={() =>
                        confirmPasswordRef.current?.focus()
                      }
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((p) => !p)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityLabel={
                        showPassword ? "Hide password" : "Show password"
                      }
                      accessible
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={22}
                        color="#777"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      ref={confirmPasswordRef}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      style={styles.passwordInput}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="password"
                      returnKeyType="done"
                      onSubmitEditing={handleCreateNewPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword((p) => !p)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityLabel={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      accessible
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off" : "eye"}
                        size={22}
                        color="#777"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    (!password ||
                      !confirmPassword ||
                      password !== confirmPassword) && { opacity: 0.6 },
                  ]}
                  onPress={handleCreateNewPassword}
                  disabled={
                    loading ||
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Updating..." : "Update Password"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.replace("/auth/login")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const confirmPasswordRef = React.createRef<TextInput>();

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
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
  container: {
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 60,
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
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
  inputGroup: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#333",
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
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
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
    fontWeight: "600",
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
