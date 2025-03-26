import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface SettingItem {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    type: 'toggle' | 'action';
    value?: boolean;
    onPress?: () => void;
}

const ParametreScreen: React.FC = () => {
    const [settings, setSettings] = useState<SettingItem[]>([]);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [stealthMode, setStealthMode] = useState(false);
    const [invisibleMode, setInvisibleMode] = useState(false);

    useEffect(() => {
        loadSettings();
        checkLocationPermission();
    }, []);

    const loadSettings = async () => {
        try {
            const stealth = await AsyncStorage.getItem('stealthMode');
            const invisible = await AsyncStorage.getItem('invisibleMode');
            setStealthMode(stealth === 'true');
            setInvisibleMode(invisible === 'true');
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const checkLocationPermission = async () => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            setLocationEnabled(status === 'granted');
        } catch (error) {
            console.error('Error checking location permission:', error);
        }
    };

    const handleLocationToggle = async () => {
        try {
            if (!locationEnabled) {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    setLocationEnabled(true);
                    Alert.alert('Succès', 'La géolocalisation a été activée');
                }
            } else {
                setLocationEnabled(false);
                Alert.alert('Succès', 'La géolocalisation a été désactivée');
            }
        } catch (error) {
            console.error('Error toggling location:', error);
            Alert.alert('Erreur', 'Impossible de modifier les paramètres de géolocalisation');
        }
    };

    const handleStealthModeToggle = async () => {
        try {
            const newValue = !stealthMode;
            await AsyncStorage.setItem('stealthMode', String(newValue));
            setStealthMode(newValue);
            Alert.alert(
                'Mode Camouflage',
                newValue 
                    ? 'Le mode camouflage est activé. L\'application sera masquée dans la liste des applications récentes.'
                    : 'Le mode camouflage est désactivé.'
            );
        } catch (error) {
            console.error('Error toggling stealth mode:', error);
            Alert.alert('Erreur', 'Impossible de modifier le mode camouflage');
        }
    };

    const handleInvisibleModeToggle = async () => {
        try {
            const newValue = !invisibleMode;
            await AsyncStorage.setItem('invisibleMode', String(newValue));
            setInvisibleMode(newValue);
            Alert.alert(
                'Mode Invisible',
                newValue 
                    ? 'Le mode invisible est activé. Votre statut en ligne sera masqué.'
                    : 'Le mode invisible est désactivé.'
            );
        } catch (error) {
            console.error('Error toggling invisible mode:', error);
            Alert.alert('Erreur', 'Impossible de modifier le mode invisible');
        }
    };

    const handleChangePassword = () => {
        Alert.alert('Changement de mot de passe', 'Cette fonctionnalité sera disponible prochainement.');
    };

    const handleManageNotifications = () => {
        Alert.alert('Gestion des notifications', 'Cette fonctionnalité sera disponible prochainement.');
    };

    const handlePrivacySettings = () => {
        Alert.alert('Paramètres de confidentialité', 'Cette fonctionnalité sera disponible prochainement.');
    };

    const handleDataManagement = () => {
        Alert.alert('Gestion des données', 'Cette fonctionnalité sera disponible prochainement.');
    };

    const renderSettingItem = (item: SettingItem) => (
        <View key={item.id} style={styles.settingItem}>
            <View style={styles.settingIcon}>
                <MaterialIcons name={item.icon} size={24} color="#D81B60" />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingDescription}>{item.description}</Text>
            </View>
            {item.type === 'toggle' ? (
                <Switch
                    value={item.value}
                    onValueChange={item.onPress}
                    trackColor={{ false: '#767577', true: '#FF69B4' }}
                    thumbColor={item.value ? '#D81B60' : '#f4f3f4'}
                />
            ) : (
                <MaterialIcons name="chevron-right" size={24} color="#666" />
            )}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Paramètres</Text>

            {/* Section Sécurité */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sécurité</Text>
                {renderSettingItem({
                    id: 'stealth',
                    title: 'Mode Camouflage',
                    description: 'Masquer l\'application dans les applications récentes',
                    icon: 'security',
                    type: 'toggle',
                    value: stealthMode,
                    onPress: handleStealthModeToggle
                })}
                {renderSettingItem({
                    id: 'invisible',
                    title: 'Mode Invisible',
                    description: 'Masquer votre statut en ligne',
                    icon: 'visibility-off',
                    type: 'toggle',
                    value: invisibleMode,
                    onPress: handleInvisibleModeToggle
                })}
                {renderSettingItem({
                    id: 'password',
                    title: 'Changer le mot de passe',
                    description: 'Modifier votre mot de passe de connexion',
                    icon: 'lock',
                    type: 'action',
                    onPress: handleChangePassword
                })}
            </View>

            {/* Section Confidentialité */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Confidentialité</Text>
                {renderSettingItem({
                    id: 'location',
                    title: 'Géolocalisation',
                    description: 'Autoriser l\'accès à votre position',
                    icon: 'location-on',
                    type: 'toggle',
                    value: locationEnabled,
                    onPress: handleLocationToggle
                })}
                {renderSettingItem({
                    id: 'privacy',
                    title: 'Paramètres de confidentialité',
                    description: 'Gérer vos préférences de confidentialité',
                    icon: 'privacy-tip',
                    type: 'action',
                    onPress: handlePrivacySettings
                })}
                {renderSettingItem({
                    id: 'data',
                    title: 'Gestion des données',
                    description: 'Gérer vos données personnelles',
                    icon: 'data-usage',
                    type: 'action',
                    onPress: handleDataManagement
                })}
            </View>

            {/* Section Notifications */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                {renderSettingItem({
                    id: 'notifications',
                    title: 'Gérer les notifications',
                    description: 'Configurer vos préférences de notification',
                    icon: 'notifications',
                    type: 'action',
                    onPress: handleManageNotifications
                })}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 20,
        color: '#333',
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 20,
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        marginLeft: 20,
        marginBottom: 10,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF0F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        color: '#666',
    },
});

export default ParametreScreen; 