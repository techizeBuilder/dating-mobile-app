import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../apiUrl';
import Toast from 'react-native-toast-message';
import { useUserProfile } from '../context/userContext';

export default function VerifyScreen() {
  const { mode } = useLocalSearchParams<{ mode: 'login' | 'signup' }>();
  const { mobile } = useLocalSearchParams<{ mobile }>();
  const { country_code } = useLocalSearchParams<{ country_code }>();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null]);
  const { login } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if text is entered
    if (text && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.join('').length === 4) {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',

          },
          body: JSON.stringify({
            mobile,
            otp: otp.join(''),
          }),
        });

        const data = await response.json();
        console.log("verify otp res:", data);

        if (data.status === true) {


          // Success Toast
          Toast.show({
            type: 'success',
            text1: 'OTP Verified',
            text2: 'You have successfully verified your OTP.',
            position: 'top',
          });
          // Assuming you get the user data and token after OTP verification
          const { user, token } = data.data;

          // Store user and token in context and AsyncStorage
          await login({ userData: user, token });

          console.log("login and signup res after otp verified : ", data)

          // Navigate after login and signup
          if (data.data.user.isProfileComplete === false) {
            router.replace({
              pathname: '/auth/gender',
              params: { mobile, country_code },
            });
          } else {
            router.replace('/auth/verification-success');
          }


        } else {
          // Error Toast if OTP verification fails
          Toast.show({
            type: 'error',
            text1: 'OTP Verification Failed',
            text2: 'The OTP you entered is incorrect. Please try again.',
            position: 'top',
          });
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('Error verifying OTP:', error);

        // Error Toast if there's a network error
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: 'An error occurred while verifying your OTP. Please try again.',
          position: 'top',
        });
      }
    }
  };

  const handleResendOTP = () => {
    if (timeLeft === 0) {
      setTimeLeft(60);
      // Simulate resending OTP
      setOtp(['', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={24} color="#FF00FF" />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          Enter the verification code we sent to your phone
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <LinearGradient
              key={index}
              colors={["#FF00FF", "#00FFFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.otpGradientBorder}
            >
              <View style={styles.otpInner}>
                <TextInput
                  ref={ref => inputRefs.current[index] = ref}
                  style={styles.otpInput}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                      inputRefs.current[index - 1]?.focus();
                    }
                  }}
                />
              </View>
            </LinearGradient>
          ))}
        </View>


        <Pressable
          onPress={handleVerify}
          disabled={otp.join('').length < 4}
          style={{
            width: '100%',
            opacity: otp.join('').length < 4 ? 0.5 : 1,
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
              {isLoading ? "Loading..." : "Verify"}
            </Text>
          </LinearGradient>
        </Pressable>


        <Pressable
          style={[styles.resendButton, timeLeft > 0 && styles.resendButtonDisabled]}
          onPress={handleResendOTP}
          disabled={timeLeft > 0}
        >
          <Text style={[styles.resendText, timeLeft > 0 && styles.resendTextDisabled]}>
            {timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'Resend code'}
          </Text>
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
  otpContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  otpInput: {
    width: 56,
    height: 50,
    borderWidth: 2,
    borderColor: '#FF00FF',
    borderRadius: 12,
    color: '#fff',
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 24,
    textAlign: 'center',
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
  otpGradientBorder: {
    borderRadius: 14,
    padding: 2,
  },
  otpInner: {
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  otpInput: {
    width: 56,
    height: 56,
    color: '#fff',
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 24,
    textAlign: 'center',
  },

});