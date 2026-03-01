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
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

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
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.nameText}>{userName}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notificationBtn}>
            <Feather name="bell" size={24} color="#334155" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              Alert.alert("Logout", "Are you sure you want to logout?", [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: logout, style: "destructive" },
              ]);
            }}
          >
            <Feather name="log-out" size={24} color="#EF4444" />
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
              <View
                style={[styles.iconPlaceholder, { backgroundColor: "#E3F2FD" }]}
              >
                <Feather name="book-open" size={16} color="#0284C7" />
              </View>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
            <Text style={styles.statLabel}>Hours Learned</Text>
            <View style={styles.statBottom}>
              <Text style={styles.statValue}>{Math.round(stats.hours)} Hr</Text>
              <View
                style={[styles.iconPlaceholder, { backgroundColor: "#C8E6C9" }]}
              >
                <Feather name="clock" size={16} color="#16A34A" />
              </View>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#F3E8FF" }]}>
            <Text style={styles.statLabel}>Certification</Text>
            <View style={styles.statBottom}>
              <Text style={styles.statValue}>{stats.certificates}</Text>
              <View
                style={[styles.iconPlaceholder, { backgroundColor: "#E9D5FF" }]}
              >
                <MaterialCommunityIcons
                  name="trophy-outline"
                  size={18}
                  color="#9333EA"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Continue Learning Section */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Courses")}>
            <Text style={styles.seeAllText}>View All →</Text>
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
              <View style={styles.coursePill}>
                <Text style={styles.coursePillText}>Development</Text>
              </View>
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{recentCourse.title}</Text>
              <Text style={styles.courseSubtitle} numberOfLines={2}>
                {recentCourse.description ||
                  "Learn essential computer and internet skills for everyday use"}
              </Text>

              <View style={styles.courseMetaRow}>
                <View style={styles.metaItem}>
                  <Feather
                    name="clock"
                    size={14}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.courseMetaText}>4h 30m</Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather
                    name="book-open"
                    size={14}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.courseMetaText}>12 lessons</Text>
                </View>
              </View>

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

        <View style={styles.centeredSectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
        </View>

        <TouchableOpacity style={styles.scheduleCard}>
          <View style={styles.scheduleIconPlaceholder}>
            <MaterialCommunityIcons name="play" size={24} color="#0284C7" />
          </View>
          <View style={styles.scheduleContent}>
            <Text style={styles.scheduleTitle}>User Research Methods</Text>
            <Text style={styles.scheduleTime}>UX Design Principle</Text>
          </View>
          <View style={styles.timePill}>
            <Text style={styles.timePillText}>10:00 AM</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scheduleCard}>
          <View style={styles.scheduleIconPlaceholder}>
            <MaterialCommunityIcons name="play" size={24} color="#0284C7" />
          </View>
          <View style={styles.scheduleContent}>
            <Text style={styles.scheduleTitle}>State Management</Text>
            <Text style={styles.scheduleTime}>React Fundamentals</Text>
          </View>
          <View style={styles.timePill}>
            <Text style={styles.timePillText}>02:30 AM</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF4", // Matches global light cream background
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
    backgroundColor: "transparent",
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
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  nameText: {
    fontSize: 20,
    color: "#D0972B", // Gold color from mockup
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationBtn: {
    marginRight: 15,
  },
  bellIcon: {
    fontSize: 22,
  },
  logoutBtn: {
    padding: 5,
  },
  logoutIcon: {
    fontSize: 22,
  },
  statsScroll: {
    paddingLeft: 20,
    marginBottom: 30,
  },
  statCard: {
    width: 140,
    padding: 15,
    borderRadius: 12,
    marginRight: 15,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  statBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "400",
    color: "#000",
  },
  iconPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  statIcon: {
    fontSize: 14,
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
    color: "#000",
  },
  courseCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 30,
  },
  courseImagePlaceholder: {
    height: 140,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    marginBottom: 15,
    padding: 12,
    alignItems: "flex-start",
  },
  coursePill: {
    backgroundColor: "#BFDBFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  coursePillText: {
    color: "#1E3A8A",
    fontSize: 12,
    fontWeight: "500",
  },
  courseInfo: {
    width: "100%",
  },
  courseTitle: {
    fontSize: 20,
    color: "#000",
    marginBottom: 6,
  },
  courseSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
    lineHeight: 20,
  },
  courseMetaRow: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  courseMetaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
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
    color: COLORS.textSecondary,
  },
  centeredSectionHeader: {
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  scheduleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  scheduleIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  schedulePlayIcon: {
    fontSize: 14,
    color: "#0284C7",
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
    marginBottom: 2,
  },
  scheduleTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timePill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timePillText: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "500",
  },
});

export default HomeScreen;
