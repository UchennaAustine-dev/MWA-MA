import { Image } from "expo-image";
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

// Create animatable version of expo-image's Image component
const AnimatableExpoImage = Animatable.createAnimatableComponent(Image);

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
      {/* Animated Image Collage */}
      <Animatable.View
        animation="fadeInDown"
        duration={900}
        delay={100}
        style={styles.imageCollage}
      >
        {/* Left Column */}
        <View style={styles.leftColumn}>
          <AnimatableExpoImage
            source={images[0]} // arab-lady
            style={styles.leftTopImage}
            animation="fadeInUp"
            delay={200}
            duration={700}
            useNativeDriver
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <AnimatableExpoImage
            source={images[1]} // green-suite-lady
            style={styles.leftBottomImage}
            animation="fadeInUp"
            delay={400}
            duration={700}
            useNativeDriver
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>

        {/* Center Column */}
        <View style={styles.centerColumn}>
          <AnimatableExpoImage
            source={images[2]} // woman-smiling (top center)
            style={styles.centerTopImage}
            animation="fadeInUp"
            delay={300}
            duration={700}
            useNativeDriver
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <AnimatableExpoImage
            source={images[3]} // family-flying (bottom center)
            style={styles.centerBottomImage}
            animation="fadeInUp"
            delay={500}
            duration={700}
            useNativeDriver
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>

        {/* Right Column */}
        <View style={styles.rightColumn}>
          <AnimatableExpoImage
            source={images[4]} // hotel
            style={styles.rightTopImage}
            animation="fadeInUp"
            delay={400}
            duration={700}
            useNativeDriver
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <AnimatableExpoImage
            source={images[5]} // people-walking
            style={styles.rightBottomImage}
            animation="fadeInUp"
            delay={600}
            duration={700}
            useNativeDriver
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>
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

const CONTAINER_WIDTH = width - 64;
const COLUMN_WIDTH = (CONTAINER_WIDTH - 16) / 3; // 3 columns with 8px gaps
const GAP = 8;

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
  imageCollage: {
    flexDirection: "row",
    width: CONTAINER_WIDTH,
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  leftColumn: {
    width: COLUMN_WIDTH,
    gap: GAP,
  },
  centerColumn: {
    width: COLUMN_WIDTH,
    gap: GAP,
  },
  rightColumn: {
    width: COLUMN_WIDTH,
    gap: GAP,
  },
  leftTopImage: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.6, // Taller image
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  leftBottomImage: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.2, // Medium height
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  centerTopImage: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.8, // Very tall image
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  centerBottomImage: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.0, // Square-ish
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  rightTopImage: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.4, // Medium-tall
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  rightBottomImage: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.4, // Medium-tall
    borderRadius: 16,
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
    fontFamily: "RedHatDisplay-Bold",
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
