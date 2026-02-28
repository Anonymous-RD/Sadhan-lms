import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../utils/constants";
import apiService from "../services/apiService";

const QuizScreen = ({ route, navigation }) => {
  const { courseId, quiz } = route.params;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentQuestion = quiz[currentQuestionIndex];

  const handleSelectOption = (option) => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(
      (a) => a.questionId === currentQuestion._id,
    );

    if (existingIndex !== -1) {
      newAnswers[existingIndex].answer = option;
    } else {
      newAnswers.push({ questionId: currentQuestion._id, answer: option });
    }
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (answers.length < quiz.length) {
      Alert.alert(
        "Incomplete",
        "Please answer all questions before submitting.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.post("/quiz/submit", {
        courseId,
        answers,
      });

      const { score, passed, message } = res.data;

      if (passed) {
        Alert.alert(
          "Congratulations!",
          `You scored ${Math.round(score)}%. ${message}`,
          [
            {
              text: "View Certificate",
              onPress: () => navigation.navigate("Certificate", { courseId }),
            },
            { text: "Done", onPress: () => navigation.navigate("Home") },
          ],
        );
      } else {
        Alert.alert(
          "Quiz Results",
          `You scored ${Math.round(score)}%. ${message}`,
          [{ text: "Try Again", onPress: () => navigation.goBack() }],
        );
      }
    } catch (error) {
      console.error("Quiz submission error:", error);
      Alert.alert("Error", "Failed to submit quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOption = answers.find(
    (a) => a.questionId === currentQuestion?._id,
  )?.answer;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Final Quiz</Text>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {quiz.length}
        </Text>
      </View>

      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%` },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.questionText}>{currentQuestion?.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion?.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === option && styles.selectedOption,
              ]}
              onPress={() => handleSelectOption(option)}
            >
              <View
                style={[
                  styles.radioCircle,
                  selectedOption === option && styles.selectedRadioCircle,
                ]}
              >
                {selectedOption === option && <View style={styles.radioDot} />}
              </View>
              <Text
                style={[
                  styles.optionText,
                  selectedOption === option && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            currentQuestionIndex > 0 &&
            setCurrentQuestionIndex(currentQuestionIndex - 1)
          }
          disabled={currentQuestionIndex === 0}
        >
          <Text
            style={[
              styles.backText,
              currentQuestionIndex === 0 && { color: "#CBD5E1" },
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, !selectedOption && styles.disabledButton]}
          onPress={handleNext}
          disabled={!selectedOption || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.nextText}>
              {currentQuestionIndex === quiz.length - 1 ? "Submit" : "Next"}
            </Text>
          )}
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
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "#E2E8F0",
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: 25,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    lineHeight: 26,
    marginBottom: 30,
  },
  optionsContainer: {
    width: "100%",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: "#F1F5F9",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  selectedRadioCircle: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    justifyContent: "center",
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 25,
    minWidth: 120,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#CBD5E1",
  },
  nextText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default QuizScreen;
