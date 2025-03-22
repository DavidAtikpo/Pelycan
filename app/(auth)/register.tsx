import React, { useState } from "react";
import { Text, View, TextInput, StyleSheet, Alert, TouchableOpacity, Image, ImageBackground } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { useRouter, Link } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

const API_URL = 'http://10.0.2.2:3000/api/auth'; // À ajuster selon votre configuration

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

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    password,
                    phoneNumber,
                    biometricData
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Succès', 'Inscription réussie !');
                router.push('/(auth)/login');
            } else {
                Alert.alert('Erreur', data.message || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription');
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await promptAsync();
            if (result?.type === 'success') {
                const { id_token } = result.params;
                
                const response = await fetch(`${API_URL}/google`, {
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
        const rnBiometrics = new ReactNativeBiometrics();
        const { available, biometryType } = await rnBiometrics.isSensorAvailable();

        if (available && (biometryType === BiometryTypes.TouchID || biometryType === BiometryTypes.FaceID)) {
            try {
                const { publicKey } = await rnBiometrics.createKeys();
                setBiometricData(publicKey);
                Alert.alert('Succès', 'Empreinte digitale ajoutée avec succès');
            } catch (error) {
                console.error('Erreur biométrique:', error);
                Alert.alert('Erreur', 'Impossible d\'ajouter l\'empreinte digitale');
            }
        } else {
            Alert.alert('Non disponible', 'L\'authentification biométrique n\'est pas disponible sur cet appareil');
        }
    };

    return (
        <ImageBackground 
            source={require('../../assets/images/background.png')} 
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                <Image 
                    source={require('../../assets/images/Logopelycan.jpg')} 
                    style={styles.logo} 
                />
                <Text style={styles.title}>Inscription</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Nom complet"
                    value={fullName}
                    onChangeText={setFullName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Numéro de téléphone"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>S'inscrire</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleAddFingerprint}>
                    <Text style={styles.buttonText}>Ajouter une empreinte digitale</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
                    <Text style={styles.buttonText}>S'inscrire avec Google</Text>
                </TouchableOpacity>

                <Link href="/(auth)/login" style={styles.link}>
                    Déjà un compte ? Se connecter
                </Link>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: 120,
        height: 100,
        marginBottom: 10,
        borderRadius: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#212f3c',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        width: '80%',
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    button: {
        backgroundColor: '#F08080',
        padding: 12,
        borderRadius: 5,
        marginVertical: 8,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    link: {
        color: '#11c0c3',
        marginTop: 20,
        fontSize: 16,
    },
});

export default RegisterScreen;


