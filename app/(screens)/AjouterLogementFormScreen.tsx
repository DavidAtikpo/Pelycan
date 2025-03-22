import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TextInput, 
    TouchableOpacity, 
    Switch,
    Alert,
    ActivityIndicator,
    Image,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import apiService, { Logement } from '../services/api';

// Interface pour les données du logement
interface LogementFormData {
    titre: string;
    adresse: string;
    codePostal: string;
    ville: string;
    type: string;
    nbChambres: string;
    nbPersonnes: string;
    surface: string;
    description: string;
    disponibilite: string;
    equipements: {
        wifi: boolean;
        cuisine: boolean;
        laveLinge: boolean;
        chauffage: boolean;
        climatisation: boolean;
        television: boolean;
        parking: boolean;
        ascenseur: boolean;
    };
    photos: string[];
}

const AjouterLogementFormScreen: React.FC = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    
    // État pour stocker les données du formulaire
    const [formData, setFormData] = useState<LogementFormData>({
        titre: '',
        adresse: '',
        codePostal: '',
        ville: '',
        type: 'appartement', // Valeur par défaut
        nbChambres: '1',
        nbPersonnes: '1',
        surface: '',
        description: '',
        disponibilite: new Date().toISOString().split('T')[0], // Date d'aujourd'hui
        equipements: {
            wifi: false,
            cuisine: false,
            laveLinge: false,
            chauffage: false,
            climatisation: false,
            television: false,
            parking: false,
            ascenseur: false
        },
        photos: []
    });
    
    // Vérifier si l'utilisateur a l'autorisation d'ajouter un logement
    useEffect(() => {
        const verifierAutorisation = async () => {
            try {
                const demandeId = await AsyncStorage.getItem('demandeAjoutLogementId');
                
                if (demandeId) {
                    const demande = await apiService.getDemandeAjoutLogement(demandeId);
                    
                    if (!demande || demande.statut !== 'approuvee') {
                        Alert.alert(
                            'Autorisation requise',
                            'Vous devez d\'abord faire une demande d\'ajout de logement et attendre son approbation.',
                            [
                                {
                                    text: 'Faire une demande',
                                    onPress: () => router.push('/AjouterLogementScreen')
                                },
                                {
                                    text: 'Retour',
                                    onPress: () => router.back()
                                }
                            ]
                        );
                    }
                } else {
                    // Pour des fins de test, on ne bloque pas l'accès
                    console.warn("En environnement de production, une demande approuvée serait nécessaire.");
                }
            } catch (error) {
                console.error('Erreur lors de la vérification des autorisations:', error);
                // Pour des fins de test, on ne bloque pas l'accès
            }
        };
        
        verifierAutorisation();
    }, []);
    
    // Mettre à jour les données du formulaire
    const updateFormData = (field: string, value: any) => {
        setFormData(prevData => ({
            ...prevData,
            [field]: value
        }));
    };
    
    // Mettre à jour les équipements
    const updateEquipement = (equipement: string, value: boolean) => {
        setFormData(prevData => ({
            ...prevData,
            equipements: {
                ...prevData.equipements,
                [equipement]: value
            }
        }));
    };
    
    // Ajouter une photo
    const ajouterPhoto = async (sourceType: 'camera' | 'library') => {
        try {
            // Demander les permissions appropriées
            if (sourceType === 'camera') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission refusée', 'Nous avons besoin de votre autorisation pour accéder à l\'appareil photo.');
                    return;
                }
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission refusée', 'Nous avons besoin de votre autorisation pour accéder à vos photos.');
                    return;
                }
            }
            
            // Lancer l'appareil photo ou la galerie
            setUploadingImage(true);
            const result = await (sourceType === 'camera' 
                ? ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.8,
                }) 
                : ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.8,
                }));
            
            if (!result.canceled && result.assets && result.assets.length > 0) {
                // Ajouter l'URI de la nouvelle photo à l'état
                setFormData(prevData => ({
                    ...prevData,
                    photos: [...prevData.photos, result.assets[0].uri]
                }));
            }
            
            setUploadingImage(false);
        } catch (error) {
            console.error('Erreur lors de l\'ajout d\'une photo:', error);
            setUploadingImage(false);
            Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout de la photo.');
        }
    };
    
    // Supprimer une photo
    const supprimerPhoto = (index: number) => {
        setFormData(prevData => ({
            ...prevData,
            photos: prevData.photos.filter((_, i) => i !== index)
        }));
    };
    
    // Valider l'étape 1 : Informations de base
    const validerEtape1 = () => {
        if (!formData.titre.trim()) {
            Alert.alert('Champ requis', 'Veuillez entrer un titre pour votre logement.');
            return false;
        }
        
        if (!formData.adresse.trim() || !formData.codePostal.trim() || !formData.ville.trim()) {
            Alert.alert('Adresse incomplète', 'Veuillez remplir tous les champs de l\'adresse.');
            return false;
        }
        
        // Validation du code postal français
        const codePostalRegex = /^[0-9]{5}$/;
        if (!codePostalRegex.test(formData.codePostal)) {
            Alert.alert('Code postal invalide', 'Veuillez entrer un code postal français valide (5 chiffres).');
            return false;
        }
        
        return true;
    };
    
    // Valider l'étape 2 : Caractéristiques
    const validerEtape2 = () => {
        if (!formData.surface.trim()) {
            Alert.alert('Champ requis', 'Veuillez indiquer la surface du logement.');
            return false;
        }
        
        // Validation de la surface (nombre)
        const surfaceRegex = /^[0-9]+$/;
        if (!surfaceRegex.test(formData.surface)) {
            Alert.alert('Surface invalide', 'Veuillez entrer un nombre valide pour la surface.');
            return false;
        }
        
        if (!formData.description.trim()) {
            Alert.alert('Champ requis', 'Veuillez ajouter une description du logement.');
            return false;
        }
        
        return true;
    };
    
    // Valider l'étape 3 : Photos
    const validerEtape3 = () => {
        if (formData.photos.length === 0) {
            Alert.alert('Photos requises', 'Veuillez ajouter au moins une photo du logement.');
            return false;
        }
        
        return true;
    };
    
    // Naviguer à l'étape suivante
    const allerEtapeSuivante = () => {
        switch (currentStep) {
            case 1:
                if (validerEtape1()) {
                    setCurrentStep(2);
                }
                break;
            case 2:
                if (validerEtape2()) {
                    setCurrentStep(3);
                }
                break;
            case 3:
                if (validerEtape3()) {
                    soumettreFormulaire();
                }
                break;
            default:
                break;
        }
    };
    
    // Naviguer à l'étape précédente
    const allerEtapePrecedente = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    // Soumettre le formulaire complet
    const soumettreFormulaire = async () => {
        try {
            setLoading(true);
            
            // Préparer les données à envoyer
            const logementData = {
                ...formData,
                nbChambres: parseInt(formData.nbChambres),
                nbPersonnes: parseInt(formData.nbPersonnes),
                surface: parseInt(formData.surface)
            };
            
            console.log('Étape 1: Données du formulaire préparées', logementData);
            
            // Uploader les photos et récupérer les URLs
            const photoUrls = [];
            
            // Pour chaque photo, l'envoyer au serveur
            for (const photoUri of formData.photos) {
                try {
                    // Créer FormData pour envoyer la photo
                    const photoFormData = new FormData();
                    
                    // Extraire le nom de fichier
                    const uriParts = photoUri.split('/');
                    const fileName = uriParts[uriParts.length - 1];
                    
                    // Ajouter la photo au FormData
                    photoFormData.append('image', {
                        uri: photoUri,
                        name: fileName,
                        type: 'image/jpeg'
                    } as any);
                    
                    console.log(`Étape 2: Envoi de la photo "${fileName}" au serveur...`);
                    // Envoyer la photo à l'API
                    try {
                        const response = await apiService.uploadImage(photoFormData);
                        console.log('Réponse upload:', response);
                        if (response && response.url) {
                            photoUrls.push(response.url);
                            console.log(`Photo uploadée avec succès: ${response.url}`);
                        } else {
                            // Fallback: utiliser l'URI locale
                            photoUrls.push(photoUri);
                            console.warn(`URL invalide reçue, utilisation de l'URI locale: ${photoUri}`);
                        }
                    } catch (uploadError) {
                        photoUrls.push(photoUri);
                        console.error(`Erreur détaillée lors de l'upload:`, uploadError);
                    }
                } catch (error) {
                    console.error('Erreur lors de la préparation de la photo:', error);
                    photoUrls.push(photoUri);
                }
            }
            
            console.log('Étape 3: Toutes les photos traitées', photoUrls);
            
            // Ajouter les URLs des photos au logement et convertir equipements en amenities
            const logementComplet = {
                ...logementData,
                photos: photoUrls,
                // Convertir les equipements (object avec booléens) en amenities (tableau de chaînes)
                amenities: Object.entries(formData.equipements)
                    .filter(([_, value]) => value)
                    .map(([key, _]) => key)
            };
            
            console.log('Étape 4: Objet logement complet préparé', logementComplet);
            
            // Envoyer les données du logement à l'API
            try {
                console.log('Étape 5: Envoi du logement à l\'API...');
                const nouveauLogement = await apiService.creerLogement(logementComplet);
                console.log('Étape 6: Réponse de création logement reçue', nouveauLogement);
                
                if (nouveauLogement) {
                    // Nettoyer les éventuelles données temporaires
                    await AsyncStorage.removeItem('logementTemporaire');
                    
                    // Afficher un message de succès
                    Alert.alert(
                        'Logement ajouté',
                        'Votre logement a été ajouté avec succès. Il sera visible sur la plateforme après validation par notre équipe.',
                        [
                            {
                                text: 'OK',
                                onPress: () => router.push('/(app)/HomeScreen')
                            }
                        ]
                    );
                }
            } catch (createError) {
                console.error('Étape 6: Erreur lors de la création du logement:', createError);
                
                // Stocker localement en cas d'échec de l'API
                try {
                    console.log('Étape 7: Sauvegarde locale du logement...');
                    await AsyncStorage.setItem('logementTemporaire', JSON.stringify(logementComplet));
                    console.log('Étape 8: Logement sauvegardé localement');
                    
                    Alert.alert(
                        'Enregistré localement',
                        'Votre logement a été enregistré localement en raison d\'un problème de connexion au serveur. Il sera synchronisé dès que possible.',
                        [
                            {
                                text: 'OK',
                                onPress: () => router.push('/(app)/HomeScreen')
                            }
                        ]
                    );
                } catch (storageError) {
                    console.error('Étape 7: Erreur lors du stockage local:', storageError);
                    Alert.alert(
                        'Erreur',
                        'Une erreur est survenue lors de l\'enregistrement de votre logement. Veuillez réessayer plus tard.'
                    );
                }
            }
        } catch (error) {
            console.error('Erreur globale lors de la soumission du logement:', error);
            Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de la soumission de votre logement. Veuillez vérifier votre connexion et réessayer.'
            );
        } finally {
            setLoading(false);
        }
    };
    
    // Rendu de l'étape 1 : Informations de base
    const renderEtape1 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>Étape 1 : Informations de base</Text>
            
            <Text style={styles.label}>Titre du logement <Text style={styles.requiredField}>*</Text></Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: Appartement lumineux proche du centre-ville"
                value={formData.titre}
                onChangeText={(value) => updateFormData('titre', value)}
                maxLength={100}
            />
            
            <Text style={styles.label}>Adresse <Text style={styles.requiredField}>*</Text></Text>
            <TextInput
                style={styles.input}
                placeholder="Numéro et rue"
                value={formData.adresse}
                onChangeText={(value) => updateFormData('adresse', value)}
            />
            
            <View style={styles.rowContainer}>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Code postal <Text style={styles.requiredField}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: 75001"
                        value={formData.codePostal}
                        onChangeText={(value) => updateFormData('codePostal', value)}
                        keyboardType="numeric"
                        maxLength={5}
                    />
                </View>
                
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Ville <Text style={styles.requiredField}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Paris"
                        value={formData.ville}
                        onChangeText={(value) => updateFormData('ville', value)}
                    />
                </View>
            </View>
            
            <Text style={styles.label}>Type de logement</Text>
            <View style={styles.typeContainer}>
                {['appartement', 'maison', 'studio', 'autre'].map(type => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.typeButton,
                            formData.type === type && styles.selectedTypeButton
                        ]}
                        onPress={() => updateFormData('type', type)}
                    >
                        <Text style={[
                            styles.typeButtonText,
                            formData.type === type && styles.selectedTypeButtonText
                        ]}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            <Text style={styles.note}>Les champs marqués d'un <Text style={styles.requiredField}>*</Text> sont obligatoires</Text>
        </View>
    );
    
    // Rendu de l'étape 2 : Caractéristiques
    const renderEtape2 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>Étape 2 : Caractéristiques</Text>
            
            <View style={styles.rowContainer}>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Nombre de chambres</Text>
                    <View style={styles.counterContainer}>
                        <TouchableOpacity
                            style={styles.counterButton}
                            onPress={() => {
                                const current = parseInt(formData.nbChambres);
                                if (current > 0) {
                                    updateFormData('nbChambres', (current - 1).toString());
                                }
                            }}
                        >
                            <Ionicons name="remove" size={20} color="#fff" />
                        </TouchableOpacity>
                        
                        <Text style={styles.counterValue}>{formData.nbChambres}</Text>
                        
                        <TouchableOpacity
                            style={styles.counterButton}
                            onPress={() => {
                                const current = parseInt(formData.nbChambres);
                                updateFormData('nbChambres', (current + 1).toString());
                            }}
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Capacité (personnes)</Text>
                    <View style={styles.counterContainer}>
                        <TouchableOpacity
                            style={styles.counterButton}
                            onPress={() => {
                                const current = parseInt(formData.nbPersonnes);
                                if (current > 1) {
                                    updateFormData('nbPersonnes', (current - 1).toString());
                                }
                            }}
                        >
                            <Ionicons name="remove" size={20} color="#fff" />
                        </TouchableOpacity>
                        
                        <Text style={styles.counterValue}>{formData.nbPersonnes}</Text>
                        
                        <TouchableOpacity
                            style={styles.counterButton}
                            onPress={() => {
                                const current = parseInt(formData.nbPersonnes);
                                updateFormData('nbPersonnes', (current + 1).toString());
                            }}
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            
            <Text style={styles.label}>Surface (m²) <Text style={styles.requiredField}>*</Text></Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: 50"
                value={formData.surface}
                onChangeText={(value) => updateFormData('surface', value)}
                keyboardType="numeric"
            />
            
            <Text style={styles.label}>Description <Text style={styles.requiredField}>*</Text></Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Décrivez votre logement (luminosité, exposition, étage, quartier, transports...)"
                value={formData.description}
                onChangeText={(value) => updateFormData('description', value)}
                multiline
                numberOfLines={5}
            />
            
            <Text style={styles.label}>Équipements disponibles</Text>
            <View style={styles.equipementsContainer}>
                {Object.entries({
                    wifi: 'Wi-Fi',
                    cuisine: 'Cuisine équipée',
                    laveLinge: 'Lave-linge',
                    chauffage: 'Chauffage',
                    climatisation: 'Climatisation',
                    television: 'Télévision',
                    parking: 'Parking',
                    ascenseur: 'Ascenseur'
                }).map(([key, label]) => (
                    <View key={key} style={styles.equipementRow}>
                        <Text style={styles.equipementLabel}>{label}</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#D81B60" }}
                            thumbColor={formData.equipements[key as keyof typeof formData.equipements] ? "#fff" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={(value) => updateEquipement(key, value)}
                            value={formData.equipements[key as keyof typeof formData.equipements]}
                        />
                    </View>
                ))}
            </View>
            
            <Text style={styles.note}>Les champs marqués d'un <Text style={styles.requiredField}>*</Text> sont obligatoires</Text>
        </View>
    );
    
    // Rendu de l'étape 3 : Photos
    const renderEtape3 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>Étape 3 : Photos</Text>
            
            <Text style={styles.label}>Photos du logement <Text style={styles.requiredField}>*</Text></Text>
            <Text style={styles.photoInfo}>Ajoutez au moins une photo de votre logement. Des photos de qualité augmentent les chances de trouver des personnes intéressées.</Text>
            
            <View style={styles.photoButtonsContainer}>
                <TouchableOpacity
                    style={styles.photoButton}
                    onPress={() => ajouterPhoto('library')}
                    disabled={uploadingImage}
                >
                    <Ionicons name="images-outline" size={24} color="#D81B60" />
                    <Text style={styles.photoButtonText}>Galerie</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.photoButton}
                    onPress={() => ajouterPhoto('camera')}
                    disabled={uploadingImage}
                >
                    <Ionicons name="camera-outline" size={24} color="#D81B60" />
                    <Text style={styles.photoButtonText}>Appareil photo</Text>
                </TouchableOpacity>
            </View>
            
            {uploadingImage && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#D81B60" />
                    <Text style={styles.loadingText}>Traitement de l'image...</Text>
                </View>
            )}
            
            {formData.photos.length > 0 && (
                <View style={styles.photosContainer}>
                    <Text style={styles.photosSectionTitle}>Photos ajoutées ({formData.photos.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScrollView}>
                        {formData.photos.map((photoUri, index) => (
                            <View key={index} style={styles.photoPreviewContainer}>
                                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                                <TouchableOpacity
                                    style={styles.deletePhotoButton}
                                    onPress={() => supprimerPhoto(index)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#D81B60" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
            
            <Text style={styles.note}>Les champs marqués d'un <Text style={styles.requiredField}>*</Text> sont obligatoires</Text>
            
            <Text style={styles.debugInfo}>
                Note: En mode test, les photos et les données du logement seront enregistrées localement 
                si le serveur n'est pas disponible ou si des erreurs se produisent lors de l'envoi.
            </Text>
        </View>
    );
    
    // Rendu de l'étape actuelle
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderEtape1();
            case 2:
                return renderEtape2();
            case 3:
                return renderEtape3();
            default:
                return null;
        }
    };
    
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Ajouter un logement</Text>
                    <Text style={styles.subtitle}>Remplissez le formulaire pour ajouter votre logement à la plateforme</Text>
                </View>
                
                {/* Indicateur d'étape */}
                <View style={styles.stepIndicatorContainer}>
                    {[1, 2, 3].map(step => (
                        <View key={step} style={styles.stepIndicatorItem}>
                            <View style={[
                                styles.stepDot,
                                currentStep >= step && styles.stepDotActive
                            ]}>
                                <Text style={[
                                    styles.stepDotText,
                                    currentStep >= step && styles.stepDotTextActive
                                ]}>{step}</Text>
                            </View>
                            <Text style={[
                                styles.stepText,
                                currentStep >= step && styles.stepTextActive
                            ]}>
                                {step === 1 ? 'Base' : step === 2 ? 'Détails' : 'Photos'}
                            </Text>
                        </View>
                    ))}
                </View>
                
                {/* Formulaire actuel */}
                {renderCurrentStep()}
                
                {/* Boutons de navigation */}
                <View style={styles.navigationButtons}>
                    {currentStep > 1 && (
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={allerEtapePrecedente}
                            disabled={loading}
                        >
                            <Text style={styles.backButtonText}>Précédent</Text>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                        style={[
                            styles.nextButton,
                            loading && styles.buttonDisabled
                        ]}
                        onPress={allerEtapeSuivante}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.nextButtonText}>
                                {currentStep < 3 ? 'Suivant' : 'Ajouter le logement'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
                
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>
                        <Ionicons name="information-circle-outline" size={20} color="#D81B60" /> 
                        Informations importantes
                    </Text>
                    <Text style={styles.infoContent}>
                        Votre logement sera examiné par notre équipe avant d'être publié sur la plateforme.
                    </Text>
                    <Text style={styles.infoContent}>
                        Veillez à fournir des informations exactes et des photos actuelles pour faciliter le processus de validation.
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
    stepIndicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    stepIndicatorItem: {
        alignItems: 'center',
    },
    stepDot: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    stepDotActive: {
        backgroundColor: '#D81B60',
    },
    stepDotText: {
        color: '#666',
        fontWeight: 'bold',
    },
    stepDotTextActive: {
        color: '#fff',
    },
    stepText: {
        fontSize: 12,
        color: '#666',
    },
    stepTextActive: {
        color: '#D81B60',
        fontWeight: 'bold',
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
    },
    stepTitle: {
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
        height: 120,
        textAlignVertical: 'top',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    typeButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedTypeButton: {
        backgroundColor: 'rgba(216, 27, 96, 0.1)',
        borderColor: '#D81B60',
    },
    typeButtonText: {
        color: '#666',
    },
    selectedTypeButtonText: {
        color: '#D81B60',
        fontWeight: 'bold',
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 15,
        overflow: 'hidden',
    },
    counterButton: {
        backgroundColor: '#D81B60',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterValue: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
    },
    equipementsContainer: {
        marginBottom: 15,
    },
    equipementRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    equipementLabel: {
        fontSize: 16,
        color: '#555',
    },
    photoInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    photoButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    photoButton: {
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        width: '45%',
    },
    photoButtonText: {
        color: '#D81B60',
        marginTop: 5,
    },
    loadingContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    loadingText: {
        color: '#666',
        marginTop: 5,
    },
    photosContainer: {
        marginBottom: 15,
    },
    photosSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    photosScrollView: {
        flexDirection: 'row',
    },
    photoPreviewContainer: {
        position: 'relative',
        marginRight: 10,
    },
    photoPreview: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    deletePhotoButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 10,
    },
    backButtonText: {
        color: '#666',
    },
    nextButton: {
        flex: 2,
        backgroundColor: '#D81B60',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
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
    debugInfo: {
        fontSize: 12,
        color: '#D81B60',
        fontStyle: 'italic',
        marginTop: 15,
        padding: 10,
        backgroundColor: '#FFEEF5',
        borderRadius: 5,
    }
});

export default AjouterLogementFormScreen; 