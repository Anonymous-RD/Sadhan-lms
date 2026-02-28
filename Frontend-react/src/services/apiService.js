import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL = "http://10.13.109.159:5000";

const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout for production feel
});

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
