import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import {
  Sparkles,
  Zap,
  X,
  Settings,
  SlidersHorizontal,
  MapPin,
  MoveVertical as MoreVertical,
  FileQuestion,
  LucideMessageCircleQuestion,
  Check,
} from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { useFilter } from "../context/filterContext";
import axios from "axios";
import { API_BASE_URL } from "../apiUrl";
import { useUserProfile } from "../context/userContext";
import Loading from "@/components/Loading";
import { useSocket } from "../context/socketContext";
import Toast from "react-native-toast-message";
import { fixImageUrl } from "../utils/fixImageUrl";

const SWIPE_THRESHOLD = 100;

interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  location: string;
}
type Gender = "female" | "male" | "others";

interface Filters {
  location: string;
  gender: Gender | "";
  ageRange: [number, number];
  distance: number;
}

export default function ExploreScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { token, profile: MyProfile } = useUserProfile();
  const [loading, setLoading] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [uiFilters, setUiFilters] = useState<Filters>({
    location: "",
    gender: MyProfile.interested_in,
    ageRange: [18, 60],
    distance: 50,
  });

  // State for applied filters (what actually triggers API calls)
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    location: "",
    gender: MyProfile.interested_in,
    ageRange: [18, 60],
    distance: 50,
  });

  useEffect(() => {
    setUiFilters({
      location: "",
      gender: MyProfile.interested_in,
      ageRange: [18, 60],
      distance: 50,
    });
    setAppliedFilters({
      location: "",
      gender: MyProfile.interested_in,
      ageRange: [18, 60],
      distance: 50,
    });
  }, [MyProfile]);

  // Fetch matches when appliedFilters change
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams({
          age_min: appliedFilters.ageRange[0]?.toString() || "18",
          age_max: appliedFilters.ageRange[1]?.toString() || "100",
          city: appliedFilters.location || "",
          // gender: appliedFilters.gender || "",
          distance: appliedFilters.distance.toString(),
        });
        console.log("MyProfile : ", MyProfile);
        console.log("query : ", query.toString());

        const response = await axios.get(
          `${API_BASE_URL}/user/matches?${query.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response from matches: ", response);

        const formatted = response.data.matches.map((m: any) => ({
          id: m.id,
          name: m.name,
          age: m.age,
          bio: m.about,
          image:
            m.profile_image ||
            (m.i_am === "Female"
              ? "https://img.freepik.com/free-psd/3d-rendering-hair-style-avatar-design_23-2151869123.jpg?semt=ais_hybrid&w=740"
              : "https://st.depositphotos.com/46542440/55685/i/450/depositphotos_556851336-stock-illustration-square-face-character-stiff-art.jpg"),
          matchPercentage: Math.floor(Math.random() * 21) + 80,
          lastActive: "Just now",
          location: m.city,
          status: "online",
        }));

        setProfiles(formatted);
        console.log("Fetched matches:", formatted);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setLoading(false);
      }
    };

    fetchMatches();
  }, [appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters(uiFilters);
    setShowFilter(false);
  };

  const handleResetFilters = () => {
    const defaultFilters: Filters = {
      location: "",
      gender: "",
      ageRange: [18, 60],
      distance: 50,
    };
    setUiFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const profile = profiles[currentIndex] || {
    id: "",
    name: "Loading...",
    age: 0,
    bio: "Loading bio...",
    image: "https://example.com/loading.jpg",
    location: "Loading...",
  };

  const preloadImage = (url: string) => {
    return new Promise((resolve) => {
      if (!url) return resolve(true); // Skip if no URL

      Image.prefetch(url)
        .then(() => resolve(true))
        .catch(() => resolve(true)); // Continue even if prefetch fails
    });
  };

  const nextProfile = async () => {
    console.log("Attempting next profile. Current index:", currentIndex);
    console.log("profiles:", profiles);

    if (profiles.length === 0) return;

    const updatedProfiles = [...profiles];
    updatedProfiles.splice(currentIndex, 1);

    if (updatedProfiles.length > 0) {
      const nextIdx = currentIndex >= updatedProfiles.length ? 0 : currentIndex;

      const nextImage = updatedProfiles[nextIdx].image;
      try {
        console.log("Preloading next profile image");
        await preloadImage(nextImage);
        console.log("Image preloaded successfully");
      } catch (e) {
        console.warn("Failed to preload image:", e);
      }

      setProfiles(updatedProfiles);
      setCurrentIndex(nextIdx);
      translateX.value = 0;
      translateY.value = 0;
    } else {
      setProfiles([]);
      setCurrentIndex(0);
    }
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const swipeDirection = event.translationX > 0 ? 1 : -1;
        translateX.value = withSpring(
          swipeDirection * 500,
          {},
          (isFinished) => {
            if (isFinished) {
              runOnJS(nextProfile)();
            }
          }
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-200, 0, 200], [-30, 0, 30]);

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const handleAction = async (action: "spark" | "vibe" | "pass") => {
    if (!profile?.id) return;

    const animateCard = (direction: "left" | "right") => {
      translateX.value = withSpring(
        direction === "right" ? 500 : -500,
        {},
        (finished) => {
          if (finished) runOnJS(nextProfile)();
        }
      );
    };

    const showToast = (
      type: "success" | "info" | "error",
      text1: string,
      text2?: string
    ) => {
      Toast.show({ type, text1, text2 });
    };

    const likeUser = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/user/like-user`,
          { userIdToLike: profile.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.match) {
          console.log(
            "success",
            "💘 It's a Match!",
            `${profile.name} liked you back!`
          );
        } else {
          console.log("info", "You sparked!", `You liked ${profile.name}`);
        }

        animateCard("right");
      } catch (error) {
        console.error("Error liking user:", error);
        console.log("error", "Something went wrong", "Could not send spark.");
      }
    };

    const vibeUser = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/user/add-favourite`,
          { favouriteUserId: profile.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          console.log(
            "success",
            "💘 It's a Match!",
            `${profile.name} liked you back!`
          );
        } else {
          console.log(
            "info",
            "You vibed!",
            `You added ${profile.name} to your favorites`
          );
        }

        animateCard("right");
      } catch (error) {
        console.error("Error adding to favorites:", error);
        console.log("error", "Something went wrong", "Could not vibe.");
      }
    };

    switch (action) {
      case "spark":
        await likeUser();
        break;
      case "vibe":
        await vibeUser();
        break;
      case "pass":
        animateCard("left");
        break;
    }
  };

  const handleViewProfile = () => {
    router.push({
      pathname: "/profile/view",
      params: { id: profile.id },
    });
  };

  // console.log("profiles on explore screen : ", profiles)

  if (loading) {
    return <Loading />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.container}>
          <Image
            source={require("../../assets/images/logobg.png")}
            style={styles.logo}
          />
        </View>
        <View style={styles.headerButtons}>
          <Pressable
            onPress={() => setShowFilter(true)}
            style={styles.iconButton}
          >
            <SlidersHorizontal size={24} color="#00ffff" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/settings")}
            style={styles.iconButton}
          >
            <Settings size={24} color="#00ffff" />
          </Pressable>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {profiles.length > 0 ? (
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.card, cardStyle]}>
              <Image
                source={{ uri: fixImageUrl(profile?.image) }}
                style={styles.image}
              />

              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)"]}
                style={styles.gradient}
              >
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>
                    {profile.name}, {profile.age}
                  </Text>
                  <Text style={styles.location}>{profile.location}</Text>
                </View>
              </LinearGradient>

              <Pressable
                style={[styles.bioContainer, expanded && styles.bioExpanded]}
                onPress={() => setExpanded(!expanded)}
              >
                <Text
                  style={styles.bio}
                  numberOfLines={expanded ? undefined : 2}
                >
                  {profile.bio}
                </Text>
              </Pressable>

              <Pressable
                style={styles.optionsButton}
                onPress={() => handleViewProfile()}
              >
                <MoreVertical size={24} color="#FF00FF" />
              </Pressable>
            </Animated.View>
          </GestureDetector>
        ) : (
          <View>
            <Text style={{ color: "#fff" }}>
              No more matches! Try adjusting filters.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleAction("pass")}
        >
          <X size={32} color="#FF00FF" />
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.vibeButton]}
          onPress={() => handleAction("vibe")}
        >
          <Text style={styles.questionMark}>?</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.sparkButton]}
          onPress={() => handleAction("spark")}
        >
          <Check size={32} color="#39FF14" />
        </Pressable>
      </View>

      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.optionsMenu}>
            <Pressable
              style={styles.optionItem}
              onPress={() => {
                setShowOptions(false);
                handleViewProfile();
              }}
            >
              <Text style={styles.optionText}>View Profile</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilter(false)}
        >
          <Pressable
            style={styles.filterContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowFilter(false)}
              >
                <X size={24} color="#00ffff" />
              </Pressable>
            </View>

            <ScrollView style={styles.filterContent}>
              <TouchableOpacity activeOpacity={1}>
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Location</Text>
                  <View style={styles.locationInput}>
                    <MapPin size={20} color="#00ffff" />
                    <TextInput
                      style={styles.locationInputText}
                      value={uiFilters.location}
                      onChangeText={(text) =>
                        setUiFilters({ ...uiFilters, location: text })
                      }
                      placeholder="Enter location"
                      placeholderTextColor="rgba(72, 181, 240, 0.5)"
                      underlineColorAndroid="transparent"
                    />
                  </View>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Age Range</Text>
                  <Text style={styles.rangeText}>
                    {uiFilters.ageRange[0]} - {uiFilters.ageRange[1]} years
                  </Text>
                  <View style={styles.sliderContainer}>
                    <Slider
                      style={styles.slider}
                      minimumValue={18}
                      maximumValue={60}
                      value={uiFilters.ageRange[0]}
                      onValueChange={(value) =>
                        setUiFilters({
                          ...uiFilters,
                          ageRange: [Math.round(value), uiFilters.ageRange[1]],
                        })
                      }
                      minimumTrackTintColor="#00ffff"
                      maximumTrackTintColor="#00ffff"
                      thumbTintColor="#00ffff"
                    />
                    <Slider
                      style={styles.slider}
                      minimumValue={18}
                      maximumValue={60}
                      value={uiFilters.ageRange[1]}
                      onValueChange={(value) =>
                        setUiFilters({
                          ...uiFilters,
                          ageRange: [uiFilters.ageRange[0], Math.round(value)],
                        })
                      }
                      minimumTrackTintColor="#00ffff"
                      maximumTrackTintColor="#00ffff"
                      thumbTintColor="#00ffff"
                    />
                  </View>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Distance (km)</Text>
                  <Text style={styles.rangeText}>{uiFilters.distance} km</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={100}
                    value={uiFilters.distance}
                    onValueChange={(value) =>
                      setUiFilters({
                        ...uiFilters,
                        distance: Math.round(value),
                      })
                    }
                    minimumTrackTintColor="#00ffff"
                    maximumTrackTintColor="#00ffff"
                    thumbTintColor="#00ffff"
                  />
                </View>

                <View style={styles.filterActions}>
                  <Pressable
                    style={styles.resetButton}
                    onPress={handleResetFilters}
                  >
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleApplyFilters}
                    style={styles.pressableWrapper}
                  >
                    <LinearGradient
                      colors={["#FF00FF", "#8A2BE2"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.applyButton}
                    >
                      <Text style={styles.applyButtonText}>Apply Filter</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 0, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00ffff",
  },
  title: {
    fontFamily: "Orbitron-Bold",
    fontSize: 32,
    color: "#FF00FF",
    textShadowColor: "#FF00FF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    height: "100%",
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
    height: 200,
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
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  passButton: {
    borderColor: "#FF00FF",
    shadowColor: "#FF00FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  questionMark: {
    fontSize: 30,
    color: "#00FFFF",
    fontWeight: "bold",
    fontFamily: "Rajdhani-SemiBold",
  },

  vibeButton: {
    borderColor: "#00FFFF",
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  sparkButton: {
    borderColor: "#39FF14",
    shadowColor: "#39FF14",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  filterContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    // borderColor: '#FF00FF',
    borderColor: "#03d7fc",
    maxHeight: "90%",
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#00ffff",
  },
  filterTitle: {
    fontFamily: "Orbitron-Bold",
    fontSize: 24,
    color: "#FF00FF",
    textShadowColor: "#FF00FF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 0, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00ffff",
  },
  filterContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#FF00FF",
    marginBottom: 12,
  },
  locationInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#00ffff",
    gap: 8,
  },
  locationInputText: {
    flex: 1,
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#FFFFFF",
  },
  genderButtons: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: "rgba(255, 0, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FF00FF",
    alignItems: "center",
  },
  genderButtonActive: {
    backgroundColor: "#FF00FF",
  },
  genderButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 16,
    color: "#FF00FF",
  },
  genderButtonTextActive: {
    color: "#000000",
  },
  rangeText: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  sliderContainer: {
    gap: 16,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  filterActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    marginBottom: 40,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#00ffff",
    alignItems: "center",
  },
  resetButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 16,
    color: "#00ffff",
  },
  pressableWrapper: {
    flex: 1,
  },

  applyButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  applyButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },

  optionsButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF00FF",
  },
  optionsMenu: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF00FF",
    width: "80%",
    padding: 16,
  },
  optionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,0,255,0.2)",
  },
  optionText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#FF00FF",
    textAlign: "center",
  },
});
