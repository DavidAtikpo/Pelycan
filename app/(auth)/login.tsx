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
    checkStoredData();
    checkIfUserIsLoggedIn();
    testAsyncStoragePersistence();
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

  const checkStoredData = async () => {
    try {
      // Vérifier les données stockées individuellement
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedRole = await AsyncStorage.getItem('userRole');
      
      console.log('Données stockées au chargement (individuelles):', {
        email: storedEmail,
        token: storedToken ? 'Présent' : 'Absent',
        role: storedRole
      });
      
      // Vérifier les données stockées en JSON
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          console.log('Données stockées au chargement (JSON):', userData);
          
          // Si l'email individuel n'est pas disponible mais présent dans l'objet JSON
          if (!storedEmail && userData.email) {
            console.log('Récupération de l\'email depuis l\'objet JSON');
            setEmail(userData.email);
          }
        } catch (error) {
          console.error('Erreur lors du parsing des données JSON:', error);
        }
      } else {
        console.log('Aucune donnée JSON stockée');
      }
      
      if (storedEmail) {
        setEmail(storedEmail);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des données stockées:', error);
    }
  };

  const checkIfUserIsLoggedIn = async () => {
    try {
      // Récupérer les données de l'utilisateur depuis l'objet JSON
      const storedUserData = await AsyncStorage.getItem('userData');
      
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          console.log('Données utilisateur trouvées:', userData);

          if (userData.token && userData.role) {
            // Vérifier si le token est toujours valide
            try {
              const response = await fetch(`${API_URL}/auth/verify-token`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${userData.token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.ok) {
                console.log('Token valide, redirection...');
                // Rediriger l'utilisateur en fonction de son rôle
                switch (userData.role) {
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
                // Token invalide, supprimer les données stockées
                console.log('Token invalide, suppression des données...');
                await AsyncStorage.removeItem('userData');
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userRole');
                await AsyncStorage.removeItem('userEmail');
              }
            } catch (error) {
              console.error('Erreur lors de la vérification du token:', error);
              // En cas d'erreur réseau, supprimer les données stockées
              await AsyncStorage.removeItem('userData');
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userRole');
              await AsyncStorage.removeItem('userEmail');
            }
          }
        } catch (error) {
          console.error('Erreur lors du parsing des données JSON:', error);
          // En cas d'erreur, supprimer les données stockées
          await AsyncStorage.removeItem('userData');
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userRole');
          await AsyncStorage.removeItem('userEmail');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la connexion:', error);
    }
  };

  // Fonction pour tester la persistance d'AsyncStorage
  const testAsyncStoragePersistence = async () => {
    try {
      // Vérifier si le test a déjà été effectué
      const testKey = 'asyncStorageTest';
      const testValue = await AsyncStorage.getItem(testKey);
      
      if (!testValue) {
        // Premier lancement, stocker une valeur de test
        const timestamp = new Date().toISOString();
        await AsyncStorage.setItem(testKey, timestamp);
        console.log('Test AsyncStorage: Valeur stockée:', timestamp);
      } else {
        // Valeur déjà stockée, afficher la valeur
        console.log('Test AsyncStorage: Valeur récupérée:', testValue);
      }
    } catch (error) {
      console.error('Erreur lors du test de persistance AsyncStorage:', error);
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
        // Stocker les données utilisateur individuellement
        const userData: [string, string][] = [
          ['userToken', data.data.token],
          ['userRole', data.data.user.role],
          ['userId', data.data.user.id.toString()],
          ['userEmail', data.data.user.email],
          ['userName', data.data.user.fullName || ''],
          ['isFirstLaunch', 'false']
        ];
        
        console.log('Stockage des données utilisateur:', userData);
        
        // Stocker chaque élément individuellement
        for (const [key, value] of userData) {
          await AsyncStorage.setItem(key, value);
          console.log(`Stockage de ${key}:`, value);
        }
        
        // Vérifier que l'email a bien été stocké
        const storedEmail = await AsyncStorage.getItem('userEmail');
        console.log('Email stocké après connexion:', storedEmail);
        
        // Stocker également les données dans un objet JSON
        const userDataObject = {
          token: data.data.token,
          role: data.data.user.role,
          id: data.data.user.id.toString(),
          email: data.data.user.email,
          fullName: data.data.user.fullName || '',
          isFirstLaunch: false
        };
        
        await AsyncStorage.setItem('userData', JSON.stringify(userDataObject));
        console.log('Données utilisateur stockées en JSON:', userDataObject);
        
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

        // Si l'email stocké n'est pas disponible, essayer de le récupérer depuis l'objet JSON
        let emailToUse = storedEmail;
        if (!emailToUse) {
            const storedUserData = await AsyncStorage.getItem('userData');
            if (storedUserData) {
                try {
                    const userData = JSON.parse(storedUserData);
                    if (userData.email) {
                        emailToUse = userData.email;
                        console.log('Email récupéré depuis l\'objet JSON:', emailToUse);
                    }
                } catch (error) {
                    console.error('Erreur lors du parsing des données JSON:', error);
                }
            }
        }

        // Si l'email n'est toujours pas disponible, utiliser l'email saisi
        if (!emailToUse && email.trim() !== '') {
            emailToUse = email;
            console.log('Utilisation de l\'email saisi:', emailToUse);
        }

        if (!emailToUse) {
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
            console.log('Avec l\'email:', emailToUse);
            
            const response = await fetch(`${API_URL}/auth/biometric-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: emailToUse }),
            });

            const data = await response.json();
            console.log('Réponse du serveur:', data);

            if (response.ok && data.data?.token) {
                // Stocker les données utilisateur individuellement
                const userData: [string, string][] = [
                    ['userToken', data.data.token],
                    ['userRole', data.data.user.role],
                    ['userId', data.data.user.id.toString()],
                    ['userEmail', data.data.user.email],
                    ['userName', data.data.user.fullName || ''],
                    ['isFirstLaunch', 'false']
                ];
                
                console.log('Stockage des données utilisateur après connexion biométrique:', userData);
                
                // Stocker chaque élément individuellement
                for (const [key, value] of userData) {
                    await AsyncStorage.setItem(key, value);
                    console.log(`Stockage de ${key}:`, value);
                }

                // Stocker également les données dans un objet JSON
                const userDataObject = {
                    token: data.data.token,
                    role: data.data.user.role,
                    id: data.data.user.id.toString(),
                    email: data.data.user.email,
                    fullName: data.data.user.fullName || '',
                    isFirstLaunch: false
                };
                
                await AsyncStorage.setItem('userData', JSON.stringify(userDataObject));
                console.log('Données utilisateur stockées en JSON après connexion biométrique:', userDataObject);

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
          // Stocker les données utilisateur individuellement
          const userData: [string, string][] = [
            ['userToken', data.data.token],
            ['userRole', data.data.user.role],
            ['userId', data.data.user.id.toString()],
            ['userEmail', data.data.user.email],
            ['userName', data.data.user.fullName || ''],
            ['isFirstLaunch', 'false']
          ];
          
          console.log('Stockage des données utilisateur après connexion Google:', userData);
          
          // Stocker chaque élément individuellement
          for (const [key, value] of userData) {
            await AsyncStorage.setItem(key, value);
            console.log(`Stockage de ${key}:`, value);
          }

          // Stocker également les données dans un objet JSON
          const userDataObject = {
            token: data.data.token,
            role: data.data.user.role,
            id: data.data.user.id.toString(),
            email: data.data.user.email,
            fullName: data.data.user.fullName || '',
            isFirstLaunch: false
          };
          
          await AsyncStorage.setItem('userData', JSON.stringify(userDataObject));
          console.log('Données utilisateur stockées en JSON après connexion Google:', userDataObject);

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
