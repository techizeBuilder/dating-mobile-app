
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

type GradientInputProps = {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: "default" | "select";
    hasError?: boolean;
};

const GradientInput = ({ children, style, variant = "default", hasError }: GradientInputProps) => {
    const colors =
        hasError
            ? ["#FF0000", "#FF00FF"]
            : variant === "select"
                ? ["#06bdbd", "#06bdbd"]
                : ["#FF00FF", "#00FFFF"];

    return (
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientBorder, style]}
        >
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientBorder: {
        padding: 2,
        borderRadius: 24,
        marginBottom: 10,
    },
});

export default GradientInput;
