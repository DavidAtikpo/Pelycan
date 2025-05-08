import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import apiService from '../../services/api';    
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Hebergement {
    id: string;
    titre: string;
    description: string;
    adresse: string;
    ville: string;
    codePostal: string;
    type: string;
    capacite: number;
    surface: number;
    disponibilite: boolean;
    status: string;
    photos: string[];
    typeHebergement: string;
    dateDebut: string | null;
    dateFin: string | null;
    conditionsTemporaire: string | null;
    dateCreation: string;
    dateModification: string;
    proprietaireId: string;
    equipements: Record<string, boolean>;
}

const { width: screenWidth } = Dimensions.get('window');

const HebergementsTemporairesScreen: React.FC = () => {
    const [hebergements, setHebergements] = useState<Hebergement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [carouselIndexes, setCarouselIndexes] = useState<{ [hebergementId: string]: number }>({});
    const [openHebergements, setOpenHebergements] = useState<string[]>([]);

    const toggleHebergement = (id: string) => {
        setOpenHebergements(prev =>
            prev.includes(id)
                ? prev.filter(hid => hid !== id)
                : [...prev, id]
        );
    };

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
        const fetchHebergements = async () => {
            try {
                setLoading(true);
                
                // Données mockées pour test si pas de connexion API
                if (process.env.NODE_ENV === 'development' && !token) {
                    // Simuler des données pour le développement
                    const mockData = [
                        {
                            id: '1',
                            titre: 'Centre d\'Hébergement Temporaire',
                            description: 'Centre d\'accueil pour situations d\'urgence, ouvert 24h/24.',
                            adresse: '10 Rue de la Paix, 75001 Paris',
                            ville: 'Paris',
                            codePostal: '75001',
                            type: 'Urgence',
                            capacite: 5,
                            surface: 0,
                            disponibilite: true,
                            status: 'active',
                            photos: [],
                            typeHebergement: 'Urgence',
                            dateDebut: null,
                            dateFin: null,
                            conditionsTemporaire: 'Aucune condition particulière',
                            dateCreation: '2024-04-01',
                            dateModification: '2024-04-01',
                            proprietaireId: '',
                            equipements: {}
                        },
                        // Ajoutez d'autres hébergements mockés si nécessaire
                    ];
                    
                    setHebergements(mockData);
                    setLoading(false);
                    return;
                }
                
                // Appel à l'API avec le token
                const data = await apiService.getHebergementsTemporaires(token);
                console.log('Données reçues:', data); // Pour déboguer
                setHebergements(data as Hebergement[]);
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors de la récupération des hébergements:", err);
                setError("Impossible de charger les hébergements disponibles");
                setLoading(false);
            }
        };

        fetchHebergements();
    }, [token]);

    const retryFetchHebergements = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getHebergementsTemporaires(token);
            setHebergements(data as Hebergement[]);
            setLoading(false);
        } catch (err) {
            console.error("Erreur lors de la récupération des hébergements:", err);
            setError("Impossible de charger les hébergements disponibles");
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#D81B60" />
                    <Text style={styles.loadingText}>Chargement des hébergements...</Text>
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
                        onPress={retryFetchHebergements}
                    >
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (hebergements.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="home-outline" size={50} color="#D81B60" />
                    <Text style={styles.emptyText}>Aucun hébergement temporaire disponible pour le moment</Text>
                </View>
            );
        }

        return (
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {hebergements.map((hebergement) => {
                    const isOpen = openHebergements.includes(hebergement.id);
                    return (
                        <View key={hebergement.id} style={styles.hebergementCard}>
                            {hebergement.photos && hebergement.photos.length > 0 && (
                                <View style={styles.imageContainer}>
                                    <ScrollView
                                        horizontal
                                        pagingEnabled
                                        showsHorizontalScrollIndicator={false}
                                        onScroll={e => {
                                            const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                                            setCarouselIndexes(prev => ({ ...prev, [hebergement.id]: idx }));
                                        }}
                                        scrollEventThrottle={16}
                                    >
                                        {hebergement.photos.map((photo, idx) => (
                                            <Image
                                                key={idx}
                                                source={{ uri: photo }}
                                                style={[styles.hebergementImage, { width: screenWidth }]}
                                                resizeMode="cover"
                                            />
                                        ))}
                                    </ScrollView>
                                    <View style={styles.paginationContainer}>
                                        {hebergement.photos.map((_, idx) => (
                                            <View
                                                key={idx}
                                                style={[styles.paginationDot, (carouselIndexes[hebergement.id] || 0) === idx && styles.paginationDotActive]}
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={styles.hebergementName}>{hebergement.titre}</Text>
                                    <View style={styles.badgeContainer}>
                                        <View style={styles.typeBadge}>
                                            <Text style={styles.typeBadgeText}>{hebergement.type}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.disponibiliteText}>{hebergement.capacite} places</Text>
                                </View>
                                <TouchableOpacity onPress={() => toggleHebergement(hebergement.id)}>
                                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={24} color="#D81B60" />
                                </TouchableOpacity>
                            </View>
                            {isOpen && (
                                <>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="location-outline" size={18} color="#D81B60" />
                                        <Text style={styles.infoText}>
                                            {hebergement.adresse}, {hebergement.codePostal} {hebergement.ville}
                                        </Text>
                                    </View>
                                    <Text style={styles.description}>{hebergement.description}</Text>
                                    {(hebergement.dateDebut || hebergement.dateFin) && (
                                        <View style={styles.sectionContainer}>
                                            <Text style={styles.sectionTitle}>Disponibilité</Text>
                                            <Text style={styles.infoText}>
                                                {hebergement.dateDebut && `Du ${new Date(hebergement.dateDebut).toLocaleDateString()} `}
                                                {hebergement.dateFin && `au ${new Date(hebergement.dateFin).toLocaleDateString()}`}
                                            </Text>
                                        </View>
                                    )}
                                    {hebergement.conditionsTemporaire && (
                                        <View style={styles.sectionContainer}>
                                            <Text style={styles.sectionTitle}>Conditions</Text>
                                            <Text style={styles.infoText}>{hebergement.conditionsTemporaire}</Text>
                                        </View>
                                    )}
                                    {hebergement.equipements && Object.keys(hebergement.equipements).length > 0 && (
                                        <View style={styles.sectionContainer}>
                                            <Text style={styles.sectionTitle}>Équipements</Text>
                                            <View style={styles.tagsContainer}>
                                                {Object.entries(hebergement.equipements).map(([key, value]) => (
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
                                        style={styles.requestButton}
                                        onPress={() => router.push({ 
                                            pathname: '/(screens)/FaireDemandeScreen', 
                                            params: { 
                                                centreType: hebergement.type.toLowerCase(),
                                                logementId: hebergement.id
                                            } 
                                        })}
                                    >
                                        <Text style={styles.requestButtonText}>Faire une demande</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    );
                })}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Pour toute question sur les hébergements temporaires, contactez-nous au numéro d'urgence
                    </Text>
                </View>
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
                <Text style={styles.title}>Hébergements Temporaires</Text>
            </View>
            
            <Text style={styles.subtitle}>
                Logements d'urgence disponibles pour un hébergement immédiat
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
    hebergementCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    hebergementName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    badgeContainer: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    typeBadge: {
        backgroundColor: '#E91E63',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    typeBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    disponibiliteContainer: {
        backgroundColor: '#F0F4FF',
        borderRadius: 4,
        padding: 8,
        alignItems: 'center',
    },
    disponibiliteText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2962FF',
    },
    disponibiliteLabel: {
        fontSize: 10,
        color: '#666',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 5,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 10,
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
    requestButton: {
        backgroundColor: '#D81B60',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    requestButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 10,
        marginBottom: 30,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
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
        marginBottom: 15,
        borderRadius: 8,
        overflow: 'hidden',
    },
    hebergementImage: {
        width: '100%',
        height: 180,
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
        marginHorizontal: 3,
    },
    paginationDotActive: {
        backgroundColor: '#D81B60',
    },
});

export default HebergementsTemporairesScreen; 