import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CompetencesProForm = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    profession: '',
    entreprise: '',
    domaine: '',
    competences: '',
    disponibilite: '',
    description: ''
  });

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté pour proposer vos compétences');
        return;
      }

      const response = await fetch(`${API_URL}/professionnels/competences/proposer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Succès', 'Votre proposition a été envoyée avec succès');
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          profession: '',
          entreprise: '',
          domaine: '',
          competences: '',
          disponibilite: '',
          description: ''
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
      <Text style={styles.title}>Proposer vos compétences pro bono</Text>
      
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
        <Text style={styles.label}>Profession</Text>
        <TextInput
          style={styles.input}
          value={formData.profession}
          onChangeText={(text) => setFormData({...formData, profession: text})}
          placeholder="Ex: Avocat, Comptable, Consultant"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Entreprise</Text>
        <TextInput
          style={styles.input}
          value={formData.entreprise}
          onChangeText={(text) => setFormData({...formData, entreprise: text})}
          placeholder="Nom de votre entreprise (optionnel)"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Domaine d'expertise</Text>
        <TextInput
          style={styles.input}
          value={formData.domaine}
          onChangeText={(text) => setFormData({...formData, domaine: text})}
          placeholder="Ex: Droit du travail, Comptabilité, Marketing"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Compétences spécifiques</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.competences}
          onChangeText={(text) => setFormData({...formData, competences: text})}
          placeholder="Décrivez vos compétences..."
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Disponibilités</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.disponibilite}
          onChangeText={(text) => setFormData({...formData, disponibilite: text})}
          placeholder="Ex: 2h par semaine, Soirées..."
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description complémentaire</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          placeholder="Informations supplémentaires..."
          multiline
          numberOfLines={4}
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

export default CompetencesProForm; 