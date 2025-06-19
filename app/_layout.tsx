import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { useCustomFonts } from "../hooks/useFonts";
import { store } from "../redux/store";

export default function Layout() {
  const [fontsLoaded] = useCustomFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }} />
    </Provider>
  );
}
