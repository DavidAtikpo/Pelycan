import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { API_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface AlertData {
  id: string;
  userId: string;
  userName: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: string;
  status: 'active' | 'processed' | 'closed';
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  const [message, setMessage] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Rafraîchir toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedAlert || !message.trim()) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/alerts/${selectedAlert.id}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        Alert.alert('Succès', 'Message envoyé avec succès');
        setMessage('');
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const handleProcessAlert = async (alertId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/alerts/${alertId}/process`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAlerts(); // Rafraîchir la liste
      }
    } catch (error) {
      console.error('Erreur lors du traitement de l\'alerte:', error);
    }
  };

  const renderAlertItem = ({ item }: { item: AlertData }) => (
    <TouchableOpacity 
      style={[styles.alertItem, { backgroundColor: item.status === 'active' ? '#FFE0E0' : '#FFF' }]}
      onPress={() => {
        setSelectedAlert(item);
        setIsModalVisible(true);
      }}
    >
      <Text style={styles.alertTitle}>Alerte de {item.userName}</Text>
      <Text style={styles.alertTime}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      <Text style={styles.alertStatus}>
        Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>

          {selectedAlert && (
            <>
              <Text style={styles.modalTitle}>
                Alerte de {selectedAlert.userName}
              </Text>

              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: selectedAlert.location.latitude,
                  longitude: selectedAlert.location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: selectedAlert.location.latitude,
                    longitude: selectedAlert.location.longitude,
                  }}
                  title={`Position de ${selectedAlert.userName}`}
                />
              </MapView>

              <View style={styles.messageContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Envoyer un message à la victime..."
                  value={message}
                  onChangeText={setMessage}
                  multiline
                />
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                >
                  <Text style={styles.sendButtonText}>Envoyer</Text>
                </TouchableOpacity>
              </View>

              {selectedAlert.status === 'active' && (
                <TouchableOpacity 
                  style={styles.processButton}
                  onPress={() => handleProcessAlert(selectedAlert.id)}
                >
                  <Text style={styles.processButtonText}>
                    Marquer comme traité
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    flex: 1,
  },
  alertItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  alertStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  map: {
    height: 300,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  messageContainer: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  processButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    margin: 20,
    alignItems: 'center',
  },
  processButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
}); 