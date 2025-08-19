import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CircleCheck as CheckCircle2, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  useSharedValue,
} from 'react-native-reanimated';

export default function VerificationSuccessScreen() {
  const scale1 = useSharedValue(0);
  const scale2 = useSharedValue(0);
  const scale3 = useSharedValue(0);
  const opacity1 = useSharedValue(1);
  const opacity2 = useSharedValue(1);
  const opacity3 = useSharedValue(1);

  useEffect(() => {
    // Start pulse animations
    const duration = 2000;
    scale1.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );
    opacity1.value = withRepeat(
      withSequence(
        withTiming(0, { duration }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );

    // Delayed second pulse
    scale2.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1.5, { duration }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );
    opacity2.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(0, { duration }),
          withTiming(1, { duration: 0 })
        ),
        -1,
        false
      )
    );

    // Delayed third pulse
    scale3.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1.5, { duration }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );
    opacity3.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(0, { duration }),
          withTiming(1, { duration: 0 })
        ),
        -1,
        false
      )
    );

    // Auto-navigate to home after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const pulseStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));

  const pulseStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  const pulseStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
    opacity: opacity3.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,0,255,0.2)', 'transparent', 'rgba(0,255,255,0.2)']}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle2 size={64} color="#39FF14" strokeWidth={1.5} />
          <View style={styles.sparkleLeft}>
            <Sparkles size={24} color="#FF00FF" />
          </View>
          <View style={styles.sparkleRight}>
            <Sparkles size={24} color="#00FFFF" />
          </View>
        </View>

        <Text style={styles.title}>Verification Successful!</Text>
        <Text style={styles.subtitle}>Welcome to NeonLove</Text>

        <View style={styles.pulseContainer}>
          <Animated.View style={[styles.pulse, pulseStyle1]} />
          <Animated.View style={[styles.pulse, pulseStyle2]} />
          <Animated.View style={[styles.pulse, pulseStyle3]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  sparkleLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [{ rotate: '-30deg' }],
  },
  sparkleRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    transform: [{ rotate: '30deg' }],
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 32,
    color: '#39FF14',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: '#39FF14',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: 'Rajdhani',
    fontSize: 24,
    color: '#FF00FF',
    textAlign: 'center',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  pulseContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  pulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#39FF14',
  },
});