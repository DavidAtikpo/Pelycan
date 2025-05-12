import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

interface Professional {
  id: string;
  fullName: string;
  speciality: string;
  currentCaseLoad: number;
}

interface Case {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'assigned' | 'in_progress' | 'completed';
  type: string;
  description: string;
  createdAt: string;
  isEmergency?: boolean;
}

const TaskAssignmentScreen: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [assignmentNote, setAssignmentNote] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingAssignment, setLoadingAssignment] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchProfessionals(),
        fetchCases()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProfessionals = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token récupéré:', token ? 'Présent' : 'Absent');
      
      console.log('Envoi de la requête pour récupérer les professionnels...');
      const response = await fetch(`${API_URL}/admin/professionals/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Statut de la réponse:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur de réponse:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la récupération des professionnels');
      }

      const data = await response.json();
      console.log('Données reçues:', data);
      console.log('Nombre de professionnels:', data.length);
      
      setProfessionals(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des professionnels:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger la liste des professionnels'
      );
    }
  };

  const fetchCases = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Token non trouvé');
      }

      console.log('Début de la récupération des données...');
      
      // Récupérer les urgences en attente
      console.log('Récupération des urgences...');
      const emergenciesResponse = await fetch(`${API_URL}/admin/emergencies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let emergencyCases = [];
      if (emergenciesResponse.ok) {
        const emergenciesData = await emergenciesResponse.json();
        console.log('Réponse des urgences:', emergenciesData);
        
        if (Array.isArray(emergenciesData)) {
          emergencyCases = emergenciesData
            .filter((emergency: any) => emergency.status === 'pending')
            .map((emergency: any) => ({
              id: emergency.id,
              title: `Urgence ${emergency.type || 'Non spécifié'}`,
              priority: 'high',
              status: 'pending',
              type: emergency.type || 'Non spécifié',
              description: `Urgence requise - ${emergency.type || 'Non spécifié'}`,
              createdAt: emergency.createdAt || new Date().toISOString(),
              isEmergency: true
            }));
        } else if (emergenciesData && Array.isArray(emergenciesData.data)) {
          emergencyCases = emergenciesData.data
            .filter((emergency: any) => emergency.status === 'pending')
            .map((emergency: any) => ({
              id: emergency.id,
              title: `Urgence ${emergency.type || 'Non spécifié'}`,
              priority: 'high',
              status: 'pending',
              type: emergency.type || 'Non spécifié',
              description: `Urgence requise - ${emergency.type || 'Non spécifié'}`,
              createdAt: emergency.createdAt || new Date().toISOString(),
              isEmergency: true
            }));
        }
      } else {
        console.error('Erreur urgences:', await emergenciesResponse.text());
      }

      // Récupérer les cas non assignés
      console.log('Récupération des cas normaux...');
      const casesResponse = await fetch(`${API_URL}/admin/cases/unassigned`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let normalCases = [];
      if (casesResponse.ok) {
        const casesData = await casesResponse.json();
        console.log('Réponse des cas:', casesData);
        
        if (Array.isArray(casesData)) {
          normalCases = casesData;
        } else if (casesData && Array.isArray(casesData.data)) {
          normalCases = casesData.data;
        }
      } else {
        console.error('Erreur cas:', await casesResponse.text());
      }

      // Combiner et trier les cas
      const allCases = [...emergencyCases, ...normalCases];
      console.log('Nombre total de cas:', allCases.length);
      console.log('Dont urgences:', emergencyCases.length);
      
      const sortedCases = allCases.sort((a, b) => {
        if (a.isEmergency && !b.isEmergency) return -1;
        if (!a.isEmergency && b.isEmergency) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setCases(sortedCases);
    } catch (error) {
      console.error('Erreur complète:', error);
      if (error instanceof Error) {
        console.error('Message d\'erreur:', error.message);
        console.error('Stack:', error.stack);
      }
      Alert.alert(
        'Erreur',
        'Impossible de charger la liste des cas. Veuillez vérifier votre connexion et réessayer.'
      );
    }
  };

  const handleAssignment = async () => {
    if (!selectedCase || !selectedPro) {
      Alert.alert('Erreur', 'Veuillez sélectionner un cas et un professionnel');
      return;
    }

    setLoadingAssignment(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // URL différente selon le type de cas (urgence ou normal)
      const assignmentUrl = selectedCase.isEmergency 
        ? `${API_URL}/admin/emergency/${selectedCase.id}/assign`
        : `${API_URL}/admin/assignments`;

      const response = await fetch(assignmentUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professionalId: selectedPro.id,
          note: assignmentNote,
          ...(selectedCase.isEmergency ? {} : { caseId: selectedCase.id })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'assignation');
      }

      Alert.alert('Succès', `${selectedCase.isEmergency ? 'Urgence' : 'Cas'} assigné avec succès`);
      setModalVisible(false);
      setSelectedCase(null);
      setSelectedPro(null);
      setAssignmentNote('');
      await loadData(); // Rafraîchir toutes les données
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      Alert.alert(
        'Erreur',
        (error as Error).message || 'Une erreur est survenue lors de l\'assignation'
      );
    } finally {
      setLoadingAssignment(false);
    }
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         caseItem.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || caseItem.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#FFA000';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const renderCaseItem = ({ item }: { item: Case }) => (
    <TouchableOpacity 
      style={[
        styles.caseCard,
        item.isEmergency && styles.emergencyCaseCard
      ]}
      onPress={() => {
        setSelectedCase(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.caseHeader}>
        <View style={styles.caseTitle}>
          <Text style={styles.caseTitleText}>
            {item.isEmergency ? '🚨 ' : ''}{item.title}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.caseType}>{item.type}</Text>
      </View>
      <Text style={styles.caseDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.caseFooter}>
        <Text style={styles.caseDate}>
          Créé le: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {item.isEmergency && (
          <View style={styles.emergencyBadge}>
            <Text style={styles.emergencyText}>URGENCE</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const AssignmentModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Assigner un Cas</Text>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedCase && (
            <View style={styles.selectedCaseInfo}>
              <Text style={styles.selectedCaseTitle}>{selectedCase.title}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedCase.priority) }]}>
                <Text style={styles.priorityText}>{selectedCase.priority.toUpperCase()}</Text>
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Sélectionner un Professionnel</Text>
          {professionals.length === 0 ? (
            <Text style={styles.noDataText}>Aucun professionnel disponible</Text>
          ) : (
            <ScrollView style={styles.proList}>
              {professionals.map((pro) => (
                <TouchableOpacity
                  key={pro.id}
                  style={[
                    styles.proItem,
                    selectedPro?.id === pro.id && styles.selectedProItem
                  ]}
                  onPress={() => setSelectedPro(pro)}
                >
                  <View style={styles.proInfo}>
                    <Text style={[
                      styles.proName,
                      selectedPro?.id === pro.id && styles.selectedProText
                    ]}>{pro.fullName}</Text>
                    <Text style={[
                      styles.proSpeciality,
                      selectedPro?.id === pro.id && styles.selectedProText
                    ]}>{pro.speciality}</Text>
                  </View>
                  <Text style={[
                    styles.caseLoad,
                    selectedPro?.id === pro.id && styles.selectedProText
                  ]}>
                    Cas actifs: {pro.currentCaseLoad}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={styles.sectionTitle}>Note d'assignation</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            placeholder="Ajouter une note pour le professionnel..."
            value={assignmentNote}
            onChangeText={setAssignmentNote}
          />

          <TouchableOpacity 
            style={[
              styles.assignButton,
              (!selectedCase || !selectedPro || loadingAssignment) && styles.disabledButton
            ]}
            onPress={handleAssignment}
            disabled={!selectedCase || !selectedPro || loadingAssignment}
          >
            {loadingAssignment ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.assignButtonText}>Assigner le Cas</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D81B60" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assignation des Cas</Text>
        <View style={styles.filterContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un cas..."
              value={searchQuery}
              onChangeText={setSearchQuery}
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
          <View style={styles.priorityFilter}>
            {['all', 'high', 'medium', 'low'].map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.filterButton,
                  filterPriority === priority && styles.activeFilter
                ]}
                onPress={() => setFilterPriority(priority)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterPriority === priority && styles.activeFilterText
                ]}>
                  {priority === 'all' ? 'Tous' : priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <FlatList
        data={filteredCases}
        renderItem={renderCaseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            colors={['#D81B60']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery || filterPriority !== 'all'
                ? 'Aucun cas ne correspond à vos critères'
                : 'Aucun cas à assigner'}
            </Text>
          </View>
        }
      />

      <AssignmentModal />
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
  filterContainer: {
    gap: 10,
  },
  searchInputContainer: {
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
  },
  clearButton: {
    padding: 5,
  },
  priorityFilter: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#D81B60',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  caseCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  caseHeader: {
    marginBottom: 10,
  },
  caseTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  caseType: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
  caseDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseDate: {
    color: '#666',
    fontSize: 12,
  },
  statusBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#666',
    fontSize: 12,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  selectedCaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  selectedCaseTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  proList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  proItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  selectedProItem: {
    backgroundColor: '#D81B60',
  },
  proInfo: {
    flex: 1,
  },
  proName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  proSpeciality: {
    fontSize: 14,
    color: '#666',
  },
  caseLoad: {
    fontSize: 12,
    color: '#666',
  },
  noteInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  assignButton: {
    backgroundColor: '#D81B60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 10,
  },
  selectedProText: {
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  emergencyCaseCard: {
    borderWidth: 2,
    borderColor: '#f44336',
    backgroundColor: '#fff5f5',
  },
  emergencyBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  emergencyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TaskAssignmentScreen; 