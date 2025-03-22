import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

// Interface pour les dons
interface Don {
  id: string;
  type: 'objet' | 'financier';
  description?: string;
  montant?: number;
  imageUrl?: string;
  coordonnees?: string;
  statut: 'en_attente' | 'recu';
  date: string;
  userId: string;
  userName?: string;
  userEmail?: string;
}

const DonsListScreen: React.FC = () => {
  const [dons, setDons] = useState<Don[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreType, setFiltreType] = useState<'tous' | 'objet' | 'financier'>('tous');
  const [filtreStatut, setFiltreStatut] = useState<'tous' | 'en_attente' | 'recu'>('tous');
  const router = useRouter();

  const fetchDons = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/dons`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des dons');
      }

      const data = await response.json();
      setDons(data);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les dons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDons();
  }, []);

  const handleMarkAsReceived = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/dons/${id}/statut`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut: 'recu' })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Mettre à jour la liste localement
      setDons(prev => 
        prev.map(don => 
          don.id === id ? { ...don, statut: 'recu' } : don
        )
      );

      Alert.alert('Succès', 'Le don a été marqué comme reçu');
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut du don');
    }
  };

  const filtrerDons = () => {
    return dons.filter(don => {
      const typeMatch = filtreType === 'tous' || don.type === filtreType;
      const statutMatch = filtreStatut === 'tous' || don.statut === filtreStatut;
      return typeMatch && statutMatch;
    });
  };

  const formatMontant = (montant?: number) => {
    if (montant === undefined || montant === null) return '0 €';
    return `${Number(montant).toFixed(2)} €`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderDonItem = ({ item }: { item: Don }) => (
    <View style={styles.donCard}>
      <View style={styles.donHeader}>
        <View style={styles.donTypeContainer}>
          <Ionicons 
            name={item.type === 'objet' ? 'cube-outline' : 'card-outline'} 
            size={24} 
            color={item.type === 'objet' ? '#4CAF50' : '#2196F3'} 
          />
          <Text style={styles.donType}>
            {item.type === 'objet' ? 'Don d\'objet' : 'Don financier'}
          </Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.statut === 'en_attente' ? '#FFA000' : '#4CAF50' }
        ]}>
          <Text style={styles.statusText}>
            {item.statut === 'en_attente' ? 'En attente' : 'Reçu'}
          </Text>
        </View>
      </View>

      <View style={styles.donInfo}>
        {item.type === 'financier' && (
          <Text style={styles.montant}>Montant: {formatMontant(item.montant)}</Text>
        )}
        
        {item.type === 'objet' && item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}
        
        {item.coordonnees && (
          <Text style={styles.coordonnees}>Contact: {item.coordonnees}</Text>
        )}
        
        <Text style={styles.date}>Date: {formatDate(item.date)}</Text>
        
        {item.userName && (
          <Text style={styles.userName}>De: {item.userName}</Text>
        )}
      </View>
      
      {item.type === 'objet' && item.imageUrl && (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      {item.statut === 'en_attente' && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleMarkAsReceived(item.id)}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Marquer comme reçu</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liste des dons</Text>
        <TouchableOpacity onPress={fetchDons}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterBar}>
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Type:</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity 
              style={[styles.filterButton, filtreType === 'tous' && styles.filterButtonActive]}
              onPress={() => setFiltreType('tous')}
            >
              <Text style={[styles.filterButtonText, filtreType === 'tous' && styles.filterButtonTextActive]}>Tous</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterButton, filtreType === 'objet' && styles.filterButtonActive]}
              onPress={() => setFiltreType('objet')}
            >
              <Text style={[styles.filterButtonText, filtreType === 'objet' && styles.filterButtonTextActive]}>Objets</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterButton, filtreType === 'financier' && styles.filterButtonActive]}
              onPress={() => setFiltreType('financier')}
            >
              <Text style={[styles.filterButtonText, filtreType === 'financier' && styles.filterButtonTextActive]}>Financiers</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Statut:</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity 
              style={[styles.filterButton, filtreStatut === 'tous' && styles.filterButtonActive]}
              onPress={() => setFiltreStatut('tous')}
            >
              <Text style={[styles.filterButtonText, filtreStatut === 'tous' && styles.filterButtonTextActive]}>Tous</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterButton, filtreStatut === 'en_attente' && styles.filterButtonActive]}
              onPress={() => setFiltreStatut('en_attente')}
            >
              <Text style={[styles.filterButtonText, filtreStatut === 'en_attente' && styles.filterButtonTextActive]}>En attente</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterButton, filtreStatut === 'recu' && styles.filterButtonActive]}
              onPress={() => setFiltreStatut('recu')}
            >
              <Text style={[styles.filterButtonText, filtreStatut === 'recu' && styles.filterButtonTextActive]}>Reçus</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : dons.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="gift-outline" size={64} color="#757575" />
          <Text style={styles.emptyText}>Aucun don à afficher</Text>
        </View>
      ) : (
        <FlatList
          data={filtrerDons()}
          renderItem={renderDonItem}
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
  filterBar: {
    padding: 12,
    backgroundColor: '#fff',
    elevation: 1,
  },
  filterSection: {
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 4,
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
  listContainer: {
    padding: 16,
  },
  donCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  donHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  donTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  donInfo: {
    marginBottom: 12,
  },
  montant: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
  },
  coordonnees: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

export default DonsListScreen; 