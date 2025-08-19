import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useUserProfile } from '../context/userContext';
import { API_BASE_URL } from '../apiUrl';

export default function Subscriptions() {
    const router = useRouter();
    const { token, loading, setLoading } = useUserProfile();
    const [subscriptions, setSubscriptions] = useState([]);

    const fetchSubscriptions = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/subscriptions/my-subscription`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSubscriptions(res.data.subscriptions || []);
        } catch (err) {
            console.error('Failed to fetch subscriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft size={22} color="#FF00FF" />
                </TouchableOpacity>
                <Text style={styles.title}>My Subscriptions</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#00FFFF" style={{ marginTop: 50 }} />
            ) : subscriptions.length === 0 ? (
                <Text style={styles.noData}>You have no active subscriptions.</Text>
            ) : (
                <ScrollView style={styles.content}>
                    {subscriptions.map((sub, index) => (
                        <View key={index} style={styles.card}>
                            <Text style={styles.planName}>{sub.plan_name}</Text>
                            <Text style={styles.feature}>Price: ₹{sub.price}</Text>
                            <Text style={styles.feature}>Start: {new Date(sub.start_date).toDateString()}</Text>
                            <Text style={styles.feature}>End: {new Date(sub.end_date).toDateString()}</Text>
                            <Text style={styles.feature}>Remaining: {sub.days_remaining} days</Text>
                            <Text style={styles.feature}>Payment Method: {sub.payment_method}</Text>
                            <Text style={styles.feature}>Txn ID: {sub.transaction_id}</Text>

                            {sub.features?.length > 0 && (
                                <View style={styles.featureList}>
                                    {sub.features.map((f, i) => (
                                        <Text key={i} style={styles.featureItem}>• {f}</Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 30,
    },
    backButton: {
        padding: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF00FF',
    },
    title: {
        fontSize: 24,
        color: '#FF00FF',
        fontFamily: 'Orbitron-Bold',
        textShadowColor: '#FF00FF',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    content: {
        flex: 1,
    },
    noData: {
        color: '#ccc',
        textAlign: 'center',
        marginTop: 50,
        fontFamily: 'Rajdhani-Regular',
    },
    card: {
        borderWidth: 1,
        borderColor: '#03d7fc',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        backgroundColor: 'rgba(3, 215, 252, 0.05)',
    },
    planName: {
        fontSize: 24,
        color: '#FF00FF',
        fontFamily: 'Orbitron-Bold',
        marginBottom: 12,
    },
    feature: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Rajdhani-Regular',
        marginBottom: 4,
    },
    featureList: {
        marginTop: 10,
        paddingLeft: 10,
    },
    featureItem: {
        fontSize: 14,
        color: '#00FFFF',
        fontFamily: 'Rajdhani-Regular',
        marginBottom: 2,
    },
});
