// screens/SplashScreen.tsx
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export default function SplashScreen() {
  const router = useRouter();
  const hasSeenIntro = useSelector(
    (state: RootState) => state.auth.hasSeenIntro
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasSeenIntro) {
        router.replace("/auth/login");
      } else {
        router.replace("/intro/get-started");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/Manwhit-Logo.png")}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
});
