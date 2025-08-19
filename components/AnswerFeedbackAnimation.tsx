import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface Props {
    type: 'match' | 'mismatch' | null;
    trigger: boolean;
    onComplete?: () => void;
}

const emojis = {
    match: '🎉😍',
    mismatch: '😞💔',
};

const AnswerFeedbackAnimation: React.FC<Props> = ({ type, trigger, onComplete }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current; // Start a bit lower
    const scale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (trigger && type) {
            opacity.setValue(0);
            translateY.setValue(30);  // Start from lower
            scale.setValue(0);        // Start scale from 0

            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: -50,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Fade out and shrink after animation
                Animated.parallel([
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    onComplete?.();
                });
            });
        }
    }, [trigger, type]);

    if (!trigger || !type) return null;

    return (
        <Animated.Text
            style={[
                styles.emoji,
                {
                    opacity,
                    transform: [
                        { translateY },
                        { scale },
                    ],
                },
            ]}
        >
            {emojis[type]}
        </Animated.Text>
    );
};

export default AnswerFeedbackAnimation;

const styles = StyleSheet.create({
    emoji: {
        position: 'absolute',
        top: 100,
        alignSelf: 'center',
        fontSize: 60,
        zIndex: 99,
    },
});
