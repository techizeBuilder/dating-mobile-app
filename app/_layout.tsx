import { useEffect, useState, useRef } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import {
  useFonts,
  Orbitron_400Regular,
  Orbitron_700Bold,
} from "@expo-google-fonts/orbitron";
import {
  Rajdhani_400Regular,
  Rajdhani_600SemiBold,
} from "@expo-google-fonts/rajdhani";
import SplashScreen from "@/components/SplashScreen";
import Toast from "react-native-toast-message";
import { UserProfileProvider } from "./context/userContext";
import { FilterProvider } from "./context/filterContext";
import { API_BASE_URL } from "./apiUrl";
import { SocketProvider } from "./context/socketContext";
import VideoCallScreen from "./video/VideoCallScreen";
import { AgoraProvider } from "./context/agoraContext";
import { useCallStore } from "@/store/store";
import Incoming from "./incoming";
import { ModalProvider } from "./context/modalContext";
import GamePopupModal from "@/components/GameModal";
import { GameProvider } from "./context/gameContext";

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  useFrameworkReady();
  const [showSplash, setShowSplash] = useState(true);
  const { incomingCall } = useCallStore();

  // Notification listeners
  const notificationListener = useRef<Notifications.EventSubscription | null>();
  const responseListener = useRef<Notifications.EventSubscription | null>();
 
  const [fontsLoaded, fontError] = useFonts({
    Orbitron: Orbitron_400Regular,
    "Orbitron-Bold": Orbitron_700Bold,
    Rajdhani: Rajdhani_400Regular,
    "Rajdhani-SemiBold": Rajdhani_600SemiBold,
  });

  // Set up notification listeners
  useEffect(() => {
    console.log("🔥 Setting up notification listeners...");

    // Listen for notifications received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📱 NOTIFICATION RECEIVED!!!", notification);

        // Force show an alert so we know it's working
        // alert("GOT NOTIFICATION: " + notification.request.content.title);

        // Toast.show({
        //   type: "success",
        //   text1: "Notification Received!",
        //   text2: notification.request.content.body || "",
        // });
      });

    // Listen for when user taps a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 NOTIFICATION TAPPED!!!", response);
        // alert("TAPPED NOTIFICATION!");
      });

    // Cleanup function
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Fonts are loaded, but keep showing splash for animation
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <UserProfileProvider>
      <SocketProvider>
        <GameProvider>
          <AgoraProvider>
            <ModalProvider>
              <FilterProvider>
                <>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="auth/login" />
                    <Stack.Screen name="auth/signup" />
                    <Stack.Screen name="auth/verify" />
                    <Stack.Screen name="auth/gender" />
                    <Stack.Screen name="auth/looking-for" />
                    <Stack.Screen name="auth/profile" />
                    <Stack.Screen name="/incoming" />
                    <Stack.Screen name="auth/notifications" />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  {incomingCall && <Incoming />}
                  <StatusBar style="light" />
                  <Toast />
                  <GamePopupModal />
                </>
              </FilterProvider>
            </ModalProvider>
          </AgoraProvider>
        </GameProvider>
      </SocketProvider>
    </UserProfileProvider>
  );
}
