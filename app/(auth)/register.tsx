import React, { useState } from "react";
import { Text, View, TextInput, StyleSheet, Alert, TouchableOpacity, Image, ImageBackground, ScrollView } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter, Link } from 'expo-router';
import { API_URL } from '../../config/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

const RegisterScreen: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [biometricData, setBiometricData] = useState<string | null>(null);
    const router = useRouter();

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    });

    const handleRegister = async () => {
        if (!fullName || !email || !password || !phoneNumber) {
            Alert.alert('Erreur', 'Tous les champs sont obligatoires');
            return;
        }

        if (!biometricData) {
            Alert.alert('Erreur', 'Veuillez ajouter une empreinte digitale pour continuer');
            return;
        }

        try {
            console.log('Tentative de connexion à:', `${API_URL}/auth/register`);

            const requestBody = {
                fullName,
                email,
                password,
                phoneNumber,
                biometricData
            };
            
            console.log('Données envoyées:', requestBody);

            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Status:', response.status);
            const data = await response.json();
            console.log('Réponse:', data);

            if (response.ok) {
                Alert.alert('Succès', 'Inscription réussie !');
                router.push('/(auth)/login');
            } else {
                Alert.alert('Erreur', data.message || 'Erreur lors de l\'inscription');
            }
        } catch (error: any) {
            console.error('Erreur détaillée:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            Alert.alert(
                'Erreur de connexion',
                'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.'
            );
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await promptAsync();
            if (result?.type === 'success') {
                const { id_token } = result.params;
                
                const response = await fetch(`${API_URL}/auth/google`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_token }),
                });

                const data = await response.json();

                if (response.ok) {
                    Alert.alert('Succès', 'Connexion Google réussie !');
                    router.push('/(app)/HomeScreen');
                } else {
                    Alert.alert('Erreur', data.message);
                }
            }
        } catch (error) {
            console.error('Erreur Google Sign-In:', error);
            Alert.alert('Erreur', 'Échec de la connexion avec Google');
        }
    };

    const handleAddFingerprint = async () => {
        try {
            // Vérifier si l'authentification biométrique est disponible
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            
            console.log('État de l\'authentification biométrique:', { hasHardware, isEnrolled });

            if (!hasHardware) {
                Alert.alert('Non disponible', 'Votre appareil ne dispose pas d\'un capteur biométrique');
                return;
            }

            if (!isEnrolled) {
                Alert.alert('Non configuré', 'Veuillez configurer l\'authentification biométrique dans les paramètres de votre appareil');
                return;
            }

            // Demander l'authentification biométrique
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authentifiez-vous pour ajouter votre empreinte',
                fallbackLabel: 'Utiliser le code PIN',
                disableDeviceFallback: false,
            });

            console.log('Résultat de l\'authentification:', result);

            if (result.success) {
                // Générer une clé unique pour représenter l'authentification biométrique
                const uniqueKey = `biometric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                setBiometricData(uniqueKey);
                Alert.alert('Succès', 'Empreinte digitale ajoutée avec succès');
            } else {
                Alert.alert('Échec', 'L\'authentification biométrique a échoué');
            }
        } catch (error) {
            console.error('Erreur biométrique détaillée:', error);
            Alert.alert('Erreur', 'Impossible d\'ajouter l\'empreinte digitale. Veuillez réessayer.');
        }
    };

    const handleRemoveFingerprint = async () => {
        try {
            setBiometricData(null);
            Alert.alert('Succès', 'Empreinte digitale supprimée avec succès');
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            Alert.alert('Erreur', 'Impossible de supprimer l\'empreinte digitale');
        }
    };

    return (
        <ImageBackground 
            source={require('../../assets/images/background.png')} 
            style={styles.backgroundImage}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Image 
                        source={require('../../assets/images/Logopelycan.jpg')} 
                        style={styles.logo} 
                    />
                    <Text style={styles.title}>Créer un compte</Text>
                    <Text style={styles.subtitle}>Rejoignez notre communauté de soutien</Text>
                    
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="person" size={24} color="#D81B60" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nom complet"
                                value={fullName}
                                onChangeText={setFullName}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons name="email" size={24} color="#D81B60" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons name="lock" size={24} color="#D81B60" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Mot de passe"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialIcons name="phone" size={24} color="#D81B60" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Numéro de téléphone"
                                keyboardType="phone-pad"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.biometricContainer}>
                        <TouchableOpacity 
                            style={[styles.biometricButton, biometricData ? styles.biometricButtonSuccess : null]} 
                            onPress={handleAddFingerprint}
                        >
                            <Ionicons 
                                name={biometricData ? "finger-print" : "finger-print-outline"} 
                                size={24} 
                                color={biometricData ? "#fff" : "#D81B60"} 
                            />
                            <Text style={[styles.biometricButtonText, biometricData ? styles.biometricButtonTextSuccess : null]}>
                                {biometricData ? 'Empreinte digitale ajoutée' : 'Ajouter une empreinte digitale'}
                            </Text>
                        </TouchableOpacity>
                        {biometricData && (
                            <TouchableOpacity 
                                style={styles.biometricButtonRemove} 
                                onPress={handleRemoveFingerprint}
                            >
                                <Ionicons name="trash-outline" size={24} color="#f44336" />
                                <Text style={styles.biometricButtonTextRemove}>Supprimer l'empreinte</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                        <Text style={styles.registerButtonText}>S'inscrire</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>ou</Text>
                        <View style={styles.divider} />
                    </View>

                    <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                        <Ionicons name="logo-google" size={24} color="#fff" style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>Continuer avec Google</Text>
                    </TouchableOpacity>

                    <Link href="/(auth)/login" style={styles.loginLink}>
                        <Text style={styles.loginLinkText}>
                            Déjà un compte ? <Text style={styles.loginLinkTextBold}>Se connecter</Text>
                        </Text>
                    </Link>
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
        borderRadius: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#D81B60',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#eee',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    biometricContainer: {
        width: '100%',
        marginBottom: 20,
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF0F5',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    biometricButtonSuccess: {
        backgroundColor: '#4CAF50',
    },
    biometricButtonText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#D81B60',
    },
    biometricButtonTextSuccess: {
        color: '#fff',
    },
    biometricButtonRemove: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF0F5',
        padding: 15,
        borderRadius: 12,
    },
    biometricButtonTextRemove: {
        marginLeft: 10,
        fontSize: 16,
        color: '#f44336',
    },
    registerButton: {
        backgroundColor: '#D81B60',
        padding: 15,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#666',
        fontSize: 14,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4285F4',
        padding: 15,
        borderRadius: 12,
        width: '100%',
        marginBottom: 20,
    },
    googleIcon: {
        marginRight: 10,
    },
    googleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLink: {
        marginTop: 10,
    },
    loginLinkText: {
        color: '#666',
        fontSize: 16,
    },
    loginLinkTextBold: {
        color: '#D81B60',
        fontWeight: 'bold',
    },
});

export default RegisterScreen;


