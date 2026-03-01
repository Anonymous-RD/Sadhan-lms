import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { COLORS } from "../utils/constants";
import { AuthContext } from "../context/AuthContext";
import AnimatedToast from "../components/AnimatedToast";

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });
  const { register, isLoading } = useContext(AuthContext);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

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
      showToast("Please fill in all the details to continue.", "error");
      return;
    }

    // Email validation
    if (!validateEmail(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    // Mobile number validation (simple check for length after country code)
    if (mobileNumber.length < 10) {
      showToast("Please enter a valid 10-digit mobile number.", "error");
      return;
    }

    // Password validation
    if (password.length < 6) {
      showToast("Password should be at least 6 characters long.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match. Please verify.", "error");
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
        showToast("Account created. Please log in.", "success");
        setTimeout(() => navigation.navigate("Login"), 700);
      } else {
        // Auto-login success handled by AuthContext
      }
    } else {
      showToast(
        message || "Something went wrong. Please try again later.",
        "error",
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
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
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
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
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
