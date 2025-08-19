import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import {
  Video,
  MessageCircle,
  Gamepad2,
  Heart,
  MoveVertical as MoreVertical,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import DateGame from "@/components/DateGame";
import GameResults from "@/components/GameResults";
import { useFilter } from "../context/filterContext";
import { API_BASE_URL } from "../apiUrl";
import axios from "axios";
import { useUserProfile } from "../context/userContext";
import { useSocket } from "../context/socketContext";
import VideoCallButton from "@/components/VideoCallButton";
import PlayGame from "@/components/PlayGame";
import { useGame } from "../context/gameContext";
import { fixImageUrl } from "../utils/fixImageUrl";
import Loading from "@/components/Loading";

interface Match {
  id: string;
  name: string;
  age: number;
  image: string;
  matchPercentage: number;
  lastActive: string;
  status: "online" | "offline";
}

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const { token, user } = useUserProfile();
  const { socket, onlineUsers } = useSocket();
  const [isLoading, setIsLoading] = useState(false);


  const {
    gameStarted,
    gameResults,
    setGameResults,
    resetGame,
  } = useGame();

  console.log("online users : ", onlineUsers);

  // Api to get matches :

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/user/get-matched-users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const formatted = response.data.matches.map((m: any) => ({
        id: m.id,
        name: m.name,
        age: m.age,
        image: fixImageUrl(
          m.profile_image ||
          (m.i_am === "Female"
            ? "https://img.freepik.com/free-psd/3d-rendering-hair-style-avatar-design_23-2151869123.jpg?semt=ais_hybrid&w=740"
            : "https://st.depositphotos.com/46542440/55685/i/450/depositphotos_556851336-stock-illustration-square-face-character-stiff-art.jpg")
        ),

        matchPercentage: m?.match_percentage,
        lastActive: "Just now",
        status: "online",
      }));

      setMatches(formatted);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {

    fetchMatches();
  }, [token]);

  const handleVideoCall = (receiverId: string, name: string, image: string) => {
    router.push({
      pathname: "/outgoing",
      params: { receiverId: receiverId, name: name, image: image },
    });
  };

  const handleChat = (match: Match) => {
    router.push({
      pathname: "/chat/[id]",
      params: { id: match.id },
    });
  };

  const handleGameComplete = (results: {
    answers: string[];
    shared: number;
  }) => {
    setGameResults(results);
  };

  const handleCloseGame = () => {
    resetGame(socket, user._id)
  };

  const handleViewProfile = (match: Match) => {
    router.push({
      pathname: "/profile/view",
      params: { id: match.id },
    });
  };

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      {!gameStarted && !gameResults ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Matches</Text>
            <Text style={styles.subtitle}>Your cosmic connections</Text>
          </View>

          <>
            {matches.length === 0 ? (
              <View style={styles.noMatchesContainer}>
                <Text style={styles.noMatchesText}>No matches found.</Text>
              </View>
            ) : (<ScrollView
              style={styles.matchesList}
              showsVerticalScrollIndicator={false}
            >
              {matches.map((match) => (
                <LinearGradient
                  key={match.id}
                  colors={["#FF00FF", "#00FFFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.matchCardGradient}
                >
                  <View style={styles.matchCard}>
                    <Image
                      source={{ uri: match.image }}
                      style={styles.matchImage}
                    />

                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.8)"]}
                      style={styles.gradient}
                    />

                    <View style={styles.matchInfo}>
                      <View>
                        <Text style={styles.matchName}>
                          {match.name}, {match.age}
                        </Text>
                        <Text style={styles.lastActive}>
                          {onlineUsers.includes(match?.id) ? (
                            <Text style={styles.onlineStatus}>● Online</Text>
                          ) : (
                            match.lastActive
                          )}
                        </Text>
                      </View>

                      <View style={styles.matchBadge}>
                        <Text style={styles.matchPercentage}>
                          {match.matchPercentage}%
                        </Text>
                        <Text style={styles.matchLabel}>Match</Text>
                      </View>
                    </View>

                    <Pressable
                      style={styles.optionsButton}
                      onPress={() => handleViewProfile(match)}
                    >
                      <MoreVertical size={24} color="#FF00FF" />
                    </Pressable>

                    <View style={styles.actionButtons}>
                      {/* <VideoCallButton receiver={match} /> */}
                      <Pressable
                        style={styles.actionButton}
                        onPress={() =>
                          handleVideoCall(match.id, match.name, match.image)
                        }
                      >
                        <Video size={24} color="#FF00FF" />
                        <Text style={styles.actionText}>Video</Text>
                      </Pressable>

                      <PlayGame match={match} source="matches" />

                      <Pressable
                        style={styles.actionButton}
                        onPress={() => handleChat(match)}
                      >
                        <MessageCircle size={24} color="#39FF14" />
                        <Text style={styles.actionText}>Chat</Text>
                      </Pressable>
                    </View>
                  </View>
                </LinearGradient>
              ))}
            </ScrollView>
            )}
          </>
        </>
      ) : gameResults ? (
        <GameResults onClose={handleCloseGame} />
      ) : (
        <DateGame onComplete={handleGameComplete} onClose={handleCloseGame} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noMatchesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  noMatchesText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },

  title: {
    fontFamily: "Orbitron-Bold",
    fontSize: 32,
    color: "#FF00FF",
    textShadowColor: "#FF00FF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: "Rajdhani",
    fontSize: 18,
    color: "#00FFFF",
    marginTop: 4,
  },
  matchesList: {
    flex: 1,
    padding: 20,
    marginBottom: 20,
  },
  matchCardGradient: {
    borderRadius: 22,
    padding: 2,
    marginBottom: 20,
  },
  matchCard: {
    height: 400,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
  },
  matchImage: {
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
  },
  matchInfo: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 20,
  },
  matchName: {
    fontFamily: "Orbitron-Bold",
    fontSize: 24,
    color: "#FFFFFF",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  lastActive: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 4,
  },
  onlineStatus: {
    color: "#39FF14",
  },
  matchBadge: {
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF00FF",
    textShadowColor: "#FF00FF",
  },
  matchPercentage: {
    fontFamily: "Orbitron-Bold",
    fontSize: 20,
    color: "#1dde8d",
  },
  matchLabel: {
    fontFamily: "Orbitron-Bold",
    fontSize: 14,
    color: "#1dde8d",
  },
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderTopWidth: 1,
    borderColor: "#FF00FF",
  },
  actionButton: {
    alignItems: "center",
  },
  playButton: {
    transform: [{ scale: 1.1 }],
  },
  actionText: {
    fontFamily: "Rajdhani",
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 4,
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
});
