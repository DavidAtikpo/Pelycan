import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image, ScrollView, Dimensions } from 'react-native';
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
    surface?: string;
    charges?: number;
    disponibilite: string;
    description: string;
    photos?: string[];
    permission: boolean;
    capacite?: number;
    equipements?: { [key: string]: any };
}

const { width: screenWidth } = Dimensions.get('window');

const LogementsDisponiblesScreen: React.FC = () => {
    const [logements, setLogements] = useState<Logement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [carouselIndexes, setCarouselIndexes] = useState<{ [logementId: string]: number }>({});
    const [openLogements, setOpenLogements] = useState<string[]>([]);

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

    const toggleLogement = (id: string) => {
        setOpenLogements(prev =>
            prev.includes(id)
                ? prev.filter(lid => lid !== id)
                : [...prev, id]
        );
    };

    const renderLogement = ({ item }: { item: Logement }) => {
        const isOpen = openLogements.includes(item.id);
        return (
            <View style={styles.logementCard}>
                {item.photos && item.photos.length > 0 && (
                    <View style={styles.imageContainer}>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            style={{ flex: 1 }}
                            onScroll={e => {
                                const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                                setCarouselIndexes(prev => ({ ...prev, [item.id]: idx }));
                            }}
                            scrollEventThrottle={16}
                        >
                            {item.photos.map((photo, idx) => (
                                <Image
                                    key={idx}
                                    source={{ uri: photo }}
                                    style={{ width: screenWidth, height: 150 }}
                                    resizeMode="cover"
                                />
                            ))}
                        </ScrollView>
                        <View style={styles.paginationContainer}>
                            {item.photos.map((_, idx) => (
                                <View
                                    key={idx}
                                    style={[styles.paginationDot, (carouselIndexes[item.id] || 0) === idx && styles.paginationDotActive]}
                                />
                            ))}
                        </View>
                    </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={styles.logementNom}>{item.titre}</Text>
                        <View style={styles.badgeContainer}>
                            <View style={styles.typeBadge}>
                                <Text style={styles.typeBadgeText}>{item.type_logement}</Text>
                            </View>
                        </View>
                        <Text style={styles.disponibiliteText}>{item.capacite ? `${item.capacite} places` : ''}{item.ville ? ` • ${item.ville}` : ''}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleLogement(item.id)}>
                        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={24} color="#D81B60" />
                    </TouchableOpacity>
                </View>
                {isOpen && (
                    <>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={18} color="#D81B60" />
                            <Text style={styles.infoText}>{item.adresse}{item.code_postal ? `, ${item.code_postal}` : ''}{item.ville ? ` ${item.ville}` : ''}</Text>
                        </View>
                        <Text style={styles.description}>{item.description}</Text>
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={18} color="#D81B60" />
                            <Text style={styles.infoText}>Disponibilité: {item.disponibilite}</Text>
                        </View>
                        {item.surface && (
                            <View style={styles.infoRow}>
                                <Ionicons name="resize-outline" size={18} color="#D81B60" />
                                <Text style={styles.infoText}>Surface: {item.surface} m²</Text>
                            </View>
                        )}
                        {item.equipements && Object.keys(item.equipements).length > 0 && (
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Équipements</Text>
                                <View style={styles.tagsContainer}>
                                    {Object.entries(item.equipements).map(([key, value]) => (
                                        value && (
                                            <View key={key} style={styles.tag}>
                                                <Text style={styles.tagText}>{key}</Text>
                                            </View>
                                        )
                                    ))}
                                </View>
                            </View>
                        )}
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
                    </>
                )}
            </View>
        );
    };

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
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#D81B60',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        color: '#666',
        fontSize: 12,
    },
    sectionContainer: {
        marginTop: 5,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeBadge: {
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 8,
    },
    typeBadgeText: {
        color: '#666',
        fontSize: 12,
    },
    disponibiliteText: {
        color: '#666',
        fontSize: 12,
    },
});

export default LogementsDisponiblesScreen; 