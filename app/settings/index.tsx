import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import {
  Info,
  FileText,
  Shield,
  Trash2,
  Star,
  LogOut,
  ArrowLeft,
  Superscript,
  Ticket,
  Subscript,
  Save,
  Heart,
  Bell,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useUserProfile } from "../context/userContext";

interface SettingItem {
  icon: JSX.Element;
  title: string;
  route?: string;
  action?: () => void;
  color?: string;
}

export default function SettingsScreen() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useUserProfile();

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.replace("/auth/login");
  };

  const settings: SettingItem[] = [
    {
      icon: <Heart size={24} color="#FF69B4" />,
      title: "Saved Users",
      route: "/settings/saved-users",
    },
    {
      icon: <Info size={24} color="#FF69B4" />,
      title: "About Us",
      route: "/settings/about",
    },
    {
      icon: <FileText size={24} color="#4169E1" />,
      title: "Terms of Use",
      route: "/settings/terms",
    },
    {
      icon: <Shield size={24} color="#9370DB" />,
      title: "Privacy Policy",
      route: "/settings/privacy",
    },
    {
      icon: <Trash2 size={24} color="#FF4500" />,
      title: "Delete Account",
      route: "/settings/delete-account",
    },
    {
      icon: <Star size={24} color="#FFD700" />,
      title: "Rate App",
      route: "/settings/rate",
    },
    {
      icon: <Ticket size={24} color="#FFD700" />,
      title: "Support",
      route: "/settings/support",
    },

    {
      icon: <Subscript size={24} color="#FFD700" />,
      title: "Subscriptions",
      route: "/settings/subscriptions",
    },
    {
      icon: <Bell size={24} color="#79AA00" />,
      title: "Notifications",
      route: "/auth/notifications",
    },
    {
      icon: <LogOut size={24} color="#FF6B6B" />,
      title: "Logout",
      action: () => setShowLogoutModal(true),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FF00FF" />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.content}>
          {settings.map((item, index) => (
            <Pressable
              key={index}
              style={[
                styles.settingItem,
                item.color && { borderColor: item.color },
              ]}
              onPress={() =>
                item.action ? item.action() : router.push(item.route!)
              }
            >
              {item.icon}
              <Text
                style={[
                  styles.settingText,
                  item.color && { color: item.color },
                ]}
              >
                {item.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalText}>
              Are you sure you want to logout?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]} // styling handled below
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable onPress={handleLogout} style={{ width: "50%" }}>
                <LinearGradient
                  colors={["#FF00FF", "#8A2BE2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    height: 47,
                    borderRadius: 24,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#FF00FF",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 4,
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Rajdhani-SemiBold",
                      fontSize: 16,
                      color: "#FFFFFF",
                    }}
                  >
                    Logout
                  </Text>
                </LinearGradient>
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
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    // backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    // backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderColor: "#03d7fc",
    gap: 16,
  },
  settingText: {
    flex: 1,
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
    borderColor: "#03d7fc",
  },
  modalTitle: {
    fontFamily: "Orbitron-Bold",
    fontSize: 24,
    color: "#FF00FF",
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
    backgroundColor: "rgba(0,0,0,0.8)",
    borderWidth: 1,
    borderColor: "#00ffff",
  },
  confirmButton: {
    backgroundColor: "#FF00FF",
  },
  cancelButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 16,
    color: "#00ffff",
  },
  confirmButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 16,
    color: "#000000",
  },
});
