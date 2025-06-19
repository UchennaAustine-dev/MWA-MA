import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

export default function SlideItem({
  title,
  image,
}: {
  title: string;
  image: any;
}) {
  return (
    <View style={styles.slide}>
      <Image source={image} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: width * 0.8,
    height: 300,
    resizeMode: "contain",
  },
  title: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
});
