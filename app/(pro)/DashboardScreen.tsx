import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface DashboardStats {
  activeCases: number;
  completedCases: number;
  pendingEmergencies: number;
}

interface Case {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  createdAt: string;
  isEmergency?: boolean;
}

const DashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeCases: 0,
    completedCases: 0,
    pendingEmergencies: 0
  });
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Récupérer les statistiques
      const statsResponse = await fetch('http://10.0.2.2:3000/api/pro/dashboard/stats', {
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
        pendingEmergencies: statsData.pendingEmergencies || 0
      });

      // Récupérer les cas récents
      const casesResponse = await fetch('http://10.0.2.2:3000/api/pro/cases/recent', {
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

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les données du dashboard'
      );
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
      pathname: '/case',
      params: { id: caseId }
    } as any);
  };

  const handleNewCase = () => {
    router.push('/new-case' as any);
  };

  const handleAppointments = () => {
    router.push('/appointments' as any);
  };

  const handleMessages = () => {
    router.push('/messages' as any);
  };

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
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.activeCases}</Text>
          <Text style={styles.statLabel}>Cas Actifs</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.completedCases}</Text>
          <Text style={styles.statLabel}>Cas Résolus</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="alert-circle" size={24} color="#f44336" />
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
          <Ionicons name="chatbubbles" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Messages</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentCasesContainer}>
        <Text style={styles.sectionTitle}>Situations Récentes</Text>
        {recentCases.length === 0 ? (
          <Text style={styles.noCasesText}>Aucun cas récent</Text>
        ) : (
          recentCases.map((caseItem) => (
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
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
  recentCasesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
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
});

export default DashboardScreen; 