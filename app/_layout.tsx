import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration des notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export default function RootLayout() {
    const router = useRouter();

    useEffect(() => {
        // Gestionnaire de notification reçue
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification reçue:', notification);
        });

        // Gestionnaire de clic sur notification
        const responseListener = Notifications.addNotificationResponseReceivedListener(async response => {
            try {
                const data = response.notification.request.content.data;
                console.log('Notification cliquée:', data);

                // Récupérer les données utilisateur
                const userDataStr = await AsyncStorage.getItem('userData');
                if (!userDataStr) {
                    console.log('Aucune donnée utilisateur trouvée, redirection vers login');
                    router.push('/welcome');
                    return;
                }

                const userData = JSON.parse(userDataStr);
                console.log('Données utilisateur récupérées:', userData);

                if (!userData.token || !userData.role) {
                    console.log('Token ou rôle manquant, redirection vers login');
                    router.push('/welcome');
                    return;
                }

                // Vérifier si l'utilisateur a le droit d'accéder à cet écran
                if (data.screen === 'AlertsScreen' && userData.role !== 'admin') {
                    console.log('Accès non autorisé à AlertsScreen');
                    return;
                }

                if (data.screen === 'EmergencyRequestsScreen' && userData.role !== 'pro') {
                    console.log('Accès non autorisé à EmergencyRequestsScreen');
                    return;
                }

                // Stocker les données individuellement pour la compatibilité
                await AsyncStorage.setItem('userToken', userData.token);
                await AsyncStorage.setItem('userRole', userData.role);
                await AsyncStorage.setItem('userEmail', userData.email);
                await AsyncStorage.setItem('userId', userData.id);

                console.log('Navigation vers:', data.screen, 'avec les paramètres:', data.params);
                router.push({
                    pathname: data.screen,
                    params: data.params
                });
            } catch (error) {
                console.error('Erreur lors du traitement de la notification:', error);
                router.push('/welcome');
            }
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="welcome" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen 
                name="AjouterLogementFormScreen" 
                options={{ 
                    title: "Ajouter un logement",
                    headerShown: true
                }} 
            />
        </Stack>
    );
} 