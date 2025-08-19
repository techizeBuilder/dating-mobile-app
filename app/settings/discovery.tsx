import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Slider } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function DiscoveryScreen() {
  const [settings, setSettings] = useState({
    distance: 50,
    ageRange: [18, 35],
    showOnline: true,
    showVerified: true,
    incognito: false,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FF00FF" />
        </Pressable>
        <Text style={styles.title}>Discovery</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance</Text>
          <Text style={styles.value}>{settings.distance} km</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={100}
            value={settings.distance}
            onValueChange={(value) => setSettings({ ...settings, distance: Math.round(value) })}
            minimumTrackTintColor="#FF00FF"
            maximumTrackTintColor="#333"
            thumbTintColor="#FF00FF"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Range</Text>
          <Text style={styles.value}>{settings.ageRange[0]} - {settings.ageRange[1]}</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={100}
              value={settings.ageRange[0]}
              onValueChange={(value) => setSettings({ 
                ...settings, 
                ageRange: [Math.round(value), settings.ageRange[1]] 
              })}
              minimumTrackTintColor="#FF00FF"
              maximumTrackTintColor="#333"
              thumbTintColor="#FF00FF"
            />
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={100}
              value={settings.ageRange[1]}
              onValueChange={(value) => setSettings({ 
                ...settings, 
                ageRange: [settings.ageRange[0], Math.round(value)] 
              })}
              minimumTrackTintColor="#FF00FF"
              maximumTrackTintColor="#333"
              thumbTintColor="#FF00FF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.switchOption}>
            <Text style={styles.optionText}>Show Online Users Only</Text>
            <Switch
              value={settings.showOnline}
              onValueChange={(value) => setSettings({ ...settings, showOnline: value })}
              trackColor={{ false: '#333', true: '#FF00FF' }}
              thumbColor={settings.showOnline ? '#fff' : '#666'}
            />
          </View>

          <View style={styles.switchOption}>
            <Text style={styles.optionText}>Show Verified Users Only</Text>
            <Switch
              value={settings.showVerified}
              onValueChange={(value) => setSettings({ ...settings, showVerified: value })}
              trackColor={{ false: '#333', true: '#FF00FF' }}
              thumbColor={settings.showVerified ? '#fff' : '#666'}
            />
          </View>

          <View style={styles.switchOption}>
            <Text style={styles.optionText}>Incognito Mode</Text>
            <Switch
              value={settings.incognito}
              onValueChange={(value) => setSettings({ ...settings, incognito: value })}
              trackColor={{ false: '#333', true: '#FF00FF' }}
              thumbColor={settings.incognito ? '#fff' : '#666'}
            />
          </View>
        </View>
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
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 20,
    color: '#FF00FF',
    marginBottom: 8,
  },
  value: {
    fontFamily: 'Rajdhani',
    fontSize: 16,
    color: '#00FFFF',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderContainer: {
    gap: 16,
  },
  switchOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF00FF',
  },
  optionText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});