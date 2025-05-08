import { Platform } from 'react-native';

const getApiUrl = () => {
    // En production (APK généré)
    if (!__DEV__) {
        return 'https://pelycan-server-lmub.onrender.com/api';
    }
    
    // En développement
    if (Platform.OS === 'android') {
        // Pour un appareil Android physique sur le réseau local
        return 'http://192.168.1.70:3000/api';
    }
    // Pour iOS
    return 'http://localhost:3000/api';
};

export const API_URL = getApiUrl(); 