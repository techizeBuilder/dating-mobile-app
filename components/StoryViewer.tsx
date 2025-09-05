import { useState, useEffect, useRef, useCallback } from "react";
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
  const [storyCompleted, setStoryCompleted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef(0);

  // Update refs when progress changes
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Reset when modal opens or story changes
  useEffect(() => {
    if (visible) {
      setActiveIndex(currentIndex);
      resetStory();
    }
  }, [visible, currentIndex]);

  useEffect(() => {
    resetStory();
  }, [activeIndex]);

  const resetStory = () => {
    setProgress(0);
    setStoryCompleted(false);
    progressRef.current = 0;
    clearTimer();
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const moveToNextStory = useCallback(() => {
    if (storyCompleted) return; // Prevent multiple calls

    setStoryCompleted(true);
    clearTimer();

    if (activeIndex < stories.length - 1) {
      setActiveIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [activeIndex, stories.length, onClose, storyCompleted]);

  // Handle image stories with timer
  useEffect(() => {
    if (!visible || isPaused || storyCompleted) return;

    const currentStory = stories[activeIndex];
    const isVideo = currentStory?.mediaType === "video";

    if (!isVideo) {
      // Image story - 5 second timer
      timerRef.current = setInterval(() => {
        const newProgress = progressRef.current + 0.02;

        if (newProgress >= 1) {
          setProgress(1);
          moveToNextStory();
        } else {
          setProgress(newProgress);
        }
      }, 100);
    }

    return clearTimer;
  }, [visible, activeIndex, isPaused, storyCompleted, moveToNextStory]);

  // Handle video playback status
  const handleVideoStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded || storyCompleted) return;

    const position = status.positionMillis || 0;
    const duration = status.durationMillis || 1;
    const videoProgress = Math.min(position / duration, 1);

    setProgress(videoProgress);

    // Check if video is near end
    if (videoProgress >= 0.98) {
      moveToNextStory();
    }
  };

  const handlePrevious = () => {
    if (activeIndex > 0 && !storyCompleted) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (!storyCompleted) {
      moveToNextStory();
    }
  };

  if (!stories.length || !visible) return null;

  const currentStory = stories[activeIndex];
  const isCurrentVideo = currentStory?.mediaType === "video";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        {isCurrentVideo ? (
          <Video
            key={activeIndex} // Force remount on story change
            source={{ uri: currentStory?.imageUrl }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay={!isPaused && visible && !storyCompleted}
            isLooping={false}
            onPlaybackStatusUpdate={handleVideoStatusUpdate}
          />
        ) : (
          <Image
            key={activeIndex}
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
          <Pressable
            style={[styles.navButton, { width: "33%" }]}
            pointerEvents="box-none"
            onPress={handlePrevious}
          />

          <Pressable
            style={[styles.navButton, { width: "34%" }]}
            pointerEvents="box-none"
            onPressIn={() => setIsPaused(true)}
            onPressOut={() => setIsPaused(false)}
          />

          <Pressable
            style={[styles.navButton, { width: "33%" }]}
            pointerEvents="box-none"
            onPress={handleNext}
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
