import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import apiService from "../services/apiService";
import { COLORS } from "../utils/constants";
import AnimatedToast from "../components/AnimatedToast";

const WishlistScreen = ({ navigation }) => {
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingIds, setRemovingIds] = useState({});
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

  const fetchWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await apiService.get("/wishlist");
      setWishlistCourses(res.data || []);
    } catch (_err) {
      setError("Failed to load wishlist.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, [fetchWishlist]),
  );

  const handleRemove = async (courseId) => {
    setRemovingIds((prev) => ({ ...prev, [courseId]: true }));

    // Optimistic UI update
    const previous = wishlistCourses;
    setWishlistCourses((prev) => prev.filter((course) => course._id !== courseId));

    try {
      await apiService.delete(`/wishlist/${courseId}`);
      showToast("Removed from wishlist", "info");
    } catch (_err) {
      setWishlistCourses(previous);
      showToast("Failed to remove from wishlist", "error");
    } finally {
      setRemovingIds((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  const renderCourse = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("CourseDetail", { id: item._id })}
    >
      <View style={styles.tag}>
        <Text style={styles.tagText}>{item.category || "Development"}</Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <TouchableOpacity
          onPress={(event) => {
            event.stopPropagation();
            handleRemove(item._id);
          }}
          disabled={removingIds[item._id]}
        >
          <MaterialCommunityIcons name="heart" size={20} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description || "No description available."}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <AnimatedToast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchWishlist}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
        <AnimatedToast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {wishlistCourses.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Your wishlist is empty.</Text>
        </View>
      ) : (
        <FlatList
          data={wishlistCourses}
          keyExtractor={(item) => item._id}
          renderItem={renderCourse}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      <AnimatedToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
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
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  tagText: {
    color: "#1E40AF",
    fontSize: 12,
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    marginRight: 8,
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  description: {
    marginTop: 8,
    fontSize: 13,
    color: "#475569",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 15,
    color: "#B91C1C",
    textAlign: "center",
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});

export default WishlistScreen;
