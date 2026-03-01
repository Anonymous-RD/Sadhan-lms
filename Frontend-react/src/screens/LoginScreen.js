import React, { useState, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { COLORS } from "../utils/constants";
import { AuthContext } from "../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const [loginMethod, setLoginMethod] = useState("otp"); // "otp" or "password"
  const [identifier, setIdentifier] = useState(""); // Email or Mobile
  const [countryCode, setCountryCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const { login, isLoading } = useContext(AuthContext);
  const inputRefs = useRef([]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );
  };

  const handleLogin = async () => {
    if (!identifier) {
      Alert.alert(
        "Input Required",
        "Please enter your Email or Mobile Number.",
      );
      return;
    }

    let finalIdentifier = identifier;
    const isEmail = validateEmail(identifier);

    // If it's not an email, assume it's a mobile number and prepend country code
    if (!isEmail && !identifier.includes("+")) {
      finalIdentifier = `${countryCode}${identifier}`;
    }

    let credential = "";
    if (loginMethod === "otp") {
      credential = otp.join("");
      if (credential.length !== 6) {
        Alert.alert(
          "Invalid OTP",
          "Please enter the 6-digit code sent to you.",
        );
        return;
      }
    } else {
      credential = password;
      if (!credential) {
        Alert.alert(
          "Password Required",
          "Please enter your password to continue.",
        );
        return;
      }
    }

    const { success, message, notFound } = await login(
      finalIdentifier,
      credential,
      loginMethod,
    );

    if (success) {
      // Navigation handled by AuthContext
    } else {
      if (notFound) {
        Alert.alert(
          "Account Not Found",
          "We couldn't find an account with those details. Would you like to create one?",
          [
            { text: "Not Now", style: "cancel" },
            { text: "Sign Up", onPress: () => navigation.navigate("Signup") },
          ],
        );
      } else {
        Alert.alert(
          "Login Failed",
          message || "Please check your credentials and try again.",
        );
      }
    }
  };

  const CountryPrefix = () => (
    <TouchableOpacity
      style={styles.countryPicker}
      onPress={() => {
        const codes = ["+91", "+1", "+44", "+971"];
        const currentIndex = codes.indexOf(countryCode);
        const nextIndex = (currentIndex + 1) % codes.length;
        setCountryCode(codes[nextIndex]);
      }}
    >
      <Text style={styles.countryCodeText}>{countryCode}</Text>
      <Text style={styles.dropdownIcon}>▼</Text>
    </TouchableOpacity>
  );

  const isEmailInput = validateEmail(identifier);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Log in to continue your learning journey
          </Text>
        </View>

        {/* Form Selection */}
        <View style={styles.tabContainer}>
          <View style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Login</Text>
          </View>
          <TouchableOpacity
            style={[styles.tab, styles.inactiveTab]}
            onPress={() => navigation.navigate("Signup")}
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>
              Sign up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          <CustomInput
            label="Email or Mobile Number"
            placeholder="john@example.com or 9876543210"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="default"
            prefixComponent={
              !isEmailInput &&
              identifier.length > 0 &&
              isFinite(identifier[0]) ? (
                <CountryPrefix />
              ) : null
            }
          />

          {loginMethod === "otp" ? (
            <View style={styles.otpSection}>
              <Text style={styles.inputLabel}>
                Enter 6-Digit OTP (Demo: 123456)
              </Text>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                  />
                ))}
              </View>
              <TouchableOpacity style={styles.resendContainer}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CustomInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
          )}

          <TouchableOpacity
            style={styles.switchMethodBtn}
            onPress={() =>
              setLoginMethod(loginMethod === "otp" ? "password" : "otp")
            }
          >
            <Text style={styles.switchMethodText}>
              {loginMethod === "otp"
                ? "Use Password instead"
                : "Use OTP instead"}
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonWrapper}>
            <CustomButton
              title={isLoading ? "Logging in..." : "Login"}
              onPress={handleLogin}
              disabled={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: "center",
  },
  logoImage: {
    height: 70,
    width: 280,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 5,
    marginBottom: 25,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  formContainer: {
    width: "100%",
  },
  methodToggleContainer: {
    flexDirection: "row",
    marginBottom: 25,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 4,
  },
  methodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeMethodTab: {
    backgroundColor: COLORS.white,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  methodTabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  activeMethodTabText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
    fontWeight: "600",
  },
  otpSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  resendContainer: {
    alignItems: "flex-end",
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  buttonWrapper: {
    marginTop: 10,
    marginBottom: 25,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  countryCodeText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "bold",
    marginRight: 4,
  },
  dropdownIcon: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  switchMethodBtn: {
    marginTop: 15,
    alignItems: "center",
    paddingVertical: 10,
  },
  switchMethodText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
