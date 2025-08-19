import axios from "axios";
import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks";
import { LucidePhoneOff } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { API_BASE_URL } from "./apiUrl";
import { useUserProfile } from "./context/userContext";
import { useSocket } from "./context/socketContext";
import { router } from "expo-router";
import { useCallStore } from "@/store/store";
import { Audio } from "expo-av";
import Loading from "@/components/Loading";
import { useModal } from "./context/modalContext";

const outgoing = () => {
  const [callDuration, setCallDuration] = useState(0);
  const pulseAnim = new Animated.Value(1);
  const { receiverId, name, image } = useLocalSearchParams();
  const soundRef = useRef<Audio.Sound | null>(null);
  const { socket, onlineUsers } = useSocket();
  const { token, user } = useUserProfile();
  const { setIncomingCallDetails, callDetails, setIsUnlimitedCall } = useCallStore();
  const [incomingCallDetails, setIncomingCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showModal, hideModal } = useModal();

  const videoCallData = async () => {
    try {
      setIsLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/user/videocall`,
        { receiverId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          validateStatus: () => true,
        }
      );

      if (response.status === 200) {
        // ✅ Proceed only if status is 200
        setIsUnlimitedCall(response.data.data.bothHavePlan);

        const agoracredential = response.data.data.receiver;

        socket.emit("incoming", {
          to: response.data.data.receiver.id,
          from: response.data.data.caller.id,
          ...agoracredential,
          bothHavePlan: response.data.data.bothHavePlan,
        });

        setIncomingCallDetails({
          to: response.data.data.receiver.id,
          from: response.data.data.caller.id,
          ...response.data.data.caller,
        });

        setIncomingCall(response.data.data);
      } else {
        showModal({
          title: "Call Failed",
          message: response.data?.message || "Call request failed. Please try again.",
          buttons: [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ],
        });
      }
    } catch (error) {
      // Handles network or other unexpected errors
      console.error("Video call request failed:", error.response?.data || error.message);
      showModal({
        title: "Error",
        message: error.response?.data?.message || "An error occurred while making the call.",
        buttons: [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const playRingtone = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/audio/ring.mp3"),
          { shouldPlay: true, isLooping: true }
        );
        soundRef.current = sound;
      } catch (error) {
        console.error("Error playing ringtone:", error);
      }
    };
    playRingtone();

    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync().then(() => {
          soundRef.current?.unloadAsync();
          soundRef.current = null;
        });
      }
    };
  }, []);

  const stopRingtone = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  const endCall = () => {
    router.back();
    socket.emit("callend", {
      to: incomingCallDetails?.receiver?.id,
      from: incomingCallDetails?.caller?.id,
    });
    stopRingtone();

  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    socket.on("callend", () => {
      stopRingtone();
      router.push("/(tabs)");
    })
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    socket.on("callAccept", () => {
      stopRingtone();
      router.push("/video/VideoCallScreen");
    });
    return () => {
      clearInterval(timer);
      pulseAnim.stopAnimation();
    };
  }, []);

  useEffect(() => {
    const isReceiverOnline = onlineUsers.includes(receiverId);

    if (!isReceiverOnline) {
      showModal({
        title: "User Offline",
        message: "The user you're trying to call is currently offline.",
        buttons: [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      });
      return;
    }

    videoCallData();
  }, [receiverId, onlineUsers]);


  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading />
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.text}>Calling {name}</Text>
      </View>

      <Animated.View
        style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}
      >
        <Image
          source={
            image ? { uri: image } : require("../assets/images/logobg.png")
          }
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.statusIndicator} />
      </Animated.View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={endCall}
          style={[styles.actionButton, styles.endCallButton]}
          activeOpacity={0.7}
        >
          <LucidePhoneOff color="#FFFFFF" size={28} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Slide up to open call options</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    justifyContent: "space-between",
    paddingVertical: 50,
  },
  header: {
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
    color: "#E0E0E0",
    marginBottom: 5,
  },
  duration: {
    fontSize: 16,
    color: "#A0A0A0",
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "#7B2CBF",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#7B2CBF",
    borderWidth: 3,
    borderColor: "#0A0A0A",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
  },
  endCallButton: {
    backgroundColor: "#FF3B30",
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  footer: {
    paddingBottom: 20,
  },
  footerText: {
    color: "#555555",
    fontSize: 14,
  },
});

export default outgoing;
