import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Image, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Smile, Image as ImageIcon, X, Paperclip } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import EmojiPicker from '@/components/EmojiPicker';
import { API_BASE_URL, SOCKET_BASE_URL } from '../apiUrl';
import { useUserProfile } from '../context/userContext';

import ThreeDots from '@/components/ThreeDots';
import Loading from '@/components/Loading';
import { useSocket } from '../context/socketContext';
import { fixImageUrl } from '../utils/fixImageUrl';


interface Message {
  _id: string;
  message: string;
  image?: string;
  type: 'text' | 'image';
  sender_id: string;
  receiver_id: string;
  timestamp: string;
  read: boolean;
}

export default function ChatScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { token, user: userProfile } = useUserProfile()
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const { socket, onlineUsers } = useSocket();

  console.log("userProfile in /chat:id page : ", userProfile)

  // Update the useEffect hook for socket events
  useEffect(() => {
    if (!userProfile?._id || !socket) return;
    const fetchData = async () => {
      try {
        setLoading(true)
        const [resUser, resMessages] = await Promise.all([
          fetch(`${API_BASE_URL}/user/details/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,

            },
          }),
          fetch(`${API_BASE_URL}/chat/history/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,

            },
          }),
        ]);

        const [userData, historyData] = await Promise.all([
          resUser.json(),
          resMessages.json(),
        ]);

        setUser(userData?.user);
        setMessages(
          historyData?.messages?.map((msg: any) => ({
            _id: msg._id,
            message: msg.message,
            image: msg.file_url ?? undefined,
            type: msg.type || (msg.file_url ? 'image' : 'text'), // Fallback if type missing
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id,
            timestamp: msg.timestamp,
            read: msg.read,
          })) || []
        );

        console.log("msg history : ", historyData)
        // Mark messages as read when they're initially loaded
        if (!userProfile?._id) return;
        historyData?.messages?.forEach(msg => {
          if (
            msg?._id &&
            msg?.sender_id &&
            !msg.read &&
            msg?.sender_id !== userProfile?._id
          ) {
            socket?.emit('messageRead', {
              messageId: msg._id,
              readerId: userProfile._id,
              senderId: msg.sender_id,
            });

            // Immediately update local state to show ✔✔
            setMessages(prev =>
              prev.map(m =>
                m._id === msg._id ? { ...m, read: true } : m
              )
            );
          }
        });
        setLoading(false)

      } catch (err) {
        console.error('Failed to load chat data:', err);
      } finally {
        setLoading(false);
      }
    };


    // Receive messages
    socket.on('receiveMessage', (newMsg: any) => {
      console.log("new msg : ", newMsg)
      if (!newMsg._id) {
        console.error('Received message without ID:', newMsg);
        return;
      }
      const incomingMessage: Message = {
        _id: newMsg._id,
        message: newMsg.message,
        image: newMsg.file_url ?? undefined,
        type: newMsg.type || (newMsg.file_url ? 'image' : 'text'),
        sender_id: newMsg.sender_id,
        receiver_id: newMsg.receiver_id,
        timestamp: new Date(newMsg.timestamp).toISOString(),
        read: newMsg.read || false,
      };

      setMessages(prev => [...prev, incomingMessage]);

      // Mark as read if it's our message and we're viewing the chat
      if (
        incomingMessage.receiver_id === userProfile._id &&
        !incomingMessage.read &&
        userProfile?._id &&
        incomingMessage.sender_id
      ) {
        socket.emit('messageRead', {
          messageId: incomingMessage._id,
          readerId: userProfile._id,
          senderId: incomingMessage.sender_id
        });

        // Instant ✔✔ update
        setMessages(prev =>
          prev.map(msg =>
            msg._id === incomingMessage._id ? { ...msg, read: true } : msg
          )
        );
      }

      scrollViewRef.current?.scrollToEnd({ animated: true });
    });

    // Handle read status updates
    socket.on('messageReadUpdate', ({ messageId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      );
    });

    fetchData();

    return () => {
      socket.off('receiveMessage');
      socket.off('messageReadUpdate');
    };


  }, [id, token, userProfile?._id]);


  // Update the messageRead handler to include proper message marking
  const handleMessageRead = (msgId: string, msgSenderId: string) => {
    if (!msgId || !msgSenderId || msgSenderId === userProfile._id) return;
    console.log('Marking message as read:', msgId, msgSenderId);

    if (msgSenderId !== userProfile._id) {

      // Find using _id
      const messageToMark = messages.find(msg => msg._id === msgId);
      if (messageToMark && messageToMark.receiver_id === userProfile._id) {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === msgId ? { ...msg, read: true } : msg
          )
        );

        // Emit to server
        socket.emit('messageRead', {
          messageId: msgId,
          readerId: userProfile._id,
          senderId: msgSenderId
        });
      }
    }
  };

  const handleSend = async () => {
    if (message.trim()) {
      const tempId = Date.now().toString();

      const newMessage: Message = {
        _id: tempId,
        message: message,
        sender_id: userProfile._id,
        receiver_id: id,
        read: false,
        type: 'text', // ✅ ADD THIS
        timestamp: new Date().toISOString(),
      };


      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      scrollViewRef.current?.scrollToEnd({ animated: true });

      try {
        const res = await fetch(`${API_BASE_URL}/chat/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,

          },
          body: JSON.stringify({
            receiver_id: id,
            type: 'text',
            message: message,
          }),
        });

        const data = await res.json();

        if (data?.message?._id) {
          setMessages(prev => prev.map(msg =>
            msg._id === tempId ? {
              ...msg,
              _id: data.message._id,
              read: data.message.read,
              type: data.message.type || 'text',
            } : msg
          ));
        }

      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };


  const handleAttachment = async (type: 'camera' | 'gallery' | 'document') => {
    setShowAttachments(false);
    let result;

    if (type === 'gallery') {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
    } else if (type === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
    }

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileName = asset.fileName || `image_${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append('receiver_id', id);
      formData.append('type', 'image');
      formData.append('message', asset.fileName || 'image.jpg');
      formData.append('file', {
        uri: asset.uri,
        name: fileName,
        type: 'image/jpeg', // Always use correct MIME type for images
      } as any);

      console.log("file to send chat")
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const preloadImage = (uri: string) => {
        return Image.prefetch(uri)
          .then(() => true)
          .catch(() => false);
      };


      try {
        const response = await fetch(`${API_BASE_URL}/chat/send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,

          },
          body: formData,
        });

        console.log("file send response -", response)
        const data = await response.json();



        if (data?.message?._id) {
          const imageLoaded = await preloadImage(data.message.file_url);
          const newMessage: Message = {
            _id: data.message._id,
            message: data.message.message,
            image: data.message.file_url,
            type: 'image',
            sender_id: data.message.sender_id,
            receiver_id: data.message.receiver_id,
            read: data.message.read,
            timestamp: data.message.timestamp,
          };

          setMessages(prev => [...prev, newMessage]);
          scrollViewRef.current?.scrollToEnd({ animated: true });
          // 🔥 Emit read manually if receiver is the current user
          if (
            newMessage.receiver_id === userProfile._id &&
            !newMessage.read &&
            newMessage.sender_id !== userProfile._id
          ) {
            socket.emit('messageRead', {
              messageId: newMessage._id,
              readerId: userProfile._id,
              senderId: newMessage.sender_id
            });

            setMessages(prev =>
              prev.map(msg =>
                msg._id === newMessage._id ? { ...msg, read: true } : msg
              )
            )
          }
        }
      } catch (err) {
        console.error('Failed to send image message:', err);
      }
    }
  };


  if (loading) {
    return (
      <Loading />
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FF00FF" />
        </Pressable>

        {user.profile_image ? (
          <Image source={{ uri: fixImageUrl(user?.profile) }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {user.name ? user.name.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>
        )}

        <View style={styles.headerInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.statusIndicator}>
            <View style={[
              styles.statusDot,
              { backgroundColor: onlineUsers.includes(id) ? '#4CAF50' : '#9E9E9E' }
            ]} />
            <Text style={styles.statusText}>
              {onlineUsers.includes(id) ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <View>
          <ThreeDots userId={id} onReport={(userId) => router.push(`/report/${userId}`)} />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        onScroll={({ nativeEvent }) => {
          // Mark messages as read when they become visible
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isNearBottom = contentOffset.y >= contentSize.height - layoutMeasurement.height - 50;

          if (isNearBottom) {
            messages.forEach(msg => {
              if (!msg.read && msg.sender_id !== userProfile._id && msg.receiver_id === userProfile._id) {
                handleMessageRead(msg._id, msg.sender_id);
              }
            });
          }
        }}
        scrollEventThrottle={400}
      >
        {messages.map((msg) => (

          <View
            key={msg._id}
            style={
              [
                styles.messageWrapper,
                msg.receiver_id === id ? styles.userMessage : styles.otherMessage
              ]}
            onTouchEnd={() => handleMessageRead(msg._id, msg.sender_id)}
          >
            {msg.type === "text" ? (
              <Text style={styles.messageText}>{msg.message}</Text>
            ) : (
              <Image source={{ uri: fixImageUrl(msg.image) }} style={styles.messageImage} />
            )}
            <View style={styles.metaRow}>
              <Text style={styles.timestamp}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              {msg?.sender_id === userProfile?._id && (
                <Text style={{ marginLeft: 10, fontSize: 9 }}>
                  {msg?.read ? '✔✔' : '✔'}
                </Text>
              )}
            </View>
          </View>
        ))
        }
      </ScrollView >

      <View style={styles.inputContainer}>
        <Pressable
          style={styles.attachButton}
          onPress={() => setShowAttachments(true)}
        >
          <Paperclip size={24} color="#FF00FF" />
        </Pressable>

        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          multiline
        />

        <Pressable
          style={styles.emojiButton}
          onPress={() => setShowEmojiPicker(true)}
        >
          <Smile size={24} color="#FF00FF" />
        </Pressable>

        <Pressable
          style={[styles.sendButton, !message && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message}
        >
          <Send size={24} color={message ? '#000' : '#666'} />
        </Pressable>
      </View>

      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
      </Modal>

      <Modal
        visible={showAttachments}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachments(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAttachments(false)}
        >
          <View style={styles.attachmentsMenu}>
            <Text style={styles.attachmentsTitle}>Share Content</Text>

            <Pressable
              style={styles.attachmentOption}
              onPress={() => handleAttachment('camera')}
            >
              <Text style={styles.attachmentText}>Camera</Text>
            </Pressable>

            <Pressable
              style={styles.attachmentOption}
              onPress={() => handleAttachment('gallery')}
            >
              <Text style={styles.attachmentText}>Photo & Video Library</Text>
            </Pressable>

            <Pressable
              style={styles.attachmentOption}
              onPress={() => handleAttachment('document')}
            >
              <Text style={styles.attachmentText}>Document</Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowAttachments(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    position: 'relative',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 0, 255, 0.2)',
  },
  backButton: {
    marginRight: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 12,
    borderColor: '#FF00FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    color: '#fff', // Text color for the initial
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  status: {
    fontFamily: 'Rajdhani',
    fontSize: 14,
    color: '#39FF14',
  },
  errorText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#FF00FF',
    textAlign: 'center',
    marginTop: 40,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  messageWrapper: {
    maxWidth: '80%',
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF00FF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
  },
  messageText: {
    fontFamily: 'Rajdhani',
    fontSize: 16,
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  timestamp: {
    fontFamily: 'Rajdhani',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 0, 255, 0.2)',
    gap: 12,
  },
  statusIndicator: {
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#FFF',
    fontFamily: 'Rajdhani',
    fontSize: 16,
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF00FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  attachmentsMenu: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FF00FF',
  },
  attachmentsTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 20,
    color: '#FF00FF',
    marginBottom: 16,
    textAlign: 'center',
  },
  attachmentOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 0, 255, 0.2)',
  },
  attachmentText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 16,
  },
  cancelButtonText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#FF00FF',
    textAlign: 'center',
  },
});