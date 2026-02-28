import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "../services/apiService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (identifier, credential, loginMethod = "otp") => {
    setIsLoading(true);
    try {
      const isEmail = identifier.includes("@");

      const payload = {
        password: loginMethod === "password" ? credential : "password123", // Default for demo OTP path
      };

      if (isEmail) {
        payload.email = identifier;
      } else {
        payload.phoneNumber = identifier;
      }

      const loginRes = await apiService.post("/auth/login", payload);

      if (loginRes.data && loginRes.data.requireOtp) {
        if (loginMethod === "otp") {
          const otpRes = await apiService.post("/auth/verify-otp", {
            userId: loginRes.data.userId,
            otp: credential,
          });

          if (otpRes.data && otpRes.data.token) {
            const userObj = {
              _id: otpRes.data._id,
              email: otpRes.data.email,
              role: otpRes.data.role,
              name: otpRes.data.name || "Learner",
            };
            // 🚨 Store EVERYTHING before setting state to avoid 401 race conditions
            await AsyncStorage.setItem("userInfo", JSON.stringify(userObj));
            await AsyncStorage.setItem("userToken", otpRes.data.token);

            setUserInfo(userObj);
            setUserToken(otpRes.data.token);
            setIsLoading(false);
            return { success: true };
          }
        } else {
          // Auto-verify with static OTP for password-only demo flow
          const otpRes = await apiService.post("/auth/verify-otp", {
            userId: loginRes.data.userId,
            otp: "123456",
          });

          if (otpRes.data && otpRes.data.token) {
            const userObj = {
              _id: otpRes.data._id,
              email: otpRes.data.email,
              role: otpRes.data.role,
              name: otpRes.data.name || "Learner",
            };
            // 🚨 Store EVERYTHING before setting state
            await AsyncStorage.setItem("userInfo", JSON.stringify(userObj));
            await AsyncStorage.setItem("userToken", otpRes.data.token);

            setUserInfo(userObj);
            setUserToken(otpRes.data.token);
            setIsLoading(false);
            return { success: true };
          }
        }
      }
    } catch (e) {
      console.log("Login error:", e?.response?.data || e.message);
      setIsLoading(false);
      return {
        success: false,
        notFound: e?.response?.status === 404 || e?.response?.data?.notFound,
        message: e?.response?.data?.message || "Login failed",
      };
    }
    setIsLoading(false);
    return { success: false, message: "Invalid response from server" };
  };

  const register = async (name, email, mobileNumber, password) => {
    setIsLoading(true);
    try {
      const res = await apiService.post("/auth/register", {
        name,
        email,
        phoneNumber: mobileNumber,
        password,
        role: "learner",
      });

      if (res.data && res.data.token) {
        const userObj = {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
        };
        await AsyncStorage.setItem("userInfo", JSON.stringify(userObj));
        await AsyncStorage.setItem("userToken", res.data.token);
        setUserInfo(userObj);
        setUserToken(res.data.token);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: true, needsLogin: true };
    } catch (e) {
      console.log("Register error:", e?.response?.data || e.message);
      setIsLoading(false);
      return {
        success: false,
        message: e?.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserInfo(null);
    await AsyncStorage.removeItem("userInfo");
    await AsyncStorage.removeItem("userToken");
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsBootstrapping(true);
      let userInfoStr = await AsyncStorage.getItem("userInfo");
      let userTokenStr = await AsyncStorage.getItem("userToken");

      if (userInfoStr && userTokenStr) {
        setUserInfo(JSON.parse(userInfoStr));
        setUserToken(userTokenStr);
      }
      setIsBootstrapping(false);
    } catch (e) {
      console.log("isLoggedIn error:", e);
      setIsBootstrapping(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        register,
        isLoading,
        isBootstrapping,
        userToken,
        userInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
