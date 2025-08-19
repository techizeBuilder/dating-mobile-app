import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useUserProfile } from '../context/userContext';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../apiUrl';
type Gender = 'Male' | 'Female' | 'Other';

export default function GenderScreen() {
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const { updateProfile, profile, token } = useUserProfile();
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  const { country_code } = useLocalSearchParams<{ country_code: string }>();

  console.log("mobile number from another page in gender page : ", mobile, country_code)

  const handleContinue = () => {
    if (selectedGender) {
      updateProfile({ i_am: selectedGender, mobile: mobile, country_code: country_code });
      router.push('/auth/looking-for');
    }
  };


  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={24} color="#FF00FF" />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>I am a...</Text>
        <Text style={styles.subtitle}>Select your gender</Text>

        <View style={styles.optionsContainer}>
          {(['Male', 'Female', 'Other'] as Gender[]).map((gender) => (
            <Pressable
              key={gender}
              style={[
                styles.option,
                selectedGender === gender && styles.optionSelected,
              ]}
              onPress={() => setSelectedGender(gender)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedGender === gender && styles.optionTextSelected,
                ]}
              >
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleContinue}
          disabled={!selectedGender}
          style={{
            width: '100%',
            opacity: !selectedGender ? 0.5 : 1,
          }}
        >
          <LinearGradient
            colors={['#FF00FF', '#8A2BE2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}

            style={{
              height: 48,
              borderRadius: 24,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#FF00FF',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 5,
              width: '100%',
            }}
          >
            <Text style={{
              fontFamily: 'Rajdhani-SemiBold',
              fontSize: 20,
              color: '#FFFFFF',
            }}>
              Continue
            </Text>
          </LinearGradient>
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
  },
  backButton: {
    marginTop: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -100,
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 28,
    color: '#FF00FF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Rajdhani',
    fontSize: 18,
    color: '#00FFFF',
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  option: {
    height: 50,
    borderWidth: 2,
    borderColor: '#03d7fc',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#03d7fc',
    shadowColor: '#03d7fc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  optionText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#03d7fc',
  },
  optionTextSelected: {
    color: '#000',
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#FF00FF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#000000',
  },
});