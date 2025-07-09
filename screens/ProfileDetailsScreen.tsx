/**
 * Enhanced Profile Details Screen
 * Displays and allows editing of user personal information with improved UX
 */
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import EditProfileModal from "../components/profile/EditProfileModal";
import ErrorState from "../components/profile/ErrorState";
import LoadingSpinner from "../components/profile/LoadingSpinner";
import { useUserData } from "../hooks/useUserData";
import type { UserData } from "../lib/userAPI";
import type { RootState } from "../redux/store";

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
      refetch(); // Just refresh data from server
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Information</Text>
          <View style={styles.placeholder} />
        </View>
        <LoadingSpinner message="Loading profile..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Information</Text>
          <View style={styles.placeholder} />
        </View>
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Information</Text>
          <View style={styles.placeholder} />
        </View>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <TouchableOpacity
          onPress={() => setShowEditModal(true)}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>

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
      >
        {/* User Info Header with completion status */}
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

        {/* Information Grid */}
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
            >
              <Ionicons name="create-outline" size={16} color="#DC2626" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            {/* Personal Details */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>First Name</Text>
                <Text
                  style={[
                    styles.infoValue,
                    !editedData.firstName && styles.emptyValue,
                  ]}
                >
                  {editedData.firstName || "Not provided"}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Last Name</Text>
                <Text
                  style={[
                    styles.infoValue,
                    !editedData.lastName && styles.emptyValue,
                  ]}
                >
                  {editedData.lastName || "Not provided"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text
                  style={[
                    styles.infoValue,
                    !editedData.email && styles.emptyValue,
                  ]}
                >
                  {editedData.email || "Not provided"}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text
                  style={[
                    styles.infoValue,
                    !editedData.phoneNumber && styles.emptyValue,
                  ]}
                >
                  {editedData.phoneNumber || "Not provided"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text
                  style={[
                    styles.infoValue,
                    !editedData.dateOfBirth && styles.emptyValue,
                  ]}
                >
                  {editedData.dateOfBirth || "Not provided"}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text
                  style={[
                    styles.infoValue,
                    !editedData.gender && styles.emptyValue,
                  ]}
                >
                  {editedData.gender || "Not provided"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nationality</Text>
                <Text
                  style={[
                    styles.infoValue,
                    !editedData.nationality && styles.emptyValue,
                  ]}
                >
                  {editedData.nationality || "Not provided"}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Passport Number</Text>
                <Text
                  style={[
                    styles.infoValue,
                    !editedData.passportNumber && styles.emptyValue,
                  ]}
                >
                  {editedData.passportNumber || "Not provided"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Passport Expiry</Text>
                <Text
                  style={[
                    styles.infoValue,
                    !editedData.passportExpiry && styles.emptyValue,
                  ]}
                >
                  {editedData.passportExpiry || "Not provided"}
                </Text>
              </View>
              <View style={styles.infoItem} />
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.editInfoButton}
            onPress={() => setShowEditModal(true)}
          >
            <Ionicons name="create-outline" size={20} color="#DC2626" />
            <Text style={styles.editInfoButtonText}>Edit Information</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  editButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
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
  },
  completionText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
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
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666666",
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
  },
  infoValue: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  emptyValue: {
    color: "#999999",
    fontStyle: "italic",
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
  },
});
