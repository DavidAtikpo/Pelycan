import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, View, Text, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import DevenirPartenaireScreen from '../(screens)/user/sidebar/DevenirPartenaireScreen';
import ProfileScreen from '../(screens)/user/sidebar/profile';
import ConditionsUtilisationScreen from '../(screens)/user/sidebar/conditions-utilisation';
import FaireUnDonScreen from '../(screens)/user/sidebar/faire-un-don';
import PolitiqueConfidentialiteScreen from '../(screens)/user/sidebar/politique-confidentialite';
import AProposScreen from '../(screens)/user/sidebar/a-propos';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

function TabLayout() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    // Récupérer le nom de l'utilisateur depuis AsyncStorage
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
    // Utiliser requestAnimationFrame pour éviter le clignotement
    requestAnimationFrame(() => {
      const toValue = isSidebarOpen ? -width : 0;
      Animated.timing(slideAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Mettre à jour l'état après l'animation
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
        'userData'
      ]);

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
          <Ionicons name="person-circle-outline" size={50} color="#D81B60" />
          <Text style={styles.userName}>{userName || 'Utilisateur'}</Text>
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
            router.push('/(screens)/user/sidebar/DevenirPartenaireScreen');
          }}
        >
          <Ionicons name="business-outline" size={24} color="#333" />
          <Text style={styles.sidebarItemText}>Devenir Partenaire</Text>
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
            router.push('/(screens)/user/sidebar/SupportScreen');
          }}
        >
          <Ionicons name="gift-outline" size={24} color="#333" />
          <Text style={styles.sidebarItemText}>Faire un don</Text>
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
          <Ionicons name="log-out-outline" size={24} color="#D81B60" />
          <Text style={[styles.sidebarItemText, styles.logoutText]}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Toujours rendre le sidebar, mais contrôler sa visibilité avec l'animation */}
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: slideAnim.interpolate({
              inputRange: [-width, 0],
              outputRange: [0, 1],
            }),
            // Masquer complètement l'overlay quand le sidebar est fermé
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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D81B60',
        tabBarInactiveTintColor: 'gray',
            headerLeft: () => (
              <TouchableOpacity 
                onPress={toggleSidebar}
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="menu" size={24} color="#D81B60" />
              </TouchableOpacity>
            ),
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
          title: 'Chat',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
          ),
        }}
      />
          {/* <Tabs.Screen 
        name="AjouterLogementScreen" 
        options={{
          title: 'Ajouter',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={size} color={color} />
          ),
        }}
          /> */}
          {/* <Tabs.Screen 
        name="SupportScreen" 
        options={{
          title: 'Donner',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'gift' : 'gift-outline'} size={size} color={color} />
          ),
        }}
          /> */}
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
      </View>
    </View>
  );
}

export default function AppLayout() {
  const router = useRouter();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={TabLayout}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DevenirPartenaireScreen"
        component={DevenirPartenaireScreen}
        options={{
          title: 'Devenir Partenaire',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="close" size={24} color="#D81B60" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          title: 'Mon Profil',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="close" size={24} color="#D81B60" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="conditions-utilisation"
        component={ConditionsUtilisationScreen}
        options={{
          title: 'Conditions d\'utilisation',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="close" size={24} color="#D81B60" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="faire-un-don"
        component={FaireUnDonScreen}
        options={{
          title: 'Faire un don',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="close" size={24} color="#D81B60" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="politique-confidentialite"
        component={PolitiqueConfidentialiteScreen}
        options={{
          title: 'Politique de confidentialité',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="close" size={24} color="#D81B60" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="a-propos"
        component={AProposScreen}
        options={{
          title: 'À propos',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="close" size={24} color="#D81B60" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
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
    color: '#D81B60',
  },
}); 