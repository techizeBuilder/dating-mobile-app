import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, TriangleAlert as AlertTriangle } from "lucide-react-native";
import { useUserProfile } from "../context/userContext";
import Toast from "react-native-toast-message";
import { API_BASE_URL } from "../apiUrl";

export default function DeleteAccountScreen() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { token, logout } = useUserProfile();

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };
  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Delete response:", data);

      if (res.ok && data.status === true) {
        setShowConfirmModal(false);

        Toast.show({
          type: "success",
          text1: "Account Deleted",
          text2: "Your account has been successfully deleted.",
          position: "top",
        });
        handleLogout();
        // router.replace("/");
      } else {
        Toast.show({
          type: "error",
          text1: "Deletion Failed",
          text2: data.message || "Could not delete your account.",
          position: "top",
        });
      }
    } catch (error) {
      console.error("Delete account error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again.",
        position: "top",
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FF00FF" />
        </Pressable>
        <Text style={styles.title}>Delete Account</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.warningContainer}>
          <AlertTriangle size={64} color="#FF4500" />
          <Text style={styles.warningTitle}>Warning</Text>
          <Text style={styles.warningText}>Deleting your account will:</Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>
              • Permanently remove all your data
            </Text>
            <Text style={styles.bulletPoint}>
              • Delete all your matches and conversations
            </Text>
            <Text style={styles.bulletPoint}>
              • Cancel any active subscriptions
            </Text>
            <Text style={styles.bulletPoint}>
              • This action cannot be undone
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.deleteButton}
          onPress={() => setShowConfirmModal(true)}
        >
          <Text style={styles.deleteButtonText}>Delete My Account</Text>
        </Pressable>
      </View>

      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalText}>
              Are you sure you want to permanently delete your account? This
              action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.confirmButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  title: {
    fontFamily: "Orbitron-Bold",
    fontSize: 32,
    color: "#FF00FF",
    textShadowColor: "#FF00FF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  warningContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 69, 0, 0.1)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: "#FF4500",
    marginBottom: 32,
  },
  warningTitle: {
    fontFamily: "Orbitron-Bold",
    fontSize: 24,
    color: "#FF4500",
    marginTop: 16,
    marginBottom: 8,
  },
  warningText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  bulletPoints: {
    alignSelf: "stretch",
  },
  bulletPoint: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: "#FF4500",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    width: "80%",
    borderWidth: 2,
    borderColor: "#FF4500",
  },
  modalTitle: {
    fontFamily: "Orbitron-Bold",
    fontSize: 24,
    color: "#FF4500",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    fontFamily: "Rajdhani",
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 24,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 69, 0, 0.1)",
    borderWidth: 1,
    borderColor: "#FF4500",
  },
  confirmButton: {
    backgroundColor: "#FF4500",
  },
  cancelButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 16,
    color: "#FF4500",
  },
  confirmButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
