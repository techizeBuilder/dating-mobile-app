import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PayPalWebViewScreen() {
    const { approvalUrl } = useLocalSearchParams(); // Correct way to get params in expo-router
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    if (!approvalUrl) {
        // agar approvalUrl missing hai, toh back kar do
        router.back();
        return null;
    }

    return (
        <View style={{ flex: 1 }}>
            {loading && (
                <ActivityIndicator
                    size="large"
                    color="#FF00FF"
                    style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -25, marginTop: -25 }}
                />
            )}
            <WebView
                source={{ uri: approvalUrl }}
                onLoadEnd={() => setLoading(false)}
                onNavigationStateChange={(navState) => {
                    if (navState.url.includes('success')) {
                        router.push({
                            pathname: "/payment/success",
                            params: { status: "success" }
                        });
                    } else if (navState.url.includes('cancel')) {
                        router.push({
                            pathname: "/payment/success",
                            params: { status: "cancel" }
                        });
                    } else if (navState.url.includes('failed')) {
                        router.push({
                            pathname: "/payment/success",
                            params: { status: "failed" }
                        });
                    }
                }}
            />
        </View>
    );
}
