import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { useRouter, usePathname } from 'expo-router';

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const router = useRouter();
  const currentPath = usePathname();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        updatePushToken(token);
      }
    });

    // Écouter les notifications reçues quand l'app est au premier plan
    notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      console.log('Notification reçue:', notification);
    });

    // Écouter les actions sur les notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      console.log('Action sur notification:', data);

      // Vérifier si on a les données de navigation
      if (data.screen) {
        try {
          // Vérifier si on est déjà sur la bonne page
          if (!currentPath?.includes(data.screen)) {
            console.log('Navigation vers:', data.screen, 'avec les paramètres:', data.params);
            
            // Stocker temporairement l'information que nous sommes en train de naviguer depuis une notification
            await AsyncStorage.setItem('navigatingFromNotification', 'true');
            
            // Utiliser replace au lieu de push pour éviter les problèmes de navigation
            router.replace({
              pathname: data.screen,
              params: data.params
            });
          }
        } catch (error) {
          console.error('Erreur lors de la navigation:', error);
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [currentPath]);

  const registerForPushNotificationsAsync = async () => {
    let token;
    console.log('Début de l\'enregistrement des notifications push');

    if (Platform.OS === 'android') {
      console.log('Configuration du canal de notification Android');
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('Statut des permissions existantes:', existingStatus);
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      console.log('Demande de permission pour les notifications');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('Nouveau statut des permissions:', status);
    }

    if (finalStatus !== 'granted') {
      console.log('Permission refusée pour les notifications push!');
      return;
    }

    console.log('Génération du token push');
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: '0fac2a8c-fc0d-4f98-86ff-76fdbc4e21f1' // Remplacez par votre véritable ID de projet Expo
    })).data;
    console.log('Token push généré:', token);

    return token;
  };

  const updatePushToken = async (token: string) => {
    try {
      console.log('Tentative de mise à jour du token push:', token);
      
      // Récupérer toutes les données utilisateur
      const userToken = await AsyncStorage.getItem('userToken');
      let userId = await AsyncStorage.getItem('userId');
      const userData = await AsyncStorage.getItem('userData');

      console.log('Données utilisateur récupérées:', {
        userId,
        userToken: userToken ? 'Présent' : 'Absent',
        userData: userData ? JSON.parse(userData) : 'Absent'
      });

      if (!userToken || !userId) {
        console.error('Token utilisateur ou ID manquant:', { userToken: !!userToken, userId: !!userId });
        return;
      }

      // Vérifier si l'ID dans userData correspond à l'ID stocké individuellement
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        console.log('Comparaison des IDs:', {
          storedUserId: userId,
          userDataId: parsedUserData.id
        });

        // Utiliser l'ID de userData s'il est différent
        if (parsedUserData.id && parsedUserData.id !== userId) {
          console.log('Utilisation de l\'ID depuis userData:', parsedUserData.id);
          userId = parsedUserData.id;
        }
      }

      console.log('Envoi du token au serveur pour l\'utilisateur:', userId);
      const response = await fetch(`${API_URL}/users/${userId}/push-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pushToken: token }),
      });

      const responseData = await response.json();
      console.log('Réponse du serveur:', responseData);

      if (!response.ok) {
        console.error('Erreur serveur détaillée:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        throw new Error(`Erreur serveur: ${response.status} - ${responseData.message || 'Erreur inconnue'}`);
      }

      console.log('Token push mis à jour avec succès');
    } catch (error) {
      console.error('Erreur détaillée lors de la mise à jour du token push:', error);
      if (error instanceof Error) {
        console.error('Message d\'erreur:', error.message);
        console.error('Stack trace:', error.stack);
      }
    }
  };

  return { expoPushToken };
}; 