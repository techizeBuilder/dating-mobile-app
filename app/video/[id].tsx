import { View, Text, StyleSheet, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Video, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react-native";

export default function VideoCallScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Video Call</Text>
        <Text style={styles.status}>Connecting...</Text>
      </View>
      <View style={styles.remoteVideo}>
        <Text style={styles.connectingText}>Connecting to video call...</Text>
      </View>
      <View style={styles.controls}>
        <Pressable style={styles.controlButton}>
          <Mic size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.controlButton}>
          <Video size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable
          style={[styles.controlButton, styles.endCallButton]}
          onPress={() => router.back()}
        >
          <PhoneOff size={24} color="#FFFFFF" />
        </Pressable>
      </View>
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
    alignItems: "center",
  },
  title: {
    fontFamily: "Orbitron-Bold",
    fontSize: 24,
    color: "#FF00FF",
    marginBottom: 4,
  },
  status: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#00FFFF",
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },
  connectingText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    padding: 20,
    paddingBottom: 40,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 0, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF00FF",
  },
  endCallButton: {
    backgroundColor: "#FF0000",
    borderColor: "#FF0000",
  },
});