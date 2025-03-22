import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TextInput, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator,
    Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService, { DemandeAjoutLogement } from '../services/api';
import { useRouter } from 'expo-router';

const AjouterLogementScreen: React.FC = () => {
    // Ajouter le router pour la navigation
    const router = useRouter();
    
    // État pour les champs du formulaire
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [telephone, setTelephone] = useState('');
    const [email, setEmail] = useState('');
    const [raisonDemande, setRaisonDemande] = useState('');
    const [estProprio, setEstProprio] = useState(false);
    const [questionnaireComplete, setQuestionnaireComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [demandeEnvoyee, setDemandeEnvoyee] = useState(false);
    const [statut, setStatut] = useState<'en_attente' | 'approuvee' | 'refusee' | null>(null);
    const [demandeId, setDemandeId] = useState<string | null>(null);

    // Valider le formulaire de la première étape
    const validerFormulaireEtape1 = () => {
        if (!nom.trim() || !prenom.trim() || !telephone.trim() || !email.trim()) {
            Alert.alert('Champs manquants', 'Veuillez remplir tous les champs du formulaire.');
            return false;
        }
        
        // Validation simple de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.');
            return false;
        }
        
        // Validation simple du téléphone (format français)
        const phoneRegex = /^(0|\+33)[1-9]([-. ]?[0-9]{2}){4}$/;
        if (!phoneRegex.test(telephone)) {
            Alert.alert('Téléphone invalide', 'Veuillez entrer un numéro de téléphone valide.');
            return false;
        }
        
        return true;
    };

    // Valider le formulaire complet (pour la soumission finale)
    const validerFormulaire = () => {
        if (!nom.trim() || !prenom.trim() || !telephone.trim() || !email.trim() || !raisonDemande.trim()) {
            Alert.alert('Champs manquants', 'Veuillez remplir tous les champs du formulaire, y compris la raison de votre demande.');
            return false;
        }
        
        // Validation simple de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.');
            return false;
        }
        
        // Validation simple du téléphone (format français)
        const phoneRegex = /^(0|\+33)[1-9]([-. ]?[0-9]{2}){4}$/;
        if (!phoneRegex.test(telephone)) {
            Alert.alert('Téléphone invalide', 'Veuillez entrer un numéro de téléphone valide.');
            return false;
        }
        
        return true;
    };

    // Soumettre le questionnaire initial
    const soumettreQuestionnaire = () => {
        if (validerFormulaireEtape1()) {
            // Afficher les questions de confirmation
            Alert.alert(
                'Confirmation',
                'En ajoutant un logement, vous acceptez les conditions suivantes:\n\n' +
                '- Vos informations seront vérifiées par nos administrateurs\n' +
                '- Vous devrez fournir des informations précises sur le logement\n' +
                '- Vous pourrez être contacté pour vérifier les informations\n\n' +
                'Êtes-vous sûr de vouloir continuer?',
                [
                    {
                        text: 'Annuler',
                        style: 'cancel'
                    },
                    {
                        text: 'Continuer',
                        onPress: () => setQuestionnaireComplete(true)
                    }
                ]
            );
        }
    };

    // Soumettre la demande finale
    const soumettreDemande = async () => {
        if (!validerFormulaire()) return;
        
        setLoading(true);
        
        try {
            // Créer l'objet demande
            const demande: Omit<DemandeAjoutLogement, 'id'> = {
                nom,
                prenom,
                telephone,
                email,
                justificatif: '', // À implémenter avec upload de document
                statut: 'en_attente',
                dateCreation: new Date(),
                raisonDemande,
                estProprio
            };
            
            // Envoyer la demande à l'API
            const resultat = await apiService.envoyerDemandeAjoutLogement(demande);
            
            if (resultat.success && resultat.id) {
                // Stocker l'ID de la demande localement pour récupérer son statut ultérieurement
                await AsyncStorage.setItem('demandeAjoutLogementId', resultat.id);
                
                setDemandeId(resultat.id);
                setDemandeEnvoyee(true);
                setStatut('en_attente');
                
                Alert.alert(
                    'Demande envoyée',
                    'Votre demande a été enregistrée avec succès dans notre base de données. Un administrateur va examiner votre demande et vous recevrez une notification quand elle sera traitée.',
                    [
                        { text: 'OK' }
                    ]
                );
            } else {
                // Enregistrer localement en cas d'échec de l'API comme solution de secours
                const demandeLocale = { ...demande, id: Date.now().toString() };
                await AsyncStorage.setItem('demandeAjoutLogement', JSON.stringify(demandeLocale));
                
                setDemandeEnvoyee(true);
                setStatut('en_attente');
                
                console.warn("Fallback: stockage local utilisé car l'API a échoué");
                Alert.alert(
                    'Demande enregistrée localement',
                    'Votre demande a été enregistrée localement. Elle sera synchronisée avec le serveur dès que possible.',
                    [
                        { text: 'OK' }
                    ]
                );
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la demande:', error);
            Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer plus tard.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Récupérer le statut de la demande depuis le serveur
    const rafraichirStatutDemande = async () => {
        if (!demandeId) return;
        
        try {
            const demande = await apiService.getDemandeAjoutLogement(demandeId);
            if (demande) {
                setStatut(demande.statut);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du statut:', error);
        }
    };

    // Vérifier si une demande existe déjà au chargement
    React.useEffect(() => {
        const verifierDemande = async () => {
            try {
                // Vérifier d'abord s'il y a un ID de demande stocké
                const demandeIdStocke = await AsyncStorage.getItem('demandeAjoutLogementId');
                
                if (demandeIdStocke) {
                    setDemandeId(demandeIdStocke);
                    setDemandeEnvoyee(true);
                    
                    // Récupérer les détails de la demande depuis l'API
                    const demande = await apiService.getDemandeAjoutLogement(demandeIdStocke);
                    
                    if (demande) {
                        // Remplir les champs avec les données de l'API
                        setNom(demande.nom);
                        setPrenom(demande.prenom);
                        setTelephone(demande.telephone);
                        setEmail(demande.email);
                        setRaisonDemande(demande.raisonDemande);
                        setEstProprio(demande.estProprio);
                        setStatut(demande.statut);
                    } else {
                        // Fallback : vérifier dans le stockage local
                        fallbackVerifierDemandeLocale();
                    }
                } else {
                    // Vérifier dans le stockage local si pas d'ID stocké
                    fallbackVerifierDemandeLocale();
                }
            } catch (error) {
                console.error('Erreur lors de la vérification de la demande existante:', error);
                // Vérifier dans le stockage local en cas d'erreur
                fallbackVerifierDemandeLocale();
            }
        };
        
        const fallbackVerifierDemandeLocale = async () => {
            try {
                const demandeStockee = await AsyncStorage.getItem('demandeAjoutLogement');
                if (demandeStockee) {
                    const demande = JSON.parse(demandeStockee) as DemandeAjoutLogement;
                    setNom(demande.nom);
                    setPrenom(demande.prenom);
                    setTelephone(demande.telephone);
                    setEmail(demande.email);
                    setRaisonDemande(demande.raisonDemande);
                    setEstProprio(demande.estProprio);
                    setDemandeEnvoyee(true);
                    setStatut(demande.statut);
                }
            } catch (localError) {
                console.error('Erreur lors de la vérification locale:', localError);
            }
        };
        
        verifierDemande();
    }, []);

    // Afficher le statut de la demande
    if (demandeEnvoyee) {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Votre demande d'ajout de logement</Text>
                </View>
                
                <View style={styles.statusContainer}>
                    <View style={styles.statusCard}>
                        <View style={styles.statusHeader}>
                            <Ionicons 
                                name={
                                    statut === 'approuvee' 
                                        ? 'checkmark-circle' 
                                        : statut === 'refusee' 
                                        ? 'close-circle' 
                                        : 'time'
                                } 
                                size={40} 
                                color={
                                    statut === 'approuvee' 
                                        ? '#4CAF50' 
                                        : statut === 'refusee' 
                                        ? '#F44336' 
                                        : '#FF9800'
                                } 
                            />
                            <Text style={styles.statusTitle}>
                                {statut === 'approuvee' 
                                    ? 'Demande approuvée' 
                                    : statut === 'refusee' 
                                    ? 'Demande refusée' 
                                    : 'Demande en attente'}
                            </Text>
                        </View>
                        
                        <Text style={styles.statusDescription}>
                            {statut === 'approuvee' 
                                ? 'Votre demande a été approuvée. Vous pouvez maintenant ajouter votre logement.' 
                                : statut === 'refusee' 
                                ? 'Votre demande a été refusée. Veuillez contacter notre service client pour plus d\'informations.' 
                                : 'Votre demande est en cours d\'examen. Vous recevrez une notification dès qu\'elle sera traitée.'}
                        </Text>
                        
                        {/* Bouton pour rafraîchir le statut */}
                        {demandeId && (
                            <TouchableOpacity 
                                style={styles.refreshButton}
                                onPress={rafraichirStatutDemande}
                            >
                                <Ionicons name="refresh" size={18} color="#fff" />
                                <Text style={styles.refreshButtonText}>Actualiser le statut</Text>
                            </TouchableOpacity>
                        )}
                        
                        {statut === 'approuvee' && (
                            <TouchableOpacity 
                                style={styles.ajouterButton}
                                onPress={() => router.push('/(screens)/AjouterLogementFormScreen')}
                            >
                                <Text style={styles.ajouterButtonText}>Ajouter mon logement</Text>
                            </TouchableOpacity>
                        )}
                        
                        {statut === 'refusee' && (
                            <TouchableOpacity 
                                style={styles.contactButton}
                                onPress={() => Alert.alert(
                                    'Contacter l\'assistance',
                                    'Cette fonctionnalité sera bientôt disponible.'
                                )}
                            >
                                <Text style={styles.contactButtonText}>Contacter l'assistance</Text>
                            </TouchableOpacity>
                        )}
                        
                        {/* Bouton pour annuler/supprimer la demande */}
                        <TouchableOpacity 
                            style={styles.resetButton}
                            onPress={() => {
                                Alert.alert(
                                    'Supprimer la demande',
                                    'Êtes-vous sûr de vouloir supprimer votre demande ? Cette action ne peut pas être annulée.',
                                    [
                                        {
                                            text: 'Annuler',
                                            style: 'cancel'
                                        },
                                        {
                                            text: 'Supprimer',
                                            onPress: async () => {
                                                try {
                                                    // Ici, vous devriez idéalement appeler une API pour supprimer la demande côté serveur
                                                    
                                                    // Pour l'instant, supprimer seulement les références locales
                                                    await AsyncStorage.removeItem('demandeAjoutLogement');
                                                    await AsyncStorage.removeItem('demandeAjoutLogementId');
                                                    
                                                    setDemandeEnvoyee(false);
                                                    setDemandeId(null);
                                                    setStatut(null);
                                                    setQuestionnaireComplete(false);
                                                    
                                                    // Réinitialiser les champs du formulaire
                                                    setNom('');
                                                    setPrenom('');
                                                    setTelephone('');
                                                    setEmail('');
                                                    setRaisonDemande('');
                                                    setEstProprio(false);
                                                } catch (error) {
                                                    console.error('Erreur lors de la suppression de la demande:', error);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            <Text style={styles.resetButtonText}>Supprimer ma demande</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    }

    // Afficher le questionnaire de confirmation
    if (questionnaireComplete) {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Finaliser votre demande</Text>
                    <Text style={styles.subtitle}>Merci de confirmer ces dernières informations</Text>
                </View>
                
                <View style={styles.card}>
                    <View style={styles.formRow}>
                        <Text style={styles.label}>Êtes-vous le propriétaire du logement ?</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#D81B60" }}
                            thumbColor={estProprio ? "#fff" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={setEstProprio}
                            value={estProprio}
                        />
                    </View>
                    
                    <Text style={styles.label}>Pourquoi souhaitez-vous ajouter ce logement ? <Text style={styles.requiredField}>*</Text></Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Expliquez votre démarche (aide humanitaire, location solidaire, etc.)"
                        multiline
                        numberOfLines={4}
                        value={raisonDemande}
                        onChangeText={setRaisonDemande}
                    />
                    
                    <Text style={styles.note}>Les champs marqués d'un <Text style={styles.requiredField}>*</Text> sont obligatoires</Text>
                    
                    <Text style={styles.infoText}>
                        Votre demande sera enregistrée dans notre base de données et examinée par nos administrateurs. 
                        Vous recevrez une notification dès qu'elle sera traitée.
                    </Text>
                    
                    <TouchableOpacity 
                        style={[styles.submitButton, loading && styles.buttonDisabled]}
                        onPress={soumettreDemande}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Soumettre ma demande</Text>
                        )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => setQuestionnaireComplete(false)}
                        disabled={loading}
                    >
                        <Text style={styles.backButtonText}>Retour</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    // Afficher le formulaire initial
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Demande d'ajout de logement</Text>
                <Text style={styles.subtitle}>Remplissez ce formulaire pour commencer</Text>
            </View>
            
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Vos informations personnelles</Text>
                
                <Text style={styles.label}>Nom <Text style={styles.requiredField}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Votre nom"
                    value={nom}
                    onChangeText={setNom}
                />
                
                <Text style={styles.label}>Prénom <Text style={styles.requiredField}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Votre prénom"
                    value={prenom}
                    onChangeText={setPrenom}
                />
                
                <Text style={styles.label}>Téléphone <Text style={styles.requiredField}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Votre numéro de téléphone"
                    keyboardType="phone-pad"
                    value={telephone}
                    onChangeText={setTelephone}
                />
                
                <Text style={styles.label}>Email <Text style={styles.requiredField}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Votre adresse email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                
                <Text style={styles.note}>Les champs marqués d'un <Text style={styles.requiredField}>*</Text> sont obligatoires</Text>
                
                <TouchableOpacity 
                    style={styles.continueButton}
                    onPress={soumettreQuestionnaire}
                >
                    <Text style={styles.continueButtonText}>Continuer</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>
                    <Ionicons name="information-circle-outline" size={20} color="#D81B60" /> 
                    Pourquoi ajouter un logement ?
                </Text>
                <Text style={styles.infoContent}>
                    En ajoutant votre logement sur notre plateforme, vous contribuez à aider des personnes 
                    en situation d'urgence à trouver un hébergement temporaire.
                </Text>
                <Text style={styles.infoContent}>
                    Après vérification de vos informations par notre équipe, vous pourrez 
                    publier votre annonce et aider des personnes dans le besoin.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 16,
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
        marginTop: 5,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
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
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    continueButton: {
        backgroundColor: '#D81B60',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    continueButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#D81B60',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backButton: {
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        marginTop: 10,
    },
    backButtonText: {
        color: '#666',
        fontSize: 16,
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginVertical: 15,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#D81B60',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    infoContent: {
        fontSize: 14,
        color: '#555',
        marginBottom: 10,
        lineHeight: 20,
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    statusContainer: {
        marginBottom: 20,
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    statusTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    statusDescription: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        lineHeight: 22,
    },
    refreshButton: {
        backgroundColor: '#2196F3',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    refreshButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    ajouterButton: {
        backgroundColor: '#4CAF50',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    ajouterButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    contactButton: {
        backgroundColor: '#2196F3',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    contactButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    resetButton: {
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F44336',
        marginTop: 20,
    },
    resetButtonText: {
        color: '#F44336',
        fontWeight: '500',
    },
    demoContainer: {
        backgroundColor: '#FFF8E1',
        borderRadius: 8,
        padding: 16,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#FFE082',
    },
    demoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF8F00',
        marginBottom: 5,
    },
    demoText: {
        fontSize: 14,
        color: '#5D4037',
        marginBottom: 15,
    },
    demoButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    demoButton: {
        flex: 1,
        padding: 10,
        borderRadius: 4,
        alignItems: 'center',
        margin: 5,
    },
    demoButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    requiredField: {
        color: '#D81B60',
        fontWeight: 'bold',
    },
    note: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginVertical: 10,
    },
});

export default AjouterLogementScreen; 