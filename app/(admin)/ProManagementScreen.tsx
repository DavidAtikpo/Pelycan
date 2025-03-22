import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

interface Professional {
  id: string;
  fullName: string;
  email: string;
  speciality: string;
  status: 'active' | 'pending' | 'inactive';
  verificationDocuments: string[];
  activeCases: number;
  createdAt: string;
}

const ProManagementScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredPros, setFilteredPros] = useState<Professional[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfessionals = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/admin/professionals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des professionnels');
      }

      const data = await response.json();
      setProfessionals(data.data || []);
      filterProfessionals(data.data || [], searchQuery);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert(
        'Erreur',
        (error as Error).message || 'Impossible de charger la liste des professionnels'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterProfessionals = (prosList: Professional[], query: string) => {
    const searchTerm = query.toLowerCase();
    const filtered = prosList.filter(pro =>
      pro.fullName.toLowerCase().includes(searchTerm) ||
      pro.email.toLowerCase().includes(searchTerm) ||
      pro.speciality.toLowerCase().includes(searchTerm)
    );
    setFilteredPros(filtered);
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    filterProfessionals(professionals, searchQuery);
  }, [searchQuery]);

  const handleStatusChange = async (proId: string, newStatus: 'active' | 'pending' | 'inactive') => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/admin/professionals/${proId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedPros = professionals.map(pro => 
          pro.id === proId ? { ...pro, status: newStatus } : pro
        );
        setProfessionals(updatedPros);
        filterProfessionals(updatedPros, searchQuery);
        Alert.alert('Succès', 'Statut du professionnel mis à jour');
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour le statut du professionnel'
      );
    }
  };

  const handleDeletePro = async (proId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/admin/professionals/${proId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedPros = professionals.filter(pro => pro.id !== proId);
        setProfessionals(updatedPros);
        filterProfessionals(updatedPros, searchQuery);
        setModalVisible(false);
        Alert.alert('Succès', 'Professionnel supprimé avec succès');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert(
        'Erreur',
        (error as Error).message || 'Impossible de supprimer le professionnel'
      );
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfessionals();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FFA000';
      case 'inactive': return '#f44336';
      default: return '#666';
    }
  };

  const renderProItem = ({ item }: { item: Professional }) => (
    <TouchableOpacity 
      style={styles.proCard}
      onPress={() => {
        setSelectedPro(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.proInfo}>
        <Text style={styles.proName}>{item.fullName}</Text>
        <Text style={styles.proEmail}>{item.email}</Text>
        <View style={styles.specialityContainer}>
          <Ionicons name="medical" size={16} color="#666" />
          <Text style={styles.specialityText}>{item.speciality}</Text>
        </View>
        <View style={styles.casesContainer}>
          <Ionicons name="folder" size={16} color="#666" />
          <Text style={styles.casesText}>{item.activeCases} cas actifs</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        {item.status === 'pending' && (
          <TouchableOpacity 
            style={styles.verifyButton}
            onPress={() => handleStatusChange(item.id, 'active')}
          >
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const DetailModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          
          {selectedPro && (
            <>
              <Text style={styles.modalTitle}>Détails du Professionnel</Text>
              <View style={styles.detailRow}>
                <Ionicons name="person" size={20} color="#666" />
                <Text style={styles.detailText}>{selectedPro.fullName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="mail" size={20} color="#666" />
                <Text style={styles.detailText}>{selectedPro.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="medical" size={20} color="#666" />
                <Text style={styles.detailText}>{selectedPro.speciality}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="folder" size={20} color="#666" />
                <Text style={styles.detailText}>{selectedPro.activeCases} cas actifs</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.detailText}>
                  Inscrit le {new Date(selectedPro.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <Text style={styles.sectionTitle}>Documents de Vérification</Text>
              <View style={styles.documentsContainer}>
                {selectedPro.verificationDocuments?.map((doc, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.documentItem}
                  >
                    <Ionicons name="document-text" size={24} color="#666" />
                    <Text style={styles.documentText}>Document {index + 1}</Text>
                  </TouchableOpacity>
                )) || (
                  <Text style={styles.noDocumentsText}>Aucun document fourni</Text>
                )}
              </View>

              <View style={styles.modalActions}>
                {selectedPro.status === 'pending' && (
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => {
                      handleStatusChange(selectedPro.id, 'active');
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Approuver</Text>
                  </TouchableOpacity>
                )}
                {selectedPro.activeCases === 0 && (
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#f44336' }]}
                    onPress={() => {
                      Alert.alert(
                        'Confirmation',
                        'Êtes-vous sûr de vouloir supprimer ce professionnel ?',
                        [
                          {
                            text: 'Annuler',
                            style: 'cancel',
                          },
                          {
                            text: 'Supprimer',
                            onPress: () => handleDeletePro(selectedPro.id),
                            style: 'destructive',
                          },
                        ],
                      );
                    }}
                  >
                    <Text style={styles.actionButtonText}>Supprimer</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestion des Professionnels</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un professionnel..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredPros}
        renderItem={renderProItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery.length > 0 
                ? 'Aucun professionnel ne correspond à votre recherche'
                : 'Aucun professionnel trouvé'}
            </Text>
          </View>
        }
      />

      <DetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  listContainer: {
    padding: 15,
  },
  proCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  proInfo: {
    flex: 1,
  },
  proName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  proEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  specialityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  specialityText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  casesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  casesText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  verifyButton: {
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  documentsContainer: {
    marginBottom: 20,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  documentText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  noDocumentsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProManagementScreen; 