import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

// Interface pour les demandes d'ajout de logement
interface DemandeAjoutLogement {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  justificatif?: string;
  statut: 'en_attente' | 'approuvee' | 'refusee';
  dateCreation: string;
  raisonDemande: string;
  estProprio: boolean;
}

const DemandesAjoutLogementScreen: React.FC = () => {
  const [demandes, setDemandes] = useState<DemandeAjoutLogement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState<string | null>(null);
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
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/demandes-ajout-logement/${id}/statut`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut: nouveauStatut })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Mettre à jour la liste localement
      setDemandes(prev => 
        prev.map(demande => 
          demande.id === id ? { ...demande, statut: nouveauStatut } : demande
        )
      );

      Alert.alert(
        'Succès', 
        `La demande a été ${nouveauStatut === 'approuvee' ? 'approuvée' : 'refusée'}.`
      );
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut de la demande');
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

  const viewJustificatif = (url: string) => {
    if (!url) {
      Alert.alert('Information', 'Aucun justificatif disponible');
      return;
    }
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le justificatif');
      }
    });
  };

  const renderDemandeItem = ({ item }: { item: DemandeAjoutLogement }) => (
    <View style={styles.demandeCard}>
      <View style={styles.demandeHeader}>
        <Text style={styles.demandeName}>{item.prenom} {item.nom}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) }]}>
          <Text style={styles.statusText}>{getStatusText(item.statut)}</Text>
        </View>
      </View>
      
      <View style={styles.demandeInfo}>
        <Text><Text style={styles.infoLabel}>Tél:</Text> {item.telephone}</Text>
        <Text><Text style={styles.infoLabel}>Email:</Text> {item.email}</Text>
        <Text><Text style={styles.infoLabel}>Type:</Text> {item.estProprio ? 'Propriétaire' : 'Professionnel'}</Text>
        <Text><Text style={styles.infoLabel}>Date:</Text> {new Date(item.dateCreation).toLocaleDateString()}</Text>
      </View>
      
      {item.raisonDemande && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Motif de la demande:</Text>
          <Text style={styles.messageText}>{item.raisonDemande}</Text>
        </View>
      )}
      
      {item.justificatif && (
        <TouchableOpacity 
          style={styles.justificatifButton}
          onPress={() => viewJustificatif(item.justificatif!)}
        >
          <Ionicons name="document-outline" size={16} color="#2196F3" />
          <Text style={styles.justificatifText}>Voir le justificatif</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.actionContainer}>
        {item.statut === 'en_attente' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleStatutChange(item.id, 'approuvee')}
            >
              <Ionicons name="checkmark-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Approuver</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              onPress={() => handleStatutChange(item.id, 'refusee')}
            >
              <Ionicons name="close-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Refuser</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const filtrerDemandes = () => {
    if (!filtreStatut) return demandes;
    return demandes.filter(demande => demande.statut === filtreStatut);
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
          data={filtrerDemandes()}
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
  }
});

export default DemandesAjoutLogementScreen; 