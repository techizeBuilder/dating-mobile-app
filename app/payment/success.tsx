import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PaymentStatusScreen() {
  const { status } = useLocalSearchParams();
  const router = useRouter();
  console.log("payments status : ", status)
  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <>
            {/* <View style={styles.iconContainer}>
          
              <Text style={[styles.title, { color: '#00FFFF' }]}>🎉</Text>
            </View> */}
            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.message}>
              Thank you for your purchase. Your transaction was completed successfully.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.buttonText}>Go to Home</Text>
            </TouchableOpacity>
          </>
        );

      case 'cancel':
        return (
          <>
            {/* <View style={[styles.iconContainer, { borderColor: '#FF00FF' }]}>
             
              <Text style={[styles.title, { color: '#FF00FF' }]}>⚠️</Text>
            </View> */}
            <Text style={styles.title}>Payment Cancelled</Text>
            <Text style={styles.message}>
              You have cancelled the payment. You can try again anytime.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </>
        );

      case 'failed':
        return (
          <>
            {/* <View style={[styles.iconContainer, { borderColor: '#FF00FF' }]}>
              
              <Text style={[styles.title, { color: '#FF00FF' }]}>❌</Text>
            </View> */}
            <Text style={styles.title}>Payment Failed</Text>
            <Text style={styles.message}>
              Oops! Something went wrong. Please try again.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Retry Payment</Text>
            </TouchableOpacity>
          </>
        );

      default:
        return (
          <>
            <Text style={styles.title}>Unknown Status</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF00FF',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 24,
    color: '#FF00FF',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  message: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
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
  buttonText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#000000',
  },
}); 
