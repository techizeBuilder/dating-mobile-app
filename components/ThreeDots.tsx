import React, { useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Pressable,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';

export default function ThreeDots({ userId, onReport }) {
    const [visible, setVisible] = useState(false);

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity onPress={() => setVisible(true)}>
                <Entypo name="dots-three-vertical" size={20} color="white" />
            </TouchableOpacity>

            {visible && (
                <>
                    {/* Dismiss Background */}
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => setVisible(false)}
                    />
                    {/* Dropdown Menu */}
                    <View style={styles.dropdown}>
                        <Pressable
                            style={styles.menuItem}
                            onPress={() => {
                                setVisible(false);
                                onReport(userId);
                            }}
                        >
                            <Text style={styles.menuText} numberOfLines={1} ellipsizeMode="tail">
                                Report User
                            </Text>

                        </Pressable>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        zIndex: 1000,
    },
    dropdown: {
        position: 'absolute',
        top: 28,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 6,
        paddingVertical: 4,
        paddingHorizontal: 12,
        elevation: 10,
        zIndex: 1001,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        minWidth: 120,
    },
    menuItem: {
        paddingVertical: 8,
    },
    menuText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
});
