import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="about" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="delete-account" />
      <Stack.Screen name="rate" />
      <Stack.Screen name="support" />
      <Stack.Screen name="saved-users" />
      <Stack.Screen name="subscriptions" />
    </Stack>
  );
}