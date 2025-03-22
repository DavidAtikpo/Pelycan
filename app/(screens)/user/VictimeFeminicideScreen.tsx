import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/api';

const VictimeFeminicideScreen: React.FC = () => {
    const [isAlertActive, setIsAlertActive] = useState(false);

    const handleEmergencyCall = () => {
        Linking.openURL('tel:17');
    };

    const handleSilentAlert = async () => {
        try {
            // Demander la permission de géolocalisation
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission refusée', 'Nous avons besoin de votre position pour envoyer l\'alerte.');
                return;
            }

            // Obtenir la position actuelle
            const location = await Location.getCurrentPositionAsync({});
            
            // Récupérer le token d'authentification
            const userToken = await AsyncStorage.getItem('userToken');

            // Envoyer l'alerte au serveur
            const response = await fetch(`${API_URL}/alerts/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    location: {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        accuracy: location.coords.accuracy
                    }
                })
            });

            if (response.ok) {
                setIsAlertActive(true);
                // Afficher une alerte discrète
                Alert.alert(
                    'Alerte envoyée',
                    'Les administrateurs ont été notifiés et vont traiter votre alerte.',
                    [{ text: 'OK' }],
                    { cancelable: false }
                );
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de l\'envoi de l\'alerte');
            }
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert(
                'Erreur',
                'Impossible d\'envoyer l\'alerte. Veuillez réessayer.',
                [{ text: 'OK' }],
                { cancelable: false }
            );
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Aide d'Urgence</Text>
                <Text style={styles.subtitle}>Vous êtes en danger immédiat</Text>
            </View>

            <TouchableOpacity 
                style={styles.emergencyButton}
                onPress={handleEmergencyCall}
            >
                <Ionicons name="warning" size={32} color="#fff" />
                <Text style={styles.emergencyButtonText}>APPELER LA POLICE IMMÉDIATEMENT</Text>
            </TouchableOpacity>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Actions Immédiates</Text>
                <View style={styles.actionCard}>
                    <Text style={styles.actionText}>1. Mettez-vous en sécurité si possible</Text>
                    <Text style={styles.actionText}>2. Contactez les services d'urgence</Text>
                    <Text style={styles.actionText}>3. Alertez vos proches de confiance</Text>
                </View>
            </View>

            <View style={styles.resourceSection}>
                <Text style={styles.sectionTitle}>Ressources Disponibles</Text>
                <Link href={'/(screens)/user/HebergementScreen' as any} asChild>
                    <TouchableOpacity style={styles.resourceButton}>
                        <Text style={styles.resourceButtonText}>🏥 Centres d'hébergement d'urgence</Text>
                    </TouchableOpacity>
                </Link>
                <Link href={'/(screens)/user/AssociationsScreen' as any} asChild>
                    <TouchableOpacity style={styles.resourceButton}>
                        <Text style={styles.resourceButtonText}>👥 Associations d'aide aux victimes</Text>
                    </TouchableOpacity>
                </Link>
                <Link href={'/(screens)/user/AssistanceJuridiqueScreen' as any} asChild>
                    <TouchableOpacity style={styles.resourceButton}>
                        <Text style={styles.resourceButtonText}>⚖️ Assistance juridique</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <View style={styles.helpSection}>
                <Text style={styles.sectionTitle}>Aide Immédiate</Text>
                <TouchableOpacity 
                    style={[
                        styles.helpButton,
                        isAlertActive && styles.activeAlertButton
                    ]}
                    onPress={handleSilentAlert}
                >
                    <Text style={[
                        styles.helpButtonText,
                        isAlertActive && styles.activeAlertText
                    ]}>
                        {isAlertActive ? 'Alerte Silencieuse Activée' : 'Activer l\'Alerte Silencieuse'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.helpButton}>
                    <Text style={styles.helpButtonText}>Partager ma Localisation</Text>
                </TouchableOpacity>
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
        color: '#FF0000',
        marginTop: 5,
        fontWeight: 'bold',
    },
    emergencyButton: {
        backgroundColor: '#FF0000',
        margin: 20,
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    emergencyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    infoSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    actionCard: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
    },
    actionText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    resourceSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    resourceButton: {
        backgroundColor: '#D81B60',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    resourceButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    helpSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    helpButton: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    helpButtonText: {
        color: '#D81B60',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    activeAlertButton: {
        backgroundColor: '#FF0000',
        borderColor: '#FF0000',
    },
    activeAlertText: {
        color: '#FFFFFF',
    },
});

export default VictimeFeminicideScreen; 