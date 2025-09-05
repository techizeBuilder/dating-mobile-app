import { Entypo } from "@expo/vector-icons";
import { Modal, Pressable, TouchableOpacity } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  clamp,
} from "react-native-reanimated";

export default function FullImageModal({
  isOpen,
  onClose,
  image,
}: {
  isOpen: boolean;
  onClose: () => void;
  image: string;
}) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  // Pinch gesture - maintains zoom level
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, 1, 5); // Min 1x, Max 5x zoom
    })
    .onEnd(() => {
      savedScale.value = scale.value; // Save the current scale
    });

  // Pan gesture - only for moving the image when zoomed
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow panning when zoomed in
      if (scale.value > 1) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      // Reset position smoothly when not zoomed
      if (scale.value <= 1) {
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  // Double tap to reset zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1, { duration: 200 });
      savedScale.value = 1;
      translateX.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // Reset values when modal opens
  const resetValues = () => {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      onRequestClose={onClose}
      animationType="fade"
      onShow={resetValues} // Reset values when modal opens
    >
      <GestureHandlerRootView
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.8)",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: 60, // Adjusted for better positioning
            right: 20,
            borderRadius: 999,
            borderColor: "#FF00FF",
            borderWidth: 1,
            padding: 8,
            zIndex: 1000, // Ensure it stays on top
          }}
        >
          <Entypo name="cross" size={20} color="#FF00FF" />
        </TouchableOpacity>

        {/* Background tap to close - only when not zoomed */}
        <Pressable
          //   onPress={() => {
          //     if (scale.value <= 1) {
          //       onClose();
          //     }
          //   }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <GestureDetector gesture={composedGesture}>
            <Animated.Image
              source={{ uri: image }}
              style={[
                {
                  width: "90%", // Increased for better full-screen experience
                  height: "90%", // Adjusted for better aspect ratio
                  //   borderWidth: 2,
                  //   borderColor: "#ccc",
                },
                animatedStyle,
              ]}
              resizeMode="contain" // Ensures the entire image is visible
            />
          </GestureDetector>
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
}
