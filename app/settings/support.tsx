import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    TextInput,
    Alert,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { useUserProfile } from "../context/userContext";
import { API_BASE_URL } from "../apiUrl";
import Toast from 'react-native-toast-message';
import { LinearGradient } from "expo-linear-gradient";

export default function Support() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [tickets, setTickets] = useState([]);
    const { token } = useUserProfile();

    const handleSubmit = async () => {
        if (!subject || !message) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Subject and message are required.',
            });
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/user/support-ticket`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ subject, message }),
            });

            const data = await res.json();
            if (data.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Ticket submitted successfully!',
                });
                setSubject("");
                setMessage("");
                fetchTickets();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: data.message || "Failed to create ticket.",
                });
            }
        } catch (err) {
            console.error("Submit Error:", err);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong. Please try again.',
            });
        }
    };

    const fetchTickets = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/user/tickets`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setTickets(data.tickets);
            }
        } catch (err) {
            console.error("Fetch Tickets Error:", err);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [token]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#FF00FF" />
                </Pressable>
                <Text style={styles.title}>Support</Text>
            </View>

            <ScrollView style={styles.content}>
                <View>
                    <Text style={styles.sectionTitle}>Create Support Ticket</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Subject"
                        placeholderTextColor="#999"
                        value={subject}
                        onChangeText={setSubject}
                    />
                    <TextInput
                        style={[styles.input, { height: 100 }]}
                        placeholder="Message"
                        placeholderTextColor="#999"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />

                    <Pressable onPress={handleSubmit} >
                        <LinearGradient
                            colors={['#FF00FF', '#8A2BE2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.submitButton}
                        >
                            <Text style={styles.submitText}>Submit Ticket</Text>
                        </LinearGradient>
                    </Pressable>

                </View>

                <View style={styles.section}>
                    <Text style={styles.yourTicketTitle}>Your Tickets</Text>

                    <ScrollView style={styles.ticketScroll} showsVerticalScrollIndicator={false}>
                        {tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <View key={ticket.ticket_id} style={styles.ticketCard}>
                                    <View style={styles.ticketHeader}>
                                        <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                                        <Text
                                            style={[
                                                styles.ticketStatus,
                                                {
                                                    backgroundColor:
                                                        ticket.status === "open"
                                                            ? "#4caf50"
                                                            : ticket.status === "resolved"
                                                                ? "#03d7fc"
                                                                : "#f44336",
                                                },
                                            ]}
                                        >
                                            {ticket.status.toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.ticketDate}>
                                        Created: {new Date(ticket.created_at).toLocaleDateString()}
                                    </Text>

                                    <View style={styles.messageContainer}>
                                        {ticket.latestMessages?.user && (
                                            <View style={styles.userMessage}>
                                                <Text style={styles.messageSender}>You</Text>
                                                <Text style={styles.messageText}>
                                                    {ticket.latestMessages.user.message}
                                                </Text>
                                                <Text style={styles.messageTime}>
                                                    {new Date(ticket.latestMessages.user.created_at).toLocaleString()}
                                                </Text>
                                            </View>
                                        )}
                                        {ticket.latestMessages?.admin && (
                                            <View style={styles.adminMessage}>
                                                <Text style={styles.messageSender}>Admin</Text>
                                                <Text style={styles.messageText}>
                                                    {ticket.latestMessages.admin.message}
                                                </Text>
                                                <Text style={styles.messageTime}>
                                                    {new Date(ticket.latestMessages.admin.created_at).toLocaleString()}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noTickets}>No tickets found.</Text>
                        )}

                    </ScrollView>
                </View>
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 8,
        gap: 16,
    },

    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
    },

    title: {
        fontFamily: "Orbitron-Bold",
        fontSize: 28,
        color: "#FF00FF",
        textShadowColor: "#FF00FF",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },

    content: {
        flex: 1,
        paddingHorizontal: 30,
    },

    section: {
        padding: 10,
        backgroundColor: "#1a1a1a",
        borderRadius: 10,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: "#03d7fc",
    },

    sectionTitle: {
        fontFamily: "Orbitron-Bold",
        fontSize: 18,
        fontWeight: "bold",
        color: "#00ffff",
        marginBottom: 12,
    },
    yourTicketTitle: {
        fontFamily: "Orbitron-Bold",
        fontSize: 18,
        fontWeight: "bold",
        color: "#FF00FF",
        marginBottom: 12,
    },

    input: {
        borderWidth: 1,
        borderColor: "#03d7fc",
        color: "#fff",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },

    submitButton: {
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF00FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
        width: '100%',
        marginBottom: 16,
    },
    submitText: {
        fontFamily: 'Rajdhani-SemiBold',
        fontSize: 20,
        color: '#FFFFFF',
    },

    ticketScroll: {
        maxHeight: 300,
        marginTop: 10,
    },

    ticketItem: {
        backgroundColor: "#2c2c2c",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },

    latestMessageLabel: {
        fontSize: 12,
        color: "#FF00FF",
        marginTop: 4,
        fontWeight: "600",
    },
    userMessageBubble: {
        backgroundColor: "#3a3a3a",
        padding: 10,
        borderRadius: 8,
        marginBottom: 6,
        alignSelf: "flex-start",
        maxWidth: "90%",
    },

    adminMessageBubble: {
        backgroundColor: "#262626",
        borderLeftWidth: 4,
        borderLeftColor: "#FF00FF",
        padding: 10,
        borderRadius: 8,
        marginBottom: 6,
        alignSelf: "flex-end",
        maxWidth: "90%",
    },
    ticketCard: {
        backgroundColor: "#1f1f1f",
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#03d7fc50",
        shadowColor: "#03d7fc",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    ticketHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    ticketSubject: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ffffff",
        flex: 1,
        flexWrap: "wrap",
    },

    ticketStatus: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 12,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
        overflow: "hidden",
        textTransform: "uppercase",
    },

    ticketDate: {
        color: "#aaa",
        fontSize: 12,
        marginBottom: 10,
    },

    messageContainer: {
        marginTop: 8,
        gap: 10,
    },

    userMessage: {
        backgroundColor: "#333333",
        borderLeftWidth: 4,
        borderLeftColor: "#FF00FF",
        padding: 12,
        borderRadius: 10,
    },

    adminMessage: {
        backgroundColor: "#2b2b2b",
        borderLeftWidth: 4,
        borderLeftColor: "#03d7fc",
        padding: 12,
        borderRadius: 10,
    },

    messageSender: {
        color: "#03d7fc",
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 4,
    },

    messageText: {
        color: "#ffffff",
        fontSize: 14,
    },

    messageTime: {
        color: "#888",
        fontSize: 11,
        marginTop: 4,
    },


    messageSenderLabel: {
        color: "#03d7fc",
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 2,
    },

    messageTimestamp: {
        color: "#888",
        fontSize: 10,
        marginTop: 4,
    },

    latestMessageText: {
        color: "#ffffff",
        fontSize: 14,
        marginTop: 2,
    },

    latestMessageDate: {
        color: "#777",
        fontSize: 11,
        marginTop: 2,
    },


    ticketPriority: {
        marginTop: 2,
        color: "#cccccc",
    },

    noTickets: {
        color: "#aaa",
        fontStyle: "italic",
        marginTop: 10,
    },
});


