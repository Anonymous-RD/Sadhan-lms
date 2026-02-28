import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../utils/constants";

const LANGUAGES = [
  {
    id: "en",
    title: "English",
    native: "English",
    color: COLORS.langLightPink,
    isEnabled: true,
  },
  {
    id: "hi",
    title: "Hindi",
    native: "हिंदी",
    color: COLORS.langLightGray,
    isEnabled: true,
  },
  {
    id: "bn",
    title: "Bengali",
    native: "বাংলা",
    color: COLORS.langLightPurple,
    isEnabled: false,
  },
  {
    id: "te",
    title: "Telugu",
    native: "తెలుగు",
    color: COLORS.langLightCyan,
    isEnabled: false,
  },
  {
    id: "mr",
    title: "Marathi",
    native: "मराठी",
    color: COLORS.langLightBlue,
    isEnabled: false,
  },
  {
    id: "ta",
    title: "Tamil",
    native: "தமிழ்",
    color: COLORS.langLightIndigo,
    isEnabled: false,
  },
  {
    id: "ur",
    title: "Urdu",
    native: "اردو",
    color: COLORS.langLightGreen,
    isEnabled: false,
  },
  {
    id: "gu",
    title: "Gujarati",
    native: "ગુજરાતી",
    color: COLORS.langLightYellow,
    isEnabled: false,
  },
  {
    id: "kn",
    title: "Kannada",
    native: "ಕನ್ನಡ",
    color: COLORS.langLightPink,
    isEnabled: false,
  },
  {
    id: "or",
    title: "Odia",
    native: "ଓଡ଼ିଆ",
    color: COLORS.langLightPurple,
    isEnabled: false,
  },
  {
    id: "ml",
    title: "Malayalam",
    native: "Malayalam",
    color: COLORS.langLightGray,
    isEnabled: false,
  },
  {
    id: "pa",
    title: "Punjabi",
    native: "Punjabi",
    color: COLORS.langLightPink,
    isEnabled: false,
  },
];

const LanguageScreen = ({ navigation }) => {
  const [selectedLang, setSelectedLang] = useState("en");

  const renderItem = ({ item }) => {
    const isSelected = selectedLang === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.langCard,
          { backgroundColor: item.color, opacity: item.isEnabled ? 1 : 0.5 },
        ]}
        onPress={() => item.isEnabled && setSelectedLang(item.id)}
        activeOpacity={item.isEnabled ? 0.7 : 1}
      >
        <Text
          style={[
            styles.nativeText,
            { color: isSelected ? "#E53935" : COLORS.primary },
          ]}
        >
          {item.native}
        </Text>
        <Text
          style={[
            styles.englishText,
            { color: isSelected ? "#E53935" : COLORS.textSecondary },
          ]}
        >
          {item.title}
        </Text>
        {isSelected && (
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header / Logo could go here if image assets are available */}
      <View style={styles.header}>
        <Text style={styles.title}>Select your Language</Text>
      </View>

      <FlatList
        data={LANGUAGES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    color: "#325A73",
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  langCard: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    padding: 15,
    height: 90,
    justifyContent: "center",
    position: "relative",
  },
  nativeText: {
    fontSize: 22,
    fontWeight: "500",
    marginBottom: 4,
  },
  englishText: {
    fontSize: 12,
  },
  checkCircle: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#00BFA5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  checkIcon: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: COLORS.background,
    alignItems: "flex-end",
  },
  continueButton: {
    backgroundColor: "#325A73",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  continueText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "500",
  },
});

export default LanguageScreen;
