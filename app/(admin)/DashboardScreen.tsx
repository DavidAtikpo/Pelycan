import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

interface DashboardStats {
  totalUsers: number;
  totalPros: number;
  urgentCases: number;
  recentActivity: {
    newUsers: number;
    activeCases: number;
    pendingPros: number;
  };
  emergencyRequests: {
    id: string;
    type: string;
    status: string;
    createdAt: string;
    location: {
      latitude: number;
      longitude: number;
    };
  }[];
}

const DashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDashboardStats = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    // Rafraîchir les stats toutes les 5 minutes
    const interval = setInterval(fetchDashboardStats, 300000);
    return () => clearInterval(interval);
  }, []);

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
        <Text style={styles.headerTitle}>Dashboard Administrateur</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchDashboardStats}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>{stats?.totalUsers || 0}</Text>
          <Text style={styles.statLabel}>Utilisateurs</Text>
          <Text style={styles.statSubtext}>+{stats?.recentActivity.newUsers || 0} nouveaux</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="briefcase" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats?.totalPros || 0}</Text>
          <Text style={styles.statLabel}>Professionnels</Text>
          <Text style={styles.statSubtext}>{stats?.recentActivity.pendingPros || 0} en attente</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="alert-circle" size={24} color="#f44336" />
          <Text style={styles.statNumber}>{stats?.urgentCases || 0}</Text>
          <Text style={styles.statLabel}>Cas Urgents</Text>
          <Text style={styles.statSubtext}>{stats?.recentActivity.activeCases || 0} actifs</Text>
        </View>
      </View>

      <View style={styles.emergencySection}>
        <Text style={styles.sectionTitle}>Demandes d'Urgence Récentes</Text>
        {stats?.emergencyRequests?.length ? (
          stats.emergencyRequests.map((request) => (
            <View key={request.id} style={styles.emergencyCard}>
              <View style={styles.emergencyHeader}>
                <Ionicons 
                  name={request.type === 'POLICE' ? 'shield' : 
                        request.type === 'MEDICAL' ? 'medical' : 
                        request.type === 'FIRE' ? 'flame' : 'alert-circle'} 
                  size={24} 
                  color="#f44336" 
                />
                <Text style={styles.emergencyType}>{request.type}</Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: request.status === 'pending' ? '#FFA000' : 
                                   request.status === 'in_progress' ? '#2196F3' : 
                                   request.status === 'completed' ? '#4CAF50' : '#f44336' }
                ]}>
                  <Text style={styles.statusText}>{request.status}</Text>
                </View>
              </View>
              <Text style={styles.emergencyTime}>
                {new Date(request.createdAt).toLocaleString()}
              </Text>
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => router.push({
                  pathname: '/(screens)/EmergencyDetailsScreen',
                  params: { id: request.id }
                })}
              >
                <Text style={styles.viewDetailsText}>Voir les détails</Text>
                <Ionicons name="chevron-forward" size={16} color="#2196F3" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noEmergencyText}>Aucune demande d'urgence récente</Text>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(admin)/ProManagementScreen')}
        >
          <Ionicons name="people" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Gestion des Pros</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" style={styles.actionArrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(admin)/UsersManagementScreen')}
        >
          <Ionicons name="person" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Gestion des Utilisateurs</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" style={styles.actionArrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(screens)/TaskAssignmentScreen')}
        >
          <Ionicons name="git-branch" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Assignation des Cas</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" style={styles.actionArrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(screens)/StatistiqueScreen')}
        >
          <Ionicons name="stats-chart" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Statistiques</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" style={styles.actionArrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(screens)/DemandesLogementScreen')}
        >
          <Ionicons name="home-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Gestion des demandes de logement</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" style={styles.actionArrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(screens)/AdminRecuperDemandesAjoutLogementScreen')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Gestion des demandes de partenariat</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" style={styles.actionArrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(screens)/DonsListScreen')}
        >
          <Ionicons name="gift-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Voir tous les dons</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" style={styles.actionArrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(screens)/GestionLogementsScreen')}
        >
          <Ionicons name="business-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Gestion des logements des partenaires</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" style={styles.actionArrow} />
        </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 5,
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
  statSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#2196F3',
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
    flex: 1,
  },
  actionArrow: {
    marginLeft: 'auto',
  },
  emergencySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emergencyCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emergencyType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emergencyTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewDetailsText: {
    color: '#2196F3',
    fontSize: 14,
    marginRight: 5,
  },
  noEmergencyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default DashboardScreen; 