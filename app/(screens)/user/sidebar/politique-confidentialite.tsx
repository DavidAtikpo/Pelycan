import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PolitiqueConfidentialiteScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={32} color="#D81B60" />
          <Text style={styles.title}>Politique de confidentialité</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.text}>
            Pelycan s'engage à protéger votre vie privée et vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Collecte des données</Text>
          <Text style={styles.text}>
            Nous collectons uniquement les informations nécessaires pour fournir nos services : nom, prénom, email, numéro de téléphone et données biométriques pour l'authentification.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Utilisation des données</Text>
          <Text style={styles.text}>
            Vos données sont utilisées pour :
            {'\n'}- Authentifier votre identité
            {'\n'}- Fournir les services d'assistance
            {'\n'}- Améliorer notre application
            {'\n'}- Communiquer avec vous de manière sécurisée
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Protection des données</Text>
          <Text style={styles.text}>
            Nous utilisons des protocoles de chiffrement avancés pour protéger vos données. Toutes les communications sont sécurisées et les données sensibles sont stockées de manière cryptée.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Partage des données</Text>
          <Text style={styles.text}>
            Vos données ne sont jamais partagées avec des tiers sans votre consentement explicite, sauf dans les cas prévus par la loi ou en cas d'urgence vitale.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Vos droits</Text>
          <Text style={styles.text}>
            Conformément au RGPD, vous avez le droit de :
            {'\n'}- Accéder à vos données
            {'\n'}- Les rectifier
            {'\n'}- Les supprimer
            {'\n'}- Limiter leur traitement
            {'\n'}- Vous opposer à leur traitement
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Conservation des données</Text>
          <Text style={styles.text}>
            Vos données sont conservées aussi longtemps que nécessaire pour fournir nos services. Vous pouvez demander leur suppression à tout moment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Contact</Text>
          <Text style={styles.text}>
            Pour toute question concernant la protection de vos données, contactez notre DPO à l'adresse : dpo@pelycan.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
    marginLeft: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default PolitiqueConfidentialiteScreen; 