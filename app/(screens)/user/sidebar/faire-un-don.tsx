import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function FaireUnDonScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Faire un don</Text>
      <Text style={styles.subtitle}>Cette page est en cours de développement</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
}); 