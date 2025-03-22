import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#4CAF50',
      headerStyle: { backgroundColor: '#4CAF50' },
      headerTintColor: '#fff'
    }}>
      <Tabs.Screen 
        name="DashboardScreen" 
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="CasesScreen" 
        options={{
          title: 'Mes Cas',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'folder' : 'folder-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="ProfileScreen" 
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
