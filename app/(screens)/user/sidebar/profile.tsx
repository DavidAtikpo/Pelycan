import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const firstName = await AsyncStorage.getItem('firstName');
      const lastName = await AsyncStorage.getItem('lastName');
      const email = await AsyncStorage.getItem('email');
      const phoneNumber = await AsyncStorage.getItem('phoneNumber');
      const role = await AsyncStorage.getItem('role');

      setUserData({
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || '',
        phoneNumber: phoneNumber || '',
        role: role || '',
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const handleEditProfile = () => {
    // TODO: Implémenter la logique d'édition du profil
    console.log('Édition du profil');
  };

  const handleChangePassword = () => {
    // TODO: Implémenter la logique de changement de mot de passe
    console.log('Changement de mot de passe');
  };

  const handleBiometricSettings = () => {
    // TODO: Implémenter la logique des paramètres biométriques
    console.log('Paramètres biométriques');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Ionicons name="person-circle-outline" size={80} color="#D81B60" />
          </View>
          <Text style={styles.name}>{`${userData.firstName} ${userData.lastName}`}</Text>
          <Text style={styles.role}>{userData.role}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={24} color="#666" />
            <Text style={styles.infoText}>{userData.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={24} color="#666" />
            <Text style={styles.infoText}>{userData.phoneNumber}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={24} color="#D81B60" />
            <Text style={styles.buttonText}>Modifier le profil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
            <Ionicons name="key-outline" size={24} color="#D81B60" />
            <Text style={styles.buttonText}>Changer le mot de passe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleBiometricSettings}>
            <Ionicons name="finger-print-outline" size={24} color="#D81B60" />
            <Text style={styles.buttonText}>Paramètres biométriques</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          <View style={styles.securityInfo}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#4CAF50" />
            <Text style={styles.securityText}>Authentification à deux facteurs activée</Text>
          </View>
          <View style={styles.securityInfo}>
            <Ionicons name="finger-print-outline" size={24} color="#4CAF50" />
            <Text style={styles.securityText}>Authentification biométrique activée</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  securityText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 10,
  },
});

export default ProfileScreen; 