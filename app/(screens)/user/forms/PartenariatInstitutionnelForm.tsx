import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PartenariatInstitutionnelForm = () => {
  const [formData, setFormData] = useState({
    nomInstitution: '',
    typeInstitution: '',
    siret: '',
    adresse: '',
    codePostal: '',
    ville: '',
    email: '',
    telephone: '',
    contactNom: '',
    contactPrenom: '',
    contactFonction: '',
    typePartenariat: '',
    description: '',
    capaciteAccueil: '',
    disponibilite: '',
    conditions: ''
  });

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté pour proposer un partenariat');
        return;
      }

      const response = await fetch(`${API_URL}/partenariats/institutionnels/proposer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Succès', 'Votre proposition de partenariat a été envoyée avec succès');
        // Réinitialiser le formulaire
        setFormData({
          nomInstitution: '',
          typeInstitution: '',
          siret: '',
          adresse: '',
          codePostal: '',
          ville: '',
          email: '',
          telephone: '',
          contactNom: '',
          contactPrenom: '',
          contactFonction: '',
          typePartenariat: '',
          description: '',
          capaciteAccueil: '',
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
      <Text style={styles.title}>Proposer un partenariat institutionnel</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nom de l'institution</Text>
        <TextInput
          style={styles.input}
          value={formData.nomInstitution}
          onChangeText={(text) => setFormData({...formData, nomInstitution: text})}
          placeholder="Nom de votre institution"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Type d'institution</Text>
        <TextInput
          style={styles.input}
          value={formData.typeInstitution}
          onChangeText={(text) => setFormData({...formData, typeInstitution: text})}
          placeholder="Ex: Association, Entreprise, Collectivité"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Numéro SIRET</Text>
        <TextInput
          style={styles.input}
          value={formData.siret}
          onChangeText={(text) => setFormData({...formData, siret: text})}
          placeholder="14 chiffres"
          keyboardType="numeric"
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
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          placeholder="email@institution.com"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Téléphone</Text>
        <TextInput
          style={styles.input}
          value={formData.telephone}
          onChangeText={(text) => setFormData({...formData, telephone: text})}
          placeholder="01 23 45 67 89"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nom du contact</Text>
        <TextInput
          style={styles.input}
          value={formData.contactNom}
          onChangeText={(text) => setFormData({...formData, contactNom: text})}
          placeholder="Nom du contact principal"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Prénom du contact</Text>
        <TextInput
          style={styles.input}
          value={formData.contactPrenom}
          onChangeText={(text) => setFormData({...formData, contactPrenom: text})}
          placeholder="Prénom du contact principal"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fonction du contact</Text>
        <TextInput
          style={styles.input}
          value={formData.contactFonction}
          onChangeText={(text) => setFormData({...formData, contactFonction: text})}
          placeholder="Fonction du contact principal"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Type de partenariat proposé</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.typePartenariat}
          onChangeText={(text) => setFormData({...formData, typePartenariat: text})}
          placeholder="Décrivez le type de partenariat..."
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description du partenariat</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          placeholder="Décrivez en détail le partenariat proposé..."
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Capacité d'accueil</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.capaciteAccueil}
          onChangeText={(text) => setFormData({...formData, capaciteAccueil: text})}
          placeholder="Décrivez votre capacité d'accueil..."
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Disponibilités</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.disponibilite}
          onChangeText={(text) => setFormData({...formData, disponibilite: text})}
          placeholder="Décrivez vos disponibilités..."
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
          placeholder="Conditions particulières du partenariat..."
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

export default PartenariatInstitutionnelForm; 