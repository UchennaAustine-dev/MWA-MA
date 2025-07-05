// components/ScreenWrapper.tsx
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScreenWrapper({ children, style }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flex: 1,
          paddingBottom:
            Platform.OS === "ios" ? 88 : 65 + Math.max(insets.bottom, 10),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
