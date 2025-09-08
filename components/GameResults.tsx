import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { Heart, Sparkles } from "lucide-react-native";
import { useUserProfile } from "@/app/context/userContext";
import { useEffect, useState } from "react";
import ConfettiCannon from "react-native-confetti-cannon";
import axios from "axios";
import { API_BASE_URL } from "@/app/apiUrl";
import { useGame } from "@/app/context/gameContext";
import PlayGame from "./PlayGame";
import { useSocket } from "@/app/context/socketContext";
import { useModal } from "@/app/context/modalContext";
import { router } from "expo-router";

interface GameResultsProps {
  onClose: () => void;
}

const STAGE_NAMES: Record<number, string> = {
  1: "Icebreakers",
  2: "Deep Questions",
  3: "Final Round",
};

export default function GameResults({ onClose }: GameResultsProps) {
  const { token, user } = useUserProfile();
  const [results, setResults] = useState<any>(null);
  const [matchName, setMatchName] = useState<string>("");
  const [match, setMatch] = useState<any>(null);
  const [compatibility, setCompatibility] = useState<number>(0);
  const [shared, setShared] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const { width } = Dimensions.get("window");
  const { socket } = useSocket();
  const {
    selectedMatch,
    setSelectedMatch,
    gameStarted,
    setGameStarted,
    gameSessionId,
    setGameSessionId,
    gameResults,
    setGameResults,
    resetGame,
    gameLevel,
    nextGameLevel,
  } = useGame();

  const { showModal } = useModal();

  useEffect(() => {
    if (!socket || !gameStarted) return;

    const onOpponentDisconnected = ({
      gameSessionId: disconnectedSessionId,
      opponentId,
    }: {
      gameSessionId: string;
      opponentId: string;
    }) => {
      if (disconnectedSessionId !== gameSessionId) return;

      console.log(
        `[DateGame] Opponent ${opponentId} disconnected from game session ${disconnectedSessionId}`
      );

      if (gameLevel === 3) {
        // ✅ Level 3: silently reset and navigate
        // resetGame(socket, user?._id, disconnectedSessionId);
        console.log("its level 3");
      } else {
        // ✅ Level 1 & 2: show modal
        showModal({
          title: "Opponent Left",
          message: "Your opponent has ended the game.",
          buttons: [
            {
              text: "OK",
              onPress: () => {
                resetGame(socket, user?._id, disconnectedSessionId);
                router.replace("/(tabs)/matches");
              },
            },
          ],
        });
      }
    };

    socket.on("opponentDisconnected", onOpponentDisconnected);

    return () => {
      socket.off("opponentDisconnected", onOpponentDisconnected);
    };
  }, [socket, gameSessionId, gameStarted, gameLevel]);

  useEffect(() => {
    // Confetti timer - runs for 3 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(confettiTimer);
  }, []);

  const getResults = async (retryCount = 0) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/user/quiz-result/${gameSessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data;
      console.log("Quiz Results: ", { data });

      if (data.status && data.results.length === 2) {
        const currentUserResult = data.results.find(
          (r: any) => r.user._id === user._id
        );
        const matchedUserResult = data.results.find(
          (r: any) => r.user._id !== user._id
        );

        if (!currentUserResult) {
          throw new Error("Your result not found in response");
        }

        setResults(currentUserResult);
        setMatchName(matchedUserResult.user.name);
        setMatch(matchedUserResult.user);
        setCompatibility(data.compatibility);
        setShared(data.shared || 0);
        setLoading(false);
      } else {
        console.log("Only one player finished. Retrying...", retryCount);
        setTimeout(() => getResults(retryCount + 1), 3000);
      }
    } catch (err) {
      console.log("Error in getResults:", err);
      if (retryCount < 20) {
        setTimeout(() => getResults(retryCount + 1), 3000);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getResults();
  }, []);

  const handleEndGame = () => {
    resetGame(socket, user._id);
    onClose();
  };

  const getStageCompletionMessage = () => {
    const currentStage = STAGE_NAMES[gameLevel] || "Current";
    const nextStage = STAGE_NAMES[gameLevel + 1] || "Next";

    if (gameLevel === 3) {
      return "You've completed all stages!";
    }
    return `You completed ${currentStage}! Ready for ${nextStage}?`;
  };

  if (loading ) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#FF00FF" />
        <Text style={styles.loadingText}>
          Waiting for the other player to finish...
        </Text>
      </View>
    );
  }

  if (!results) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.loadingText}>
          No result found by the game session id
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <ConfettiCannon count={200} origin={{ x: -10, y: -10 }} /> */}
      <ScrollView
        style={{ marginTop: 40 }}
        contentContainerStyle={styles.content}
      >
        <Heart size={64} color="#FF00FF" strokeWidth={1.5} />

        <Text style={styles.title}>Stage Complete!</Text>
        <Text style={styles.subtitle}>{getStageCompletionMessage()}</Text>
        <Text style={styles.matchText}>
          You and {match?.name || "your match"} completed this stage
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{compatibility || 0}%</Text>
            <Text style={styles.statLabel}>Compatibility</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{shared || 0}</Text>
            <Text style={styles.statLabel}>Shared Answers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{results?.score || 0}</Text>
            <Text style={styles.statLabel}>Your Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {results?.answers?.length || 10}
            </Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
        </View>

        <View style={styles.insight}>
          <Sparkles size={24} color="#00FFFF" />
          <Text style={styles.insightText}>
            You both share a strong connection in how you view relationships!
          </Text>
        </View>

        {compatibility >= 40 && match && (
          <View style={styles.buttonContainer}>
            <PlayGame
              match={{
                id: match._id,
                name: match.name,
                age: 24,
                image:
                  match.profile_image || "https://default-image.url/avatar.png",
                matchPercentage: compatibility,
                lastActive: "Just now",
                status: "online",
              }}
              source="results"
            />
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.closeButton}
            onPress={handleEndGame}
            android_ripple={{ color: "rgba(255, 0, 255, 0.3)" }}
          >
            <Text style={styles.closeButtonText}>End Game</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    padding: 20,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    marginTop: 12,
    fontFamily: "Rajdhani",
    fontSize: 16,
  },
  content: {
    alignItems: "center",
    paddingBottom: 40,
  },
  title: {
    fontFamily: "Orbitron-Bold",
    fontSize: 32,
    color: "#FF00FF",
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#00FFFF",
    marginBottom: 32,
    textAlign: "center",
  },
  matchText: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 32,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 32,
  },
  statItem: {
    alignItems: "center",
    minWidth: 80,
  },
  statValue: {
    fontFamily: "Orbitron-Bold",
    fontSize: 20,
    color: "#FF00FF",
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: "Rajdhani-Medium",
    fontSize: 12,
    color: "#FFFFFF",
  },
  confettiWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },

  insight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "#00FFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 12,
    width: "100%",
  },
  insightText: {
    flex: 1,
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  closeButton: {
    backgroundColor: "rgba(255, 0, 255, 0.2)",
    borderWidth: 1,
    borderColor: "#FF00FF",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    overflow: "hidden",
  },
  closeButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#FF00FF",
  },
});
