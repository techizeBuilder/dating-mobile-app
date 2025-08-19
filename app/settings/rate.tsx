import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

import { API_BASE_URL } from '../apiUrl';
import { useUserProfile } from '../context/userContext';

export default function RateScreen() {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const { token } = useUserProfile();
  const [loading, setLoading] = useState(false);

  const handleSubmitRating = async () => {
    if (!selectedRating) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/profile/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: selectedRating, feedback }),
      });

      const data = await res.json();
      console.log('Rate response:', data);

      if (res.ok && data.status) {
        Toast.show({
          type: 'success',
          text1: 'Thanks for your feedback!',
          text2: 'Your rating has been submitted.',
          position: 'top',
        });
        router.back();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Rating Failed',
          text2: data.message || 'Could not submit your feedback.',
          position: 'top',
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Rating error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.',
        position: 'top',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FF00FF" />
        </Pressable>
        <Text style={styles.title}>Rate App</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.message}>
          Enjoying NeonLove? Let us know how we're doing!
        </Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <Pressable key={rating} onPress={() => setSelectedRating(rating)}>
              <Star
                size={48}
                color={rating <= selectedRating ? '#FFD700' : '#333333'}
                fill={rating <= selectedRating ? '#FFD700' : 'none'}
              />
            </Pressable>
          ))}
        </View>

        <Text style={styles.ratingText}>
          {selectedRating > 0
            ? ['Poor', 'Fair', 'Good', 'Great!', 'Excellent!'][selectedRating - 1]
            : 'Tap a star to rate'}
        </Text>

        {/* Gradient Feedback Input */}
        <LinearGradient colors={["#FF00FF", "#00FFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }} style={styles.gradientBorder}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Write your feedback here..."
              placeholderTextColor="#999"
              multiline
              value={feedback}
              onChangeText={setFeedback}
            />
          </View>
        </LinearGradient>

        {/* Gradient Submit Button */}
        {/* Gradient Submit Button */}
        <Pressable
          onPress={handleSubmitRating}
          disabled={!selectedRating}
          style={{
            width: '100%',
            opacity: !selectedRating ? 0.5 : 1,
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
            }}
          >
            <Text style={{
              fontFamily: 'Rajdhani-SemiBold',
              fontSize: 19,
              color: '#FFFFFF',
            }}>
              {loading ? "Submitting" : "Submit Rating"}
            </Text>
          </LinearGradient>
        </Pressable>

      </View>
    </View >
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  ratingText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 20,
    color: '#FFD700',
    marginBottom: 32,
  },
  feedbackInput: {
    minHeight: 100,
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontFamily: 'Rajdhani',
    fontSize: 16,
  },

  submitButton: {
    backgroundColor: '#FF00FF',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#FFFFFF', // Changed from black to white
  },

  gradientBorder: {
    borderRadius: 14,
    padding: 2,
    width: '100%',
    marginBottom: 24,
  },

  inputWrapper: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },


  submitButtonGradient: {
    borderRadius: 20,
    padding: 2,
    width: '100%',
  },

  pressableInsideGradient: {
    borderRadius: 18,
    backgroundColor: '#000',
    paddingVertical: 14,
    alignItems: 'center',
  },

});