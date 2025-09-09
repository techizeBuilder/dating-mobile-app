import { useState } from "react";
import Constants from "expo-constants";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Bell } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export default function NotificationsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleToggle = async (value: boolean) => {
    console.log({ value });
    setNotificationsEnabled(value);

    if (value) {
      console.log("Getting token");
      const token = await registerForPushNotificationsAsync();
      console.log("Token: ", { token });
      if (token) {
        console.log("Expo Push Token:", token);
      } else {
        Alert.alert(
          "Permission denied",
          "You need to enable notifications in settings."
        );
        setNotificationsEnabled(false);
      }
    }
  };

  const handleContinue = () => {
    router.push("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={24} color="#FF00FF" />
      </Pressable>

      <View style={styles.content}>
        <Bell size={64} color="#FF00FF" strokeWidth={1.5} />

        <Text style={styles.title}>Stay Updated</Text>
        <Text style={styles.subtitle}>
          Get notified about new matches and messages
        </Text>

        <View style={styles.toggleContainer}>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: "#333", true: "#FF00FF" }}
            thumbColor={notificationsEnabled ? "#fff" : "#666"}
          />
          <Text style={styles.toggleText}>
            {notificationsEnabled
              ? "Notifications enabled"
              : "Enable notifications"}
          </Text>
        </View>

        <Pressable onPress={handleContinue} style={{ width: "100%" }}>
          <LinearGradient
            colors={["#FF00FF", "#8A2BE2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

async function registerForPushNotificationsAsync() {
  console.log("Starting push token registration...");
  let token;

  if (!Device.isDevice) {
    console.log("Not a physical device");
    Alert.alert("Error", "Must use a physical device for push notifications.");
    return null;
  }

  console.log("Device check passed");

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH, // Changed from MAX
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // // Create notification channel FIRST on Android
  // if (Platform.OS === "android") {
  //   await Notifications.setNotificationChannelAsync("default", {
  //     name: "default",
  //     importance: Notifications.AndroidImportance.MAX,
  //     vibrationPattern: [0, 250, 250, 250],
  //     lightColor: "#FF231F7C",
  //     showBadge: true,
  //     enableLights: true,
  //     enableVibrate: true,
  //     lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  //   });
  // }

  console.log("Getting current permissions...");
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log("Current permission status:", existingStatus);

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    console.log("Requesting permissions...");
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log("Permission request result:", status);
  }

  if (finalStatus !== "granted") {
    console.log("Permission not granted, final status:", finalStatus);
    return null;
  }

  console.log("Permission granted, getting push token...");
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas.projectId,
    });
    token = tokenData.data;
    console.log("Successfully got push token:", token);
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 24,
  },
  backButton: {
    marginTop: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -100,
  },
  title: {
    fontFamily: "Orbitron-Bold",
    fontSize: 28,
    color: "#FF00FF",
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Rajdhani",
    fontSize: 18,
    color: "#00FFFF",
    marginBottom: 32,
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 48,
  },
  toggleText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#FF00FF",
  },
  gradientButton: {
    height: 48,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF00FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
});
