import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D81B60',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tabs.Screen 
        name="HomeScreen" 
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="MessagerieScreen" 
        options={{
          title: 'Messagerie',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="AjouterLogementScreen" 
        options={{
          title: 'Ajouter',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="SupportScreen" 
        options={{
          title: 'Donner',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'gift' : 'gift-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="ParametreScreen" 
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 