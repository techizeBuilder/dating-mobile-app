import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Loading = () => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000000', '#1a1a1a', '#000000']}
                style={styles.background}
            >
                <Text style={styles.text}>Loading...</Text>
            </LinearGradient>
        </View>
    );
};

export default Loading;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontFamily: 'Orbitron-Bold',
        color: '#FF00FF',
        textShadowColor: '#00FFFF',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
});
