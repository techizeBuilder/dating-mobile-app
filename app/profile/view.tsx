import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Modal,
  Share,
  Button,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  MoveVertical as MoreVertical,
  Share2,
  Shield,
  Ban,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../apiUrl";
import { useUserProfile } from "../context/userContext";
import axios from "axios";
import Loading from "@/components/Loading";
import { fixImageUrl } from "../utils/fixImageUrl";
import * as Linking from "expo-linking";
import Toast from "react-native-toast-message";

export default function ViewProfileScreen() {
  const { id } = useLocalSearchParams();
  const [showOptions, setShowOptions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { token, loading, setLoading } = useUserProfile();
  const [profile, setProfile] = useState(null);

  console.log("profile : ", profile);
  // Fetch profile data from API using Axios
  useEffect(() => {
    setLoading(true);
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/details/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        if (data.status) {
          setProfile(data.user);
        } else {
          console.error("Profile not found");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, token]);

  const shareProfile = async () => {
    try {
      const url = Linking.createURL(`/profile/${id}`);
      await Share.share({
        message: `Check out this profile: ${url}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const blockProfile = async () => {
    console.log("blocking profile");
    try {
      console.log({ token, id });
      const response = await axios.post(
        `${API_BASE_URL}/user/${id}/block`,
        {}, // Request body (empty for this endpoint)
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        } // ✅ Headers are now in the config object
      );

      const data = response.data;
      console.log("Block Profile Data: ", { data });

      Toast.show({ type: "info", text1: "User blocked successfully" });

      router.back();
      setLoading(false);
    } catch (error) {
      console.error("Error blocking user:", JSON.stringify(error));
      setLoading(false);
    }
  };
  // const profile = profiles[id as keyof typeof profiles];

  if (loading) {
    return <Loading />;
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Image
            source={{
              uri: fixImageUrl(
                profile?.profile_image ||
                  (profile.i_am === "Female"
                    ? "https://img.freepik.com/free-psd/3d-rendering-hair-style-avatar-design_23-2151869123.jpg?semt=ais_hybrid&w=740"
                    : "https://st.depositphotos.com/46542440/55685/i/450/depositphotos_556851336-stock-illustration-square-face-character-stiff-art.jpg")
              ),
            }}
            style={styles.coverImage}
          />

          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "transparent"]}
            style={styles.headerGradient}
          />
          <View style={styles.headerButtons}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={() => setShowOptions(true)}
              style={styles.iconButton}
            >
              <MoreVertical size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>
              {profile?.match_percentage}% Match
            </Text>
          </View>

          <Text style={styles.name}>
            {profile.name}, {profile.age}
          </Text>
          <Text style={styles.location}>
            {profile.address.country} • {profile.address.city}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{profile.about}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsContainer}>
              {profile.interests?.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest?.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.optionsMenu}>
            <Pressable onPress={shareProfile} style={styles.optionItem}>
              <Share2 size={24} color="#FF00FF" />
              <Text style={styles.optionText}>Share this Profile</Text>
            </Pressable>

            <Pressable style={styles.optionItem} onPress={blockProfile}>
              <Ban size={24} color="#FF00FF" />
              <Text style={styles.optionText}>Block</Text>
            </Pressable>

            <Pressable
              style={styles.optionItem}
              onPress={() => {
                setShowOptions(false);
                setShowReportModal(true);
              }}
            >
              <Shield size={24} color="#FF00FF" />
              <Text style={styles.optionText}>Report</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showReportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportMenu}>
            <Text style={styles.reportTitle}>Report User</Text>
            <Text style={styles.reportSubtitle}>
              Is this person bothering you? Tell us what they did.
            </Text>

            {[
              "Inappropriate Photos",
              "Feels Like Spam",
              "User is underage",
              "Others",
            ]?.map((reason, index) => (
              <Pressable key={index} style={styles.reportOption}>
                <Text style={styles.reportOptionText}>{reason}</Text>
              </Pressable>
            ))}

            <Pressable
              style={styles.submitButton}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 400,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headerButtons: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF00FF",
  },
  profileInfo: {
    padding: 20,
    marginTop: -50,
  },
  matchBadge: {
    backgroundColor: "rgba(0, 229, 255, 0.1)",
    borderWidth: 1,
    borderColor: "#03d7fc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  matchText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 14,
    color: "#FF00FF",
  },
  name: {
    fontFamily: "Orbitron-Bold",
    fontSize: 28,
    color: "#FF00FF",
    marginBottom: 4,
  },
  location: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#00FFFF",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Orbitron-Bold",
    fontSize: 20,
    color: "#FF00FF",
    marginBottom: 12,
  },
  aboutText: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    backgroundColor: "rgba(0, 229, 255, 0.1)",
    borderWidth: 1,
    borderColor: "#03d7fc",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  interestText: {
    fontFamily: "Rajdhani",
    fontSize: 14,
    color: "#03d7fc",
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  galleryImage: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#03d7fc",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  optionsMenu: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#FF00FF",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
  },
  optionText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#FF00FF",
  },
  reportMenu: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#FF00FF",
  },
  reportTitle: {
    fontFamily: "Orbitron-Bold",
    fontSize: 24,
    color: "#FF00FF",
    textAlign: "center",
    marginBottom: 8,
  },
  reportSubtitle: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 24,
  },
  reportOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,0,255,0.2)",
  },
  reportOptionText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  submitButton: {
    backgroundColor: "#FF00FF",
    borderRadius: 20,
    padding: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  submitButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#000000",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderRadius: 20,
    padding: 16,
  },
  cancelButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#FF00FF",
    textAlign: "center",
  },
  errorText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#FF00FF",
    textAlign: "center",
    marginTop: 40,
  },
});
