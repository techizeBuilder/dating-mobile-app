// components/GameStageModal.tsx
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

export default function GameStageModal({ onSelectStage, onClose, onSendInvite }: any) {
    return (
        <Modal transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Choose Game Stage</Text>

                    <Pressable onPress={() => onSelectStage('icebreakers')}>
                        <Text style={styles.option}>Icebreakers</Text>
                    </Pressable>

                    <Pressable onPress={onSendInvite} style={styles.startButton}>
                        <Text style={styles.startText}>Send Invite</Text>
                    </Pressable>

                    <Pressable onPress={onClose}>
                        <Text style={styles.close}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
    modal: { margin: 20, backgroundColor: 'white', borderRadius: 10, padding: 20 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    option: { padding: 10, fontSize: 16 },
    startButton: { backgroundColor: '#00FFFF', padding: 10, marginTop: 10, borderRadius: 5 },
    startText: { textAlign: 'center', color: '#000' },
    close: { textAlign: 'center', marginTop: 10, color: 'red' },
});
