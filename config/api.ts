import { Platform } from 'react-native';

const getApiUrl = () => {
    if (__DEV__) {
        // Pour les émulateurs Android
        if (Platform.OS === 'android' && !__DEV__) {
            return 'http://10.0.2.2:3000/api';
        }
        // Pour les appareils physiques Android
        if (Platform.OS === 'android') {
            return 'http://192.168.1.70:3000/api'; // Remplacez par votre adresse IP locale
        }
        if (Platform.OS === 'ios') {
            return 'http://localhost:3000/api';
        }
        return 'http://localhost:3000/api';
    }
    return 'https://votre-api-production.com/api';
};

export const API_URL = getApiUrl(); 