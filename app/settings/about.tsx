import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Heart } from 'lucide-react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FF00FF" />
        </Pressable>
        <Text style={styles.title}>About Us</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <Heart size={64} color="#FF00FF" />
          <Text style={styles.appName}>Heart2Get</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.text}>
            NeonLove is dedicated to creating meaningful connections in the digital age. We believe that everyone deserves to find their perfect match, and we're here to make that journey exciting and memorable.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Makes Us Different</Text>
          <Text style={styles.text}>
            Our unique approach combines cutting-edge technology with a deep understanding of human connections. We focus on compatibility beyond just appearances, using our advanced matching algorithm to help you find genuine connections.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.text}>
            Email: support@heart2get.com{'\n'}
            Website: www.heart2get.com{'\n'}
            Follow us on social media @Heart2Get
          </Text>
        </View>
      </ScrollView>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 28,
    color: '#FF00FF',
    marginTop: 16,
    marginBottom: 8,
  },
  version: {
    fontFamily: 'Rajdhani',
    fontSize: 16,
    color: '#00FFFF',
  },
  section: {
    marginBottom: 32,
    // backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#03d7fc',
  },
  sectionTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 20,
    color: '#FF00FF',
    marginBottom: 12,
  },
  text: {
    fontFamily: 'Rajdhani',
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
});