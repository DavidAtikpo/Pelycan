import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, ActivityIndicator, Image } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/api';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

interface LocationData {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
}

interface EmergencyRequest {
    userId: string;
    location: LocationData;
    timestamp: string;
    type: 'ASSISTANCE PELYCAN' | 'MEDICAL' | 'GENERAL';
}

interface EmergencyHistory {
    id: string;
    request_type: string;
    status: 'pending' | 'assigned' | 'in_progress' | 'completed';
    created_at: string;
    logs: Array<{
        id: string;
        action: string;
        details: any;
        created_at: string;
    }>;
}

const DemandeUrgenceScreen: React.FC = () => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [history, setHistory] = useState<EmergencyHistory[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission refusée', 'L\'accès à la localisation est nécessaire pour les services d\'urgence');
                return;
            }

            try {
                const location = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    accuracy: location.coords.accuracy,
                });
            } catch (error) {
                console.error('Erreur de localisation:', error);
                Alert.alert('Erreur', 'Impossible d\'obtenir votre position');
            }

            // Récupérer l'ID utilisateur
            const storedUserId = await AsyncStorage.getItem('userId');
            setUserId(storedUserId);

            // Charger l'historique des demandes
            if (storedUserId) {
                loadEmergencyHistory(storedUserId);
            }
        })();
    }, []);

    const loadEmergencyHistory = async (userId: string) => {
        setLoadingHistory(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/emergency/history/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération de l\'historique');
            }

            const data = await response.json();
            setHistory(data.data);
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Impossible de charger l\'historique des demandes');
        } finally {
            setLoadingHistory(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return '#FFA500';
            case 'assigned':
                return '#2196F3';
            case 'in_progress':
                return '#4CAF50';
            case 'completed':
                return '#9E9E9E';
            default:
                return '#757575';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'En attente';
            case 'assigned':
                return 'Assignée';
            case 'in_progress':
                return 'En cours';
            case 'completed':
                return 'Terminée';
            default:
                return status;
        }
    };

    const sendEmergencyRequest = async (type: EmergencyRequest['type']) => {
        if (!location || !userId) {
            Alert.alert('Erreur', 'Impossible d\'envoyer la demande d\'urgence. Vérifiez votre connexion et votre localisation.');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/emergency/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId,
                    location,
                    timestamp: new Date().toISOString(),
                    type,
                } as EmergencyRequest),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi de la demande d\'urgence');
            }

            Alert.alert(
                'Demande envoyée',
                'Les services d\'urgence ont été notifiés de votre situation.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Impossible d\'envoyer la demande d\'urgence');
        } finally {
            setLoading(false);
        }
    };

    const handleEmergencyCall = async (number: string, type: EmergencyRequest['type']) => {
        Alert.alert(
            'Appeler les secours',
            'Voulez-vous contacter les services d\'urgence ?',
            [
                {
                    text: 'Annuler',
                    style: 'cancel'
                },
                {
                    text: `Appeler le ${number}`,
                    onPress: async () => {
                        await sendEmergencyRequest(type);
                        Linking.openURL(`tel:${number}`);
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF0000" />
                <Text style={styles.loadingText}>Envoi de la demande d'urgence...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <MaterialIcons name="emergency" size={40} color="#FF0000" />
                    <Text style={styles.title}>Demande d'Urgence</Text>
                    <Text style={styles.subtitle}>Services d'urgence disponibles 24h/24</Text>
                    {location && (
                        <View style={styles.locationContainer}>
                            <Ionicons name="location" size={20} color="#4CAF50" />
                            <Text style={styles.locationText}>
                                Localisation activée
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.emergencySection}>
                <TouchableOpacity 
                    style={styles.sosButton}
                    onPress={() => handleEmergencyCall('17', 'ASSISTANCE PELYCAN')}
                >
                    <View style={styles.sosButtonContent}>
                        <FontAwesome5 name="exclamation-triangle" size={30} color="#fff" />
                        <Text style={styles.sosButtonText}>ASSISTANCE PELYCAN</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.emergencyContacts}>
                    <Text style={styles.contactsTitle}>Numéros d'Urgence:</Text>
                    <View style={styles.contactsGrid}>
                        <TouchableOpacity 
                            style={styles.contactButton}
                            onPress={() => handleEmergencyCall('15', 'MEDICAL')}
                        >
                            <View style={styles.contactButtonContent}>
                                <MaterialIcons name="medical-services" size={24} color="#D81B60" />
                                <Text style={styles.contactText}>PSYCHOLOGUE: 15</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.historySection}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="history" size={24} color="#333" />
                    <Text style={styles.sectionTitle}>Historique des demandes</Text>
                </View>
                {loadingHistory ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#FF0000" />
                    </View>
                ) : history.length > 0 ? (
                    history.map((request) => (
                        <View key={request.id} style={styles.historyItem}>
                            <View style={styles.historyHeader}>
                                <View style={styles.historyTypeContainer}>
                                    <MaterialIcons 
                                        name={request.request_type === 'MEDICAL' ? 'medical-services' : 
                                            request.request_type === 'ASSISTANCE PELYCAN' ? 'local-police' : 'help'}
                                        size={24} 
                                        color="#333" 
                                    />
                                    <Text style={styles.historyType}>{request.request_type}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                                    <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
                                </View>
                            </View>
                            <Text style={styles.historyDate}>
                                {new Date(request.created_at).toLocaleString('fr-FR')}
                            </Text>
                            {request.logs && request.logs.length > 0 && (
                                <View style={styles.logsContainer}>
                                    {request.logs.map((log) => (
                                        <View key={log.id} style={styles.logItem}>
                                            <View style={styles.logContent}>
                                                <MaterialIcons 
                                                    name={log.action === 'created' ? 'add-circle' : 
                                                          log.action === 'status_updated' ? 'update' : 'info'}
                                                    size={16} 
                                                    color="#666" 
                                                />
                                                <Text style={styles.logAction}>{log.action}</Text>
                                            </View>
                                            <Text style={styles.logDate}>
                                                {new Date(log.created_at).toLocaleString('fr-FR')}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))
                ) : (
                    <View style={styles.noHistoryContainer}>
                        <MaterialIcons name="history" size={40} color="#ccc" />
                        <Text style={styles.noHistoryText}>Aucune demande d'urgence enregistrée</Text>
                    </View>
                )}
            </View>

            <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="info" size={24} color="#333" />
                    <Text style={styles.sectionTitle}>Que faire en cas d'urgence ?</Text>
                </View>
                <View style={styles.infoSteps}>
                    <View style={styles.infoStep}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.infoText}>Restez calme</Text>
                    </View>
                    <View style={styles.infoStep}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <Text style={styles.infoText}>Mettez-vous en sécurité</Text>
                    </View>
                    <View style={styles.infoStep}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <Text style={styles.infoText}>Contactez les services d'urgence</Text>
                    </View>
                    <View style={styles.infoStep}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>4</Text>
                        </View>
                        <Text style={styles.infoText}>Votre localisation sera automatiquement partagée</Text>
                    </View>
                    <View style={styles.infoStep}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>5</Text>
                        </View>
                        <Text style={styles.infoText}>Suivez les instructions des opérateurs</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 40,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 10,
    },
    locationText: {
        fontSize: 14,
        color: '#4CAF50',
        marginLeft: 5,
    },
    emergencySection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    sosButton: {
        backgroundColor: '#FF0000',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    sosButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sosButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    emergencyContacts: {
        marginTop: 20,
    },
    contactsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    contactsGrid: {
        gap: 10,
    },
    contactButton: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    contactButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactText: {
        fontSize: 16,
        color: '#D81B60',
        marginLeft: 10,
    },
    historySection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#333',
    },
    historyItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    historyTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    historyDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    logsContainer: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    logItem: {
        marginBottom: 8,
    },
    logContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logAction: {
        fontSize: 14,
        color: '#444',
        marginLeft: 8,
    },
    logDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
        marginLeft: 24,
    },
    noHistoryContainer: {
        alignItems: 'center',
        padding: 20,
    },
    noHistoryText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        marginTop: 10,
    },
    infoSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
        marginBottom: 20,
    },
    infoSteps: {
        gap: 15,
    },
    infoStep: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FF0000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    infoText: {
        fontSize: 16,
        color: '#555',
        flex: 1,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default DemandeUrgenceScreen; 