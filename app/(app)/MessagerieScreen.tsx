import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    read: boolean;
    sender_name: string;
    sender_type: 'admin' | 'professional' | 'user';
}

interface Professional {
    id: string;
    first_name: string;
    last_name: string;
    type: string;
    phone_number: string;
    email: string;
    specialite: string;
}

interface Conversation {
    id: string;
    participant_id: string;
    participant_name: string;
    participant_type: 'admin' | 'professional' | 'user';
    last_message: string;
    last_message_time: string;
    unread_count: number;
}

const MessagerieScreen: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [showProfessionals, setShowProfessionals] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        const initializeData = async () => {
            await loadUserId();
            if (userId) {
                await loadConversations();
                await loadProfessionals();
            }
        };
        initializeData();
    }, [userId]);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id, false);
        }
    }, [selectedConversation]);

    const loadUserId = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userId = await AsyncStorage.getItem('userId');
            
            console.log('=== DEBUG USER DATA ===');
            console.log('Token present:', !!token);
            console.log('Token value:', token);
            console.log('User ID from storage:', userId);
            
            if (!token) {
                console.error('No token found in storage');
                Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
                return;
            }
            
            if (userId) {
                setUserId(userId);
                console.log('User ID successfully set to:', userId);
            } else {
                console.error('No user ID found in storage');
                Alert.alert('Erreur', 'Impossible de charger votre identifiant');
            }
            console.log('=== END DEBUG USER DATA ===');
        } catch (error) {
            console.error('Error loading user ID:', error);
            Alert.alert('Erreur', 'Impossible de charger votre identifiant');
        }
    };

    const loadConversations = async (showLoading: boolean = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Token non trouvé');
            }

            console.log('Loading conversations with token:', token.substring(0, 10) + '...');
            const response = await fetch(`${API_URL}/messages/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Conversations response:', data);
            
            if (data.success) {
                setConversations(data.conversations || []);
                if (data.message) {
                    console.log('Server message:', data.message);
                    Alert.alert('Information', data.message);
                }
            } else {
                throw new Error(data.message || 'Failed to load conversations');
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            Alert.alert('Erreur', 'Impossible de charger les conversations. Veuillez réessayer.');
        } finally {
            if (showLoading) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    };

    const loadMessages = async (conversationId: string, showLoading: boolean = false) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Token non trouvé');
            }

            console.log('Loading messages for conversation:', conversationId);
            const response = await fetch(`${API_URL}/messages/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Messages response:', data);

            if (data.success) {
                setMessages(data.messages || []);
                markMessagesAsRead(conversationId);
            } else {
                throw new Error(data.message || 'Failed to load messages');
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            Alert.alert('Erreur', 'Impossible de charger les messages. Veuillez réessayer.');
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    const markMessagesAsRead = async (conversationId: string) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            await fetch(`${API_URL}/messages/${conversationId}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            loadConversations(); // Refresh conversations to update unread count
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !userId) {
            console.log('Cannot send message:', { 
                hasMessage: !!newMessage.trim(), 
                hasConversation: !!selectedConversation, 
                hasUserId: !!userId 
            });
            return;
        }

        try {
            setSendingMessage(true);
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Token non trouvé');
            }

            console.log('Sending message:', {
                conversation_id: selectedConversation.id,
                content: newMessage.trim()
            });

            const response = await fetch(`${API_URL}/messages/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversation_id: selectedConversation.id,
                    content: newMessage.trim()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Send message response:', data);
            
            if (data.success) {
                setNewMessage('');
                // Recharger les messages sans afficher l'indicateur de chargement
                loadMessages(selectedConversation.id, false);
                // Recharger les conversations en arrière-plan sans afficher l'indicateur de chargement
                loadConversations(false);
            } else {
                throw new Error(data.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Erreur', 'Impossible d\'envoyer le message');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleReport = () => {
        Alert.alert('Signaler un problème', 'Voulez-vous signaler cette conversation ?', [
            { text: 'Annuler', style: 'cancel' },
            { 
                text: 'Signaler', 
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('userToken');
                        await fetch(`${API_URL}/messages/report`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                conversation_id: selectedConversation?.id
                            })
                        });
                        Alert.alert('Succès', 'La conversation a été signalée');
                    } catch (error) {
                        console.error('Error reporting conversation:', error);
                        Alert.alert('Erreur', 'Impossible de signaler la conversation');
                    }
                }
            },
        ]);
    };

    const getParticipantIcon = (type: string) => {
        switch (type) {
            case 'admin':
                return 'admin-panel-settings';
            case 'professional':
                return 'business';
            default:
                return 'person';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadConversations();
    };

    const loadProfessionals = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/messages/professionals/available`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setProfessionals(data.professionals);
            } else {
                throw new Error('Failed to load professionals');
            }
        } catch (error) {
            console.error('Error loading professionals:', error);
            Alert.alert('Erreur', 'Impossible de charger la liste des professionnels');
        }
    };

    const startNewConversation = async (professionalId: string) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Token non trouvé');
            }

            console.log('Starting conversation with professional:', professionalId);
            const response = await fetch(`${API_URL}/messages/start-conversation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    professional_id: professionalId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Start conversation response:', data);

            if (data.success) {
                setSelectedConversation(data.conversation);
                // Attendre un peu avant de charger les conversations pour s'assurer que la base de données est à jour
                setTimeout(() => {
                    loadConversations();
                }, 1000);
            } else {
                throw new Error(data.message || 'Failed to start conversation');
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
            Alert.alert('Erreur', 'Impossible de démarrer la conversation');
        } finally {
            setLoading(false);
        }
    };

    const renderProfessional = ({ item }: { item: Professional }) => (
        <TouchableOpacity 
            style={styles.professionalItem}
            onPress={() => startNewConversation(item.id)}
        >
            <View style={styles.professionalHeader}>
                <MaterialIcons name="business" size={24} color="#D81B60" />
                <View style={styles.professionalInfo}>
                    <Text style={styles.professionalName}>{item.first_name} {item.last_name}</Text>
                    <Text style={styles.professionalType}>{item.specialite}</Text>
                </View>
            </View>
            <View style={styles.professionalAddress}>
                <MaterialIcons name="email" size={16} color="#666" />
                <Text style={styles.addressText}>
                    {item.email}
                </Text>
            </View>
            {item.phone_number && (
                <View style={styles.professionalContact}>
                    <MaterialIcons name="phone" size={16} color="#666" />
                    <Text style={styles.contactText}>{item.phone_number}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderConversation = ({ item }: { item: Conversation }) => (
        <TouchableOpacity 
            style={styles.conversationItem}
            onPress={() => setSelectedConversation(item)}
        >
            <View style={styles.conversationHeader}>
                <MaterialIcons 
                    name={getParticipantIcon(item.participant_type)} 
                    size={24} 
                    color="#D81B60" 
                />
                <View style={styles.conversationInfo}>
                    <Text style={styles.participantName}>{item.participant_name}</Text>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.last_message}
                    </Text>
                </View>
            </View>
            <View style={styles.conversationFooter}>
                <Text style={styles.time}>{formatTime(item.last_message_time)}</Text>
                {item.unread_count > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>{item.unread_count}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF69B4" />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            ) : (
                <View style={styles.content}>
                    {selectedConversation ? (
                        // Vue de la conversation
                        <View style={styles.chatContainer}>
                            <View style={styles.chatHeader}>
                                <TouchableOpacity 
                                    style={styles.backButton}
                                    onPress={() => setSelectedConversation(null)}
                                >
                                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                                </TouchableOpacity>
                                <View style={styles.chatHeaderInfo}>
                                    <MaterialIcons 
                                        name={getParticipantIcon(selectedConversation.participant_type)} 
                                        size={24} 
                                        color="#D81B60" 
                                    />
                                    <Text style={styles.chatTitle}>{selectedConversation.participant_name}</Text>
                                </View>
                                <TouchableOpacity onPress={handleReport}>
                                    <MaterialIcons name="report-problem" size={24} color="#D81B60" />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={messages}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <View style={[
                                        styles.messageItem,
                                        item.sender_id === userId ? styles.sentMessage : styles.receivedMessage
                                    ]}>
                                        <Text style={styles.messageContent}>{item.content}</Text>
                                        <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
                                    </View>
                                )}
                            />

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Écrivez un message..."
                                    value={newMessage}
                                    onChangeText={setNewMessage}
                                    multiline
                                />
                                <TouchableOpacity 
                                    style={styles.sendButton}
                                    onPress={handleSendMessage}
                                    disabled={!newMessage.trim() || sendingMessage}
                                >
                                    {sendingMessage ? (
                                        <ActivityIndicator size="small" color="#D81B60" />
                                    ) : (
                                        <MaterialIcons 
                                            name="send" 
                                            size={24} 
                                            color={newMessage.trim() ? "#D81B60" : "#ccc"} 
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.mainContent}>
                            <View style={styles.sectionHeader}>
                                <TouchableOpacity 
                                    style={styles.sectionTab}
                                    onPress={() => setShowProfessionals(true)}
                                >
                                    <Text style={[
                                        styles.sectionTabText,
                                        showProfessionals && styles.sectionTabActive
                                    ]}>Professionnels</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.sectionTab}
                                    onPress={() => setShowProfessionals(false)}
                                >
                                    <Text style={[
                                        styles.sectionTabText,
                                        !showProfessionals && styles.sectionTabActive
                                    ]}>Conversations</Text>
                                </TouchableOpacity>
                            </View>

                            {showProfessionals ? (
                                <FlatList
                                    data={professionals}
                                    renderItem={renderProfessional}
                                    keyExtractor={item => item.id}
                                    contentContainerStyle={styles.professionalsList}
                                    ListEmptyComponent={
                                        <View style={styles.emptyState}>
                                            <MaterialIcons name="business" size={64} color="#FF69B4" />
                                            <Text style={styles.emptyStateText}>
                                                Aucun professionnel disponible
                                            </Text>
                                        </View>
                                    }
                                />
                            ) : (
                                <View style={styles.conversationsList}>
                                    {conversations.length === 0 ? (
                                        <View style={styles.emptyState}>
                                            <MaterialIcons name="chat-bubble-outline" size={64} color="#FF69B4" />
                                            <Text style={styles.emptyStateText}>
                                                Aucune conversation pour le moment
                                            </Text>
                                            <Text style={styles.emptyStateSubText}>
                                                Les conversations apparaîtront ici lorsque vous échangerez avec des administrateurs ou des professionnels.
                                            </Text>
                                        </View>
                                    ) : (
                                        <FlatList
                                            data={conversations}
                                            keyExtractor={(item) => item.id}
                                            renderItem={renderConversation}
                                            contentContainerStyle={styles.conversationsListContent}
                                            refreshing={refreshing}
                                            onRefresh={loadConversations}
                                        />
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    conversationItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 15,
        marginVertical: 8,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    conversationInfo: {
        flex: 1,
        marginLeft: 12,
    },
    participantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
    },
    conversationFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    unreadBadge: {
        backgroundColor: '#D81B60',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 15,
    },
    chatHeaderInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    chatTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    messageItem: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 15,
        marginVertical: 4,
    },
    sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#D81B60',
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#F0F0F0',
    },
    messageContent: {
        fontSize: 16,
        color: '#fff',
    },
    messageTime: {
        fontSize: 12,
        color: '#fff',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 100,
    },
    sendButton: {
        padding: 10,
    },
    conversationsList: {
        flex: 1,
    },
    conversationsListContent: {
        padding: 15,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF69B4',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyStateSubText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    content: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    sectionTabText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    sectionTabActive: {
        color: '#D81B60',
        fontWeight: 'bold',
    },
    professionalItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 15,
        marginVertical: 8,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    professionalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    professionalInfo: {
        flex: 1,
        marginLeft: 12,
    },
    professionalName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    professionalType: {
        fontSize: 14,
        color: '#666',
    },
    professionalAddress: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    professionalContact: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    professionalsList: {
        padding: 15,
    },
});

export default MessagerieScreen;