import { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { Heart, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SplashScreenProps {
  onComplete: () => void;
}

const { width } = Dimensions.get('window');

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const logoScale = new Animated.Value(0);
  const logoRotate = new Animated.Value(0);
  const logoOpacity = new Animated.Value(0);
  const textPosition = new Animated.Value(width);
  const gradientOpacity = new Animated.Value(0);
  const sparkleOpacity1 = new Animated.Value(0);
  const sparkleOpacity2 = new Animated.Value(0);
  const sparkleScale1 = new Animated.Value(0);
  const sparkleScale2 = new Animated.Value(0);

  useEffect(() => {
    // Create pulse animation for sparkles
    const createPulseAnimation = (opacity: Animated.Value, scale: Animated.Value) => {
      return Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.8,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    // Sequence of animations
    Animated.sequence([
      // Fade in gradient
      Animated.timing(gradientOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Logo animation
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      // Text slide in
      Animated.spring(textPosition, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Start sparkle animations
      createPulseAnimation(sparkleOpacity1, sparkleScale1).start();
      setTimeout(() => {
        createPulseAnimation(sparkleOpacity2, sparkleScale2).start();
      }, 500);

      // Delay before completing
      setTimeout(onComplete, 2000);
    });
  }, []);

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.gradient, { opacity: gradientOpacity }]}>
        <LinearGradient
          colors={[
            'rgba(255,0,255,0.2)',
            'transparent',
            'rgba(0,255,255,0.2)',
          ]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.sparkleContainer,
            styles.sparkleTop,
            {
              opacity: sparkleOpacity1,
              transform: [{ scale: sparkleScale1 }],
            },
          ]}
        >
          <Sparkles size={24} color="#FF00FF" />
        </Animated.View>

        <Animated.View
          style={[
            styles.sparkleContainer,
            styles.sparkleBottom,
            {
              opacity: sparkleOpacity2,
              transform: [{ scale: sparkleScale2 }],
            },
          ]}
        >
          <Sparkles size={24} color="#00FFFF" />
        </Animated.View>

        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: logoScale },
                { rotate: spin },
              ],
              opacity: logoOpacity,
            },
          ]}
        >
          <Image
            source={require('../assets/images/logobg.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 32,
    color: '#FF00FF',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  sparkleContainer: {
    position: 'absolute',
    width: 24,
    height: 24,
  },
  sparkleTop: {
    top: -60,
    right: -40,
  },
  sparkleBottom: {
    bottom: -60,
    left: -40,
  },
});