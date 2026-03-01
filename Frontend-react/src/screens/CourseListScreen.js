import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../utils/constants";
import { AuthContext } from "../context/AuthContext";
import apiService from "../services/apiService";
import { useFocusEffect } from "@react-navigation/native";

// These could also come from the API categories eventually
const CATEGORIES = ["All", "Development", "Design", "Business", "Soft Skill"];

const CourseListScreen = ({ navigation }) => {
  const { userInfo } = React.useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [progressData, setProgressData] = useState({});

  useFocusEffect(
    useCallback(() => {
      if (userInfo) {
        fetchCourses();
      }
    }, [userInfo]),
  );

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.get("/courses");
      const fetchedCourses = res.data || [];
      setCourses(fetchedCourses);

      // Fetch progress for each course
      const progressPromises = fetchedCourses.map((c) =>
        apiService.get(`/progress/${c._id}`).catch(() => ({ data: null })),
      );
      const progressResults = await Promise.all(progressPromises);

      const progressMap = {};
      progressResults.forEach((res, index) => {
        if (res.data) {
          progressMap[fetchedCourses[index]._id] = res.data.progressPercentage;
        }
      });
      setProgressData(progressMap);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderCategoryPill = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryPill,
        selectedCategory === category
          ? styles.categoryPillActive
          : styles.categoryPillInactive,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category
            ? styles.categoryTextActive
            : styles.categoryTextInactive,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Courses</Text>
        <TouchableOpacity style={styles.notificationBtn}>
          <View style={styles.bellIcon}></View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Courses"
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {CATEGORIES.map(renderCategoryPill)}
        </ScrollView>

        <Text style={styles.resultsCount}>
          {filteredCourses.length} courses found
        </Text>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 20 }}
          />
        ) : filteredCourses.length === 0 ? (
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              color: COLORS.textSecondary,
            }}
          >
            No courses found.
          </Text>
        ) : (
          filteredCourses.map((course) => (
            <TouchableOpacity
              key={course._id || course.id}
              style={styles.courseCard}
              onPress={() =>
                navigation.navigate("CourseDetail", {
                  courseId: course._id || course.id,
                })
              }
            >
              <View style={styles.courseImagePlaceholder}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {course.category || "Development"}
                  </Text>
                </View>
              </View>

              <View style={styles.courseHeader}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <TouchableOpacity>
                  <Text style={styles.heartIcon}>♡</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.courseDesc} numberOfLines={2}>
                {course.description}
              </Text>

              <View style={styles.courseMeta}>
                {/* Fallback values for meta details if not in DB yet */}
                <Text style={styles.metaText}>
                  🕒 {course.duration || "4h 30m"}
                </Text>
                <Text style={styles.metaText}>
                  📖 {course.modules?.length || 10} lessons
                </Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progressData[course._id] || 0}%` },
                    ]}
                  ></View>
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>
                    {Math.round(progressData[course._id] || 0)}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
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
  scrollContent: {
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    color: COLORS.textSecondary,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.black,
  },
  categoriesScroll: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryPillActive: {
    backgroundColor: COLORS.secondary, // Gold color from constants
  },
  categoryPillInactive: {
    backgroundColor: "#EBF8FF", // Light blue background
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#000",
  },
  categoryTextInactive: {
    color: "#325A73",
  },
  resultsCount: {
    paddingHorizontal: 20,
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 15,
  },
  courseCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  courseImagePlaceholder: {
    height: 140,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    marginBottom: 15,
    padding: 10,
  },
  tag: {
    backgroundColor: "#DBEAFE",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: "#1E40AF",
    fontSize: 12,
    fontWeight: "600",
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
  },
  heartIcon: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  courseDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
    lineHeight: 20,
  },
  courseMeta: {
    flexDirection: "row",
    marginBottom: 20,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginRight: 20,
  },
  progressContainer: {
    marginTop: 5,
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
  progressTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});

export default CourseListScreen;
