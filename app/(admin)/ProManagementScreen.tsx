import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator, RefreshControl, ScrollView, Share, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

interface Professional {
  id: string;
  fullName: string;
  email: string;
  phone_number: string;
  status: 'active' | 'pending' | 'inactive';
  verificationDocuments: string[];
  activeCases: number;
  createdAt: string;
  lastLogin?: string;
  totalCases?: number;
  rating?: number;
  notes?: string;
  availability?: any;
  speciality?: string;
  address?: any;
  profile_picture?: string;
}

const ProManagementScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredPros, setFilteredPros] = useState<Professional[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProId, setSelectedProId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedProForNotes, setSelectedProForNotes] = useState<Professional | null>(null);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [selectedProForStats, setSelectedProForStats] = useState<Professional | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedProData, setSelectedProData] = useState<Professional | null>(null);

  const selectedPro = professionals.find(pro => pro.id === selectedProId) || null;

  const fetchProfessionals = async () => {
    setIsFetching(true);
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

      if (selectedProId) {
        const found = (data.data || []).find((pro: Professional) => pro.id === selectedProId);
        if (found) {
          setSelectedProData(found);
        } else {
          setModalVisible(false);
          setSelectedProId(null);
          setSelectedProData(null);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert(
        'Erreur',
        (error as Error).message || 'Impossible de charger la liste des professionnels'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsFetching(false);
    }
  };

  const filterProfessionals = (prosList: Professional[], query: string) => {
    const searchTerm = query.toLowerCase();
    let filtered = prosList.filter(pro =>
      pro.fullName.toLowerCase().includes(searchTerm) ||
      pro.email.toLowerCase().includes(searchTerm) ||
      pro.phone_number.toLowerCase().includes(searchTerm)
    );

    // Appliquer le filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(pro => pro.status === filterStatus);
    }

    // Appliquer le tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'activeCases':
          return b.activeCases - a.activeCases;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredPros(filtered);
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    filterProfessionals(professionals, searchQuery);
  }, [searchQuery, filterStatus, sortBy]);

  useEffect(() => {
    if (
      selectedProId &&
      !professionals.find(pro => pro.id === selectedProId) &&
      !isFetching
    ) {
      setModalVisible(false);
      setSelectedProId(null);
    }
  }, [professionals, selectedProId, isFetching]);

  useEffect(() => {
    // Ne ferme le modal que si le professionnel a été supprimé de la liste ET qu'on n'est pas en train de fetcher
    if (
      modalVisible &&
      selectedProId &&
      !professionals.find(pro => pro.id === selectedProId) &&
      !isFetching
    ) {
      setModalVisible(false);
      setSelectedProId(null);
    }
  }, [professionals, selectedProId, isFetching, modalVisible]);

  const handleStatusChange = async (proId: string, newStatus: 'active' | 'pending' | 'inactive') => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/admin/professionals/${proId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour du statut');
      }

      // Mettre à jour la liste des professionnels
      const updatedPros = professionals.map(pro => 
        pro.id === proId ? { ...pro, status: newStatus } : pro
      );
      setProfessionals(updatedPros);
      filterProfessionals(updatedPros, searchQuery);

      // Mettre à jour selectedProData si c'est le professionnel actuellement sélectionné
      if (selectedProData && selectedProData.id === proId) {
        setSelectedProData({ ...selectedProData, status: newStatus });
      }

      Alert.alert('Succès', 'Statut du professionnel mis à jour avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert(
        'Erreur',
        (error as Error).message || 'Impossible de mettre à jour le statut du professionnel'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePro = async (proId: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/admin/users/${proId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'user' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du changement de rôle');
      }

      // Mettre à jour la liste des professionnels en retirant celui qui a été converti en user
      const updatedPros = professionals.filter(pro => pro.id !== proId);
      setProfessionals(updatedPros);
      filterProfessionals(updatedPros, searchQuery);

      // Fermer le modal si c'est le professionnel actuellement sélectionné
      if (selectedProData && selectedProData.id === proId) {
        setModalVisible(false);
        setSelectedProId(null);
        setSelectedProData(null);
      }

      Alert.alert('Succès', 'Le professionnel a été converti en utilisateur avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert(
        'Erreur',
        (error as Error).message || 'Impossible de changer le rôle du professionnel'
      );
    } finally {
      setLoading(false);
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

  const handleAddNote = async (proId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/admin/professionals/${proId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: noteText }),
      });

      if (response.ok) {
        const updatedPros = professionals.map(pro => 
          pro.id === proId 
            ? { ...pro, notes: noteText } 
            : pro
        );
        setProfessionals(updatedPros);
        setNotesModalVisible(false);
        setNoteText('');
        Alert.alert('Succès', 'Note ajoutée avec succès');
      } else {
        throw new Error('Erreur lors de l\'ajout de la note');
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la note');
    }
  };

  const handleToggleAvailability = async (proId: string, currentAvailability: boolean) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/admin/professionals/${proId}/availability`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availability: !currentAvailability }),
      });

      if (response.ok) {
        const updatedPros = professionals.map(pro => 
          pro.id === proId 
            ? { ...pro, availability: !currentAvailability } 
            : pro
        );
        setProfessionals(updatedPros);
        Alert.alert(
          'Succès',
          `Le professionnel est maintenant ${!currentAvailability ? 'disponible' : 'indisponible'}`
        );
      } else {
        throw new Error('Erreur lors de la mise à jour de la disponibilité');
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la disponibilité');
    }
  };

  const openProModal = (pro: Professional) => {
    setSelectedProId(pro.id);
    setSelectedProData(pro);
    setModalVisible(true);
  };

  const renderProItem = ({ item }: { item: Professional }) => (
    <TouchableOpacity 
      style={styles.proCard}
      onPress={() => openProModal(item)}
    >
      <View style={styles.proInfo}>
        <Text style={styles.proName}>{item.fullName}</Text>
        <Text style={styles.proEmail}>{item.email}</Text>
        <Text style={styles.proPhone}>{item.phone_number}</Text>
        <View style={styles.casesContainer}>
          <Ionicons name="folder" size={16} color="#666" />
          <Text style={styles.casesText}>{item.activeCases} cas actifs</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionIcon}
            onPress={() => {
              setSelectedProForNotes(item);
              setNoteText(item.notes || '');
              setNotesModalVisible(true);
            }}
          >
            <Ionicons name="pencil" size={24} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionIcon}
            onPress={() => {
              setSelectedProForStats(item);
              setStatsModalVisible(true);
            }}
          >
            <Ionicons name="stats-chart" size={24} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionIcon}
            onPress={() => handleToggleAvailability(item.id, item.availability || false)}
          >
            <Ionicons 
              name={item.availability ? "checkmark-circle" : "close-circle"} 
              size={24} 
              color={item.availability ? "#4CAF50" : "#f44336"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const DetailModal = () => {
    if (modalVisible && !selectedProData && isFetching) {
      return (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setModalVisible(false);
            setSelectedProId(null);
            setSelectedProData(null);
          }}
        >
          <View style={styles.modalContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        </Modal>
      );
    }

    if (!modalVisible || !selectedProData) return null;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedProId(null);
          setSelectedProData(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setSelectedProId(null);
                setSelectedProData(null);
              }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Détails du Professionnel</Text>
            <View style={styles.detailRow}>
              <Ionicons name="person" size={20} color="#666" />
              <Text style={styles.detailText}>{selectedProData.fullName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="mail" size={20} color="#666" />
              <Text style={styles.detailText}>{selectedProData.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call" size={20} color="#666" />
              <Text style={styles.detailText}>{selectedProData.phone_number}</Text>
            </View>
            {selectedProData.speciality && (
              <View style={styles.detailRow}>
                <Ionicons name="medal" size={20} color="#666" />
                <Text style={styles.detailText}>Spécialité : {selectedProData.speciality}</Text>
              </View>
            )}
            {selectedProData.profile_picture && (
              <View style={styles.detailRow}>
                <Ionicons name="image" size={20} color="#666" />
                {selectedProData.profile_picture.startsWith('http') ? (
                  <Image source={{ uri: selectedProData.profile_picture }} style={{ width: 60, height: 60, borderRadius: 30, marginLeft: 10 }} />
                ) : (
                  <Text style={styles.detailText}>Photo : {selectedProData.profile_picture}</Text>
                )}
              </View>
            )}
            {selectedProData.availability && (
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.detailText}>
                  Disponibilité : {typeof selectedProData.availability === 'object'
                    ? Object.entries(selectedProData.availability).map(([key, value]) =>
                        typeof value === 'boolean'
                          ? `${key}: ${value ? 'Oui' : 'Non'} `
                          : `${key}: ${value} `
                      ).join(', ')
                    : String(selectedProData.availability)}
                </Text>
              </View>
            )}
            {selectedProData.address && (
              <View style={styles.detailRow}>
                <Ionicons name="location" size={20} color="#666" />
                <Text style={styles.detailText}>
                  Adresse : {typeof selectedProData.address === 'object'
                    ? Object.entries(selectedProData.address).map(([key, value]) =>
                        value ? `${key}: ${value} ` : ''
                      ).join(', ')
                    : String(selectedProData.address)}
                </Text>
              </View>
            )}
            {selectedProData.notes && (
              <View style={styles.detailRow}>
                <Ionicons name="document-text" size={20} color="#666" />
                <Text style={styles.detailText}>Notes : {selectedProData.notes}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Ionicons name="folder" size={20} color="#666" />
              <Text style={styles.detailText}>{selectedProData.activeCases} cas actifs</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.detailText}>
                Inscrit le {new Date(selectedProData.createdAt).toLocaleDateString()}
              </Text>
            </View>
            
            <Text style={styles.sectionTitle}>Documents de Vérification</Text>
            <View style={styles.documentsContainer}>
              {selectedProData.verificationDocuments?.length ? selectedProData.verificationDocuments.map((doc, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.documentItem}
                >
                  <Ionicons name="document-text" size={24} color="#666" />
                  <Text style={styles.documentText}>Document {index + 1}</Text>
                </TouchableOpacity>
              )) : (
                <Text style={styles.noDocumentsText}>Aucun document fourni</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.modalActions}>
              {selectedProData.status === 'pending' && (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={() => {
                    handleStatusChange(selectedProData.id, 'active');
                    setModalVisible(false);
                    setSelectedProId(null);
                    setSelectedProData(null);
                  }}
                >
                  <Text style={styles.actionButtonText}>Approuver</Text>
                </TouchableOpacity>
              )}
              {selectedProData.status === 'active' && (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#FFA000' }]}
                  onPress={() => {
                    Alert.alert(
                      'Confirmation',
                      'Êtes-vous sûr de vouloir désactiver ce professionnel ?',
                      [
                        {
                          text: 'Annuler',
                          style: 'cancel',
                        },
                        {
                          text: 'Désactiver',
                          onPress: () => {
                            handleStatusChange(selectedProData.id, 'inactive');
                            setModalVisible(false);
                            setSelectedProId(null);
                            setSelectedProData(null);
                          },
                          style: 'destructive',
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.actionButtonText}>Désactiver</Text>
                </TouchableOpacity>
              )}
              {selectedProData.status === 'inactive' && (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={() => {
                    handleStatusChange(selectedProData.id, 'active');
                    setModalVisible(false);
                    setSelectedProId(null);
                    setSelectedProData(null);
                  }}
                >
                  <Text style={styles.actionButtonText}>Réactiver</Text>
                </TouchableOpacity>
              )}
              {selectedProData.activeCases === 0 && (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#f44336' }]}
                  onPress={() => handleDeletePro(selectedProData.id)}
                >
                  <Text style={styles.actionButtonText}>Supprimer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleExportData = async () => {
    try {
      // Créer le contenu CSV avec les données importantes des professionnels
      const csvData = professionals.map(pro => ({
        'Nom complet': pro.fullName,
        'Email': pro.email,
        'Téléphone': pro.phone_number,
        'Statut': pro.status,
        'Cas actifs': pro.activeCases,
        'Date d\'inscription': new Date(pro.createdAt).toLocaleDateString(),
        'Dernière connexion': pro.lastLogin ? new Date(pro.lastLogin).toLocaleDateString() : 'Jamais',
        'Total des cas': pro.totalCases || 0,
        'Note moyenne': pro.rating || 'Non évalué',
        'Disponibilité': pro.availability ? 'Oui' : 'Non'
      }));

      // Formater les données en CSV
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      // Partager les données
      await Share.share({
        message: csvString,
        title: 'Données des professionnels',
      });

      Alert.alert(
        'Succès',
        'Les données ont été partagées avec succès',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      Alert.alert('Erreur', 'Impossible de partager les données');
    }
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[
            styles.filterButtonText,
            filterStatus === 'all' && styles.filterButtonTextActive
          ]}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === 'active' && styles.filterButtonActive
          ]}
          onPress={() => setFilterStatus('active')}
        >
          <Text style={[
            styles.filterButtonText,
            filterStatus === 'active' && styles.filterButtonTextActive
          ]}>Actifs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === 'pending' && styles.filterButtonActive
          ]}
          onPress={() => setFilterStatus('pending')}
        >
          <Text style={[
            styles.filterButtonText,
            filterStatus === 'pending' && styles.filterButtonTextActive
          ]}>En attente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === 'inactive' && styles.filterButtonActive
          ]}
          onPress={() => setFilterStatus('inactive')}
        >
          <Text style={[
            styles.filterButtonText,
            filterStatus === 'inactive' && styles.filterButtonTextActive
          ]}>Inactifs</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderSortOptions = () => (
    <View style={styles.sortContainer}>
      <Text style={styles.sortLabel}>Trier par:</Text>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => {
          Alert.alert(
            'Trier par',
            'Choisissez un critère de tri',
            [
              { text: 'Plus récents', onPress: () => setSortBy('newest') },
              { text: 'Plus anciens', onPress: () => setSortBy('oldest') },
              { text: 'Cas actifs', onPress: () => setSortBy('activeCases') },
              { text: 'Note moyenne', onPress: () => setSortBy('rating') },
              { text: 'Annuler', style: 'cancel' }
            ]
          );
        }}
      >
        <Text style={styles.sortButtonText}>
          {sortBy === 'newest' ? 'Plus récents' :
           sortBy === 'oldest' ? 'Plus anciens' :
           sortBy === 'activeCases' ? 'Cas actifs' :
           sortBy === 'rating' ? 'Note moyenne' : 'Trier par'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
      </View>
    );

  const renderHeader = () => (
      <View style={styles.header}>
        <Text style={styles.title}>Gestion des Professionnels</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportData}
        >
          <Ionicons name="download" size={24} color="#2196F3" />
          <Text style={styles.exportButtonText}>Exporter</Text>
        </TouchableOpacity>
      </View>
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
      {renderFilterButtons()}
      {renderSortOptions()}
    </View>
  );

  const renderNotesModal = () => (
    <Modal
      visible={notesModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setNotesModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Notes sur le professionnel</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={4}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Ajouter une note..."
            placeholderTextColor="#999"
          />
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              onPress={() => {
                if (selectedProForNotes) {
                  handleAddNote(selectedProForNotes.id);
                }
              }}
            >
              <Text style={styles.actionButtonText}>Enregistrer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#f44336' }]}
              onPress={() => setNotesModalVisible(false)}
            >
              <Text style={styles.actionButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderStatsModal = () => (
    <Modal
      visible={statsModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setStatsModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Statistiques du professionnel</Text>
          {selectedProForStats && (
            <>
              <View style={styles.statsRow}>
                <Ionicons name="folder" size={24} color="#2196F3" />
                <Text style={styles.statsText}>
                  Total des cas: {selectedProForStats.totalCases || 0}
                </Text>
              </View>
              <View style={styles.statsRow}>
                <Ionicons name="time" size={24} color="#2196F3" />
                <Text style={styles.statsText}>
                  Dernière connexion: {selectedProForStats.lastLogin 
                    ? new Date(selectedProForStats.lastLogin).toLocaleString()
                    : 'Jamais'}
                </Text>
              </View>
              <View style={styles.statsRow}>
                <Ionicons name="star" size={24} color="#FFD700" />
                <Text style={styles.statsText}>
                  Note moyenne: {selectedProForStats?.rating !== undefined && selectedProForStats?.rating !== null
                    ? `${Number(selectedProForStats.rating).toFixed(1)}/5`
                    : 'Non évalué'}
                </Text>
              </View>
              <View style={styles.statsRow}>
                <Ionicons name="calendar" size={24} color="#2196F3" />
                <Text style={styles.statsText}>
                  Membre depuis: {new Date(selectedProForStats.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </>
          )}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2196F3', marginTop: 20 }]}
            onPress={() => setStatsModalVisible(false)}
          >
            <Text style={styles.actionButtonText}>Fermer</Text>
          </TouchableOpacity>
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
      {renderHeader()}
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
      {renderNotesModal()}
      {renderStatsModal()}
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
  proPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  exportButtonText: {
    color: '#2196F3',
    marginLeft: 5,
    fontWeight: '600',
  },
  filterContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  sortLabel: {
    marginRight: 10,
    color: '#666',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
  },
  sortButtonText: {
    marginRight: 5,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionIcon: {
    padding: 5,
    marginLeft: 5,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  statsText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  statsLabel: {
    marginRight: 10,
    color: '#666',
  },
  statsValue: {
    color: '#333',
  },
});

export default ProManagementScreen; 