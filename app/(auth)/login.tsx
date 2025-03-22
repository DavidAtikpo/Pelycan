import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { useRouter, Link } from 'expo-router';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

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
      
      // Logs pour débugger
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (response.ok && data.data?.token) {
        // Stocker les informations d'authentification
        await AsyncStorage.multiSet([
          ['userToken', data.data.token],
          ['userRole', data.data.user.role],
          ['userId', data.data.user.id.toString()],
          ['userEmail', data.data.user.email],
          ['userName', data.data.user.name || ''],
          ['isFirstLaunch', 'false']
        ]);
        
        // Redirection selon le rôle
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
    const rnBiometrics = new ReactNativeBiometrics();
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();

    if (available && (biometryType === BiometryTypes.TouchID || biometryType === BiometryTypes.FaceID)) {
      try {
        const { publicKey } = await rnBiometrics.createKeys();
        
        const response = await fetch(`${API_URL}/auth/biometric-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ biometricData: publicKey }),
        });

        const data = await response.json();

        if (response.ok) {
          await AsyncStorage.setItem('userToken', data.data.token);
          await AsyncStorage.setItem('userRole', data.data.user.role);

          if (data.data.user.role === 'admin') {
            router.replace('/(admin)/DashboardScreen');
          } else if (data.data.user.role === 'pro') {
            router.replace('/(pro)/DashboardScreen');
          } else {
            router.replace('/(app)/HomeScreen');
          }
        } else {
          Alert.alert('Erreur', 'Authentification biométrique échouée');
        }
      } catch (error) {
        Alert.alert('Erreur', 'Erreur lors de l\'authentification biométrique');
      }
    } else {
      Alert.alert('Non disponible', 'L\'authentification biométrique n\'est pas disponible');
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
          await AsyncStorage.setItem('userToken', data.data.token);
          await AsyncStorage.setItem('userRole', data.data.user.role);

          if (data.data.user.role === 'admin') {
            router.replace('/(admin)/DashboardScreen');
          } else if (data.data.user.role === 'pro') {
            router.replace('/(pro)/DashboardScreen');
          } else {
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
      <View style={styles.container}>
        <Image source={require('../../assets/images/Logopelycan.jpg')} style={styles.logo} />
        <Text style={styles.title}>Se connecter</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Connexion...' : 'Entrez'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleBiometricLogin}>
          <Text style={styles.buttonText}>Se connecter avec l'empreinte digitale</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
          <Text style={styles.buttonText}>Se connecter avec Google</Text>
        </TouchableOpacity>
        <Link href="/(auth)/register" style={styles.link}>
          Pas de compte? S'inscrire
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
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    width: '80%',
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#F08080',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  link: {
    color: '#11c0c3',
    marginTop: 20,
  },
});

export default LoginScreen;
