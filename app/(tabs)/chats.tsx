import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Search, Video, MessageSquare, Plus } from "lucide-react-native";

import StoryList from "@/components/StoryLists";
import { API_BASE_URL } from "../apiUrl";
import { useUserProfile } from "../context/userContext";
import Loading from "@/components/Loading";
import { useSocket } from "../context/socketContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { fixImageUrl } from "../utils/fixImageUrl";

export default function ChatsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { token, loading, setLoading } = useUserProfile();
  const [users, setUsers] = useState<User[]>([]);
  const { onlineUsers } = useSocket();
  console.log("online users in chatlist page : ", onlineUsers);

  useFocusEffect(
    useCallback(() => {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${API_BASE_URL}/chat/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          console.log("chat users response : ", data);
          setUsers(data.users);
          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch users:", error);
          setLoading(false);
        }
      };
      fetchUsers();
    }, [token])
  );

  const filteredUsers = users?.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserPress = (userId: string) => {
    router.push({
      pathname: "/chat/[id]",
      params: { id: userId },
    });
  };

  if (loading) {
    return <Loading />;
  }
  const handleVideoCall = (receiverId: string, name: string, image: string) => {
    router.push({
      pathname: "/outgoing",
      params: { receiverId: receiverId, name: name, image: image },
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Your conversations</Text>
      </View>

      <View style={{ flex: 1, paddingBottom: 200 }}>
        {users?.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No conversations yet</Text>
            <Text style={styles.emptyStateSubText}>
              Start a new chat to see it here.
            </Text>
          </View>
        ) : (
          <View>
            <StoryList />

            <View style={styles.searchContainer}>
              <Search size={20} color="#03d7fc" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search messages..."
                placeholderTextColor="#03d7fc"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {filteredUsers?.map((user) => {
                const isOnline = onlineUsers.includes(user.id);
                return (
                  <Pressable
                    key={user.id}
                    style={styles.userItem}
                    onPress={() => handleUserPress(user.id)}
                  >
                    <View style={styles.avatarContainer}>
                      {user.profile ? (
                        <Image
                          source={{
                            uri: fixImageUrl(user?.profile),
                          }}
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={styles.avatarText}>
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "?"}
                          </Text>
                        </View>
                      )}
                      {isOnline && <View style={styles.onlineIndicator} />}
                    </View>

                    <View style={styles.userInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.userName}>{user.name}</Text>
                      </View>

                      <View style={styles.messageRow}>
                        <Text
                          style={[
                            styles.lastMessage,
                            user.typing && styles.typingMessage,
                            user.unread_count > 0 && styles.unreadMessage,
                          ]}
                          numberOfLines={1}
                        >
                          {user.last_message}
                        </Text>
                        {user.unread_count > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadCount}>
                              {user.unread_count}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.actionCols}>
                      <View style={styles.actionButtons}>
                        <Pressable
                          style={styles.actionButton}
                          onPress={() => {
                            router.push({
                              pathname: "/chat/[id]",
                              params: { id: user.id },
                            });
                          }}
                        >
                          <MessageSquare size={20} color="#FF00FF" />
                        </Pressable>
                        <Pressable
                          style={styles.actionButton}
                          onPress={() => {
                            // router.push({
                            //   pathname: "/video/[id]",
                            //   params: { id: user.id },
                            // });
                            handleVideoCall(user.id, user.name, user.profile);
                          }}
                        >
                          <Video size={20} color="#FF00FF" />
                        </Pressable>
                      </View>
                      <View>
                        <Text style={styles.timestamp}>
                          {new Date(user?.timestamp).toLocaleString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  header: {
    paddingTop: 35,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontFamily: "Orbitron-Bold",
    fontSize: 32,
    color: "#FF00FF",
    textShadowColor: "#FF00FF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyStateText: {
    fontFamily: "Orbitron-Bold",
    fontSize: 20,
    color: "#FF00FF",
    marginBottom: 6,
  },
  categoriesContainer: {
    paddingHorizontal: 8,
    flexDirection: "column",
    gap: 16,
  },

  emptyStateSubText: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#888",
  },

  subtitle: {
    fontFamily: "Rajdhani",
    fontSize: 18,
    color: "#00FFFF",
    marginTop: 4,
  },

  storyIndicator: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: "#FF00FF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderRadius: 20,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#03d7fc",
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    color: "#FFFFFF",
    fontFamily: "Rajdhani",
  },
  // userList: {
  //   flex: 1,
  // },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#03d7fc",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#FF00FF",
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#FF00FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    color: "#fff", // Text color for the initial
    fontWeight: "bold",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#39FF14",
    borderWidth: 2,
    borderColor: "#000",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontFamily: "Orbitron-Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  timestamp: {
    fontFamily: "Rajdhani",
    fontSize: 14,
    color: "#666666",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMessage: {
    flex: 1,
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#666666",
    marginRight: 8,
  },
  typingMessage: {
    color: "#FF00FF",
    fontStyle: "italic",
  },
  unreadMessage: {
    color: "#FFFFFF",
    fontFamily: "Rajdhani-SemiBold",
  },
  unreadBadge: {
    backgroundColor: "#FF00FF",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadCount: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 14,
    color: "#000000",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionCols: {
    flexDirection: "column",
    gap: 8,
    marginLeft: 12,
  },

  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 0, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF00FF",
  },
});
