import { useGame } from "@/app/context/gameContext";
import { useModal } from "@/app/context/modalContext";
import { useSocket } from "@/app/context/socketContext";
import { useUserProfile } from "@/app/context/userContext";
import { router, usePathname } from "expo-router";
import { Gamepad2 } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

interface Match {
  id: string;
  _id?: string;
  name: string;
  age: number;
  image: string;
  matchPercentage: number;
  lastActive: string;
  status: "online" | "offline";
}

interface PlayGameProps {
  match: Match;
  source?: "results" | "matches";
}

const MAX_GAME_LEVEL = 3;

const PlayGame: React.FC<PlayGameProps> = ({ match, source }) => {
  const { socket } = useSocket();
  const { user } = useUserProfile();
  const { showModal, hideModal } = useModal();
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
    setGameLevel,
    nextGameLevel,
  } = useGame();


  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [pendingInviteId, setPendingInviteId] = useState<string | null>(null);
  const [enableNextStageButton, setEnableNextStageButton] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const pathname = usePathname();

  console.log(`[PlayGame] Rendered from source: ${source}`);

  useEffect(() => {
    if (source === "results") {
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setEnableNextStageButton(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [source]);


  useEffect(() => {
    if (!socket) {
      console.log("[PlayGame] Socket not available");
      return;
    }

    console.log("[PlayGame] Setting up socket listeners");

    // Handle received invites
    const onReceiveInvite = (invitation: {
      invitationId: string;
      senderId: string;
      timestamp: number;
      senderName?: string;
      level?: number;
    }) => {
      console.log("[PlayGame] Received game invite:", invitation);

      let message = `You've received a game invite from ${invitation.senderName || "a player"}!`;

      if (invitation.level === 2) {
        message = `${invitation.senderName || "A player"} invited you to play Stage 2!`;
      } else if (invitation.level === 3) {
        message = `🔥 Final Stage invite from ${invitation.senderName || "a player"}! Ready?`;
      }

      showModal({
        title: "Game Invite",
        message: `You've received a game invite from ${invitation.senderName || "a player"}!`,
        buttons: [
          {
            text: "Decline",
            onPress: () => {
              socket.emit("respondToInvite", {
                invitationId: invitation.invitationId,
                recipientId: user?._id,
                accepted: false,
              });
            },
            style: "cancel",
          },
          {
            text: "Accept",
            onPress: () => {
              socket.emit("respondToInvite", {
                invitationId: invitation.invitationId,
                recipientId: user?._id,
                accepted: true,
              });
            },
          },
        ],
      });
    };

    // Handle when our invite is accepted
    const onInviteAccepted = ({
      gameSessionId,
      opponentId,
    }: {
      gameSessionId: string;
      opponentId: string;
    }) => {
      console.log("[PlayGame] Invite accepted, gameSessionId:", gameSessionId);
      console.log("pathname : ", pathname);
      console.log("navigating to pathname");
      setGameResults(null);
      if (pathname !== "/(tabs)/matches") {
        router.push("/(tabs)/matches");
      }

      if (source === "results" && gameLevel < MAX_GAME_LEVEL) {
        nextGameLevel();
      }
      setSelectedMatch(match);
      setGameSessionId(gameSessionId);
      setGameStarted(true);
      setIsSendingInvite(false);
      setPendingInviteId(null);
    };

    // Handle when our invite is rejected
    const onInviteRejected = ({
      invitationId,
      recipientName,
    }: {
      invitationId: string;
      recipientName: string;
    }) => {
      console.log(`[PlayGame] Invite was rejected by ${recipientName}`);
      showModal({
        title: "Invite Declined",
        message: `${recipientName} declined your game invite`,
        buttons: [{ text: "OK", onPress: () => { } }],
      });
      setIsSendingInvite(false);
      setPendingInviteId(null);
    };

    // Handle when our invite expires
    const onInviteExpired = () => {
      console.log("[PlayGame] Invite expired");
      showModal({
        title: "Invite Expired",
        message: "The invite was not accepted in time",
        buttons: [{ text: "OK", onPress: () => { } }],
      });
      setIsSendingInvite(false);
      setPendingInviteId(null);
    };

    const onInviteAutoDismiss = ({ invitationId }: { invitationId: string }) => {
      console.log(`[PlayGame] Invite modal auto-dismissed for invitation ${invitationId}`);
      hideModal();
    };


    // Handle errors
    const onInviteError = (error: { error: string }) => {
      console.log("[PlayGame] Invite error:", error);
      showModal({
        title: "Error",
        message: error.error || "Failed to send invite",
        buttons: [{ text: "OK", onPress: () => { } }],
      });
      setIsSendingInvite(false);
      setPendingInviteId(null);
    };

    // Set up listeners
    socket.on("receiveGameInvite", onReceiveInvite);
    socket.on("inviteAccepted", onInviteAccepted);
    socket.on("inviteRejected", onInviteRejected);
    socket.on("inviteExpired", onInviteExpired);
    socket.on("inviteError", onInviteError);
    socket.on("inviteAutoDismiss", onInviteAutoDismiss);

    return () => {
      console.log("[PlayGame] Cleaning up socket listeners");
      socket.off("inviteAccepted", onInviteAccepted);
      socket.off("inviteRejected", onInviteRejected);
      socket.off("inviteExpired", onInviteExpired);
      socket.off("inviteError", onInviteError);
      socket.off("receiveGameInvite", onReceiveInvite);
      socket.off("inviteAutoDismiss", onInviteAutoDismiss);

      if (pendingInviteId) {
        console.log("[PlayGame] Canceling pending invite on unmount");
        socket.emit("cancelInvite", { invitationId: pendingInviteId });
      }
    };
  }, [socket, match, user?._id]);

  const handleGameInvite = () => {
    console.log(
      "[PlayGame] Play button clicked for match:",
      match.id || match._id
    );

    if (!socket) {
      console.log("[PlayGame] Cannot send invite - socket not connected");
      showModal({
        title: "Error",
        message: "Not connected to server",
        buttons: [{ text: "OK", onPress: () => { } }],
      });
      return;
    }

    setIsSendingInvite(true);

    console.log("[PlayGame] Sending game invite to:", match.id || match._id);
    socket.emit(
      "sendGameInvite",
      {
        senderId: user?._id,
        recipientId: match.id || match._id,
        level: gameLevel
      },
      (response: { invitationId?: string; error?: string }) => {
        if (response.error) {
          console.log(
            "[PlayGame] Error in sendGameInvite callback:",
            response.error
          );
          showModal({
            title: "Error",
            message: response.error,
            buttons: [{ text: "OK", onPress: () => { } }],
          });
          setIsSendingInvite(false);
          return;
        }

        if (response.invitationId) {
          console.log(
            "[PlayGame] Invite sent successfully, invitationId:",
            response.invitationId
          );
          setPendingInviteId(response.invitationId);
        }
      }
    );
  };

  return (
    <Pressable
      style={styles.actionButton}
      onPress={handleGameInvite}
      disabled={
        isSendingInvite ||
        (source === "results" && (!enableNextStageButton || gameLevel === MAX_GAME_LEVEL))
      }
    >
      {source === "results" ? (
        <View
          style={[
            styles.nextButton,
            (!enableNextStageButton || isSendingInvite || gameLevel === MAX_GAME_LEVEL) &&
            styles.disabledButton,
          ]}
        >
          <Text
            style={[
              styles.nextButtonText,
              (!enableNextStageButton || isSendingInvite || gameLevel === MAX_GAME_LEVEL) &&
              styles.disabledText,
            ]}
          >
            {isSendingInvite
              ? "Sending..."
              : gameLevel === MAX_GAME_LEVEL
                ? "Stage Completed!"
                : enableNextStageButton
                  ? "Next Stage"
                  : `Next Stage in ${countdown}s`}
          </Text>
        </View>
      ) : (
        <>
          <Gamepad2 size={24} color={isSendingInvite ? "#888888" : "#00FFFF"} />
          <Text
            style={[styles.actionText, isSendingInvite && styles.disabledText]}
          >
            {isSendingInvite ? "Sending..." : "Play"}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
  actionButton: {
    alignItems: "center",
  },
  playButton: {
    transform: [{ scale: 1.1 }],
  },
  nextButton: {
    backgroundColor: "#FF00FF",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  actionText: {
    fontFamily: "Rajdhani",
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: "#990099",
    borderColor: "#CCCCCC",
  },
  disabledText: {
    color: "#CCCCCC",
  },
});

export default PlayGame;
