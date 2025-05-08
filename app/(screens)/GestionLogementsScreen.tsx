import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, TextInput, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const { width: screenWidth } = Dimensions.get('window');

// Interface pour les logements
interface Logement {
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
  dateDebut: Date | null;
  dateFin: Date | null;
  conditionsTemporaire: string | null;
  created_at: string;
  updated_at: string;
  proprietaireId: string;
  proprietaire?: {
    id: string;
    fullName: string;
    email: string;
    phone_number: string;
  };
  equipements: Record<string, boolean>;
}

interface GroupedLogements {
  [userId: string]: {
    user: {
      id: string;
      fullName: string;
      email: string;
      phone_number: string;
    };
    logements: Logement[];
  };
}

const LogementsManagementScreen: React.FC = () => {
  const [logements, setLogements] = useState<Logement[]>([]);
  const [groupedLogements, setGroupedLogements] = useState<GroupedLogements>({});
  const [filteredGroupedLogements, setFilteredGroupedLogements] = useState<GroupedLogements>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFiltre, setTypeFiltre] = useState<string | null>(null);
  const [disponibiliteFiltre, setDisponibiliteFiltre] = useState<boolean | null>(null);
  const [openUsers, setOpenUsers] = useState<string[]>([]);
  const [carouselIndexes, setCarouselIndexes] = useState<{ [logementId: string]: number }>({});
  const router = useRouter();

  const fetchLogements = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/admin/logements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des logements');
      }

      const data = await response.json();
      setLogements(data);
      
      // Grouper les logements par utilisateur
      const grouped = data.reduce((acc: GroupedLogements, logement: Logement) => {
        if (!acc[logement.proprietaireId]) {
          acc[logement.proprietaireId] = {
            user: logement.proprietaire || {
              id: logement.proprietaireId,
              fullName: 'Utilisateur inconnu',
              email: '',
              phone_number: ''
            },
            logements: []
          };
        }
        acc[logement.proprietaireId].logements.push(logement);
        return acc;
      }, {});
      
      setGroupedLogements(grouped);
      setFilteredGroupedLogements(grouped);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les logements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogements();
  }, []);

  useEffect(() => {
    // Appliquer les filtres lorsqu'ils changent
    applyFilters();
  }, [searchQuery, typeFiltre, disponibiliteFiltre, groupedLogements]);

  const applyFilters = () => {
    let filtered = { ...groupedLogements };
    
    // Filtrer les logements dans chaque groupe
    Object.keys(filtered).forEach(userId => {
      let userLogements = filtered[userId].logements;
      
      // Filtrer par recherche
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        userLogements = userLogements.filter(
          logement => 
            logement.titre.toLowerCase().includes(query) ||
            logement.description.toLowerCase().includes(query) ||
            logement.ville.toLowerCase().includes(query) ||
            logement.adresse.toLowerCase().includes(query)
        );
      }
      
      // Filtrer par type
      if (typeFiltre) {
        userLogements = userLogements.filter(logement => logement.type === typeFiltre);
      }
      
      // Filtrer par disponibilité
      if (disponibiliteFiltre !== null) {
        userLogements = userLogements.filter(logement => logement.disponibilite === disponibiliteFiltre);
      }
      
      filtered[userId].logements = userLogements;
    });
    
    // Supprimer les groupes vides
    Object.keys(filtered).forEach(userId => {
      if (filtered[userId].logements.length === 0) {
        delete filtered[userId];
      }
    });
    
    setFilteredGroupedLogements(filtered);
  };

  const handleUpdateDisponibilite = async (id: string, newStatus: boolean) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/admin/logements/${id}/disponibilite`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disponible: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la disponibilité');
      }

      // Mettre à jour la liste localement
      setLogements(prev => 
        prev.map(logement => 
          logement.id === id ? { ...logement, disponibilite: newStatus } : logement
        )
      );

      Alert.alert(
        'Succès', 
        `Le logement a été ${newStatus ? 'activé' : 'désactivé'}`
      );
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la disponibilité du logement');
    }
  };

  const handleDeleteLogement = async (id: string) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce logement ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Oui, supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              
              const response = await fetch(`${API_URL}/admin/logements/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (!response.ok) {
                throw new Error('Erreur lors de la suppression du logement');
              }

              // Supprimer de la liste locale
              setLogements(prev => prev.filter(logement => logement.id !== id));
              Alert.alert('Succès', 'Le logement a été supprimé');
            } catch (error) {
              console.error('Erreur:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le logement');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return 'Non renseigné';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Non renseigné' : d.toLocaleDateString();
  };

  const handleViewDetails = (logement: Logement) => {
    const details = [
      `🏠 Titre : ${logement.titre}`,
      `📝 Description : ${logement.description}`,
      `📍 Adresse : ${logement.adresse}, ${logement.codePostal} ${logement.ville}`,
      `🏷️ Type : ${logement.type}`,
      `👥 Capacité : ${logement.capacite} personnes`,
      `📐 Surface : ${logement.surface} m²`,
      `🛏️ Type d'hébergement : ${logement.typeHebergement}`,
      `🔖 Statut : ${logement.status}`,
      `✅ Disponibilité : ${logement.disponibilite ? 'Disponible' : 'Indisponible'}`,
      `📅 Date de début : ${formatDate(logement.dateDebut)}`,
      `📅 Date de fin : ${formatDate(logement.dateFin)}`,
      `🕒 Date de création : ${formatDate(logement.created_at)}`,
      `🕒 Date de modification : ${formatDate(logement.updated_at)}`,
      logement.dateDebut && logement.dateFin ? `📆 Disponible du ${formatDate(logement.dateDebut)} au ${formatDate(logement.dateFin)}` : '',
      logement.conditionsTemporaire ? `⚠️ Conditions : ${logement.conditionsTemporaire}` : '',
      `🔧 Équipements :\n${Object.entries(logement.equipements).map(([key, value]) => `  - ${key} : ${value ? 'Oui' : 'Non'}`).join('\n')}`
    ].filter(Boolean).join('\n\n');

    Alert.alert(
      'Détails du logement',
      details,
      [
        {
          text: 'Fermer',
          style: 'cancel'
        }
      ]
    );
  };

  const toggleUser = (userId: string) => {
    setOpenUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const renderUserSection = ({ item }: { item: { userId: string; data: { user: any; logements: Logement[] } } }) => {
    const isOpen = openUsers.includes(item.userId);
    return (
      <View style={styles.userSection}>
        <TouchableOpacity style={styles.userHeader} onPress={() => toggleUser(item.userId)}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.data.user.fullName}</Text>
            <Text style={styles.userEmail}>{item.data.user.email}</Text>
            <Text style={styles.userPhone}>{item.data.user.phone_number}</Text>
          </View>
          <Text style={styles.logementCount}>
            {item.data.logements.length} logement{item.data.logements.length > 1 ? 's' : ''}
          </Text>
          <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={24} color="#2196F3" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        {isOpen && item.data.logements.map(logement => {
          const currentIndex = carouselIndexes[logement.id] || 0;
          return (
            <View key={logement.id} style={styles.logementCard}>
              <View style={styles.imageContainer}>
                {logement.photos.length > 0 ? (
                  <View>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onScroll={e => {
                        const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                        setCarouselIndexes(prev => ({ ...prev, [logement.id]: idx }));
                      }}
                      scrollEventThrottle={16}
                    >
                      {logement.photos.map((photo, idx) => (
                        <Image
                          key={idx}
                          source={{ uri: photo }}
                          style={[styles.image, { width: screenWidth }]}
                          resizeMode="cover"
                          onError={() => console.warn('Erreur de chargement image', photo)}
                        />
                      ))}
                    </ScrollView>
                    <View style={styles.paginationContainer}>
                      {logement.photos.map((_, idx) => (
                        <View
                          key={idx}
                          style={[styles.paginationDot, currentIndex === idx && styles.paginationDotActive]}
                        />
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={styles.noImageContainer}>
                    <Ionicons name="image-outline" size={40} color="#cccccc" />
                    <Text style={styles.noImageText}>Pas d'image</Text>
                  </View>
                )}
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: logement.disponibilite ? '#4CAF50' : '#F44336' }
                ]}>
                  <Text style={styles.statusText}>
                    {logement.disponibilite ? 'Disponible' : 'Indisponible'}
                  </Text>
                </View>
              </View>
              <View style={styles.logementInfo}>
                <Text style={styles.logementTitle}>{logement.titre}</Text>
                <Text style={styles.logementType}>{logement.type}</Text>
                <Text style={styles.logementAddress}>{logement.adresse}, {logement.codePostal} {logement.ville}</Text>
                <Text style={styles.logementDetails}>
                  {logement.capacite} pièce(s) · {logement.surface} m²
                </Text>
                {logement.dateDebut && logement.dateFin && (
                  <Text style={styles.logementDisponibilite}>
                    Disponible de {new Date(logement.dateDebut).toLocaleDateString()} à {new Date(logement.dateFin).toLocaleDateString()}
                  </Text>
                )}
                {logement.conditionsTemporaire && (
                  <Text style={styles.logementDisponibilite}>{logement.conditionsTemporaire}</Text>
                )}
              </View>
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                  onPress={() => handleViewDetails(logement)}
                >
                  <Ionicons name="eye-outline" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Détails</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.actionButton, 
                    { backgroundColor: logement.disponibilite ? '#F44336' : '#4CAF50' }
                  ]}
                  onPress={() => handleUpdateDisponibilite(logement.id, !logement.disponibilite)}
                >
                  <Ionicons 
                    name={logement.disponibilite ? 'close-outline' : 'checkmark-outline'} 
                    size={18} 
                    color="#fff" 
                  />
                  <Text style={styles.actionButtonText}>
                    {logement.disponibilite ? 'Désactiver' : 'Activer'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#757575' }]}
                  onPress={() => handleDeleteLogement(logement.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des logements</Text>
        <TouchableOpacity onPress={fetchLogements}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un logement..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollContainer}>
          <TouchableOpacity 
            style={[styles.filterChip, typeFiltre === null && styles.filterChipActive]}
            onPress={() => setTypeFiltre(null)}
          >
            <Text style={[styles.filterChipText, typeFiltre === null && styles.filterChipTextActive]}>
              Tous les types
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, typeFiltre === 'appartement' && styles.filterChipActive]}
            onPress={() => setTypeFiltre('appartement')}
          >
            <Text style={[styles.filterChipText, typeFiltre === 'appartement' && styles.filterChipTextActive]}>
              Appartements
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, typeFiltre === 'maison' && styles.filterChipActive]}
            onPress={() => setTypeFiltre('maison')}
          >
            <Text style={[styles.filterChipText, typeFiltre === 'maison' && styles.filterChipTextActive]}>
              Maisons
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, typeFiltre === 'studio' && styles.filterChipActive]}
            onPress={() => setTypeFiltre('studio')}
          >
            <Text style={[styles.filterChipText, typeFiltre === 'studio' && styles.filterChipTextActive]}>
              Studios
            </Text>
          </TouchableOpacity>
          
          <View style={styles.filterDivider} />
          
          <TouchableOpacity 
            style={[styles.filterChip, disponibiliteFiltre === null && styles.filterChipActive]}
            onPress={() => setDisponibiliteFiltre(null)}
          >
            <Text style={[styles.filterChipText, disponibiliteFiltre === null && styles.filterChipTextActive]}>
              Tous
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, disponibiliteFiltre === true && styles.filterChipActive]}
            onPress={() => setDisponibiliteFiltre(true)}
          >
            <Text style={[styles.filterChipText, disponibiliteFiltre === true && styles.filterChipTextActive]}>
              Disponibles
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, disponibiliteFiltre === false && styles.filterChipActive]}
            onPress={() => setDisponibiliteFiltre(false)}
          >
            <Text style={[styles.filterChipText, disponibiliteFiltre === false && styles.filterChipTextActive]}>
              Indisponibles
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : Object.keys(filteredGroupedLogements).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="home-outline" size={64} color="#757575" />
          <Text style={styles.emptyText}>Aucun logement trouvé</Text>
          {searchQuery !== '' && (
            <Text style={styles.emptySubtext}>
              Essayez de modifier vos critères de recherche
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={Object.entries(filteredGroupedLogements).map(([userId, data]) => ({
            userId,
            data
          }))}
          renderItem={renderUserSection}
          keyExtractor={item => item.userId}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    margin: 16,
    paddingHorizontal: 12,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
  },
  filterChipText: {
    fontSize: 14,
    color: '#333',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
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
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  logementCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    height: 180,
  },
  noImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#999',
    marginTop: 8,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logementInfo: {
    padding: 16,
  },
  logementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logementType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  logementAddress: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  logementDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  logementDisponibilite: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
  userSection: {
    marginBottom: 24,
  },
  userHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  logementCount: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
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
    backgroundColor: '#2196F3',
  },
});

export default LogementsManagementScreen; 