import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AjouterLogementScreen from '../FormulairedemandeAjouterLogementScreen';
import SoutienPsychologiqueForm from '../forms/SoutienPsychologiqueForm';
import CompetencesProForm from '../forms/CompetencesProForm';
import PartenariatInstitutionnelForm from '../forms/PartenariatInstitutionnelForm';
import DonsMaterielsForm from '../forms/DonsMaterielsForm';
// import LogementForm from '../(screens)/user/forms/LogementForm';
// import AjouterLogementFormScreen from '../(screens)/AjouterLogementFormScreen';

const DevenirPartenaireScreen = () => {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  const renderForm = () => {
    switch (selectedForm) {
      case 'logement':
        return <AjouterLogementScreen />;
      case 'soutien':
        return <SoutienPsychologiqueForm />;
      case 'competences':
        return <CompetencesProForm />;
      case 'partenariat':
        return <PartenariatInstitutionnelForm />;
      case 'dons':
        return <DonsMaterielsForm />;
      default:
        return null;
    }
  };

  const handleOptionPress = (option: string) => {
    setSelectedForm(option);
  };

  const handleBack = () => {
    setSelectedForm(null);
  };

  if (selectedForm) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#D81B60" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        {renderForm()}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="heart" size={40} color="#D81B60" />
        <Text style={styles.title}>Ensemble contre les féminicides</Text>
        <Text style={styles.subtitle}>Votre aide change des vies</Text>
      </View>

      <Text style={styles.intro}>
        Nous avons besoin de votre soutien pour aider les femmes victimes de violences. 
        Chaque contribution, qu'elle soit matérielle ou immatérielle, fait la différence.
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.optionCard} 
          onPress={() => handleOptionPress('logement')}
        >
          <Ionicons name="home" size={32} color="#D81B60" />
          <Text style={styles.optionTitle}>Hébergement</Text>
          <Text style={styles.optionDescription}>
            Proposez un logement pour aider une femme à se reconstruire
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionCard} 
          onPress={() => handleOptionPress('soutien')}
        >
          <Ionicons name="medical" size={32} color="#D81B60" />
          <Text style={styles.optionTitle}>Soutien psychologique</Text>
          <Text style={styles.optionDescription}>
            Offrez un accompagnement psychologique aux victimes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionCard} 
          onPress={() => handleOptionPress('competences')}
        >
          <Ionicons name="briefcase" size={32} color="#D81B60" />
          <Text style={styles.optionTitle}>Compétences pro bono</Text>
          <Text style={styles.optionDescription}>
            Mettez vos compétences professionnelles au service des victimes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionCard} 
          onPress={() => handleOptionPress('partenariat')}
        >
          <Ionicons name="business" size={32} color="#D81B60" />
          <Text style={styles.optionTitle}>Partenariat institutionnel</Text>
          <Text style={styles.optionDescription}>
            Collaborez avec nous en tant qu'institution ou entreprise
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionCard} 
          onPress={() => handleOptionPress('dons')}
        >
          <Ionicons name="gift" size={32} color="#D81B60" />
          <Text style={styles.optionTitle}>Dons matériels</Text>
          <Text style={styles.optionDescription}>
            Donnez des biens matériels pour aider les victimes
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  intro: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    padding: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    padding: 15,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    marginTop: 10,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    lineHeight: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButtonText: {
    fontSize: 16,
    color: '#D81B60',
    marginLeft: 10,
  },
});

export default DevenirPartenaireScreen; 