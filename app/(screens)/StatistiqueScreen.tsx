import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

interface StatisticsData {
  userStats: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  };
  caseStats: {
    total: number;
    urgent: number;
    inProgress: number;
    completed: number;
    byType: {
      name: string;
      count: number;
      color: string;
    }[];
    monthlyData: {
      month: string;
      count: number;
    }[];
  };
  proStats: {
    total: number;
    active: number;
    pending: number;
    averageCaseLoad: number;
  };
}

interface Professional {
  id: string;
  name: string;
  speciality: string;
  currentCaseload: number;
}

interface Case {
  id: string;
  title: string;
  priority: string;
  status: string;
}

const defaultProfessionals: Professional[] = [
  { id: '1', name: 'Non assigné', speciality: 'N/A', currentCaseload: 0 }
];

const defaultCases: Case[] = [
  { id: '1', title: 'Aucun cas disponible', priority: 'Normal', status: 'En attente' }
];

const defaultStats: StatisticsData = {
  userStats: {
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0
  },
  caseStats: {
    total: 0,
    urgent: 0,
    inProgress: 0,
    completed: 0,
    byType: [
      { name: 'Aucune donnée', count: 0, color: '#cccccc' }
    ],
    monthlyData: [
      { month: 'Aucune donnée', count: 0 }
    ]
  },
  proStats: {
    total: 0,
    active: 0,
    pending: 0,
    averageCaseLoad: 0
  }
};

interface AssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  professionals?: Professional[];
  onAssign: (professional: Professional) => void;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ 
  visible, 
  onClose, 
  professionals = defaultProfessionals, 
  onAssign 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sélectionner un Professionnel</Text>
          <FlatList
            data={professionals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.professionalItem}
                onPress={() => onAssign(item)}
              >
                <Text style={styles.professionalName}>{item.name}</Text>
                <Text style={styles.professionalDetails}>
                  {item.speciality} - {item.currentCaseload} cas actifs
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const StatistiqueScreen: React.FC = () => {
  const [stats, setStats] = useState<StatisticsData>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'year'>('month');
  const [professionals, setProfessionals] = useState<Professional[]>(defaultProfessionals);
  const [cases, setCases] = useState<Case[]>(defaultCases);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const fetchStatistics = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/admin/statistics?timeFrame=${timeFrame}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
      const data = await response.json();
      setStats(data || defaultStats);
    } catch (error) {
      console.error('Erreur:', error);
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Fetch professionals
      const proResponse = await fetch(`${API_URL}/api/admin/professionals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch unassigned cases
      const casesResponse = await fetch(`${API_URL}/api/admin/unassigned-cases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (proResponse.ok && casesResponse.ok) {
        const proData = await proResponse.json();
        const casesData = await casesResponse.json();
        setProfessionals(proData.length > 0 ? proData : defaultProfessionals);
        setCases(casesData.length > 0 ? casesData : defaultCases);
      } else {
        setProfessionals(defaultProfessionals);
        setCases(defaultCases);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setProfessionals(defaultProfessionals);
      setCases(defaultCases);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
    fetchData();
  }, [timeFrame]);

  const handleAssignment = async (professional: Professional) => {
    if (!selectedCase) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/admin/assign-case`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId: selectedCase.id,
          professionalId: professional.id,
        }),
      });

      if (response.ok) {
        fetchData(); // Rafraîchir les données
        setModalVisible(false);
        setSelectedCase(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistiques Détaillées</Text>
        <View style={styles.timeFrameSelector}>
          <TouchableOpacity 
            style={[styles.timeButton, timeFrame === 'week' && styles.activeTimeButton]}
            onPress={() => setTimeFrame('week')}
          >
            <Text style={[styles.timeButtonText, timeFrame === 'week' && styles.activeTimeButtonText]}>
              Semaine
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.timeButton, timeFrame === 'month' && styles.activeTimeButton]}
            onPress={() => setTimeFrame('month')}
          >
            <Text style={[styles.timeButtonText, timeFrame === 'month' && styles.activeTimeButtonText]}>
              Mois
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.timeButton, timeFrame === 'year' && styles.activeTimeButton]}
            onPress={() => setTimeFrame('year')}
          >
            <Text style={[styles.timeButtonText, timeFrame === 'year' && styles.activeTimeButtonText]}>
              Année
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vue d'ensemble des Cas</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="folder" size={24} color="#2196F3" />
            <Text style={styles.statNumber}>{stats.caseStats.total}</Text>
            <Text style={styles.statLabel}>Total des Cas</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="alert-circle" size={24} color="#f44336" />
            <Text style={styles.statNumber}>{stats.caseStats.urgent}</Text>
            <Text style={styles.statLabel}>Cas Urgents</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="time" size={24} color="#FFA000" />
            <Text style={styles.statNumber}>{stats.caseStats.inProgress}</Text>
            <Text style={styles.statLabel}>En Cours</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{stats.caseStats.completed}</Text>
            <Text style={styles.statLabel}>Complétés</Text>
          </View>
        </View>

        <Text style={styles.chartTitle}>Évolution des Cas</Text>
        {stats.caseStats.monthlyData && (
          <LineChart
            data={{
              labels: stats.caseStats.monthlyData.map(d => d.month),
              datasets: [{
                data: stats.caseStats.monthlyData.map(d => d.count)
              }]
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`
            }}
            bezier
          />
        )}

        <Text style={styles.chartTitle}>Répartition par Type</Text>
        {stats?.caseStats?.byType && stats.caseStats.byType.length > 0 ? (
          <PieChart
            data={stats.caseStats.byType.map(d => ({
              name: d.name || 'Sans nom',
              population: d.count || 0,
              color: d.color || '#cccccc',
              legendFontColor: '#333',
              legendFontSize: 12
            }))}
            width={Dimensions.get('window').width - 40}
            height={220}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
            }}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Aucune donnée disponible</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques des Professionnels</Text>
        <View style={styles.proStats}>
          <View style={styles.proStatRow}>
            <Text style={styles.proStatLabel}>Professionnels Actifs:</Text>
            <Text style={styles.proStatValue}>{stats.proStats.active}</Text>
          </View>
          <View style={styles.proStatRow}>
            <Text style={styles.proStatLabel}>En Attente de Validation:</Text>
            <Text style={styles.proStatValue}>{stats.proStats.pending}</Text>
          </View>
          <View style={styles.proStatRow}>
            <Text style={styles.proStatLabel}>Charge Moyenne:</Text>
            <Text style={styles.proStatValue}>{stats.proStats.averageCaseLoad} cas/pro</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assignation des Cas</Text>
        <FlatList
          data={cases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.caseItem}
              onPress={() => {
                setSelectedCase(item);
                setModalVisible(true);
              }}
            >
              <View style={styles.caseHeader}>
                <Text style={styles.caseTitle}>{item.title}</Text>
                <Text style={[styles.casePriority, 
                  { color: item.priority === 'Urgent' ? '#ff4444' : '#2196F3' }]}>
                  {item.priority}
                </Text>
              </View>
              <Text style={styles.caseStatus}>Status: {item.status}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <AssignmentModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedCase(null);
        }}
        professionals={professionals}
        onAssign={handleAssignment}
      />
    </ScrollView>
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
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  timeFrameSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 5,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 5,
  },
  activeTimeButton: {
    backgroundColor: '#fff',
  },
  timeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  activeTimeButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  section: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  proStats: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  proStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  proStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  proStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  caseItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  casePriority: {
    fontSize: 14,
    fontWeight: '500',
  },
  caseStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  professionalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  professionalDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginVertical: 10
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic'
  }
});

export default StatistiqueScreen; 