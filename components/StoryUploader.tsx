import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Modal } from 'react-native';
import { X, Upload, Camera as CameraIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface StoryUploaderProps {
    visible: boolean;
    onClose: () => void;
    onUpload: (image: { uri: string; type: string; fileName: string }) => void;
}

export default function StoryUploader({ visible, onClose, onUpload }: StoryUploaderProps) {
    const [selectedImage, setSelectedImage] = useState<{
        uri: string;
        type: string;
        fileName: string;
    } | null>(null);

    const handlePickImage = async (useCamera: boolean) => {
        try {
            let result;

            if (useCamera) {
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [9, 16],
                    quality: 1,
                });
            } else {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [9, 16],
                    quality: 1,
                });
            }

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];

                // Guess filename if missing
                const guessedFilename = asset.uri.split('/').pop() || 'story.jpg';
                const guessedType = asset.type || 'image/jpeg';

                setSelectedImage({
                    uri: asset.uri,
                    type: guessedType,
                    fileName: asset.fileName || guessedFilename,
                });
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const handleUpload = () => {
        if (selectedImage) {
            onUpload(selectedImage);
            setSelectedImage(null);
            onClose();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Add Moment</Text>
                        <Pressable style={styles.closeButton} onPress={onClose}>
                            <X size={24} color="#FF00FF" />
                        </Pressable>
                    </View>

                    {selectedImage ? (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
                            <Pressable style={styles.uploadButton} onPress={handleUpload}>
                                <Upload size={24} color="#000000" />
                                <Text style={styles.uploadButtonText}>Share Moment</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.optionsContainer}>
                            <Pressable
                                style={styles.option}
                                onPress={() => handlePickImage(false)}
                            >
                                <Upload size={32} color="#00ffff" />
                                <Text style={styles.optionText}>Upload from Gallery</Text>
                            </Pressable>

                            <Pressable
                                style={styles.option}
                                onPress={() => handlePickImage(true)}
                            >
                                <CameraIcon size={32} color="#00ffff" />
                                <Text style={styles.optionText}>Take Photo</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    content: {
        flex: 1,
        marginTop: 44,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 0, 255, 0.2)',
    },
    title: {
        fontFamily: 'Orbitron-Bold',
        fontSize: 24,
        color: '#FF00FF',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 0, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF00FF',
    },
    optionsContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        gap: 20,
    },
    option: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderWidth: 2,
        borderColor: '#00ffff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 12,
    },
    optionText: {
        fontFamily: 'Rajdhani-SemiBold',
        fontSize: 18,
        color: '#00ffff',
    },
    previewContainer: {
        flex: 1,
    },
    preview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    uploadButton: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: '#FF00FF',
        borderRadius: 28,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    uploadButtonText: {
        fontFamily: 'Rajdhani-SemiBold',
        fontSize: 18,
        color: '#000000',
    },
});