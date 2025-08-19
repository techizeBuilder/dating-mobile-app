import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  LucideTrash,
  MoreVertical,
  MoveVertical,
  Trash,
} from "lucide-react-native";
import axios from "axios";
import { useUserProfile } from "../context/userContext";
import { API_BASE_URL } from "../apiUrl";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

type SavedUser = {
  id: string;
  name: string;
  age: number;
  location?: string;
  bio?: string;
  image?: string;
};

export default function SavedUsersScreen() {
  const [savedUsers, setSavedUsers] = useState<SavedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedBioId, setExpandedBioId] = useState<string | null>(null);
  const { token } = useUserProfile();

  const fetchSavedUsers = async () => {
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/user/my-favourites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const reshapedData: SavedUser[] = response.data.data.map((item: any) => {
        const fav = item.favouriteUser;

        return {
          id: fav._id,
          name: fav.name,
          age: fav.age,
          bio: fav.about,
          image: fav.profile_image?.replace("http:/", "http://"),
          location: `${fav.address?.city}, ${fav.address?.state}, ${fav.address?.country}`,
        };
      });

      setSavedUsers(reshapedData);
    } catch (err) {
      console.error("Error fetching saved users:", err);
      setError("Failed to load saved users. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const removeFromFavourites = async (userId: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/remove-favourite`,
        {
          favouriteUserId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Removed from favourites",
          position: "top",
        });

        fetchSavedUsers();
      } else {
        throw new Error("Failed to remove user.");
      }
    } catch (error) {
      console.error("Failed to remove user from favourites:", error);
      Toast.show({
        type: "error",
        text1: "Failed to remove user. Please try again.",
        position: "top",
      });
    }
  };

  useEffect(() => {
    fetchSavedUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSavedUsers();
  };

  const toggleBio = (id: string) => {
    setExpandedBioId((prev) => (prev === id ? null : id));
  };

  const handleViewProfile = (id: string) => {
    router.push({
      pathname: "/profile/view",
      params: { id },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FF00FF" />
        </Pressable>
        <Text style={styles.title}>Saved Users</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF00FF"
          />
        }
      >
        {loading && <ActivityIndicator size="large" color="#FF00FF" />}
        {error && <Text style={[styles.text, { color: "red" }]}>{error}</Text>}
        {!loading && savedUsers.length === 0 && !error && (
          <Text style={styles.text}>No saved users yet.</Text>
        )}

        {!loading &&
          savedUsers.map((user) => {
            const expanded = expandedBioId === user.id;
            const imageUri =
              user?.image?.startsWith("http:/") &&
                !user?.image?.startsWith("http://")
                ? user.image.replace("http:/", "http://")
                : user?.image;

            return (
              <View key={user.id} style={styles.cardContainer}>
                <View style={styles.card}>
                  {imageUri && (
                    <Image source={{ uri: imageUri }} style={styles.image} />
                  )}
                  <Pressable
                    style={styles.optionsButton}
                    onPress={() => handleViewProfile(user.id)}
                  >
                    <MoveVertical size={24} color="#FF00FF" />
                  </Pressable>

                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    style={styles.gradient}
                  >
                    <View style={styles.profileInfo}>
                      <Text style={styles.name}>
                        {user.name}, {user.age}
                      </Text>
                      {user.location && (
                        <Text style={styles.location}>{user.location}</Text>
                      )}
                    </View>
                  </LinearGradient>

                  <View style={styles.bottomRow}>
                    <Pressable
                      style={styles.bioLeft}
                      onPress={() => toggleBio(user.id)}
                    >
                      <Text
                        style={styles.bio}
                        numberOfLines={expanded ? undefined : 2}
                      >
                        {user.bio || "No bio available."}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.trashRight}
                      onPress={() => removeFromFavourites(user.id)}
                    >
                      <LucideTrash color="#FF00FF" size={24} />
                    </Pressable>
                  </View>

                </View>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  title: {
    fontFamily: "Orbitron-Bold",
    fontSize: 24,
    color: "#FF00FF",
    textShadowColor: "#FF00FF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  card: {
    width: "100%",
    height: 400,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#03d7fc",
    shadowColor: "#03d7fc",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    justifyContent: "flex-end",
    padding: 20,
  },
  profileInfo: {
    marginBottom: 70,
  },
  name: {
    fontFamily: "Orbitron-Bold",
    fontSize: 28,
    color: "#FFFFFF",
    marginBottom: 4,
    textShadowColor: "#FF00FF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  location: {
    fontFamily: "Rajdhani",
    fontSize: 18,
    color: "#00FFFF",
    textShadowColor: "#00FFFF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  bioContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#FF00FF",
  },
  bioExpanded: {
    height: "50%",
  },
  bio: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
  },
  optionsButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(255,0,255,0.2)",
    padding: 8,
    borderRadius: 20,
  },
  text: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  removeButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 0, 255, 0.1)",
    zIndex: 10,
  },
  bottomRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#FF00FF",
    zIndex: 5,
  },


  bioLeft: {
    flex: 1,
    marginRight: 12,
  },

  trashRight: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 0, 255, 0.1)",
  },

});
