import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Image, Animated } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Link } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/api';

const VictimeFeminicideScreen: React.FC = () => {
    const [isAlertActive, setIsAlertActive] = useState(false);
    const pulseAnim = new Animated.Value(1);

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleEmergencyCall = () => {
        Alert.alert(
            'Appel d\'urgence',
            'Voulez-vous appeler la police (17) ?',
            [
                {
                    text: 'Annuler',
                    style: 'cancel'
                },
                {
                    text: 'Appeler',
                    onPress: () => Linking.openURL('tel:17')
                }
            ]
        );
    };

    const handleSilentAlert = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission refusée', 'Nous avons besoin de votre position pour envoyer l\'alerte.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const userToken = await AsyncStorage.getItem('userToken');

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
                <View style={styles.headerContent}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <MaterialIcons name="emergency" size={40} color="#FF0000" />
                    </Animated.View>
                    <Text style={styles.title}>Aide d'Urgence</Text>
                    <Text style={styles.subtitle}>Vous êtes en danger immédiat</Text>
                </View>
            </View>

            <View style={styles.emergencySection}>
                <TouchableOpacity 
                    style={[styles.emergencyButton, { backgroundColor: '#FF0000' }]}
                    onPress={handleEmergencyCall}
                >
                    <View style={styles.emergencyButtonContent}>
                        <MaterialIcons name="phone" size={30} color="#fff" />
                        <Text style={styles.emergencyButtonText}>Appeler la Police (17)</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[
                        styles.silentAlertButton,
                        isAlertActive && styles.activeSilentAlertButton
                    ]}
                    onPress={handleSilentAlert}
                >
                    <View style={styles.silentAlertContent}>
                        <MaterialIcons 
                            name={isAlertActive ? "check-circle" : "warning"} 
                            size={30} 
                            color={isAlertActive ? "#fff" : "#FF0000"} 
                        />
                        <Text style={[
                            styles.silentAlertText,
                            isAlertActive && styles.activeSilentAlertText
                        ]}>
                            {isAlertActive ? 'Alerte Silencieuse Activée' : 'Activer l\'Alerte Silencieuse'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="info" size={24} color="#FF5722" />
                    <Text style={styles.sectionTitle}>Actions Immédiates</Text>
                </View>
                <View style={styles.actionCard}>
                    <View style={styles.actionItem}>
                        <View style={styles.actionIconContainer}>
                            <MaterialIcons name="security" size={24} color="#FF5722" />
                        </View>
                        <Text style={styles.actionText}>1. Mettez-vous en sécurité si possible</Text>
                    </View>
                    <View style={styles.actionItem}>
                        <View style={styles.actionIconContainer}>
                            <MaterialIcons name="phone" size={24} color="#FF5722" />
                        </View>
                        <Text style={styles.actionText}>2. Contactez les services d'urgence</Text>
                    </View>
                    <View style={styles.actionItem}>
                        <View style={styles.actionIconContainer}>
                            <MaterialIcons name="people" size={24} color="#FF5722" />
                        </View>
                        <Text style={styles.actionText}>3. Alertez vos proches de confiance</Text>
                    </View>
                </View>
            </View>

            <View style={styles.resourceSection}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="help" size={24} color="#FF5722" />
                    <Text style={styles.sectionTitle}>Ressources Disponibles</Text>
                </View>
                <View style={styles.resourceGrid}>
                    <Link href={'/(screens)/user/HebergementScreen' as any} asChild>
                        <TouchableOpacity style={styles.resourceButton}>
                            <View style={styles.resourceButtonContent}>
                                <MaterialIcons name="home" size={24} color="#fff" />
                                <Text style={styles.resourceButtonText}>Centres d'hébergement</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>
                    <Link href={'/(screens)/user/AssociationsScreen' as any} asChild>
                        <TouchableOpacity style={styles.resourceButton}>
                            <View style={styles.resourceButtonContent}>
                                <MaterialIcons name="people" size={24} color="#fff" />
                                <Text style={styles.resourceButtonText}>Associations d'aide</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>
                    <Link href={'/(screens)/user/AssistanceJuridiqueScreen' as any} asChild>
                        <TouchableOpacity style={styles.resourceButton}>
                            <View style={styles.resourceButtonContent}>
                                <MaterialIcons name="gavel" size={24} color="#fff" />
                                <Text style={styles.resourceButtonText}>Assistance juridique</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>

            <View style={styles.helpSection}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="support-agent" size={24} color="#FF5722" />
                    <Text style={styles.sectionTitle}>Aide Immédiate</Text>
                </View>
                <TouchableOpacity 
                    style={styles.locationButton}
                    onPress={() => {
                        Alert.alert('Info', 'Cette fonctionnalité sera bientôt disponible');
                    }}
                >
                    <View style={styles.locationButtonContent}>
                        <MaterialIcons name="location-on" size={24} color="#FF5722" />
                        <Text style={styles.locationButtonText}>Partager ma Localisation</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F0FF',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 40,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E6E0FF',
        elevation: 2,
    },
    headerContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4A154B',
        marginTop: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#FF0000',
        marginTop: 5,
        fontWeight: 'bold',
    },
    emergencySection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
        gap: 15,
    },
    emergencyButton: {
        padding: 20,
        borderRadius: 15,
        elevation: 5,
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    emergencyButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    emergencyButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    silentAlertButton: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#FF0000',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    activeSilentAlertButton: {
        backgroundColor: '#FF0000',
        borderColor: '#FF0000',
    },
    silentAlertContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    silentAlertText: {
        color: '#FF0000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    activeSilentAlertText: {
        color: '#fff',
    },
    infoSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
        borderRadius: 15,
        elevation: 3,
        shadowColor: "#6A0DAD",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
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
        color: '#FF5722',
    },
    actionCard: {
        backgroundColor: '#F8F0FF',
        padding: 15,
        borderRadius: 15,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        elevation: 2,
        shadowColor: "#6A0DAD",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    actionText: {
        fontSize: 16,
        color: '#4A154B',
        flex: 1,
    },
    resourceSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
        borderRadius: 15,
        elevation: 3,
        shadowColor: "#6A0DAD",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    resourceGrid: {
        gap: 10,
    },
    resourceButton: {
        backgroundColor: '#FF5722',
        padding: 15,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    resourceButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    resourceButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    helpSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 15,
        elevation: 3,
        shadowColor: "#6A0DAD",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    locationButton: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FF5722',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    locationButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    locationButtonText: {
        color: '#FF5722',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default VictimeFeminicideScreen; 