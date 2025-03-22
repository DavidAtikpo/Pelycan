import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import apiService from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Utilisez Record<string, string> pour les params de route
type RouteParams = {
    structureId: string;
}

interface Structure {
    id: string;
    nom: string;
}

const EcrireMessageScreen: React.FC = () => {
    // Accédez aux paramètres sans générique
    const params = useLocalSearchParams();
    const structureId = params.structureId as string;
    
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [structure, setStructure] = useState<Structure | null>(null);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        const fetchStructureInfo = async () => {
            try {
                setLoading(true);
                
                // Données mockées pour test si pas de connexion API
                if (process.env.NODE_ENV === 'development' && !token) {
                    if (structureId) {
                        const mockStructure = {
                            id: structureId,
                            nom: "Centre d'Accueil " + structureId
                        };
                        setStructure(mockStructure);
                    } else {
                        setError("Identifiant de structure manquant");
                    }
                    setLoading(false);
                    return;
                }
                
                // Appel à l'API avec le token
                const structures = await apiService.getStructures(token);
                const foundStructure = structures.find((s: any) => s.id === structureId);
                
                if (foundStructure) {
                    setStructure({
                        id: foundStructure.id,
                        nom: foundStructure.nom
                    });
                } else {
                    setError("Structure non trouvée");
                }
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors de la récupération de la structure:", err);
                setError("Impossible de charger les informations de la structure");
                setLoading(false);
            }
        };

        if (structureId) {
            fetchStructureInfo();
        } else {
            setError("Identifiant de structure manquant");
            setLoading(false);
        }
    }, [structureId, token]);

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert('Message vide', 'Veuillez saisir un message avant d\'envoyer.');
            return;
        }

        if (!structureId) {
            Alert.alert('Erreur', 'Impossible d\'identifier la structure destinataire.');
            return;
        }

        try {
            setSubmitting(true);
            
            const messageData = {
                structureId,
                message: message.trim(),
                date: new Date(),
            };
            
            // Envoi du message avec le token
            const success = await apiService.envoyerMessage(messageData, token);
            
            if (success) {
                Alert.alert(
                    'Message envoyé',
                    'Votre message a été envoyé avec succès.',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                throw new Error("Échec de l'envoi du message");
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#D81B60" />
                    <Text style={styles.loadingText}>Chargement des informations...</Text>
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
                        onPress={() => router.back()}
                    >
                        <Text style={styles.retryButtonText}>Retour</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <KeyboardAwareScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.messageBox}>
                    <Text style={styles.messageBoxTitle}>
                        Message pour : {structure?.nom || 'Structure'}
                    </Text>
                    
                    <TextInput
                        style={styles.messageInput}
                        placeholder="Écrivez votre message ici..."
                        multiline={true}
                        numberOfLines={8}
                        value={message}
                        onChangeText={setMessage}
                    />
                    
                    <Text style={styles.hint}>
                        Votre message sera transmis directement à la structure concernée.
                        Un retour sera fait dans les meilleurs délais.
                    </Text>
                    
                    <TouchableOpacity 
                        style={[styles.submitButton, !message.trim() && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={!message.trim() || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="send" size={20} color="#fff" />
                                <Text style={styles.submitButtonText}>Envoyer le message</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
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
                <Text style={styles.title}>Écrire un message</Text>
            </View>
            
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 15,
    },
    messageBox: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
    },
    messageBoxTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    messageInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: '#333',
        minHeight: 180,
        textAlignVertical: 'top',
    },
    hint: {
        fontSize: 14,
        color: '#666',
        marginTop: 10,
        marginBottom: 20,
        lineHeight: 20,
    },
    submitButton: {
        backgroundColor: '#D81B60',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#cccccc',
    },
    submitButtonText: {
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
        marginBottom: 15,
    },
    retryButton: {
        backgroundColor: '#D81B60',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EcrireMessageScreen; 