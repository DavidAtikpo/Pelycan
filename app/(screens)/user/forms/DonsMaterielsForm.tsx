import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DonsMaterielsForm = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: '',
    typeDon: '',
    description: '',
    quantite: '',
    etat: '',
    disponibilite: '',
    conditions: ''
  });

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté pour proposer un don');
        return;
      }

      const response = await fetch(`${API_URL}/dons/materiels/proposer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Succès', 'Votre proposition de don a été envoyée avec succès');
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          adresse: '',
          codePostal: '',
          ville: '',
          typeDon: '',
          description: '',
          quantite: '',
          etat: '',
          disponibilite: '',
          conditions: ''
        });
      } else {
        throw new Error(data.message || 'Erreur lors de l\'envoi de la proposition');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer la proposition. Veuillez réessayer.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Proposer un don matériel</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={styles.input}
          value={formData.nom}
          onChangeText={(text) => setFormData({...formData, nom: text})}
          placeholder="Votre nom"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={styles.input}
          value={formData.prenom}
          onChangeText={(text) => setFormData({...formData, prenom: text})}
          placeholder="Votre prénom"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          placeholder="votre@email.com"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Téléphone</Text>
        <TextInput
          style={styles.input}
          value={formData.telephone}
          onChangeText={(text) => setFormData({...formData, telephone: text})}
          placeholder="06 12 34 56 78"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Adresse</Text>
        <TextInput
          style={styles.input}
          value={formData.adresse}
          onChangeText={(text) => setFormData({...formData, adresse: text})}
          placeholder="Adresse complète"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Code postal</Text>
        <TextInput
          style={styles.input}
          value={formData.codePostal}
          onChangeText={(text) => setFormData({...formData, codePostal: text})}
          placeholder="Code postal"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ville</Text>
        <TextInput
          style={styles.input}
          value={formData.ville}
          onChangeText={(text) => setFormData({...formData, ville: text})}
          placeholder="Ville"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Type de don</Text>
        <TextInput
          style={styles.input}
          value={formData.typeDon}
          onChangeText={(text) => setFormData({...formData, typeDon: text})}
          placeholder="Ex: Mobilier, Vêtements, Électroménager"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description détaillée</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          placeholder="Décrivez en détail les objets donnés..."
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Quantité</Text>
        <TextInput
          style={styles.input}
          value={formData.quantite}
          onChangeText={(text) => setFormData({...formData, quantite: text})}
          placeholder="Ex: 2 chaises, 1 table, 3 t-shirts"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>État</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.etat}
          onChangeText={(text) => setFormData({...formData, etat: text})}
          placeholder="Décrivez l'état des objets..."
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Disponibilité</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.disponibilite}
          onChangeText={(text) => setFormData({...formData, disponibilite: text})}
          placeholder="Quand pouvez-vous rendre les objets disponibles ?"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Conditions particulières</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.conditions}
          onChangeText={(text) => setFormData({...formData, conditions: text})}
          placeholder="Conditions particulières pour la récupération..."
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Envoyer la proposition</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#D81B60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DonsMaterielsForm; 