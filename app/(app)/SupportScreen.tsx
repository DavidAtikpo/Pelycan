import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Linking, Alert, Image, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService, { Don } from '../services/api';

const SupportScreen: React.FC = () => {
    const [message, setMessage] = useState('');
    const [selectedDonationType, setSelectedDonationType] = useState<string | null>(null);
    const [donationDescription, setDonationDescription] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [donHistory, setDonHistory] = useState<Don[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    
    // Charger l'historique des dons au démarrage
    useEffect(() => {
        const loadDonHistory = async () => {
            try {
                setLoading(true);
                // Utiliser la fonction API pour récupérer les dons
                const dons = await apiService.getDons();
                setDonHistory(dons);
                setLoading(false);
            } catch (error) {
                console.error('Erreur lors du chargement des dons:', error);
                setLoading(false);
                Alert.alert(
                    'Erreur',
                    'Impossible de charger l\'historique de vos dons. Veuillez réessayer plus tard.'
                );
            }
        };
        
        loadDonHistory();
    }, []);
    
    // Fonction pour choisir une image depuis la galerie
    const pickImage = async () => {
        try {
            // Demander la permission d'accéder à la galerie
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos photos.');
                return;
            }
            
            // Lancer le sélecteur d'images
            setUploadingImage(true);
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
            }
            
            setUploadingImage(false);
        } catch (error) {
            console.error('Erreur lors de la sélection de l\'image:', error);
            setUploadingImage(false);
        }
    };
    
    // Fonction pour prendre une photo avec l'appareil photo
    const takePhoto = async () => {
        try {
            // Demander la permission d'accéder à l'appareil photo
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à votre appareil photo.');
                return;
            }
            
            // Lancer l'appareil photo
            setUploadingImage(true);
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
            }
            
            setUploadingImage(false);
        } catch (error) {
            console.error('Erreur lors de la prise de photo:', error);
            setUploadingImage(false);
        }
    };
    
    const handleDonation = async () => {
        if (selectedDonationType === 'financier') {
            if (!selectedAmount) {
                Alert.alert('Montant requis', 'Veuillez sélectionner un montant pour votre don');
                return;
            }
            
            // Envoyer le don financier via l'API
            setLoading(true);
            try {
                const nouveauDon = await apiService.envoyerDonFinancier(selectedAmount);
                
                // Ajouter le don à l'historique local
                setDonHistory(prev => [nouveauDon, ...prev]);
                setSelectedDonationType(null);
                setSelectedAmount(null);
                
                Alert.alert(
                    'Don effectué',
                    `Votre don de ${selectedAmount}€ a été enregistré. Merci pour votre générosité!`,
                    [{ text: 'OK' }]
                );
            } catch (error) {
                console.error('Erreur lors de l\'envoi du don financier:', error);
                Alert.alert(
                    'Erreur',
                    'Une erreur est survenue lors de l\'enregistrement de votre don. Veuillez réessayer plus tard.'
                );
            } finally {
                setLoading(false);
            }
        } else if (selectedDonationType === 'objets') {
            // Vérifier que tous les champs requis sont remplis
            if (!donationDescription.trim() || !contactInfo.trim() || !image) {
                Alert.alert(
                    'Information manquante', 
                    'Veuillez décrire votre don, laisser vos coordonnées et ajouter une photo de l\'objet.'
                );
                return;
            }
            
            // Envoyer le don d'objet via l'API
            setLoading(true);
            try {
                const donInfo = {
                    description: donationDescription,
                    coordonnees: contactInfo
                };
                
                const nouveauDon = await apiService.envoyerDonObjet(donInfo, image);
                
                // Ajouter le don à l'historique local
                setDonHistory(prev => [nouveauDon, ...prev]);
                setSelectedDonationType(null);
                setDonationDescription('');
                setContactInfo('');
                setImage(null);
                
                Alert.alert(
                    'Don enregistré',
                    'Votre don a été enregistré. Un membre de notre équipe vous contactera prochainement pour organiser la collecte de votre don.',
                    [{ text: 'OK' }]
                );
            } catch (error) {
                console.error('Erreur lors de l\'envoi du don d\'objet:', error);
                Alert.alert(
                    'Erreur',
                    'Une erreur est survenue lors de l\'enregistrement de votre don. Veuillez réessayer plus tard.'
                );
            } finally {
                setLoading(false);
            }
        }
    };
    
    // Définir les types de dons disponibles
    const donationTypes = [
        { 
            id: 'objets', 
            title: 'Don d\'objets', 
            description: 'Plutôt que de jeter, donnez vos objets (meubles, vêtements, électroménager...) à ceux qui en ont besoin.',
            iconName: 'cube-outline' 
        },
        { 
            id: 'financier', 
            title: 'Don financier', 
            description: 'Soutenez financièrement les personnes en situation d\'urgence et nos actions sur le terrain.',
            iconName: 'cash-outline'
        },
    ];

    const renderDonationForm = () => {
        if (selectedDonationType === 'objets') {
            return (
                <View style={styles.formContainer}>
                    <Text style={styles.formLabel}>Description des objets à donner:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Décrivez vos objets (type, état, dimensions...)"
                        multiline
                        numberOfLines={4}
                        value={donationDescription}
                        onChangeText={setDonationDescription}
                    />
                    
                    <Text style={styles.formLabel}>Photo de l'objet:</Text>
                    <View style={styles.imageUploadContainer}>
                        {image ? (
                            <View style={styles.previewContainer}>
                                <Image source={{ uri: image }} style={styles.imagePreview} />
                                <TouchableOpacity 
                                    style={styles.removeImageButton}
                                    onPress={() => setImage(null)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#D81B60" />
                                </TouchableOpacity>
                            </View>
                        ) : uploadingImage ? (
                            <View style={styles.uploadingContainer}>
                                <ActivityIndicator size="small" color="#D81B60" />
                                <Text style={styles.uploadingText}>Chargement...</Text>
                            </View>
                        ) : (
                            <View style={styles.imageButtonsContainer}>
                                <TouchableOpacity 
                                    style={styles.imageButton}
                                    onPress={pickImage}
                                >
                                    <Ionicons name="image-outline" size={24} color="#D81B60" />
                                    <Text style={styles.imageButtonText}>Galerie</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.imageButton}
                                    onPress={takePhoto}
                                >
                                    <Ionicons name="camera-outline" size={24} color="#D81B60" />
                                    <Text style={styles.imageButtonText}>Appareil photo</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    
                    <Text style={styles.formLabel}>Vos coordonnées:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Téléphone ou email pour vous contacter"
                        value={contactInfo}
                        onChangeText={setContactInfo}
                    />
                    
                    <TouchableOpacity 
                        style={[styles.donateButton, loading && styles.buttonDisabled]}
                        onPress={handleDonation}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.donateButtonText}>Enregistrer mon don</Text>
                        )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.cancelButton} 
                        onPress={() => {
                            setSelectedDonationType(null);
                            setDonationDescription('');
                            setContactInfo('');
                            setImage(null);
                        }}
                        disabled={loading}
                    >
                        <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                </View>
            );
        } else if (selectedDonationType === 'financier') {
            return (
                <View style={styles.formContainer}>
                    <Text style={styles.formInfoText}>
                        Votre don financier aide directement les personnes en situation d'urgence à se reloger et à reconstruire leur vie.
                    </Text>
                    
                    <View style={styles.amountContainer}>
                        {[10, 20, 50, 100].map(amount => (
                            <TouchableOpacity 
                                key={amount} 
                                style={[
                                    styles.amountButton,
                                    selectedAmount === amount && styles.selectedAmountButton
                                ]}
                                onPress={() => setSelectedAmount(amount)}
                            >
                                <Text style={[
                                    styles.amountText,
                                    selectedAmount === amount && styles.selectedAmountText
                                ]}>
                                    {amount}€
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    
                    <TouchableOpacity 
                        style={[styles.donateButton, loading && styles.buttonDisabled]}
                        onPress={handleDonation}
                        disabled={loading || !selectedAmount}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.donateButtonText}>
                                Faire un don {selectedAmount ? `de ${selectedAmount}€` : ''}
                            </Text>
                        )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.cancelButton} 
                        onPress={() => {
                            setSelectedDonationType(null);
                            setSelectedAmount(null);
                        }}
                        disabled={loading}
                    >
                        <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.taxInfo}>
                        66% de votre don est déductible de vos impôts, dans la limite de 20% de votre revenu imposable.
                    </Text>
                </View>
            );
        }
        return null;
    };
    
    // Fonction pour formater la date
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    };

    // Rendu de l'historique des dons
    const renderDonHistory = () => {
        if (donHistory.length === 0) {
            return (
                <View style={styles.emptyHistoryContainer}>
                    <Ionicons name="heart-outline" size={40} color="#D81B60" />
                    <Text style={styles.emptyHistoryText}>
                        Vous n'avez pas encore fait de don. Faites votre premier don pour contribuer à aider les personnes dans le besoin !
                    </Text>
                </View>
            );
        }
        
        return (
            <>
                {donHistory.map(don => (
                    <View key={don.id} style={styles.donHistoryItem}>
                        <View style={styles.donHeaderRow}>
                            <Text style={styles.donTypeText}>
                                {don.type === 'financier' ? 'Don financier' : 'Don d\'objet'}
                            </Text>
                            <View style={[
                                styles.statusBadge,
                                don.statut === 'recu' ? styles.statusReceived : styles.statusPending
                            ]}>
                                <Text style={styles.statusText}>
                                    {don.statut === 'recu' ? 'Reçu' : 'En attente'}
                                </Text>
                            </View>
                        </View>
                        
                        <Text style={styles.donDateText}>
                            {formatDate(don.date)}
                        </Text>
                        
                        {don.type === 'financier' && don.montant && (
                            <Text style={styles.donDetailText}>
                                Vous avez fait un don de <Text style={styles.highlightText}>{don.montant}€</Text>
                            </Text>
                        )}
                        
                        {don.type === 'objet' && (
                            <>
                                <Text style={styles.donDetailText}>
                                    {don.description}
                                </Text>
                                {don.imageUrl && (
                                    <Image 
                                        source={{ uri: don.imageUrl }} 
                                        style={styles.donImageThumbnail} 
                                        resizeMode="cover"
                                    />
                                )}
                            </>
                        )}
                    </View>
                ))}
            </>
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* En-tête */}
            <View style={styles.header}>
                <Text style={styles.title}>Faire un don</Text>
                <Text style={styles.subtitle}>Votre générosité aide ceux qui en ont besoin</Text>
            </View>

            {/* Sélection du type de don */}
            {!selectedDonationType ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Comment souhaitez-vous aider ?</Text>
                    
                    {donationTypes.map(type => (
                        <TouchableOpacity 
                            key={type.id} 
                            style={styles.donationTypeCard}
                            onPress={() => setSelectedDonationType(type.id)}
                        >
                            <View style={styles.donationTypeHeader}>
                                <Ionicons name={type.iconName as any} size={24} color="#D81B60" />
                                <Text style={styles.donationTypeTitle}>{type.title}</Text>
                            </View>
                            <Text style={styles.donationTypeDescription}>{type.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                renderDonationForm()
            )}
            
            {/* Historique des dons */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vos dons</Text>
                {loading && !selectedDonationType ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#D81B60" />
                        <Text style={styles.loadingText}>Chargement de vos dons...</Text>
                    </View>
                ) : (
                    renderDonHistory()
                )}
            </View>

            {/* Pourquoi donner */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pourquoi donner ?</Text>
                <View style={styles.impactCard}>
                    <Text style={styles.impactText}>
                        Chaque année, des centaines de personnes se retrouvent en situation d'urgence et ont besoin d'un logement ou d'équipements essentiels.
                    </Text>
                    <Text style={styles.impactStats}>
                        ✓ 100+ familles relogées l'année dernière
                    </Text>
                    <Text style={styles.impactStats}>
                        ✓ 500+ objets redistribués aux personnes en difficulté
                    </Text>
                    <Text style={styles.impactStats}>
                        ✓ 30+ structures d'accueil soutenues
                    </Text>
                        </View>
            </View>

            {/* Témoignages */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Témoignages</Text>
                <View style={styles.testimonialCard}>
                    <Text style={styles.testimonialText}>
                        "Grâce aux dons de meubles, j'ai pu aménager un appartement pour ma famille après avoir tout perdu dans un incendie."
                    </Text>
                    <Text style={styles.testimonialAuthor}>- Marie, 34 ans</Text>
                </View>
            </View>

            {/* Contactez-nous */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Besoin d'aide pour votre don ?</Text>
                <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('tel:0123456789')}>
                    <Ionicons name="call-outline" size={20} color="#fff" />
                    <Text style={styles.contactButtonText}>Appelez-nous</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('mailto:dons@pelycan.org')}>
                    <Ionicons name="mail-outline" size={20} color="#fff" />
                    <Text style={styles.contactButtonText}>Envoyez-nous un email</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F5F5F5',
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    donationTypeCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
    },
    donationTypeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    donationTypeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    donationTypeDescription: {
        fontSize: 14,
        color: '#555',
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
        elevation: 2,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    formInfoText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 15,
        lineHeight: 20,
    },
    input: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    imageUploadContainer: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        minHeight: 150,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    imageButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
    },
    imageButtonText: {
        color: '#D81B60',
        marginTop: 5,
        fontWeight: '500',
    },
    previewContainer: {
        width: '100%',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 15,
    },
    uploadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadingText: {
        color: '#D81B60',
        marginTop: 10,
    },
    donateButton: {
        backgroundColor: '#D81B60',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
    },
    donateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
    },
    amountContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    amountButton: {
        width: '48%',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedAmountButton: {
        backgroundColor: 'rgba(216, 27, 96, 0.1)',
        borderColor: '#D81B60',
    },
    amountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    selectedAmountText: {
        color: '#D81B60',
    },
    taxInfo: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        marginTop: 15,
        textAlign: 'center',
    },
    impactCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
    },
    impactText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
        lineHeight: 20,
    },
    impactStats: {
        fontSize: 14,
        color: '#D81B60',
        marginBottom: 5,
        fontWeight: '500',
    },
    testimonialCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#D81B60',
    },
    testimonialText: {
        fontSize: 14,
        color: '#333',
        fontStyle: 'italic',
        marginBottom: 10,
        lineHeight: 20,
    },
    testimonialAuthor: {
        fontSize: 14,
        color: '#555',
        textAlign: 'right',
        fontWeight: 'bold',
    },
    contactButton: {
        backgroundColor: '#D81B60',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    contactButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingText: {
        color: '#666',
        marginTop: 10,
    },
    donHistoryItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
    },
    donHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    donTypeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusPending: {
        backgroundColor: '#FEF3C7',
    },
    statusReceived: {
        backgroundColor: '#D1FAE5',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    donDateText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    donDetailText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
    },
    highlightText: {
        fontWeight: 'bold',
        color: '#D81B60',
    },
    donImageThumbnail: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginTop: 5,
    },
    emptyHistoryContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    emptyHistoryText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 10,
        lineHeight: 20,
    },
});

export default SupportScreen;