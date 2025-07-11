import { StyleSheet, Text, View } from "react-native";

interface TravelerInfoSectionProps {
  travelersData: any[];
}

export default function TravelerInfoSection({
  travelersData,
}: TravelerInfoSectionProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!travelersData || travelersData.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Traveler Information</Text>
        <Text>No traveler data available.</Text>
      </View>
    );
  }

  return (
    <>
      {travelersData.map((travelerData, index) => {
        const travelerInfo = [
          {
            label: "Full Name",
            value: `${travelerData?.name?.firstName || ""} ${
              travelerData?.name?.lastName || ""
            }`.trim(),
          },
          { label: "Gender", value: travelerData?.gender || "N/A" },
          {
            label: "Date of Birth",
            value: travelerData?.dateOfBirth
              ? formatDate(travelerData?.dateOfBirth)
              : "N/A",
          },
          {
            label: "Email",
            value: travelerData?.contact?.emailAddress || "N/A",
          },
          {
            label: "Phone",
            value: travelerData?.contact?.phones?.[0]?.number || "N/A",
          },
          {
            label: "Nationality",
            value: travelerData?.documents?.[0]?.nationality || "N/A",
          },
          {
            label: "Birth Place",
            value: travelerData?.documents?.[0]?.birthPlace || "N/A",
          },
          {
            label: "Passport Number",
            value: travelerData?.documents?.[0]?.number || "N/A",
          },
          {
            label: "Passport Expiry",
            value: travelerData?.documents?.[0]?.expiryDate
              ? formatDate(travelerData?.documents?.[0]?.expiryDate)
              : "N/A",
          },
        ];

        // Show "Traveler" for single traveler, "Traveler X" for multiple
        const sectionTitle =
          travelersData.length === 1 ? "Traveler" : `Traveler ${index + 1}`;

        return (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            <View style={styles.travelerContainer}>
              {travelerInfo.map(({ label, value }) => (
                <View key={label} style={styles.travelerItem}>
                  <Text style={styles.travelerLabel}>{label}</Text>
                  <Text style={styles.travelerValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
    fontFamily: "RedHatDisplay-Bold",
  },
  travelerContainer: {
    gap: 12,
  },
  travelerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  travelerLabel: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
    fontWeight: "500",
    fontFamily: "RedHatDisplay-Regular",
  },
  travelerValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    flex: 2,
    textAlign: "right",
    fontFamily: "RedHatDisplay-Bold",
  },
});
