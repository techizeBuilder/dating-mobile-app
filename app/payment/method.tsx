import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { API_BASE_URL } from '../apiUrl';
import { useUserProfile } from '../context/userContext';
import { useState } from 'react';

const paymentMethods = [
  {
    id: 'paypal',
    name: 'PayPal',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
  },
];

export default function PaymentMethodScreen() {
  const { planId, name, price } = useLocalSearchParams<{ planId: string; name: name; price: string }>();
  const { token } = useUserProfile()
  const [loading, setLoading] = useState<Boolean>(false)
  console.log("tokoen in payment : ", token);

  // Handle Payment - Post to Backend to Create PayPal Order
  const handlePayment = async (methodId: string) => {
    if (methodId === 'paypal') {
      try {
        // Post request to create PayPal order
        console.log("planId and amount to create order : ", planId, price)
        setLoading(true)
        const response = await axios.post(
          `${API_BASE_URL}/subscriptions/purchase`,
          {
            plan_id: planId,
            amount: parseFloat(price),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,

            }
          }
        );

        console.log("payment response : ", response)
        const { approvalUrl, status } = response.data;

        // Check if the order was created successfully
        if (status) {
          // Redirect the user to PayPal approval URL
          // router.push(approvalUrl);
          router.push({
            pathname: '/payment/paymentModal',
            params: { approvalUrl }
          });
        } else {
          console.error("Error: Payment order creation failed.");
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.log("Error during payment process:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FF00FF" />
        </Pressable>
        <Text style={styles.title}>Payment Method</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.planCard}>
          <Text style={styles.planName}>{name}</Text>
          <Text style={styles.planPrice}>${price}</Text>
        </View>

        {/* <Text style={styles.sectionTitle}>Select Payment Method</Text>

        {paymentMethods.map((method) => (
          <Pressable
            key={method.id}
            style={styles.methodButton}
            onPress={() => handlePayment(method.id)} // Pass selected method ID
          >
            <Image
              source={{ uri: method.logo }}
              style={styles.methodLogo}
              resizeMode="contain"
            />
            <Text style={styles.methodName}>{method.name}</Text>
          </Pressable>
        ))} */}

        <LinearGradient
          colors={['#FF00FF', '#D000FF', '#8000FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.payButtonGradient}
        >
          <Pressable onPress={() => handlePayment('paypal')}>
            <Text style={styles.payButtonText}>{loading ? "Loading..." : "Process to Pay"}</Text>
          </Pressable>
        </LinearGradient>

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
    fontSize: 24,
    color: '#FF00FF',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#03d7fc',
  },
  planName: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 20,
    color: '#FF00FF',
    marginBottom: 8,
  },
  planPrice: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 32,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#00FFFF',
    marginBottom: 16,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#03d7fc',
  },
  methodLogo: {
    width: 80,
    height: 32,
    marginRight: 16,
  },
  methodName: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  payButtonGradient: {
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
    borderRadius: 28,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    width: '100%',
  },
  payButtonText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: 'center',
    fontWeight: 'bold',
  }
});
