import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { API_BASE_URL } from '../apiUrl';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

import { CountryPicker } from 'react-native-country-codes-picker';
import { TouchableOpacity } from 'react-native';


export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [showPicker, setShowPicker] = useState(false);


  const handleLoginwithNumber = async () => {
    console.log(`${countryCode}${phoneNumber}`)

    try {
      setIsLoading(true)
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

        },
        body: JSON.stringify({ mobile: phoneNumber, countryCode: countryCode }),
        // body: JSON.stringify({ mobile: `${countryCode}${phoneNumber}` }),
      });

      const data = await res.json();

      console.log('Login rsponse:', data);
      if (data.status) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'Please check your phone for the OTP.',
          position: 'top',
        })
        router.push({
          pathname: '/auth/verify',
          params: { mode: 'login', mobile: phoneNumber, country_code: countryCode }
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: data.errors[0].message,
          position: 'top',
        })
      }
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'An error occurred while sending OTP. Please try again.',
        position: 'top',
      })
    }
  };

  const handleLoginSuccess = (provider: any, token: string) => {
    console.log(`Logged in with ${provider}:`, token);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={24} color="#FF00FF" />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>


        <LinearGradient
          colors={["#FF00FF", "#00FFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.inputGradientBorder}
        >
          <View style={styles.inputBackgroundFix}>
            <View style={styles.phoneInputWrapper}>
              <TouchableOpacity style={styles.countryCodeButton} onPress={() => setShowPicker(true)}>
                <Text style={styles.countryCodeText}>{countryCode}</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.phoneInput}
                placeholder="Phone Number"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={15}
              />
              <CountryPicker
                show={showPicker}
                pickerButtonOnPress={(item) => {
                  setCountryCode(item.dial_code);
                  setShowPicker(false);
                }}
                lang="en"
              />

            </View>

          </View>
        </LinearGradient>

        <Pressable
          onPress={handleLoginwithNumber}
          disabled={phoneNumber.length < 10 || isLoading}
          style={{
            width: '100%',
            opacity: phoneNumber.length < 10 || isLoading ? 0.5 : 1,
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
              fontSize: 19,
              color: '#FFFFFF',
            }}>
              {isLoading ? "Loading..." : "Continue with Phone"}
            </Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signupText}>Sign Up</Text>
          </Pressable>
        </View>
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
    marginTop: -90,
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 32,
    color: '#FF00FF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: 'Rajdhani',
    fontSize: 18,
    color: '#00FFFF',
    marginBottom: 32,
    textAlign: 'center',
  },
  socialButtons: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#03d7fc',
  },
  appleButton: {
    backgroundColor: '#000',
    borderColor: '#FFF',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  appleIcon: {
    tintColor: '#FFF',
  },
  socialButtonText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#03d7fc',
  },
  appleButtonText: {
    color: '#FFF',
  },
  divider: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 0, 255, 0.3)',
  },
  dividerText: {
    fontFamily: 'Rajdhani',
    fontSize: 16,
    color: '#FF00FF',
    marginHorizontal: 16,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 26,
    paddingHorizontal: 10,
    backgroundColor: '#000',
  },

  countryCodeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },

  countryCodeText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Rajdhani-SemiBold',
  },

  phoneInput: {
    flex: 1,
    color: '#fff',
    paddingHorizontal: 12,
    fontSize: 18,
    fontFamily: 'Rajdhani-SemiBold',
  },

  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputBackgroundFix: {
    borderRadius: 26,
    backgroundColor: '#000',
    padding: 0,
    overflow: 'hidden',
  },
  inputGradientBorder: {
    borderRadius: 28,
    padding: 2,
    marginBottom: 24,
    width: "100%"
  },

  inputInnerWrapper: {
    borderRadius: 26,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },

  input: {
    height: 56,
    borderWidth: 0,
    borderRadius: 26,
    color: '#fff',
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
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
  footer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  footerText: {
    fontFamily: 'Rajdhani',
    fontSize: 16,
    color: '#FFF',
  },
  signupText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 16,
    color: '#FF00FF',
  },
});