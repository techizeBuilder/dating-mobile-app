import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  BookHeart,
  CheckCircle,
  Heart,
  HeartCrackIcon,
  HeartPulseIcon,
  Star,
  Users,
} from "lucide-react-native";
import { Video } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { useUserProfile } from "./context/userContext";
import { useSocket } from "./context/socketContext";

export default function IntroScreen() {
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const { token, user, loading } = useUserProfile();
  const { socket } = useSocket();

  useEffect(() => {
    if (loading) return;

    if (token && user?.name && user?.email) {
      if (socket) {
        socket.emit("join", user._id || user.id);
      }
      // router.replace('/(tabs)');
    }
  }, [loading, token, user, socket]);
  console.log("IntroScreen user:", user);
  const handleGetStarted = async () => {
    try {
      if (token && user?.email && user?.name) {
        router.replace("/(tabs)");
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      router.push("/auth/login");
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.backgroundVideo}
        source={require("../assets/intro.mp4")}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "#000"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logobg.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Star size={26} color="#FF00FF" style={styles.statIcon} />
                <Text style={styles.statValue}>4.5</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Users size={26} color="#FF00FF" style={styles.statIcon} />
                <Text style={styles.statValue}>20M+</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statItem}>
                <Heart size={26} color="#FF00FF" style={styles.statIcon} />
                <Text style={styles.statValue}>100%</Text>
                <Text style={styles.statLabel}>Curated Profiles</Text>
              </View>
            </View>

            <Text style={styles.tagline}>
              Nothing casual about this dating app
            </Text>

            <View style={styles.buttonContainer}>
              <View style={styles.buttonWrapper}>
                <LinearGradient
                  colors={["#FF00FF", "#00FFFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientBorder}
                >
                  <Pressable
                    style={styles.transparentButton}
                    onPress={handleGetStarted}
                  >
                    <Text style={styles.buttonText}>Get Started</Text>
                  </Pressable>
                </LinearGradient>
              </View>

              <Text style={styles.termsText}>
                By signing up, you agree to our{" "}
                <Text
                  style={styles.link}
                  onPress={() => router.push("/settings/terms")}
                >
                  Terms
                </Text>
                . See how we use your data in our{" "}
                <Text
                  style={styles.link}
                  onPress={() => router.push("/settings/privacy")}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
  },
  gradient: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: "25%",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 6,
  },
  statIcon: {
    marginBottom: 4,
    opacity: 0.9,
  },
  statValue: {
    fontFamily: "Orbitron-Bold",
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  statLabel: {
    fontFamily: "Rajdhani",
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 16,
  },
  tagline: {
    fontFamily: "Orbitron-Bold",
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
    marginHorizontal: 16,
    marginBottom: 32,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    // width: "100%",
  },

  buttonWrapper: {
    borderRadius: 28,
    alignSelf: "center",
    marginBottom: 16,
    overflow: "hidden",
    width: "100%",
  },

  gradientBorder: {
    borderRadius: 28,
    padding: 2, // gradient border thickness
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: 16,
    width: "100%",
  },

  innerButton: {
    backgroundColor: "transparent",
    borderRadius: 26,
    width: "100%",
    textAlign: "center",
  },
  transparentButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    textAlign: "center",
    backgroundColor: "rgb(0, 0, 0)",
  },

  buttonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    width: "100%",
    color: "#FF00FF",
    textAlign: "center",
    alignItems: "center",
  },

  termsText: {
    fontFamily: "Rajdhani",
    fontSize: 13,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.7,
    paddingHorizontal: 24,
    lineHeight: 18,
    marginTop: 16,
  },
  link: {
    color: "#FF00FF",
    textDecorationLine: "underline",
  },
});