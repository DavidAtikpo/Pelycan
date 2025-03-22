import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import apiService from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Structure {
    id: string;
    nom: string;
    adresse: string;
    services: string | string[];
    horaires: string;
    description: string;
    image?: string;
}

const StructuresScreen: React.FC = () => {
    const [structures, setStructures] = useState<Structure[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Récupération du token au chargement
    useEffect(() => {
        const getToken = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                setToken(userToken);
            } catch (error) {
                console.error("Erreur lors de la récupération du token:", error);
            }
        };
        
        getToken();
    }, []);

    // Récupération des données une fois que le token est disponible
    useEffect(() => {
        const fetchStructures = async () => {
            try {
                setLoading(true);
                
                // Données mockées pour test si pas de connexion API
                if (process.env.NODE_ENV === 'development' && !token) {
                    // Simuler des données pour le développement
                    const mockData = [
                        {
                            id: '1',
                            nom: 'Centre d\'Accueil de Paris',
                            adresse: '10 Rue de la Paix, 75001 Paris',
                            services: 'Hébergement d\'urgence, Repas, Douches, Soutien psychologique',
                            horaires: 'Du lundi au dimanche, 24h/24',
                            description: 'Centre d\'accueil ouvert à toute personne en difficulté, proposant des solutions d\'hébergement d\'urgence et un accompagnement social.'
                        },
                        {
                            id: '2',
                            nom: 'Foyer Saint-Michel',
                            adresse: '25 Avenue Jean Jaurès, 75019 Paris',
                            services: 'Hébergement temporaire, Accompagnement social, Formation',
                            horaires: 'Accueil administratif : 9h-17h en semaine',
                            description: 'Structure d\'accueil et d\'hébergement temporaire pour femmes en difficulté, avec un accompagnement socio-professionnel.'
                        }
                    ];
                    
                    setStructures(mockData);
                    setLoading(false);
                    return;
                }
                
                // Appel à l'API avec le token
                const data = await apiService.getStructures(token);
                setStructures(data as Structure[]);
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors de la récupération des structures:", err);
                setError("Impossible de charger les structures disponibles");
                setLoading(false);
            }
        };

        fetchStructures();
    }, [token]);

    const retryFetchStructures = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getStructures(token);
            setStructures(data as Structure[]);
            setLoading(false);
        } catch (err) {
            console.error("Erreur lors de la récupération des structures:", err);
            setError("Impossible de charger les structures disponibles");
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#D81B60" />
                    <Text style={styles.loadingText}>Chargement des structures...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={50} color="#D81B60" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={retryFetchStructures}
                    >
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (structures.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="business-outline" size={50} color="#D81B60" />
                    <Text style={styles.emptyText}>Aucune structure disponible pour le moment</Text>
                </View>
            );
        }

        return (
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {structures.map((structure) => (
                    <View key={structure.id} style={styles.structureCard}>
                        <Text style={styles.structureName}>{structure.nom}</Text>
                        
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color="#D81B60" />
                            <Text style={styles.infoText}>{structure.adresse}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={20} color="#D81B60" />
                            <Text style={styles.infoText}>{structure.horaires}</Text>
                        </View>
                        
                        <Text style={styles.sectionTitle}>Services proposés:</Text>
                        <View style={styles.servicesList}>
                            {Array.isArray(structure.services) 
                              ? structure.services.map((service, index) => (
                                  <View key={index} style={styles.serviceItem}>
                                      <Ionicons name="checkmark-circle" size={16} color="#D81B60" />
                                      <Text style={styles.serviceText}>{service}</Text>
                                  </View>
                                ))
                              : typeof structure.services === 'string' && structure.services
                                  ? structure.services.split(',').map((service, index) => (
                                      <View key={index} style={styles.serviceItem}>
                                          <Ionicons name="checkmark-circle" size={16} color="#D81B60" />
                                          <Text style={styles.serviceText}>{service.trim()}</Text>
                                      </View>
                                    ))
                                  : (
                                      <View style={styles.serviceItem}>
                                          <Text style={styles.serviceText}>Aucun service spécifié</Text>
                                      </View>
                                    )
                            }
                        </View>
                        
                        <Text style={styles.description}>{structure.description}</Text>
                        
                        <TouchableOpacity 
                            style={styles.messageButton}
                            onPress={() => router.push({
                                pathname: '/(screens)/EcrireMessageScreen',
                                params: { structureId: structure.id }
                            })}
                        >
                            <Ionicons name="chatbox-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Écrire un message</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Structures Disponibles</Text>
            </View>
            
            <Text style={styles.subtitle}>
                Maison des Femmes - Structures d'accueil et d'accompagnement
            </Text>

            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        textAlign: 'center',
    },
    scrollContainer: {
        padding: 15,
    },
    structureCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
    },
    structureName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginTop: 10,
        marginBottom: 8,
    },
    servicesList: {
        marginBottom: 10,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        paddingLeft: 5,
    },
    serviceText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginTop: 10,
        marginBottom: 15,
        lineHeight: 20,
    },
    messageButton: {
        backgroundColor: '#D81B60',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#D81B60',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 20,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default StructuresScreen; 