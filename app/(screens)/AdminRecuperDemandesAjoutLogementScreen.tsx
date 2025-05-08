import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, Linking, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Interface pour les demandes d'ajout de logement
interface DemandeAjoutLogement {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  statut: 'en_attente' | 'approuvee' | 'refusee';
  dateCreation: string;
  dateMiseAJour: string;
  raisonDemande: string;
  estProprio: boolean;
  userId: string;
  raisonRefus?: string;
  userEmail: string;
  userRole: string;
  documents: {
    bulletinsSalaire: string[];
    contratTravail: string[];
    quittancesLoyer: string[];
    justificatifPriseEnCharge: string[];
    pieceIdentite: string[];
    livretFamille: string[];
    notificationCaf: string[];
  };
  numeroPieceIdentite?: string;
  numeroDemandeLogement?: string;
  numeroDalo?: string;
  nombrePersonnes?: string;
}

const DemandesAjoutLogementScreen: React.FC = () => {
  const [demandes, setDemandes] = useState<DemandeAjoutLogement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadedFiles, setDownloadedFiles] = useState<{[key: string]: boolean}>({});
  const [expandedDemandeId, setExpandedDemandeId] = useState<string | null>(null);
  const [raisonRefus, setRaisonRefus] = useState<string>('');
  const [showRaisonRefusInput, setShowRaisonRefusInput] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/demandes-ajout-logement`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes');
      }

      const data = await response.json();
      setDemandes(data);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les demandes d\'ajout de logement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const handleStatutChange = async (id: string, nouveauStatut: 'approuvee' | 'refusee') => {
    try {
      setSubmittingId(id);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Token non trouvé');
      }

      // Si c'est un refus, on doit avoir une raison
      if (nouveauStatut === 'refusee' && !raisonRefus.trim()) {
        Alert.alert('Erreur', 'Veuillez indiquer la raison du refus');
        return;
      }

      console.log('Tentative de mise à jour du statut:', { id, nouveauStatut, raisonRefus });
      
      const response = await fetch(`${API_URL}/demandes-ajout-logement/${id}/statut`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          statut: nouveauStatut,
          raisonRefus: nouveauStatut === 'refusee' ? raisonRefus : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur serveur:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Erreur serveur: ${response.status} ${response.statusText}`);
      }

      const updatedData = await response.json();
      console.log('Réponse serveur:', updatedData);

      // Mettre à jour la liste localement
      setDemandes(prev => 
        prev.map(demande => 
          demande.id === id ? { ...demande, statut: nouveauStatut } : demande
        )
      );

      // Fermer les détails après la mise à jour
      setExpandedDemandeId(null);

      Alert.alert(
        'Succès', 
        `La demande a été ${nouveauStatut === 'approuvee' ? 'approuvée' : 'refusée'}.`
      );

      // Rafraîchir la liste des demandes
      await fetchDemandes();
    } catch (error) {
      console.error('Erreur détaillée:', error);
      Alert.alert(
        'Erreur', 
        'Impossible de mettre à jour le statut de la demande. Veuillez réessayer.'
      );
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return '#FFA000'; // Orange
      case 'approuvee': return '#4CAF50';  // Vert
      case 'refusee': return '#F44336';    // Rouge
      default: return '#757575';           // Gris par défaut
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'approuvee': return 'Approuvée';
      case 'refusee': return 'Refusée';
      default: return statut;
    }
  };

  const downloadAndOpenDocument = async (url: string, type: string) => {
    try {
      // Vérifier si le fichier est déjà téléchargé
      if (downloadedFiles[url]) {
        // Si déjà téléchargé, ouvrir directement
        await openDownloadedFile(url);
        return;
      }

      setDownloading(true);
      console.log('Début du téléchargement:', url);
      
      // Créer le dossier de documents s'il n'existe pas
      const documentsDir = `${FileSystem.documentDirectory}demandes_documents/`;
      await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
      console.log('Dossier de documents créé:', documentsDir);

      // Extraire le nom du fichier de l'URL
      const fileName = url.split('/').pop() || `document_${Date.now()}`;
      const filePath = `${documentsDir}${fileName}`;
      console.log('Chemin du fichier:', filePath);

      // Vérifier si le fichier existe déjà
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      console.log('État du fichier:', fileInfo);

      if (!fileInfo.exists) {
        console.log('Téléchargement du fichier...');
        // Télécharger le fichier avec les options pour préserver les métadonnées
        const downloadResult = await FileSystem.downloadAsync(
          url, 
          filePath,
          {
            headers: {
              'Accept': '*/*',
              'Cache-Control': 'no-cache'
            }
          }
        );
        console.log('Status HTTP du téléchargement:', downloadResult.status);
        if (downloadResult.status !== 200) {
          console.log('Réponse complète:', downloadResult);
          throw new Error('Erreur lors du téléchargement : ' + downloadResult.status);
        }
        // Vérifier la taille du fichier téléchargé
        const downloadedFileInfo = await FileSystem.getInfoAsync(filePath);
        if (downloadedFileInfo.exists) {
          console.log('Taille du fichier téléchargé:', downloadedFileInfo.size);
          if (downloadedFileInfo.size === 0) {
            throw new Error('Le fichier téléchargé est vide');
          }
        }
      }

      // Vérifier à nouveau si le fichier existe et est accessible
      const fileExists = await FileSystem.getInfoAsync(filePath);
      console.log('Vérification finale du fichier:', fileExists);
      
      if (!fileExists.exists || ('size' in fileExists && fileExists.size === 0)) {
        throw new Error('Le fichier n\'existe pas ou est vide');
      }

      // Marquer le fichier comme téléchargé
      setDownloadedFiles(prev => ({
        ...prev,
        [url]: true
      }));

      Alert.alert(
        'Téléchargement réussi',
        'Le fichier a été téléchargé. Voulez-vous l\'ouvrir dans le navigateur ?',
        [
          { text: 'Non' },
          { text: 'Oui', onPress: () => openDownloadedFile(url) }
        ]
      );

    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      Alert.alert('Erreur', 'Impossible de télécharger le document: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setDownloading(false);
    }
  };

  const openDownloadedFile = async (url: string) => {
    try {
      // Ouvre simplement l'URL dans le navigateur
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        throw new Error("Impossible d'ouvrir le navigateur pour ce lien.");
      }
      await Linking.openURL(url);
    } catch (error: any) {
      console.error('Erreur lors de l\'ouverture dans le navigateur:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir le document dans le navigateur: ' + (error.message || 'Erreur inconnue'));
    }
  };

  // Fonction utilitaire pour déterminer le type MIME
  const getMimeType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  };

  // Fonction utilitaire pour déterminer l'UTI (iOS)
  const getUTI = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'public.jpeg';
      case 'png':
        return 'public.png';
      case 'pdf':
        return 'com.adobe.pdf';
      default:
        return 'public.data';
    }
  };

  const viewJustificatif = async (url: string, type: string) => {
    if (!url) {
      Alert.alert('Information', 'Aucun document disponible');
      return;
    }

    if (downloading) {
      Alert.alert('Information', 'Un document est en cours de téléchargement');
      return;
    }

    try {
      await downloadAndOpenDocument(url, type);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir le document');
    }
  };

  const renderDemandeItem = ({ item }: { item: DemandeAjoutLogement }) => (
    <View style={styles.demandeCard}>
      <View style={styles.demandeHeader}>
        <View>
          <Text style={styles.demandeName}>{item.prenom} {item.nom}</Text>
          <Text style={styles.userInfo}>Utilisateur: {item.userEmail} ({item.userRole})</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) }]}>
          <Text style={styles.statusText}>{getStatusText(item.statut)}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.detailsButton}
        onPress={() => setExpandedDemandeId(expandedDemandeId === item.id ? null : item.id)}
      >
        <Text style={styles.detailsButtonText}>
          {expandedDemandeId === item.id ? 'Masquer les détails' : 'Voir les détails'}
        </Text>
        <Ionicons 
          name={expandedDemandeId === item.id ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#2196F3" 
        />
      </TouchableOpacity>

      {expandedDemandeId === item.id && (
        <>
          <View style={styles.demandeInfo}>
            <Text><Text style={styles.infoLabel}>Tél:</Text> {item.telephone}</Text>
            <Text><Text style={styles.infoLabel}>Email:</Text> {item.email}</Text>
            <Text><Text style={styles.infoLabel}>Type:</Text> {item.estProprio ? 'Propriétaire' : 'Professionnel'}</Text>
            <Text><Text style={styles.infoLabel}>Date création:</Text> {new Date(item.dateCreation).toLocaleDateString()}</Text>
            <Text><Text style={styles.infoLabel}>Dernière mise à jour:</Text> {new Date(item.dateMiseAJour).toLocaleDateString()}</Text>
            <Text><Text style={styles.infoLabel}>Numéro de pièce d'identité:</Text> {item.numeroPieceIdentite || '-'}</Text>
            <Text><Text style={styles.infoLabel}>Numéro de demande logement:</Text> {item.numeroDemandeLogement || '-'}</Text>
            <Text><Text style={styles.infoLabel}>Numéro DALO:</Text> {item.numeroDalo || '-'}</Text>
            <Text><Text style={styles.infoLabel}>Nombre de personnes:</Text> {item.nombrePersonnes || '-'}</Text>
          </View>
          
          {item.raisonDemande && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Motif de la demande:</Text>
              <Text style={styles.messageText}>{item.raisonDemande}</Text>
            </View>
          )}
          
          {item.raisonRefus && (
            <View style={[styles.messageContainer, { backgroundColor: '#FFEBEE' }]}>
              <Text style={styles.messageLabel}>Raison du refus:</Text>
              <Text style={styles.messageText}>{item.raisonRefus}</Text>
            </View>
          )}
          
          <View style={styles.documentsContainer}>
            <Text style={styles.documentsTitle}>Documents fournis:</Text>
            {Object.entries(item.documents).map(([type, urls]) => {
              if (urls && urls.length > 0) {
                return (
                  <View key={type} style={styles.documentType}>
                    <Text style={styles.documentTypeLabel}>{type.replace(/([A-Z])/g, ' $1').trim()}:</Text>
                    {urls.map((url, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={styles.documentButton}
                        onPress={() => viewJustificatif(url, type)}
                        disabled={downloading}
                      >
                        <View style={styles.documentIconContainer}>
                          <Ionicons 
                            name="document-outline" 
                            size={16} 
                            color="#2196F3" 
                          />
                          {downloadedFiles[url] ? (
                            <Ionicons 
                              name="checkmark-circle" 
                              size={16} 
                              color="#4CAF50" 
                              style={styles.downloadStatusIcon}
                            />
                          ) : (
                            <Ionicons 
                              name="cloud-download-outline" 
                              size={16} 
                              color="#FFA000" 
                              style={styles.downloadStatusIcon}
                            />
                          )}
                        </View>
                        <Text style={styles.documentText}>Document {index + 1}</Text>
                        {downloading && <ActivityIndicator size="small" color="#2196F3" style={styles.downloadIndicator} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              }
              return null;
            })}
          </View>
          
          <View style={styles.actionContainer}>
            {item.statut === 'en_attente' && (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={() => handleStatutChange(item.id, 'approuvee')}
                  disabled={submittingId === item.id}
                >
                  {submittingId === item.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-outline" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Approuver</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                {showRaisonRefusInput === item.id ? (
                  <View style={styles.raisonRefusContainer}>
                    <TextInput
                      style={styles.raisonRefusInput}
                      placeholder="Entrez la raison du refus..."
                      value={raisonRefus}
                      onChangeText={setRaisonRefus}
                      multiline
                      numberOfLines={3}
                    />
                    <View style={styles.raisonRefusButtons}>
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                        onPress={() => {
                          handleStatutChange(item.id, 'refusee');
                          setShowRaisonRefusInput(null);
                          setRaisonRefus('');
                        }}
                        disabled={submittingId === item.id}
                      >
                        {submittingId === item.id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Ionicons name="close-outline" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Confirmer le refus</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#757575' }]}
                        onPress={() => {
                          setShowRaisonRefusInput(null);
                          setRaisonRefus('');
                        }}
                        disabled={submittingId === item.id}
                      >
                        <Ionicons name="arrow-back-outline" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Annuler</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                    onPress={() => setShowRaisonRefusInput(item.id)}
                    disabled={submittingId === item.id}
                  >
                    {submittingId === item.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="close-outline" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Refuser</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </>
      )}
    </View>
  );

  const filtrerDemandes = (list = demandes) => {
    if (!filtreStatut) return list;
    return list.filter(demande => demande.statut === filtreStatut);
  };

  // Fonction pour ne garder qu'une seule demande par utilisateur (la plus récente)
  const getDemandesParUtilisateur = () => {
    const demandesParUser: { [userId: string]: DemandeAjoutLogement } = {};
    demandes.forEach((demande) => {
      // Si on n'a pas encore de demande pour cet utilisateur, ou si celle-ci est plus récente
      if (
        !demandesParUser[demande.userId] ||
        new Date(demande.dateCreation) > new Date(demandesParUser[demande.userId].dateCreation)
      ) {
        demandesParUser[demande.userId] = demande;
      }
    });
    return Object.values(demandesParUser);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demandes d'ajout de logement</Text>
        <TouchableOpacity onPress={fetchDemandes}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filtreStatut === null && styles.filterButtonActive]}
          onPress={() => setFiltreStatut(null)}
        >
          <Text style={[styles.filterButtonText, filtreStatut === null && styles.filterButtonTextActive]}>Toutes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filtreStatut === 'en_attente' && styles.filterButtonActive]}
          onPress={() => setFiltreStatut('en_attente')}
        >
          <Text style={[styles.filterButtonText, filtreStatut === 'en_attente' && styles.filterButtonTextActive]}>En attente</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filtreStatut === 'approuvee' && styles.filterButtonActive]}
          onPress={() => setFiltreStatut('approuvee')}
        >
          <Text style={[styles.filterButtonText, filtreStatut === 'approuvee' && styles.filterButtonTextActive]}>Approuvées</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filtreStatut === 'refusee' && styles.filterButtonActive]}
          onPress={() => setFiltreStatut('refusee')}
        >
          <Text style={[styles.filterButtonText, filtreStatut === 'refusee' && styles.filterButtonTextActive]}>Refusées</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : demandes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#757575" />
          <Text style={styles.emptyText}>Aucune demande d'ajout de logement</Text>
        </View>
      ) : (
        <FlatList
          data={filtrerDemandes(getDemandesParUtilisateur())}
          renderItem={renderDemandeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#757575',
    marginTop: 16,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  demandeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  demandeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  demandeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  demandeInfo: {
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  messageContainer: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  messageLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    color: '#666',
  },
  justificatifButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  justificatifText: {
    color: '#2196F3',
    marginLeft: 6,
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    backgroundColor: '#fff',
    elevation: 1,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#757575',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  documentsContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  documentsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  documentType: {
    marginBottom: 8,
  },
  documentTypeLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 4,
  },
  documentText: {
    color: '#2196F3',
    marginLeft: 6,
  },
  downloadIndicator: {
    marginLeft: 8,
  },
  documentIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadStatusIcon: {
    marginLeft: 4,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginVertical: 8,
  },
  detailsButtonText: {
    color: '#2196F3',
    marginRight: 8,
    fontWeight: 'bold',
  },
  raisonRefusContainer: {
    marginTop: 12,
    width: '100%',
  },
  raisonRefusInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  raisonRefusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default DemandesAjoutLogementScreen; 