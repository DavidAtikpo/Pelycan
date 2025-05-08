import { Tabs, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Animated, Vibration } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { API_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

function AlertIndicator() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [hasActiveAlert, setHasActiveAlert] = useState(false);
  const [alertViewed, setAlertViewed] = useState(false);
  const soundRef = useRef<Audio.Sound>();
  const vibrateIntervalRef = useRef<NodeJS.Timeout>();
  const currentPath = usePathname();
  const isAlertsPage = currentPath?.includes('AlertsScreen');
  const [currentAlertId, setCurrentAlertId] = useState<string | null>(null);

  useEffect(() => {
    if (isAlertsPage && hasActiveAlert && currentAlertId) {
      // Marquer l'alerte comme vue dans le backend
      const markAlertAsViewed = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          await fetch(`${API_URL}/alerts/${currentAlertId}/mark-viewed`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          // Arrêter le son
          if (soundRef.current) {
            soundRef.current.stopAsync();
            soundRef.current.unloadAsync();
          }
          // Arrêter la vibration
          if (vibrateIntervalRef.current) {
            clearInterval(vibrateIntervalRef.current);
          }
          Vibration.cancel();
          
          setHasActiveAlert(false);
        } catch (error) {
          console.error('Erreur lors du marquage de l\'alerte comme vue:', error);
        }
      };

      markAlertAsViewed();
    }
  }, [isAlertsPage, currentAlertId]);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_URL}/alerts/active`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.hasActiveAlerts && !data.viewed) {
            setHasActiveAlert(true);
            setCurrentAlertId(data.alertId);
          } else {
            setHasActiveAlert(false);
            setCurrentAlertId(null);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des alertes:', error);
      }
    };

    const interval = setInterval(checkAlerts, 30000);
    checkAlerts();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const notifyNewAlert = async () => {
      if (hasActiveAlert && !alertViewed) {
        // Pattern de vibration continue
        vibrateIntervalRef.current = setInterval(() => {
          Vibration.vibrate([0, 300, 150, 300], true);
        }, 2000);
        
        try {
          // Charger et jouer le son en boucle
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/alert.mp3'),
            { 
              shouldPlay: true,
              volume: 0.5,
              isLooping: true,
            }
          );
          soundRef.current = sound;
        } catch (error) {
          console.error('Erreur lors de la lecture du son:', error);
        }

        return () => {
          if (vibrateIntervalRef.current) {
            clearInterval(vibrateIntervalRef.current);
          }
          Vibration.cancel();
          if (soundRef.current) {
            soundRef.current.unloadAsync();
          }
        };
      }
    };

    notifyNewAlert();
  }, [hasActiveAlert, alertViewed]);

  useEffect(() => {
    if (!hasActiveAlert) {
      // Arrêter le son et la vibration
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
      }
      if (vibrateIntervalRef.current) {
        clearInterval(vibrateIntervalRef.current);
      }
      Vibration.cancel();
    }
  }, [hasActiveAlert]);

  // Arrêt de sécurité lors du démontage du composant
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
      }
      if (vibrateIntervalRef.current) {
        clearInterval(vibrateIntervalRef.current);
      }
      Vibration.cancel();
    };
  }, []);

  // Timeout de sécurité : arrête tout après 1 minute si hasActiveAlert reste à true
  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    if (hasActiveAlert) {
      timeout = setTimeout(() => {
        if (soundRef.current) {
          soundRef.current.stopAsync();
          soundRef.current.unloadAsync();
        }
        if (vibrateIntervalRef.current) {
          clearInterval(vibrateIntervalRef.current);
        }
        Vibration.cancel();
      }, 60000); // 1 minute
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [hasActiveAlert]);

  if (!hasActiveAlert || alertViewed) return null;

  return (
    <Animated.View style={[
      styles.alertIndicator,
      { transform: [{ scale: pulseAnim }] }
    ]}>
      <View style={styles.alertDot} />
    </Animated.View>
  );
}

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#2196F3',
      headerStyle: { backgroundColor: '#2196F3' },
      headerTintColor: '#fff'
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
  );
}

const styles = StyleSheet.create({
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
