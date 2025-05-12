import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

interface AlertData {
    id: string;
    userId: string;
    userName: string;
    type?: string;
    location: {
        latitude: number;
        longitude: number;
        accuracy: number;
    };
    timestamp: string;
    status: 'active' | 'processed' | 'closed';
}

interface EmergencyNotification {
    id: string;
    type: string;
    content: string;
    priority: 'high' | 'normal';
    read: boolean;
    created_at: string;
    emergency: {
        id: string;
        request_type: string;
        message: string;
        status: string;
        created_at: string;
    };
}

interface AlertStats {
    total: number;
    active: number;
    processed: number;
    closed: number;
    byType: Record<string, number>;
}

interface CacheData {
    alerts: AlertData[];
    notifications: EmergencyNotification[];
    timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'alerts_cache';

export const useAlerts = () => {
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const [notifications, setNotifications] = useState<EmergencyNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const [stats, setStats] = useState<AlertStats>({
        total: 0,
        active: 0,
        processed: 0,
        closed: 0,
        byType: {}
    });
    const [debugInfo, setDebugInfo] = useState<{
        lastFetch: string | null;
        cacheHits: number;
        cacheMisses: number;
        errors: string[];
    }>({
        lastFetch: null,
        cacheHits: 0,
        cacheMisses: 0,
        errors: []
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    // Fonction pour mettre à jour les statistiques
    const updateStats = useCallback((newAlerts: AlertData[]) => {
        const newStats: AlertStats = {
            total: newAlerts.length,
            active: newAlerts.filter(a => a.status === 'active').length,
            processed: newAlerts.filter(a => a.status === 'processed').length,
            closed: newAlerts.filter(a => a.status === 'closed').length,
            byType: {}
        };

        // Calculer les statistiques par type
        newAlerts.forEach(alert => {
            const type = alert.type || 'unknown';
            newStats.byType[type] = (newStats.byType[type] || 0) + 1;
        });

        setStats(newStats);
    }, []);

    // Fonction pour gérer le cache
    const handleCache = useCallback(async (data: CacheData) => {
        try {
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Erreur lors de la mise en cache:', error);
        }
    }, []);

    // Fonction pour récupérer les données du cache
    const getCachedData = useCallback(async (): Promise<CacheData | null> => {
        try {
            const cached = await AsyncStorage.getItem(CACHE_KEY);
            if (cached) {
                const data: CacheData = JSON.parse(cached);
                if (Date.now() - data.timestamp < CACHE_DURATION) {
                    setDebugInfo(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
                    return data;
                }
            }
            setDebugInfo(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
            return null;
        } catch (error) {
            console.error('Erreur lors de la récupération du cache:', error);
            return null;
        }
    }, []);

    const fetchAlerts = useCallback(async (forceRefresh = false) => {
        try {
            setIsLoading(true);
            setError(null);

            // Annuler la requête précédente si elle existe
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                setError('Session expirée. Veuillez vous reconnecter.');
                setIsLoading(false);
                return;
            }

            // Vérifier le cache si pas de force refresh
            if (!forceRefresh) {
                const cachedData = await getCachedData();
                if (cachedData) {
                    setAlerts(cachedData.alerts);
                    setNotifications(cachedData.notifications);
                    updateStats(cachedData.alerts);
                    setIsLoading(false);
                    return;
                }
            }

            const response = await fetch(`${API_URL}/alerts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                signal: abortControllerRef.current.signal
            });
            
            if (response.ok) {
                const data = await response.json();
                setAlerts(data.alerts);
                updateStats(data.alerts);
                setRetryCount(0);
                
                // Mettre en cache les nouvelles données
                await handleCache({
                    alerts: data.alerts,
                    notifications,
                    timestamp: Date.now()
                });

                setDebugInfo(prev => ({
                    ...prev,
                    lastFetch: new Date().toISOString(),
                    errors: []
                }));
            } else {
                throw new Error('Erreur lors de la récupération des alertes');
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Requête annulée');
                return;
            }

            console.error('Erreur lors de la récupération des alertes:', error);
            setError('Impossible de charger les alertes. Veuillez réessayer.');
            
            setDebugInfo(prev => ({
                ...prev,
                errors: [...prev.errors, error.message || 'Erreur inconnue']
            }));
            
            if (retryCount < 3) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => fetchAlerts(forceRefresh), 5000);
            }
        } finally {
            setIsLoading(false);
        }
    }, [notifications, retryCount, getCachedData, handleCache, updateStats]);

    const loadUserId = async () => {
        try {
            const storedUserId = await AsyncStorage.getItem('userId');
            setUserId(storedUserId);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'ID utilisateur:', error);
        }
    };

    const loadNotifications = async () => {
        if (!userId) return;

        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/emergency/notifications/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des notifications');
            }

            const data = await response.json();
            setNotifications(data.data);
        } catch (error) {
            console.error('Erreur lors du chargement des notifications:', error);
        }
    };

    const sendMessage = async (alertId: string, message: string) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/alerts/${alertId}/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi du message');
            }

            return true;
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            throw error;
        }
    };

    const processAlert = async (alertId: string) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/alerts/${alertId}/process`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                await fetchAlerts();
                return true;
            }
            throw new Error('Erreur lors du traitement de l\'alerte');
        } catch (error) {
            console.error('Erreur lors du traitement de l\'alerte:', error);
            throw error;
        }
    };

    const markNotificationAsRead = async (notificationId: string) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/emergency/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour de la notification');
            }

            setNotifications(notifications.map(notif => 
                notif.id === notificationId ? { ...notif, read: true } : notif
            ));
            return true;
        } catch (error) {
            console.error('Erreur lors du marquage de la notification:', error);
            throw error;
        }
    };

    // Fonction pour nettoyer le cache
    const clearCache = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(CACHE_KEY);
            setDebugInfo(prev => ({
                ...prev,
                cacheHits: 0,
                cacheMisses: 0
            }));
        } catch (error) {
            console.error('Erreur lors du nettoyage du cache:', error);
        }
    }, []);

    // Fonction pour forcer le rafraîchissement
    const forceRefresh = useCallback(() => {
        fetchAlerts(true);
    }, [fetchAlerts]);

    useEffect(() => {
        const checkTokenAndFetch = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                setError('Session expirée. Veuillez vous reconnecter.');
                setIsLoading(false);
                return false;
            }
            await fetchAlerts();
            return true;
        };

        checkTokenAndFetch();
        const interval = setInterval(async () => {
            const hasToken = await checkTokenAndFetch();
            if (!hasToken) {
                clearInterval(interval);
            }
        }, 30000);

        return () => {
            clearInterval(interval);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchAlerts]);

    useEffect(() => {
        if (userId) {
            loadNotifications();
        }
    }, [userId]);

    return {
        alerts,
        notifications,
        isLoading,
        error,
        userId,
        stats,
        debugInfo,
        fetchAlerts,
        sendMessage,
        processAlert,
        markNotificationAsRead,
        clearCache,
        forceRefresh
    };
}; 