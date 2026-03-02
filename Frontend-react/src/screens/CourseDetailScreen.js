import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../utils/constants";
import { AuthContext } from "../context/AuthContext";
import apiService from "../services/apiService";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AnimatedToast from "../components/AnimatedToast";
import YoutubePlayer from "react-native-youtube-iframe";

// Robust YouTube ID extractor
const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const CourseDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { userInfo } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("Lessons");
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

  const fetchCourseDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const [courseRes, progressRes] = await Promise.all([
        apiService.get(`/courses/${id}`),
        apiService.get(`/progress/${id}`).catch(() => ({
          data: null,
        })),
      ]);
      setCourse(courseRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.log("Error fetching course details:", error);
      showToast("Failed to load course details.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (userInfo) {
      fetchCourseDetails();
    }
  }, [fetchCourseDetails, userInfo]);

  const handleEnroll = async () => {
    try {
      await apiService.post("/progress/enroll", { courseId: id });
      fetchCourseDetails();
      showToast("Enrolled successfully", "success");
    } catch (error) {
      console.error("Enrollment error:", error);
      showToast("Failed to enroll in the course.", "error");
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
    } catch (_error) {
      showToast("Failed to update progress.", "error");
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
        {course.youtubeVideoUrl ? (
          <YoutubePlayer
            height={220}
            play={route.params?.autoplay || false}
            videoId={getYoutubeId(course.youtubeVideoUrl) || "dQw4w9WgXcQ"}
            onChangeState={(state) => {
              if (state === "ended") {
                // Potential: mark lesson as completed
              }
            }}
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.header}>
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {course.category || "Development"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.quizTag}
              onPress={() =>
                progress?.progressPercentage === 100
                  ? navigation.navigate("Quiz", {
                      courseId: id,
                      quiz: course.quiz,
                    })
                  : showToast("Complete all lessons first!", "info")
              }
            >
              <Text style={styles.quizTagText}>Quiz</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.subtitle}>
            By {course.instructor || "Dr. Emily Chen"}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={14} color="#16A34A" />
              <Text style={styles.metaText}>
                {course.modules?.length
                  ? `${course.modules.length * 1.5}h`
                  : "4h 30m"}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="book-open" size={14} color="#0284C7" />
              <Text style={styles.metaText}>
                {course.modules?.length || 12} lessons
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="ribbon" size={14} color="#BE185D" />
              <Text style={styles.metaText}>Certification</Text>
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
            <Text style={styles.progressSubtext}>
              {progress?.completedModules?.length || 0} of{" "}
              {course.modules?.length || 0} lessons completed
            </Text>
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
              {course.modules?.map((item, index) => {
                const isDone = isCompleted(item._id);
                // Assume the first uncompleted module is "playing" or next.
                const isNext =
                  !isDone &&
                  (index === 0 || isCompleted(course.modules[index - 1]._id));

                return (
                  <View
                    key={item._id}
                    style={[
                      styles.lessonItem,
                      isNext && styles.lessonItemActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        isDone
                          ? styles.iconBoxDone
                          : isNext
                            ? styles.iconBoxNext
                            : styles.iconBoxLocked,
                      ]}
                    >
                      {isDone ? (
                        <Feather name="check" size={16} color="#16A34A" />
                      ) : isNext ? (
                        <Feather
                          name="play"
                          size={16}
                          color={COLORS.white}
                          style={{ marginLeft: 2 }}
                        />
                      ) : (
                        <Feather name="lock" size={14} color="#94A3B8" />
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.lessonTextContainer}
                      onPress={() => isNext && handleMarkComplete(item._id)}
                      disabled={!isNext}
                    >
                      <Text
                        style={[
                          styles.lessonTitle,
                          !isDone && !isNext && { color: "#64748B" },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.lessonDuration}>
                        {item.duration || "15 min"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.aboutContent}>
              <Text style={styles.description}>{course.description}</Text>
              {course.outcomes && course.outcomes.length > 0 && (
                <View style={styles.learningOutcomes}>
                  <Text style={styles.outcomesTitle}>
                    {"What you'll learn"}
                  </Text>
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

      {/* Sticky Bottom Action */}
      <View style={styles.bottomBar}>
        {progress ? (
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => {
              // Passing autoplay=true to force re-render with autoplay if not already playing
              navigation.setParams({ autoplay: true });
            }}
          >
            <Text style={styles.continueBtnText}>Continue Learning</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.enrollBtn} onPress={handleEnroll}>
            <Text style={styles.continueBtnText}>Enroll Now</Text>
          </TouchableOpacity>
        )}
      </View>
      <AnimatedToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        bottomOffset={24}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
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
    paddingBottom: 5,
  },
  tagsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tag: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    color: "#1E40AF",
    fontSize: 12,
    fontWeight: "600",
  },
  quizTag: {
    backgroundColor: "#10B981", // Emerald green
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 14,
  },
  quizTagText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  progressSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E3A8A", // Dark blue from mockup
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#1E3A8A",
    borderRadius: 3,
  },
  progressSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF", // Light blue tab container
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.0,
    elevation: 1,
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
  },
  activeTabText: {
    color: COLORS.black,
  },
  inactiveTabText: {
    color: COLORS.textSecondary,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  lessonList: {
    width: "100%",
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
  },
  lessonItemActive: {
    backgroundColor: "#EFF6FF", // Active background
    borderLeftWidth: 4,
    borderLeftColor: "#1E3A8A",
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  iconBoxDone: {
    backgroundColor: "#DCFCE7", // Light green
  },
  iconBoxNext: {
    backgroundColor: "#1E3A8A", // Dark blue
  },
  iconBoxLocked: {
    backgroundColor: "#F1F5F9", // Slate
  },
  lessonTextContainer: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  lessonDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  continueBtn: {
    backgroundColor: "#325A73", // Primary deep blue
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e293b",
  },
  lockText: {
    color: COLORS.white,
    marginTop: 10,
    fontSize: 16,
  },
  enrollBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
});

export default CourseDetailScreen;
