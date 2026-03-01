import React, { useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

const TYPE_CONFIG = {
  success: {
    backgroundColor: "#166534",
    icon: "check-circle",
  },
  error: {
    backgroundColor: "#B91C1C",
    icon: "alert-circle",
  },
  info: {
    backgroundColor: "#1D4ED8",
    icon: "info",
  },
};

const AnimatedToast = ({
  visible,
  message,
  type = "success",
  duration = 1800,
  bottomOffset = 90,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    const showAnimation = Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]);

    const hide = () => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 80,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onHide) {
          onHide();
        }
      });
    };

    showAnimation.start();
    const timer = setTimeout(hide, duration);

    return () => clearTimeout(timer);
  }, [duration, message, onHide, opacity, translateY, type, visible]);

  if (!visible) {
    return null;
  }

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <View pointerEvents="box-none" style={styles.overlay}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.container,
            {
              transform: [{ translateY }],
              opacity,
              backgroundColor: config.backgroundColor,
              bottom: bottomOffset,
            },
          ]}
        >
          <View style={styles.content}>
            <Feather name={config.icon} size={16} color="#FFFFFF" />
            <Text style={styles.message} numberOfLines={2}>
              {message}
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 10,
    paddingLeft: 10,
    zIndex: 1000,
    elevation: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  message: {
    color: "#FFFFFF",
    padding: 8,
    // paddingLeft: s9,
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
});

export default AnimatedToast;
