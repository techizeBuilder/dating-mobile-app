import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const themes = [
  { id: 'neon', name: 'Neon', primary: '#FF00FF', secondary: '#00FFFF' },
  { id: 'cyber', name: 'Cyber', primary: '#39FF14', secondary: '#FF69B4' },
  { id: 'retro', name: 'Retro', primary: '#FF4500', secondary: '#4169E1' },
];

export default function ThemeScreen() {
  const [selectedTheme, setSelectedTheme] = useState('neon');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FF00FF" />
        </Pressable>
        <Text style={styles.title}>Theme</Text>
      </View>

      <View style={styles.content}>
        {themes.map((theme) => (
          <Pressable
            key={theme.id}
            style={[
              styles.themeOption,
              selectedTheme === theme.id && styles.themeSelected,
              { borderColor: theme.primary }
            ]}
            onPress={() => setSelectedTheme(theme.id)}
          >
            <View style={styles.themePreview}>
              <View style={[styles.colorSwatch, { backgroundColor: theme.primary }]} />
              <View style={[styles.colorSwatch, { backgroundColor: theme.secondary }]} />
            </View>
            <Text style={[styles.themeName, { color: theme.primary }]}>
              {theme.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 32,
    color: '#FF00FF',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  themeSelected: {
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
  },
  themePreview: {
    flexDirection: 'row',
    gap: 8,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  themeName: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
  },
});