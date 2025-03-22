import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

// Interface pour les logements
interface Logement {
  id: string;
  titre: string;
  description: string;
  adresse: string;
  ville: string;
  code_postal: string;
  nombre_pieces: number;
  superficie: number;
  loyer: number;
  charges: number;
  disponibilite: string;
  type_logement: string;
  image_url: string;
  images?: string[];
  disponible: boolean;
  date_creation: string;
  date_modification?: string;
  userId?: string;
  userName?: string;
  equipements?: string;
}

const LogementsManagementScreen: React.FC = () => {
  const [logements, setLogements] = useState<Logement[]>([]);
  const [filteredLogements, setFilteredLogements] = useState<Logement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFiltre, setTypeFiltre] = useState<string | null>(null);
  const [disponibiliteFiltre, setDisponibiliteFiltre] = useState<boolean | null>(null);
  const router = useRouter();

  const fetchLogements = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/logements`, {
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
      setFilteredLogements(data);
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
  }, [searchQuery, typeFiltre, disponibiliteFiltre, logements]);

  const applyFilters = () => {
    let filtered = [...logements];
    
    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        logement => 
          logement.titre.toLowerCase().includes(query) ||
          logement.description.toLowerCase().includes(query) ||
          logement.ville.toLowerCase().includes(query) ||
          logement.adresse.toLowerCase().includes(query)
      );
    }
    
    // Filtrer par type
    if (typeFiltre) {
      filtered = filtered.filter(logement => logement.type_logement === typeFiltre);
    }
    
    // Filtrer par disponibilité
    if (disponibiliteFiltre !== null) {
      filtered = filtered.filter(logement => logement.disponible === disponibiliteFiltre);
    }
    
    setFilteredLogements(filtered);
  };

  const handleUpdateDisponibilite = async (id: string, newStatus: boolean) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/logements/${id}/disponibilite`, {
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
          logement.id === id ? { ...logement, disponible: newStatus } : logement
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

  const handleDeleteLogement = (id: string) => {
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
              
              const response = await fetch(`${API_URL}/logements/${id}`, {
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

  const renderLogementItem = ({ item }: { item: Logement }) => (
    <View style={styles.logementCard}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={40} color="#cccccc" />
            <Text style={styles.noImageText}>Pas d'image</Text>
          </View>
        )}
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.disponible ? '#4CAF50' : '#F44336' }
        ]}>
          <Text style={styles.statusText}>
            {item.disponible ? 'Disponible' : 'Indisponible'}
          </Text>
        </View>
      </View>
      
      <View style={styles.logementInfo}>
        <Text style={styles.logementTitle}>{item.titre}</Text>
        <Text style={styles.logementType}>{item.type_logement}</Text>
        <Text style={styles.logementAddress}>{item.adresse}, {item.code_postal} {item.ville}</Text>
        <Text style={styles.logementDetails}>
          {item.nombre_pieces} pièce(s) · {item.superficie} m²
          {item.loyer > 0 ? ` · ${item.loyer}€/mois` : ''}
        </Text>
        
        {item.disponibilite && (
          <Text style={styles.logementDisponibilite}>Disponible à partir du: {item.disponibilite}</Text>
        )}
        
        {item.equipements && (
          <Text style={styles.logementEquipements}>
            Équipements: {item.equipements}
          </Text>
        )}
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
          onPress={() => Alert.alert('Info', 'Voir les détails du logement')}
        >
          <Ionicons name="eye-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Détails</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            { backgroundColor: item.disponible ? '#F44336' : '#4CAF50' }
          ]}
          onPress={() => handleUpdateDisponibilite(item.id, !item.disponible)}
        >
          <Ionicons 
            name={item.disponible ? 'close-outline' : 'checkmark-outline'} 
            size={18} 
            color="#fff" 
          />
          <Text style={styles.actionButtonText}>
            {item.disponible ? 'Désactiver' : 'Activer'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#757575' }]}
          onPress={() => handleDeleteLogement(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
      ) : filteredLogements.length === 0 ? (
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
          data={filteredLogements}
          renderItem={renderLogementItem}
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
    width: '100%',
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
  logementEquipements: {
    fontSize: 14,
    color: '#666',
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
  }
});

export default LogementsManagementScreen; 