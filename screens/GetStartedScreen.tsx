import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useDispatch } from "react-redux";
import { setHasSeenIntro } from "../redux/slices/authSlice";

const { width } = Dimensions.get("window");

const images = [
  require("../assets/images/arab-lady.png"),
  require("../assets/images/green-suite-lady.png"),
  require("../assets/images/woman-smilling.png"),
  require("../assets/images/family-flying.png"),
  require("../assets/images/hotel.jpg"),
  require("../assets/images/people-walking.png"),
];

export default function GetStartedScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleGetStarted = () => {
    dispatch(setHasSeenIntro(true));
    router.replace("/auth/login");
  };

  return (
    <View style={styles.container}>
      {/* Animated Image Grid */}
      <Animatable.View
        animation="fadeInDown"
        duration={900}
        delay={100}
        style={styles.imageGrid}
      >
        {images.map((img, idx) => (
          <Animatable.Image
            key={idx}
            source={img}
            style={styles.gridImage}
            animation="fadeInUp"
            delay={200 + idx * 100}
            duration={700}
            useNativeDriver
          />
        ))}
      </Animatable.View>

      {/* Animated Pagination Indicator */}
      <Animatable.View
        animation="fadeIn"
        delay={700}
        duration={700}
        style={styles.pagination}
      >
        <View style={styles.dot} />
        <View style={styles.dotInactive} />
        <View style={styles.dotInactive} />
      </Animatable.View>

      {/* Animated Title */}
      <Animatable.Text
        animation="fadeInUp"
        delay={900}
        duration={700}
        style={styles.title}
      >
        Explore the World One{"\n"}Flight at a time.
      </Animatable.Text>

      {/* Animated Subtitle */}
      <Animatable.Text
        animation="fadeInUp"
        delay={1100}
        duration={700}
        style={styles.subtitle}
      >
        Find the best deals on flights,{"\n"}
        exclusive travel packages, and{"\n"}
        unforgettable destinations.
      </Animatable.Text>

      {/* Animated Button */}
      <Animatable.View
        animation="fadeInUp"
        delay={1300}
        duration={700}
        style={{ width: "100%", alignItems: "center" }}
      >
        <TouchableOpacity onPress={handleGetStarted} style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const IMAGE_SIZE = (width - 64) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 30,
    margin: 8,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: width - 32,
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  gridImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE * 1.25,
    borderRadius: 16,
    margin: 8,
    backgroundColor: "#eee",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#FF3B30",
    marginHorizontal: 4,
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 28,
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: "#FF3B30",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 8,
    width: width - 64,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
