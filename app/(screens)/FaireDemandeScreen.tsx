import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import apiService from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Définition du type des paramètres sans contrainte de route
type RouteParams = {
    logementId?: string;
    hebergementId?: string;
    centreType?: 'accueil' | 'foyer';
}

const FaireDemandeScreen: React.FC = () => {
    // Accès aux paramètres sans générique
    const params = useLocalSearchParams();
    const logementId = params.logementId as string | undefined;
    const hebergementId = params.hebergementId as string | undefined;
    const centreType = params.centreType as 'accueil' | 'foyer' | undefined;

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [telephone, setTelephone] = useState('');
    const [email, setEmail] = useState('');
    const [personnes, setPersonnes] = useState('');
    const [urgence, setUrgence] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
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

    const getTitle = () => {
        if (logementId) {
            return 'Demande de Logement';
        } else if (hebergementId || centreType === 'foyer') {
            return 'Demande d\'Hébergement Temporaire';
        } else {
            return 'Demande d\'Hébergement';
        }
    };

    const handleSubmit = async () => {
        // Vérification des champs obligatoires
        if (!nom || !prenom || !telephone) {
            Alert.alert('Champs manquants', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        try {
            setSubmitting(true);
            
            // Création de l'objet demande
            const demande = {
                nom,
                prenom,
                telephone,
                email,
                nombrePersonnes: personnes,
                niveauUrgence: urgence,
                message,
                logementId,
                hebergementId,
                centreType,
                type: logementId ? 'logement' : hebergementId ? 'ht' : 'hebergement'
            };
            
            console.log('Envoi de la demande avec les données:', demande);
            
            // Envoi de la demande via le service API avec le token
            const resultat = await apiService.envoyerDemande(demande, token);
            
            setSubmitting(false);
            
            if (resultat.success) {
                Alert.alert(
                    'Demande envoyée',
                    'Votre demande a été envoyée avec succès. Un conseiller vous contactera dans les plus brefs délais.',
                    [
                        { 
                            text: 'OK', 
                            onPress: () => router.back() 
                        }
                    ]
                );
            } else {
                Alert.alert(
                    'Erreur',
                    'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            setSubmitting(false);
            console.error("Erreur lors de l'envoi de la demande:", error);
            Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.',
                [{ text: 'OK' }]
            );
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>{getTitle()}</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.subtitle}>
                    Veuillez remplir ce formulaire pour effectuer votre demande
                </Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nom <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={nom}
                        onChangeText={setNom}
                        placeholder="Votre nom"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Prénom <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={prenom}
                        onChangeText={setPrenom}
                        placeholder="Votre prénom"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Téléphone <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={telephone}
                        onChangeText={setTelephone}
                        placeholder="Votre numéro de téléphone"
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Votre email"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre de personnes concernées</Text>
                    <TextInput
                        style={styles.input}
                        value={personnes}
                        onChangeText={setPersonnes}
                        placeholder="Nombre d'adultes et d'enfants"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Niveau d'urgence</Text>
                    <TextInput
                        style={styles.input}
                        value={urgence}
                        onChangeText={setUrgence}
                        placeholder="Décrivez l'urgence de votre situation"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Message</Text>
                    <TextInput
                        style={[styles.input, styles.textarea]}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Décrivez votre situation et vos besoins"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Envoyer ma demande</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.note}>
                    Les champs marqués d'un <Text style={styles.required}>*</Text> sont obligatoires.
                </Text>

                <Text style={styles.confidentialite}>
                    Vos informations personnelles sont protégées et ne seront utilisées que dans le cadre de votre demande d'hébergement.
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
    formContainer: {
        padding: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
        fontWeight: '500',
    },
    required: {
        color: '#D81B60',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    textarea: {
        height: 120,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#D81B60',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 15,
    },
    disabledButton: {
        backgroundColor: '#999',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    note: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        textAlign: 'center',
    },
    confidentialite: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 20,
    }
});

export default FaireDemandeScreen; 