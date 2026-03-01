import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, Feather } from "@expo/vector-icons";

import LanguageScreen from "../screens/LanguageScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import CourseListScreen from "../screens/CourseListScreen";
import WishlistScreen from "../screens/WishlistScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CourseDetailScreen from "../screens/CourseDetailScreen";
import QuizScreen from "../screens/QuizScreen";
import CertificateScreen from "../screens/CertificateScreen";
import { COLORS } from "../utils/constants";

import { ActivityIndicator, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function MainTabNavigator() {
  // ... (keep exact same MainTabNavigator code)
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="home"
              color={color}
              size={24}
              style={focused ? { opacity: 1 } : { opacity: 0.7 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CourseListScreen}
        options={{
          tabBarLabel: "Courses",
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="book-open"
              color={color}
              size={24}
              style={focused ? { opacity: 1 } : { opacity: 0.7 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarLabel: "Wishlist",
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="heart"
              color={color}
              size={24}
              style={focused ? { opacity: 1 } : { opacity: 0.7 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="user"
              color={color}
              size={24}
              style={focused ? { opacity: 1 } : { opacity: 0.7 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const AppNavigator = () => {
  const { isBootstrapping, userToken, hasSelectedLanguage } =
    React.useContext(AuthContext);

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FDFAF2" },
        }}
      >
        {userToken === null ? (
          // No token found, user isn't signed in
          <>
            {!hasSelectedLanguage && (
              <Stack.Screen name="Language" component={LanguageScreen} />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          // User is signed in
          <>
            <Stack.Screen name="Home" component={MainTabNavigator} />
            <Stack.Screen
              name="CourseDetail"
              component={CourseDetailScreen}
              options={{ title: "Course Details" }}
            />
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={{ title: "Final Quiz" }}
            />
            <Stack.Screen
              name="Certificate"
              component={CertificateScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
