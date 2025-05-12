import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

interface CaseDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  notes: Array<{
    id: string;
    content: string;
    created_at: string;
  }>;
}

const CaseDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [newNote, setNewNote] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadCaseDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/pro/cases/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails du cas');
      }

      const data = await response.json();
      setCaseDetails(data.data);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du cas');
    }
  };

  useEffect(() => {
    loadCaseDetails();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCaseDetails();
    setRefreshing(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/pro/cases/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      await loadCaseDetails();
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une note');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/pro/cases/${id}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de la note');
      }

      setNewNote('');
      await loadCaseDetails();
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la note');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!caseDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4CAF50']}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>{caseDetails.title}</Text>
        <View style={styles.statusContainer}>
          <Text style={[
            styles.status,
            caseDetails.status === 'in_progress' && styles.statusInProgress,
            caseDetails.status === 'completed' && styles.statusCompleted,
          ]}>
            {caseDetails.status === 'in_progress' ? 'En cours' : 'Terminé'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{caseDetails.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations client</Text>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{caseDetails.client_name}</Text>
          <Text style={styles.clientDetail}>{caseDetails.client_email}</Text>
          <Text style={styles.clientDetail}>{caseDetails.client_phone}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Priorité</Text>
            <Text style={[
              styles.detailValue,
              caseDetails.priority === 'high' && styles.priorityHigh,
              caseDetails.priority === 'medium' && styles.priorityMedium,
              caseDetails.priority === 'low' && styles.priorityLow,
            ]}>
              {caseDetails.priority.charAt(0).toUpperCase() + caseDetails.priority.slice(1)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Créé le</Text>
            <Text style={styles.detailValue}>{formatDate(caseDetails.created_at)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Dernière mise à jour</Text>
            <Text style={styles.detailValue}>{formatDate(caseDetails.updated_at)}</Text>
          </View>
          {caseDetails.completed_at && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Terminé le</Text>
              <Text style={styles.detailValue}>{formatDate(caseDetails.completed_at)}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <View style={styles.notesContainer}>
          {caseDetails.notes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <Text style={styles.noteContent}>{note.content}</Text>
              <Text style={styles.noteDate}>{formatDate(note.created_at)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.addNoteContainer}>
          <TextInput
            style={styles.noteInput}
            value={newNote}
            onChangeText={setNewNote}
            placeholder="Ajouter une note..."
            multiline
          />
          <TouchableOpacity
            style={styles.addNoteButton}
            onPress={handleAddNote}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {caseDetails.status === 'in_progress' && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => handleStatusChange('completed')}
        >
          <Text style={styles.completeButtonText}>Marquer comme terminé</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusInProgress: {
    backgroundColor: '#FFF3E0',
    color: '#FF9800',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  clientInfo: {
    gap: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clientDetail: {
    fontSize: 14,
    color: '#666',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  priorityHigh: {
    color: '#F44336',
  },
  priorityMedium: {
    color: '#FF9800',
  },
  priorityLow: {
    color: '#4CAF50',
  },
  notesContainer: {
    gap: 12,
  },
  noteCard: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
  addNoteContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    minHeight: 40,
  },
  addNoteButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: '#666',
  },
});

export default CaseDetailsScreen; 