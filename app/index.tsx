import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { ActivityIndicator, View } from 'react-native';

type AppRoute = '/welcome' | '/(auth)/login' | '/(admin)/DashboardScreen' | '/(pro)/DashboardScreen' | '/(app)/HomeScreen';

async function checkToken(token: string | null) {
  if (!token) return false;
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return false;
  }
}

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<AppRoute | null>(null);

  useEffect(() => {
    async function checkInitialRoute() {
      try {
        // Vérifier si c'est le premier lancement
        const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
        
        if (isFirstLaunch === null) {
          await AsyncStorage.setItem('isFirstLaunch', 'true');
          setInitialRoute('/welcome');
          return;
        }

        // Vérifier l'authentification
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');

        if (!token || !role) {
          setInitialRoute('/(auth)/login');
          return;
        }

        // Vérifier la validité du token
        const isValidToken = await checkToken(token);
        
        if (!isValidToken) {
          // Nettoyer les données si le token n'est pas valide
          await AsyncStorage.multiRemove(['userToken', 'userRole', 'userId', 'userEmail', 'userName']);
          setInitialRoute('/(auth)/login');
          return;
        }

        // Rediriger selon le rôle
        switch (role) {
          case 'admin':
            setInitialRoute('/(admin)/DashboardScreen');
            break;
          case 'pro':
            setInitialRoute('/(pro)/DashboardScreen');
            break;
          default:
            setInitialRoute('/(app)/HomeScreen');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification initiale:', error);
        setInitialRoute('/(auth)/login');
      }
    }

    checkInitialRoute();
  }, []);

  // Afficher un indicateur de chargement pendant la vérification
  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F08080" />
      </View>
    );
  }

  return <Redirect href={initialRoute} />;
}

