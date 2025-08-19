import React, { useState, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, Alert, View } from 'react-native';
import { Video, PhoneOff } from 'lucide-react-native';
import { createAgoraRtcEngine } from 'react-native-agora';
import { useUserProfile } from '@/app/context/userContext';
import { useSocket } from '@/app/context/socketContext';
import { useRouter } from 'expo-router';
import { AGORA_APP_ID } from '@/app/apiUrl';
import { useAgora } from '@/app/context/agoraContext';

const VideoCallButton = ({ receiver }) => {
    const { user } = useUserProfile();
    const { socket } = useSocket();
    const { setEngine } = useAgora();
    const router = useRouter();
    const [callState, setCallState] = useState<'idle' | 'calling' | 'ongoing'>('idle');
    const tempEngine = useRef(null);

    useEffect(() => {
        console.log("receiver in vdo call btn : ", receiver);
    }, [receiver]);

    useEffect(() => {
        console.log("user in vdo call btn : ", user);
    }, [user]);

    const initAgora = async () => {
        try {
            const engine = createAgoraRtcEngine();
            await engine.initialize({ appId: AGORA_APP_ID });
            await engine.enableVideo();
            await engine.setChannelProfile(1);
            setEngine(engine);
            tempEngine.current = engine;
            return engine;
        } catch (error) {
            console.error('Agora init error:', error);
            return null;
        }
    };

    const cleanupListeners = () => {
        socket.off('call-busy');
        socket.off('user-offline');
        socket.off('call-accepted');
        socket.off('call-rejected');
    };

    const endCall = async () => {
        cleanupListeners();
        if (callState === 'idle') return;

        if (tempEngine.current) {
            try {
                await tempEngine.current.leaveChannel();
                tempEngine.current.release();
            } catch (e) {
                console.warn('Agora cleanup failed:', e);
            }
            setEngine(null);
            tempEngine.current = null;
        }

        socket.emit('end-call', { from: user?._id, to: receiver?.id });
        setCallState('idle');
    };

    const startCall = async () => {
        if (!receiver?.id || !user?._id) {
            Alert.alert('Error', 'User info missing');
            return;
        }

        const channelName = `${user._id}-${receiver.id}-${Date.now()}`;
        console.log("Starting call - channel:", channelName);

        setCallState('calling');

        const engine = await initAgora();
        if (!engine) {
            setCallState('idle');
            return;
        }

        socket.emit('call-user', {
            from: user._id,
            to: receiver.id,
            channelName,
            callType: 'video',
        });

        socket.once('call-busy', () => {
            Alert.alert('User Busy', `${receiver.name} is already in a call`);
            endCall();
        });

        socket.once('user-offline', () => {
            Alert.alert('User Offline', `${receiver.name} is not available`);
            endCall();
        });

        socket.once('call-rejected', () => {
            Alert.alert('Call Rejected', `${receiver.name} declined your call`);
            endCall();
        });

        socket.once('call-accepted', async ({ channelName }) => {
            try {
                await engine.joinChannel(null, channelName, null, 0);
                setCallState('ongoing');
                router.push({
                    pathname: 'video/VideoCallScreen',
                    params: { channelName, otherUserId: receiver?.id },
                });
            } catch (error) {
                console.error('Error joining channel:', error);
                endCall();
            }
        });
    };

    useEffect(() => {
        const handleCallEnded = () => {
            Alert.alert('Call Ended', 'The other user ended the call');
            endCall();
        };

        socket.on('call-ended', handleCallEnded);
        return () => socket.off('call-ended', handleCallEnded);
    }, [socket]);

    useEffect(() => {
        if (!user?._id) return;

        const handleIncomingCall = async ({ from, to, channelName }) => {
            console.log('[Incoming Call] Event received:', { from, to, currentUser: user._id });

            if (user._id !== to) {
                console.warn('[Incoming Call] Skipped: to !== current user');
                return;
            }

            const engine = await initAgora();
            if (!engine) {
                console.error('Agora init failed on incoming call');
                return;
            }

            Alert.alert(
                'Incoming Call',
                `User ${from} is calling you`,
                [
                    {
                        text: 'Reject',
                        onPress: () => {
                            socket.emit('reject-call', { from, to: user._id });
                            engine.release();
                            setEngine(null);
                        },
                        style: 'destructive',
                    },
                    {
                        text: 'Accept',
                        onPress: async () => {
                            try {
                                await engine.joinChannel(null, channelName, null, 0);
                                socket.emit('accept-call', { from, to: user._id, channelName });
                                setCallState('ongoing');
                                router.push({
                                    pathname: 'video/VideoCallScreen',
                                    params: { channelName, otherUserId: from },
                                });
                            } catch (err) {
                                console.error('Error joining channel:', err);
                                engine.release();
                                setEngine(null);
                            }
                        },
                    },
                ]
            );
        };

        socket.on('incoming-call', handleIncomingCall);
        return () => {
            socket.off('incoming-call', handleIncomingCall);
        };
    }, [socket, user?._id]);


    if (!user) return null; // Optional: render nothing if user is not ready

    return (
        <View style={styles.container}>
            <Pressable onPress={startCall} disabled={callState !== 'idle'}>
                <Video size={24} color={callState === 'idle' ? '#FF00FF' : 'gray'} />
                <Text style={styles.text}>Video</Text>
            </Pressable>

            {callState !== 'idle' && (
                <Pressable onPress={endCall} style={styles.endButton}>
                    <PhoneOff size={20} color="white" />
                    <Text style={styles.endText}>End</Text>
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    text: { fontFamily: 'Rajdhani', fontSize: 12, color: '#FFFFFF', marginTop: 4 },
    endButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'red',
        padding: 8,
        borderRadius: 20,
        gap: 4,
    },
    endText: { color: 'white', fontFamily: 'Rajdhani', fontSize: 12 },
});

export default VideoCallButton;
