import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
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
    type: 'HEBERGEMENT' | 'ASSISTANCE' | 'LOGEMENT' | 'VIOLENCE' | 'GENERAL';
    message: string;
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
    const [showHistory, setShowHistory] = useState(false);
    const [showFirstAid, setShowFirstAid] = useState(false);
    const [showSecurity, setShowSecurity] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedType, setSelectedType] = useState<EmergencyRequest['type']>('GENERAL');
    const [selectedDescription, setSelectedDescription] = useState('');
    const [customDescription, setCustomDescription] = useState('');

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

    const emergencyOptions = {
        HEBERGEMENT: [
            "J'ai besoin d'un hébergement d'urgence pour la nuit",
            "Je suis sans abri et j'ai besoin d'un toit",
            "Je suis en situation de précarité et j'ai besoin d'un logement temporaire"
        ],
        ASSISTANCE: [
            "J'ai besoin d'une assistance immédiate",
            "Je suis en situation de détresse",
            "J'ai besoin d'aide pour une situation urgente"
        ],
        LOGEMENT: [
            "Je cherche un logement d'urgence",
            "Je suis menacé d'expulsion",
            "J'ai besoin d'un logement temporaire"
        ],
        VIOLENCE: [
            "Je suis victime de violence",
            "Je me sens en danger",
            "J'ai besoin d'aide pour une situation de violence"
        ],
        GENERAL: [
            "J'ai besoin d'aide d'urgence",
            "Je suis en situation de détresse",
            "J'ai besoin d'assistance immédiate"
        ]
    };

    const handleServicePress = (type: EmergencyRequest['type']) => {
        setSelectedType(type);
        setSelectedDescription('');
        setCustomDescription('');
        setShowRequestModal(true);
    };

    const sendEmergencyRequest = async () => {
        if (!location || !userId) {
            Alert.alert('Erreur', 'Impossible d\'envoyer la demande d\'urgence. Vérifiez votre connexion et votre localisation.');
            return;
        }

        const message = selectedDescription || customDescription;
        if (!message) {
            Alert.alert('Erreur', 'Veuillez sélectionner une option ou écrire votre message');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const pushToken = await AsyncStorage.getItem('pushToken');

            // Vérifier si le token push est enregistré
            if (!pushToken) {
                console.log('Token push non trouvé, mise à jour nécessaire');
                // Vous pouvez ajouter ici la logique pour demander à l'utilisateur de mettre à jour son token push
            }

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
                    type: selectedType,
                    message
                } as EmergencyRequest),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi de la demande d\'urgence');
            }

            const data = await response.json();
            Alert.alert(
                'Demande envoyée',
                `Les services d'urgence ont été notifiés de votre situation.\n${data.notifications_sent} professionnels ont été alertés.`,
                [{ text: 'OK' }]
            );
            setShowRequestModal(false);
            setSelectedDescription('');
            setCustomDescription('');
            
            // Recharger l'historique si nécessaire
            if (userId) {
                loadEmergencyHistory(userId);
            }
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
                        await sendEmergencyRequest();
                        Linking.openURL(`tel:${number}`);
                    }
                }
            ]
        );
    };

    const pelycanServices = [
        { 
            id: '1', 
            name: 'Hébergement\nimmédiat', 
            icon: 'home',
            type: 'HEBERGEMENT'
        },
        { 
            id: '2', 
            name: 'Assistance\nPelycan', 
            icon: 'people',
            type: 'ASSISTANCE'
        },
        { 
            id: '3', 
            name: 'Logement', 
            icon: 'business',
            type: 'LOGEMENT'
        },
        { 
            id: '4', 
            name: 'Signaler un\ncas de violence', 
            icon: 'warning',
            type: 'VIOLENCE'
        },
    ];

    const firstAidInstructions = [
        "1. Gardez votre calme et évaluez la situation",
        "2. Mettez-vous en sécurité",
        "3. Appelez les secours si nécessaire",
        "4. Restez avec la victime jusqu'à l'arrivée des secours",
        "5. Ne déplacez pas la victime sauf en cas de danger immédiat",
        "6. Suivez les instructions des opérateurs d'urgence"
    ];

    const securityInstructions = [
        "1. Verrouillez toutes les portes et fenêtres",
        "2. Gardez votre téléphone chargé et à portée de main",
        "3. Ayez un plan d'évacuation",
        "4. Identifiez les sorties de secours",
        "5. Conservez une liste de contacts d'urgence",
        "6. Signalez toute situation suspecte"
    ];

    const renderHistoryModal = () => (
        <Modal
            visible={showHistory}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowHistory(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Historique des demandes</Text>
                        <TouchableOpacity onPress={() => setShowHistory(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalScroll}>
                        {loadingHistory ? (
                            <ActivityIndicator size="large" color="#FF3B30" />
                        ) : history.length > 0 ? (
                            history.map((request) => (
                                <View key={request.id} style={styles.historyItem}>
                                    <View style={styles.historyHeader}>
                                        <Text style={styles.historyType}>{request.request_type}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                                            <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.historyDate}>
                                        {new Date(request.created_at).toLocaleString('fr-FR')}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noHistoryText}>Aucun historique disponible</Text>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderInstructionsModal = (visible: boolean, setVisible: (v: boolean) => void, title: string, instructions: string[]) => (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalScroll}>
                        {instructions.map((instruction, index) => (
                            <View key={index} style={styles.instructionItem}>
                                <Text style={styles.instructionText}>{instruction}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderRequestModal = () => (
        <Modal
            visible={showRequestModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowRequestModal(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Décrivez votre situation</Text>
                        <TouchableOpacity onPress={() => {
                            setShowRequestModal(false);
                            setSelectedDescription('');
                            setCustomDescription('');
                        }}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalScroll}>
                        <Text style={styles.modalSubtitle}>Sélectionnez une option :</Text>
                        
                        {emergencyOptions[selectedType].map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionButton,
                                    selectedDescription === option && styles.selectedOption
                                ]}
                                onPress={() => {
                                    setSelectedDescription(option);
                                    setCustomDescription('');
                                }}
                            >
                                <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}

                        {!selectedDescription && (
                            <>
                                <Text style={styles.modalSubtitle}>Ou écrivez votre message :</Text>
                                <TextInput
                                    style={styles.customInput}
                                    multiline
                                    numberOfLines={4}
                                    placeholder="Décrivez votre situation..."
                                    value={customDescription}
                                    onChangeText={(text) => {
                                        setCustomDescription(text);
                                        setSelectedDescription('');
                                    }}
                                />
                            </>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!selectedDescription && !customDescription) && styles.sendButtonDisabled
                            ]}
                            onPress={sendEmergencyRequest}
                            disabled={!selectedDescription && !customDescription}
                        >
                            <Text style={styles.sendButtonText}>Envoyer la demande</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

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
            {/* Header Rouge avec localisation */}
            <View style={styles.redHeader}>
                <View style={styles.headerTop}>
                    <Ionicons name="warning" size={24} color="white" />
                    <Text style={styles.headerText}>URGENCE</Text>
                </View>
                {location && (
                    <View style={styles.locationStatus}>
                        <Ionicons name="location" size={16} color="white" />
                        <Text style={styles.locationStatusText}>Localisation active</Text>
                    </View>
                )}
            </View>

            {/* Bouton d'appel d'urgence principal */}
            <TouchableOpacity 
                style={styles.mainEmergencyButton}
                onPress={() => handleEmergencyCall('112', 'GENERAL')}
            >
                <Ionicons name="call" size={32} color="white" />
                <View>
                    <Text style={styles.mainEmergencyText}>Appeler les secours</Text>
                    <Text style={styles.emergencyNumber}></Text>
                </View>
            </TouchableOpacity>

            {/* Grille des services Pelycan */}
            <View style={styles.servicesGrid}>
                {pelycanServices.map((service) => (
                    <TouchableOpacity 
                        key={service.id}
                        style={styles.serviceCard}
                        onPress={() => handleServicePress(service.type as EmergencyRequest['type'])}
                    >
                        <Ionicons name={service.icon as any} size={24} color="#FF3B30" />
                        <Text style={styles.serviceName}>{service.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Section Position actuelle */}
            {location && (
                <View style={styles.locationSection}>
                    <View style={styles.locationHeader}>
                        <Ionicons name="location" size={24} color="#FF3B30" />
                        <Text style={styles.locationTitle}>Votre Position</Text>
                        <TouchableOpacity style={styles.shareButton}>
                            <Text style={styles.shareButtonText}>Partager</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.locationAddress}>
                        {`Latitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}`}
                    </Text>
                </View>
            )}

            {/* Boutons d'information */}
            <View style={styles.infoButtonsContainer}>
                <TouchableOpacity 
                    style={styles.infoButton}
                    onPress={() => setShowHistory(true)}
                >
                    <Ionicons name="time" size={24} color="#FF3B30" />
                    <Text style={styles.infoButtonText}>Historique</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.infoButton}
                    onPress={() => setShowFirstAid(true)}
                >
                    <FontAwesome5 name="first-aid" size={24} color="#FF3B30" />
                    <Text style={styles.infoButtonText}>Premiers Secours</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.infoButton}
                    onPress={() => setShowSecurity(true)}
                >
                    <Ionicons name="shield-checkmark" size={24} color="#FF3B30" />
                    <Text style={styles.infoButtonText}>Consignes de Sécurité</Text>
                </TouchableOpacity>
            </View>

            {/* Message d'information */}
            <View style={styles.infoMessage}>
                <Text style={styles.infoMessageText}>
                    En cas d'urgence, restez calme et donnez des informations précises sur votre situation et votre localisation.
                </Text>
            </View>

            {/* Modals */}
            {renderHistoryModal()}
            {renderInstructionsModal(showFirstAid, setShowFirstAid, "Premiers Secours", firstAidInstructions)}
            {renderInstructionsModal(showSecurity, setShowSecurity, "Consignes de Sécurité", securityInstructions)}
            {renderRequestModal()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    redHeader: {
        backgroundColor: '#FF3B30',
        padding: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    locationStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    locationStatusText: {
        color: 'white',
        fontSize: 14,
    },
    mainEmergencyButton: {
        backgroundColor: '#FF3B30',
        margin: 15,
        padding: 20,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    mainEmergencyText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emergencyNumber: {
        color: 'white',
        fontSize: 16,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 15,
        gap: 15,
    },
    serviceCard: {
        backgroundColor: 'white',
        width: '47%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 10,
        textAlign: 'center',
        color: '#333',
    },
    locationSection: {
        backgroundColor: 'white',
        margin: 15,
        padding: 15,
        borderRadius: 10,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        marginLeft: 10,
    },
    shareButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
    },
    shareButtonText: {
        color: 'white',
        fontSize: 14,
    },
    locationAddress: {
        fontSize: 14,
        color: '#666',
    },
    infoButtonsContainer: {
        flexDirection: 'column',
        padding: 15,
        gap: 10,
    },
    infoButton: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        gap: 15,
    },
    infoButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    infoMessage: {
        backgroundColor: '#FFF3F3',
        margin: 15,
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#FF3B30',
    },
    infoMessageText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalScroll: {
        padding: 20,
    },
    historyItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyType: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    historyDate: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    noHistoryText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        padding: 20,
    },
    instructionItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    instructionText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    optionButton: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedOption: {
        backgroundColor: '#FFF3F3',
        borderColor: '#FF3B30',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    customInput: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    sendButton: {
        backgroundColor: '#FF3B30',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    sendButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalSubtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 10,
        marginTop: 20,
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
});

export default DemandeUrgenceScreen; 