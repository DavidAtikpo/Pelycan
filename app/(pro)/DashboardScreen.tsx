import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_URL } from '../../config/api';

interface DashboardStats {
  activeCases: number;
  completedCases: number;
  pendingEmergencies: number;
  todayAppointments: number;
  performanceScore: number;
}

interface Case {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  createdAt: string;
  isEmergency?: boolean;
  clientId?: string;
  clientName?: string;
}

interface Appointment {
  id: string;
  client_name: string;
  time: string;
  type: string;
}

const DashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeCases: 0,
    completedCases: 0,
    pendingEmergencies: 0,
    todayAppointments: 0,
    performanceScore: 0
  });
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [caseFilter, setCaseFilter] = useState('all');
  const router = useRouter();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      // Récupérer les statistiques
      const statsResponse = await fetch(`${API_URL}/pro/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!statsResponse.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const statsData = await statsResponse.json();
      setStats({
        activeCases: statsData.activeCases || 0,
        completedCases: statsData.completedCases || 0,
        pendingEmergencies: statsData.pendingEmergencies || 0,
        todayAppointments: statsData.todayAppointments || 0,
        performanceScore: statsData.performanceScore || 0
      });

      // Récupérer les cas récents
      const casesResponse = await fetch(`${API_URL}/pro/cases/recent`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!casesResponse.ok) {
        throw new Error('Erreur lors de la récupération des cas récents');
      }

      const casesData = await casesResponse.json();
      setRecentCases(casesData.data || []);

      // Récupérer les rendez-vous du jour
      const appointmentsResponse = await fetch(`${API_URL}/pro/appointments/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!appointmentsResponse.ok) {
        throw new Error('Erreur lors de la récupération des rendez-vous');
      }

      const appointmentsData = await appointmentsResponse.json();
      setTodayAppointments(appointmentsData.data || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les données du dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleCasePress = (caseId: string) => {
    router.push({
      pathname: '/(pro)/CaseDetailsScreen',
      params: { id: caseId }
    });
  };

  const handleNewCase = () => {
    router.push('/(pro)/NewCaseScreen' as any);
  };

  const handleAppointments = () => {
    router.push('/(pro)/AppointmentsScreen');
  };

  const handleMessages = () => {
    router.push('/(pro)/MessagesScreen');
  };

  const handleAppointmentPress = (appointmentId: string) => {
    router.push({
      pathname: '/(pro)/AppointmentsScreen',
      params: { id: appointmentId }
    });
  };

  const handleVideoCall = (caseItem: Case) => {
    if (!caseItem.clientId || !caseItem.clientName) {
      Alert.alert('Erreur', 'Informations client manquantes pour lancer l\'appel vidéo');
      return;
    }

    router.push({
      pathname: '/(pro)/VideoCallScreen',
      params: {
        caseId: caseItem.id,
        clientId: caseItem.clientId,
        clientName: caseItem.clientName
      }
    });
  };

  const getFilteredCases = () => {
    switch (caseFilter) {
      case 'emergency':
        return recentCases.filter(c => c.isEmergency);
      case 'active':
        return recentCases.filter(c => c.status === 'in_progress');
      case 'completed':
        return recentCases.filter(c => c.status === 'completed');
      default:
        return recentCases;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#f44336';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
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
        <Text style={styles.headerTitle}>Dashboard Professionnel</Text>
        <View style={styles.performanceContainer}>
          <Text style={styles.performanceLabel}>Performance</Text>
          <View style={[styles.performanceScore, { backgroundColor: getPerformanceColor(stats.performanceScore) }]}>
            <Text style={styles.performanceScoreText}>{stats.performanceScore}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="folder" size={32} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.activeCases}</Text>
          <Text style={styles.statLabel}>Cas Actifs</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={32} color="#FF9800" />
          <Text style={styles.statNumber}>{stats.todayAppointments}</Text>
          <Text style={styles.statLabel}>RDV Aujourd'hui</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="alert-circle" size={32} color="#f44336" />
          <Text style={styles.statNumber}>{stats.pendingEmergencies}</Text>
          <Text style={styles.statLabel}>Urgences</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleNewCase}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Nouveau Cas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleAppointments}>
          <Ionicons name="calendar" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Rendez-vous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleMessages}>
          <Ionicons name="mail" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Messages</Text>
        </TouchableOpacity>
      </View>

      {todayAppointments.length > 0 && (
        <View style={styles.todayAppointmentsContainer}>
          <Text style={styles.sectionTitle}>Rendez-vous du jour</Text>
          {todayAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() => handleAppointmentPress(appointment.id)}
            >
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentTime}>{appointment.time}</Text>
                <Text style={styles.appointmentClient}>{appointment.client_name}</Text>
                <Text style={styles.appointmentType}>{appointment.type}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.recentCasesContainer}>
        <View style={styles.casesHeader}>
          <Text style={styles.sectionTitle}>Situations Récentes</Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, caseFilter === 'all' && styles.filterButtonActive]}
              onPress={() => setCaseFilter('all')}
            >
              <Text style={[styles.filterButtonText, caseFilter === 'all' && styles.filterButtonTextActive]}>Tous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, caseFilter === 'emergency' && styles.filterButtonActive]}
              onPress={() => setCaseFilter('emergency')}
            >
              <Text style={[styles.filterButtonText, caseFilter === 'emergency' && styles.filterButtonTextActive]}>Urgences</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, caseFilter === 'active' && styles.filterButtonActive]}
              onPress={() => setCaseFilter('active')}
            >
              <Text style={[styles.filterButtonText, caseFilter === 'active' && styles.filterButtonTextActive]}>En cours</Text>
            </TouchableOpacity>
          </View>
        </View>
        {getFilteredCases().length === 0 ? (
          <Text style={styles.noCasesText}>Aucun cas à afficher</Text>
        ) : (
          getFilteredCases().map((caseItem) => (
            <TouchableOpacity
              key={caseItem.id}
              style={styles.caseCard}
              onPress={() => handleCasePress(caseItem.id)}
            >
              <Ionicons 
                name={caseItem.isEmergency ? "alert-circle" : "person"} 
                size={24} 
                color={caseItem.isEmergency ? "#f44336" : "#4CAF50"} 
              />
              <View style={styles.caseInfo}>
                <Text style={styles.caseName}>{caseItem.title}</Text>
                <Text style={[
                  styles.caseStatus,
                  caseItem.isEmergency && styles.emergencyStatus
                ]}>
                  {caseItem.status} • {caseItem.priority}
                </Text>
              </View>
              {caseItem.isEmergency && (
                <TouchableOpacity
                  style={styles.videoCallButton}
                  onPress={() => handleVideoCall(caseItem)}
                >
                  <Ionicons name="videocam" size={24} color="#4CAF50" />
                </TouchableOpacity>
              )}
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          ))
        )}
      </View>
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
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  performanceContainer: {
    alignItems: 'center',
  },
  performanceLabel: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
  performanceScore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  performanceScoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '30%',
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  todayAppointmentsContainer: {
    padding: 20,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentClient: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  appointmentType: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  recentCasesContainer: {
    padding: 20,
  },
  casesHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 12,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  caseCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  caseInfo: {
    flex: 1,
    marginLeft: 15,
  },
  caseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  caseStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emergencyStatus: {
    color: '#f44336',
  },
  noCasesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  videoCallButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
  },
});

export default DashboardScreen; 