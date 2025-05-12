import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
  case_id?: string;
  case_title?: string;
}

const MessagesScreen = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/pro/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des messages');
      }

      const data = await response.json();
      setMessages(data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les messages');
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const handleMessagePress = (message: Message) => {
    if (message.case_id) {
      router.push({
        pathname: '/case',
        params: { id: message.case_id }
      } as any);
    } else {
      router.push({
        pathname: '/message-details',
        params: { id: message.id }
      } as any);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={[
        styles.messageCard,
        !item.is_read && styles.unreadMessage
      ]}
      onPress={() => handleMessagePress(item)}
    >
      <View style={styles.messageHeader}>
        <Text style={styles.senderName}>{item.sender_name}</Text>
        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
      </View>

      <Text style={styles.content} numberOfLines={2}>
        {item.content}
      </Text>

      {item.case_title && (
        <View style={styles.caseInfo}>
          <Ionicons name="folder" size={16} color="#4CAF50" />
          <Text style={styles.caseTitle}>{item.case_title}</Text>
        </View>
      )}

      {!item.is_read && (
        <View style={styles.unreadIndicator} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun message</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  unreadMessage: {
    backgroundColor: '#F1F8E9',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  caseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  caseTitle: {
    fontSize: 12,
    color: '#4CAF50',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 32,
  },
});

export default MessagesScreen; 