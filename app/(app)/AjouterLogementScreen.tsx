import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TextInput, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator,
    Switch,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService, { DemandeAjoutLogement, Logement } from '../services/api';
import { useRouter } from 'expo-router';
import { API_URL } from '../../config/api';

const AjouterLogementScreen: React.FC = () => {
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
    const [donneesStockees, setDonneesStockees] = useState(false);
    const [logementLocal, setLogementLocal] = useState<Logement | null>(null);
    const [showLogementDetails, setShowLogementDetails] = useState(false);

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
            const response = await fetch(`${API_URL}/demandes-ajout-logement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
                },
                body: JSON.stringify(demande)
            });

            const data = await response.json();
            if (response.ok) {
                // Stocker l'ID de la demande localement pour récupérer son statut ultérieurement
                await AsyncStorage.setItem('demandeAjoutLogementId', data.id);
                
                setDemandeId(data.id);
                setDemandeEnvoyee(true);
                setStatut('en_attente');
                setDonneesStockees(false);
                
                Alert.alert(
                    'Demande envoyée',
                    'Votre demande a été enregistrée avec succès dans notre base de données. Un administrateur va examiner votre demande et vous recevrez une notification quand elle sera traitée.',
                    [{ text: 'OK' }]
                );
            } else {
                // Enregistrer localement en cas d'échec de l'API comme solution de secours
                const demandeLocale = { ...demande, id: Date.now().toString() };
                await AsyncStorage.setItem('demandeAjoutLogement', JSON.stringify(demandeLocale));
                
                setDemandeEnvoyee(true);
                setStatut('en_attente');
                setDonneesStockees(true);
                
                console.warn("Fallback: stockage local utilisé car l'API a échoué");
                Alert.alert(
                    'Demande enregistrée localement',
                    'Votre demande a été enregistrée localement. Elle sera synchronisée avec le serveur dès que possible.',
                    [{ text: 'OK' }]
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
            const demande = await fetch(`${API_URL}/demandes-ajout-logement/${demandeId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
                }
            });

            if (!demande.ok) {
                throw new Error(`Erreur lors de la récupération de la demande: ${demande.status}`);
            }

            const data = await demande.json();
            setStatut(data.statut);
            if (data.statut === 'approuvee') {
                const logementStocke = await AsyncStorage.getItem('logementLocal');
                if (logementStocke) {
                    setLogementLocal(JSON.parse(logementStocke));
                }
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du statut:', error);
        }
    };

    // Fonction pour réessayer l'envoi des données
    const reessayerEnvoi = async () => {
        try {
            setLoading(true);
            
            // Récupérer les données stockées localement
            const demandeStockee = await AsyncStorage.getItem('demandeAjoutLogement');
            if (!demandeStockee) {
                Alert.alert('Erreur', 'Aucune donnée stockée trouvée');
                return;
            }

            const demande = JSON.parse(demandeStockee);
            
            // Envoyer la demande à l'API
            const response = await fetch(`${API_URL}/demandes-ajout-logement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
                },
                body: JSON.stringify(demande)
            });

            const data = await response.json();
            if (response.ok) {
                // Supprimer les données stockées localement
                await AsyncStorage.removeItem('demandeAjoutLogement');
                await AsyncStorage.setItem('demandeAjoutLogementId', data.id);
                
                setDemandeId(data.id);
                setDemandeEnvoyee(true);
                setStatut('en_attente');
                setDonneesStockees(false);
                
                Alert.alert(
                    'Succès',
                    'Votre demande a été envoyée avec succès cette fois-ci.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Erreur',
                    'L\'envoi a échoué. Les données restent stockées localement.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Erreur lors de la réessai:', error);
            Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de la réessai. Les données restent stockées localement.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    // Ajouter la fonction d'annulation
    const annulerDemande = async () => {
        if (!demandeId) return;
        
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/demandes-ajout-logement/${demandeId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
                }
            });
            
            if (response.ok) {
                // Supprimer les données stockées localement
                await AsyncStorage.removeItem('demandeAjoutLogement');
                await AsyncStorage.removeItem('demandeAjoutLogementId');
                
                setDemandeEnvoyee(false);
                setDemandeId(null);
                setStatut(null);
                setQuestionnaireComplete(false);
                setDonneesStockees(false);
                
                // Réinitialiser les champs du formulaire
                setNom('');
                setPrenom('');
                setTelephone('');
                setEmail('');
                setRaisonDemande('');
                setEstProprio(false);
                
                Alert.alert(
                    'Demande annulée',
                    'Votre demande a été annulée avec succès.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Erreur',
                    'Une erreur est survenue lors de l\'annulation de la demande.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Erreur lors de l\'annulation de la demande:', error);
            Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de l\'annulation de la demande.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    // Vérifier si une demande existe déjà au chargement
    useEffect(() => {
        const verifierDemande = async () => {
            try {
                // Vérifier d'abord s'il y a un ID de demande stocké
                const demandeIdStocke = await AsyncStorage.getItem('demandeAjoutLogementId');
                
                if (demandeIdStocke) {
                    setDemandeId(demandeIdStocke);
                    setDemandeEnvoyee(true);
                    
                    // Récupérer les détails de la demande depuis l'API
                    const demande = await fetch(`${API_URL}/demandes-ajout-logement/${demandeIdStocke}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
                        }
                    });
                    
                    if (demande.ok) {
                        const data = await demande.json();
                        // Remplir les champs avec les données de l'API
                        setNom(data.nom);
                        setPrenom(data.prenom);
                        setTelephone(data.telephone);
                        setEmail(data.email);
                        setRaisonDemande(data.raisonDemande);
                        setEstProprio(data.estProprio);
                        setStatut(data.statut);

                        // Si la demande est approuvée, vérifier s'il y a un logement local
                        if (data.statut === 'approuvee') {
                            const logementStocke = await AsyncStorage.getItem('logementLocal');
                            if (logementStocke) {
                                setLogementLocal(JSON.parse(logementStocke));
                            }
                        }
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
                        
                        {/* Bouton pour rafraîchir le statut uniquement si la demande n'est pas approuvée */}
                        {demandeId && statut !== 'approuvee' && (
                            <TouchableOpacity 
                                style={styles.refreshButton}
                                onPress={rafraichirStatutDemande}
                            >
                                <Ionicons name="refresh" size={18} color="#fff" />
                                <Text style={styles.refreshButtonText}>Actualiser le statut</Text>
                            </TouchableOpacity>
                        )}
                        
                        {/* Bouton de réessai si les données sont stockées localement */}
                        {donneesStockees && (
                            <TouchableOpacity 
                                style={styles.retryButton}
                                onPress={reessayerEnvoi}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload" size={18} color="#fff" />
                                        <Text style={styles.retryButtonText}>Réessayer l'envoi</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                        
                        {statut === 'approuvee' && (
                            <View>
                                {logementLocal ? (
                                    <View style={styles.logementCard}>
                                        <TouchableOpacity 
                                            style={styles.logementHeader}
                                            onPress={() => setShowLogementDetails(!showLogementDetails)}
                                        >
                                            <View style={styles.logementBasicInfo}>
                                                <Text style={styles.logementTitle}>{logementLocal.titre}</Text>
                                                <Text style={styles.logementType}>
                                                    Type d'hébergement: {logementLocal.type_hebergement === 'permanent' ? 'Permanent' : 'Temporaire'}
                                                </Text>
                                            </View>
                                            <Ionicons 
                                                name={showLogementDetails ? "chevron-up" : "chevron-down"} 
                                                size={24} 
                                                color="#666"
                                            />
                                        </TouchableOpacity>

                                        {showLogementDetails && (
                                            <View style={styles.logementDetails}>
                                                {logementLocal.photos && logementLocal.photos.length > 0 && (
                                                    <View style={styles.photosSection}>
                                                        <Text style={styles.sectionTitle}>Photos:</Text>
                                                        <ScrollView 
                                                            horizontal 
                                                            showsHorizontalScrollIndicator={false}
                                                            style={styles.photosContainer}
                                                        >
                                                            {logementLocal.photos.map((photo, index) => (
                                                                <Image
                                                                    key={index}
                                                                    source={{ uri: photo }}
                                                                    style={styles.photo}
                                                                    resizeMode="cover"
                                                                />
                                                            ))}
                                                        </ScrollView>
                                                    </View>
                                                )}

                                                <View style={styles.detailsSection}>
                                                    <Text style={styles.sectionTitle}>Description:</Text>
                                                    <Text style={styles.sectionText}>{logementLocal.description}</Text>
                                                    
                                                    <Text style={styles.sectionTitle}>Adresse:</Text>
                                                    <Text style={styles.sectionText}>{logementLocal.adresse}</Text>
                                                    <Text style={styles.sectionText}>{logementLocal.ville}</Text>
                                                    
                                                    <Text style={styles.sectionTitle}>Caractéristiques:</Text>
                                                    <View style={styles.caracteristiquesContainer}>
                                                        <Text style={styles.sectionText}>Capacité: {logementLocal.capacite} personnes</Text>
                                                        <Text style={styles.sectionText}>Surface: {logementLocal.surface} m²</Text>
                                                        <Text style={styles.sectionText}>Type: {logementLocal.type}</Text>
                                                    </View>
                                                    
                                                    {logementLocal.type_hebergement === 'temporaire' && (
                                                        <View>
                                                            <Text style={styles.sectionTitle}>Période d'hébergement:</Text>
                                                            <Text style={styles.sectionText}>
                                                                {logementLocal.date_debut && logementLocal.date_fin && (
                                                                    <>
                                                                        Du {new Date(logementLocal.date_debut).toLocaleDateString()} 
                                                                        au {new Date(logementLocal.date_fin).toLocaleDateString()}
                                                                    </>
                                                                )}
                                                            </Text>
                                                            <Text style={styles.sectionTitle}>Conditions temporaires:</Text>
                                                            <Text style={styles.sectionText}>{logementLocal.conditions_temporaire || 'Non spécifié'}</Text>
                                                        </View>
                                                    )}
                                                    
                                                    <Text style={styles.sectionTitle}>Équipements:</Text>
                                                    <View style={styles.equipementsGrid}>
                                                        {Object.entries(logementLocal.equipements).map(([key, value]) => (
                                                            value && (
                                                                <View key={key} style={styles.equipementItem}>
                                                                    <Ionicons name="checkmark-circle" size={16} color="#FF5722" />
                                                                    <Text style={styles.equipementText}>{key}</Text>
                                                                </View>
                                                            )
                                                        ))}
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                        
                                        <TouchableOpacity 
                                            style={styles.modifierButton}
                                            onPress={() => router.push({
                                                pathname: '/(screens)/AjouterLogementFormScreen',
                                                params: { logementId: logementLocal.id }
                                            })}
                                        >
                                            <Ionicons name="pencil" size={18} color="#fff" />
                                            <Text style={styles.modifierButtonText}>Modifier le logement</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity 
                                        style={styles.ajouterButton}
                                        onPress={() => router.push('/(screens)/AjouterLogementFormScreen')}
                                    >
                                        <Text style={styles.ajouterButtonText}>Ajouter mon logement</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
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
                        
                        {statut !== 'approuvee' && (
                            <TouchableOpacity 
                                style={styles.resetButton}
                                onPress={() => {
                                    Alert.alert(
                                        'Annuler la demande',
                                        'Êtes-vous sûr de vouloir annuler votre demande ? Cette action ne peut pas être annulée.',
                                        [
                                            {
                                                text: 'Non',
                                                style: 'cancel'
                                            },
                                            {
                                                text: 'Oui',
                                                onPress: annulerDemande,
                                                style: 'destructive'
                                            }
                                        ]
                                    );
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#F44336" />
                                ) : (
                                    <Text style={styles.resetButtonText}>Annuler ma demande</Text>
                                )}
                            </TouchableOpacity>
                        )}
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
    retryButton: {
        backgroundColor: '#FF9800',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    logementCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginVertical: 10,
        elevation: 2,
    },
    logementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    logementBasicInfo: {
        flex: 1,
    },
    logementTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    logementType: {
        fontSize: 14,
        color: '#666',
    },
    logementDetails: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
    },
    detailsSection: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 12,
        marginBottom: 4,
    },
    sectionText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    caracteristiquesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    equipementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 8,
    },
    equipementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    equipementText: {
        fontSize: 13,
        color: '#444',
        marginLeft: 6,
    },
    photosSection: {
        marginVertical: 12,
    },
    photosContainer: {
        flexDirection: 'row',
        marginTop: 8,
    },
    photo: {
        width: 180,
        height: 120,
        borderRadius: 8,
        marginRight: 8,
    },
    modifierButton: {
        backgroundColor: '#FF5722',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    modifierButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default AjouterLogementScreen; 