import { useFonts } from "expo-font";

export const useCustomFonts = () => {
  return useFonts({
    Inter: require("../assets/fonts/Inter-Regular.ttf"),
    "RedHatDisplay-Regular": require("../assets/fonts/RedHatDisplay-Regular.ttf"),
    "RedHatDisplay-Bold": require("../assets/fonts/RedHatDisplay-Bold.ttf"),
  });
};
