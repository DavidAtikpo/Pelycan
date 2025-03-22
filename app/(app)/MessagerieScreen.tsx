import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MessageScreen: React.FC = () => {
    const [messages, setMessages] = useState([
        { id: '1', sender: 'Bailleur A', message: 'Bonjour, votre demande a été approuvée.', time: '10:00' },
        { id: '2', sender: 'Association B', message: 'Nous avons trouvé un logement pour vous.', time: '11:30' },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            setMessages([...messages, { id: String(messages.length + 1), sender: 'Vous', message: newMessage, time: new Date().toLocaleTimeString() }]);
            setNewMessage('');
        }
    };

    const handleReport = () => {
        Alert.alert('Signaler un problème', 'Voulez-vous signaler cette conversation ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Signaler', onPress: () => console.log('Conversation signalée') },
        ]);
    };

    return (
        <View style={styles.container}>
            {/* En-tête */}
            <View style={styles.header}>
                <Text style={styles.title}>Messagerie sécurisée 🔒</Text>
            </View>

            {/* Liste des conversations */}
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.messageItem}>
                        <Text style={styles.sender}>{item.sender}</Text>
                        <Text style={styles.message}>{item.message}</Text>
                        <Text style={styles.time}>{item.time}</Text>
                    </View>
                )}
            />

            {/* Champ de texte pour écrire un message */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Écrivez un message..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                    <Ionicons name="send" size={24} color="#D81B60" />
                </TouchableOpacity>
            </View>

            {/* Bouton de signalement */}
            <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
                <Text style={styles.reportText}>Signaler un problème</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F5F5F5',
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    messageItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
    },
    sender: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    message: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    time: {
        fontSize: 12,
        color: '#888',
        marginTop: 5,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginRight: 10,
    },
    sendButton: {
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    reportButton: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#ffebee',
        borderRadius: 8,
        alignItems: 'center',
    },
    reportText: {
        color: '#D81B60',
        fontWeight: 'bold',
    },
});

export default MessageScreen;