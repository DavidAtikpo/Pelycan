import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useAlerts } from '../../hooks/useAlerts';

const AlertsScreen: React.FC = () => {
    const {
        alerts,
        isLoading,
        error,
        fetchAlerts,
        sendMessage,
        processAlert
    } = useAlerts();

    const [selectedAlert, setSelectedAlert] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleSendMessage = async () => {
        if (!selectedAlert || !message.trim()) return;

        try {
            await sendMessage(selectedAlert.id, message);
            Alert.alert('Succès', 'Message envoyé avec succès');
            setMessage('');
            setIsModalVisible(false);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible d\'envoyer le message');
        }
    };

    const handleProcessAlert = async (alertId: string) => {
        try {
            await processAlert(alertId);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de traiter l\'alerte');
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF3B30" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <View style={styles.header}>
                    <Ionicons name="alert-circle" size={24} color="#FF3B30" />
                    <Text style={styles.headerTitle}>Alertes en cours</Text>
                </View>

                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity 
                            style={styles.retryButton}
                            onPress={() => fetchAlerts(true)}
                        >
                            <Text style={styles.retryButtonText}>Réessayer</Text>
                        </TouchableOpacity>
                    </View>
                ) : alerts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucune alerte active</Text>
                    </View>
                ) : (
                    alerts.map((alert) => (
                        <TouchableOpacity
                            key={alert.id}
                            style={[styles.alertItem, { backgroundColor: alert.status === 'active' ? '#FFE0E0' : '#FFF' }]}
                            onPress={() => {
                                setSelectedAlert(alert);
                                setIsModalVisible(true);
                            }}
                        >
                            <Text style={styles.alertTitle}>Alerte de {alert.userName}</Text>
                            <Text style={styles.alertTime}>
                                {new Date(alert.timestamp).toLocaleString()}
                            </Text>
                            <Text style={styles.alertStatus}>
                                Status: {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </View>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => setIsModalVisible(false)}
                    >
                        <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>

                    {selectedAlert && (
                        <>
                            <Text style={styles.modalTitle}>
                                Alerte de {selectedAlert.userName}
                            </Text>

                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: selectedAlert.location.latitude,
                                    longitude: selectedAlert.location.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: selectedAlert.location.latitude,
                                        longitude: selectedAlert.location.longitude,
                                    }}
                                    title={`Position de ${selectedAlert.userName}`}
                                />
                            </MapView>

                            <View style={styles.messageContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Envoyer un message à la victime..."
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                />
                                <TouchableOpacity 
                                    style={styles.sendButton}
                                    onPress={handleSendMessage}
                                >
                                    <Text style={styles.sendButtonText}>Envoyer</Text>
                                </TouchableOpacity>
                            </View>

                            {selectedAlert.status === 'active' && (
                                <TouchableOpacity 
                                    style={styles.processButton}
                                    onPress={() => handleProcessAlert(selectedAlert.id)}
                                >
                                    <Text style={styles.processButtonText}>
                                        Marquer comme traité
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    section: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#FF0000',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
    alertItem: {
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    alertTime: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    alertStatus: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 20,
    },
    map: {
        height: 300,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    messageContainer: {
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 5,
        padding: 10,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    sendButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    processButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        margin: 20,
        alignItems: 'center',
    },
    processButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default AlertsScreen; 