import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../utils/constants";
import apiService from "../services/apiService";
import { useFocusEffect } from "@react-navigation/native";
import AnimatedToast from "../components/AnimatedToast";

const CertificateListScreen = ({ navigation }) => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

  const fetchCertificates = useCallback(async () => {
    try {
      setIsLoading(true);
      const coursesRes = await apiService.get("/courses");
      const courses = coursesRes.data;

      if (courses && courses.length > 0) {
        const progressPromises = courses.map((c) =>
          apiService.get(`/progress/${c._id}`).catch(() => ({ data: null })),
        );
        const progressResults = await Promise.all(progressPromises);

        const earned = [];
        progressResults.forEach((res, index) => {
          if (res.data && res.data.certificateGenerated) {
            earned.push({
              id: res.data._id,
              courseId: courses[index]._id,
              courseTitle: courses[index].title,
              date: res.data.updatedAt,
            });
          }
        });
        setCertificates(earned);
      }
    } catch (_e) {
      showToast("Failed to load certificates.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCertificates();
    }, [fetchCertificates]),
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.certificateCard}
      onPress={() =>
        navigation.navigate("Certificate", { courseId: item.courseId })
      }
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="certificate"
          size={32}
          color={COLORS.secondary}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.courseTitle}>{item.courseTitle}</Text>
        <Text style={styles.dateText}>
          Issued on {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Certificates</Text>
      </View>

      {certificates.length > 0 ? (
        <FlatList
          data={certificates}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="certificate-outline"
            size={80}
            color={COLORS.border}
          />
          <Text style={styles.emptyText}>No certificates earned yet.</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate("Courses")}
          >
            <Text style={styles.browseButtonText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      )}
      <AnimatedToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  listContainer: {
    padding: 20,
  },
  certificateCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF9F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 20,
    textAlign: "center",
  },
  browseButton: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
});

export default CertificateListScreen;
