import { Tabs, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { API_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const { width } = Dimensions.get('window');

function AlertIndicator() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [hasActiveAlert, setHasActiveAlert] = useState(false);
  const currentPath = usePathname();
  const isAlertsPage = currentPath?.includes('AlertsScreen');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkAlerts = async () => {
      if (isChecking) return;
      
      try {
        setIsChecking(true);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setHasActiveAlert(false);
          return;
        }

        const response = await fetch(`${API_URL}/alerts/active`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setHasActiveAlert(data.hasActiveAlerts);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des alertes:', error);
        setHasActiveAlert(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [isChecking]);

  if (!hasActiveAlert || isAlertsPage) return null;

  return (
    <Animated.View style={[
      styles.alertIndicator,
      { transform: [{ scale: pulseAnim }] }
    ]}>
      <View style={styles.alertDot} />
    </Animated.View>
  );
}

function AdminLayout() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const slideAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    const getUserName = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        if (name) {
          setUserName(name);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nom:', error);
      }
    };
    getUserName();
  }, []);

  const toggleSidebar = () => {
    requestAnimationFrame(() => {
      const toValue = isSidebarOpen ? -width : 0;
      Animated.timing(slideAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsSidebarOpen(!isSidebarOpen);
      });
    });
  };

  const handleLogout = async () => {
    try {
      // Supprimer toutes les données de session
      await AsyncStorage.multiRemove([
        'userToken',
        'userName',
        'userRole',
        'userId',
        'userEmail',
        'userFirstName',
        'userLastName',
        'userData',
        'expoPushToken', // Supprimer le token de notification push
        'navigatingFromNotification', // Supprimer le flag de navigation
        'returningToDashboard' // Supprimer le flag de retour
      ]);

      // Désinscrire des notifications push
      try {
        await Notifications.unregisterForNotificationsAsync();
      } catch (error) {
        console.error('Erreur lors de la désinscription des notifications:', error);
      }

      // Fermer le sidebar
      toggleSidebar();

      // Rediriger vers la page de login
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
    }
  };

  const Sidebar = () => (
    <Animated.View 
      style={[
        styles.sidebar,
        {
          transform: [{ translateX: slideAnim }],
          opacity: slideAnim.interpolate({
            inputRange: [-width, 0],
            outputRange: [0, 1],
          }),
        },
      ]}
    >
      <View style={styles.sidebarHeader}>
        <View style={styles.userProfile}>
          <Ionicons name="person-circle-outline" size={50} color="#2196F3" />
          <Text style={styles.userName}>{userName || 'Administrateur'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={toggleSidebar}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.sidebarContent}>
        <TouchableOpacity 
          style={styles.sidebarItem}
          onPress={() => {
            toggleSidebar();
            router.push('/(screens)/user/sidebar/profile');
          }}
        >
          <Ionicons name="person-outline" size={24} color="#333" />
          <Text style={styles.sidebarItemText}>Mon Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.sidebarItem}
          onPress={() => {
            toggleSidebar();
            router.push('/(screens)/user/sidebar/conditions-utilisation');
          }}
        >
          <Ionicons name="document-text-outline" size={24} color="#333" />
          <Text style={styles.sidebarItemText}>Conditions d'utilisation</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.sidebarItem}
          onPress={() => {
            toggleSidebar();
            router.push('/(screens)/user/sidebar/politique-confidentialite');
          }}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#333" />
          <Text style={styles.sidebarItemText}>Politique de confidentialité</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.sidebarItem}
          onPress={() => {
            toggleSidebar();
            router.push('/(screens)/user/sidebar/a-propos');
          }}
        >
          <Ionicons name="information-circle-outline" size={24} color="#333" />
          <Text style={styles.sidebarItemText}>À propos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sidebarItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#2196F3" />
          <Text style={[styles.sidebarItemText, styles.logoutText]}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: slideAnim.interpolate({
              inputRange: [-width, 0],
              outputRange: [0, 1],
            }),
            display: isSidebarOpen ? 'flex' : 'none',
          },
        ]}
      >
        <TouchableOpacity 
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={toggleSidebar}
        />
      </Animated.View>
      <Sidebar />
      <View style={styles.mainContent}>
        <Tabs screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={toggleSidebar}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}>
          <Tabs.Screen 
            name="DashboardScreen" 
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ focused, color }) => (
                <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen 
            name="UsersManagementScreen" 
            options={{
              title: 'Utilisateurs',
              tabBarIcon: ({ focused, color }) => (
                <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen 
            name="ProManagementScreen" 
            options={{
              title: 'Pros',
              tabBarIcon: ({ focused, color }) => (
                <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen 
            name="AlertsScreen" 
            options={{
              title: 'Alerts',
              tabBarIcon: ({ focused, color }) => (
                <View>
                  <Ionicons name={focused ? 'alert-circle' : 'alert-circle-outline'} size={24} color={color} />
                  <AlertIndicator />
                </View>
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: '#fff',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backfaceVisibility: 'hidden',
  },
  sidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 5,
  },
  userProfile: {
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  sidebarContent: {
    padding: 20,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sidebarItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutItem: {
    marginTop: 20,
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#2196F3',
  },
  alertIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    padding: 5,
  },
  alertDot: {
    width: 20,
    height: 20,
    borderRadius: 50,
    backgroundColor: '#FF0000',
  },
});

export default AdminLayout;
