import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, LatLng, Camera } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { API_URL } from '../../config/api';
import { useRouter } from 'expo-router';

interface EmergencyDetails {
  id: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  latitude: string;
  longitude: string;
  user: {
    fullName: string;
    phoneNumber: string;
  };
}

// Fonction pour calculer la distance entre deux points en km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const EmergencyDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [details, setDetails] = useState<EmergencyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const mapRef = useRef<MapView>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const router = useRouter();

  // Effet pour mettre à jour la distance quand les détails ou la position changent
  useEffect(() => {
    if (details && userLocation) {
      const emergencyPos = getLocation(details);
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        emergencyPos.latitude,
        emergencyPos.longitude
      );
      setDistance(dist);
    }
  }, [details, userLocation]);

  // Effet pour charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEmergencyDetails(),
        getCurrentLocation()
      ]);
      setLoading(false);
    };
    
    loadInitialData();
  }, [id]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'L\'accès à la localisation est nécessaire pour calculer la distance.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const userPos = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      setUserLocation(userPos);
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      Alert.alert('Erreur', 'Impossible d\'obtenir votre position actuelle');
    }
  };

  // Ajout d'une fonction pour rafraîchir la position et la distance
  const refreshLocationAndDistance = async () => {
    await getCurrentLocation();
  };

  const fetchEmergencyDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/admin/emergency/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails');
      }

      const data = await response.json();
      console.log('Données reçues:', JSON.stringify(data, null, 2));
      
      if (!data || !data.success) {
        throw new Error('Format de données invalide');
      }

      const emergencyDetails = data.data;
      
      if (!emergencyDetails.type || !emergencyDetails.status || !emergencyDetails.createdAt) {
        throw new Error('Données d\'urgence incomplètes');
      }

      setDetails(emergencyDetails);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'urgence');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: EmergencyDetails['status']) => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/admin/emergency/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      await fetchEmergencyDetails();
      Alert.alert('Succès', 'Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    } finally {
      setUpdating(false);
    }
  };

  const getLocation = (details: EmergencyDetails) => ({
    latitude: parseFloat(details.latitude),
    longitude: parseFloat(details.longitude)
  });

  const handleBack = () => {
    // Stocker temporairement l'information que nous revenons au dashboard
    AsyncStorage.setItem('returningToDashboard', 'true').then(() => {
      router.replace('/(admin)/DashboardScreen');
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Détails non disponibles</Text>
      </View>
    );
  }

  const location = getLocation(details);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de l'urgence</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Ionicons 
            name={
              details.type === 'POLICE' ? 'shield' :
              details.type === 'MEDICAL' ? 'medical' :
              details.type === 'FIRE' ? 'flame' : 'alert-circle'
            } 
            size={24} 
            color="#f44336" 
          />
          <Text style={styles.infoText}>Type: {details.type}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time" size={24} color="#666" />
          <Text style={styles.infoText}>
            Créée le: {new Date(details.createdAt).toLocaleString()}
          </Text>
        </View>

        {details.user?.fullName && (
          <View style={styles.infoRow}>
            <Ionicons name="person" size={24} color="#666" />
            <Text style={styles.infoText}>
              Demandeur: {details.user.fullName}
            </Text>
          </View>
        )}

        {details.user?.phoneNumber && (
          <View style={styles.infoRow}>
            <Ionicons name="call" size={24} color="#666" />
            <Text style={styles.infoText}>
              Téléphone: {details.user.phoneNumber}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="location" size={24} color="#666" />
          <Text style={styles.infoText}>
            Localisation de l'urgence: {'\n'}
            Latitude: {location.latitude.toFixed(6)}{'\n'}
            Longitude: {location.longitude.toFixed(6)}
          </Text>
        </View>

        {distance !== null && (
          <View style={styles.infoRow}>
            <TouchableOpacity 
              style={styles.refreshLocationButton} 
              onPress={refreshLocationAndDistance}
            >
              <Ionicons name="navigate" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.infoText}>
              Distance: {distance.toFixed(2)} km
            </Text>
          </View>
        )}

        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            mapType={mapType}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            rotateEnabled={true}
            scrollEnabled={true}
            zoomEnabled={true}
            zoomControlEnabled={true}
            minZoomLevel={5}
            maxZoomLevel={20}
          >
            <Marker
              coordinate={location}
              title={`Urgence ${details.type}`}
              description="Position de l'urgence"
              pinColor="red"
            />
            {userLocation && (
              <>
                <Marker
                  coordinate={userLocation}
                  title="Votre position"
                  description="Position actuelle"
                  pinColor="blue"
                />
                <Polyline
                  coordinates={[location, userLocation]}
                  strokeColor="#2196F3"
                  strokeWidth={2}
                  lineDashPattern={[5, 5]}
                />
              </>
            )}
          </MapView>

          <View style={styles.mapControls}>
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
            >
              <Ionicons 
                name={mapType === 'standard' ? 'map' : 'earth'} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={() => {
                if (mapRef.current) {
                  mapRef.current.animateToRegion({
                    ...location,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }, 1000);
                }
              }}
            >
              <Ionicons name="locate" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={async () => {
                if (mapRef.current) {
                  const camera = await mapRef.current.getCamera();
                  mapRef.current.animateCamera({
                    ...camera,
                    zoom: Math.min(20, (camera.zoom || 15) + 1)
                  });
                }
              }}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={async () => {
                if (mapRef.current) {
                  const camera = await mapRef.current.getCamera();
                  mapRef.current.animateCamera({
                    ...camera,
                    zoom: Math.max(5, (camera.zoom || 15) - 1)
                  });
                }
              }}
            >
              <Ionicons name="remove" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mapLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: 'red' }]} />
            <Text style={styles.legendText}>Position de l'urgence</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: 'blue' }]} />
            <Text style={styles.legendText}>Votre position</Text>
          </View>
          {distance !== null && (
            <View style={styles.legendItem}>
              <View style={[styles.legendLine]} />
              <Text style={styles.legendText}>Distance: {distance.toFixed(2)} km</Text>
            </View>
          )}
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.label}>Statut:</Text>
          <Picker
            selectedValue={details.status}
            style={styles.picker}
            onValueChange={(itemValue: EmergencyDetails['status']) => updateStatus(itemValue)}
            enabled={!updating}
          >
            <Picker.Item label="En attente" value="pending" />
            <Picker.Item label="En cours" value="in_progress" />
            <Picker.Item label="Complété" value="completed" />
          </Picker>
          {updating && <ActivityIndicator size="small" color="#2196F3" />}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 10,
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  refreshButton: {
    padding: 10,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  mapContainer: {
    height: 300,
    marginTop: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapLegend: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  mapControls: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'transparent',
  },
  mapControlButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  legendLine: {
    width: 20,
    height: 2,
    backgroundColor: '#2196F3',
    marginRight: 10,
  },
  refreshLocationButton: {
    padding: 5,
  },
});

export default EmergencyDetailsScreen; 