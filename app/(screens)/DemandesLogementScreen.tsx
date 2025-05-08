import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

// Interface pour les demandes de logement
interface DemandeLogement {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  nombrePersonnes: string;
  niveauUrgence: string;
  message: string;
  logementId?: string;
  statut: 'en_attente' | 'en_cours' | 'acceptee' | 'refusee';
  dateCreation: string;
  logement?: {
    id: string;
    titre: string;
    adresse: string;
    ville: string;
  } | null;
}

function mapDemandeFromApi(apiDemande: any): DemandeLogement {
  return {
    id: apiDemande.id,
    nom: apiDemande.nom,
    prenom: apiDemande.prenom,
    telephone: apiDemande.telephone,
    email: apiDemande.email,
    nombrePersonnes: apiDemande.nombre_personnes,
    niveauUrgence: apiDemande.niveau_urgence,
    message: apiDemande.message,
    logementId: apiDemande.logement_id,
    statut: apiDemande.status,
    dateCreation: apiDemande.created_at,
    logement: apiDemande.logement ?? null,
  };
}

const DemandesLogementScreen: React.FC = () => {
  const [demandes, setDemandes] = useState<DemandeLogement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState<string | null>(null);
  const router = useRouter();

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/demandes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes');
      }

      const data = await response.json();
      setDemandes(data.data.map(mapDemandeFromApi));
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les demandes de logement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const handleStatusChange = async (id: string, nouveauStatut: 'en_cours' | 'acceptee' | 'refusee') => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/demandes/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nouveauStatut })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Réponse serveur:', errorText);
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Mettre à jour la liste localement
      setDemandes(prev => 
        prev.map(demande => 
          demande.id === id ? { ...demande, statut: nouveauStatut } : demande
        )
      );

      Alert.alert('Succès', 'Le statut de la demande a été mis à jour');
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut de la demande');
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return '#FFA000'; // Orange
      case 'en_cours': return '#2196F3';   // Bleu
      case 'acceptee': return '#4CAF50';   // Vert
      case 'refusee': return '#F44336';    // Rouge
      default: return '#757575';           // Gris par défaut
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'acceptee': return 'Acceptée';
      case 'refusee': return 'Refusée';
      default: return statut;
    }
  };

  const renderDemandeItem = ({ item }: { item: DemandeLogement }) => (
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
        <Text><Text style={styles.infoLabel}>Personnes:</Text> {item.nombrePersonnes}</Text>
        <Text><Text style={styles.infoLabel}>Urgence:</Text> {item.niveauUrgence}</Text>
        <Text><Text style={styles.infoLabel}>Date:</Text> {new Date(item.dateCreation).toLocaleDateString()}</Text>
      </View>
      
      {item.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Message:</Text>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      )}
      
      <View style={styles.actionContainer}>
        {item.statut === 'en_attente' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              onPress={() => handleStatusChange(item.id, 'en_cours')}
            >
              <Ionicons name="time-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>En cours</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleStatusChange(item.id, 'acceptee')}
            >
              <Ionicons name="checkmark-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Accepter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              onPress={() => handleStatusChange(item.id, 'refusee')}
            >
              <Ionicons name="close-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Refuser</Text>
            </TouchableOpacity>
          </>
        )}
        
        {item.statut === 'en_cours' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleStatusChange(item.id, 'acceptee')}
            >
              <Ionicons name="checkmark-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Accepter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              onPress={() => handleStatusChange(item.id, 'refusee')}
            >
              <Ionicons name="close-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Refuser</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => {
            let details = `Nom: ${item.prenom} ${item.nom}\nTél: ${item.telephone}\nEmail: ${item.email}\nPersonnes: ${item.nombrePersonnes}\nUrgence: ${item.niveauUrgence}\nDate: ${new Date(item.dateCreation).toLocaleDateString()}`;
            if (item.message) details += `\nMessage: ${item.message}`;
            if (item.logement) {
              details += `\n\nLogement demandé:\nTitre: ${item.logement.titre}\nAdresse: ${item.logement.adresse}\nVille: ${item.logement.ville}`;
            }
            Alert.alert('Détails de la demande', details);
          }}
        >
          <Text style={styles.detailsButtonText}>Détails</Text>
          <Ionicons name="chevron-forward" size={16} color="#2196F3" />
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Gestion des demandes de logement</Text>
        <TouchableOpacity onPress={fetchDemandes}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filtreStatut === null && styles.filterButtonActive]}
          onPress={() => setFiltreStatut(null)}
        >
          <Text style={[styles.filterButtonText, filtreStatut === null && styles.filterButtonTextActive]}>Tous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filtreStatut === 'en_attente' && styles.filterButtonActive]}
          onPress={() => setFiltreStatut('en_attente')}
        >
          <Text style={[styles.filterButtonText, filtreStatut === 'en_attente' && styles.filterButtonTextActive]}>En attente</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filtreStatut === 'en_cours' && styles.filterButtonActive]}
          onPress={() => setFiltreStatut('en_cours')}
        >
          <Text style={[styles.filterButtonText, filtreStatut === 'en_cours' && styles.filterButtonTextActive]}>En cours</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filtreStatut === 'acceptee' && styles.filterButtonActive]}
          onPress={() => setFiltreStatut('acceptee')}
        >
          <Text style={[styles.filterButtonText, filtreStatut === 'acceptee' && styles.filterButtonTextActive]}>Acceptées</Text>
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
          <Text style={styles.emptyText}>Aucune demande de logement</Text>
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
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#2196F3',
    fontSize: 14,
    marginRight: 4,
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

export default DemandesLogementScreen; 