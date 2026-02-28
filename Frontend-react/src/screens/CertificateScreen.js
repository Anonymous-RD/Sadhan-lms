import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../utils/constants";
import apiService from "../services/apiService";

const CertificateScreen = ({ route, navigation }) => {
  const { courseId } = route.params;
  const [certificateData, setCertificateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCertificate();
  }, [courseId]);

  const fetchCertificate = async () => {
    try {
      const res = await apiService.get(`/certificate/${courseId}`);
      setCertificateData(res.data);
    } catch (error) {
      console.error("Certificate fetch error:", error);
      Alert.alert(
        "Not Eligible",
        "You need to pass the quiz with 60% or higher to view the certificate.",
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

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
          style={styles.closeBtn}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Certificate</Text>
      </View>

      <View style={styles.certificateWrapper}>
        <View style={styles.certificate}>
          <Text style={styles.certLabel}>CERTIFICATE OF COMPLETION</Text>
          <View style={styles.divider} />

          <Text style={styles.presentedTo}>THIS IS PRESENTED TO</Text>
          <Text style={styles.userName}>{certificateData?.userName}</Text>

          <Text style={styles.completionText}>
            for successfully completing the course
          </Text>
          <Text style={styles.courseTitle}>{certificateData?.courseTitle}</Text>

          <View style={styles.certFooter}>
            <View style={styles.footerCol}>
              <Text style={styles.date}>
                {new Date(certificateData?.date).toLocaleDateString()}
              </Text>
              <Text style={styles.footerLabel}>DATE</Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.signName}>Sa-Dhan Academy</Text>
              <Text style={styles.footerLabel}>ISSUER</Text>
            </View>
          </View>

          <Text style={styles.certId}>
            ID: {certificateData?.certificateId}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.downloadBtn}
        onPress={() =>
          Alert.alert(
            "Coming Soon",
            "PDF Download will be implemented in the next v1 update.",
          )
        }
      >
        <Text style={styles.downloadText}>Download PDF</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  closeBtn: {
    padding: 10,
    marginRight: 10,
  },
  closeText: {
    fontSize: 20,
    color: COLORS.black,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  certificateWrapper: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  certificate: {
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 4,
    borderWidth: 10,
    borderColor: COLORS.primary,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  certLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 20,
    textAlign: "center",
  },
  divider: {
    height: 2,
    backgroundColor: COLORS.secondary,
    width: "80%",
    marginBottom: 30,
  },
  presentedTo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 30,
    textAlign: "center",
  },
  completionText: {
    fontSize: 12,
    fontStyle: "italic",
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 40,
  },
  certFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  footerCol: {
    alignItems: "center",
  },
  date: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  signName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  footerLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#CBD5E1",
    paddingTop: 5,
    width: 60,
    textAlign: "center",
  },
  certId: {
    fontSize: 8,
    color: "#94A3B8",
    position: "absolute",
    bottom: 5,
    right: 5,
  },
  downloadBtn: {
    margin: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  downloadText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CertificateScreen;
