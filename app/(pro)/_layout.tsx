import { Stack, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const { width } = Dimensions.get('window');

export default function Layout() {
  const { expoPushToken } = usePushNotifications();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        headerStyle: { backgroundColor: '#4CAF50' },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      <Tabs.Screen 
        name="DashboardScreen"
        options={{
          title: 'Tableau de bord',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="CasesScreen"
        options={{
          title: 'Mes Urgences',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Ionicons name={focused ? 'warning' : 'warning-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="AppointmentsScreen"
        options={{
          title: 'Rendez-vous',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="MessagesScreen"
        options={{
          title: 'Messages',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Ionicons name={focused ? 'mail' : 'mail-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="CaseDetailsScreen"
        options={{
          title: 'Détails du cas',
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />
      <Tabs.Screen 
        name="VideoCallScreen"
        options={{
          title: 'Appel vidéo',
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />
    </Tabs>
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
    color: '#4CAF50',
  },
});
