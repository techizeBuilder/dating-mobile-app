import { useState, useEffect, useContext, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Alert,
  Text,
  View,
  ActivityIndicator,
  Button,
} from "react-native";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import AgoraUIKit, { ConnectionData, RtcProps } from "agora-rn-uikit";
import {
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
  ClientRoleType,
} from "react-native-agora";
import { ErrorBoundary } from "react-error-boundary";
import { useSocket } from "../context/socketContext";
import { useCallStore } from "@/store/store";
import axios from "axios";
import { API_BASE_URL } from "../apiUrl";
import { useUserProfile } from "../context/userContext";
import { useModal } from "../context/modalContext";

interface VideoCallProps {
  AGORA_APP_ID: string;
  channelName: string;
  channeltoken: string;
  uniqueId: string;
}

const ErrorFallback = ({ error, resetErrorBoundary }: any) => {
  return (
    <SafeAreaView style={styles.errorContainer}>
      <Text>Something went wrong:</Text>
      <Text>{error.message}</Text>
      <Button title="Try Again" onPress={resetErrorBoundary} />
    </SafeAreaView>
  );
};

const VideoCallScreen = () => {
  const { callDetails, clearvideocalldata, isUnlimitedCall } = useCallStore();
  const { socket } = useSocket();
  const [isCallActive, setIsCallActive] = useState(true);
  const [agoraKey, setAgoraKey] = useState(Date.now());
  const [engine, setEngine] = useState<IRtcEngine | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const { token } = useUserProfile()
  const { showModal, hideModal } = useModal();

  // ✅ This keeps the latest isUnlimitedCall in a ref
  const isUnlimitedCallRef = useRef(isUnlimitedCall);

  useEffect(() => {
    isUnlimitedCallRef.current = isUnlimitedCall;
  }, [isUnlimitedCall]);

  useEffect(() => {
    if (!callDetails) {
      router.replace({ pathname: "/(tabs)" });
    }
  }, [callDetails]);


  const connectionData = {
    appId: callDetails?.agoraKey,
    channel: callDetails?.channelName,
    token: callDetails?.channeltoken,
    uid: Number(callDetails?.uniqueId),
  };

  // Engine cleanup handler
  const destroyAgoraEngine = async (engineInstance: IRtcEngine | null) => {
    if (engineInstance) {
      try {
        await engineInstance.leaveChannel();
        engineInstance.removeAllListeners();
        await engineInstance.release();
        setEngine(null);
      } catch (err) {
        console.error("Engine cleanup error:", err);
      }
    }
  };
  useEffect(() => {
    socket.on("callend", (data) => {
      router.replace({ pathname: "/(tabs)" });
      clearvideocalldata();
      setIsCallActive(false);
    });
  }, []);

  // Engine initialization and management
  useEffect(() => {
    const initEngine = async () => {
      try {
        await destroyAgoraEngine(engine);

        const newEngine = createAgoraRtcEngine();
        await newEngine.initialize({
          appId: callDetails?.agoraKey,
          channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
        });

        await newEngine.enableVideo();
        await newEngine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

        setEngine(newEngine);
      } catch (error) {
        console.error("Engine initialization failed:", error);
        showModal({
          title: "Initialization Error",
          message: "Failed to initialize video engine.",
          buttons: [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)"),
            },
          ],
        });

      }
    };

    initEngine();

    return () => {
      destroyAgoraEngine(engine);
    };
  }, [callDetails]);

  // Call duration timer + auto-end logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => {
          const newDuration = prev + 1;
          console.log("Call duration and unlimited call :", newDuration, isUnlimitedCall);
          if (!isUnlimitedCallRef.current && newDuration >= 120) {
            handleEndCall();
          }

          return newDuration;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isCallActive, isUnlimitedCall]);


  const handleEndCall = async () => {
    if (!isCallActive) return;
    console.log("call ending...")
    try {
      setIsCallActive(false);
      socket.emit("callend", {
        to: callDetails.from,
        from: callDetails.to,
        det: callDetails,
      });

      // Save call log
      await axios.post(`${API_BASE_URL}/user/save-call-log`, {
        caller: callDetails.from,
        receiver: callDetails.to,
        wasFreeCall: !isUnlimitedCall,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      await destroyAgoraEngine(engine);
      setAgoraKey(Date.now());

      setTimeout(() => {
        router.replace({
          pathname: "/(tabs)",
        });
        clearvideocalldata();
      }, 1000);
    } catch (error) {
      console.error("Call termination error:", error);
      showModal({
        title: "Error",
        message: "Failed to end call properly.",
        buttons: [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
        ],
      });

    }
  };

  // Socket event listeners
  useEffect(() => {
    const handleRemoteDisconnect = async () => {
      await destroyAgoraEngine(engine);
      setIsCallActive(false);
      router.replace({
        pathname: "/(tabs)",
      });
    };
  }, [engine, callDuration]);

  // Connection state monitoring
  useEffect(() => {
    const monitorConnection = async () => {
      if (engine) {
        try {
          const state = await engine.getConnectionState();
        } catch (error) {
          console.error("Connection monitoring error:", error);
        }
      }
    };

    const interval = setInterval(monitorConnection, 10000);
    return () => clearInterval(interval);
  }, [engine]);

  // RTC configuration
  const rtcCallbacks: RtcProps["rtcCallbacks"] = {
    EndCall: handleEndCall,
    UserJoined: (uid) => console.log("User joined:", uid),
    UserOffline: (uid) => console.log("User left:", uid),
  };

  const rtcSettings: RtcProps["settings"] = {
    enableDualStreamMode: true,
    activeSpeaker: true,
    audioVolumeIndicator: true,
    buttonPosition: "right",
    enableAudio: true,
    enableVideo: true,
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        destroyAgoraEngine(engine);
        setAgoraKey(Date.now());
      }}
    >
      <SafeAreaView style={styles.container}>
        {engine && isCallActive ? (
          <>
            <AgoraUIKit
              key={agoraKey}
              connectionData={connectionData}
              rtcCallbacks={rtcCallbacks}
              settings={rtcSettings}
              styleProps={{
                UIKitContainer: styles.videoContainer,
                localBtnContainer: styles.buttonContainer,
                // remoteBtnContainer: styles.buttonContainer,
              }}
            />
            <Text style={styles.durationText}>
              {Math.floor(callDuration / 60)}:
              {String(callDuration % 60).padStart(2, "0")}
            </Text>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Ending call...</Text>
          </View>
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  buttonContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 50,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: 90,
    width: "99%",
  },
  durationText: {
    position: "absolute",
    top: 40,
    left: 20,
    color: "#fff",
    fontSize: 14,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
    fontWeight: "bold",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#FFF",
    marginTop: 20,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
  },
});


export default VideoCallScreen;
