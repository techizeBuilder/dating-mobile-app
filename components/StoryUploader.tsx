import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, Modal } from "react-native";
import { Video, ResizeMode } from "expo-av"; // Add this import for video preview
import {
  X,
  Upload,
  Camera as CameraIcon,
  Video as VideoIcon,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

interface MediaAsset {
  uri: string;
  type: string;
  fileName: string;
  mediaType: "image" | "video"; // Add media type to distinguish
}

interface StoryUploaderProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (media: MediaAsset) => void;
}

export default function StoryUploader({
  visible,
  onClose,
  onUpload,
}: StoryUploaderProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);

  const handlePickMedia = async (
    useCamera: boolean,
    mediaType: "image" | "video" | "all"
  ) => {
    try {
      let result;

      // Determine media types based on selection
      const mediaTypeOptions = {
        image: ImagePicker.MediaTypeOptions.Images,
        video: ImagePicker.MediaTypeOptions.Videos,
        all: ImagePicker.MediaTypeOptions.All,
      };

      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: mediaTypeOptions[mediaType],
          allowsEditing: true,
          aspect: [9, 16],
          quality: 1,
          videoQuality: ImagePicker.UIImagePickerControllerQualityType.High, // For video quality
          videoMaxDuration: 60, // Max 60 seconds for stories
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: mediaTypeOptions[mediaType],
          allowsEditing: true,
          aspect: [9, 16],
          quality: 1,
          videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
          videoMaxDuration: 60,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Determine if it's an image or video
        const isVideo =
          asset.type === "video" ||
          asset.uri.includes(".mp4") ||
          asset.uri.includes(".mov");

        // Guess filename if missing
        const guessedFilename =
          asset.uri.split("/").pop() || (isVideo ? "story.mp4" : "story.jpg");
        const guessedType =
          asset.type || (isVideo ? "video/mp4" : "image/jpeg");

        setSelectedMedia({
          uri: asset.uri,
          type: guessedType,
          fileName: asset.fileName || guessedFilename,
          mediaType: isVideo ? "video" : "image",
        });
      }
    } catch (error) {
      console.error("Error picking media:", error);
    }
  };

  const handleUpload = () => {
    if (selectedMedia) {
      onUpload(selectedMedia);
      setSelectedMedia(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Moment</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#FF00FF" />
            </Pressable>
          </View>

          {selectedMedia ? (
            <View style={styles.previewContainer}>
              {selectedMedia.mediaType === "video" ? (
                <Video
                  source={{ uri: selectedMedia.uri }}
                  style={styles.preview}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping
                  shouldPlay
                />
              ) : (
                <Image
                  source={{ uri: selectedMedia.uri }}
                  style={styles.preview}
                />
              )}
              <Pressable style={styles.uploadButton} onPress={handleUpload}>
                <Upload size={24} color="#000000" />
                <Text style={styles.uploadButtonText}>Share Moment</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              <Pressable
                style={styles.option}
                onPress={() => handlePickMedia(false, "image")}
              >
                <Upload size={32} color="#00ffff" />
                <Text style={styles.optionText}>Upload Photo from Gallery</Text>
              </Pressable>

              <Pressable
                style={styles.option}
                onPress={() => handlePickMedia(false, "video")}
              >
                <VideoIcon size={32} color="#00ffff" />
                <Text style={styles.optionText}>Upload Video from Gallery</Text>
              </Pressable>

              <Pressable
                style={styles.option}
                onPress={() => handlePickMedia(true, "image")}
              >
                <CameraIcon size={32} color="#00ffff" />
                <Text style={styles.optionText}>Take Photo</Text>
              </Pressable>

              <Pressable
                style={styles.option}
                onPress={() => handlePickMedia(true, "video")}
              >
                <VideoIcon size={32} color="#00ffff" />
                <Text style={styles.optionText}>Record Video</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  content: {
    flex: 1,
    // marginTop: 44,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 0, 255, 0.2)",
  },
  title: {
    fontFamily: "Orbitron-Bold",
    fontSize: 24,
    color: "#FF00FF",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 0, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF00FF",
  },
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 20,
  },
  option: {
    backgroundColor: "rgba(0,0,0,0.8)",
    borderWidth: 2,
    borderColor: "#00ffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  optionText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#00ffff",
  },
  previewContainer: {
    flex: 1,
  },
  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadButton: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#FF00FF",
    borderRadius: 28,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  uploadButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#000000",
  },
});
