import React, { useContext, useEffect, useState } from "react";
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
import { COLORS } from "../utils/constants";
import { AuthContext } from "../context/AuthContext";
import apiService from "../services/apiService";
import { Alert } from "react-native";

const HomeScreen = ({ navigation }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const [recentCourse, setRecentCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolled: 0,
    hours: 0,
    certificates: 0,
  });

  const userName = userInfo?.name || "Learner";
  const userInitials = userName.substring(0, 1).toUpperCase();

  useEffect(() => {
    if (userInfo) {
      fetchDashboardData();
    }
  }, [userInfo]);

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
        let mostRecent = null;

        progressResults.forEach((res, index) => {
          if (res.data) {
            enrolledCount++;
            if (res.data.certificateGenerated) certCount++;
            if (!mostRecent) {
              mostRecent = {
                ...courses[index],
                progressPercentage: res.data.progressPercentage,
              };
            }
          }
        });

        if (!mostRecent) mostRecent = courses[0];

        setRecentCourse(mostRecent);
        setStats({
          enrolled: enrolledCount || courses.length,
          hours: enrolledCount * 4.5,
          certificates: certCount,
        });
      }
    } catch (e) {
      console.log("Error fetching dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.topRow}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{userName}</Text>
            <Text style={styles.userEmail}>{userInfo?.email}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              Alert.alert("Logout", "Are you sure you want to logout?", [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: logout, style: "destructive" },
              ]);
            }}
          >
            <Text style={styles.actionIcon}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
            <Text style={styles.statLabel}>Courses Enrolled</Text>
            <View style={styles.statBottom}>
              <Text style={styles.statValue}>{stats.enrolled}</Text>
              <View style={styles.iconPlaceholder} />
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
            <Text style={styles.statLabel}>Hours Learned</Text>
            <View style={styles.statBottom}>
              <Text style={styles.statValue}>{Math.round(stats.hours)}</Text>
              <View style={styles.iconPlaceholder} />
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
            <Text style={styles.statLabel}>Certification</Text>
            <View style={styles.statBottom}>
              <Text style={styles.statValue}>{stats.certificates}</Text>
              <View style={styles.iconPlaceholder} />
            </View>
          </View>
        </ScrollView>

        {/* Continue Learning Section */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Courses")}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 20 }}
          />
        ) : recentCourse ? (
          <TouchableOpacity
            style={styles.courseCard}
            onPress={() =>
              navigation.navigate("CourseDetail", { id: recentCourse._id })
            }
          >
            <View style={styles.courseImagePlaceholder}>
              <View style={styles.cardIconPlaceholder}></View>
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{recentCourse.title}</Text>
              <Text style={styles.courseSubtitle}>{recentCourse.category}</Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${recentCourse.progressPercentage || 0}%` },
                    ]}
                  ></View>
                </View>
                <View style={styles.progressTextRow}>
                  <Text style={styles.progressText}>Progress</Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(recentCourse.progressPercentage || 0)}%
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.courseCard}>
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>No recent courses.</Text>
            </View>
          </View>
        )}

        {/* Today's Schedule Section */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Today's schedule</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.scheduleCard}>
          <View style={styles.scheduleIconPlaceholder}></View>
          <View style={styles.scheduleContent}>
            <Text style={styles.scheduleTitle}>Basics of Microfinance</Text>
            <Text style={styles.scheduleTime}>10:00 AM - 11:30 AM</Text>
          </View>
          <TouchableOpacity style={styles.playButtonMini}>
            <Text style={styles.playIconMini}>▶</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scheduleCard}>
          <View style={styles.scheduleIconPlaceholder}></View>
          <View style={styles.scheduleContent}>
            <Text style={styles.scheduleTitle}>Risk Management</Text>
            <Text style={styles.scheduleTime}>02:00 PM - 03:00 PM</Text>
          </View>
          <TouchableOpacity style={styles.playButtonMini}>
            <Text style={styles.playIconMini}>▶</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },
  topRow: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#325A73",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 18,
  },
  welcomeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  nameText: {
    fontSize: 22,
    color: COLORS.secondary,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  actionIcon: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "bold",
  },
  notificationBtn: {
    padding: 10,
  },
  bellIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#325A73",
  },
  statsScroll: {
    paddingLeft: 20,
    marginBottom: 30,
  },
  statCard: {
    width: 140,
    padding: 15,
    borderRadius: 16,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  statBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  iconPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  courseCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#325A73",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 30, // added margin bottom
  },
  courseImagePlaceholder: {
    height: 120,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIconPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: "#CBD5E1", // simple gray box in center
    borderRadius: 8,
  },
  courseInfo: {
    width: "100%",
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  progressContainer: {
    width: "100%",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  scheduleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  scheduleIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    marginRight: 15,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  playButtonMini: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  playIconMini: {
    color: "#0284C7",
    fontSize: 12,
    marginLeft: 2,
  },
});

export default HomeScreen;
