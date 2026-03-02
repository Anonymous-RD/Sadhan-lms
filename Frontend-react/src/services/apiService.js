import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Dynamically determine the API URL based on the host's IP address
const getApiUrl = () => {
  // Try different manifest paths for different Expo versions
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  console.log("Expo Debugger Host:", debuggerHost);

  const localhost = debuggerHost?.split(":")[0];
  console.log("Parsed Localhost IP:", localhost);

  // If we have a localhost IP, use it. Otherwise fall back to a reasonable default.
  // Use 10.0.2.2 for Android emulators connecting to host machine if all else fails
  const ip = localhost || "10.0.2.2";

  const finalUrl = `http://${ip}:5000`;
  console.log("Final determined API_URL:", finalUrl);

  return finalUrl;
};

const API_URL = getApiUrl();

const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout for production feel
});

export { API_URL };

// Add a request interceptor to inject the JWT token
apiService.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Token injection error:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle global errors
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      console.log("Unauthorized request detected. Clearing token.");
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userInfo");
      // Note: Ideally, emit a 'logout' event or similar to AuthContext
    }
    return Promise.reject(error);
  },
);

export default apiService;
