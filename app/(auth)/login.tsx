import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, Image, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  // Vérifier la disponibilité de l'authentification biométrique au chargement
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
    } catch (error) {
      console.error('Erreur lors de la vérification biométrique:', error);
    }
  };

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Erreur', 'Email et mot de passe requis');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Tentative de connexion à:', `${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (response.ok && data.data?.token) {
        await AsyncStorage.multiSet([
          ['userToken', data.data.token],
          ['userRole', data.data.user.role],
          ['userId', data.data.user.id.toString()],
          ['userEmail', data.data.user.email],
          ['userName', data.data.user.fullName || ''],
          ['isFirstLaunch', 'false']
        ]);
        
        switch (data.data.user.role) {
          case 'admin':
            router.replace('/(admin)/DashboardScreen');
            break;
          case 'pro':
            router.replace('/(pro)/DashboardScreen');
            break;
          default:
            router.replace('/(app)/HomeScreen');
        }
      } else {
        const errorMessage = data.message || 'Erreur lors de la connexion';
        console.log('Login error:', errorMessage);
        Alert.alert('Erreur', errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion. Vérifiez votre connexion internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
        // Vérifier à nouveau la disponibilité
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        console.log('État biométrique:', { hasHardware, isEnrolled });

        if (!hasHardware || !isEnrolled) {
            Alert.alert('Non disponible', 'L\'authentification biométrique n\'est pas configurée sur votre appareil');
            return;
        }

        // Récupérer l'email stocké
        const storedEmail = await AsyncStorage.getItem('userEmail');
        console.log('Email stocké:', storedEmail);

        if (!storedEmail) {
            Alert.alert('Erreur', 'Aucun compte trouvé. Veuillez vous connecter normalement d\'abord.');
            return;
        }

        // Demander l'authentification biométrique
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authentifiez-vous pour vous connecter',
            fallbackLabel: 'Utiliser le code PIN',
            disableDeviceFallback: false,
        });

        console.log('Résultat authentification locale:', result);

        if (result.success) {
            setIsLoading(true);

            // Tenter la connexion biométrique
            console.log('Tentative de connexion à:', `${API_URL}/auth/biometric-login`);
            const response = await fetch(`${API_URL}/auth/biometric-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: storedEmail }),
            });

            const data = await response.json();
            console.log('Réponse du serveur:', data);

            if (response.ok && data.data?.token) {
                await AsyncStorage.multiSet([
                    ['userToken', data.data.token],
                    ['userRole', data.data.user.role],
                    ['userId', data.data.user.id.toString()],
                    ['userEmail', data.data.user.email],
                    ['userName', data.data.user.fullName || ''],
                    ['isFirstLaunch', 'false']
                ]);

                if (data.data.redirectPath) {
                    router.replace(data.data.redirectPath);
                } else {
                    router.replace('/(app)/HomeScreen');
                }
            } else {
                const errorMessage = data.message || 'Authentification biométrique échouée';
                console.error('Erreur de connexion:', errorMessage);
                Alert.alert('Erreur', errorMessage);
            }
        } else {
            Alert.alert('Échec', 'L\'authentification biométrique a échoué');
        }
    } catch (error) {
        console.error('Erreur détaillée:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors de l\'authentification biométrique. Veuillez réessayer.');
    } finally {
        setIsLoading(false);
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
          await AsyncStorage.multiSet([
            ['userToken', data.data.token],
            ['userRole', data.data.user.role],
            ['userId', data.data.user.id.toString()],
            ['userEmail', data.data.user.email],
            ['userName', data.data.user.fullName || ''],
            ['isFirstLaunch', 'false']
          ]);

          switch (data.data.user.role) {
            case 'admin':
              router.replace('/(admin)/DashboardScreen');
              break;
            case 'pro':
              router.replace('/(pro)/DashboardScreen');
              break;
            default:
              router.replace('/(app)/HomeScreen');
          }
        } else {
          Alert.alert('Erreur', data.message);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la connexion avec Google');
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
          <Text style={styles.title}>Bienvenue</Text>
          <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={24} color="#D81B60" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
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
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {biometricAvailable && (
            <TouchableOpacity 
              style={styles.biometricButton} 
              onPress={handleBiometricLogin}
            >
              <Ionicons name="finger-print" size={24} color="#D81B60" />
              <Text style={styles.biometricButtonText}>Se connecter avec l'empreinte digitale</Text>
            </TouchableOpacity>
          )}

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <Ionicons name="logo-google" size={24} color="#fff" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Continuer avec Google</Text>
          </TouchableOpacity>

          <Link href="/(auth)/register" style={styles.registerLink}>
            <Text style={styles.registerLinkText}>
              Pas de compte ? <Text style={styles.registerLinkTextBold}>S'inscrire</Text>
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
  loginButton: {
    backgroundColor: '#D81B60',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F5',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
  },
  biometricButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#D81B60',
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
  registerLink: {
    marginTop: 10,
  },
  registerLinkText: {
    color: '#666',
    fontSize: 16,
  },
  registerLinkTextBold: {
    color: '#D81B60',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
