import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AProposScreen = () => {
  const handleContactPress = () => {
    Linking.openURL('mailto:support@pelycan.com');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://www.pelycan.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="information-circle-outline" size={32} color="#D81B60" />
          <Text style={styles.title}>À propos de Pelycan</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notre mission</Text>
          <Text style={styles.text}>
            Pelycan est une application dédiée à la protection et au soutien des victimes de violence. Notre mission est de fournir un outil sécurisé et accessible pour faciliter l'accès à l'aide et aux ressources nécessaires.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fonctionnalités principales</Text>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#D81B60" />
            <Text style={styles.featureText}>Messagerie sécurisée avec les professionnels</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="videocam-outline" size={24} color="#D81B60" />
            <Text style={styles.featureText}>Appels vidéo sécurisés</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="finger-print-outline" size={24} color="#D81B60" />
            <Text style={styles.featureText}>Authentification biométrique</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="alert-circle-outline" size={24} color="#D81B60" />
            <Text style={styles.featureText}>Bouton d'urgence</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Version</Text>
          <Text style={styles.text}>Version actuelle : 1.0.0</Text>
          <Text style={styles.text}>Dernière mise à jour : 14/04/2025</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
            <Ionicons name="mail-outline" size={24} color="#D81B60" />
            <Text style={styles.contactText}>support@pelycan.com</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleWebsitePress}>
            <Ionicons name="globe-outline" size={24} color="#D81B60" />
            <Text style={styles.contactText}>www.pelycan.com</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mentions légales</Text>
          <Text style={styles.text}>
            © 2025 Pelycan. Tous droits réservés.
            {'\n\n'}
            Cette application est protégée par les lois sur la propriété intellectuelle.
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
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  contactText: {
    fontSize: 16,
    color: '#D81B60',
    marginLeft: 10,
  },
});

export default AProposScreen; 