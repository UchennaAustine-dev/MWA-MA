import { useCustomFonts } from "@/hooks/useCustomFonts";
import { setHasSeenIntro } from "@/redux/slices/authSlice";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { useDispatch } from "react-redux";

const { width, height } = Dimensions.get("window");

// Animatable wrapper for expo-image's Image
const AnimatableExpoImage = Animatable.createAnimatableComponent(Image);

// Only two images per category (2 columns, 1 row)
type CategoryData = {
  title: string;
  subtitle: string;
  images: string[];
};

type CategoryKey = "flights" | "hotels" | "tours" | "cars";

const imageCategories: Record<CategoryKey, CategoryData> = {
  flights: {
    title: "Explore the World One\nFlight at a time.",
    subtitle:
      "Find the best deals on flights,\nexclusive travel packages, and\nunforgettable destinations.",
    images: [
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop",
      "https://images.pexels.com/photos/912050/pexels-photo-912050.jpeg?w=600&h=400&fit=crop",
    ],
  },
  hotels: {
    title: "Discover Amazing\nHotels & Stays",
    subtitle:
      "Book luxury hotels,\ncozy apartments, and\nunique accommodations worldwide.",
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop",
      "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?w=600&h=400&fit=crop",
    ],
  },
  tours: {
    title: "Unforgettable Tours\n& Experiences",
    subtitle:
      "Discover local culture,\namazing tours, and\nmemorable experiences.",
    images: [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop",
      "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?w=600&h=400&fit=crop",
    ],
  },
  cars: {
    title: "Rent Cars for\nEvery Journey",
    subtitle:
      "Choose from economy cars,\nluxury vehicles, and\nspecialty rentals.",
    images: [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&h=400&fit=crop",
      "https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg?w=600&h=400&fit=crop",
    ],
  },
};

const categories: CategoryKey[] = Object.keys(imageCategories) as CategoryKey[];

// Calculate image width to fit two images side by side with a gap
const GAP = 16;
const IMAGE_WIDTH = (width - 64 - GAP) / 2; // 64 = horizontal padding/margin

export default function GetStartedScreen() {
  const [fontsLoaded] = useCustomFonts();

  const router = useRouter();
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const panRef = useRef<PanGestureHandler>(null);

  if (!fontsLoaded) {
    return null; // or a loading spinner
  }

  const currentCategory = categories[currentIndex];
  const currentData = imageCategories[currentCategory];

  const handleGetStarted = () => {
    dispatch(setHasSeenIntro(true));
    router.replace("/auth/login");
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (direction === "left" && currentIndex < categories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === "right" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const onGestureEvent = (event: any) => {
    // Optional: handle gesture updates
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;

      if (Math.abs(translationX) > 50 || Math.abs(velocityX) > 500) {
        if (translationX > 0) {
          handleSwipe("right");
        } else {
          handleSwipe("left");
        }
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Image row with two images */}
        <PanGestureHandler
          ref={panRef}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          activeOffsetX={[-10, 10]}
        >
          <Animatable.View
            key={currentCategory}
            animation="fadeIn"
            duration={500}
            style={styles.imageRow}
          >
            {currentData.images.map((imgUri, idx) => (
              <AnimatableExpoImage
                key={idx}
                source={imgUri}
                style={styles.image}
                animation="fadeInUp"
                delay={100 + idx * 150}
                duration={700}
                useNativeDriver
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ))}
          </Animatable.View>
        </PanGestureHandler>

        {/* Pagination dots */}
        <Animatable.View
          animation="fadeIn"
          delay={400}
          duration={700}
          style={styles.pagination}
        >
          {categories.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </Animatable.View>

        {/* Category label */}
        <Animatable.Text
          key={`category-${currentCategory}`}
          animation="fadeIn"
          duration={500}
          style={styles.categoryText}
        >
          {currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}
        </Animatable.Text>

        {/* Title */}
        <Animatable.Text
          key={`title-${currentCategory}`}
          animation="fadeInUp"
          duration={500}
          style={styles.title}
        >
          {currentData.title}
        </Animatable.Text>

        {/* Subtitle */}
        <Animatable.Text
          key={`subtitle-${currentCategory}`}
          animation="fadeInUp"
          delay={200}
          duration={500}
          style={styles.subtitle}
        >
          {currentData.subtitle}
        </Animatable.Text>

        {/* Swipe instruction */}
        <Animatable.Text
          animation="fadeIn"
          delay={600}
          duration={500}
          style={styles.swipeInstruction}
        >
          Swipe left or right to explore
        </Animatable.Text>

        {/* Get Started button */}
        <Animatable.View
          animation="fadeInUp"
          delay={800}
          duration={700}
          style={{ width: "100%", alignItems: "center" }}
        >
          <TouchableOpacity onPress={handleGetStarted} style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 30,
    margin: 8,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center", // Center vertically and horizontally
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width - 64,
    marginBottom: 24,
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH * 1.65,
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 16,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#FF3B30",
  },
  dotInactive: {
    backgroundColor: "#E0E0E0",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "RedHatDisplay-Regular",
  },
  title: {
    fontSize: 22,
    color: "#222",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "RedHatDisplay-Bold",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 24,
    fontFamily: "RedHatDisplay-Regular",
  },
  swipeInstruction: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
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
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Inter",
  },
});

// import { useCustomFonts } from "@/hooks/useCustomFonts";
// import { setHasSeenIntro } from "@/redux/slices/authSlice";
// import { Image } from "expo-image";
// import { useRouter } from "expo-router";
// import React, { useRef, useState } from "react";
// import {
//   Dimensions,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import * as Animatable from "react-native-animatable";
// import {
//   GestureHandlerRootView,
//   PanGestureHandler,
//   State,
// } from "react-native-gesture-handler";
// import { useDispatch } from "react-redux";

// const { width } = Dimensions.get("window");

// // Create animatable version of expo-image's Image component
// const AnimatableExpoImage = Animatable.createAnimatableComponent(Image);

// // Image collections for different categories
// type CategoryData = {
//   title: string;
//   subtitle: string;
//   images: string[];
// };

// type CategoryKey = "flights" | "hotels" | "tours" | "cars";

// const imageCategories: Record<CategoryKey, CategoryData> = {
//   flights: {
//     title: "Explore the World One\nFlight at a time.",
//     subtitle:
//       "Find the best deals on flights,\nexclusive travel packages, and\nunforgettable destinations.",
//     images: [
//       "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=600&fit=crop",
//       "https://images.pexels.com/photos/912050/pexels-photo-912050.jpeg?w=400&h=600&fit=crop",
//       "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=720&fit=crop",
//       "https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?w=400&h=400&fit=crop",
//       "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=560&fit=crop",
//       "https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg?w=400&h=560&fit=crop",
//     ],
//   },
//   hotels: {
//     title: "Discover Amazing\nHotels & Stays",
//     subtitle:
//       "Book luxury hotels,\ncozy apartments, and\nunique accommodations worldwide.",
//     images: [
//       "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=600&fit=crop",
//       "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?w=400&h=600&fit=crop",
//       "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=720&fit=crop",
//       "https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?w=400&h=400&fit=crop",
//       "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=560&fit=crop",
//       "https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?w=400&h=560&fit=crop",
//     ],
//   },
//   tours: {
//     title: "Unforgettable Tours\n& Experiences",
//     subtitle:
//       "Discover local culture,\namazing tours, and\nmemorable experiences.",
//     images: [
//       "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=600&fit=crop",
//       "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?w=400&h=600&fit=crop",
//       "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=720&fit=crop",
//       "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?w=400&h=400&fit=crop",
//       "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=560&fit=crop", // replaced with scenic travel destination
//       "https://images.pexels.com/photos/1450340/pexels-photo-1450340.jpeg?w=400&h=560&fit=crop",
//     ],
//   },
//   cars: {
//     title: "Rent Cars for\nEvery Journey",
//     subtitle:
//       "Choose from economy cars,\nluxury vehicles, and\nspecialty rentals.",
//     images: [
//       "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=600&fit=crop", // Exotic car image from Unsplash
//       "https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg?w=400&h=600&fit=crop",
//       "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=720&fit=crop",
//       "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?w=400&h=400&fit=crop",
//       "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=560&fit=crop",
//       "https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?w=400&h=560&fit=crop",
//     ],
//   },
// };

// const categories: CategoryKey[] = Object.keys(imageCategories) as CategoryKey[];

// export default function GetStartedScreen() {
//   const [fontsLoaded] = useCustomFonts();

//   if (!fontsLoaded) {
//     return null; // Or show a loading indicator
//   }
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const [currentIndex, setCurrentIndex] = useState<number>(0);
//   const [isAnimating, setIsAnimating] = useState<boolean>(false);
//   const panRef = useRef<PanGestureHandler>(null);

//   const currentCategory = categories[currentIndex];
//   const currentData = imageCategories[currentCategory];

//   const handleGetStarted = () => {
//     dispatch(setHasSeenIntro(true));
//     router.replace("/auth/login");
//   };

//   const handleSwipe = (direction: "left" | "right") => {
//     if (isAnimating) return;

//     setIsAnimating(true);

//     if (direction === "left" && currentIndex < categories.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//     } else if (direction === "right" && currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//     }

//     // Reset animation state after transition
//     setTimeout(() => {
//       setIsAnimating(false);
//     }, 500);
//   };

//   const onGestureEvent = (event: any) => {
//     // Handle gesture during pan
//   };

//   const onHandlerStateChange = (event: any) => {
//     if (event.nativeEvent.state === State.END) {
//       const { translationX, velocityX } = event.nativeEvent;

//       // Determine swipe direction based on translation and velocity
//       if (Math.abs(translationX) > 50 || Math.abs(velocityX) > 500) {
//         if (translationX > 0) {
//           handleSwipe("right");
//         } else {
//           handleSwipe("left");
//         }
//       }
//     }
//   };

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <View style={styles.container}>
//         {/* Animated Image Collage with Swipe Gesture */}
//         <PanGestureHandler
//           ref={panRef}
//           onGestureEvent={onGestureEvent}
//           onHandlerStateChange={onHandlerStateChange}
//           activeOffsetX={[-10, 10]}
//         >
//           <Animatable.View
//             key={currentCategory} // Force re-render on category change
//             animation="fadeIn"
//             duration={500}
//             style={styles.imageCollage}
//           >
//             {/* Left Column */}
//             <View style={styles.leftColumn}>
//               <AnimatableExpoImage
//                 source={currentData.images[0]}
//                 style={styles.leftTopImage}
//                 animation="fadeInUp"
//                 delay={100}
//                 duration={700}
//                 useNativeDriver
//                 contentFit="cover"
//                 cachePolicy="memory-disk"
//               />
//               <AnimatableExpoImage
//                 source={currentData.images[1]}
//                 style={styles.leftBottomImage}
//                 animation="fadeInUp"
//                 delay={200}
//                 duration={700}
//                 useNativeDriver
//                 contentFit="cover"
//                 cachePolicy="memory-disk"
//               />
//             </View>

//             {/* Center Column */}
//             <View style={styles.centerColumn}>
//               <AnimatableExpoImage
//                 source={currentData.images[2]}
//                 style={styles.centerTopImage}
//                 animation="fadeInUp"
//                 delay={150}
//                 duration={700}
//                 useNativeDriver
//                 contentFit="cover"
//                 cachePolicy="memory-disk"
//               />
//               <AnimatableExpoImage
//                 source={currentData.images[3]}
//                 style={styles.centerBottomImage}
//                 animation="fadeInUp"
//                 delay={250}
//                 duration={700}
//                 useNativeDriver
//                 contentFit="cover"
//                 cachePolicy="memory-disk"
//               />
//             </View>

//             {/* Right Column */}
//             <View style={styles.rightColumn}>
//               <AnimatableExpoImage
//                 source={currentData.images[4]}
//                 style={styles.rightTopImage}
//                 animation="fadeInUp"
//                 delay={200}
//                 duration={700}
//                 useNativeDriver
//                 contentFit="cover"
//                 cachePolicy="memory-disk"
//               />
//               <AnimatableExpoImage
//                 source={currentData.images[5]}
//                 style={styles.rightBottomImage}
//                 animation="fadeInUp"
//                 delay={300}
//                 duration={700}
//                 useNativeDriver
//                 contentFit="cover"
//                 cachePolicy="memory-disk"
//               />
//             </View>
//           </Animatable.View>
//         </PanGestureHandler>

//         {/* Animated Pagination Indicator */}
//         <Animatable.View
//           animation="fadeIn"
//           delay={400}
//           duration={700}
//           style={styles.pagination}
//         >
//           {categories.map((_, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.dot,
//                 index === currentIndex ? styles.dotActive : styles.dotInactive,
//               ]}
//             />
//           ))}
//         </Animatable.View>

//         {/* Category Indicator */}
//         <Animatable.Text
//           key={`category-${currentCategory}`}
//           animation="fadeIn"
//           duration={500}
//           style={styles.categoryText}
//         >
//           {currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}
//         </Animatable.Text>

//         {/* Animated Title */}
//         <Animatable.Text
//           key={`title-${currentCategory}`}
//           animation="fadeInUp"
//           duration={500}
//           style={styles.title}
//         >
//           {currentData.title}
//         </Animatable.Text>

//         {/* Animated Subtitle */}
//         <Animatable.Text
//           key={`subtitle-${currentCategory}`}
//           animation="fadeInUp"
//           delay={200}
//           duration={500}
//           style={styles.subtitle}
//         >
//           {currentData.subtitle}
//         </Animatable.Text>

//         {/* Swipe Instruction */}
//         <Animatable.Text
//           animation="fadeIn"
//           delay={600}
//           duration={500}
//           style={styles.swipeInstruction}
//         >
//           Swipe left or right to explore
//         </Animatable.Text>

//         {/* Animated Button */}
//         <Animatable.View
//           animation="fadeInUp"
//           delay={800}
//           duration={700}
//           style={{ width: "100%", alignItems: "center" }}
//         >
//           <TouchableOpacity onPress={handleGetStarted} style={styles.button}>
//             <Text style={styles.buttonText}>Get Started</Text>
//           </TouchableOpacity>
//         </Animatable.View>
//       </View>
//     </GestureHandlerRootView>
//   );
// }

// const CONTAINER_WIDTH = width - 64;
// const COLUMN_WIDTH = (CONTAINER_WIDTH - 16) / 3; // 3 columns with 8px gaps
// const GAP = 8;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     borderRadius: 30,
//     margin: 8,
//     paddingVertical: 24,
//     alignItems: "center",
//     justifyContent: "flex-start",
//   },
//   imageCollage: {
//     flexDirection: "row",
//     width: CONTAINER_WIDTH,
//     justifyContent: "space-between",
//     marginTop: 16,
//     marginBottom: 24,
//     paddingHorizontal: 20,
//   },
//   leftColumn: {
//     width: COLUMN_WIDTH,
//     gap: GAP,
//   },
//   centerColumn: {
//     width: COLUMN_WIDTH,
//     gap: GAP,
//   },
//   rightColumn: {
//     width: COLUMN_WIDTH,
//     gap: GAP,
//   },
//   leftTopImage: {
//     width: COLUMN_WIDTH,
//     height: COLUMN_WIDTH * 1.6, // Taller image
//     borderRadius: 16,
//     backgroundColor: "#eee",
//   },
//   leftBottomImage: {
//     width: COLUMN_WIDTH,
//     height: COLUMN_WIDTH * 1.2, // Medium height
//     borderRadius: 16,
//     backgroundColor: "#eee",
//   },
//   centerTopImage: {
//     width: COLUMN_WIDTH,
//     height: COLUMN_WIDTH * 1.8, // Very tall image
//     borderRadius: 16,
//     backgroundColor: "#eee",
//   },
//   centerBottomImage: {
//     width: COLUMN_WIDTH,
//     height: COLUMN_WIDTH * 1.0, // Square-ish
//     borderRadius: 16,
//     backgroundColor: "#eee",
//   },
//   rightTopImage: {
//     width: COLUMN_WIDTH,
//     height: COLUMN_WIDTH * 1.4, // Medium-tall
//     borderRadius: 16,
//     backgroundColor: "#eee",
//   },
//   rightBottomImage: {
//     width: COLUMN_WIDTH,
//     height: COLUMN_WIDTH * 1.4, // Medium-tall
//     borderRadius: 16,
//     backgroundColor: "#eee",
//   },
//   pagination: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginHorizontal: 4,
//   },
//   dotActive: {
//     width: 16,
//     height: 8,
//     borderRadius: 8,
//     backgroundColor: "#FF3B30",
//   },
//   dotInactive: {
//     backgroundColor: "#E0E0E0",
//   },
//   categoryText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#FF3B30",
//     textAlign: "center",
//     marginBottom: 4,
//     textTransform: "uppercase",
//     letterSpacing: 1,
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   title: {
//     fontSize: 22,
//     color: "#222",
//     textAlign: "center",
//     marginBottom: 12,
//     fontFamily: "RedHatDisplay-Bold",
//   },
//   subtitle: {
//     fontSize: 15,
//     color: "#666",
//     textAlign: "center",
//     marginBottom: 16,
//     paddingHorizontal: 24,
//     fontFamily: "RedHatDisplay-Regular",
//   },
//   swipeInstruction: {
//     fontSize: 12,
//     color: "#999",
//     textAlign: "center",
//     marginBottom: 20,
//     fontStyle: "italic",
//   },
//   button: {
//     backgroundColor: "#FF3B30",
//     paddingVertical: 16,
//     paddingHorizontal: 48,
//     borderRadius: 12,
//     marginTop: 8,
//     width: width - 64,
//     alignSelf: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//     textAlign: "center",
//     fontFamily: "Inter",
//   },
// });
