import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FF00FF" />
        </Pressable>
        <Text style={styles.title}>Terms of Use</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing and using NeonLove, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. User Eligibility</Text>
          <Text style={styles.text}>
            You must be at least 18 years old to use NeonLove. By using the app, you represent and warrant that you have the right, authority, and capacity to enter into these Terms and to abide by all of the terms and conditions set forth herein.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Conduct</Text>
          <Text style={styles.text}>
            Users agree to:
            {'\n'}- Provide accurate information
            {'\n'}- Use the service responsibly
            {'\n'}- Respect other users
            {'\n'}- Not engage in harmful behavior
            {'\n'}- Not share inappropriate content
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Privacy</Text>
          <Text style={styles.text}>
            Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Termination</Text>
          <Text style={styles.text}>
            We reserve the right to terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever.
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
  section: {
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    // backgroundColor: 'rgba(0, 229, 255, 0.1)',
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