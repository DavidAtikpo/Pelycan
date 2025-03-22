import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/api';

interface LocationData {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
}

interface EmergencyRequest {
    userId: string;
    location: LocationData;
    timestamp: string;
    type: 'POLICE' | 'MEDICAL' | 'FIRE' | 'GENERAL';
}

const DemandeUrgenceScreen: React.FC = () => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

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
        })();
    }, []);

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
                <Text style={styles.title}>Demande d'Urgence</Text>
                <Text style={styles.subtitle}>Services d'urgence disponibles 24h/24</Text>
                {location && (
                    <Text style={styles.locationText}>
                        Localisation activée - Les services d'urgence pourront vous localiser
                    </Text>
                )}
            </View>

            <View style={styles.emergencySection}>
                <TouchableOpacity 
                    style={styles.sosButton}
                    onPress={() => handleEmergencyCall('17', 'POLICE')}
                >
                    <Text style={styles.sosButtonText}>SOS - ASSISTANCE PELYCAN</Text>
                </TouchableOpacity>

                <View style={styles.emergencyContacts}>
                    <Text style={styles.contactsTitle}>Numéros d'Urgence:</Text>
                    <TouchableOpacity 
                        style={styles.contactButton}
                        onPress={() => handleEmergencyCall('15', 'MEDICAL')}
                    >
                        <Text style={styles.contactText}>PSYCHOLOGUE: 15</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.contactButton}
                        onPress={() => handleEmergencyCall('18', 'FIRE')}
                    >
                        <Text style={styles.contactText}>Soutien: 18</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.contactButton}
                        onPress={() => handleEmergencyCall('112', 'GENERAL')}
                    >
                        <Text style={styles.contactText}>Numéro d'urgence européen: 112</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Que faire en cas d'urgence ?</Text>
                <Text style={styles.infoText}>
                    1. Restez calme{'\n'}
                    2. Mettez-vous en sécurité{'\n'}
                    3. Contactez les services d'urgence{'\n'}
                    4. Votre localisation sera automatiquement partagée{'\n'}
                    5. Suivez les instructions des opérateurs
                </Text>
            </View>
        </ScrollView>
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
    header: {
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    locationText: {
        fontSize: 14,
        color: '#4CAF50',
        marginTop: 10,
    },
    emergencySection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    sosButton: {
        backgroundColor: '#FF0000',
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    sosButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emergencyContacts: {
        marginTop: 20,
    },
    contactsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    contactButton: {
        padding: 10,
        marginBottom: 5,
    },
    contactText: {
        fontSize: 16,
        color: '#D81B60',
        textDecorationLine: 'underline',
    },
    infoSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    infoText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
});

export default DemandeUrgenceScreen; 