import { Platform } from 'react-native';

const getApiUrl = () => {
    // En production (APK généré)
    if (!__DEV__) {
        return 'https://pelycan-server.onrender.com/api'; // Remplacez par l'URL de votre serveur hébergé
    }
    
    // En développement
    if (Platform.OS === 'android') {
        // Pour l'émulateur Android
        if (__DEV__) {
            return 'http://10.0.2.2:3000/api';
        }
        // Pour un appareil Android physique sur le réseau local
        return 'http://192.168.1.70:3000/api';
    }
    // Pour iOS
    return 'http://localhost:3000/api';
};

export const API_URL = getApiUrl(); 