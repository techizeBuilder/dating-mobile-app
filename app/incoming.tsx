import { PhoneIncomingIcon, PhoneOff } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useSocket } from "./context/socketContext";
import { useCallStore } from "@/store/store";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";

const incoming = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { socket } = useSocket();
  const router = useRouter();
  const { clearvideocalldata, callDetails, setIncomingCall, incomingCall } =
    useCallStore();
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const playRingtone = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/audio/calm.mp3"),
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

  const handleAnswerCall = () => {
    router.push("/video/VideoCallScreen");
    setIncomingCall(false);
    socket.emit("callAccept", {
      to: callDetails.from,
      from: callDetails.to,
    });
  };

  const declinedCall = () => {
    socket.emit("callend", {
      to: callDetails?.from,
      from: callDetails?.to,
    });
    clearvideocalldata();
  };

  useEffect(() => {
    socket.on("callend", () => {
      clearvideocalldata()
      stopRingtone();

     
    });

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

    return () => pulseAnim.stopAnimation();
  }, []);

  const stopRingtone = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  useEffect(() => {
    if (!incomingCall) {
      stopRingtone();
    }
  }, [incomingCall]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Incoming Call</Text>
        <Text style={styles.callerName}>{callDetails?.name}</Text>
      </View>
      <Animated.View
        style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}
      >
        <Image
          source={
            callDetails?.profile || require("../assets/images/logobg.png")
          }
          style={styles.avatar}
          resizeMode="contain"
        />

        <View style={styles.activeIndicator} />
      </Animated.View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.callButton, styles.declineButton]}
          activeOpacity={0.7}
          onPress={declinedCall}
        >
          <PhoneOff color="#FFFFFF" size={28} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAnswerCall}
          style={[styles.callButton, styles.answerButton]}
          activeOpacity={0.7}
        >
          <PhoneIncomingIcon color="#FFFFFF" size={28} />
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Swipe up to send message</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignItems: "center",
    backgroundColor: "#121212",
    justifyContent: "space-between",
    paddingVertical: 50,
    paddingHorizontal: 20,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 10,
    shadowColor: "#000",
    height: "100%",
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  title: {
    fontSize: 18,
    color: "#A0A0A0",
    marginBottom: 5,
  },
  callerName: {
    fontSize: 32,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "#7B2CBF",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 15,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7B2CBF",
    borderWidth: 3,
    borderColor: "#121212",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 40,
  },
  callButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  declineButton: {
    backgroundColor: "#FF3B30",
  },
  answerButton: {
    backgroundColor: "#34C759",
  },
  hint: {
    color: "#555555",
    fontSize: 14,
    marginBottom: 20,
  },
});

export default incoming;
