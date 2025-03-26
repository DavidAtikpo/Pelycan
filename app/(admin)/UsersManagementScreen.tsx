import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'pro' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
}

const UsersManagementScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }

      const data = await response.json();
      setUsers(data.data);
      filterUsers(data.data, searchQuery);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger la liste des utilisateurs'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterUsers = (usersList: User[], query: string) => {
    const searchTerm = query.toLowerCase();
    const filtered = usersList.filter(user =>
      user.fullName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm)
    );
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    fetchUsers();
    const intervalId = setInterval(fetchUsers, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    filterUsers(users, searchQuery);
  }, [searchQuery]);

  const handleUserStatusChange = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedUsers = users.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        );
        setUsers(updatedUsers);
        filterUsers(updatedUsers, searchQuery);
        Alert.alert('Succès', 'Statut de l\'utilisateur mis à jour');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert(
        'Erreur',
        (error as Error).message || 'Impossible de mettre à jour le statut de l\'utilisateur'
      );
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'pro' | 'user') => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        const updatedUsers = users.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        );
        setUsers(updatedUsers);
        filterUsers(updatedUsers, searchQuery);
        setRoleModalVisible(false);
        Alert.alert('Succès', 'Rôle de l\'utilisateur mis à jour');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert(
        'Erreur',
        (error as Error).message || 'Impossible de mettre à jour le rôle de l\'utilisateur'
      );
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return 'shield-checkmark';
      case 'pro':
        return 'briefcase';
      default:
        return 'person';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#FF9800';
      case 'pro':
        return '#2196F3';
      default:
        return '#4CAF50';
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.fullName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.roleContainer}>
          <Ionicons 
            name={getRoleIcon(item.role)} 
            size={16} 
            color={getRoleColor(item.role)} 
          />
          <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
            {item.role.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.roleButton}
          onPress={() => {
            setSelectedUser(item);
            setRoleModalVisible(true);
          }}
        >
          <Ionicons name="swap-horizontal" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.statusButton,
            { backgroundColor: item.status === 'active' ? '#4CAF50' : '#f44336' }
          ]}
          onPress={() => handleUserStatusChange(
            item.id, 
            item.status === 'active' ? 'inactive' : 'active'
          )}
        >
          <Text style={styles.statusButtonText}>
            {item.status === 'active' ? 'Actif' : 'Inactif'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRoleModal = () => (
    <Modal
      visible={roleModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setRoleModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Changer le rôle</Text>
          <Text style={styles.modalSubtitle}>
            Utilisateur : {selectedUser?.fullName}
          </Text>
          <View style={styles.roleOptions}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedUser?.role === 'user' && styles.selectedRole
              ]}
              onPress={() => handleRoleChange(selectedUser!.id, 'user')}
            >
              <Ionicons name="person" size={24} color="#4CAF50" />
              <Text style={styles.roleOptionText}>Utilisateur</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedUser?.role === 'pro' && styles.selectedRole
              ]}
              onPress={() => handleRoleChange(selectedUser!.id, 'pro')}
            >
              <Ionicons name="briefcase" size={24} color="#2196F3" />
              <Text style={styles.roleOptionText}>Professionnel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedUser?.role === 'admin' && styles.selectedRole
              ]}
              onPress={() => handleRoleChange(selectedUser!.id, 'admin')}
            >
              <Ionicons name="shield-checkmark" size={24} color="#FF9800" />
              <Text style={styles.roleOptionText}>Administrateur</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setRoleModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>Gestion des Utilisateurs</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un utilisateur..."
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
        data={filteredUsers}
        renderItem={renderUserItem}
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
            <Ionicons name="people" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery.length > 0 
                ? 'Aucun utilisateur ne correspond à votre recherche'
                : 'Aucun utilisateur trouvé'}
            </Text>
          </View>
        }
      />

      {renderRoleModal()}
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
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  roleText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleButton: {
    padding: 8,
    marginRight: 10,
  },
  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 14,
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
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  roleOptions: {
    marginBottom: 20,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  selectedRole: {
    backgroundColor: '#e3f2fd',
  },
  roleOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UsersManagementScreen; 