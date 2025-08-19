import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Pressable,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserProfile } from '../context/userContext';
import { API_BASE_URL } from '../apiUrl';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons'; // ← Import icon

export default function ReportUserScreen() {
    const { id: reported_user } = useLocalSearchParams();
    const { token } = useUserProfile();

    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReport = async () => {
        if (!reason.trim() || !description.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in all fields.',
            });
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/user/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                   
                },
                body: JSON.stringify({
                    reported_user,
                    reason,
                    description,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to report user');
            }

            Toast.show({
                type: 'success',
                text1: 'Report submitted',
                text2: 'User has been reported successfully.',
            });
            setReason('');
            setDescription('');
            router.push("/(tabs)/chats");
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.card}>
                <Text style={styles.heading}>🚨 Report User</Text>
                <Text style={styles.subtext}>User ID: {reported_user}</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Reason (e.g. Abusive language)"
                    placeholderTextColor="#aaa"
                    value={reason}
                    onChangeText={setReason}
                />

                <TextInput
                    style={[styles.input, { height: 120 }]}
                    placeholder="Describe the incident..."
                    placeholderTextColor="#aaa"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#FF00FF" />
                ) : (
                    <Pressable onPress={handleReport} style={styles.buttonWrapper}>
                        <LinearGradient
                            colors={['#FF00FF', '#8A2BE2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Submit Report</Text>
                        </LinearGradient>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 20,
        paddingTop: 50,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
    },
    card: {
        marginTop: 30,
        backgroundColor: '#111',
        padding: 24,
        borderRadius: 12,
        shadowColor: '#FF00FF',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 10,
    },
    subtext: {
        color: '#888',
        fontSize: 13,
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: 14,
        borderRadius: 8,
        borderColor: '#333',
        borderWidth: 1,
        marginBottom: 16,
        fontSize: 16,
    },
    buttonWrapper: {
        marginTop: 8,
        borderRadius: 25,
        overflow: 'hidden',
    },
    button: {
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 25,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
