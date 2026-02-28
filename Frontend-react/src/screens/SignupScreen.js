import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { COLORS } from "../utils/constants";
import { AuthContext } from "../context/AuthContext";

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, isLoading } = useContext(AuthContext);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );
  };

  const handleSignup = async () => {
    // Basic presence check
    if (!fullName || !email || !mobileNumber || !password || !confirmPassword) {
      Alert.alert(
        "Required Fields",
        "Please fill in all the details to continue.",
      );
      return;
    }

    // Email validation
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    // Mobile number validation (simple check for length after country code)
    if (mobileNumber.length < 10) {
      Alert.alert(
        "Invalid Mobile",
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    // Password validation
    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password should be at least 6 characters long.",
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match. Please verify.");
      return;
    }

    const { success, message, needsLogin } = await register(
      fullName,
      email,
      `${countryCode}${mobileNumber}`,
      password,
    );

    if (success) {
      if (needsLogin) {
        Alert.alert(
          "Account Created",
          "You've successfully registered! Please log in with your credentials.",
        );
        navigation.navigate("Login");
      } else {
        // Auto-login success handled by AuthContext
      }
    } else {
      Alert.alert(
        "Registration Error",
        message || "Something went wrong. Please try again later.",
      );
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Sa-Dhan</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to start your journey with us
          </Text>
        </View>

        {/* Form Selection */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, styles.inactiveTab]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>Login</Text>
          </TouchableOpacity>
          <View style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Sign up</Text>
          </View>
        </View>

        {/* Input Fields */}
        <View style={styles.formContainer}>
          <CustomInput
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
          />

          <CustomInput
            label="Email Address"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <CustomInput
            label="Mobile Number"
            placeholder="9876543210"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            prefixComponent={<CountryPrefix />}
          />

          <CustomInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <CustomInput
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <View style={styles.buttonWrapper}>
            <CustomButton
              title={isLoading ? "Creating Account..." : "Sign Up"}
              onPress={handleSignup}
              disabled={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerLink}>Login</Text>
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
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
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
  buttonWrapper: {
    marginTop: 20,
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
});

export default SignupScreen;
