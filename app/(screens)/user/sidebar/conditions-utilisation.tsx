import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConditionsUtilisationScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="document-text-outline" size={32} color="#D81B60" />
          <Text style={styles.title}>Conditions d'utilisation</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptation des conditions</Text>
          <Text style={styles.text}>
            En utilisant l'application Pelycan, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description du service</Text>
          <Text style={styles.text}>
            Pelycan est une application mobile dédiée à l'assistance et au soutien des victimes de violence. Elle propose des services d'urgence, de messagerie sécurisée et de mise en relation avec des professionnels.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Utilisation du service</Text>
          <Text style={styles.text}>
            L'application est destinée à un usage personnel et non commercial. Vous vous engagez à ne pas utiliser le service à des fins illégales ou inappropriées.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Confidentialité et sécurité</Text>
          <Text style={styles.text}>
            Nous accordons une importance particulière à la protection de vos données personnelles. Toutes les communications sont chiffrées et les informations sensibles sont protégées conformément à notre politique de confidentialité.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Responsabilités</Text>
          <Text style={styles.text}>
            Pelycan s'efforce de fournir un service fiable et sécurisé, mais ne peut garantir une disponibilité continue ou une absence d'erreurs. En cas d'urgence, contactez directement les services d'urgence appropriés.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Modifications des conditions</Text>
          <Text style={styles.text}>
            Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication dans l'application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Contact</Text>
          <Text style={styles.text}>
            Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à l'adresse suivante : support@pelycan.com
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

export default ConditionsUtilisationScreen; 