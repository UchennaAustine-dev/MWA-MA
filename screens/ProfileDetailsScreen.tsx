import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Correct import
import { useSelector } from "react-redux";
import EditProfileModal from "../components/profile/EditProfileModal";
import ErrorState from "../components/profile/ErrorState";
import LoadingSpinner from "../components/profile/LoadingSpinner";
import { useUserData } from "../hooks/useUserData";
import type { UserData } from "../lib/userAPI";
import type { RootState } from "../redux/store";

const HEADER_HEIGHT = 75;

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user?.user);
  const userId = user?.id || "";

  const { data: userData, isLoading, error, refetch } = useUserData(userId);
  const [showEditModal, setShowEditModal] = useState(false);

  const editedData = useMemo(() => {
    if (!userData) return null;
    return {
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      phoneNumber: userData.phone || userData.phoneNumber || "",
      dateOfBirth: userData.dob
        ? new Date(userData.dob).toISOString().substring(0, 10)
        : userData.dateOfBirth
        ? new Date(userData.dateOfBirth).toISOString().substring(0, 10)
        : "",
      gender: userData.gender || "",
      nationality: userData.nationality || "",
      passportNumber: userData.passportNo || userData.passportNumber || "",
      passportExpiry: userData.passportExpiry
        ? new Date(userData.passportExpiry).toISOString().substring(0, 10)
        : "",
    };
  }, [userData]);

  const handleSaveUserData = useCallback(
    (newData: UserData) => {
      refetch();
    },
    [refetch]
  );

  const getInitials = useCallback((firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  }, []);

  const completionPercentage = useMemo(() => {
    if (!editedData) return 0;
    const fields = [
      editedData.firstName,
      editedData.lastName,
      editedData.phoneNumber,
      editedData.dateOfBirth,
      editedData.gender,
      editedData.nationality,
      editedData.passportNumber,
      editedData.passportExpiry,
    ];
    const filledFields = fields.filter(
      (field) => field && field.trim() !== ""
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  }, [editedData]);

  const Header = (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Personal Information</Text>
      <TouchableOpacity
        onPress={() => setShowEditModal(true)}
        style={styles.editButton}
        activeOpacity={0.7}
      >
        <Ionicons name="create-outline" size={24} color="#DC2626" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {Header}
        <LoadingSpinner message="Loading profile..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {Header}
        <ErrorState
          title="Error Loading Profile"
          message={error}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  if (!editedData) {
    return (
      <SafeAreaView style={styles.container}>
        {Header}
        <ErrorState
          title="No Profile Data"
          message="No user data found."
          icon="person-outline"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>{Header}</View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={["#DC2626"]}
          />
        }
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + 16,
          paddingBottom: 32,
        }}
      >
        {/* User Info Header */}
        <View style={styles.userHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(editedData.firstName, editedData.lastName)}
              </Text>
            </View>
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>{completionPercentage}%</Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {editedData.firstName} {editedData.lastName}
            </Text>
            <Text style={styles.userEmail}>{editedData.email}</Text>
            <View style={styles.completionBar}>
              <View style={styles.completionBarBg}>
                <View
                  style={[
                    styles.completionBarFill,
                    { width: `${completionPercentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.completionLabel}>
                Profile {completionPercentage}% complete
              </Text>
            </View>
          </View>
        </View>

        {/* Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.sectionTitle}>Travel Information</Text>
              <Text style={styles.sectionSubtitle}>
                Basic information used for seamless booking experience.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.quickEditButton}
              onPress={() => setShowEditModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={16} color="#DC2626" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            {[
              [
                { label: "First Name", value: editedData.firstName },
                { label: "Last Name", value: editedData.lastName },
              ],
              [
                { label: "Email Address", value: editedData.email },
                { label: "Phone Number", value: editedData.phoneNumber },
              ],
              [
                { label: "Date of Birth", value: editedData.dateOfBirth },
                { label: "Gender", value: editedData.gender },
              ],
              [
                { label: "Nationality", value: editedData.nationality },
                { label: "Passport Number", value: editedData.passportNumber },
              ],
              [
                { label: "Passport Expiry", value: editedData.passportExpiry },
                {},
              ],
            ].map((row, idx) => (
              <View style={styles.infoRow} key={idx}>
                {row.map((item, jdx) =>
                  item.label ? (
                    <View style={styles.infoItem} key={jdx}>
                      <Text style={styles.infoLabel}>{item.label}</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          !item.value && styles.emptyValue,
                        ]}
                      >
                        {item.value || "Not provided"}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.infoItem} key={jdx} />
                  )
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.editInfoButton}
            onPress={() => setShowEditModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color="#DC2626" />
            <Text style={styles.editInfoButtonText}>Edit Information</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {editedData && (
        <EditProfileModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          userData={editedData}
          userId={userId}
          onSave={handleSaveUserData}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 28.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    height: HEADER_HEIGHT,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "RedHatDisplay-Bold",
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  avatarText: {
    fontSize: 22,
    color: "#FFFFFF",
    fontFamily: "RedHatDisplay-Bold",
  },
  completionBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    zIndex: 3,
  },
  completionText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "RedHatDisplay-Bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
    fontFamily: "RedHatDisplay-Bold",
  },
  userEmail: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
    fontFamily: "RedHatDisplay-Regular",
  },
  completionBar: {
    marginTop: 4,
  },
  completionBarBg: {
    height: 4,
    backgroundColor: "#E5E5E5",
    borderRadius: 2,
    overflow: "hidden",
  },
  completionBarFill: {
    height: "100%",
    backgroundColor: "#DC2626",
  },
  completionLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
    fontFamily: "RedHatDisplay-Regular",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    fontFamily: "RedHatDisplay-Bold",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "RedHatDisplay-Regular",
  },
  quickEditButton: {
    padding: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
  },
  infoGrid: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    paddingBottom: 10,
  },
  infoItem: {
    flex: 1,
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 4,
    textTransform: "uppercase",
    fontFamily: "RedHatDisplay-Regular",
  },
  infoValue: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
    fontFamily: "RedHatDisplay-Bold",
  },
  emptyValue: {
    color: "#999999",
    fontFamily: "Inter",
    fontSize: 14,
  },
  editInfoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 8,
  },
  editInfoButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
    fontFamily: "RedHatDisplay-Bold",
  },
});
