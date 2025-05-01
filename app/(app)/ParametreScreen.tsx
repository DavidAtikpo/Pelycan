import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, BackHandler, AppState, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';

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
    const [exitOnLock, setExitOnLock] = useState(true);
    const [appState, setAppState] = useState(AppState.currentState);
    
    // États pour les modales
    const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
    const [privacySettingsModalVisible, setPrivacySettingsModalVisible] = useState(false);
    const [dataManagementModalVisible, setDataManagementModalVisible] = useState(false);
    const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
    
    // États pour les formulaires
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [locationAccuracy, setLocationAccuracy] = useState('high');
    const [dataRetentionPeriod, setDataRetentionPeriod] = useState('30');
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);

    useEffect(() => {
        loadSettings();
        checkLocationPermission();
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            setAppState(nextAppState);
            
            // Si l'application passe en arrière-plan et que exitOnLock est activé
            if (nextAppState === 'background' && exitOnLock) {
                // Utiliser setTimeout pour s'assurer que l'application a le temps de passer en arrière-plan
                setTimeout(() => {
                    BackHandler.exitApp();
                }, 100);
            }
        });

        return () => {
            subscription.remove();
        };
    }, [exitOnLock]);

    const loadSettings = async () => {
        try {
            const stealth = await AsyncStorage.getItem('stealthMode');
            const invisible = await AsyncStorage.getItem('invisibleMode');
            const exitOnLockValue = await AsyncStorage.getItem('exitOnLock');
            const locationAcc = await AsyncStorage.getItem('locationAccuracy');
            const dataRetention = await AsyncStorage.getItem('dataRetentionPeriod');
            const pushNotif = await AsyncStorage.getItem('pushNotifications');
            const emailNotif = await AsyncStorage.getItem('emailNotifications');
            const smsNotif = await AsyncStorage.getItem('smsNotifications');
            
            setStealthMode(stealth === 'true');
            setInvisibleMode(invisible === 'true');
            setExitOnLock(exitOnLockValue === null ? true : exitOnLockValue === 'true');
            setLocationAccuracy(locationAcc || 'high');
            setDataRetentionPeriod(dataRetention || '30');
            setPushNotifications(pushNotif === 'true');
            setEmailNotifications(emailNotif === 'true');
            setSmsNotifications(smsNotif === 'true');
            
            // Appliquer le mode Camouflage si activé
            if (stealth === 'true') {
                applyStealthMode();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const applyStealthMode = () => {
        // Cette fonction est appelée lorsque le mode Camouflage est activé
        // Dans un environnement de production, vous pourriez utiliser des API natives
        // pour masquer l'application dans les applications récentes
        
        // Pour Expo, nous pouvons simuler ce comportement en affichant un message
        console.log('Mode Camouflage activé - L\'application est masquée dans les applications récentes');
        
        // Dans une application native, vous pourriez utiliser:
        // - Sur Android: ActivityManager.removeTask()
        // - Sur iOS: UIApplication.shared.isIdleTimerDisabled = true
    };

    const checkLocationPermission = async () => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            setLocationEnabled(status === 'granted');
            
            if (status === 'granted') {
                // Obtenir la position actuelle pour vérifier que la géolocalisation fonctionne
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });
                console.log('Position actuelle:', location);
            }
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
                    
                    // Obtenir la position actuelle pour vérifier que la géolocalisation fonctionne
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High
                    });
                    console.log('Position actuelle:', location);
                    
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
            
            if (newValue) {
                applyStealthMode();
                Alert.alert(
                    'Mode Camouflage',
                    'Le mode Camouflage est activé. L\'application sera masquée dans la liste des applications récentes.'
                );
            } else {
                Alert.alert(
                    'Mode Camouflage',
                    'Le mode Camouflage est désactivé.'
                );
            }
        } catch (error) {
            console.error('Error toggling stealth mode:', error);
            Alert.alert('Erreur', 'Impossible de modifier le mode Camouflage');
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
                    ? 'Le mode Invisible est activé. Votre statut en ligne sera masqué.'
                    : 'Le mode Invisible est désactivé.'
            );
        } catch (error) {
            console.error('Error toggling invisible mode:', error);
            Alert.alert('Erreur', 'Impossible de modifier le mode Invisible');
        }
    };

    const handleExitOnLockToggle = async () => {
        try {
            const newValue = !exitOnLock;
            await AsyncStorage.setItem('exitOnLock', String(newValue));
            setExitOnLock(newValue);
            Alert.alert(
                'Sortie automatique',
                newValue 
                    ? 'L\'application se fermera automatiquement lors du verrouillage de l\'écran.'
                    : 'L\'application restera ouverte lors du verrouillage de l\'écran.'
            );
        } catch (error) {
            console.error('Error toggling exit on lock:', error);
            Alert.alert('Erreur', 'Impossible de modifier le paramètre de sortie automatique');
        }
    };

    const handleChangePassword = () => {
        console.log('Ouverture de la modale de changement de mot de passe');
        setChangePasswordModalVisible(true);
    };

    const handlePrivacySettings = () => {
        console.log('Ouverture de la modale des paramètres de confidentialité');
        setPrivacySettingsModalVisible(true);
    };

    const handleDataManagement = () => {
        console.log('Ouverture de la modale de gestion des données');
        setDataManagementModalVisible(true);
    };

    const handleManageNotifications = () => {
        console.log('Ouverture de la modale de gestion des notifications');
        setNotificationsModalVisible(true);
    };

    const savePasswordChange = () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        // Ici, vous devriez implémenter la logique pour changer le mot de passe
        // Par exemple, appeler une API pour mettre à jour le mot de passe
        console.log('Changement de mot de passe:', { currentPassword, newPassword });
        
        Alert.alert('Succès', 'Votre mot de passe a été modifié avec succès');
        setChangePasswordModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const savePrivacySettings = () => {
        // Sauvegarder les paramètres de confidentialité
        AsyncStorage.setItem('locationAccuracy', locationAccuracy);
        
        Alert.alert('Succès', 'Vos paramètres de confidentialité ont été enregistrés');
        setPrivacySettingsModalVisible(false);
    };

    const saveDataManagement = () => {
        // Sauvegarder les paramètres de gestion des données
        AsyncStorage.setItem('dataRetentionPeriod', dataRetentionPeriod);
        
        Alert.alert('Succès', 'Vos paramètres de gestion des données ont été enregistrés');
        setDataManagementModalVisible(false);
    };

    const saveNotificationSettings = () => {
        // Sauvegarder les paramètres de notification
        AsyncStorage.setItem('pushNotifications', String(pushNotifications));
        AsyncStorage.setItem('emailNotifications', String(emailNotifications));
        AsyncStorage.setItem('smsNotifications', String(smsNotifications));
        
        Alert.alert('Succès', 'Vos paramètres de notification ont été enregistrés');
        setNotificationsModalVisible(false);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Supprimer le compte',
            'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Supprimer', 
                    style: 'destructive',
                    onPress: () => {
                        // Ici, vous devriez implémenter la logique pour supprimer le compte
                        console.log('Suppression du compte');
                        Alert.alert('Succès', 'Votre compte a été supprimé avec succès');
                    }
                }
            ]
        );
    };

    const handleExportData = () => {
        // Ici, vous devriez implémenter la logique pour exporter les données
        console.log('Exportation des données');
        Alert.alert('Succès', 'Vos données ont été exportées avec succès');
    };

    const renderSettingItem = (item: SettingItem) => (
        <TouchableOpacity 
            key={item.id} 
            style={styles.settingItem}
            onPress={item.type === 'action' ? item.onPress : undefined}
        >
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
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            {/* <Text style={styles.title}>Paramètres</Text> */}

            {/* Section Sécurité */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sécurité</Text>
                {renderSettingItem({
                    id: 'exitOnLock',
                    title: 'Sortie automatique',
                    description: 'Fermer l\'application lors du verrouillage de l\'écran',
                    icon: 'lock',
                    type: 'toggle',
                    value: exitOnLock,
                    onPress: handleExitOnLockToggle
                })}
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

            {/* Modale de changement de mot de passe */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={changePasswordModalVisible}
                onRequestClose={() => setChangePasswordModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Changer le mot de passe</Text>
                        
                        <Text style={styles.inputLabel}>Mot de passe actuel</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Entrez votre mot de passe actuel"
                        />
                        
                        <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Entrez votre nouveau mot de passe"
                        />
                        
                        <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirmez votre nouveau mot de passe"
                        />
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setChangePasswordModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={savePasswordChange}
                            >
                                <Text style={styles.buttonText}>Enregistrer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modale des paramètres de confidentialité */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={privacySettingsModalVisible}
                onRequestClose={() => setPrivacySettingsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Paramètres de confidentialité</Text>
                        
                        <Text style={styles.inputLabel}>Précision de la géolocalisation</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity
                                style={styles.radioOption}
                                onPress={() => setLocationAccuracy('high')}
                            >
                                <View style={styles.radioButton}>
                                    {locationAccuracy === 'high' && <View style={styles.radioButtonSelected} />}
                                </View>
                                <Text style={styles.radioLabel}>Élevée (précise)</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.radioOption}
                                onPress={() => setLocationAccuracy('medium')}
                            >
                                <View style={styles.radioButton}>
                                    {locationAccuracy === 'medium' && <View style={styles.radioButtonSelected} />}
                                </View>
                                <Text style={styles.radioLabel}>Moyenne</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.radioOption}
                                onPress={() => setLocationAccuracy('low')}
                            >
                                <View style={styles.radioButton}>
                                    {locationAccuracy === 'low' && <View style={styles.radioButtonSelected} />}
                                </View>
                                <Text style={styles.radioLabel}>Basse (économise la batterie)</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setPrivacySettingsModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={savePrivacySettings}
                            >
                                <Text style={styles.buttonText}>Enregistrer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modale de gestion des données */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={dataManagementModalVisible}
                onRequestClose={() => setDataManagementModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Gestion des données</Text>
                        
                        <Text style={styles.inputLabel}>Conservation des données (jours)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={dataRetentionPeriod}
                            onChangeText={setDataRetentionPeriod}
                            placeholder="Nombre de jours"
                        />
                        
                        <TouchableOpacity
                            style={styles.dataActionButton}
                            onPress={handleExportData}
                        >
                            <MaterialIcons name="file-download" size={24} color="#fff" />
                            <Text style={styles.dataActionButtonText}>Exporter mes données</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.dataActionButton, styles.deleteButton]}
                            onPress={handleDeleteAccount}
                        >
                            <MaterialIcons name="delete-forever" size={24} color="#fff" />
                            <Text style={styles.dataActionButtonText}>Supprimer mon compte</Text>
                        </TouchableOpacity>
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setDataManagementModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Fermer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modale de gestion des notifications */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={notificationsModalVisible}
                onRequestClose={() => setNotificationsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Gestion des notifications</Text>
                        
                        <View style={styles.notificationOption}>
                            <Text style={styles.notificationLabel}>Notifications push</Text>
                            <Switch
                                value={pushNotifications}
                                onValueChange={setPushNotifications}
                                trackColor={{ false: '#767577', true: '#FF69B4' }}
                                thumbColor={pushNotifications ? '#D81B60' : '#f4f3f4'}
                            />
                        </View>
                        
                        <View style={styles.notificationOption}>
                            <Text style={styles.notificationLabel}>Notifications par email</Text>
                            <Switch
                                value={emailNotifications}
                                onValueChange={setEmailNotifications}
                                trackColor={{ false: '#767577', true: '#FF69B4' }}
                                thumbColor={emailNotifications ? '#D81B60' : '#f4f3f4'}
                            />
                        </View>
                        
                        <View style={styles.notificationOption}>
                            <Text style={styles.notificationLabel}>Notifications par SMS</Text>
                            <Switch
                                value={smsNotifications}
                                onValueChange={setSmsNotifications}
                                trackColor={{ false: '#767577', true: '#FF69B4' }}
                                thumbColor={smsNotifications ? '#D81B60' : '#f4f3f4'}
                            />
                        </View>
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setNotificationsModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={saveNotificationSettings}
                            >
                                <Text style={styles.buttonText}>Enregistrer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#f2f2f2',
    },
    saveButton: {
        backgroundColor: '#D81B60',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    radioGroup: {
        marginTop: 10,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    radioButton: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D81B60',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioButtonSelected: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#D81B60',
    },
    radioLabel: {
        fontSize: 16,
        color: '#333',
    },
    dataActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        marginTop: 20,
    },
    dataActionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    notificationOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    notificationLabel: {
        fontSize: 16,
        color: '#333',
    },
});

export default ParametreScreen; 