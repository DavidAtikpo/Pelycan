/**
 * API Service pour l'application Pelycan
 * Gère toutes les communications avec le serveur backend
 */

// Constante pour l'URL de l'API
// 10.0.2.2 est l'adresse IP spéciale pour l'émulateur Android qui pointe vers localhost de la machine hôte
import { API_URL } from '../../config/api';

// Import pour le stockage sécurisé du token
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Interfaces pour les types de données
export interface Demande {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  nombrePersonnes?: string;
  niveauUrgence?: string;
  message?: string;
  logementId?: string;
  hebergementId?: string;
  centreType?: string;
  type: string;
  dateCreation?: Date;
  status?: string;
}

export interface Message {
  structureId: string;
  message: string;
  date: Date;
  dateCreation?: Date;
  lu?: boolean;
}

// Interface pour les dons
export interface Don {
  id?: string;
  type: 'objet' | 'financier';
  description?: string;
  montant?: number;
  photos?: string[];
  coordonnees?: string;
  localisation?: string;
  statut: 'disponible' | 'reserve' | 'attribue';
  date: Date;
  dateCreation?: Date;
  dateMiseAJour?: Date;
  etat?: string;
}

// Interface pour les demandes d'ajout de logement
export interface DemandeAjoutLogement {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  justificatif: string;
  statut: 'en_attente' | 'approuvee' | 'refusee';
  dateCreation: Date;
  raisonDemande: string;
  estProprio: boolean;
  informationsPersonnelles?: {
    profession: string;
    numeroPieceIdentite: string;
    bulletinsSalaire: string[];
    contratTravail: string[];
    numeroDemandeLogement: string;
    numeroDalo: string;
    quittancesLoyer: string[];
    justificatifPriseEnCharge: string[];
    pieceIdentite: string[];
    numeroSecu: string;
    nombrePersonnes: string;
    livretFamille: string[];
    notificationCaf: string[];
    accepteConditions: boolean;
  };
}

// Interface pour les données d'un logement
export interface Logement {
  id: string;
  titre: string;
  adresse: string;
  ville: string;
  type: string;
  capacite: number;
  surface: number;
  description: string;
  equipements: string[];
  disponibilite: boolean;
  status: string;
  photos: string[];
  type_hebergement: 'permanent' | 'temporaire';
  date_debut?: Date;
  date_fin?: Date;
  conditions_temporaire?: string;
  created_at: Date;
  updated_at: Date;
}

// Fonctions de gestion des tokens
/**
 * Récupère le token d'authentification depuis le stockage
 * @returns Promise avec le token ou null si non trouvé
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
};

/**
 * Récupère le token JWT depuis le stockage pour l'authentification des requêtes API
 * @returns {Promise<string>} Token JWT ou chaîne vide si non trouvé
 */
export const getJwtToken = async (): Promise<string> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      console.warn('💡 DEBUG: Aucun token JWT trouvé dans AsyncStorage (clé: userToken)');
      
      // Vérifier si un token existe sous une autre clé pour le débogage
      const altToken = await AsyncStorage.getItem('token');
      if (altToken) {
        console.warn('💡 DEBUG: Un token a été trouvé sous la clé "token" au lieu de "userToken"');
      }
      
      // Lister toutes les clés disponibles dans AsyncStorage pour le débogage
      const allKeys = await AsyncStorage.getAllKeys();
      console.warn('💡 DEBUG: Clés disponibles dans AsyncStorage:', allKeys);
      
      return '';
    }
    
    return token;
  } catch (error) {
    console.error('Erreur lors de la récupération du JWT token:', error);
    return '';
  }
};

/**
 * Vérifie si l'utilisateur est authentifié et met à jour le token si nécessaire
 * @returns {Promise<boolean>} True si authentifié, false sinon
 */
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.warn('Utilisateur non authentifié: Aucun token trouvé');
      return false;
    }
    
    // Vérifier la validité du token (si nécessaire, implémenter une vérification côté serveur)
    // Cette portion peut être étendue pour rafraîchir le token si expiré
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return false;
  }
};

/**
 * Ajoute des informations de débogage importantes aux headers si activé
 * @param headers Les en-têtes HTTP existants
 * @returns En-têtes HTTP enrichis avec des informations de débogage
 */
const addDebugInfo = (headers: Record<string, string>): Record<string, string> => {
  // Ajouter un identifiant de client pour le débogage
  headers['X-Client-App'] = 'Pelycan-Mobile';
  
  // Ajouter un timestamp pour aider à identifier les requêtes dans les logs
  headers['X-Request-Time'] = new Date().toISOString();
  
  return headers;
};

/**
 * Prépare les en-têtes HTTP avec authentification si un token est fourni
 * @param token Token d'authentification (optionnel)
 * @returns Objet contenant les en-têtes HTTP
 */
const getHeaders = (token?: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return addDebugInfo(headers);
};

/**
 * Récupère la liste des logements depuis le serveur
 * @param token Token d'authentification optionnel
 * @returns Une promesse contenant les données des logements
 */
export const getLogements = async (token?: string | null): Promise<Logement[]> => {
    try {
        const response = await fetch(`${API_URL}/logements`, {
            method: 'GET',
            headers: getHeaders(token),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des logements');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur dans getLogements:', error);
        throw error;
    }
};

/**
 * Récupère toutes les structures disponibles
 * @param token Token d'authentification (optionnel)
 * @returns Une promesse contenant les données des structures
 */
export const getStructures = async (token?: string | null) => {
  try {
    const response = await fetch(`${API_URL}/structures`, {
      headers: getHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des structures');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des structures:", error);
    throw error;
  }
};

/**
 * Récupère tous les hébergements temporaires disponibles
 * @param token Token d'authentification (optionnel)
 * @returns Une promesse contenant les données des hébergements temporaires
 */
export const getHebergementsTemporaires = async (token?: string | null) => {
  try {
    const response = await fetch(`${API_URL}/hebergements`, {
      headers: getHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des hébergements temporaires');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des hébergements temporaires:", error);
    throw error;
  }
};

/**
 * Envoie une demande d'hébergement
 * @param demande Les données de la demande à envoyer
 * @param token Token d'authentification (optionnel)
 * @returns Un objet indiquant le succès ou l'échec de l'opération
 */
export const envoyerDemande = async (demande: Demande, token?: string | null) => {
  try {
    const response = await fetch(`${API_URL}/demandes`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        ...demande,
        dateCreation: new Date(),
        status: "en_attente"
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, id: data.id };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de la demande:", error);
    return { success: false, error };
  }
};

/**
 * Envoie un message à une structure
 * @param message Les données du message à envoyer
 * @param token Token d'authentification (optionnel)
 * @returns Un objet indiquant le succès ou l'échec de l'opération
 */
export const envoyerMessage = async (message: Message, token?: string | null) => {
  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        ...message,
        dateCreation: new Date(),
        lu: false
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, id: data.id };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return { success: false, error };
  }
};

/**
 * Récupère l'historique des dons de l'utilisateur
 * @returns Promise avec la liste des dons
 */
export const getDons = async (): Promise<Don[]> => {
  try {
    const token = await getJwtToken();
    const response = await fetch(`${API_URL}/dons`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des dons: ${response.status}`);
    }

    const data = await response.json();
    return data.map((don: any) => ({
      ...don,
      date: new Date(don.date)
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des dons:', error);
    throw error;
  }
};

/**
 * Envoie un don d'objet à la base de données
 * @param don Les informations du don
 * @param imageUri URI de l'image (si disponible)
 * @returns Promise avec le don créé
 */
export const envoyerDonObjet = async (don: Omit<Don, 'id' | 'date' | 'statut' | 'type'>, imageUri: string | null): Promise<Don> => {
  try {
    const token = await getJwtToken();
    
    // Si une image est fournie, nous devons d'abord l'uploader
    let imageUrl = null;
    if (imageUri) {
      try {
        console.log("Préparation de l'upload d'image depuis:", imageUri);
        
        // Créer un FormData pour envoyer l'image
        const formData = new FormData();
        
        // Extraire le nom de fichier de l'URI
        const uriParts = imageUri.split('/');
        const fileName = uriParts[uriParts.length - 1];
        
        // Ajouter l'image au formData
        formData.append('image', {
          uri: imageUri,
          name: fileName,
          type: 'image/jpeg' // Généralement sûr pour les images
        } as any);
        
        console.log("FormData préparé, tentative d'upload...");
        
        // Uploader l'image à Cloudinary via notre API
        const imageResponse = await fetch(`${API_URL}/dons/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Ne pas définir Content-Type ici, il sera automatiquement défini par fetch pour FormData
          },
          body: formData
        });
        
        console.log("Réponse du serveur reçue, status:", imageResponse.status);
        
        // Vérifier la réponse
        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          console.error("Erreur upload image:", errorText);
          throw new Error(`Erreur upload image: ${imageResponse.status}`);
        }
        
        const imageData = await imageResponse.json();
        imageUrl = imageData.url;
        console.log("Image uploadée avec succès:", imageUrl);
      } catch (uploadError) {
        console.error("Erreur complète lors de l'upload:", uploadError);
        // Ne pas rejeter ici, pour permettre l'envoi du don même sans image
        console.log("Continuons sans image...");
      }
    }
    
    // Créer le don avec l'URL de l'image si disponible
    const donData: Omit<Don, 'id'> = {
      type: 'objet',
      description: don.description,
      coordonnees: don.coordonnees,
      localisation: don.localisation,
      photos: imageUrl ? [imageUrl] : [],
      statut: 'disponible',
      date: new Date()
    };
    
    console.log("Envoi des données du don:", JSON.stringify(donData));
    
    // Envoyer le don à l'API
    const response = await fetch(`${API_URL}/dons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(donData)
    });
    
    console.log("Réponse pour le don reçue, status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur envoi don:", errorText);
      throw new Error(`Erreur envoi don: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      ...data,
      date: new Date(data.date)
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi du don d\'objet:', error);
    throw error;
  }
};

/**
 * Envoie un don financier à la base de données
 * @param montant Montant du don
 * @returns Promise avec le don créé
 */
export const envoyerDonFinancier = async (montant: number): Promise<Don> => {
  try {
    const token = await getJwtToken();
    
    const donData: Omit<Don, 'id'> = {
      type: 'financier',
      montant: montant,
      statut: 'disponible',
      date: new Date()
    };

    // Envoyer le don à l'API
    const response = await fetch(`${API_URL}/dons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(donData)
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de l'envoi du don: ${response.status}`);
    }

    const data = await response.json();
    return {
      ...data,
      date: new Date(data.date)
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi du don financier:', error);
    throw error;
  }
};

/**
 * Envoie une demande d'ajout de logement au serveur
 * @param demande Les informations de la demande d'ajout
 * @returns Promise avec la demande créée ou une erreur
 */
export const envoyerDemandeAjoutLogement = async (demande: Omit<DemandeAjoutLogement, 'id'>): Promise<{ success: boolean, id?: string, error?: any }> => {
  try {
    const token = await getJwtToken();
    
    console.log("Envoi de la demande d'ajout de logement:", JSON.stringify(demande));
    
    // Envoyer la demande à l'API
    const response = await fetch(`${API_URL}/demandes-ajout-logement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(demande)
    });
    
    console.log("Réponse du serveur:", response.status);
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, id: data.id };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de la demande d'ajout de logement:", error);
    return { success: false, error };
  }
};

/**
 * Récupère le statut d'une demande d'ajout de logement
 * @param id Identifiant de la demande
 * @returns Promise avec les informations de la demande
 */
export const getDemandeAjoutLogement = async (id: string): Promise<DemandeAjoutLogement | null> => {
  try {
    const token = await getJwtToken();
    
    const response = await fetch(`${API_URL}/demandes-ajout-logement/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de la demande: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      ...data,
      dateCreation: new Date(data.dateCreation)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la demande d\'ajout de logement:', error);
    return null;
  }
};

// Upload d'une image
const uploadImage = async (photoFormData: FormData): Promise<{ url: string }> => {
  try {
    const token = await getJwtToken();
    
    // Utilisation de la nouvelle route d'upload générique
    const response = await fetch(`${API_URL}/uploads/single`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Ne pas définir Content-Type pour FormData
      },
      body: photoFormData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur upload image:", errorText);
      throw new Error(`Erreur upload: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Upload response:', data);
    
    // Si pas d'URL retournée, créer une URL factice pour les tests
    if (!data.url) {
      console.warn("Pas d'URL retournée par le serveur, utilisation d'une URL locale");
      return { url: "local-image-url" };
    }
    
    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    // Retourner une URL factice pour ne pas bloquer le processus
    return { url: "error-image-url" };
  }
};

// Upload de plusieurs images
const uploadMultipleImages = async (photosFormData: FormData): Promise<{ images: { url: string }[] }> => {
  try {
    const token = await getJwtToken();
    
    // Utilisation de la nouvelle route d'upload multiple
    const response = await fetch(`${API_URL}/uploads/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: photosFormData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur upload multiple images:", errorText);
      throw new Error(`Erreur upload: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Upload multiple response:', data);
    
    // Si pas d'images retournées, retourner un tableau vide
    if (!data.images || !Array.isArray(data.images)) {
      console.warn("Pas d'images retournées par le serveur");
      return { images: [] };
    }
    
    return data;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return { images: [] };
  }
};

// Création d'un nouveau logement
const creerLogement = async (logementData: Logement): Promise<Logement> => {
  try {
    // Débuter par un log de débogage
    console.log('==========================================');
    console.log('=== DÉBUT DE LA CRÉATION DE LOGEMENT ===');
    
    // Vérifier l'authentification
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      console.error('❌ ERREUR: Utilisateur non authentifié.');
      throw new Error('Vous devez être connecté pour créer un logement. Veuillez vous reconnecter et réessayer.');
    }
    
    // Vérifier l'état de l'authentification avant tout
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userRole = await AsyncStorage.getItem('userRole');
      console.log('=== INFORMATIONS UTILISATEUR ===');
      console.log('userId:', userId || 'Non défini');
      console.log('userRole:', userRole || 'Non défini');
    } catch (authError) {
      console.warn('Impossible de récupérer les informations utilisateur', authError);
    }
    
    const token = await getJwtToken();
    
    if (!token) {
      console.error('❌ ERREUR: Aucun token d\'authentification trouvé malgré la vérification.');
      // Dans une application plus avancée, vous pourriez implémenter une tentative de réauthentification ici
      throw new Error('Erreur d\'authentification. Veuillez vous reconnecter et réessayer.');
    }
    
    // Convertir les équipements en chaîne de caractères séparée par des virgules
    const equipementsString = logementData.equipements.join(',');
    
    // Adapter le format des données au format attendu par le serveur
    const logementServeur = {
      titre: logementData.titre,
      description: logementData.description,
      adresse: logementData.adresse, 
      ville: logementData.ville,
      type: logementData.type,
      capacite: logementData.capacite,
      surface: logementData.surface,
      disponibilite: logementData.disponibilite,
      status: logementData.status,
      photos: logementData.photos,
      type_hebergement: logementData.type_hebergement,
      date_debut: logementData.date_debut,
      date_fin: logementData.date_fin,
      conditions_temporaire: logementData.conditions_temporaire,
      equipements: equipementsString
    };
    
    console.log('==========================================');
    console.log('=== DONNÉES ENVOYÉES AU SERVEUR (FORMAT) ===');
    console.log(JSON.stringify(logementServeur, null, 2));
    console.log('=== DONNÉES ORIGINALES DU CLIENT ===');
    console.log(JSON.stringify(logementData, null, 2));
    console.log('=== TOKEN UTILISÉ ===');
    console.log(token ? 'Token présent' : 'Token absent');
    console.log('==========================================');
    
    const endpoint = `${API_URL}/logements`;
    console.log(`Envoi à l'endpoint: ${endpoint}`);
    
    // Utiliser fetch au lieu d'axios pour éviter les problèmes de dépendances
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logementServeur)
    });
    
    const responseText = await response.text();
    console.log('==========================================');
    console.log(`=== RÉPONSE DU SERVEUR (Status: ${response.status}) ===`);
    console.log('=== RÉPONSE TEXTE BRUTE ===');
    console.log(responseText);
    
    let data;
    try {
      // Essayer de parser la réponse comme JSON si possible
      if (responseText) {
        data = JSON.parse(responseText);
        console.log('=== RÉPONSE JSON PARSÉE ===');
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log('Réponse vide du serveur');
        data = null;
      }
    } catch (e) {
      console.log('La réponse n\'est pas au format JSON:');
      console.log('Erreur de parsing:', e);
      data = { message: responseText };
    }
    console.log('==========================================');
    
    if (!response.ok) {
      console.error(`ERREUR SERVEUR (${response.status}): ${data?.message || responseText || 'Erreur inconnue'}`);
      console.error('Vérifiez les logs du serveur pour plus de détails.');
      throw new Error(`Erreur création: ${response.status} - ${data?.message || responseText}`);
    }
    
    console.log('✅ LOGEMENT CRÉÉ AVEC SUCCÈS:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ ERREUR DÉTAILLÉE:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    throw error;
  }
};

// Annuler une demande d'ajout de logement
const annulerDemandeAjoutLogement = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_URL}/demandes-ajout-logement/${id}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            return { success: false, message: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Erreur lors de l\'annulation de la demande:', error);
        return { success: false, message: 'Une erreur est survenue lors de l\'annulation de la demande' };
    }
};

// Export par défaut de toutes les fonctions de l'API
const apiService = {
  getLogements,
  getStructures,
  getHebergementsTemporaires,
  envoyerDemande,
  envoyerMessage,
  getDons,
  envoyerDonObjet,
  envoyerDonFinancier,
  envoyerDemandeAjoutLogement,
  getDemandeAjoutLogement,
  uploadImage,
  uploadMultipleImages,
  creerLogement,
  annulerDemandeAjoutLogement
};

export default apiService; 