import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import apiService from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/api';


interface Logement {
    id: string;
    titre: string;
    adresse: string;
    ville?: string;
    code_postal?: string;
    type_logement: string;
    nombre_pieces?: string;
    superficie?: string;
    loyer?: number;
    charges?: number;
    disponibilite: string;
    description: string;
    photos?: string[];
    permission: boolean;
}

const LogementsDisponiblesScreen: React.FC = () => {
    const [logements, setLogements] = useState<Logement[]>([]);
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
        const fetchLogements = async () => {
            try {
                setLoading(true);
                
                // Données mockées pour test si pas de connexion API
                if (process.env.NODE_ENV === 'development' && !token) {
                    // Simuler des données pour le développement
                    const mockData = [
                        {
                            id: '1',
                            titre: 'Appartement T2 Centre-Ville',
                            adresse: '15 Rue de la République, 75001 Paris',
                            ville: 'Paris',
                            code_postal: '75001',
                            type_logement: 'Appartement',
                            nombre_pieces: '2',
                            superficie: '45',
                            loyer: 600,
                            charges: 80,
                            disponibilite: 'Immédiate',
                            description: 'Appartement rénové en centre-ville, proche des commodités.',
                            image_url: 'https://example.com/image1.jpg',
                            permission: true
                        },
                        {
                            id: '2',
                            titre: 'Studio Meublé',
                            adresse: '25 Avenue Jean Jaurès, 75019 Paris',
                            ville: 'Paris',
                            code_postal: '75019',
                            type_logement: 'Studio',
                            nombre_pieces: '1',
                            superficie: '25',
                            loyer: 450,
                            charges: 50,
                            disponibilite: 'Sous 7 jours',
                            description: 'Studio entièrement meublé et équipé, idéal pour une personne seule.',
                            image_url: 'https://example.com/image2.jpg',
                            permission: true
                        }
                    ];
                    
                    setLogements(mockData);
                    setLoading(false);
                    return;
                }
                
                    // Appel à l'API avec le token
                const data = await apiService.getLogements(token);
                setLogements(data as unknown as Logement[]);
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors de la récupération des logements:", err);
                setError("Impossible de charger les logements disponibles");
                setLoading(false);
            }
        };

        fetchLogements();
    }, [token]);

    const retryFetchLogements = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getLogements(token);
                setLogements(data as unknown as Logement[]);
            setLoading(false);
        } catch (err) {
            console.error("Erreur lors de la récupération des logements:", err);
            setError("Impossible de charger les logements disponibles");
            setLoading(false);
        }
    };

    const renderLogement = ({ item }: { item: Logement }) => (
        <View style={styles.logementCard}>
            {item.photos && item.photos.length > 0 && (
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: item.photos[0] }} 
                        style={styles.logementImage}
                        resizeMode="cover"
                    />
                </View>
            )}
            <Text style={styles.logementNom}>{item.titre}</Text>
            <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={20} color="#D81B60" />
                    <Text style={styles.infoText}>{item.adresse}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="home-outline" size={20} color="#D81B60" />
                    <Text style={styles.infoText}>{item.type_logement} • {item.nombre_pieces} pièces</Text>
                </View>
                {item.superficie && (
                    <View style={styles.infoRow}>
                        <Ionicons name="resize-outline" size={20} color="#D81B60" />
                        <Text style={styles.infoText}>Superficie: {item.superficie} m²</Text>
                    </View>
                )}
                {(item.loyer || item.charges) && (
                    <View style={styles.infoRow}>
                        <Ionicons name="cash-outline" size={20} color="#D81B60" />
                        <Text style={styles.infoText}>
                            {item.loyer && `Loyer: ${item.loyer}€`}
                            {item.loyer && item.charges && ' • '}
                            {item.charges && `Charges: ${item.charges}€`}
                        </Text>
                    </View>
                )}
                <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={20} color="#D81B60" />
                    <Text style={styles.infoText}>Disponibilité: {item.disponibilite}</Text>
                </View>
                <Text style={styles.description}>{item.description}</Text>
            </View>
            <TouchableOpacity
                style={styles.demandeButton}
                onPress={() => router.push({
                    pathname: '/(screens)/FaireDemandeScreen',
                    params: { logementId: item.id }
                })}
            >
                <Ionicons name="create-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Faire une demande</Text>
            </TouchableOpacity>
        </View>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#D81B60" />
                    <Text style={styles.loadingText}>Chargement des logements...</Text>
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
                        onPress={retryFetchLogements}
                    >
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (logements.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="home-outline" size={50} color="#D81B60" />
                    <Text style={styles.emptyText}>Aucun logement disponible pour le moment</Text>
                </View>
            );
        }

        return (
            <FlatList
                data={logements}
                renderItem={renderLogement}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
            />
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
                <Text style={styles.title}>Logements Disponibles</Text>
            </View>
            
            <Text style={styles.subtitle}>
                Centre d'Accueil d'Urgence - Logements actuellement disponibles
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
    listContainer: {
        padding: 10,
    },
    logementCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    logementNom: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    infoContainer: {
        marginBottom: 15,
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
    description: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        marginBottom: 8,
    },
    demandeButton: {
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
    imageContainer: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 10,
    },
    logementImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
    },
});

export default LogementsDisponiblesScreen; 