import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/constants";
import { AuthContext } from "../context/AuthContext";
import apiService from "../services/apiService";
import { useFocusEffect } from "@react-navigation/native";

const ProfileScreen = ({ navigation }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolled: 0,
    certificates: 0,
  });

  const userName = userInfo?.name || "Learner";
  const userEmail = userInfo?.email || "learner@example.com";
  const userInitials = userName.substring(0, 2).toUpperCase();
  // Demo static data for things that don't exist yet
  const userJoined = "Jan 2024";
  const dayStreak = 12;
  const weeklyGoalDone = 4;
  const weeklyGoalTotal = 5;

  useFocusEffect(
    useCallback(() => {
      if (userInfo) {
        fetchDashboardData();
      }
    }, [userInfo]),
  );

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const coursesRes = await apiService.get("/courses");
      const courses = coursesRes.data;

      if (courses && courses.length > 0) {
        const progressPromises = courses.map((c) =>
          apiService.get(`/progress/${c._id}`).catch(() => ({ data: null })),
        );
        const progressResults = await Promise.all(progressPromises);

        let enrolledCount = 0;
        let certCount = 0;

        progressResults.forEach((res) => {
          if (res.data) {
            enrolledCount++;
            if (res.data.certificateGenerated) certCount++;
          }
        });

        setStats({
          enrolled: enrolledCount || 8, // fallback to mockup number if 0 for demo
          certificates: certCount || 2, // fallback to mockup number if 0 for demo
        });
      }
    } catch (e) {
      console.log("Error fetching profile stats:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation is handled by AuthContext state change in AppNavigator
    } catch (e) {
      console.log("Logout failed", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons
            name="bell"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Info Section */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
            <View style={styles.tagRow}>
              <View style={styles.roleTag}>
                <Text style={styles.roleText}>Learner</Text>
              </View>
              <Text style={styles.joinText}>• Joined {userJoined}</Text>
            </View>
          </View>
        </View>

        {/* Learning Progress Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Learning Progress</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#E6EFFF" }]}>
                <Feather name="book-open" size={24} color="#4885ED" />
              </View>
              <Text style={styles.statValue}>
                {isLoading ? "-" : stats.enrolled}
              </Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#E6F8F0" }]}>
                <Feather name="award" size={24} color="#00C853" />
              </View>
              <Text style={styles.statValue}>
                {isLoading ? "-" : stats.certificates}
              </Text>
              <Text style={styles.statLabel}>Certificates</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#FFF4E6" }]}>
                <MaterialCommunityIcons name="fire" size={24} color="#FF9800" />
              </View>
              <Text style={styles.statValue}>{dayStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.goalRow}>
            <Text style={styles.goalText}>Weekly Goal</Text>
            <Text style={styles.goalCount}>
              {weeklyGoalDone}/{weeklyGoalTotal} lessons
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(weeklyGoalDone / weeklyGoalTotal) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Achievements Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            <View style={styles.achievementItem}>
              <View style={styles.achievementBox}>
                <Text style={styles.emojiText}>🚀</Text>
              </View>
              <Text style={styles.achievementText}>First Quiz</Text>
            </View>

            <View style={styles.achievementItem}>
              <View style={styles.achievementBox}>
                <Text style={styles.emojiText}>🔥</Text>
              </View>
              <Text style={styles.achievementText}>Speed Learner</Text>
            </View>

            <View style={styles.achievementItem}>
              <View style={styles.achievementBox}>
                <Text style={styles.emojiText}>🏆</Text>
              </View>
              <Text style={styles.achievementText}>Champion</Text>
            </View>

            <View style={styles.achievementItem}>
              <View style={styles.achievementBox}>
                <Text style={styles.emojiText}>📚</Text>
              </View>
              <Text style={styles.achievementText}>Bookworm</Text>
            </View>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="settings"
                size={22}
                color={COLORS.textSecondary}
              />
              <Text style={styles.settingText}>Settings</Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate("CertificateList")}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="certificate-outline"
                size={22}
                color={COLORS.textSecondary}
              />
              <Text style={styles.settingText}>Certificates</Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <Feather name="log-out" size={22} color="#D32F2F" />
              <Text style={[styles.settingText, { color: "#D32F2F" }]}>
                Sign Out
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#D32F2F" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // e.g. #FDFAF2 or similar
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#B3E5FC",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#8FA3B0", // light grayish blue for email
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleTag: {
    backgroundColor: "#E6EFFF", // Light blue bg
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: "#4885ED", // Blue text
    fontSize: 12,
    fontWeight: "600",
  },
  joinText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#8FA3B0",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 15,
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  goalText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  goalCount: {
    fontSize: 14,
    color: "#4885ED", // Blue text to match the bar
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#E6EFFF", // Light blue track
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary, // Dark blue fill
    borderRadius: 3,
  },
  achievementsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  achievementItem: {
    alignItems: "center",
    width: "22%",
  },
  achievementBox: {
    width: 60,
    height: 60,
    backgroundColor: "#F4F7FF", // very light blue
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emojiText: {
    fontSize: 24,
  },
  achievementText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 5,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 15,
    fontWeight: "500",
  },
  settingDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 55, // Align with the text, not the icon
    marginRight: 20,
  },
});

export default ProfileScreen;
