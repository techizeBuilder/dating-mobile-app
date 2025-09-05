import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { ResizeMode, Video, AVPlaybackStatus } from "expo-av";
import { X, Heart, MessageCircle, Share2 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fixImageUrl } from "@/app/utils/fixImageUrl";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Story {
  id: string;
  imageUrl: string;
  timestamp: string;
  username: string;
  avatarUrl: string;
  mediaType?: "image" | "video";
}

interface StoryViewerProps {
  visible: boolean;
  onClose: () => void;
  stories: Story[];
  currentIndex: number;
}

export default function StoryViewer({
  visible,
  onClose,
  stories,
  currentIndex,
}: StoryViewerProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [shouldClose, setShouldClose] = useState(false);
  const [videoStatus, setVideoStatus] = useState<AVPlaybackStatus | null>(null);

  useEffect(() => {
    if (visible) {
      setActiveIndex(currentIndex);
      setProgress(0);
    }
  }, [visible, currentIndex]);

  useEffect(() => {
    if (shouldClose) {
      onClose();
      setShouldClose(false);
    }
  }, [shouldClose, onClose]);

  useEffect(() => {
    setProgress(0);
    setVideoStatus(null); // Reset video status when story changes
    console.log("current story:", stories[activeIndex]);
  }, [activeIndex]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (visible && !isPaused) {
      const currentStory = stories[activeIndex];
      const isVideo = currentStory?.mediaType === "video";

      if (isVideo && videoStatus?.isLoaded) {
        // For videos, sync progress with actual playback
        const currentTime = videoStatus.positionMillis || 0;
        const duration = videoStatus.durationMillis || 1;
        const videoProgress = currentTime / duration;

        setProgress(videoProgress);

        // Check if video finished
        if (videoProgress >= 0.99) {
          if (activeIndex < stories.length - 1) {
            setActiveIndex((prevIndex) => prevIndex + 1);
          } else {
            setShouldClose(true);
          }
        }
      } else if (!isVideo) {
        // For images, use timer-based progress (5 seconds)
        timer = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + 0.02; // 0.02 * 50 = 1 (5 seconds)
            if (newProgress >= 1) {
              if (activeIndex < stories.length - 1) {
                setActiveIndex((prevIndex) => prevIndex + 1);
                return 0;
              } else {
                setShouldClose(true);
                return 1;
              }
            }
            return newProgress;
          });
        }, 100); // Update every 100ms
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [visible, activeIndex, isPaused, videoStatus]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setVideoStatus(status);
  };

  if (!stories.length || !visible) return null;

  const currentStory = stories[activeIndex];
  const isCurrentVideo = currentStory?.mediaType === "video";

  return (
    <Modal visible={visible} transparent animationType="fade" key={activeIndex}>
      <View style={styles.container}>
        {isCurrentVideo ? (
          <Video
            source={{ uri: currentStory?.imageUrl }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay={visible}
            isLooping={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
        ) : (
          <Image
            source={{ uri: currentStory?.imageUrl }}
            style={styles.media}
          />
        )}

        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "transparent", "rgba(0,0,0,0.7)"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.header}>
          <View style={styles.progressContainer}>
            {stories.map((_, index) => (
              <View key={index} style={styles.progressWrapper}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width:
                        index === activeIndex
                          ? `${Math.min(progress * 100, 100)}%`
                          : index < activeIndex
                          ? "100%"
                          : "0%",
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: fixImageUrl(currentStory?.avatarUrl) }}
                  style={styles.avatar}
                />
                <View style={styles.onlineIndicator} />
              </View>
              <View>
                <Text style={styles.username}>{currentStory?.username}</Text>
                <Text style={styles.timestamp}>{currentStory?.timestamp}</Text>
              </View>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.navigationContainer} pointerEvents="box-none">
          {/* Left tap area */}
          <Pressable
            style={[styles.navButton, { width: "33%" }]}
            pointerEvents="box-none"
            onPress={() => {
              if (activeIndex > 0) {
                setActiveIndex(activeIndex - 1);
                setProgress(0);
              }
            }}
          />

          {/* Middle area - Pause on hold */}
          <Pressable
            style={[styles.navButton, { width: "34%" }]}
            pointerEvents="box-none"
            onPressIn={() => setIsPaused(true)}
            onPressOut={() => setIsPaused(false)}
          />

          {/* Right tap area */}
          <Pressable
            style={[styles.navButton, { width: "33%" }]}
            pointerEvents="box-none"
            onPress={() => {
              if (activeIndex < stories.length - 1) {
                setActiveIndex(activeIndex + 1);
                setProgress(0);
              } else {
                onClose();
              }
            }}
          />
        </View>

        <View style={styles.footer}></View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    resizeMode: "cover",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FF00FF",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#39FF14",
    borderWidth: 2,
    borderColor: "#000",
  },
  username: {
    fontFamily: "Orbitron-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  timestamp: {
    fontFamily: "Rajdhani",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  progressContainer: {
    flexDirection: "row",
    gap: 4,
  },
  progressWrapper: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 1,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF00FF",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF00FF",
  },
  navigationContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  navButton: {
    flex: 1,
    height: "100%",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
});
