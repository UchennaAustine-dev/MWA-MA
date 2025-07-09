import { StyleSheet, Text, View } from "react-native";

interface GreetingSectionProps {
  user: any;
  guestUser: any;
}

export default function GreetingSection({
  user,
  guestUser,
}: GreetingSectionProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{getGreeting()},</Text>
      <Text style={styles.name}>
        {user?.firstName || guestUser?.firstName || "Guest"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 4,
    fontFamily: "Inter",
  },
  name: {
    fontSize: 28,
    // fontWeight: "bold",
    color: "#000000",
    fontFamily: "RedHatDisplay-Bold",
  },
});
