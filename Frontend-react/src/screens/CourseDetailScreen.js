import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../utils/constants";
import { AuthContext } from "../context/AuthContext";
import apiService from "../services/apiService";

const CourseDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { userInfo } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("Lessons");
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (userInfo) {
      fetchCourseDetails();
    }
  }, [id, userInfo]);

  const fetchCourseDetails = async () => {
    setIsLoading(true);
    try {
      const [courseRes, progressRes] = await Promise.all([
        apiService.get(`/courses/${id}`),
        apiService.get(`/progress/${id}`).catch(() => ({
          data: { completedModules: [], progressPercentage: 0 },
        })),
      ]);
      setCourse(courseRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.log("Error fetching course details:", error);
      Alert.alert("Error", "Failed to load course details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async (moduleId) => {
    try {
      const res = await apiService.post("/progress/complete-module", {
        courseId: id,
        moduleId,
      });
      setProgress(res.data);
      // If all modules complete, prompt for quiz
      if (res.data.progressPercentage === 100) {
        Alert.alert(
          "Course Complete!",
          "You've finished all lessons. Ready for the final quiz?",
          [
            { text: "Later", style: "cancel" },
            {
              text: "Start Quiz",
              onPress: () =>
                navigation.navigate("Quiz", {
                  courseId: id,
                  quiz: course.quiz,
                }),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update progress.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text>Course not found</Text>
      </View>
    );
  }

  const isCompleted = (moduleId) =>
    progress?.completedModules?.includes(moduleId);

  return (
    <SafeAreaView style={styles.container}>
      {/* Video Header */}
      <View style={styles.videoContainer}>
        <WebView
          source={{
            uri:
              course.videoUrl ||
              (course.modules?.[0]?.videoUrl &&
                (course.modules[0].videoUrl.includes("v=")
                  ? `https://www.youtube.com/embed/${course.modules[0].videoUrl.split("v=")[1]}`
                  : course.modules[0].videoUrl)) ||
              "https://www.youtube.com/embed/dQw4w9WgXcQ",
          }}
          style={styles.video}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo={true}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{course.title}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Instructor</Text>
              <Text style={styles.statValue}>
                {course.instructor || "Sa-Dhan Expert"}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>
                {course.duration || "Self-paced"}
              </Text>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Text style={styles.progressText}>
                {Math.round(progress?.progressPercentage || 0)}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress?.progressPercentage || 0}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "Lessons" ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab("Lessons")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Lessons"
                  ? styles.activeTabText
                  : styles.inactiveTabText,
              ]}
            >
              Lessons
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "About" ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab("About")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "About"
                  ? styles.activeTabText
                  : styles.inactiveTabText,
              ]}
            >
              About
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === "Lessons" ? (
            <View style={styles.lessonList}>
              {course.modules?.map((item, index) => (
                <View key={item._id} style={styles.lessonItem}>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </Text>
                    <View style={styles.lessonTextContainer}>
                      <Text style={styles.lessonTitle}>{item.title}</Text>
                      <Text style={styles.lessonDuration}>
                        {item.duration || "10 min"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.completeBtn,
                      isCompleted(item._id) && styles.completedBtn,
                    ]}
                    onPress={() =>
                      !isCompleted(item._id) && handleMarkComplete(item._id)
                    }
                    disabled={isCompleted(item._id)}
                  >
                    <Text
                      style={[
                        styles.completeBtnText,
                        isCompleted(item._id) && styles.completedBtnText,
                      ]}
                    >
                      {isCompleted(item._id) ? "✓ Done" : "Mark as Done"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Quiz Button */}
              {progress?.progressPercentage === 100 && (
                <TouchableOpacity
                  style={styles.quizBtnMain}
                  onPress={() =>
                    navigation.navigate("Quiz", {
                      courseId: id,
                      quiz: course.quiz,
                    })
                  }
                >
                  <Text style={styles.quizBtnTextMain}>Start Final Quiz</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.aboutContent}>
              <Text style={styles.description}>{course.description}</Text>
              {course.outcomes && course.outcomes.length > 0 && (
                <View style={styles.learningOutcomes}>
                  <Text style={styles.outcomesTitle}>What you'll learn</Text>
                  {course.outcomes.map((outcome, idx) => (
                    <Text key={idx} style={styles.outcomeItem}>
                      • {outcome}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    height: 230,
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  stat: {
    marginRight: 40,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  progressSection: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    marginHorizontal: 20,
    padding: 5,
    borderRadius: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
  },
  activeTabText: {
    color: COLORS.primary,
  },
  inactiveTabText: {
    color: COLORS.textSecondary,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lessonList: {
    width: "100%",
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  lessonInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  lessonNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#CBD5E1",
    marginRight: 15,
  },
  lessonTextContainer: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.black,
    marginBottom: 2,
  },
  lessonDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  completeBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  completedBtn: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
  },
  completeBtnText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  completedBtnText: {
    color: "#16A34A",
  },
  quizBtnMain: {
    marginTop: 30,
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  quizBtnTextMain: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  aboutContent: {
    width: "100%",
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 25,
  },
  learningOutcomes: {
    backgroundColor: "#F8FAFC",
    padding: 15,
    borderRadius: 12,
  },
  outcomesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 10,
  },
  outcomeItem: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
});

export default CourseDetailScreen;
