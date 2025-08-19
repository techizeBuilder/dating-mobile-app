import { useModal } from '@/app/context/modalContext';
import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // ✅ Import

const GamePopupModal = () => {
    const { modalVisible, modalContent, hideModal } = useModal();

    if (!modalContent) return null;

    return (
        <Modal
            transparent={true}
            visible={modalVisible}
            onRequestClose={hideModal}
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{modalContent.title}</Text>
                    <Text style={styles.modalMessage}>{modalContent.message}</Text>

                    <View style={styles.buttonContainer}>
                        {modalContent.buttons?.map((button, index) => {
                            const isGradient = !button.style; // Only apply gradient for default

                            return (
                                <Pressable
                                    key={index}
                                    style={styles.buttonWrapper}
                                    onPress={() => {
                                        button.onPress();
                                        hideModal();
                                    }}
                                >
                                    {isGradient ? (
                                        <LinearGradient
                                            colors={["#FF00FF", "#00FFFF"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.gradientButton}
                                        >
                                            <Text style={styles.buttonText}>{button.text}</Text>
                                        </LinearGradient>
                                    ) : (
                                        <View
                                            style={[
                                                styles.button,
                                                button.style === 'cancel' && styles.cancelButton,
                                                button.style === 'destructive' && styles.destructiveButton,
                                            ]}
                                        >
                                            <Text style={styles.buttonText}>{button.text}</Text>
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
};


const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#00ffff',
    },
    modalTitle: {
        fontFamily: 'Orbitron-Bold',
        fontSize: 20,
        color: '#FF00FF',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        fontFamily: 'Rajdhani',
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
        minWidth: 100,
    },

    gradientButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
    },

    button: {
        backgroundColor: '#8000FF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
    },

    cancelButton: {
        backgroundColor: '#333333',
    },

    destructiveButton: {
        backgroundColor: '#FF3B30',
    },

    buttonText: {
        fontFamily: 'Rajdhani-SemiBold',
        fontSize: 16,
        color: '#FFFFFF',
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },

});

export default GamePopupModal;
