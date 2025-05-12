import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

interface VideoCallParams {
  caseId: string;
  clientId: string;
  clientName: string;
}

const VideoCallScreen = () => {
  const router = useRouter();
  const { caseId, clientId, clientName } = useLocalSearchParams<Record<string, string>>();
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [callUrl, setCallUrl] = useState('');

  useEffect(() => {
    initializeCall();
    const timer = setInterval(() => {
      if (callStatus === 'connected') {
        setCallDuration(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [callStatus]);

  const initializeCall = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/pro/video-call/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId: caseId,
          clientId: clientId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'initialisation de l\'appel');
      }

      const data = await response.json();
      setCallUrl(data.callUrl);
      setCallStatus('connected');
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible d\'initialiser l\'appel vidéo');
      router.back();
    }
  };

  const endCall = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await fetch(`${API_URL}/pro/video-call/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId: caseId,
          clientId: clientId,
          duration: callDuration,
        }),
      });

      setCallStatus('ended');
      router.back();
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de terminer l\'appel correctement');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.clientName}>{clientName}</Text>
        <Text style={styles.duration}>{formatDuration(callDuration)}</Text>
      </View>

      <View style={styles.videoContainer}>
        {callUrl ? (
          <WebView
            source={{ uri: callUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Connexion en cours...</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={endCall}
        >
          <Ionicons name="call" size={24} color="#fff" />
          <Text style={styles.controlButtonText}>Terminer l'appel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  duration: {
    fontSize: 16,
    color: '#fff',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  controls: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    gap: 8,
  },
  endCallButton: {
    backgroundColor: '#f44336',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VideoCallScreen; 